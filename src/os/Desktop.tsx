import React, { useState, useEffect } from 'react';
import { useOS } from './OSContext';
import { apps } from './appRegistry';
import Window from './Window';
import { Search, Lock, Wifi, Volume2, Battery, ChevronUp } from 'lucide-react';

const Desktop: React.FC = () => {
  const { windows, openApp, currentWallpaper, currentTheme, lock, minimizeWindow, focusWindow } = useOS();
  const [time, setTime] = useState(new Date());
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startOpen, setStartOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filteredApps = searchQuery
    ? apps.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : apps;

  return (
    <div className="fixed inset-0 select-none overflow-hidden" style={{ background: currentWallpaper.css }}>
      {/* Desktop Icons */}
      <div className="absolute inset-0 bottom-12 p-4 overflow-y-auto">
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 auto-rows-max">
          {apps.map(app => (
            <button key={app.id} onDoubleClick={() => openApp(app.id)}
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
                <button key={app.id} onClick={() => { openApp(app.id); setSearchOpen(false); setSearchQuery(''); }}
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

      {/* Backdrop for search/start */}
      {(searchOpen || startOpen) && (
        <div className="absolute inset-0 z-[8999]" onClick={() => { setSearchOpen(false); setStartOpen(false); setSearchQuery(''); }} />
      )}

      {/* Start Menu */}
      {startOpen && (
        <div className="absolute bottom-12 left-2 w-72 z-[9000] rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl"
          style={{ background: currentTheme.windowBg, border: `1px solid ${currentTheme.windowBorder}` }}
          onClick={e => e.stopPropagation()}>
          <div className="p-3 border-b" style={{ borderColor: currentTheme.windowBorder }}>
            <p className="text-xs font-semibold" style={{ color: currentTheme.taskbarText }}>NOVA OS</p>
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
        <button onClick={() => { setStartOpen(!startOpen); setSearchOpen(false); }}
          className="h-8 px-3 rounded-lg flex items-center gap-1.5 hover:bg-white/10 transition-all"
          style={{ color: currentTheme.taskbarText }}>
          <ChevronUp className="w-4 h-4" />
          <span className="text-xs font-medium hidden sm:inline">Start</span>
        </button>

        {/* Search */}
        <button onClick={() => { setSearchOpen(!searchOpen); setStartOpen(false); }}
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
        <div className="flex items-center gap-2 px-2" style={{ color: currentTheme.taskbarText }}>
          <Wifi className="w-3.5 h-3.5 opacity-60" />
          <Volume2 className="w-3.5 h-3.5 opacity-60" />
          <Battery className="w-3.5 h-3.5 opacity-60" />
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
