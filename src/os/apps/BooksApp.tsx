import React, { useState } from 'react';
import { BookOpen, ChevronRight, Search } from 'lucide-react';

const categories = ['All', 'Fiction', 'Sci-Fi', 'Tech', 'Science', 'History'];

const books = [
  { id: '1', title: 'The Quantum Mind', author: 'Dr. Sarah Chen', category: 'Sci-Fi', pages: 342, color: '#2a1a4a' },
  { id: '2', title: 'Digital Horizons', author: 'Alex Turner', category: 'Tech', pages: 280, color: '#1a2a4a' },
  { id: '3', title: 'Neural Networks', author: 'Prof. James Lee', category: 'Science', pages: 456, color: '#0a3a2a' },
  { id: '4', title: 'The Last Colony', author: 'Maria Santos', category: 'Sci-Fi', pages: 312, color: '#3a1a2a' },
  { id: '5', title: 'Code Patterns', author: 'David Park', category: 'Tech', pages: 520, color: '#1a3a1a' },
  { id: '6', title: 'Ancient Worlds', author: 'Dr. Emily Brown', category: 'History', pages: 398, color: '#3a2a0a' },
  { id: '7', title: 'Starlight Echo', author: 'Luna Rivers', category: 'Fiction', pages: 275, color: '#1a1a4a' },
  { id: '8', title: 'Cyber Ethics', author: 'Prof. Kim Yoo', category: 'Tech', pages: 340, color: '#2a2a2a' },
];

const BooksApp: React.FC = () => {
  const [cat, setCat] = useState('All');
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = cat === 'All' ? books : books.filter(b => b.category === cat);
  const active = books.find(b => b.id === selected);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1.5 px-3 py-2 border-b border-white/10 flex-wrap">
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-2.5 py-1 rounded-full text-[10px] transition-all ${
              cat === c ? 'bg-cyan-500/30 text-cyan-300' : 'bg-white/5 hover:bg-white/10'
            }`}>{c}</button>
        ))}
      </div>
      {selected && active ? (
        <div className="flex-1 p-4 space-y-3">
          <button onClick={() => setSelected(null)} className="text-[10px] opacity-50 hover:opacity-80">← Back</button>
          <div className="flex gap-4">
            <div className="w-24 h-36 rounded-lg flex items-center justify-center" style={{ background: active.color }}>
              <BookOpen className="w-8 h-8 opacity-30" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">{active.title}</h3>
              <p className="text-xs opacity-50">{active.author}</p>
              <p className="text-[10px] opacity-30">{active.category} • {active.pages} pages</p>
              <button className="mt-2 px-3 py-1 text-[10px] rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30">Read Now</button>
            </div>
          </div>
          <div className="text-xs opacity-50 leading-relaxed mt-4">
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-4 gap-3">
            {filtered.map(b => (
              <button key={b.id} onClick={() => setSelected(b.id)}
                className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all">
                <div className="w-full aspect-[2/3] rounded-lg flex items-center justify-center" style={{ background: b.color }}>
                  <BookOpen className="w-6 h-6 opacity-20" />
                </div>
                <div className="w-full text-left">
                  <p className="text-[10px] font-medium truncate">{b.title}</p>
                  <p className="text-[9px] opacity-40 truncate">{b.author}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksApp;
