import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../OSContext';

const appAliasMap: Record<string, string> = {
  calculator: 'calculator',
  notepad: 'notepad',
  terminal: 'terminal',
  files: 'files',
  nexfiles: 'files',
  settings: 'settings',
  browser: 'browser',
  chrome: 'browser',
  sailor: 'sailor',
  weather: 'weather',
  music: 'music',
  camera: 'camera',
  clock: 'clock',
  photos: 'photos',
  calendar: 'calendar',
  taskmanager: 'taskmanager',
  ai: 'ai',
  nexai: 'ai',
  maps: 'maps',
  mail: 'mail',
  todo: 'todo',
  paint: 'paint',
  video: 'video',
  code: 'code',
  snake: 'snake',
  contacts: 'contacts',
  books: 'books',
  vpn: 'vpn',
  nexvpn: 'vpn',
};

const Terminal: React.FC = () => {
  const { openApp } = useOS();
  const [history, setHistory] = useState<string[]>([
    'NexOS Terminal v3.0.0',
    'Type "guide" for quick command access.',
    ''
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [isReverseSearch, setIsReverseSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState<number>(-1);
  const [inputBeforeSearch, setInputBeforeSearch] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView(); }, [history]);

  const findHistoryMatch = (query: string, startIndex: number) => {
    if (commandHistory.length === 0) return -1;
    const q = query.toLowerCase();
    for (let i = Math.min(startIndex, commandHistory.length - 1); i >= 0; i -= 1) {
      if (commandHistory[i].toLowerCase().includes(q)) {
        return i;
      }
    }
    return -1;
  };

  const currentSearchMatch = searchIndex >= 0 ? commandHistory[searchIndex] : '';

  const startReverseSearch = () => {
    setInputBeforeSearch(input);
    setIsReverseSearch(true);
    setSearchQuery('');
    setSearchIndex(commandHistory.length - 1);
  };

  const closeReverseSearch = (restoreInput: boolean) => {
    setIsReverseSearch(false);
    setSearchQuery('');
    setSearchIndex(-1);
    if (restoreInput) {
      setInput(inputBeforeSearch);
    }
  };

  const exec = (cmd: string) => {
    const parts = cmd.trim().split(' ');
    const normalized = parts.map(p => p.toLowerCase());
    const args = parts.slice(1);
    const argsNormalized = normalized.slice(1);
    const c = parts[0];
    const cNormalized = (normalized[0] || '');
    const lines: string[] = [`nex@os:~$ ${cmd}`];

    const printGuide = () => {
      lines.push(
        'NexOS Command Guide',
        'Core:',
        '  guide              - Show complete command guide',
        '  help               - Basic help',
        '  clear              - Clear terminal',
        '  date               - Show current date/time',
        '  echo <text>        - Echo text',
        '  whoami             - Show current user',
        '  uname              - System info',
        '  uptime             - System uptime',
        '  neofetch           - System info display',
        'File shortcuts:',
        '  ls                 - List common directories',
        '  pwd                - Print working directory',
        '  cat <file>         - Read protected file info',
        'App control:',
        '  apps               - List launchable app ids',
        '  open <app-id>      - Open any app (example: open chrome)',
        '  run <app-id>       - Alias of open command',
        '  start <app-id>     - Alias of open command',
        'VPN control:',
        '  vpn on             - Connect NexVpn secure tunnel',
        '  vpn off            - Disconnect NexVpn secure tunnel',
        '  vpn status         - Show current NexVpn status',
        '  vpn open           - Open NexVpn app window',
        'Terminal power tips:',
        '  Ctrl+R             - Reverse-search command history',
      );
    };

    switch (cNormalized) {
      case 'guide':
        printGuide();
        break;
      case 'help':
        lines.push('Type "guide" for the full command list and quick usage examples.');
        break;
      case 'date': lines.push(new Date().toString()); break;
      case 'clear': setHistory([]); return;
      case 'echo': lines.push(args.join(' ')); break;
      case 'whoami': lines.push('admin'); break;
      case 'uname': lines.push('NexOS 3.0.0 (Secure Kernel) x86_64'); break;
      case 'uptime': lines.push(`up ${Math.floor(Math.random() * 100)} days, ${Math.floor(Math.random() * 24)}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`); break;
      case 'ls': lines.push('Desktop  Documents  Downloads  Music  Pictures  Videos  .config'); break;
      case 'pwd': lines.push('/home/admin'); break;
      case 'cat': lines.push(parts[1] ? `cat: ${parts[1]}: Permission denied (encrypted)` : 'Usage: cat <file>'); break;
      case 'apps':
        lines.push(
          'Launchable apps:',
          '  calculator, notepad, terminal, files, settings, browser, sailor, weather, music, camera, clock, photos, calendar, taskmanager, ai, maps, mail, todo, paint, video, code, snake, contacts, books, vpn',
          'Aliases: chrome -> browser, nexfiles -> files, nexvpn -> vpn, nexai -> ai',
        );
        break;
      case 'open':
      case 'run':
      case 'start': {
        const target = argsNormalized[0];
        if (!target) {
          lines.push(`Usage: ${cNormalized} <app-id>`, 'Tip: run "apps" to list all app ids.');
          break;
        }

        const appId = appAliasMap[target];
        if (!appId) {
          lines.push(`Unknown app "${target}". Run "apps" for valid ids.`);
          break;
        }

        openApp(appId);
        lines.push(`Opening ${appId}...`);
        break;
      }
      case 'vpn': {
        const action = argsNormalized[0];

        if (!action) {
          lines.push('Usage: vpn <on|off|status|open>');
          break;
        }

        if (action === 'open') {
          openApp('vpn');
          lines.push('Opening NexVpn...');
          break;
        }

        if (action === 'status') {
          const state = localStorage.getItem('nexvpn:state') === 'on' ? 'CONNECTED' : 'DISCONNECTED';
          lines.push(`NexVpn status: ${state}`);
          break;
        }

        if (action === 'on' || action === 'off') {
          const desired = action === 'on' ? 'connect' : 'disconnect';
          window.dispatchEvent(new CustomEvent('nexvpn-command', { detail: { action: desired } }));
          localStorage.setItem('nexvpn:state', action === 'on' ? 'on' : 'off');
          lines.push(action === 'on'
            ? 'NexVpn connect signal sent. Use "vpn status" to verify.'
            : 'NexVpn disconnect signal sent.');
          break;
        }

        lines.push('Usage: vpn <on|off|status|open>');
        break;
      }
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
      default: lines.push(`nex-sh: ${cNormalized}: command not found (try "guide")`);
    }
    lines.push('');
    setHistory(prev => [...prev, ...lines]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isReverseSearch) {
      if (currentSearchMatch) {
        setInput(currentSearchMatch);
      }
      closeReverseSearch(false);
      return;
    }

    if (input.trim()) {
      setCommandHistory(prev => [...prev, input.trim()]);
    }

    exec(input);
    setInput('');
  };

  const handleInputChange = (value: string) => {
    if (!isReverseSearch) {
      setInput(value);
      return;
    }

    setSearchQuery(value);
    const nextIndex = findHistoryMatch(value, commandHistory.length - 1);
    setSearchIndex(nextIndex);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'r') {
      e.preventDefault();

      if (!isReverseSearch) {
        startReverseSearch();
        return;
      }

      const nextIndex = findHistoryMatch(searchQuery, searchIndex - 1);
      if (nextIndex >= 0) {
        setSearchIndex(nextIndex);
      }
      return;
    }

    if (!isReverseSearch) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeReverseSearch(true);
    }
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
        <span className={`${isReverseSearch ? 'text-cyan-300' : 'text-green-400'}`}>
          {isReverseSearch ? '(reverse-i-search):' : 'nex@os:~$'}
        </span>
        <input
          value={isReverseSearch ? searchQuery : input}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          autoFocus
          className="flex-1 bg-transparent outline-none text-white" />
        {isReverseSearch && (
          <span className="text-cyan-200/80 truncate max-w-[55%]">
            {currentSearchMatch ? currentSearchMatch : 'no matches'}
          </span>
        )}
      </form>
    </div>
  );
};

export default Terminal;
