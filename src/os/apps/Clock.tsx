import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Timer, AlarmClock, Plus, Play, Pause, RotateCcw } from 'lucide-react';

type Tab = 'clock' | 'stopwatch' | 'timer';

const worldClocks = [
  { city: 'New York', tz: 'America/New_York' },
  { city: 'London', tz: 'Europe/London' },
  { city: 'Tokyo', tz: 'Asia/Tokyo' },
  { city: 'Sydney', tz: 'Australia/Sydney' },
  { city: 'Dubai', tz: 'Asia/Dubai' },
];

const ClockApp: React.FC = () => {
  const [tab, setTab] = useState<Tab>('clock');
  const [time, setTime] = useState(new Date());
  const [swRunning, setSwRunning] = useState(false);
  const [swTime, setSwTime] = useState(0);
  const [timerSec, setTimerSec] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!swRunning) return;
    const t = setInterval(() => setSwTime(p => p + 10), 10);
    return () => clearInterval(t);
  }, [swRunning]);

  useEffect(() => {
    if (!timerRunning || timerSec <= 0) return;
    const t = setInterval(() => setTimerSec(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, [timerRunning, timerSec]);

  const formatSw = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-white/10">
        {([['clock', ClockIcon, 'Clock'], ['stopwatch', Timer, 'Stopwatch'], ['timer', AlarmClock, 'Timer']] as const).map(([id, Icon, label]) => (
          <button key={id} onClick={() => setTab(id as Tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs transition-all ${
              tab === id ? 'bg-white/10 border-b-2 border-cyan-400' : 'hover:bg-white/5'
            }`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {tab === 'clock' && (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-light font-mono">{time.toLocaleTimeString()}</p>
              <p className="text-sm opacity-50 mt-1">{time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-xs font-semibold opacity-60">World Clocks</h4>
              {worldClocks.map(c => (
                <div key={c.city} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-white/5 text-xs">
                  <span>{c.city}</span>
                  <span className="font-mono opacity-70">
                    {new Date().toLocaleTimeString('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 'stopwatch' && (
          <div className="flex flex-col items-center gap-4 pt-8">
            <p className="text-4xl font-mono font-light">{formatSw(swTime)}</p>
            <div className="flex gap-3">
              <button onClick={() => setSwRunning(!swRunning)}
                className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/30">
                {swRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={() => { setSwRunning(false); setSwTime(0); }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15">
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        {tab === 'timer' && (
          <div className="flex flex-col items-center gap-4 pt-8">
            <p className={`text-4xl font-mono font-light ${timerSec === 0 ? 'text-red-400 animate-pulse' : ''}`}>
              {formatTimer(timerSec)}
            </p>
            <div className="flex gap-2">
              {[60, 300, 600, 1800].map(s => (
                <button key={s} onClick={() => { setTimerSec(s); setTimerRunning(false); }}
                  className="px-3 py-1 text-[10px] rounded-full bg-white/5 hover:bg-white/10">
                  {s < 60 ? `${s}s` : `${s / 60}m`}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setTimerRunning(!timerRunning)}
                className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/30">
                {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={() => { setTimerRunning(false); setTimerSec(300); }}
                className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15">
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClockApp;
