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

type PersistedSecurityState = {
  passwordHash: string;
  failedAttempts: number;
  lockUntil: number;
  updatedAt: number;
};

type SessionRecord = {
  sessionId: string;
  expiresAt: number;
};

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const STATE_FILE = path.join(DATA_DIR, 'security-state.json');
const LOG_FILE = path.join(DATA_DIR, 'security-logs.json');
const SESSION_COOKIE_NAME = 'nexos_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const PASSWORD_COST = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000;

const createDefaultState = async (): Promise<PersistedSecurityState> => {
  const defaultPassword = process.env.NEXOS_INITIAL_PASSWORD || 'NexOS-Admin-2026!';
  return {
    passwordHash: await bcrypt.hash(defaultPassword, PASSWORD_COST),
    failedAttempts: 0,
    lockUntil: 0,
    updatedAt: Date.now(),
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

    const fallbackState = await createDefaultState();
    this.state = await readJson<PersistedSecurityState>(STATE_FILE, fallbackState);
    this.logs = await readJson<SecurityLogEntry[]>(LOG_FILE, []);

    await this.persistState();
    await this.persistLogs();
  }

  private async persistState() {
    if (!this.state) return;
    await writeJson(STATE_FILE, this.state);
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
    const remainingLockMs = state.lockUntil > now ? state.lockUntil - now : 0;

    return {
      authenticated,
      failedAttempts: state.failedAttempts,
      lockUntil: state.lockUntil,
      remainingLockMs,
    };
  }

  isAuthenticated(sessionId?: string) {
    const now = Date.now();
    if (!sessionId) return false;
    this.pruneExpiredSessions(now);
    const session = this.sessions.get(sessionId);
    return Boolean(session && session.expiresAt > now);
  }

  async login(password: string): Promise<LoginResult> {
    const state = this.ensureState();
    const now = Date.now();
    this.pruneExpiredSessions(now);

    if (state.lockUntil > now) {
      const result: LoginResult = {
        authenticated: false,
        locked: true,
        failedAttempts: state.failedAttempts,
        lockUntil: state.lockUntil,
        remainingLockMs: state.lockUntil - now,
        message: 'Login temporarily locked due to too many attempts.',
      };
      await this.appendLog('LOCKOUT_ACTIVE', 'Login blocked because lockout is active');
      return result;
    }

    const valid = await bcrypt.compare(password, state.passwordHash);
    if (valid) {
      const sessionId = crypto.randomUUID();
      this.sessions.set(sessionId, { sessionId, expiresAt: now + SESSION_TTL_MS });
      this.state = {
        ...state,
        failedAttempts: 0,
        lockUntil: 0,
        updatedAt: now,
      };
      await this.persistState();
      await this.appendLog('LOGIN', 'Successful login');

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

    const failedAttempts = state.failedAttempts + 1;
    const locked = failedAttempts >= MAX_FAILED_ATTEMPTS;
    this.state = {
      ...state,
      failedAttempts: locked ? MAX_FAILED_ATTEMPTS : failedAttempts,
      lockUntil: locked ? now + LOCKOUT_DURATION_MS : state.lockUntil,
      updatedAt: now,
    };
    await this.persistState();
    await this.appendLog(locked ? 'LOCKOUT' : 'FAILED_LOGIN', locked ? 'Too many failed attempts. Login temporarily locked.' : `Failed login attempt #${failedAttempts}`);

    return {
      authenticated: false,
      locked,
      failedAttempts: this.state.failedAttempts,
      lockUntil: this.state.lockUntil,
      remainingLockMs: this.state.lockUntil > now ? this.state.lockUntil - now : 0,
      message: locked ? 'Too many failed attempts. Login temporarily locked.' : 'Incorrect password',
    };
  }

  logout(sessionId?: string) {
    if (sessionId) {
      this.sessions.delete(sessionId);
    }
    return this.appendLog('LOCK', 'System locked');
  }

  async changePassword(newPassword: string) {
    const state = this.ensureState();
    const now = Date.now();
    const passwordHash = await bcrypt.hash(newPassword, PASSWORD_COST);
    this.state = {
      ...state,
      passwordHash,
      failedAttempts: 0,
      lockUntil: 0,
      updatedAt: now,
    };
    await this.persistState();
    await this.appendLog('PASSWORD_CHANGE', 'Password changed');
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
