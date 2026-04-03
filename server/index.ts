import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { SecurityStore, lockoutDurationMs, maxFailedAttempts, securityCookieName, sessionTtlMs } from './security-store.js';

dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') });
dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);
const store = new SecurityStore();

const loginSchema = z.object({
  password: z.string().min(1),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8).regex(/[A-Za-z]/).regex(/\d/),
});

const logSchema = z.object({
  action: z.string().min(1).max(64),
  details: z.string().min(1).max(256),
});

const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = new Set([
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

const authRateLimit = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Try again in a minute.' },
});

const getSessionId = (req: express.Request) => req.cookies?.[securityCookieName] as string | undefined;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
app.use(cookieParser());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin) || isProduction) {
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
    res.status(400).json({ message: 'Password is required' });
    return;
  }

  const result = await store.login(parsed.data.password);

  if (result.authenticated) {
    res.cookie(securityCookieName, result.sessionId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
      path: '/',
      maxAge: sessionTtlMs,
    });
    res.json({
      authenticated: true,
      failedAttempts: result.failedAttempts,
      lockUntil: result.lockUntil,
      remainingLockMs: result.remainingLockMs,
      message: result.message,
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

app.post('/api/auth/logout', async (req, res) => {
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

app.post('/api/auth/password', async (req, res) => {
  const sessionId = getSessionId(req);
  if (!store.isAuthenticated(sessionId)) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const parsed = passwordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Password must be at least 8 characters and include letters and numbers' });
    return;
  }

  await store.changePassword(parsed.data.newPassword);
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

app.post('/api/security/logs', async (req, res) => {
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

const start = async () => {
  await store.initialize();
  app.listen(port, () => {
    console.log(`NexOS security API listening on http://localhost:${port}`);
  });
};

void start();
