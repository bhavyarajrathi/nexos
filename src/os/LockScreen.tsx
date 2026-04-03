import React, { useState, useEffect } from 'react';
import { useOS } from './OSContext';
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const LockScreen: React.FC = () => {
  const { unlock, failedAttempts } = useOS();
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);
  const [time, setTime] = useState(new Date());
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (failedAttempts >= 5) {
      setLocked(true);
      const t = setTimeout(() => setLocked(false), 30000);
      return () => clearTimeout(t);
    }
  }, [failedAttempts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    if (!unlock(pin)) {
      setError(true);
      setPin('');
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center select-none"
      style={{ background: 'linear-gradient(135deg, #0c0d13 0%, #1a1a2e 50%, #16213e 100%)' }}>
      <div className="absolute inset-0 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <p className="text-white/60 text-sm font-mono">
          {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <p className="text-white text-6xl font-light tracking-wide">
          {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-md">
            <Shield className="w-8 h-8 text-cyan-400" />
          </div>
          <p className="text-white/80 text-sm">NOVA OS</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center gap-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="Enter password"
              disabled={locked}
              className={`w-64 h-10 pl-9 pr-10 rounded-lg bg-white/10 border text-white text-sm placeholder:text-white/30 outline-none backdrop-blur-md transition-all ${
                error ? 'border-red-500 animate-shake' : 'border-white/20 focus:border-cyan-400/50'
              }`}
              autoFocus
            />
            <button type="button" onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60">
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {error && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Incorrect password
            </p>
          )}
          {locked && (
            <p className="text-yellow-400 text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Too many attempts. Wait 30s.
            </p>
          )}
          {failedAttempts > 0 && failedAttempts < 5 && !error && (
            <p className="text-yellow-400/60 text-xs">{5 - failedAttempts} attempts remaining</p>
          )}
          <button type="submit" disabled={locked || !pin}
            className="w-64 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-sm hover:bg-cyan-500/30 transition-all disabled:opacity-40">
            Unlock
          </button>
        </form>
        <p className="text-white/20 text-xs mt-8 font-mono">Default password: 1234</p>
      </div>
    </div>
  );
};

export default LockScreen;
