import React, { useState } from 'react';
import { Camera as CameraIcon, Video, FlipHorizontal, SwitchCamera, Image } from 'lucide-react';

const Camera: React.FC = () => {
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [flash, setFlash] = useState(false);

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-full h-full bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-center space-y-2">
            <CameraIcon className="w-16 h-16 mx-auto opacity-20" />
            <p className="text-xs opacity-30">Camera preview</p>
            <p className="text-[10px] opacity-20">Camera access requires HTTPS</p>
          </div>
        </div>
        <div className="absolute top-3 right-3 flex gap-2">
          <button className={`p-2 rounded-full ${flash ? 'bg-yellow-400/20' : 'bg-white/10'}`}
            onClick={() => setFlash(!flash)}>
            <span className="text-[10px]">⚡</span>
          </button>
          <button className="p-2 rounded-full bg-white/10">
            <SwitchCamera className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 flex items-center justify-center gap-6">
        <button className="p-2 rounded-full bg-white/10">
          <Image className="w-5 h-5" />
        </button>
        <button className="w-14 h-14 rounded-full border-4 border-white/60 flex items-center justify-center hover:scale-105 transition-transform">
          <div className={`rounded-full ${mode === 'photo' ? 'w-10 h-10 bg-white' : 'w-8 h-8 bg-red-500 rounded-lg'}`} />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setMode('photo')}
            className={`px-3 py-1 rounded-full text-[10px] ${mode === 'photo' ? 'bg-white/20' : 'bg-white/5'}`}>
            Photo
          </button>
          <button onClick={() => setMode('video')}
            className={`px-3 py-1 rounded-full text-[10px] ${mode === 'video' ? 'bg-white/20' : 'bg-white/5'}`}>
            Video
          </button>
        </div>
      </div>
    </div>
  );
};

export default Camera;
