import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useOS } from './OSContext';
import { apps } from './appRegistry';
import Window from './Window';
import { Search, Lock, Wifi, Volume2, Battery, Bell, Sun, Moon, BellRing, Shield, X, Bluetooth, Plane, Settings, Command } from 'lucide-react';

// Icon gradient map for enhanced visual icons
const iconStyles: Record<string, { bg: string; shadow: string }> = {
  calculator: { bg: 'linear-gradient(135deg, #2d2d2d, #1a1a1a)', shadow: '0 4px 12px rgba(0,0,0,0.4)' },
  notepad: { bg: 'linear-gradient(135deg, #f7c948, #f0b429)', shadow: '0 4px 12px rgba(247,201,72,0.3)' },
  terminal: { bg: 'linear-gradient(135deg, #1a1a2e, #0f0f23)', shadow: '0 4px 12px rgba(0,0,0,0.4)' },
  files: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', shadow: '0 4px 12px rgba(59,130,246,0.3)' },
  settings: { bg: 'linear-gradient(135deg, #6b7280, #4b5563)', shadow: '0 4px 12px rgba(107,114,128,0.3)' },
  browser: { bg: 'linear-gradient(135deg, #22c55e, #eab308)', shadow: '0 4px 12px rgba(34,197,94,0.32)' },
  sailor: { bg: 'linear-gradient(135deg, #0ea5e9, #1d4ed8)', shadow: '0 4px 12px rgba(14,165,233,0.34)' },
  weather: { bg: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', shadow: '0 4px 12px rgba(56,189,248,0.3)' },
  music: { bg: 'linear-gradient(135deg, #ec4899, #db2777)', shadow: '0 4px 12px rgba(236,72,153,0.3)' },
  camera: { bg: 'linear-gradient(135deg, #6366f1, #4f46e5)', shadow: '0 4px 12px rgba(99,102,241,0.3)' },
  clock: { bg: 'linear-gradient(135deg, #f97316, #ea580c)', shadow: '0 4px 12px rgba(249,115,22,0.3)' },
  photos: { bg: 'linear-gradient(135deg, #a855f7, #9333ea)', shadow: '0 4px 12px rgba(168,85,247,0.3)' },
  calendar: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', shadow: '0 4px 12px rgba(239,68,68,0.3)' },
  taskmanager: { bg: 'linear-gradient(135deg, #10b981, #059669)', shadow: '0 4px 12px rgba(16,185,129,0.3)' },
  ai: { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', shadow: '0 4px 12px rgba(139,92,246,0.3)' },
  maps: { bg: 'linear-gradient(135deg, #22c55e, #16a34a)', shadow: '0 4px 12px rgba(34,197,94,0.3)' },
  mail: { bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', shadow: '0 4px 12px rgba(59,130,246,0.3)' },
  todo: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', shadow: '0 4px 12px rgba(245,158,11,0.3)' },
  paint: { bg: 'linear-gradient(135deg, #f43f5e, #e11d48)', shadow: '0 4px 12px rgba(244,63,94,0.3)' },
  video: { bg: 'linear-gradient(135deg, #14b8a6, #0d9488)', shadow: '0 4px 12px rgba(20,184,166,0.3)' },
  code: { bg: 'linear-gradient(135deg, #64748b, #475569)', shadow: '0 4px 12px rgba(100,116,139,0.3)' },
  snake: { bg: 'linear-gradient(135deg, #84cc16, #65a30d)', shadow: '0 4px 12px rgba(132,204,22,0.3)' },
  contacts: { bg: 'linear-gradient(135deg, #f97316, #c2410c)', shadow: '0 4px 12px rgba(249,115,22,0.3)' },
  books: { bg: 'linear-gradient(135deg, #f59e0b, #b45309)', shadow: '0 4px 12px rgba(245,158,11,0.3)' },
  vpn: { bg: 'linear-gradient(135deg, #0ea5e9, #7c3aed)', shadow: '0 4px 12px rgba(14,165,233,0.32)' },
};

interface Notification {
  id: string;
  title: string;
  body: string;
  time: Date;
  icon: string;
  read: boolean;
}

const defaultNotifications: Notification[] = [
  { id: '1', title: 'Welcome to NexOS', body: 'Your system is ready. Explore apps and customize your experience!', time: new Date(), icon: '🖥️', read: false },
  { id: '2', title: 'Security Active', body: 'AES-256 encryption enabled. All sessions are secure.', time: new Date(Date.now() - 60000), icon: '🔒', read: false },
  { id: '3', title: 'AI Assistant', body: 'NexOS AI is online and ready to help.', time: new Date(Date.now() - 120000), icon: '🤖', read: true },
];

interface ContextMenuState {
  x: number;
  y: number;
  items: { label: string; icon?: string; action: () => void; divider?: boolean }[];
}

// macOS Dock pinned app ids
const dockPinnedIds = ['files', 'browser', 'mail', 'music', 'photos', 'terminal', 'settings', 'ai'];

const Desktop: React.FC = () => {
  const { windows, openApp, currentWallpaper, currentTheme, lock, minimizeWindow, focusWindow } = useOS();
  const [time, setTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [controlOpen, setControlOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(defaultNotifications);
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(75);
  const [wifiOn, setWifiOn] = useState(true);
  const [bluetoothOn, setBluetoothOn] = useState(false);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [nightMode, setNightMode] = useState(false);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [hoveredDockApp, setHoveredDockApp] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + Space for Spotlight
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        setLaunchpadOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Spotlight-style grouped search results
  const searchResults = useMemo(() => {
    if (!searchQuery) return null;
    const q = searchQuery.toLowerCase();
    const matched = apps.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
    const groups: Record<string, typeof apps> = {};
    matched.forEach(app => {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category].push(app);
    });
    return groups;
  }, [searchQuery]);

  // Group apps by category for launchpad
  const appsByCategory = useMemo(() => {
    const groups: Record<string, typeof apps> = {};
    apps.forEach(app => {
      if (!groups[app.category]) groups[app.category] = [];
      groups[app.category].push(app);
    });
    return groups;
  }, []);

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: 'Open Terminal', icon: '💻', action: () => openApp('terminal') },
        { label: 'Open Settings', icon: '⚙️', action: () => openApp('settings') },
        { label: 'Open File Manager', icon: '📁', action: () => openApp('files') },
        { label: 'Change Wallpaper', icon: '🖼️', action: () => openApp('settings'), divider: true },
        { label: 'Refresh Desktop', icon: '🔄', action: () => {} },
        { label: 'System Info', icon: '📊', action: () => openApp('taskmanager'), divider: true },
        { label: 'Lock Screen', icon: '🔒', action: () => lock() },
      ]
    });
  }, [openApp, lock]);

  const handleAppContextMenu = useCallback((e: React.MouseEvent, appId: string, appName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      items: [
        { label: `Open ${appName}`, icon: '▶️', action: () => openApp(appId) },
        { label: 'Open in New Window', icon: '🪟', action: () => openApp(appId) },
        { label: 'Pin to Dock', icon: '📌', action: () => {}, divider: true },
        { label: 'App Info', icon: 'ℹ️', action: () => {} },
      ]
    });
  }, [openApp]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const closeAllPanels = () => {
    setSearchOpen(false);
    setLaunchpadOpen(false);
    setNotifOpen(false);
    setControlOpen(false);
    setSearchQuery('');
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  const renderIcon = (app: typeof apps[0], size: 'sm' | 'md' | 'lg' = 'md') => {
    const style = iconStyles[app.id] || { bg: 'linear-gradient(135deg, #6b7280, #4b5563)', shadow: '0 4px 12px rgba(0,0,0,0.3)' };
    const sizeMap = { sm: 'w-8 h-8 text-base', md: 'w-11 h-11 text-xl', lg: 'w-14 h-14 text-2xl' };
    const radiusMap = { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl' };
    return (
      <div className={`${sizeMap[size]} ${radiusMap[size]} flex items-center justify-center shrink-0 transition-transform`}
        style={{ background: style.bg, boxShadow: style.shadow }}>
        <span className="drop-shadow-md">{app.icon}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 select-none overflow-hidden" style={{ background: currentWallpaper.css, filter: `brightness(${brightness / 100})` }}
      onContextMenu={handleDesktopContextMenu}>

      {/* Night mode overlay */}
      {nightMode && <div className="absolute inset-0 bg-amber-900/20 pointer-events-none z-[9998]" />}

      {/* macOS-style Menu Bar (top) */}
      <div className="fixed top-0 left-0 right-0 h-7 flex items-center px-3 z-[9500] backdrop-blur-xl"
        style={{ background: currentTheme.taskbar, borderBottom: `1px solid ${currentTheme.windowBorder}` }}>
        {/* Apple-like logo */}
        <button onClick={() => { setLaunchpadOpen(!launchpadOpen); closeAllPanels(); setLaunchpadOpen(prev => !prev); }}
          className="h-7 px-2 flex items-center hover:bg-white/10 transition-all font-bold text-xs"
          style={{ color: currentTheme.taskbarText }}>
          ◆ NexOS
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />

        {/* Active app name */}
        <span className="text-[10px] font-medium px-2 opacity-70" style={{ color: currentTheme.taskbarText }}>
          Desktop
        </span>

        <div className="flex-1" />

        {/* Right side system tray */}
        <div className="flex items-center gap-0.5" style={{ color: currentTheme.taskbarText }}>
          {/* Control center toggles */}
          <button onClick={(e) => { e.stopPropagation(); setControlOpen(!controlOpen); setNotifOpen(false); }}
            className="h-7 flex items-center gap-1.5 px-2 hover:bg-white/10 transition-all">
            <Wifi className={`w-3.5 h-3.5 ${wifiOn ? 'opacity-70' : 'opacity-20'}`} />
            <Volume2 className="w-3.5 h-3.5 opacity-70" />
            <Battery className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Notification bell */}
          <button onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); setControlOpen(false); }}
            className="relative h-7 w-7 flex items-center justify-center hover:bg-white/10 transition-all">
            <Bell className="w-3.5 h-3.5 opacity-70" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-red-500 text-[7px] flex items-center justify-center text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Spotlight search icon */}
          <button onClick={() => { setSearchOpen(!searchOpen); setLaunchpadOpen(false); }}
            className="h-7 w-7 flex items-center justify-center hover:bg-white/10 transition-all">
            <Search className="w-3.5 h-3.5 opacity-70" />
          </button>

          <div className="text-right ml-1.5">
            <span className="text-[11px] font-medium">
              {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed z-[9999] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl py-1 min-w-[200px]"
          style={{ left: contextMenu.x, top: contextMenu.y, background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}>
          {contextMenu.items.map((item, i) => (
            <React.Fragment key={i}>
              {item.divider && i > 0 && <div className="h-px my-1 mx-2" style={{ background: currentTheme.windowBorder }} />}
              <button onClick={(e) => { e.stopPropagation(); item.action(); setContextMenu(null); }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs hover:bg-white/10 transition-all text-left"
                style={{ color: currentTheme.taskbarText }}>
                <span className="text-sm w-5 text-center">{item.icon}</span>
                {item.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Spotlight Search (macOS style - centered, tree/categorized) */}
      {searchOpen && (
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[520px] max-w-[90vw] z-[9000]" onClick={e => e.stopPropagation()}>
          <div className="rounded-2xl overflow-hidden shadow-2xl backdrop-blur-2xl border"
            style={{ background: currentTheme.windowBg, borderColor: currentTheme.windowBorder }}>
            <div className="flex items-center gap-3 px-4 py-3">
              <Search className="w-5 h-5 opacity-40" style={{ color: currentTheme.taskbarText }} />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                placeholder="Spotlight Search"
                className="flex-1 bg-transparent text-sm outline-none" style={{ color: currentTheme.taskbarText }} />
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 opacity-30 font-mono" style={{ color: currentTheme.taskbarText }}>
                ⌘ Space
              </span>
            </div>
            {searchQuery && (
              <div className="border-t max-h-[350px] overflow-y-auto" style={{ borderColor: currentTheme.windowBorder }}>
                {searchResults && Object.keys(searchResults).length > 0 ? (
                  Object.entries(searchResults).map(([category, catApps]) => (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-[10px] uppercase tracking-wider font-semibold opacity-40"
                        style={{ color: currentTheme.taskbarText }}>
                        {category}
                      </div>
                      {catApps.map(app => (
                        <button key={app.id} onClick={() => { openApp(app.id); closeAllPanels(); }}
                          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-all text-left">
                          {renderIcon(app, 'sm')}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium" style={{ color: currentTheme.taskbarText }}>{app.name}</p>
                            <p className="text-[10px] opacity-40" style={{ color: currentTheme.taskbarText }}>{app.category}</p>
                          </div>
                          <span className="text-[10px] opacity-20" style={{ color: currentTheme.taskbarText }}>Open</span>
                        </button>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-xs py-6 opacity-30" style={{ color: currentTheme.taskbarText }}>No results for "{searchQuery}"</p>
                )}
              </div>
            )}
            {!searchQuery && (
              <div className="border-t px-4 py-3" style={{ borderColor: currentTheme.windowBorder }}>
                <p className="text-[10px] opacity-30 text-center" style={{ color: currentTheme.taskbarText }}>
                  Search apps, settings, and more...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for search/panels */}
      {(searchOpen || launchpadOpen || notifOpen || controlOpen) && (
        <div className={`absolute inset-0 z-[8999] ${launchpadOpen ? 'bg-black/50 backdrop-blur-sm' : ''}`} onClick={closeAllPanels} />
      )}

      {/* Launchpad (macOS style grid by category) */}
      {launchpadOpen && (
        <div className="absolute inset-0 top-7 z-[9000] flex items-center justify-center overflow-y-auto py-8"
          onClick={e => e.stopPropagation()}>
          <div className="w-full max-w-4xl px-8">
            {/* Launchpad search */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl w-64"
                style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid rgba(255,255,255,0.1)` }}>
                <Search className="w-3.5 h-3.5 opacity-40" style={{ color: currentTheme.taskbarText }} />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search apps..." autoFocus
                  className="flex-1 bg-transparent text-xs outline-none" style={{ color: currentTheme.taskbarText }} />
              </div>
            </div>

            {Object.entries(appsByCategory)
              .filter(([, catApps]) => !searchQuery || catApps.some(a => a.name.toLowerCase().includes(searchQuery.toLowerCase())))
              .map(([category, catApps]) => {
                const filtered = searchQuery 
                  ? catApps.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  : catApps;
                if (filtered.length === 0) return null;
                return (
                  <div key={category} className="mb-6">
                    <h3 className="text-xs font-semibold mb-3 opacity-50" style={{ color: currentTheme.taskbarText }}>
                      {category}
                    </h3>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                      {filtered.map(app => (
                        <button key={app.id} onClick={() => { openApp(app.id); setLaunchpadOpen(false); setSearchQuery(''); }}
                          onContextMenu={(e) => handleAppContextMenu(e, app.id, app.name)}
                          className="flex flex-col items-center gap-1.5 group">
                          <div className="group-hover:scale-110 transition-all duration-200">
                            {renderIcon(app, 'lg')}
                          </div>
                          <span className="text-[10px] text-white/80 truncate w-full text-center drop-shadow-md font-medium">
                            {app.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Notification Center */}
      {notifOpen && (
        <div className="absolute top-8 right-2 w-80 z-[9000] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{ background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: currentTheme.windowBorder }}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: currentTheme.taskbarText }} />
              <span className="text-xs font-semibold" style={{ color: currentTheme.taskbarText }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 text-[10px]">{unreadCount}</span>
              )}
            </div>
            <div className="flex gap-1">
              <button onClick={markAllRead} className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10" style={{ color: currentTheme.taskbarText }}>
                Mark all read
              </button>
              <button onClick={clearNotifications} className="text-[10px] px-2 py-0.5 rounded hover:bg-white/10" style={{ color: currentTheme.taskbarText }}>
                Clear
              </button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 opacity-30">
                <BellRing className="w-8 h-8 mb-2" style={{ color: currentTheme.taskbarText }} />
                <p className="text-xs" style={{ color: currentTheme.taskbarText }}>No notifications</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`flex gap-3 px-3 py-2.5 border-b border-white/5 hover:bg-white/5 ${!n.read ? '' : 'opacity-50'}`}>
                  <span className="text-lg shrink-0">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: currentTheme.taskbarText }}>{n.title}</p>
                    <p className="text-[10px] opacity-60 mt-0.5" style={{ color: currentTheme.taskbarText }}>{n.body}</p>
                    <p className="text-[9px] opacity-30 mt-1" style={{ color: currentTheme.taskbarText }}>
                      {n.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-red-400 mt-1 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Control Center */}
      {controlOpen && (
        <div className="absolute top-8 right-2 w-72 z-[9000] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{ background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}
          onClick={e => e.stopPropagation()}>
          <div className="px-3 py-2 border-b" style={{ borderColor: currentTheme.windowBorder }}>
            <span className="text-xs font-semibold" style={{ color: currentTheme.taskbarText }}>Control Center</span>
          </div>
          <div className="p-3 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Wifi, label: 'Wi-Fi', active: wifiOn, toggle: () => setWifiOn(!wifiOn) },
                { icon: Bluetooth, label: 'Bluetooth', active: bluetoothOn, toggle: () => setBluetoothOn(!bluetoothOn) },
                { icon: Plane, label: 'Airplane', active: airplaneMode, toggle: () => setAirplaneMode(!airplaneMode) },
                { icon: Moon, label: 'Night', active: nightMode, toggle: () => setNightMode(!nightMode) },
                { icon: Shield, label: 'VPN', active: false, toggle: () => {} },
                { icon: Settings, label: 'Settings', active: false, toggle: () => { openApp('settings'); setControlOpen(false); } },
              ].map(t => (
                <button key={t.label} onClick={t.toggle}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    t.active ? 'bg-cyan-500/25 border border-cyan-400/30' : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}>
                  <t.icon className="w-4 h-4" style={{ color: t.active ? '#22d3ee' : currentTheme.taskbarText }} />
                  <span className="text-[9px]" style={{ color: currentTheme.taskbarText }}>{t.label}</span>
                </button>
              ))}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 opacity-60" style={{ color: currentTheme.taskbarText }} />
                  <span className="text-[10px]" style={{ color: currentTheme.taskbarText }}>Brightness</span>
                </div>
                <span className="text-[10px] opacity-40" style={{ color: currentTheme.taskbarText }}>{brightness}%</span>
              </div>
              <input type="range" min={30} max={100} value={brightness} onChange={e => setBrightness(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #22d3ee ${(brightness - 30) / 70 * 100}%, rgba(255,255,255,0.1) ${(brightness - 30) / 70 * 100}%)` }} />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 opacity-60" style={{ color: currentTheme.taskbarText }} />
                  <span className="text-[10px]" style={{ color: currentTheme.taskbarText }}>Volume</span>
                </div>
                <span className="text-[10px] opacity-40" style={{ color: currentTheme.taskbarText }}>{volume}%</span>
              </div>
              <input type="range" min={0} max={100} value={volume} onChange={e => setVolume(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #22d3ee ${volume}%, rgba(255,255,255,0.1) ${volume}%)` }} />
            </div>
          </div>
        </div>
      )}

      {/* Windows */}
      {windows.map(win => {
        const app = apps.find(a => a.id === win.appId);
        if (!app) return null;
        return (
          <Window key={win.id} window={win} title={app.name}>
            <app.component />
          </Window>
        );
      })}

      {/* macOS-style Dock (bottom center) */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9500] flex items-end gap-1 px-3 py-1.5 rounded-2xl backdrop-blur-2xl"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
        {/* Launchpad button */}
        <button onClick={() => { setLaunchpadOpen(!launchpadOpen); setSearchOpen(false); setNotifOpen(false); setControlOpen(false); }}
          onMouseEnter={() => setHoveredDockApp('launchpad')}
          onMouseLeave={() => setHoveredDockApp(null)}
          className="relative flex flex-col items-center group">
          {hoveredDockApp === 'launchpad' && (
            <span className="absolute -top-7 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap backdrop-blur-xl"
              style={{ background: currentTheme.windowBg, color: currentTheme.taskbarText, border: `1px solid ${currentTheme.windowBorder}` }}>
              Launchpad
            </span>
          )}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${hoveredDockApp === 'launchpad' ? 'scale-125 -translate-y-2' : ''}`}
            style={{ background: 'linear-gradient(135deg, #6b7280, #4b5563)', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <Command className="w-5 h-5 text-white" />
          </div>
        </button>

        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Pinned apps */}
        {dockPinnedIds.map(id => {
          const app = apps.find(a => a.id === id);
          if (!app) return null;
          const isOpen = windows.some(w => w.appId === id);
          return (
            <button key={id}
              onClick={() => openApp(id)}
              onContextMenu={(e) => handleAppContextMenu(e, id, app.name)}
              onMouseEnter={() => setHoveredDockApp(id)}
              onMouseLeave={() => setHoveredDockApp(null)}
              className="relative flex flex-col items-center group">
              {hoveredDockApp === id && (
                <span className="absolute -top-7 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap backdrop-blur-xl"
                  style={{ background: currentTheme.windowBg, color: currentTheme.taskbarText, border: `1px solid ${currentTheme.windowBorder}` }}>
                  {app.name}
                </span>
              )}
              <div className={`transition-all duration-200 ${hoveredDockApp === id ? 'scale-125 -translate-y-2' : ''}`}>
                {renderIcon(app)}
              </div>
              {isOpen && <div className="w-1 h-1 rounded-full bg-white/60 mt-0.5" />}
            </button>
          );
        })}

        {/* Separator if there are open non-pinned windows */}
        {windows.some(w => !dockPinnedIds.includes(w.appId)) && (
          <div className="w-px h-8 bg-white/10 mx-1" />
        )}

        {/* Open but not pinned windows */}
        {windows
          .filter(w => !dockPinnedIds.includes(w.appId))
          .map(win => {
            const app = apps.find(a => a.id === win.appId);
            if (!app) return null;
            return (
              <button key={win.id}
                onClick={() => win.minimized ? focusWindow(win.id) : minimizeWindow(win.id)}
                onMouseEnter={() => setHoveredDockApp(win.id)}
                onMouseLeave={() => setHoveredDockApp(null)}
                className="relative flex flex-col items-center group">
                {hoveredDockApp === win.id && (
                  <span className="absolute -top-7 px-2 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap backdrop-blur-xl"
                    style={{ background: currentTheme.windowBg, color: currentTheme.taskbarText, border: `1px solid ${currentTheme.windowBorder}` }}>
                    {app.name}
                  </span>
                )}
                <div className={`transition-all duration-200 ${hoveredDockApp === win.id ? 'scale-125 -translate-y-2' : ''}`}>
                  {renderIcon(app)}
                </div>
                <div className="w-1 h-1 rounded-full bg-white/60 mt-0.5" />
              </button>
            );
          })}
      </div>
    </div>
  );
};

export default Desktop;
