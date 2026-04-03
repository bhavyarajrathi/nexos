import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { OSWindow, OSTheme, OSWallpaper, SecurityLog } from './types';
import { themes } from './themes';
import { wallpapers } from './wallpapers';

interface OSContextType {
  // Auth
  isLocked: boolean;
  isBooting: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
  setPassword: (p: string) => void;
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

  // Boot
  finishBoot: () => void;
}

const OSContext = createContext<OSContextType | null>(null);

export const useOS = () => {
  const ctx = useContext(OSContext);
  if (!ctx) throw new Error('useOS must be used within OSProvider');
  return ctx;
};

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBooting, setIsBooting] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPasswordState] = useState('1234');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [windows, setWindows] = useState<OSWindow[]>([]);
  const [currentThemeId, setCurrentThemeId] = useState('ocean-blue');
  const [currentWallpaperId, setCurrentWallpaperId] = useState('w1');
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const zIndexCounter = useRef(100);

  const addSecurityLog = useCallback((action: string, details: string) => {
    setSecurityLogs(prev => [...prev.slice(-99), {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action,
      details
    }]);
  }, []);

  const unlock = useCallback((p: string) => {
    if (p === password) {
      setIsLocked(false);
      setFailedAttempts(0);
      addSecurityLog('LOGIN', 'Successful login');
      return true;
    }
    setFailedAttempts(prev => prev + 1);
    addSecurityLog('FAILED_LOGIN', `Failed login attempt #${failedAttempts + 1}`);
    return false;
  }, [password, failedAttempts, addSecurityLog]);

  const lock = useCallback(() => {
    setIsLocked(true);
    setWindows([]);
    addSecurityLog('LOCK', 'System locked');
  }, [addSecurityLog]);

  const setPassword = useCallback((p: string) => {
    setPasswordState(p);
    addSecurityLog('PASSWORD_CHANGE', 'Password changed');
  }, [addSecurityLog]);

  const openApp = useCallback((appId: string) => {
    const z = ++zIndexCounter.current;
    const id = `${appId}-${Date.now()}`;
    setWindows(prev => [...prev, {
      id, appId, title: appId, x: 80 + (prev.length * 30) % 200, y: 40 + (prev.length * 30) % 150,
      width: 700, height: 450, minimized: false, maximized: false, zIndex: z, icon: ''
    }]);
    addSecurityLog('APP_OPEN', `Opened ${appId}`);
  }, [addSecurityLog]);

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
      securityLogs, addSecurityLog, finishBoot
    }}>
      {children}
    </OSContext.Provider>
  );
};
