import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Maximize, Volume2 } from 'lucide-react';

const videos = [
  { id: '1', title: 'NexOS Introduction', duration: '3:24', thumb: 'linear-gradient(135deg, #1a1a3e, #4a0e4a)' },
  { id: '2', title: 'Getting Started Guide', duration: '5:12', thumb: 'linear-gradient(135deg, #0a2a4a, #1a4a6a)' },
  { id: '3', title: 'Theme Customization', duration: '2:45', thumb: 'linear-gradient(135deg, #2a0a3a, #5a1a6a)' },
  { id: '4', title: 'Security Features', duration: '4:30', thumb: 'linear-gradient(135deg, #0a3a2a, #1a5a3a)' },
  { id: '5', title: 'AI Assistant Demo', duration: '6:18', thumb: 'linear-gradient(135deg, #3a2a0a, #6a4a1a)' },
];

const VideoPlayer: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center relative" style={{ background: videos[current].thumb }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={() => setPlaying(!playing)}
            className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition-all">
            {playing ? <Pause className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white ml-1" />}
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="w-full h-1 bg-white/20 rounded-full cursor-pointer mb-2"
            onClick={e => { const r = e.currentTarget.getBoundingClientRect(); setProgress((e.clientX - r.left) / r.width * 100); }}>
            <div className="h-full bg-cyan-400 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex items-center justify-between text-white text-[10px]">
            <div className="flex items-center gap-3">
              <SkipBack className="w-4 h-4 cursor-pointer" onClick={() => setCurrent(p => (p - 1 + videos.length) % videos.length)} />
              <button onClick={() => setPlaying(!playing)}>
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <SkipForward className="w-4 h-4 cursor-pointer" onClick={() => setCurrent(p => (p + 1) % videos.length)} />
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5" />
              <Maximize className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
      <div className="h-32 overflow-y-auto border-t border-white/10">
        {videos.map((v, i) => (
          <div key={v.id} onClick={() => { setCurrent(i); setPlaying(true); setProgress(0); }}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer text-xs ${
              current === i ? 'bg-white/10' : 'hover:bg-white/5'
            }`}>
            <div className="w-12 h-8 rounded" style={{ background: v.thumb }} />
            <div className="flex-1">
              <p className="font-medium truncate">{v.title}</p>
              <p className="text-[10px] opacity-40">{v.duration}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoPlayer;
