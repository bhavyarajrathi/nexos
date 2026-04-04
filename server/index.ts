import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { SecurityStore, lockoutDurationMs, maxFailedAttempts, securityCookieName, sessionTtlMs } from './security-store.js';
import { UserStore, UserWorkspaceState } from './user-store.js';

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const store = new SecurityStore();
const userStore = new UserStore();

const loginSchema = z.object({
  username: z.string().min(1).max(64),
  password: z.string().min(1),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/),
});

const logSchema = z.object({
  action: z.string().min(1).max(64),
  details: z.string().min(1).max(256),
});

const windowSchema = z.object({
  id: z.string().min(1).max(128),
  appId: z.string().min(1).max(64),
  title: z.string().min(1).max(128),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
  minimized: z.boolean(),
  maximized: z.boolean(),
  zIndex: z.number().int(),
  icon: z.string().max(32),
});

const workspaceSnapshotSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(128),
  createdAt: z.string().datetime(),
  themeId: z.string().min(1).max(64),
  wallpaperId: z.string().min(1).max(64),
  windows: z.array(windowSchema).max(32),
});

const appUsageSnapshotSchema = z.object({
  appId: z.string().min(1).max(64),
  opens: z.number().int().nonnegative().max(1_000_000),
  lastOpenedAt: z.number().int().nonnegative(),
});

const userDataSchema = z.object({
  themeId: z.string().min(1).max(64).optional(),
  wallpaperId: z.string().min(1).max(64).optional(),
  workspaceSnapshots: z.array(workspaceSnapshotSchema).max(12).optional(),
  appUsage: z.record(appUsageSnapshotSchema).optional(),
});

const isProduction = process.env.NODE_ENV === 'production';
const envAllowedOrigins = (process.env.CORS_ORIGINS ?? '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const defaultAllowedOrigins = isProduction
  ? []
  : ['http://localhost:8080', 'http://127.0.0.1:8080'];
const allowedOrigins = new Set([...defaultAllowedOrigins, ...envAllowedOrigins]);

const isTrustedOrigin = (origin?: string) => {
  if (!origin) {
    return !isProduction;
  }
  return allowedOrigins.has(origin);
};

if (isProduction && allowedOrigins.size === 0) {
  throw new Error('CORS_ORIGINS must be configured in production');
}

const authRateLimit = rateLimit({
  windowMs: 60_000,
  limit: isProduction ? 10 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in a minute.' },
});

const getSessionId = (req: express.Request) => req.cookies?.[securityCookieName] as string | undefined;
const requireTrustedOrigin: express.RequestHandler = (req, res, next) => {
  if (!isTrustedOrigin(req.headers.origin)) {
    res.status(403).json({ message: 'Request origin is not allowed' });
    return;
  }
  next();
};

app.use(helmet());
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(cors({
  origin(origin, callback) {
    if (isTrustedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nexos-security-api', uptime: process.uptime() });
});

app.get('/api/auth/status', (req, res) => {
  const status = store.getStatus(getSessionId(req));
  res.json({
    ...status,
    maxFailedAttempts,
    lockoutDurationMs,
    sessionTtlMs,
  });
});

app.post('/api/auth/login', authRateLimit, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Username and password are required' });
    return;
  }

  const result = await store.login(parsed.data.username, parsed.data.password);

  if (result.authenticated) {
    res.cookie(securityCookieName, result.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: sessionTtlMs,
    });
    const userData = await userStore.getUserData(parsed.data.username);
    res.json({
      authenticated: true,
      failedAttempts: result.failedAttempts,
      lockUntil: result.lockUntil,
      remainingLockMs: result.remainingLockMs,
      message: result.message,
      userData,
    });
    return;
  }

  res.status(result.locked ? 429 : 401).json({
    authenticated: false,
    failedAttempts: result.failedAttempts,
    lockUntil: result.lockUntil,
    remainingLockMs: result.remainingLockMs,
    message: result.message,
  });
});

app.post('/api/auth/logout', requireTrustedOrigin, async (req, res) => {
  const sessionId = getSessionId(req);
  await store.logout(sessionId);
  if (sessionId) {
    await store.expireSession(sessionId);
  }

  res.clearCookie(securityCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
  });

  res.json({ ok: true });
});

app.post('/api/auth/password', requireTrustedOrigin, async (req, res) => {
  const sessionId = getSessionId(req);
  const username = store.getUsername(sessionId);
  
  if (!username) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Password must be at least 8 characters and include letters and numbers' });
    return;
  }

  await store.changePassword(username, parsed.data.newPassword);
  res.json({ ok: true, message: 'Password updated' });
});

app.get('/api/security/logs', async (req, res) => {
  const sessionId = getSessionId(req);
  if (!store.isAuthenticated(sessionId)) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  res.json({ logs: store.getLogs() });
});

app.post('/api/security/logs', requireTrustedOrigin, async (req, res) => {
  const sessionId = getSessionId(req);
  if (!store.isAuthenticated(sessionId)) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const parsed = logSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid log payload' });
    return;
  }

  const entry = await store.recordAppEvent(parsed.data.action, parsed.data.details);
  res.json({ ok: true, log: entry });
});

app.get('/api/user/data', async (req, res) => {
  const sessionId = getSessionId(req);
  const username = store.getUsername(sessionId);
  
  if (!username) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const userData = await userStore.getUserData(username);
  res.json(userData);
});

app.post('/api/user/data', requireTrustedOrigin, async (req, res) => {
  const sessionId = getSessionId(req);
  const username = store.getUsername(sessionId);
  
  if (!username) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const parsed = userDataSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid user data payload' });
    return;
  }

  const currentData = await userStore.getUserData(username);
  const updated: UserWorkspaceState = {
    themeId: parsed.data.themeId ?? currentData.themeId,
    wallpaperId: parsed.data.wallpaperId ?? currentData.wallpaperId,
    workspaceSnapshots: parsed.data.workspaceSnapshots ?? currentData.workspaceSnapshots,
    appUsage: parsed.data.appUsage ?? currentData.appUsage,
    updatedAt: Date.now(),
  };

  await userStore.saveUserData(username, updated);
  res.json({ ok: true, userData: updated });
});

const start = async () => {
  await store.initialize();
  await userStore.initialize();
  app.listen(port, () => {
    console.log(`NexOS security API listening on http://localhost:${port}`);
  });
};

void start();
