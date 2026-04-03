import React, { useState, useEffect, useCallback } from 'react';
import { useOS } from './OSContext';
import { apps } from './appRegistry';
import Window from './Window';
import { Search, Lock, Wifi, Volume2, Battery, ChevronUp, Bell, Sun, Moon, BellRing, Shield, X, Bluetooth, Plane, Settings } from 'lucide-react';

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

const Desktop: React.FC = () => {
  const { windows, openApp, currentWallpaper, currentTheme, lock, minimizeWindow, focusWindow } = useOS();
  const [time, setTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startOpen, setStartOpen] = useState(false);
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

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const filteredApps = searchQuery
    ? apps.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : apps;

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
        { label: 'Pin to Taskbar', icon: '📌', action: () => {}, divider: true },
        { label: 'App Info', icon: 'ℹ️', action: () => {} },
      ]
    });
  }, [openApp]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const closeAllPanels = () => {
    setSearchOpen(false);
    setStartOpen(false);
    setNotifOpen(false);
    setControlOpen(false);
    setSearchQuery('');
  };

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  return (
    <div className="fixed inset-0 select-none overflow-hidden" style={{ background: currentWallpaper.css, filter: `brightness(${brightness / 100})` }}
      onContextMenu={handleDesktopContextMenu}>

      {/* Night mode overlay */}
      {nightMode && <div className="absolute inset-0 bg-amber-900/20 pointer-events-none z-[9998]" />}

      {/* Desktop Icons */}
      <div className="absolute inset-0 bottom-12 p-4 overflow-y-auto">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 auto-rows-max">
          {apps.map(app => (
            <button key={app.id} onDoubleClick={() => openApp(app.id)}
              onContextMenu={(e) => handleAppContextMenu(e, app.id, app.name)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-white/10 transition-all group cursor-pointer">
              <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform drop-shadow-lg">
                {app.icon}
              </span>
              <span className="text-[10px] text-white/80 truncate w-full text-center drop-shadow-md">
                {app.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed z-[9999] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl py-1 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y, background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}>
          {contextMenu.items.map((item, i) => (
            <React.Fragment key={i}>
              {item.divider && i > 0 && <div className="h-px my-1" style={{ background: currentTheme.windowBorder }} />}
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

      {/* Search Bar (floating) */}
      {searchOpen && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[420px] max-w-[90vw] z-[9000]" onClick={e => e.stopPropagation()}>
          <div className="rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl" style={{ background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: currentTheme.windowBorder }}>
              <Search className="w-4 h-4 opacity-50" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                placeholder="Search apps, settings, files..."
                className="flex-1 bg-transparent text-sm outline-none" style={{ color: currentTheme.taskbarText }} />
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {filteredApps.map(app => (
                <button key={app.id} onClick={() => { openApp(app.id); closeAllPanels(); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-left">
                  <span className="text-lg">{app.icon}</span>
                  <div>
                    <p className="text-xs font-medium" style={{ color: currentTheme.taskbarText }}>{app.name}</p>
                    <p className="text-[10px] opacity-50" style={{ color: currentTheme.taskbarText }}>{app.category}</p>
                  </div>
                </button>
              ))}
              {filteredApps.length === 0 && (
                <p className="text-center text-xs py-4 opacity-40" style={{ color: currentTheme.taskbarText }}>No results</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for search/start/panels */}
      {(searchOpen || startOpen || notifOpen || controlOpen) && (
        <div className="absolute inset-0 z-[8999]" onClick={closeAllPanels} />
      )}

      {/* Start Menu */}
      {startOpen && (
        <div className="absolute bottom-12 left-2 w-72 z-[9000] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{ background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}
          onClick={e => e.stopPropagation()}>
          <div className="p-3 border-b" style={{ borderColor: currentTheme.windowBorder }}>
            <p className="text-xs font-semibold" style={{ color: currentTheme.taskbarText }}>NexOS</p>
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {apps.map(app => (
              <button key={app.id} onClick={() => { openApp(app.id); setStartOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all text-left">
                <span className="text-lg">{app.icon}</span>
                <span className="text-xs" style={{ color: currentTheme.taskbarText }}>{app.name}</span>
              </button>
            ))}
          </div>
          <div className="p-2 border-t flex gap-1" style={{ borderColor: currentTheme.windowBorder }}>
            <button onClick={lock}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg hover:bg-white/10 text-[10px]"
              style={{ color: currentTheme.taskbarText }}>
              <Lock className="w-3 h-3" /> Lock
            </button>
          </div>
        </div>
      )}

      {/* Notification Center */}
      {notifOpen && (
        <div className="absolute bottom-12 right-2 w-80 z-[9000] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{ background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: currentTheme.windowBorder }}>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" style={{ color: currentTheme.taskbarText }} />
              <span className="text-xs font-semibold" style={{ color: currentTheme.taskbarText }}>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-300 text-[10px]">{unreadCount}</span>
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
                  {!n.read && <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Control Center */}
      {controlOpen && (
        <div className="absolute bottom-12 right-2 w-72 z-[9000] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{ background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}
          onClick={e => e.stopPropagation()}>
          <div className="px-3 py-2 border-b" style={{ borderColor: currentTheme.windowBorder }}>
            <span className="text-xs font-semibold" style={{ color: currentTheme.taskbarText }}>Control Center</span>
          </div>
          <div className="p-3 space-y-4">
            {/* Quick toggles */}
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

            {/* Brightness */}
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

            {/* Volume */}
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

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-12 flex items-center px-2 gap-1 z-[9500] backdrop-blur-xl"
        style={{ background: currentTheme.taskbar, borderTop: `1px solid ${currentTheme.windowBorder}` }}>
        {/* Start button */}
        <button onClick={() => { setStartOpen(!startOpen); setSearchOpen(false); setNotifOpen(false); setControlOpen(false); }}
          className="h-8 px-3 rounded-lg flex items-center gap-1.5 hover:bg-white/10 transition-all"
          style={{ color: currentTheme.taskbarText }}>
          <ChevronUp className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Start</span>
        </button>

        {/* Search */}
        <button onClick={() => { setSearchOpen(!searchOpen); setStartOpen(false); setNotifOpen(false); setControlOpen(false); }}
          className="h-8 px-3 rounded-lg flex items-center gap-1.5 hover:bg-white/10 transition-all"
          style={{ color: currentTheme.taskbarText }}>
          <Search className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline opacity-50">Search</span>
        </button>

        <div className="w-px h-6 bg-white/10 mx-1" />

        {/* Pinned / Open windows */}
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {windows.map(win => {
            const app = apps.find(a => a.id === win.appId);
            return (
              <button key={win.id} onClick={() => win.minimized ? focusWindow(win.id) : minimizeWindow(win.id)}
                className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-all text-xs ${
                  !win.minimized ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
                style={{ color: currentTheme.taskbarText }}>
                <span className="text-sm">{app?.icon}</span>
                <span className="hidden sm:inline text-[10px] truncate max-w-[80px]">{app?.name}</span>
              </button>
            );
          })}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-1 px-1" style={{ color: currentTheme.taskbarText }}>
          {/* Notification bell */}
          <button onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); setControlOpen(false); setStartOpen(false); setSearchOpen(false); }}
            className="relative h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all">
            <Bell className="w-3.5 h-3.5 opacity-60" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-cyan-400 text-[7px] flex items-center justify-center text-black font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Control center toggle */}
          <button onClick={(e) => { e.stopPropagation(); setControlOpen(!controlOpen); setNotifOpen(false); setStartOpen(false); setSearchOpen(false); }}
            className="h-8 flex items-center gap-1.5 px-2 rounded-lg hover:bg-white/10 transition-all">
            <Wifi className={`w-3.5 h-3.5 ${wifiOn ? 'opacity-60' : 'opacity-20'}`} />
            <Volume2 className="w-3.5 h-3.5 opacity-60" />
            <Battery className="w-3.5 h-3.5 opacity-60" />
          </button>

          <div className="text-right ml-1">
            <p className="text-[10px] font-medium">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            <p className="text-[8px] opacity-50">{time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Desktop;
