import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { AiStartupProfile, OSWindow, OSTheme, OSWallpaper, SecurityLog, WorkspaceSnapshot } from './types';
import { themes } from './themes';
import { wallpapers } from './wallpapers';
import {
  AppUsageSnapshot,
  AssistantContext,
  AiInsights,
  SystemTelemetry,
  buildAiInsights,
  buildAssistantContext,
  buildSystemTelemetry,
} from './aiEngine';

interface OSContextType {
  // Auth
  isLocked: boolean;
  isBooting: boolean;
  unlock: (username: string, password: string) => Promise<boolean>;
  lock: () => void;
  setPassword: (p: string) => Promise<boolean>;
  failedAttempts: number;

  // Windows
  windows: OSWindow[];
  openApp: (appId: string) => void;
  closeAllWindows: () => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, w: number, h: number) => void;
  activeWindowId: string | null;

  // Theme
  currentTheme: OSTheme;
  setTheme: (id: string) => void;
  allThemes: OSTheme[];

  // Wallpaper
  currentWallpaper: OSWallpaper;
  setWallpaper: (id: string) => void;
  allWallpapers: OSWallpaper[];

  // Security
  securityLogs: SecurityLog[];
  addSecurityLog: (action: string, details: string) => void;

  // Intelligence
  appUsage: Record<string, AppUsageSnapshot>;
  systemTelemetry: SystemTelemetry;
  aiInsights: AiInsights;
  assistantContext: AssistantContext;
  recordAppUsage: (appId: string) => void;

  // Workspace snapshots
  workspaceSnapshots: WorkspaceSnapshot[];
  saveWorkspaceSnapshot: (name?: string) => string;
  restoreWorkspaceSnapshot: (snapshotId: string) => boolean;
  deleteWorkspaceSnapshot: (snapshotId: string) => void;
  applyAutomationMode: (mode: 'study' | 'coding' | 'meeting') => void;
  syncUserData: () => Promise<void>;
  aiStartupProfile: AiStartupProfile | null;
  saveAiStartupProfile: (profile: AiStartupProfile) => void;
  clearAiStartupProfile: () => void;

  // Boot
  finishBoot: () => void;
}

const OSContext = createContext<OSContextType | null>(null);

const API_BASE = '/api';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30000;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

type ApiStatusResponse = {
  authenticated: boolean;
  failedAttempts: number;
  lockUntil: number;
  remainingLockMs: number;
  maxFailedAttempts?: number;
  lockoutDurationMs?: number;
  sessionTtlMs?: number;
};

type ApiMessageResponse = {
  message?: string;
  failedAttempts?: number;
  lockUntil?: number;
  remainingLockMs?: number;
  authenticated?: boolean;
};

type SecurityLogResponse = {
  logs: Array<{
    id: string;
    timestamp: string | Date;
    action: string;
    details: string;
  }>;
};

type AutomationMode = 'study' | 'coding' | 'meeting';

type UserDataResponse = {
  themeId: string;
  wallpaperId: string;
  workspaceSnapshots: WorkspaceSnapshot[];
  appUsage: Record<string, AppUsageSnapshot>;
  updatedAt: number;
};

const normalizeSecurityLog = (entry: SecurityLogResponse['logs'][number]): SecurityLog => ({
  id: entry.id,
  timestamp: entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp),
  action: entry.action,
  details: entry.details,
});

const fetchApi = async <T,>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || 'Request failed';
    throw new Error(message);
  }

  return payload as T;
};

export const useOS = () => {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
};

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const usageStorageKey = 'nexos.app-usage.v1';
  const snapshotStorageKey = 'nexos.workspace-snapshots.v1';
  const aiProfileStorageKey = 'nexos.ai-startup-profile.v1';
  const lastActivityRef = useRef(Date.now());
  const [isBooting, setIsBooting] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [windows, setWindows] = useState<OSWindow[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState('ocean-blue');
  const [currentWallpaperId, setCurrentWallpaperId] = useState('w1');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [workspaceSnapshots, setWorkspaceSnapshots] = useState<WorkspaceSnapshot[]>(() => {
    try {
      const raw = window.localStorage.getItem(snapshotStorageKey);
      return raw ? JSON.parse(raw) as WorkspaceSnapshot[] : [];
    } catch {
      return [];
    }
  });
  const [appUsage, setAppUsage] = useState<Record<string, AppUsageSnapshot>>(() => {
    try {
      const raw = window.localStorage.getItem(usageStorageKey);
      return raw ? JSON.parse(raw) as Record<string, AppUsageSnapshot> : {};
    } catch {
      return {};
    }
  });
  const [aiStartupProfile, setAiStartupProfile] = useState<AiStartupProfile | null>(() => {
    try {
      const raw = window.localStorage.getItem(aiProfileStorageKey);
      return raw ? JSON.parse(raw) as AiStartupProfile : null;
    } catch {
      return null;
    }
  });
  const [pulse, setPulse] = useState(0);
  const zIndexCounter = useRef(100);
  const startupProfileAppliedRef = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setPulse(previous => previous + 1), 1500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(usageStorageKey, JSON.stringify(appUsage));
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [appUsage]);

  useEffect(() => {
    try {
      window.localStorage.setItem(snapshotStorageKey, JSON.stringify(workspaceSnapshots));
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [workspaceSnapshots]);

  useEffect(() => {
    try {
      if (aiStartupProfile) {
        window.localStorage.setItem(aiProfileStorageKey, JSON.stringify(aiStartupProfile));
      } else {
        window.localStorage.removeItem(aiProfileStorageKey);
      }
    } catch {
      // Ignore storage failures in restricted environments.
    }
  }, [aiStartupProfile]);

  const addSecurityLog = useCallback((action: string, details: string) => {
    setSecurityLogs(prev => [...prev.slice(-99), {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action,
      details
    }]);

    void fetchApi('/security/logs', {
      method: 'POST',
      body: JSON.stringify({ action, details }),
    }).catch(() => undefined);
  }, []);

  const syncSecurityState = useCallback(async () => {
    try {
      const status = await fetchApi<ApiStatusResponse>('/auth/status');
      setFailedAttempts(status.failedAttempts);
      if (status.authenticated) {
        setIsLocked(false);
        lastActivityRef.current = Date.now();
      } else {
        setIsLocked(true);
      }

      return status;
    } catch {
      setIsLocked(true);
      return null;
    }
  }, []);

  const refreshSecurityLogs = useCallback(async () => {
    try {
      const response = await fetchApi<SecurityLogResponse>('/security/logs');
      setSecurityLogs(response.logs.slice(-200).map(normalizeSecurityLog));
    } catch {
      // If the backend is unavailable or locked, keep current in-memory logs.
    }
  }, []);

  const unlock = useCallback(async (username: string, password: string) => {
    try {
      const result = await fetchApi<ApiMessageResponse & { userData?: UserDataResponse }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      setFailedAttempts(result.failedAttempts ?? 0);
      setIsLocked(false);
      lastActivityRef.current = Date.now();

      // Load user workspace data if available
      if (result.userData) {
        setCurrentThemeId(result.userData.themeId);
        setCurrentWallpaperId(result.userData.wallpaperId);
        setWorkspaceSnapshots(result.userData.workspaceSnapshots);
        setAppUsage(result.userData.appUsage);
      }

      await refreshSecurityLogs();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      const lockoutDetected = /locked/i.test(message);
      setFailedAttempts(lockoutDetected ? MAX_FAILED_ATTEMPTS : Math.min(MAX_FAILED_ATTEMPTS, failedAttempts + 1));
      setIsLocked(true);
      addSecurityLog(lockoutDetected ? 'LOCKOUT' : 'FAILED_LOGIN', message);
      await refreshSecurityLogs();
      return false;
    }
  }, [addSecurityLog, failedAttempts, refreshSecurityLogs]);

  const lock = useCallback(() => {
    setIsLocked(true);
    setWindows([]);
    startupProfileAppliedRef.current = false;
    lastActivityRef.current = Date.now();
    void fetchApi<ApiMessageResponse>('/auth/logout', {
      method: 'POST',
    }).catch(() => undefined);
    addSecurityLog('LOCK', 'System locked');
  }, [addSecurityLog]);

  const syncUserData = useCallback(async () => {
    if (isLocked) return;
    try {
      await fetchApi('/user/data', {
        method: 'POST',
        body: JSON.stringify({
          themeId: currentThemeId,
          wallpaperId: currentWallpaperId,
          workspaceSnapshots,
          appUsage,
        }),
      });
    } catch {
      // Silently fail if can't sync
    }
  }, [isLocked, currentThemeId, currentWallpaperId, workspaceSnapshots, appUsage]);

  const setPassword = useCallback(async (p: string) => {
    const trimmed = p.trim();
    const strongEnough = trimmed.length >= 8 && /[A-Za-z]/.test(trimmed) && /\d/.test(trimmed);
    if (!strongEnough) {
      addSecurityLog('PASSWORD_REJECTED', 'Password too weak');
      return false;
    }

    try {
      await fetchApi<ApiMessageResponse>('/auth/password', {
        method: 'POST',
        body: JSON.stringify({ newPassword: trimmed }),
      });

      setFailedAttempts(0);
      addSecurityLog('PASSWORD_CHANGE', 'Password changed');
      await refreshSecurityLogs();
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password change failed';
      addSecurityLog('PASSWORD_CHANGE_FAILED', message);
      return false;
    }
  }, [addSecurityLog, refreshSecurityLogs]);

  useEffect(() => {
    void syncSecurityState();
    void refreshSecurityLogs();
  }, [refreshSecurityLogs, syncSecurityState]);

  // Sync user data to server every 30 seconds when authenticated
  useEffect(() => {
    if (isLocked) return;
    const interval = window.setInterval(() => {
      void syncUserData();
    }, 30000);
    return () => window.clearInterval(interval);
  }, [isLocked, syncUserData]);

  useEffect(() => {
    const markActivity = () => {
      if (!isLocked) {
        lastActivityRef.current = Date.now();
      }
    };

    const autoLockOnHidden = () => {
      if (document.visibilityState === 'hidden' && !isLocked) {
        lock();
        addSecurityLog('VISIBILITY_LOCK', 'Session locked when app lost focus');
      }
    };

    const activityEvents: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'pointerdown'];
    activityEvents.forEach(eventName => window.addEventListener(eventName, markActivity, { passive: true }));
    document.addEventListener('visibilitychange', autoLockOnHidden);
    window.addEventListener('blur', autoLockOnHidden);

    const watchdog = window.setInterval(() => {
      if (!isLocked && Date.now() - lastActivityRef.current > IDLE_TIMEOUT_MS) {
        lock();
        addSecurityLog('IDLE_LOCK', 'Session locked after inactivity');
      }

      void syncSecurityState();
    }, 15000);

    return () => {
      activityEvents.forEach(eventName => window.removeEventListener(eventName, markActivity));
      document.removeEventListener('visibilitychange', autoLockOnHidden);
      window.removeEventListener('blur', autoLockOnHidden);
      window.clearInterval(watchdog);
    };
  }, [isLocked, lock, addSecurityLog]);

  const recordAppUsage = useCallback((appId: string) => {
    setAppUsage(prev => {
      const current = prev[appId] ?? { appId, opens: 0, lastOpenedAt: 0 };
      return {
        ...prev,
        [appId]: {
          appId,
          opens: current.opens + 1,
          lastOpenedAt: Date.now(),
        },
      };
    });
  }, []);

  const saveWorkspaceSnapshot = useCallback((name?: string) => {
    const trimmedName = name?.trim();
    const snapshot: WorkspaceSnapshot = {
      id: crypto.randomUUID(),
      name: trimmedName || `Snapshot ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      themeId: currentThemeId,
      wallpaperId: currentWallpaperId,
      windows: windows.map(window => ({ ...window })),
    };

    setWorkspaceSnapshots(prev => [snapshot, ...prev].slice(0, 12));
    addSecurityLog('SNAPSHOT_SAVE', `Saved workspace snapshot "${snapshot.name}"`);
    return snapshot.id;
  }, [addSecurityLog, currentThemeId, currentWallpaperId, windows]);

  const restoreWorkspaceSnapshot = useCallback((snapshotId: string) => {
    const snapshot = workspaceSnapshots.find(entry => entry.id === snapshotId);
    if (!snapshot) return false;

    setCurrentThemeId(snapshot.themeId);
    setCurrentWallpaperId(snapshot.wallpaperId);
    setWindows(snapshot.windows.map(window => ({ ...window })));
    zIndexCounter.current = Math.max(100, ...snapshot.windows.map(window => window.zIndex + 1));
    addSecurityLog('SNAPSHOT_RESTORE', `Restored workspace snapshot "${snapshot.name}"`);
    return true;
  }, [addSecurityLog, workspaceSnapshots]);

  const deleteWorkspaceSnapshot = useCallback((snapshotId: string) => {
    const snapshot = workspaceSnapshots.find(entry => entry.id === snapshotId);
    setWorkspaceSnapshots(prev => prev.filter(entry => entry.id !== snapshotId));
    if (snapshot) {
      addSecurityLog('SNAPSHOT_DELETE', `Deleted workspace snapshot "${snapshot.name}"`);
    }
  }, [addSecurityLog, workspaceSnapshots]);

  const applyAutomationMode = useCallback((mode: AutomationMode) => {
    const presets: Record<AutomationMode, {
      label: string;
      themeId: string;
      wallpaperId: string;
      windows: Array<{ appId: string; x: number; y: number; width: number; height: number; maximized?: boolean }>;
    }> = {
      study: {
        label: 'Study',
        themeId: 'pastel-sky',
        wallpaperId: 'w39',
        windows: [
          { appId: 'notepad', x: 30, y: 60, width: 560, height: 360 },
          { appId: 'todo', x: 610, y: 60, width: 330, height: 360 },
          { appId: 'calendar', x: 950, y: 60, width: 320, height: 360 },
          { appId: 'books', x: 130, y: 440, width: 520, height: 300 },
          { appId: 'clock', x: 670, y: 440, width: 260, height: 300 },
        ],
      },
      coding: {
        label: 'Coding',
        themeId: 'graphite',
        wallpaperId: 'w19',
        windows: [
          { appId: 'code', x: 20, y: 56, width: 860, height: 540 },
          { appId: 'terminal', x: 900, y: 420, width: 420, height: 260 },
          { appId: 'files', x: 900, y: 56, width: 420, height: 350 },
          { appId: 'browser', x: 60, y: 610, width: 680, height: 240 },
          { appId: 'ai', x: 760, y: 610, width: 560, height: 240 },
        ],
      },
      meeting: {
        label: 'Meeting',
        themeId: 'frost',
        wallpaperId: 'w48',
        windows: [
          { appId: 'calendar', x: 20, y: 56, width: 360, height: 300 },
          { appId: 'mail', x: 20, y: 370, width: 360, height: 320 },
          { appId: 'notepad', x: 400, y: 510, width: 500, height: 220 },
          { appId: 'browser', x: 400, y: 56, width: 920, height: 440 },
        ],
      },
    };

    const preset = presets[mode];
    const startingZ = zIndexCounter.current;
    const nextWindows: OSWindow[] = preset.windows.map((entry, index) => ({
      id: `${entry.appId}-${Date.now()}-${index}`,
      appId: entry.appId,
      title: entry.appId,
      x: entry.x,
      y: entry.y,
      width: entry.width,
      height: entry.height,
      minimized: false,
      maximized: !!entry.maximized,
      zIndex: startingZ + index + 1,
      icon: '',
    }));

    setCurrentThemeId(preset.themeId);
    setCurrentWallpaperId(preset.wallpaperId);
    setWindows(nextWindows);
    zIndexCounter.current = startingZ + nextWindows.length + 1;
    nextWindows.forEach(window => recordAppUsage(window.appId));
    addSecurityLog('AUTOMATION_MODE', `Applied ${preset.label} mode`);
  }, [addSecurityLog, recordAppUsage]);

  const applyAiStartupWorkspace = useCallback((profile: AiStartupProfile) => {
    applyAutomationMode(profile.mode);
    setCurrentThemeId(profile.themeId);
    setCurrentWallpaperId(profile.wallpaperId);

    const existingAppIds = new Set(windows.map(window => window.appId));
    profile.apps.slice(0, 8).forEach(appId => {
      if (!existingAppIds.has(appId)) {
        const z = ++zIndexCounter.current;
        const id = `${appId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        recordAppUsage(appId);
        setWindows(prev => [...prev, {
          id,
          appId,
          title: appId,
          x: 80 + (prev.length * 30) % 200,
          y: 40 + (prev.length * 30) % 150,
          width: 700,
          height: 450,
          minimized: false,
          maximized: false,
          zIndex: z,
          icon: '',
        }]);
      }
    });

    addSecurityLog('AI_PROFILE_APPLY', `Applied AI startup profile "${profile.label}"`);
  }, [addSecurityLog, applyAutomationMode, recordAppUsage, windows]);

  const saveAiStartupProfile = useCallback((profile: AiStartupProfile) => {
    setAiStartupProfile(profile);
    addSecurityLog('AI_PROFILE_SAVE', `Saved AI startup profile "${profile.label}"`);
  }, [addSecurityLog]);

  const clearAiStartupProfile = useCallback(() => {
    setAiStartupProfile(null);
    addSecurityLog('AI_PROFILE_CLEAR', 'Cleared AI startup profile');
  }, [addSecurityLog]);

  useEffect(() => {
    if (isLocked || !aiStartupProfile?.autoApply) {
      return;
    }

    if (startupProfileAppliedRef.current) {
      return;
    }

    startupProfileAppliedRef.current = true;
    applyAiStartupWorkspace(aiStartupProfile);
  }, [isLocked, aiStartupProfile, applyAiStartupWorkspace]);

  const openApp = useCallback((appId: string) => {
    const z = ++zIndexCounter.current;
    const id = `${appId}-${Date.now()}`;
    recordAppUsage(appId);
    setWindows(prev => [...prev, {
      id, appId, title: appId, x: 80 + (prev.length * 30) % 200, y: 40 + (prev.length * 30) % 150,
      width: 700, height: 450, minimized: false, maximized: false, zIndex: z, icon: ''
    }]);
    addSecurityLog('APP_OPEN', `Opened ${appId}`);
  }, [addSecurityLog, recordAppUsage]);

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const closeAllWindows = useCallback(() => {
    setWindows([]);
    addSecurityLog('APP_CLOSE_ALL', 'Closed all open applications');
  }, [addSecurityLog]);

  const minimizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, minimized: !w.minimized } : w));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  }, []);

  const focusWindow = useCallback((id: string) => {
    const z = ++zIndexCounter.current;
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: z, minimized: false } : w));
  }, []);

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, x, y } : w));
  }, []);

  const resizeWindow = useCallback((id: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, width, height } : w));
  }, []);

  const activeWindowId = windows.length > 0
    ? windows.filter(w => !w.minimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null
    : null;

  const currentTheme = themes.find(t => t.id === currentThemeId) || themes[0];
  const currentWallpaper = wallpapers.find(w => w.id === currentWallpaperId) || wallpapers[0];
  const systemTelemetry = useMemo(() => buildSystemTelemetry(windows, appUsage, pulse), [windows, appUsage, pulse]);
  const aiInsights = useMemo(() => buildAiInsights(windows, appUsage, pulse), [windows, appUsage, pulse]);
  const assistantContext = useMemo(
    () => buildAssistantContext(windows, appUsage, currentTheme, currentWallpaper, pulse),
    [windows, appUsage, currentTheme, currentWallpaper, pulse]
  );

  const setTheme = useCallback((id: string) => {
    setCurrentThemeId(id);
    addSecurityLog('THEME_CHANGE', `Theme changed to ${id}`);
  }, [addSecurityLog]);

  const setWallpaper = useCallback((id: string) => {
    setCurrentWallpaperId(id);
  }, []);

  const finishBoot = useCallback(() => setIsBooting(false), []);

  return (
    <OSContext.Provider value={{
      isLocked, isBooting, unlock, lock, setPassword, failedAttempts,
      windows, openApp, closeAllWindows, closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow, activeWindowId,
      currentTheme, setTheme, allThemes: themes,
      currentWallpaper, setWallpaper, allWallpapers: wallpapers,
      securityLogs, addSecurityLog,
      appUsage,
      systemTelemetry,
      aiInsights,
      assistantContext,
      recordAppUsage,
      workspaceSnapshots,
      saveWorkspaceSnapshot,
      restoreWorkspaceSnapshot,
      deleteWorkspaceSnapshot,
      applyAutomationMode,
      syncUserData,
      aiStartupProfile,
      saveAiStartupProfile,
      clearAiStartupProfile,
      finishBoot
    }}>
      {children}
    </OSContext.Provider>
  );
};
