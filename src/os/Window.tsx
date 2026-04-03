import React, { useRef, useCallback } from 'react';
import { useOS } from './OSContext';
import { X, Minus, Maximize2, Minimize2 } from 'lucide-react';
import { OSWindow } from './types';

interface Props {
  window: OSWindow;
  children: React.ReactNode;
  title: string;
}

const Window: React.FC<Props> = ({ window: win, children, title }) => {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, currentTheme } = useOS();
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    focusWindow(win.id);
    dragRef.current = { startX: e.clientX, startY: e.clientY, winX: win.x, winY: win.y };
    const handleMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      moveWindow(win.id, dragRef.current.winX + (ev.clientX - dragRef.current.startX), dragRef.current.winY + (ev.clientY - dragRef.current.startY));
    };
    const handleUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
  }, [win.id, win.x, win.y, focusWindow, moveWindow]);

  if (win.minimized) return null;

  const style: React.CSSProperties = win.maximized
    ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 48, zIndex: win.zIndex, background: currentTheme.windowBg, borderColor: currentTheme.windowBorder }
    : { position: 'absolute', left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex, background: currentTheme.windowBg, borderColor: currentTheme.windowBorder };

  return (
    <div style={style} className="flex flex-col rounded-lg overflow-hidden shadow-2xl border"
      onClick={() => focusWindow(win.id)}>
      <div className="flex items-center h-9 px-3 shrink-0 cursor-move select-none"
        onMouseDown={handleMouseDown}
        style={{ background: 'rgba(255,255,255,0.05)', borderBottom: `1px solid ${currentTheme.windowBorder}` }}>
        <span className="text-xs font-medium flex-1 truncate" style={{ color: currentTheme.taskbarText }}>{title}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => minimizeWindow(win.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
            <Minus className="w-3 h-3" style={{ color: currentTheme.taskbarText }} />
          </button>
          <button onClick={() => maximizeWindow(win.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
            {win.maximized ? <Minimize2 className="w-3 h-3" style={{ color: currentTheme.taskbarText }} /> : <Maximize2 className="w-3 h-3" style={{ color: currentTheme.taskbarText }} />}
          </button>
          <button onClick={() => closeWindow(win.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/30">
            <X className="w-3 h-3" style={{ color: currentTheme.taskbarText }} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto" style={{ color: currentTheme.taskbarText }}>{children}</div>
    </div>
  );
};

export default Window;
