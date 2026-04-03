import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Music } from 'lucide-react';

const tracks = [
  { id: 1, title: 'Digital Dreams', artist: 'Synthwave', duration: '3:42' },
  { id: 2, title: 'Neon Lights', artist: 'CyberPunk', duration: '4:15' },
  { id: 3, title: 'Ocean Waves', artist: 'Ambient', duration: '5:30' },
  { id: 4, title: 'Midnight Drive', artist: 'Retrowave', duration: '3:58' },
  { id: 5, title: 'Star Field', artist: 'Space Ambient', duration: '6:12' },
  { id: 6, title: 'Rain on Glass', artist: 'Lo-Fi', duration: '4:45' },
  { id: 7, title: 'Electric Pulse', artist: 'Techno', duration: '3:20' },
  { id: 8, title: 'Morning Light', artist: 'Chillout', duration: '5:08' },
];

const MusicPlayer: React.FC = () => {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(35);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3">
        <h3 className="text-xs font-semibold mb-2 opacity-60">Playlist</h3>
        {tracks.map((t, i) => (
          <div key={t.id} onClick={() => { setCurrent(i); setPlaying(true); }}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all text-xs ${
              current === i ? 'bg-cyan-500/15' : 'hover:bg-white/5'
            }`}>
            <Music className={`w-3.5 h-3.5 ${current === i ? 'text-cyan-400' : 'opacity-40'}`} />
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{t.title}</p>
              <p className="truncate opacity-50 text-[10px]">{t.artist}</p>
            </div>
            <span className="opacity-40 text-[10px]">{t.duration}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 p-3 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center">
            <Music className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{tracks[current].title}</p>
            <p className="text-[10px] opacity-50 truncate">{tracks[current].artist}</p>
          </div>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full cursor-pointer" onClick={e => {
          const rect = e.currentTarget.getBoundingClientRect();
          setProgress((e.clientX - rect.left) / rect.width * 100);
        }}>
          <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center justify-center gap-4">
          <Shuffle className="w-3.5 h-3.5 opacity-40 cursor-pointer hover:opacity-80" />
          <SkipBack className="w-4 h-4 cursor-pointer hover:opacity-80" onClick={() => setCurrent(p => (p - 1 + tracks.length) % tracks.length)} />
          <button onClick={() => setPlaying(!playing)}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-all">
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <SkipForward className="w-4 h-4 cursor-pointer hover:opacity-80" onClick={() => setCurrent(p => (p + 1) % tracks.length)} />
          <Repeat className="w-3.5 h-3.5 opacity-40 cursor-pointer hover:opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
