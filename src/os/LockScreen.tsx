import React, { useState, useEffect } from 'react';
import { useOS } from './OSContext';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Sparkles, Cpu, ShieldCheck } from 'lucide-react';

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
    <div className="auth-screen-shell fixed inset-0 z-[9998] select-none overflow-hidden">
      <div className="auth-screen-grid">
        <section className="auth-hero">
          <div className="auth-brand-mark">
            <img src="/boot/nexos-logo.png" alt="NexOS logo" />
          </div>
          <div className="auth-hero-copy">
            <p className="auth-kicker">AI-driven desktop environment</p>
            <h1 className="auth-title">Welcome back.</h1>
            <p className="auth-description">
              Secure access, adaptive workflows, and a workspace designed to feel intelligent rather than decorative.
            </p>
          </div>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <Sparkles className="w-4 h-4" />
              <span>Predictive assistance</span>
            </div>
            <div className="auth-feature-item">
              <Cpu className="w-4 h-4" />
              <span>Context-aware system state</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheck className="w-4 h-4" />
              <span>Encrypted session resume</span>
            </div>
          </div>
        </section>

        <section className="auth-panel" aria-label="Unlock NexOS">
          <div className="auth-panel-topline">
            <div>
              <p className="auth-panel-label">NexOS Access</p>
              <p className="auth-panel-time">
                {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="auth-time-badge">
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
          </div>

          <div className="auth-identity">
            <div className="auth-identity-avatar">
              <Shield className="w-7 h-7 text-violet-200" />
            </div>
            <div>
              <p className="auth-identity-name">NexOS Secure Session</p>
              <p className="auth-identity-subtitle">AI-assisted workspace authentication</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <label className="auth-input-shell">
              <Lock className="auth-input-icon" />
              <input
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Enter password"
                disabled={locked}
                className={`auth-input ${error ? 'auth-input--error' : ''}`}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="auth-visibility-toggle"
                aria-label={showPin ? 'Hide password' : 'Show password'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </label>

            {error && (
              <p className="auth-feedback auth-feedback--error">
                <AlertTriangle className="w-3.5 h-3.5" /> Incorrect password
              </p>
            )}
            {locked && (
              <p className="auth-feedback auth-feedback--warning">
                <AlertTriangle className="w-3.5 h-3.5" /> Too many attempts. Wait 30s.
              </p>
            )}
            {failedAttempts > 0 && failedAttempts < 5 && !error && (
              <p className="auth-feedback auth-feedback--muted">{5 - failedAttempts} attempts remaining</p>
            )}

            <button type="submit" disabled={locked || !pin} className="auth-submit">
              Unlock NexOS
            </button>
          </form>

          <p className="auth-footnote">Default password: 1234</p>
        </section>
      </div>
    </div>
  );
};

export default LockScreen;
