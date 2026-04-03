import React, { useEffect, useRef, useState } from 'react';
import { useOS } from './OSContext';

const bootStates = [
  'Loading',
  'Ultra-Light',
  'Cross-Compatible',
  'Secure',
  'AI-Driven',
];

const bootDurationMs = 8000;

const BootScreen: React.FC = () => {
  const { finishBoot } = useOS();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const statusTimer = window.setInterval(() => {
      setStatusIndex(index => Math.min(index + 1, bootStates.length - 1));
    }, 1000);

    const completionTimer = window.setTimeout(async () => {
      const audio = audioRef.current;

      if (audio) {
        audio.currentTime = 0;
        audio.muted = false;
        audio.volume = 0.25;

        try {
          await audio.play();
        } catch {
          // Browsers may block autoplay; the boot animation still completes.
        }
      }

      finishBoot();
    }, bootDurationMs);

    return () => {
      window.clearInterval(statusTimer);
      window.clearTimeout(completionTimer);
    };
  }, [finishBoot]);

  return (
    <div className="boot-screen-shell fixed inset-0 z-[9999] select-none overflow-hidden">
      <div className="boot-screen-scene">
        <div className="boot-logo">
          <img src="/boot/nexos-logo.png" alt="NexOS logo" />
        </div>
      </div>

      <div className="boot-ui">
        <div className="boot-copy">
          <div className="boot-label">NexOS System Boot</div>
          <div className="boot-status" key={statusIndex} aria-live="polite">
            {bootStates[statusIndex]}
          </div>
        </div>

        <audio
          ref={audioRef}
          src="/boot/boot-complete.mp3"
          preload="auto"
          playsInline
          muted
        />

        <div className="boot-loader-wrap">
          <div className="boot-loader-track">
            <div className="boot-loader-fill" />
            <div className="boot-loader-shine" />
          </div>
          <div className="boot-loader-meta">
            <span className="boot-loader-meta__booting">Booting</span>
          </div>
        </div>

        <p className="boot-footer">v3.0.0 — Secure Boot Enabled</p>
      </div>
    </div>
  );
};

export default BootScreen;
