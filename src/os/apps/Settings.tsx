import React, { useState } from 'react';
import { useOS } from '../OSContext';
import { Palette, Image, Lock, Shield, Monitor, Bell } from 'lucide-react';

type Tab = 'themes' | 'wallpapers' | 'security' | 'display' | 'about';

const Settings: React.FC = () => {
  const { currentTheme, setTheme, allThemes, currentWallpaper, setWallpaper, allWallpapers, setPassword, lock, securityLogs } = useOS();
  const [tab, setTab] = useState<Tab>('themes');
  const [newPw, setNewPw] = useState('');
  const [themeFilter, setThemeFilter] = useState('All');
  const [wallpaperFilter, setWallpaperFilter] = useState('All');

  const themeCategories = ['All', ...new Set(allThemes.map(t => t.category))];
  const wallpaperCategories = ['All', ...new Set(allWallpapers.map(w => w.category))];
  const filteredThemes = themeFilter === 'All' ? allThemes : allThemes.filter(t => t.category === themeFilter);
  const filteredWallpapers = wallpaperFilter === 'All' ? allWallpapers : allWallpapers.filter(w => w.category === wallpaperFilter);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'themes', label: 'Themes', icon: <Palette className="w-4 h-4" /> },
    { id: 'wallpapers', label: 'Wallpapers', icon: <Image className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'display', label: 'Display', icon: <Monitor className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="flex h-full">
      <div className="w-40 border-r border-white/10 p-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
              tab === t.id ? 'bg-white/10' : 'hover:bg-white/5'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'themes' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Themes ({allThemes.length})</h3>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {themeCategories.map(c => (
                <button key={c} onClick={() => setThemeFilter(c)}
                  className={`px-2.5 py-1 rounded-full text-[10px] transition-all ${
                    themeFilter === c ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 hover:bg-white/10'
                  }`}>{c}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredThemes.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={`p-2.5 rounded-lg border transition-all text-left ${
                    currentTheme.id === t.id ? 'border-cyan-400 ring-1 ring-cyan-400/30' : 'border-white/10 hover:border-white/20'
                  }`}>
                  <div className="flex gap-1 mb-1.5">
                    <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${t.primary})` }} />
                    <div className="w-4 h-4 rounded-full" style={{ background: `hsl(${t.accent})` }} />
                  </div>
                  <span className="text-[10px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === 'wallpapers' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Wallpapers ({allWallpapers.length})</h3>
            <div className="flex gap-1.5 mb-3 flex-wrap">
              {wallpaperCategories.map(c => (
                <button key={c} onClick={() => setWallpaperFilter(c)}
                  className={`px-2.5 py-1 rounded-full text-[10px] transition-all ${
                    wallpaperFilter === c ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 hover:bg-white/10'
                  }`}>{c}</button>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredWallpapers.map(w => (
                <button key={w.id} onClick={() => setWallpaper(w.id)}
                  className={`h-16 rounded-lg border transition-all ${
                    currentWallpaper.id === w.id ? 'border-cyan-400 ring-1 ring-cyan-400/30' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{ background: w.css }}>
                  <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded">{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {tab === 'security' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Security Settings</h3>
            <div className="space-y-2">
              <label className="text-xs opacity-60">Change Password</label>
              <div className="flex gap-2">
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                  placeholder="New password" className="flex-1 h-8 px-3 text-xs rounded-lg bg-white/5 border border-white/10 outline-none" />
                <button onClick={() => { if (newPw.length >= 4) { setPassword(newPw); setNewPw(''); } }}
                  className="px-3 h-8 text-xs rounded-lg bg-cyan-500/20 border border-cyan-400/30 hover:bg-cyan-500/30">
                  Update
                </button>
              </div>
              <p className="text-[10px] opacity-40">Minimum 4 characters</p>
            </div>
            <button onClick={lock}
              className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-red-500/15 border border-red-400/20 hover:bg-red-500/25">
              <Lock className="w-3.5 h-3.5" /> Lock System
            </button>
            <div>
              <h4 className="text-xs font-semibold mb-2">Security Log</h4>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {securityLogs.slice(-20).reverse().map(log => (
                  <div key={log.id} className="flex items-center gap-2 text-[10px] py-1 border-b border-white/5">
                    <span className="opacity-40 font-mono">{log.timestamp.toLocaleTimeString()}</span>
                    <span className={`px-1.5 py-0.5 rounded font-medium ${
                      log.action === 'FAILED_LOGIN' ? 'bg-red-500/20 text-red-300' : 'bg-white/5'
                    }`}>{log.action}</span>
                    <span className="opacity-60">{log.details}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === 'display' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Display Settings</h3>
            <p className="text-xs opacity-60">Current theme: {currentTheme.name}</p>
            <p className="text-xs opacity-60">Current wallpaper: {currentWallpaper.name}</p>
            <p className="text-xs opacity-60">Resolution: Adaptive (Responsive)</p>
          </div>
        )}
        {tab === 'about' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">About NOVA OS</h3>
            <div className="text-xs space-y-1 opacity-70">
              <p>Version: 3.0.0</p>
              <p>Kernel: SecureCore 6.1</p>
              <p>Architecture: Web-based Universal</p>
              <p>Security: AES-256 Encrypted Sessions</p>
              <p>AI Engine: Neural Processing v2</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
