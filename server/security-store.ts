import bcrypt from 'bcryptjs';
import { mkdir, readFile, writeFile } from 'fs/promises';
import crypto from 'crypto';
import path from 'path';

export type SecurityLogEntry = {
  id: string;
  timestamp: string;
  action: string;
  details: string;
};

export type AuthStatus = {
  authenticated: boolean;
  failedAttempts: number;
  lockUntil: number;
  remainingLockMs: number;
};

export type LoginResult =
  | {
      authenticated: true;
      locked: false;
      failedAttempts: number;
      lockUntil: number;
      remainingLockMs: number;
      sessionId: string;
      expiresAt: number;
      message: string;
    }
  | {
      authenticated: false;
      locked: boolean;
      failedAttempts: number;
      lockUntil: number;
      remainingLockMs: number;
      message: string;
    };

type UserSecurityState = {
  username: string;
  passwordHash: string;
  failedAttempts: number;
  lockUntil: number;
  updatedAt: number;
};

type PersistedSecurityState = {
  users: Record<string, UserSecurityState>;
};

type SessionRecord = {
  sessionId: string;
  username: string;
  expiresAt: number;
};

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const USERS_STATE_FILE = path.join(DATA_DIR, 'users-state.json');
const LOG_FILE = path.join(DATA_DIR, 'security-logs.json');
const SESSION_COOKIE_NAME = 'nexos_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PASSWORD_COST = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000;

const createDefaultState = async (): Promise<PersistedSecurityState> => {
  const defaultPassword = process.env.NEXOS_INITIAL_PASSWORD;
  if (!defaultPassword) {
    throw new Error('NEXOS_INITIAL_PASSWORD is required for first-time security initialization');
  }
  const defaultUsername = 'admin';
  return {
    users: {
      [defaultUsername]: {
        username: defaultUsername,
        passwordHash: await bcrypt.hash(defaultPassword, PASSWORD_COST),
        failedAttempts: 0,
        lockUntil: 0,
        updatedAt: Date.now(),
      },
    },
  };
};

const ensureDataDir = async () => {
  await mkdir(DATA_DIR, { recursive: true });
};

const readJson = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const writeJson = async <T>(filePath: string, value: T) => {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};

export class SecurityStore {
  private state: PersistedSecurityState | null = null;
  private sessions = new Map<string, SessionRecord>();
  private logs: SecurityLogEntry[] = [];

  async initialize() {
    await ensureDataDir();

    const existingState = await readJson<PersistedSecurityState | null>(USERS_STATE_FILE, null);
    if (existingState && Object.keys(existingState.users ?? {}).length > 0) {
      this.state = existingState;
    } else {
      this.state = await createDefaultState();
      await this.persistState();
    }
    this.logs = await readJson<SecurityLogEntry[]>(LOG_FILE, []);

    await this.persistLogs();
  }

  private async persistState() {
    if (!this.state) return;
    await writeJson(USERS_STATE_FILE, this.state);
  }

  private async persistLogs() {
    await writeJson(LOG_FILE, this.logs.slice(-200));
  }

  private ensureState() {
    if (!this.state) {
      throw new Error('Security store not initialized');
    }
    return this.state;
  }

  private pruneExpiredSessions(now = Date.now()) {
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }

  async appendLog(action: string, details: string) {
    const entry: SecurityLogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      details,
    };

    this.logs.push(entry);
    await this.persistLogs();
    return entry;
  }

  getLogs() {
    return this.logs.slice(-200);
  }

  getStatus(sessionId?: string): AuthStatus {
    const state = this.ensureState();
    this.pruneExpiredSessions();
    const now = Date.now();
    const session = sessionId ? this.sessions.get(sessionId) : undefined;
    const authenticated = Boolean(session && session.expiresAt > now);
    
    if (authenticated && session) {
      const userState = state.users[session.username];
      const remainingLockMs = userState && userState.lockUntil > now ? userState.lockUntil - now : 0;
      return {
        authenticated,
        failedAttempts: userState?.failedAttempts || 0,
        lockUntil: userState?.lockUntil || 0,
        remainingLockMs,
      };
    }

    return {
      authenticated: false,
      failedAttempts: 0,
      lockUntil: 0,
      remainingLockMs: 0,
    };
  }

  isAuthenticated(sessionId?: string) {
    const now = Date.now();
    if (!sessionId) return false;
    this.pruneExpiredSessions(now);
    const session = this.sessions.get(sessionId);
    return Boolean(session && session.expiresAt > now);
  }

  getUsername(sessionId?: string): string | null {
    const now = Date.now();
    if (!sessionId) return null;
    this.pruneExpiredSessions(now);
    const session = this.sessions.get(sessionId);
    if (session && session.expiresAt > now) {
      return session.username;
    }
    return null;
  }

  async login(username: string, password: string): Promise<LoginResult> {
    const state = this.ensureState();
    const now = Date.now();
    this.pruneExpiredSessions(now);

    const userState = state.users[username];
    if (!userState) {
      await this.appendLog('FAILED_LOGIN', `Login attempt for non-existent user: ${username}`);
      return {
        authenticated: false,
        locked: false,
        failedAttempts: 0,
        lockUntil: 0,
        remainingLockMs: 0,
        message: 'Invalid username or password',
      };
    }

    if (userState.lockUntil > now) {
      const result: LoginResult = {
        authenticated: false,
        locked: true,
        failedAttempts: userState.failedAttempts,
        lockUntil: userState.lockUntil,
        remainingLockMs: userState.lockUntil - now,
        message: 'Login temporarily locked due to too many attempts.',
      };
      await this.appendLog('LOCKOUT_ACTIVE', `Login blocked for user ${username} because lockout is active`);
      return result;
    }

    const valid = await bcrypt.compare(password, userState.passwordHash);
    if (valid) {
      const sessionId = crypto.randomUUID();
      this.sessions.set(sessionId, { sessionId, username, expiresAt: now + SESSION_TTL_MS });
      
      this.state = {
        users: {
          ...state.users,
          [username]: {
            ...userState,
            failedAttempts: 0,
            lockUntil: 0,
            updatedAt: now,
          },
        },
      };
      
      await this.persistState();
      await this.appendLog('LOGIN', `Successful login for user ${username}`);

      return {
        authenticated: true,
        locked: false,
        failedAttempts: 0,
        lockUntil: 0,
        remainingLockMs: 0,
        sessionId,
        expiresAt: now + SESSION_TTL_MS,
        message: 'Login successful',
      };
    }

    const failedAttempts = userState.failedAttempts + 1;
    const locked = failedAttempts >= MAX_FAILED_ATTEMPTS;
    this.state = {
      users: {
        ...state.users,
        [username]: {
          ...userState,
          failedAttempts: locked ? MAX_FAILED_ATTEMPTS : failedAttempts,
          lockUntil: locked ? now + LOCKOUT_DURATION_MS : userState.lockUntil,
          updatedAt: now,
        },
      },
    };
    
    await this.persistState();
    await this.appendLog(locked ? 'LOCKOUT' : 'FAILED_LOGIN', locked ? `Too many failed attempts for user ${username}. Login temporarily locked.` : `Failed login attempt #${failedAttempts} for user ${username}`);

    return {
      authenticated: false,
      locked,
      failedAttempts: this.state.users[username].failedAttempts,
      lockUntil: this.state.users[username].lockUntil,
      remainingLockMs: this.state.users[username].lockUntil > now ? this.state.users[username].lockUntil - now : 0,
      message: locked ? 'Too many failed attempts. Login temporarily locked.' : 'Incorrect password',
    };
  }

  logout(sessionId?: string) {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
    return this.appendLog('LOCK', 'System locked');
  }

  async changePassword(username: string, newPassword: string) {
    const state = this.ensureState();
    const userState = state.users[username];
    
    if (!userState) {
      throw new Error(`User ${username} not found`);
    }

    const now = Date.now();
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_COST);
    this.state = {
      users: {
        ...state.users,
        [username]: {
          ...userState,
          passwordHash,
          failedAttempts: 0,
          lockUntil: 0,
          updatedAt: now,
        },
      },
    };
    
    await this.persistState();
    await this.appendLog('PASSWORD_CHANGE', `Password changed for user ${username}`);
    return true;
  }

  async recordAppEvent(action: string, details: string) {
    return this.appendLog(action, details);
  }

  async expireSession(sessionId?: string) {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
  }
}

export const securityCookieName = SESSION_COOKIE_NAME;
export const sessionTtlMs = SESSION_TTL_MS;
export const maxFailedAttempts = MAX_FAILED_ATTEMPTS;
export const lockoutDurationMs = LOCKOUT_DURATION_MS;
