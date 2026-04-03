import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Check } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Explore NexOS features', done: false },
    { id: '2', text: 'Customize theme & wallpaper', done: false },
    { id: '3', text: 'Try the AI assistant', done: true },
  ]);
  const [input, setInput] = useState('');

  const add = () => {
    if (!input.trim()) return;
    setTodos(prev => [...prev, { id: crypto.randomUUID(), text: input, done: false }]);
    setInput('');
  };

  const toggle = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-white/10">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Add a task..."
          onKeyDown={e => e.key === 'Enter' && add()}
          className="flex-1 h-8 px-3 text-xs bg-white/5 border border-white/10 rounded-lg outline-none" />
        <button onClick={add} className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/30">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {todos.map(t => (
          <div key={t.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 group">
            <button onClick={() => toggle(t.id)}
              className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                t.done ? 'bg-cyan-500/30 border-cyan-400' : 'border-white/20'
              }`}>
              {t.done && <Check className="w-3 h-3" />}
            </button>
            <span className={`flex-1 text-xs ${t.done ? 'line-through opacity-40' : ''}`}>{t.text}</span>
            <button onClick={() => remove(t.id)} className="opacity-0 group-hover:opacity-60 p-0.5">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        {todos.length === 0 && <p className="text-center text-xs opacity-30 py-8">No tasks yet</p>}
      </div>
      <div className="px-3 py-2 border-t border-white/10 text-[10px] opacity-40">
        {todos.filter(t => t.done).length}/{todos.length} completed
      </div>
    </div>
  );
};

export default TodoApp;
