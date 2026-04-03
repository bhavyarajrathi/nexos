import React, { useState } from 'react';
import { Save, FileText, Plus, Trash2 } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: Date;
}

const Notepad: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Welcome', content: 'Welcome to NexOS Notepad!\n\nStart typing to create your notes.', updatedAt: new Date() }
  ]);
  const [activeId, setActiveId] = useState('1');
  const active = notes.find(n => n.id === activeId);

  const addNote = () => {
    const n: Note = { id: crypto.randomUUID(), title: 'Untitled', content: '', updatedAt: new Date() };
    setNotes(prev => [...prev, n]);
    setActiveId(n.id);
  };

  const updateNote = (content: string) => {
    setNotes(prev => prev.map(n => n.id === activeId
      ? { ...n, content, title: content.split('\n')[0].slice(0, 30) || 'Untitled', updatedAt: new Date() }
      : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    if (activeId === id) setActiveId(notes[0]?.id || '');
  };

  return (
    <div className="flex h-full">
      <div className="w-48 border-r border-white/10 flex flex-col">
        <div className="p-2 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-medium opacity-60">Notes</span>
          <button onClick={addNote} className="p-1 rounded hover:bg-white/10"><Plus className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {notes.map(n => (
            <div key={n.id} onClick={() => setActiveId(n.id)}
              className={`px-3 py-2 cursor-pointer text-xs border-b border-white/5 flex items-center justify-between group ${
                n.id === activeId ? 'bg-white/10' : 'hover:bg-white/5'
              }`}>
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3 h-3 shrink-0 opacity-50" />
                <span className="truncate">{n.title}</span>
              </div>
              <button onClick={e => { e.stopPropagation(); deleteNote(n.id); }}
                className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-0.5">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {active ? (
          <textarea
            value={active.content}
            onChange={e => updateNote(e.target.value)}
            className="flex-1 w-full bg-transparent resize-none p-4 text-sm outline-none font-mono"
            placeholder="Start typing..."
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm opacity-40">
            No note selected
          </div>
        )}
      </div>
    </div>
  );
};

export default Notepad;
