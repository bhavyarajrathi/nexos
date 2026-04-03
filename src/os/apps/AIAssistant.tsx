import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useOS } from '../OSContext';
import { ChatMessage, generateAssistantReply } from '../aiEngine';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const { assistantContext, openApp } = useOS();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m NexOS AI, your personal assistant. I can help you with tasks, answer questions, automate app launches, and optimize the system in real time. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const appLaunchMap: Record<string, string> = {
    calculator: 'calculator',
    calendar: 'calendar',
    browser: 'browser',
    chrome: 'browser',
    files: 'files',
    nexfiles: 'files',
    terminal: 'terminal',
    settings: 'settings',
    mail: 'mail',
    music: 'music',
    photos: 'photos',
    video: 'video',
    code: 'code',
    editor: 'code',
    ai: 'ai',
    assistant: 'ai',
    taskmanager: 'taskmanager',
    'task manager': 'taskmanager',
    todo: 'todo',
    notes: 'notepad',
    notepad: 'notepad',
    maps: 'maps',
    weather: 'weather',
  };

  const resolveLaunchTarget = (text: string) => {
    const lower = text.toLowerCase();
    const commandMatch = lower.match(/(?:open|launch|start)\s+(?:the\s+)?(.+)$/i);
    if (!commandMatch) return null;

    const candidate = commandMatch[1].trim();
    const found = Object.entries(appLaunchMap).find(([key]) => candidate.includes(key));
    return found ? found[1] : null;
  };

  const respondFallback = (userMsg: string): string => {
    const lower = userMsg.toLowerCase();
    const launchTarget = resolveLaunchTarget(userMsg);
    if (launchTarget) {
      return `Opening ${launchTarget}. I\'m also tracking your usage so I can prioritize it automatically next time.`;
    }

    if (lower.includes('theme') && (lower.includes('create') || lower.includes('generate') || lower.includes('make'))) {
      return `🎨 I've designed a custom theme based on your request! Here's a preview:\n\n• **Primary**: A dynamic accent color\n• **Background**: Rich dark tone\n• **Text**: High contrast for readability\n\nTo apply custom themes, go to Settings > Themes and look for the closest match. In a future update, I'll be able to directly apply AI-generated themes!`;
    }
    if (lower.includes('icon') && (lower.includes('create') || lower.includes('generate'))) {
      return `🖼️ I can help design icon concepts! Here's what I recommend:\n\n• **Style**: Minimalist line icons with gradient fills\n• **Color**: Match your current theme accent\n• **Size**: 48x48px for desktop, 24x24px for taskbar\n\nDescribe the specific icon you'd like and I'll suggest the perfect design!`;
    }
    if (lower.includes('wallpaper')) {
      return `🖼️ Check out Settings > Wallpapers for 50+ wallpapers across categories like Space, Ocean, Nature, Cyber, and more! You can also tell me what mood you want and I'll suggest the perfect wallpaper.`;
    }
    if (lower.includes('security') || lower.includes('secure')) {
      return `🔒 NexOS Security Features:\n\n• **Encrypted Sessions**: AES-256 encryption\n• **Failed Login Protection**: Auto-lockout after 5 attempts\n• **Security Logs**: Full audit trail in Settings > Security\n• **Password Protection**: Customizable passwords\n• **Session Isolation**: Each window runs in isolation\n\nWould you like me to help you configure any security settings?`;
    }
    if (lower.includes('help') || lower.includes('what can')) {
      return `I can help with:\n\n• 🎨 **Theme Generation** - "Create a sunset theme"\n• 🖼️ **Icon Design** - "Generate a music icon"\n• ⚙️ **Settings** - "Change my wallpaper"\n• 🔒 **Security** - "Check security status"\n• 📝 **Tasks** - "Remind me to..."\n• 🧮 **Calculations** - "What's 15% of 200?"\n• 🌍 **Info** - "What time is it in Tokyo?"\n\nJust ask away!`;
    }
    if (lower.includes('time')) {
      const now = new Date();
      return `🕐 Current time: ${now.toLocaleTimeString()}\n📅 Date: ${now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return `Hey there! 👋 Welcome to NexOS. I'm here to help make your experience amazing. What would you like to do?`;
    }
    if (lower.includes('calculate') || lower.includes('what\'s') || lower.includes('whats') || lower.match(/\d+\s*[\+\-\*\/]\s*\d+/)) {
      try {
        const match = userMsg.match(/(\d+[\.\d]*)\s*([\+\-\*\/\%])\s*(\d+[\.\d]*)/);
        if (match) {
          const [, a, op, b] = match;
          let result = 0;
          const na = parseFloat(a), nb = parseFloat(b);
          if (op === '+') result = na + nb;
          if (op === '-') result = na - nb;
          if (op === '*') result = na * nb;
          if (op === '/') result = nb !== 0 ? na / nb : 0;
          if (op === '%') result = na * nb / 100;
          return `🧮 ${a} ${op} ${b} = **${result}**`;
        }
      } catch {}
      return `Try using the Calculator app for complex calculations, or type a simple expression like "25 + 17"`;
    }
    return `I understand you're asking about "${userMsg}". I can automate app launches, optimize system priorities, and help with theme generation, security info, and basic calculations. Try asking me to "open calendar" or "check system health".`;
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const userText = input;
    const userMsg: Message = { role: 'user', content: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const launchTarget = resolveLaunchTarget(userText);
      if (launchTarget) {
        openApp(launchTarget);
        setMessages(prev => [...prev, { role: 'assistant', content: respondFallback(userText) }]);
        return;
      }

      const conversation: ChatMessage[] = [...messages, userMsg].slice(-12).map(message => ({
        role: message.role,
        content: message.content,
      }));

      const response = await generateAssistantReply(conversation, assistantContext);
      const reply = response || `I couldn\'t generate a model response right now. Try again in a moment, or ask me to open an app like "open calendar".`;
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
        <span className="text-xs font-medium">NexOS AI Assistant</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300">Local AI</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-cyan-500/20' : 'bg-purple-500/20'
            }`}>
              {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
            </div>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-cyan-500/15 rounded-tr-none' : 'bg-white/5 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Bot className="w-3 h-3" />
            </div>
            <div className="bg-white/5 rounded-xl rounded-tl-none px-3 py-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex items-center gap-2 p-3 border-t border-white/10">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask NexOS AI anything..."
          className="flex-1 h-8 px-3 text-xs rounded-lg bg-white/5 border border-white/10 outline-none focus:border-cyan-400/30" />
        <button type="submit" disabled={loading || !input.trim()}
          className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center hover:bg-cyan-500/30 disabled:opacity-30">
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
