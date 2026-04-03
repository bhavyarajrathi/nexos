import React, { useState } from 'react';
import { Folder, FileText, Image, Music, Video, ChevronRight, Home } from 'lucide-react';

interface FileItem {
  name: string;
  type: 'folder' | 'file' | 'image' | 'music' | 'video';
  children?: FileItem[];
}

const fileSystem: FileItem[] = [
  { name: 'Desktop', type: 'folder', children: [
    { name: 'readme.txt', type: 'file' },
    { name: 'screenshot.png', type: 'image' },
  ]},
  { name: 'Documents', type: 'folder', children: [
    { name: 'Resume.pdf', type: 'file' },
    { name: 'Projects', type: 'folder', children: [
      { name: 'project-plan.md', type: 'file' },
      { name: 'notes.txt', type: 'file' },
    ]},
    { name: 'Reports', type: 'folder', children: [
      { name: 'Q1-Report.pdf', type: 'file' },
      { name: 'Q2-Report.pdf', type: 'file' },
    ]},
  ]},
  { name: 'Downloads', type: 'folder', children: [
    { name: 'installer.exe', type: 'file' },
    { name: 'update-v3.zip', type: 'file' },
  ]},
  { name: 'Music', type: 'folder', children: [
    { name: 'track01.mp3', type: 'music' },
    { name: 'ambient-mix.mp3', type: 'music' },
  ]},
  { name: 'Pictures', type: 'folder', children: [
    { name: 'wallpaper.png', type: 'image' },
    { name: 'avatar.jpg', type: 'image' },
    { name: 'Photos', type: 'folder', children: [
      { name: 'vacation01.jpg', type: 'image' },
      { name: 'vacation02.jpg', type: 'image' },
    ]},
  ]},
  { name: 'Videos', type: 'folder', children: [
    { name: 'tutorial.mp4', type: 'video' },
    { name: 'demo.webm', type: 'video' },
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
  const [path, setPath] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const getCurrentItems = (): FileItem[] => {
    let items = fileSystem;
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

  const items = getCurrentItems();

  return (
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
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
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
              </div>
            );
          })}
        </div>
        {items.length === 0 && (
          <div className="flex items-center justify-center h-full opacity-40 text-sm">Empty folder</div>
        )}
      </div>
    </div>
  );
};

export default FileManager;
