import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Globe, Search } from 'lucide-react';

const bookmarks = [
  { name: 'Google', url: 'https://www.google.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Wikipedia', url: 'https://en.wikipedia.org' },
  { name: 'MDN Docs', url: 'https://developer.mozilla.org' },
];

const Browser: React.FC = () => {
  const [url, setUrl] = useState('https://www.google.com');
  const [inputUrl, setInputUrl] = useState('https://www.google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com']);
  const [histIdx, setHistIdx] = useState(0);

  const navigate = (newUrl: string) => {
    let u = newUrl;
    if (!u.startsWith('http')) u = 'https://' + u;
    setUrl(u);
    setInputUrl(u);
    setHistory(prev => [...prev.slice(0, histIdx + 1), u]);
    setHistIdx(prev => prev + 1);
  };

  const goBack = () => {
    if (histIdx > 0) {
      const i = histIdx - 1;
      setHistIdx(i);
      setUrl(history[i]);
      setInputUrl(history[i]);
    }
  };

  const goForward = () => {
    if (histIdx < history.length - 1) {
      const i = histIdx + 1;
      setHistIdx(i);
      setUrl(history[i]);
      setInputUrl(history[i]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/10 bg-gradient-to-r from-zinc-900 to-zinc-800">
        <button onClick={goBack} className="p-1.5 rounded hover:bg-white/10" disabled={histIdx <= 0}>
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>
        <button onClick={goForward} className="p-1.5 rounded hover:bg-white/10" disabled={histIdx >= history.length - 1}>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => navigate(url)} className="p-1.5 rounded hover:bg-white/10">
          <RotateCw className="w-3.5 h-3.5" />
        </button>
        <form onSubmit={e => { e.preventDefault(); navigate(inputUrl); }} className="flex-1 flex">
          <div className="flex items-center flex-1 h-7 px-2.5 rounded-lg bg-white/5 border border-white/10 gap-1.5">
            <Globe className="w-3 h-3 opacity-40" />
            <input value={inputUrl} onChange={e => setInputUrl(e.target.value)}
              className="flex-1 bg-transparent text-[11px] outline-none" />
          </div>
        </form>
        <span className="px-2 py-0.5 rounded text-[10px] border border-white/10 bg-white/5">Chrome</span>
      </div>
      <div className="flex gap-1.5 px-3 py-1 border-b border-white/5">
        {bookmarks.map(b => (
          <button key={b.name} onClick={() => navigate(b.url)}
            className="px-2 py-0.5 text-[10px] rounded bg-white/5 hover:bg-white/10 transition-colors">
            {b.name}
          </button>
        ))}
      </div>
      <div className="flex-1 bg-white">
        <iframe src={url} className="w-full h-full border-0" sandbox="allow-scripts allow-same-origin allow-forms"
          title="Chrome Browser" />
      </div>
    </div>
  );
};

export default Browser;
