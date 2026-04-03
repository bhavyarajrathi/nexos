import React, { useMemo, useState } from 'react';
import {
  Folder,
  FileText,
  Image,
  Music,
  Video,
  ChevronRight,
  Home,
  Sparkles,
  Brain,
  HardDrive,
  Trash2,
  Copy,
  WandSparkles,
  Clock3,
} from 'lucide-react';

interface FileItem {
  name: string;
  type: 'folder' | 'file' | 'image' | 'music' | 'video';
  sizeMB?: number;
  lastAccessDays?: number;
  duplicateKey?: string;
  children?: FileItem[];
}

const fileSystem: FileItem[] = [
  { name: 'Desktop', type: 'folder', children: [
    { name: 'readme.txt', type: 'file', sizeMB: 0.2, lastAccessDays: 1 },
    { name: 'screenshot.png', type: 'image', sizeMB: 2.8, lastAccessDays: 9 },
  ]},
  { name: 'Documents', type: 'folder', children: [
    { name: 'Resume.pdf', type: 'file', sizeMB: 1.2, lastAccessDays: 3 },
    { name: 'Projects', type: 'folder', children: [
      { name: 'project-plan.md', type: 'file', sizeMB: 0.4, lastAccessDays: 2 },
      { name: 'notes.txt', type: 'file', sizeMB: 0.1, lastAccessDays: 40 },
    ]},
    { name: 'Reports', type: 'folder', children: [
      { name: 'Q1-Report.pdf', type: 'file', sizeMB: 4.4, lastAccessDays: 18 },
      { name: 'Q2-Report.pdf', type: 'file', sizeMB: 4.6, lastAccessDays: 8 },
    ]},
  ]},
  { name: 'Downloads', type: 'folder', children: [
    { name: 'installer.exe', type: 'file', sizeMB: 210, lastAccessDays: 62 },
    { name: 'update-v3.zip', type: 'file', sizeMB: 160, lastAccessDays: 77 },
    { name: 'installer-copy.exe', type: 'file', sizeMB: 210, lastAccessDays: 62, duplicateKey: 'installer-exe' },
  ]},
  { name: 'Music', type: 'folder', children: [
    { name: 'track01.mp3', type: 'music', sizeMB: 6.5, lastAccessDays: 5 },
    { name: 'ambient-mix.mp3', type: 'music', sizeMB: 9.2, lastAccessDays: 39 },
  ]},
  { name: 'Pictures', type: 'folder', children: [
    { name: 'wallpaper.png', type: 'image', sizeMB: 7.4, lastAccessDays: 11 },
    { name: 'avatar.jpg', type: 'image', sizeMB: 1.8, lastAccessDays: 150 },
    { name: 'Photos', type: 'folder', children: [
      { name: 'vacation01.jpg', type: 'image', sizeMB: 3.1, lastAccessDays: 120 },
      { name: 'vacation02.jpg', type: 'image', sizeMB: 3.1, lastAccessDays: 120, duplicateKey: 'vacation-shot' },
    ]},
  ]},
  { name: 'Videos', type: 'folder', children: [
    { name: 'tutorial.mp4', type: 'video', sizeMB: 380, lastAccessDays: 4 },
    { name: 'demo.webm', type: 'video', sizeMB: 250, lastAccessDays: 33 },
  ]},
];

const iconMap = {
  folder: Folder,
  file: FileText,
  image: Image,
  music: Music,
  video: Video,
};

const FileManager: React.FC = () => {
  const [fsState, setFsState] = useState<FileItem[]>(fileSystem);
  const [path, setPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState('NexFiles AI is ready to optimize your storage footprint.');

  const getCurrentItems = (): FileItem[] => {
    let items = fsState;
    for (const p of path) {
      const folder = items.find(i => i.name === p && i.type === 'folder');
      items = folder?.children || [];
    }
    return items;
  };

  const navigate = (name: string) => {
    const item = getCurrentItems().find(i => i.name === name);
    if (item?.type === 'folder') {
      setPath(prev => [...prev, name]);
      setSelected(null);
    }
  };

  const flattenFiles = (items: FileItem[], basePath = ''): Array<FileItem & { path: string }> => {
    const flat: Array<FileItem & { path: string }> = [];
    for (const item of items) {
      const fullPath = basePath ? `${basePath}/${item.name}` : item.name;
      if (item.type === 'folder' && item.children) {
        flat.push(...flattenFiles(item.children, fullPath));
      } else {
        flat.push({ ...item, path: fullPath });
      }
    }
    return flat;
  };

  const allFiles = useMemo(() => flattenFiles(fsState), [fsState]);

  const storageStats = useMemo(() => {
    const totalUsed = allFiles.reduce((sum, file) => sum + (file.sizeMB || 0), 0);
    const largeFiles = allFiles.filter(file => (file.sizeMB || 0) >= 100);
    const staleFiles = allFiles.filter(file => (file.lastAccessDays || 0) >= 60);

    const duplicateGroups = new Map<string, Array<FileItem & { path: string }>>();
    allFiles.forEach(file => {
      if (!file.duplicateKey) return;
      const group = duplicateGroups.get(file.duplicateKey) || [];
      group.push(file);
      duplicateGroups.set(file.duplicateKey, group);
    });

    const duplicateCandidates = Array.from(duplicateGroups.values()).filter(group => group.length > 1);
    const duplicateWaste = duplicateCandidates.reduce((sum, group) => {
      const eachSize = group[0].sizeMB || 0;
      return sum + eachSize * (group.length - 1);
    }, 0);

    return {
      totalUsed,
      largeFiles,
      staleFiles,
      duplicateCandidates,
      duplicateWaste,
    };
  }, [allFiles]);

  const optimizeDownloads = () => {
    setFsState(prev => prev.map(item => {
      if (item.name !== 'Downloads' || !item.children) return item;
      const filtered = item.children.filter(child => (child.lastAccessDays || 0) < 60);
      return { ...item, children: filtered };
    }));
    setAiMessage('NexFiles AI removed stale installers from Downloads and reclaimed fast-access space.');
    setSelected(null);
  };

  const removeDuplicates = () => {
    const seen = new Set<string>();
    const dedupe = (items: FileItem[]): FileItem[] => {
      return items.flatMap(item => {
        if (item.type === 'folder' && item.children) {
          return [{ ...item, children: dedupe(item.children) }];
        }
        if (!item.duplicateKey) return [item];
        if (seen.has(item.duplicateKey)) return [];
        seen.add(item.duplicateKey);
        return [item];
      });
    };

    setFsState(prev => dedupe(prev));
    setAiMessage('Duplicate files were consolidated. NexFiles now keeps only one trusted copy per duplicate set.');
    setSelected(null);
  };

  const organizeByType = () => {
    const current = getCurrentItems();
    const sorted = [...current].sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      return a.type.localeCompare(b.type) || a.name.localeCompare(b.name);
    });

    const rewrite = (items: FileItem[], level = 0): FileItem[] => {
      if (level === path.length) {
        return sorted.map(item => item.type === 'folder' && item.children
          ? { ...item, children: rewrite(item.children, level + 1) }
          : item
        );
      }

      const segment = path[level];
      return items.map(item => {
        if (item.name !== segment || item.type !== 'folder' || !item.children) return item;
        return { ...item, children: rewrite(item.children, level + 1) };
      });
    };

    setFsState(prev => rewrite(prev));
    setAiMessage(`NexFiles AI reorganized ${path.length ? path[path.length - 1] : 'Home'} by type priority.`);
  };

  const items = getCurrentItems();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-full">
      <aside className="border-b lg:border-b-0 lg:border-r border-white/10 p-3 space-y-3 bg-black/20">
        <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-3">
          <div className="flex items-center gap-2 text-violet-100">
            <Brain className="w-4 h-4" />
            <p className="text-xs uppercase tracking-[0.25em]">NexFiles AI</p>
          </div>
          <p className="text-xs text-violet-100/80 mt-2 leading-relaxed">{aiMessage}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.22em] text-white/70">Storage</p>
            <HardDrive className="w-4 h-4 text-cyan-300/80" />
          </div>
          <p className="text-lg font-semibold text-white">{storageStats.totalUsed.toFixed(1)} MB</p>
          <p className="text-[11px] text-white/60">Potential reclaim: {storageStats.duplicateWaste.toFixed(1)} MB</p>
        </div>

        <div className="space-y-2">
          <button onClick={optimizeDownloads} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs">
            <span className="inline-flex items-center gap-2"><Trash2 className="w-3.5 h-3.5 text-rose-300" /> Cleanup Downloads</span>
            <span className="text-white/60">{storageStats.staleFiles.length}</span>
          </button>
          <button onClick={removeDuplicates} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs">
            <span className="inline-flex items-center gap-2"><Copy className="w-3.5 h-3.5 text-amber-300" /> Deduplicate Files</span>
            <span className="text-white/60">{storageStats.duplicateCandidates.length}</span>
          </button>
          <button onClick={organizeByType} className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-xs">
            <span className="inline-flex items-center gap-2"><WandSparkles className="w-3.5 h-3.5 text-emerald-300" /> Organize by Type</span>
            <span className="text-white/60">Current folder</span>
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/75 space-y-2">
          <p className="inline-flex items-center gap-2"><Sparkles className="w-3.5 h-3.5 text-cyan-300" /> AI Insights</p>
          <p>Large files: <span className="text-white">{storageStats.largeFiles.length}</span></p>
          <p>Stale files: <span className="text-white">{storageStats.staleFiles.length}</span></p>
          <p>Duplicate groups: <span className="text-white">{storageStats.duplicateCandidates.length}</span></p>
        </div>
      </aside>

      <div className="flex flex-col h-full">
        <div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 text-xs">
          <button onClick={() => { setPath([]); setSelected(null); }} className="p-1 rounded hover:bg-white/10">
            <Home className="w-3.5 h-3.5" />
          </button>
          {path.map((p, i) => (
            <React.Fragment key={i}>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <button onClick={() => { setPath(prev => prev.slice(0, i + 1)); setSelected(null); }}
                className="hover:text-cyan-400 transition-colors">{p}</button>
            </React.Fragment>
          ))}
          {path.length === 0 && <><ChevronRight className="w-3 h-3 opacity-40" /><span>Home</span></>}
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
            {items.map(item => {
              const Icon = iconMap[item.type];
              return (
                <div key={item.name}
                  onClick={() => setSelected(item.name)}
                  onDoubleClick={() => navigate(item.name)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer transition-all ${
                    selected === item.name ? 'bg-cyan-500/20 ring-1 ring-cyan-400/30' : 'hover:bg-white/5'
                  }`}>
                  <Icon className={`w-8 h-8 ${item.type === 'folder' ? 'text-yellow-400/80' : 'opacity-60'}`} />
                  <span className="text-[10px] text-center truncate w-full">{item.name}</span>
                  {item.type !== 'folder' && (
                    <span className="text-[10px] text-white/40">{(item.sizeMB || 0).toFixed(1)} MB</span>
                  )}
                  {item.type !== 'folder' && (item.lastAccessDays || 0) > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-white/35">
                      <Clock3 className="w-2.5 h-2.5" /> {item.lastAccessDays}d
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {items.length === 0 && (
            <div className="flex items-center justify-center h-full opacity-40 text-sm">Empty folder</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileManager;
