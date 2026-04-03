import React, { useState } from 'react';

const CodeEditor: React.FC = () => {
  const [files] = useState([
    { name: 'index.html', lang: 'html' },
    { name: 'style.css', lang: 'css' },
    { name: 'script.js', lang: 'js' },
    { name: 'README.md', lang: 'md' },
  ]);
  const [activeFile, setActiveFile] = useState(0);
  const [contents, setContents] = useState<Record<number, string>>({
    0: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>NexOS App</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello NexOS!</h1>\n  <script src="script.js"></script>\n</body>\n</html>',
    1: 'body {\n  margin: 0;\n  padding: 20px;\n  background: #0f172a;\n  color: #e2e8f0;\n  font-family: system-ui;\n}\n\nh1 {\n  color: #22d3ee;\n}',
    2: 'console.log("Welcome to NexOS!");\n\nconst greet = (name) => {\n  return `Hello, ${name}!`;\n};\n\ngreet("User");',
    3: '# NexOS App\n\nA sample application built on NexOS.\n\n## Features\n- Fast\n- Secure\n- Beautiful',
  });

  const updateContent = (val: string) => {
    setContents(prev => ({ ...prev, [activeFile]: val }));
  };

  return (
    <div className="flex flex-col h-full font-mono text-xs">
      <div className="flex border-b border-white/10">
        {files.map((f, i) => (
          <button key={f.name} onClick={() => setActiveFile(i)}
            className={`px-3 py-1.5 text-[11px] border-r border-white/5 transition-all ${
              activeFile === i ? 'bg-white/10 border-b-2 border-b-cyan-400' : 'hover:bg-white/5 opacity-60'
            }`}>
            {f.name}
          </button>
        ))}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-10 bg-white/[0.02] text-right pr-2 pt-2 select-none overflow-hidden">
          {(contents[activeFile] || '').split('\n').map((_, i) => (
            <div key={i} className="text-[10px] opacity-20 leading-5">{i + 1}</div>
          ))}
        </div>
        <textarea
          value={contents[activeFile] || ''}
          onChange={e => updateContent(e.target.value)}
          className="flex-1 bg-transparent resize-none p-2 outline-none leading-5 text-[11px]"
          spellCheck={false}
        />
      </div>
      <div className="flex items-center justify-between px-3 py-1 border-t border-white/10 text-[10px] opacity-40">
        <span>{files[activeFile].lang.toUpperCase()}</span>
        <span>Ln {(contents[activeFile] || '').split('\n').length}, Col 1</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
};

export default CodeEditor;
