import React, { useMemo } from 'react';
import { Cpu, HardDrive, Wifi, Activity, Sparkles, Zap } from 'lucide-react';
import { useOS } from '../OSContext';

const TaskManager: React.FC = () => {
  const { windows, aiInsights, systemTelemetry, openApp } = useOS();

  const metrics = [
    { label: 'CPU', value: systemTelemetry.cpu, icon: Cpu, barClass: 'bg-cyan-400' },
    { label: 'Memory', value: systemTelemetry.memory, icon: HardDrive, barClass: 'bg-purple-400' },
    { label: 'Network', value: systemTelemetry.network, icon: Wifi, barClass: 'bg-green-400' },
  ];

  const processes = useMemo(() => {
    const openProcesses = windows.map(window => {
      const activeWeight = window.minimized ? 0.45 : 1;
      const cpu = Number((1.1 + window.width / 340 + (window.maximized ? 1.2 : 0)) * activeWeight).toFixed(1);
      const mem = Math.round((window.width / 3.8 + window.height / 6.5) * activeWeight);

      return {
        name: window.appId,
        cpu,
        mem,
      };
    });

    return [
      { name: 'nex-shell', cpu: Number((systemTelemetry.cpu * 0.06).toFixed(1)), mem: Math.round(34 + systemTelemetry.backgroundLoad * 0.5) },
      { name: 'security-daemon', cpu: 0.6, mem: 24 },
      { name: 'ai-engine', cpu: Number((aiInsights.resourceAllocation.ai * 0.32).toFixed(1)), mem: Math.round(96 + aiInsights.topPicks.length * 12) },
      { name: 'window-manager', cpu: Number((systemTelemetry.activeWindows * 0.9 + 0.8).toFixed(1)), mem: Math.round(30 + systemTelemetry.activeWindows * 8) },
      { name: 'network-service', cpu: Number((systemTelemetry.network * 0.04).toFixed(1)), mem: Math.round(18 + systemTelemetry.network * 0.4) },
      ...openProcesses,
    ];
  }, [windows, systemTelemetry, aiInsights]);

  return (
    <div className="p-4 space-y-4 text-xs">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(m => (
          <div key={m.label} className="p-3 rounded-lg bg-white/5 space-y-2">
            <div className="flex items-center gap-1.5">
              <m.icon className="w-3.5 h-3.5 opacity-60" />
              <span className="opacity-60">{m.label}</span>
            </div>
            <p className="text-lg font-light">{Math.round(m.value)}%</p>
            <div className="w-full h-1 bg-white/10 rounded-full">
              <div className={`h-full rounded-full transition-all duration-500 ${m.barClass}`}
                style={{ width: `${m.value}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-white/5 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-40">
            <span>Automation Mode</span>
            <span>{aiInsights.automationMode}</span>
          </div>
          <p className="text-sm leading-relaxed opacity-80">{aiInsights.summary}</p>
        </div>
        <div className="p-3 rounded-lg bg-white/5 space-y-2">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider opacity-40">
            <span>Resource Allocation</span>
            <span>Live</span>
          </div>
          <div className="space-y-1.5">
            {Object.entries(aiInsights.resourceAllocation).map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-20 capitalize opacity-60">{label}</span>
                <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-400" style={{ width: `${value}%` }} />
                </div>
                <span className="w-8 text-right opacity-60">{value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Processes</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-4 py-1 opacity-40 text-[10px]">
            <span className="flex-1">Name</span>
            <span className="w-16 text-right">CPU %</span>
            <span className="w-16 text-right">MEM MB</span>
          </div>
          {processes.map((p, index) => (
            <div key={`${p.name}-${index}`} className="flex items-center gap-4 py-1.5 px-2 rounded-lg hover:bg-white/5">
              <Activity className="w-3 h-3 opacity-40" />
              <span className="flex-1 font-mono">{p.name}</span>
              <span className="w-16 text-right opacity-60">{p.cpu}</span>
              <span className="w-16 text-right opacity-60">{p.mem}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <h3 className="font-semibold mb-2">Predicted Interests</h3>
          <div className="space-y-2">
            {aiInsights.topPicks.map(item => (
              <button key={item.appId} onClick={() => openApp(item.appId)} className="w-full flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-left">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-[10px] opacity-50">{item.reason}</p>
                </div>
                <span className="text-[10px] opacity-50">{item.category}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Optimization Plan</h3>
          <div className="space-y-2">
            {aiInsights.optimizationPlan.map(step => (
              <div key={step.area} className="p-2 rounded-lg bg-white/5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{step.area}</p>
                  <Zap className="w-3 h-3 opacity-40" />
                </div>
                <p className="opacity-60">{step.action}</p>
                <p className="text-[10px] opacity-40 mt-1">{step.impact}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;
