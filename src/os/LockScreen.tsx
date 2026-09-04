import React, { useState, useEffect } from 'react';
import { useOS } from './OSContext';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, Sparkles, Cpu, ShieldCheck, User, KeyRound } from 'lucide-react';

const LockScreen: React.FC = () => {
  const { unlock, recoverAdminPassword, failedAttempts } = useOS();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [recoveryConfirm, setRecoveryConfirm] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState<string | null>(null);
  const [recovering, setRecovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setSubmitting(true);
    const success = await unlock(username, password);
    setSubmitting(false);
    if (!success) {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 1500);
    }
  };

  const handleAdminRecovery = async () => {
    setRecoveryStatus(null);

    if (username.trim().toLowerCase() !== 'admin') {
      setRecoveryStatus('Recovery is restricted to admin account only. Set username to admin first.');
      return;
    }

    if (recoveryPassword !== recoveryConfirm) {
      setRecoveryStatus('Passwords do not match.');
      return;
    }

    setRecovering(true);
    const success = await recoverAdminPassword(recoveryPassword);
    setRecovering(false);

    if (success) {
      setRecoveryStatus('Admin password updated. You can now log in with the new password.');
      setPassword('');
      setRecoveryPassword('');
      setRecoveryConfirm('');
      return;
    }

    setRecoveryStatus('Recovery failed. This flow may be disabled by server policy.');
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
              <User className="auth-input-icon" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={locked}
                className="auth-input"
                autoFocus
              />
            </label>

            <label className="auth-input-shell">
              <Lock className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={locked}
                className={`auth-input ${error ? 'auth-input--error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-visibility-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </label>

            {error && (
              <p className="auth-feedback auth-feedback--error">
                <AlertTriangle className="w-3.5 h-3.5" /> Invalid username or password
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

            <button type="submit" disabled={locked || submitting || !username || !password} className="auth-submit">
              Unlock NexOS
            </button>

            <button
              type="button"
              onClick={() => {
                setRecoverOpen(open => !open);
                setRecoveryStatus(null);
              }}
              className="w-full h-9 rounded-lg border border-amber-300/35 bg-amber-500/12 hover:bg-amber-500/20 transition-all text-[12px] font-medium text-amber-100 inline-flex items-center justify-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              Forgot Password (Admin Recovery)
            </button>

            {recoverOpen && (
              <div className="rounded-xl border border-red-300/20 bg-red-950/20 p-3 space-y-2">
                <p className="text-[11px] text-red-200 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  Administrator use only. This is a high-security bypass intended only for prototype recovery scenarios.
                </p>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={recoveryPassword}
                    onChange={e => setRecoveryPassword(e.target.value)}
                    placeholder="New admin password"
                    className="auth-input"
                  />
                  <input
                    type="password"
                    value={recoveryConfirm}
                    onChange={e => setRecoveryConfirm(e.target.value)}
                    placeholder="Confirm new admin password"
                    className="auth-input"
                  />
                  <button
                    type="button"
                    onClick={() => { void handleAdminRecovery(); }}
                    disabled={recovering || !recoveryPassword || !recoveryConfirm}
                    className="auth-submit"
                  >
                    {recovering ? 'Updating...' : 'Reset Admin Password'}
                  </button>
                </div>
                {recoveryStatus && (
                  <p className={`text-[11px] ${recoveryStatus.includes('updated') ? 'text-emerald-300' : 'text-red-200'}`}>
                    {recoveryStatus}
                  </p>
                )}
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default LockScreen;
