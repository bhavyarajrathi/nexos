import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { useOS } from '../OSContext';
import { ChatMessage, generateAssistantReply } from '../aiEngine';
import { AiStartupProfile } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant: React.FC = () => {
  const {
    assistantContext,
    aiInsights,
    openApp,
    setTheme,
    setWallpaper,
    allThemes,
    allWallpapers,
    applyAutomationMode,
    saveWorkspaceSnapshot,
    syncUserData,
    aiStartupProfile,
    saveAiStartupProfile,
    clearAiStartupProfile,
  } = useOS();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m NexOS AI, your adaptive workspace assistant. Tell me your role or workflow and I can instantly personalize your desktop UI, app layout, and performance mode. Example: "I am a data analyst, optimize my workspace".',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<0 | 1 | 2 | 3>(0);
  const [onboardingData, setOnboardingData] = useState<{
    role?: RoleProfile;
    priority?: 'performance' | 'balanced' | 'visual';
    style?: 'dark' | 'light' | 'colorful' | 'minimal';
  }>({});
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
    vpn: 'vpn',
    contacts: 'contacts',
    books: 'books',
    sailor: 'sailor',
    task: 'taskmanager',
    tasks: 'taskmanager',
  };

  type RoleProfile = {
    key: string;
    mode: 'study' | 'coding' | 'meeting';
    themeId: string;
    wallpaperId: string;
    apps: string[];
    label: string;
  };

  const roleProfiles: RoleProfile[] = [
    {
      key: 'developer',
      mode: 'coding',
      themeId: 'graphite',
      wallpaperId: 'w19',
      apps: ['code', 'terminal', 'files', 'browser', 'ai', 'taskmanager'],
      label: 'Developer Workspace',
    },
    {
      key: 'data-analyst',
      mode: 'study',
      themeId: 'steel',
      wallpaperId: 'w51',
      apps: ['code', 'browser', 'terminal', 'calendar', 'todo', 'taskmanager'],
      label: 'Data Analyst Workspace',
    },
    {
      key: 'student',
      mode: 'study',
      themeId: 'pastel-sky',
      wallpaperId: 'w39',
      apps: ['notepad', 'calendar', 'todo', 'books', 'clock'],
      label: 'Study Workspace',
    },
    {
      key: 'manager',
      mode: 'meeting',
      themeId: 'frost',
      wallpaperId: 'w48',
      apps: ['calendar', 'mail', 'browser', 'notepad', 'contacts'],
      label: 'Meeting Workspace',
    },
    {
      key: 'creative',
      mode: 'study',
      themeId: 'vaporwave',
      wallpaperId: 'w35',
      apps: ['paint', 'photos', 'music', 'browser', 'files'],
      label: 'Creative Workspace',
    },
  ];

  const findThemeByPrompt = (text: string) => {
    const lower = text.toLowerCase();
    return allThemes.find(theme => lower.includes(theme.name.toLowerCase()) || lower.includes(theme.id.toLowerCase()));
  };

  const findWallpaperByPrompt = (text: string) => {
    const lower = text.toLowerCase();
    return allWallpapers.find(wallpaper => lower.includes(wallpaper.name.toLowerCase()) || lower.includes(wallpaper.id.toLowerCase()));
  };

  const getRoleProfileFromPrompt = (text: string): RoleProfile | null => {
    const lower = text.toLowerCase();
    if (/(developer|programmer|coding|full\s*stack|frontend|backend)/i.test(lower)) {
      return roleProfiles.find(profile => profile.key === 'developer') ?? null;
    }
    if (/(data\s*analyst|analytics|sql|dashboard|bi\b|excel|power\s*bi)/i.test(lower)) {
      return roleProfiles.find(profile => profile.key === 'data-analyst') ?? null;
    }
    if (/(student|study|learning|exam|class|college)/i.test(lower)) {
      return roleProfiles.find(profile => profile.key === 'student') ?? null;
    }
    if (/(manager|meeting|founder|business|sales|operations)/i.test(lower)) {
      return roleProfiles.find(profile => profile.key === 'manager') ?? null;
    }
    if (/(designer|creative|artist|content|video\s*editor|ui\s*ux)/i.test(lower)) {
      return roleProfiles.find(profile => profile.key === 'creative') ?? null;
    }
    return null;
  };

  const applyRoleProfile = async (profile: RoleProfile) => {
    applyAutomationMode(profile.mode);
    setTheme(profile.themeId);
    setWallpaper(profile.wallpaperId);
    profile.apps.forEach(appId => openApp(appId));
    saveWorkspaceSnapshot(`${profile.label} - AI`);
    await syncUserData();
  };

  const parsePriority = (text: string): 'performance' | 'balanced' | 'visual' | null => {
    const lower = text.toLowerCase();
    if (/(performance|speed|fast|responsive|optimi)/i.test(lower)) return 'performance';
    if (/(visual|style|looks|beautiful|design|creative)/i.test(lower)) return 'visual';
    if (/(balanced|balance|normal|default)/i.test(lower)) return 'balanced';
    return null;
  };

  const parseStyle = (text: string): 'dark' | 'light' | 'colorful' | 'minimal' | null => {
    const lower = text.toLowerCase();
    if (/(dark|night|black|graphite|midnight)/i.test(lower)) return 'dark';
    if (/(light|bright|clean\s*light|frost|ice)/i.test(lower)) return 'light';
    if (/(colorful|vibrant|neon|creative|bold)/i.test(lower)) return 'colorful';
    if (/(minimal|simple|focus|calm)/i.test(lower)) return 'minimal';
    return null;
  };

  const tuneThemeForStyle = (baseThemeId: string, style: 'dark' | 'light' | 'colorful' | 'minimal') => {
    if (style === 'dark') return ['graphite', 'midnight', 'dark'].find(id => allThemes.some(theme => theme.id === id)) ?? baseThemeId;
    if (style === 'light') return ['frost', 'ice', 'pastel-sky'].find(id => allThemes.some(theme => theme.id === id)) ?? baseThemeId;
    if (style === 'colorful') return ['cyberpunk', 'vaporwave', 'sunset'].find(id => allThemes.some(theme => theme.id === id)) ?? baseThemeId;
    return ['steel', 'slate', 'frost'].find(id => allThemes.some(theme => theme.id === id)) ?? baseThemeId;
  };

  const tuneWallpaperForStyle = (baseWallpaperId: string, style: 'dark' | 'light' | 'colorful' | 'minimal') => {
    if (style === 'dark') return ['w26', 'w25', 'w50'].find(id => allWallpapers.some(wallpaper => wallpaper.id === id)) ?? baseWallpaperId;
    if (style === 'light') return ['w51', 'w48', 'w39'].find(id => allWallpapers.some(wallpaper => wallpaper.id === id)) ?? baseWallpaperId;
    if (style === 'colorful') return ['w47', 'w35', 'w12'].find(id => allWallpapers.some(wallpaper => wallpaper.id === id)) ?? baseWallpaperId;
    return ['w39', 'w50', 'w1'].find(id => allWallpapers.some(wallpaper => wallpaper.id === id)) ?? baseWallpaperId;
  };

  const buildStartupProfile = (
    role: RoleProfile,
    priority: 'performance' | 'balanced' | 'visual',
    style: 'dark' | 'light' | 'colorful' | 'minimal'
  ): AiStartupProfile => {
    const mode = priority === 'performance' ? 'coding' : priority === 'visual' ? role.mode : role.mode;
    const themeId = tuneThemeForStyle(role.themeId, style);
    const wallpaperId = tuneWallpaperForStyle(role.wallpaperId, style);

    return {
      id: crypto.randomUUID(),
      label: `${role.label} (${priority}/${style})`,
      role: role.key,
      mode,
      themeId,
      wallpaperId,
      apps: role.apps,
      priority,
      style,
      autoApply: true,
      createdAt: Date.now(),
    };
  };

  const beginOnboarding = () => {
    setOnboardingStep(1);
    setOnboardingData({});
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'AI Onboarding started. Step 1/3: What is your role? (developer, data analyst, student, manager, creative)'
    }]);
  };

  const handleOnboardingReply = async (userText: string): Promise<string | null> => {
    if (onboardingStep === 0) return null;

    if (onboardingStep === 1) {
      const role = getRoleProfileFromPrompt(userText);
      if (!role) {
        return 'I did not catch that role. Please choose one: developer, data analyst, student, manager, or creative.';
      }

      setOnboardingData({ role });
      setOnboardingStep(2);
      return 'Great. Step 2/3: What should I prioritize? (performance, balanced, visual)';
    }

    if (onboardingStep === 2) {
      const priority = parsePriority(userText);
      if (!priority) {
        return 'Please choose one priority: performance, balanced, or visual.';
      }

      setOnboardingData(prev => ({ ...prev, priority }));
      setOnboardingStep(3);
      return 'Perfect. Step 3/3: What UI style do you prefer? (dark, light, colorful, minimal)';
    }

    const style = parseStyle(userText);
    if (!style) {
      return 'Please choose one style: dark, light, colorful, or minimal.';
    }

    const role = onboardingData.role;
    const priority = onboardingData.priority ?? 'balanced';
    if (!role) {
      setOnboardingStep(0);
      setOnboardingData({});
      return 'Onboarding reset. Please start again with "start ai onboarding".';
    }

    const startupProfile = buildStartupProfile(role, priority, style);
    await applyRoleProfile({
      ...role,
      mode: startupProfile.mode,
      themeId: startupProfile.themeId,
      wallpaperId: startupProfile.wallpaperId,
    });
    saveAiStartupProfile(startupProfile);
    setOnboardingStep(0);
    setOnboardingData({});

    return `Done. I created and saved your startup profile "${startupProfile.label}". It will auto-apply after login for a more user-friendly personalized NexOS experience.`;
  };

  const handleAICustomization = async (userMsg: string): Promise<string | null> => {
    const lower = userMsg.toLowerCase();
    if (/(start|begin|setup)\s+(ai\s*)?(onboarding|profile)/i.test(lower)) {
      beginOnboarding();
      return null;
    }

    if (/(clear|remove|disable)\s+(ai\s*)?(startup|profile|onboarding)/i.test(lower)) {
      clearAiStartupProfile();
      return 'Cleared your AI startup profile. Auto-apply is now disabled.';
    }

    const roleProfile = getRoleProfileFromPrompt(userMsg);

    if (roleProfile && /(optimi|personal|adapt|setup|configure|workspace|ui|desktop)/i.test(lower)) {
      await applyRoleProfile(roleProfile);
      if (/(default|startup|login|always)/i.test(lower)) {
        const startupProfile = buildStartupProfile(roleProfile, 'balanced', 'minimal');
        saveAiStartupProfile(startupProfile);
        return `Applied ${roleProfile.label} and saved it as your startup AI profile. NexOS will auto-personalize on login.`;
      }
      return `Applied ${roleProfile.label}. I tuned your UI, wallpaper, app layout, and flow for your role. You can say "save this as my default" to auto-apply after login.`;
    }

    if (/(performance|fast|speed|lightweight|lag)/i.test(lower)) {
      applyAutomationMode('coding');
      setTheme('graphite');
      setWallpaper('w26');
      openApp('taskmanager');
      await syncUserData();
      return 'Switched to Performance Workspace: lower visual noise, coding layout, and task manager opened for live monitoring.';
    }

    if (/(focus|minimal|clean|deep\s*work|distraction)/i.test(lower)) {
      applyAutomationMode('study');
      setTheme('frost');
      setWallpaper('w50');
      await syncUserData();
      return 'Focus Workspace is active: clean visual style and study-oriented layout for distraction-free work.';
    }

    if (/(collaborat|team|calls|sync|meeting)/i.test(lower) && /(mode|layout|workspace|optimi|setup)/i.test(lower)) {
      applyAutomationMode('meeting');
      setTheme('ice');
      setWallpaper('w48');
      openApp('mail');
      openApp('calendar');
      await syncUserData();
      return 'Meeting Workspace activated with communication-first layout and collaboration apps ready.';
    }

    const themeMatch = findThemeByPrompt(userMsg);
    if (themeMatch && /(theme|look|color|style|ui)/i.test(lower)) {
      setTheme(themeMatch.id);
      await syncUserData();
      return `Applied theme ${themeMatch.name}.`;
    }

    const wallpaperMatch = findWallpaperByPrompt(userMsg);
    if (wallpaperMatch && /(wallpaper|background|wall)/i.test(lower)) {
      setWallpaper(wallpaperMatch.id);
      await syncUserData();
      return `Applied wallpaper ${wallpaperMatch.name}.`;
    }

    if (/(save|snapshot|remember|default\s*workspace)/i.test(lower)) {
      const snapshotId = saveWorkspaceSnapshot('AI Personalized Workspace');
      const roleProfile = getRoleProfileFromPrompt(userMsg) ?? roleProfiles[0];
      const startupProfile = buildStartupProfile(roleProfile, 'balanced', 'minimal');
      saveAiStartupProfile(startupProfile);
      await syncUserData();
      return `Saved your current desktop as AI Personalized Workspace (${snapshotId.slice(0, 8)}), and set AI startup auto-apply.`;
    }

    return null;
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
      return `I can apply a style directly now. Try prompts like "set graphite theme", "use frost theme", or "apply a creative UI setup".`;
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
    if (lower.includes('optimize') || lower.includes('workspace') || lower.includes('role')) {
      return `Try one of these prompts:\n\n• "I am a developer, optimize my workspace"\n• "I am a data analyst, adapt the UI"\n• "Switch to focus mode"\n• "Enable meeting workspace"\n• "Save this as my default workspace"`;
    }
    if (lower.includes('onboarding') || lower.includes('profile')) {
      return `Use "start ai onboarding" and I will ask 3 quick questions to build a startup profile that auto-applies when you log in.`;
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
      const onboardingReply = await handleOnboardingReply(userText);
      if (onboardingReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: onboardingReply }]);
        return;
      }

      const customizationReply = await handleAICustomization(userText);
      if (customizationReply) {
        setMessages(prev => [...prev, { role: 'assistant', content: customizationReply }]);
        return;
      }

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
      <div className="px-3 py-2 border-b border-white/10 bg-white/[0.02]">
        <div className="flex flex-wrap gap-1.5">
          {[
            'I am a developer, optimize my workspace',
            'I am a data analyst, adapt the UI',
            'Switch to focus mode',
            'Enable meeting workspace',
            'Start AI onboarding',
          ].map(prompt => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/10"
            >
              {prompt}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[10px] opacity-60">
          Current mode: {aiInsights.automationMode}. Next likely app: {aiInsights.topPicks[0]?.label ?? 'N/A'}.
        </p>
        <p className="mt-1 text-[10px] opacity-60">
          Startup profile: {aiStartupProfile ? `${aiStartupProfile.label} (auto-apply on)` : 'Not configured'}.
        </p>
        {aiStartupProfile && (
          <button
            type="button"
            onClick={clearAiStartupProfile}
            className="mt-2 text-[10px] px-2 py-1 rounded-md bg-red-500/15 hover:bg-red-500/25"
          >
            Clear Startup Profile
          </button>
        )}
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
