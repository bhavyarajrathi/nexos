import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export type WorkspaceSnapshot = {
  id: string;
  name: string;
  createdAt: string;
  themeId: string;
  wallpaperId: string;
  windows: Array<{
    id: string;
    appId: string;
    title: string;
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
    maximized: boolean;
    zIndex: number;
    icon: string;
  }>;
};

export type AppUsageSnapshot = {
  appId: string;
  opens: number;
  lastOpenedAt: number;
};

export type UserWorkspaceState = {
  themeId: string;
  wallpaperId: string;
  workspaceSnapshots: WorkspaceSnapshot[];
  appUsage: Record<string, AppUsageSnapshot>;
  updatedAt: number;
};

type PersistedUserData = {
  userId: string;
  workspaceState: UserWorkspaceState;
  createdAt: string;
  updatedAt: string;
};

const DATA_DIR = path.resolve(process.cwd(), 'server', 'data');
const USERS_DIR = path.join(DATA_DIR, 'users');
const DEFAULT_WORKSPACE_STATE: UserWorkspaceState = {
  themeId: 'ocean-blue',
  wallpaperId: 'w1',
  workspaceSnapshots: [],
  appUsage: {},
  updatedAt: Date.now(),
};
const USER_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

const ensureUserDir = async () => {
  await mkdir(USERS_DIR, { recursive: true });
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

const assertSafeUserId = (userId: string) => {
  if (!USER_ID_PATTERN.test(userId)) {
    throw new Error('Invalid user identifier');
  }
  return userId;
};

const getUserDataPath = (userId: string) => path.join(USERS_DIR, `${assertSafeUserId(userId)}.json`);

export class UserStore {
  async initialize() {
    await ensureUserDir();
  }

  async getUserData(userId: string): Promise<UserWorkspaceState> {
    const filePath = getUserDataPath(userId);
    const data = await readJson<PersistedUserData | null>(filePath, null);
    return data?.workspaceState ?? { ...DEFAULT_WORKSPACE_STATE };
  }

  async saveUserData(userId: string, workspaceState: UserWorkspaceState): Promise<void> {
    const filePath = getUserDataPath(userId);
    const now = new Date().toISOString();
    const existing = await readJson<PersistedUserData | null>(filePath, null);
    const userData: PersistedUserData = {
      userId,
      workspaceState: {
        ...workspaceState,
        updatedAt: Date.now(),
      },
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await writeJson(filePath, userData);
  }

  async addSnapshot(userId: string, snapshot: WorkspaceSnapshot): Promise<void> {
    const state = await this.getUserData(userId);
    state.workspaceSnapshots = [snapshot, ...state.workspaceSnapshots].slice(0, 12);
    await this.saveUserData(userId, state);
  }

  async deleteSnapshot(userId: string, snapshotId: string): Promise<void> {
    const state = await this.getUserData(userId);
    state.workspaceSnapshots = state.workspaceSnapshots.filter(s => s.id !== snapshotId);
    await this.saveUserData(userId, state);
  }

  async updateTheme(userId: string, themeId: string): Promise<void> {
    const state = await this.getUserData(userId);
    state.themeId = themeId;
    await this.saveUserData(userId, state);
  }

  async updateWallpaper(userId: string, wallpaperId: string): Promise<void> {
    const state = await this.getUserData(userId);
    state.wallpaperId = wallpaperId;
    await this.saveUserData(userId, state);
  }

  async recordAppUsage(userId: string, appUsage: Record<string, AppUsageSnapshot>): Promise<void> {
    const state = await this.getUserData(userId);
    state.appUsage = appUsage;
    await this.saveUserData(userId, state);
  }
}
