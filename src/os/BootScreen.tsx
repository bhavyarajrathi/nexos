import React, { useEffect, useState } from 'react';
import { useOS } from './OSContext';
import { Shield } from 'lucide-react';

const bootMessages = [
  'Initializing kernel...',
  'Loading security modules...',
  'Mounting encrypted filesystem...',
  'Starting neural interface...',
  'Verifying system integrity...',
  'Loading drivers...',
  'Establishing secure connection...',
  'Initializing AI subsystem...',
  'System ready.',
];

const BootScreen: React.FC = () => {
  const { finishBoot } = useOS();
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(finishBoot, 400);
          return 100;
        }
        return p + 2;
      });
      setMsgIndex(i => Math.min(i + 1, bootMessages.length - 1));
    }, 120);
    return () => clearInterval(interval);
  }, [finishBoot]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999] select-none">
      <div className="flex items-center gap-3 mb-8 animate-pulse">
        <Shield className="w-12 h-12 text-cyan-400" />
        <span className="text-3xl font-bold tracking-widest text-cyan-400" style={{ fontFamily: 'monospace' }}>
          NexOS
        </span>
      </div>
      <div className="w-80 h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-100 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-cyan-300/70 text-xs font-mono h-4">{bootMessages[msgIndex]}</p>
      <p className="text-gray-600 text-xs mt-8 font-mono">v3.0.0 — Secure Boot Enabled</p>
    </div>
  );
};

export default BootScreen;
