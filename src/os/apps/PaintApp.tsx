import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Palette, Eraser, Square, Circle, Minus, Download } from 'lucide-react';

const colors = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#000000'];
const sizes = [2, 4, 8, 16];

const PaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState('#ffffff');
  const [size, setSize] = useState(4);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [drawing, setDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const draw = useCallback((e: React.MouseEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#1a1a2e' : color;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (lastPos.current) {
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
    lastPos.current = pos;
  }, [drawing, color, size, tool]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-wrap">
        <div className="flex gap-1">
          <button onClick={() => setTool('brush')}
            className={`p-1.5 rounded ${tool === 'brush' ? 'bg-white/15' : 'hover:bg-white/5'}`}>
            <Palette className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setTool('eraser')}
            className={`p-1.5 rounded ${tool === 'eraser' ? 'bg-white/15' : 'hover:bg-white/5'}`}>
            <Eraser className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex gap-1">
          {colors.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-5 h-5 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent'}`}
              style={{ background: c }} />
          ))}
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex gap-1">
          {sizes.map(s => (
            <button key={s} onClick={() => setSize(s)}
              className={`w-6 h-6 rounded flex items-center justify-center ${size === s ? 'bg-white/15' : 'hover:bg-white/5'}`}>
              <div className="rounded-full bg-white" style={{ width: s, height: s }} />
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10" />
        <button onClick={clearCanvas} className="p-1.5 rounded hover:bg-white/5 text-[10px]">Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-crosshair"
        onMouseDown={(e) => { setDrawing(true); lastPos.current = getPos(e); }}
        onMouseMove={draw}
        onMouseUp={() => { setDrawing(false); lastPos.current = null; }}
        onMouseLeave={() => { setDrawing(false); lastPos.current = null; }}
      />
    </div>
  );
};

export default PaintApp;
