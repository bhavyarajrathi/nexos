import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { OSWindow, OSTheme, OSWallpaper, SecurityLog } from './types';
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
  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  setPassword: (p: string) => Promise<boolean>;
  failedAttempts: number;

  // Windows
  windows: OSWindow[];
  openApp: (appId: string) => void;
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
  const lastActivityRef = useRef(Date.now());
  const [isBooting, setIsBooting] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [windows, setWindows] = useState<OSWindow[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState('ocean-blue');
  const [currentWallpaperId, setCurrentWallpaperId] = useState('w1');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [appUsage, setAppUsage] = useState<Record<string, AppUsageSnapshot>>(() => {
    try {
      const raw = window.localStorage.getItem(usageStorageKey);
      return raw ? JSON.parse(raw) as Record<string, AppUsageSnapshot> : {};
    } catch {
      return {};
    }
  });
  const [pulse, setPulse] = useState(0);
  const zIndexCounter = useRef(100);

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

  const unlock = useCallback(async (p: string) => {
    try {
      const result = await fetchApi<ApiMessageResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: p }),
      });

      setFailedAttempts(result.failedAttempts ?? 0);
      setIsLocked(false);
      lastActivityRef.current = Date.now();
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
    lastActivityRef.current = Date.now();
    void fetchApi<ApiMessageResponse>('/auth/logout', {
      method: 'POST',
    }).catch(() => undefined);
    addSecurityLog('LOCK', 'System locked');
  }, [addSecurityLog]);

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
      windows, openApp, closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow, activeWindowId,
      currentTheme, setTheme, allThemes: themes,
      currentWallpaper, setWallpaper, allWallpapers: wallpapers,
      securityLogs, addSecurityLog,
      appUsage,
      systemTelemetry,
      aiInsights,
      assistantContext,
      recordAppUsage,
      finishBoot
    }}>
      {children}
    </OSContext.Provider>
  );
};
