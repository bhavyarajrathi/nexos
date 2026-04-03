import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Wifi, Activity } from 'lucide-react';

const TaskManager: React.FC = () => {
  const [cpu, setCpu] = useState(23);
  const [mem, setMem] = useState(42);
  const [net, setNet] = useState(15);

  useEffect(() => {
    const t = setInterval(() => {
      setCpu(p => Math.max(5, Math.min(95, p + (Math.random() - 0.5) * 10)));
      setMem(p => Math.max(20, Math.min(85, p + (Math.random() - 0.5) * 5)));
      setNet(p => Math.max(0, Math.min(100, p + (Math.random() - 0.5) * 20)));
    }, 1500);
    return () => clearInterval(t);
  }, []);

  const processes = [
    { name: 'nex-shell', cpu: 2.1, mem: 45 },
    { name: 'security-daemon', cpu: 0.5, mem: 22 },
    { name: 'ai-engine', cpu: 8.3, mem: 128 },
    { name: 'window-manager', cpu: 1.2, mem: 34 },
    { name: 'network-service', cpu: 0.8, mem: 18 },
    { name: 'file-system', cpu: 0.3, mem: 56 },
    { name: 'audio-server', cpu: 1.5, mem: 28 },
    { name: 'render-engine', cpu: 4.2, mem: 96 },
  ];

  return (
    <div className="p-4 space-y-4 text-xs">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'CPU', value: cpu, icon: Cpu, color: 'cyan' },
          { label: 'Memory', value: mem, icon: HardDrive, color: 'purple' },
          { label: 'Network', value: net, icon: Wifi, color: 'green' },
        ].map(m => (
          <div key={m.label} className="p-3 rounded-lg bg-white/5 space-y-2">
            <div className="flex items-center gap-1.5">
              <m.icon className="w-3.5 h-3.5 opacity-60" />
              <span className="opacity-60">{m.label}</span>
            </div>
            <p className="text-lg font-light">{Math.round(m.value)}%</p>
            <div className="w-full h-1 bg-white/10 rounded-full">
              <div className={`h-full rounded-full transition-all duration-500 bg-${m.color}-400`}
                style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <h3 className="font-semibold mb-2">Processes</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-4 py-1 opacity-40 text-[10px]">
            <span className="flex-1">Name</span>
            <span className="w-16 text-right">CPU %</span>
            <span className="w-16 text-right">MEM MB</span>
          </div>
          {processes.map(p => (
            <div key={p.name} className="flex items-center gap-4 py-1.5 px-2 rounded-lg hover:bg-white/5">
              <Activity className="w-3 h-3 opacity-40" />
              <span className="flex-1 font-mono">{p.name}</span>
              <span className="w-16 text-right opacity-60">{p.cpu}</span>
              <span className="w-16 text-right opacity-60">{p.mem}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
