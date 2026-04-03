import React, { useState } from 'react';
import { Mail as MailIcon, Star, Trash2, Send, Inbox, Edit } from 'lucide-react';

const sampleMails = [
  { id: '1', from: 'system@nexos.com', subject: 'Welcome to NexOS', body: 'Welcome to NexOS! Your system is now configured and ready to use.\n\nExplore themes, wallpapers, and apps to customize your experience.\n\n— NexOS Team', date: 'Today', starred: true, read: true },
  { id: '2', from: 'security@nexos.com', subject: 'Security Report', body: 'Your system security scan is complete.\n\nAll systems are secure. No threats detected.\nEncryption: AES-256 Active\nFirewall: Enabled\n\n— Security Daemon', date: 'Today', starred: false, read: false },
  { id: '3', from: 'ai@nexos.com', subject: 'AI Assistant Update', body: 'NexOS AI has been updated to v2.0.\n\nNew features:\n- Theme generation\n- Icon design suggestions\n- Enhanced natural language processing\n\n— AI Team', date: 'Yesterday', starred: false, read: false },
  { id: '4', from: 'updates@nexos.com', subject: 'System Update Available', body: 'A new system update is available.\n\nVersion 3.0.1 includes:\n- Performance improvements\n- Bug fixes\n- New wallpapers\n\nUpdate at your convenience.', date: 'Yesterday', starred: false, read: true },
];

const MailApp: React.FC = () => {
  const [mails, setMails] = useState(sampleMails);
  const [selected, setSelected] = useState<string | null>(null);
  const [composing, setComposing] = useState(false);

  const active = mails.find(m => m.id === selected);

  return (
    <div className="flex h-full">
      <div className="w-48 border-r border-white/10 flex flex-col">
        <div className="p-2 border-b border-white/10">
          <button onClick={() => setComposing(true)}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-cyan-500/20 text-xs hover:bg-cyan-500/30">
            <Edit className="w-3 h-3" /> Compose
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mails.map(m => (
            <div key={m.id} onClick={() => { setSelected(m.id); setComposing(false); }}
              className={`px-3 py-2 border-b border-white/5 cursor-pointer text-xs ${
                selected === m.id ? 'bg-white/10' : 'hover:bg-white/5'
              } ${!m.read ? 'font-medium' : 'opacity-70'}`}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="truncate text-[10px]">{m.from.split('@')[0]}</span>
                {m.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />}
              </div>
              <p className="truncate">{m.subject}</p>
              <p className="text-[10px] opacity-40 mt-0.5">{m.date}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {composing ? (
          <div className="flex-1 p-4 space-y-3">
            <input placeholder="To:" className="w-full h-8 px-3 text-xs bg-white/5 border border-white/10 rounded-lg outline-none" />
            <input placeholder="Subject:" className="w-full h-8 px-3 text-xs bg-white/5 border border-white/10 rounded-lg outline-none" />
            <textarea placeholder="Message..." className="w-full flex-1 min-h-[120px] p-3 text-xs bg-white/5 border border-white/10 rounded-lg outline-none resize-none" />
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30">
              <Send className="w-3 h-3" /> Send
            </button>
          </div>
        ) : active ? (
          <div className="flex-1 p-4 overflow-y-auto">
            <h2 className="text-sm font-medium mb-1">{active.subject}</h2>
            <p className="text-[10px] opacity-50 mb-4">From: {active.from} • {active.date}</p>
            <p className="text-xs leading-relaxed whitespace-pre-wrap opacity-80">{active.body}</p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center opacity-30">
              <Inbox className="w-10 h-10 mx-auto mb-2" />
              <p className="text-xs">Select a message</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MailApp;
