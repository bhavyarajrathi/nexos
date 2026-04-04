export interface OSWindow {
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
}

export interface OSApp {
  id: string;
  name: string;
  icon: string;
  component: React.ComponentType<{ windowId: string }>;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface OSTheme {
  id: string;
  name: string;
  primary: string;
  background: string;
  foreground: string;
  accent: string;
  taskbar: string;
  taskbarText: string;
  windowBg: string;
  windowBorder: string;
  category: string;
}

export interface OSWallpaper {
  id: string;
  name: string;
  css: string;
  category: string;
}

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  createdAt: string;
  themeId: string;
  wallpaperId: string;
  windows: OSWindow[];
}

export interface AiStartupProfile {
  id: string;
  label: string;
  role: string;
  mode: 'study' | 'coding' | 'meeting';
  themeId: string;
  wallpaperId: string;
  apps: string[];
  priority: 'performance' | 'balanced' | 'visual';
  style: 'dark' | 'light' | 'colorful' | 'minimal';
  autoApply: boolean;
  createdAt: number;
}

export type SecurityLog = {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
};
