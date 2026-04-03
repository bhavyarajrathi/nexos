import React, { useState, useRef, useEffect } from 'react';

const Terminal: React.FC = () => {
  const [history, setHistory] = useState<string[]>([
    'NexOS Terminal v3.0.0',
    'Type "help" for available commands.',
    ''
  ]);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView(); }, [history]);

  const exec = (cmd: string) => {
    const parts = cmd.trim().toLowerCase().split(' ');
    const c = parts[0];
    const lines: string[] = [`nex@os:~$ ${cmd}`];

    switch (c) {
      case 'help':
        lines.push('Available commands:', '  help     - Show this help', '  date     - Show current date/time',
          '  clear    - Clear terminal', '  echo     - Echo text', '  whoami   - Show current user',
          '  uname    - System info', '  uptime   - System uptime', '  ls       - List files',
          '  pwd      - Print working directory', '  cat      - Read file', '  neofetch - System info display');
        break;
      case 'date': lines.push(new Date().toString()); break;
      case 'clear': setHistory([]); return;
      case 'echo': lines.push(parts.slice(1).join(' ')); break;
      case 'whoami': lines.push('admin'); break;
      case 'uname': lines.push('NexOS 3.0.0 (Secure Kernel) x86_64'); break;
      case 'uptime': lines.push(`up ${Math.floor(Math.random() * 100)} days, ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`); break;
      case 'ls': lines.push('Desktop  Documents  Downloads  Music  Pictures  Videos  .config'); break;
      case 'pwd': lines.push('/home/admin'); break;
      case 'cat': lines.push(parts[1] ? `cat: ${parts[1]}: Permission denied (encrypted)` : 'Usage: cat <file>'); break;
      case 'neofetch':
        lines.push(
          '   ▄▄▄▄▄▄   admin@nexos',
          '  ██╔═══██╗  OS: NexOS 3.0.0',
          '  ██║   ██║  Kernel: SecureCore 6.1',
          '  ██║   ██║  Shell: nex-sh 2.0',
          '  ██╚═══██╝  Resolution: Dynamic',
          '   ▀▀▀▀▀▀   CPU: Neural Processing Unit',
          '             Memory: ∞ / ∞ MB',
          '             Security: Maximum'
        );
        break;
      case '': break;
      default: lines.push(`nex-sh: ${c}: command not found`);
    }
    lines.push('');
    setHistory(prev => [...prev, ...lines]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    exec(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-black/50 font-mono text-xs">
      <div className="flex-1 overflow-y-auto p-3">
        {history.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap" style={{ color: line.startsWith('nex@') ? '#00ff88' : '#e0e0e0' }}>
            {line}
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 border-t border-white/10">
        <span className="text-green-400">nex@os:~$</span>
        <input value={input} onChange={e => setInput(e.target.value)} autoFocus
          className="flex-1 bg-transparent outline-none text-white" />
      </form>
    </div>
  );
};

export default Terminal;
