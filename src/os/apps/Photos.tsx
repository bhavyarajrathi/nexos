import React, { useState } from 'react';
import { Image, Grid, LayoutGrid } from 'lucide-react';

const samplePhotos = Array.from({ length: 24 }, (_, i) => ({
  id: `photo-${i}`,
  color: `hsl(${(i * 15) % 360}, 60%, ${30 + (i % 3) * 10}%)`,
  label: `Photo ${i + 1}`,
}));

const Photos: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [cols, setCols] = useState(4);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-xs font-medium opacity-60">Gallery ({samplePhotos.length})</span>
        <div className="flex gap-1">
          <button onClick={() => setCols(3)} className={`p-1 rounded ${cols === 3 ? 'bg-white/10' : ''}`}>
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setCols(5)} className={`p-1 rounded ${cols === 5 ? 'bg-white/10' : ''}`}>
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {selected ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 gap-3" onClick={() => setSelected(null)}>
          <div className="w-64 h-64 rounded-xl" style={{ background: samplePhotos.find(p => p.id === selected)?.color }} />
          <p className="text-xs opacity-60">{samplePhotos.find(p => p.id === selected)?.label}</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {samplePhotos.map(p => (
              <div key={p.id} onClick={() => setSelected(p.id)}
                className="aspect-square rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: p.color }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
