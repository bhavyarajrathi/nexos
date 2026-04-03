import { OSTheme, OSWallpaper, OSWindow } from './types';

export interface AppUsageSnapshot {
  appId: string;
  opens: number;
  lastOpenedAt: number;
}

export interface SystemTelemetry {
  cpu: number;
  memory: number;
  network: number;
  temperature: number;
  efficiency: number;
  activeWindows: number;
  backgroundLoad: number;
}

export interface ResourceAllocation {
  foreground: number;
  background: number;
  ai: number;
  network: number;
  storage: number;
}

export interface PredictedApp {
  appId: string;
  label: string;
  category: string;
  score: number;
  reason: string;
}

export interface OptimizationStep {
  area: string;
  action: string;
  impact: string;
}

export interface AiInsights {
  summary: string;
  automationMode: string;
  topPicks: PredictedApp[];
  optimizationPlan: OptimizationStep[];
  resourceAllocation: ResourceAllocation;
}

export interface AssistantContext {
  systemSummary: string;
  telemetry: SystemTelemetry;
  topPicks: PredictedApp[];
  optimizationPlan: OptimizationStep[];
  resourceAllocation: ResourceAllocation;
  automationMode: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const appProfiles: Record<string, { label: string; category: string; cpu: number; memory: number; network: number; weight: number }> = {
  calculator: { label: 'Calculator', category: 'Utilities', cpu: 2, memory: 12, network: 0, weight: 1 },
  notepad: { label: 'Notepad', category: 'Productivity', cpu: 2, memory: 16, network: 0, weight: 2 },
  terminal: { label: 'Terminal', category: 'System', cpu: 4, memory: 22, network: 4, weight: 4 },
  files: { label: 'NexFiles', category: 'System', cpu: 4, memory: 28, network: 2, weight: 4 },
  settings: { label: 'Settings', category: 'System', cpu: 3, memory: 20, network: 0, weight: 4 },
  browser: { label: 'Chrome', category: 'Internet', cpu: 10, memory: 42, network: 16, weight: 5 },
  sailor: { label: 'Sailor', category: 'Internet', cpu: 8, memory: 36, network: 14, weight: 4 },
  weather: { label: 'Weather', category: 'Utilities', cpu: 3, memory: 14, network: 8, weight: 2 },
  music: { label: 'Music', category: 'Media', cpu: 6, memory: 28, network: 10, weight: 3 },
  camera: { label: 'Camera', category: 'Media', cpu: 8, memory: 24, network: 0, weight: 3 },
  clock: { label: 'Clock', category: 'Utilities', cpu: 1, memory: 8, network: 0, weight: 1 },
  photos: { label: 'Photos', category: 'Media', cpu: 6, memory: 30, network: 4, weight: 3 },
  calendar: { label: 'Calendar', category: 'Productivity', cpu: 4, memory: 18, network: 4, weight: 4 },
  taskmanager: { label: 'Task Manager', category: 'System', cpu: 5, memory: 24, network: 2, weight: 5 },
  ai: { label: 'NexOS AI', category: 'AI', cpu: 7, memory: 28, network: 12, weight: 8 },
  maps: { label: 'Maps', category: 'Utilities', cpu: 6, memory: 20, network: 16, weight: 3 },
  mail: { label: 'Mail', category: 'Internet', cpu: 5, memory: 22, network: 12, weight: 4 },
  todo: { label: 'To-Do', category: 'Productivity', cpu: 3, memory: 14, network: 2, weight: 3 },
  paint: { label: 'Paint', category: 'Creative', cpu: 7, memory: 26, network: 0, weight: 3 },
  video: { label: 'Video Player', category: 'Media', cpu: 9, memory: 34, network: 8, weight: 3 },
  code: { label: 'Code Editor', category: 'Development', cpu: 11, memory: 44, network: 8, weight: 5 },
  snake: { label: 'Snake Game', category: 'Games', cpu: 5, memory: 18, network: 0, weight: 2 },
  contacts: { label: 'Contacts', category: 'Productivity', cpu: 3, memory: 12, network: 2, weight: 2 },
  books: { label: 'Books', category: 'Media', cpu: 3, memory: 16, network: 4, weight: 2 },
  vpn: { label: 'NexVpn', category: 'Security', cpu: 6, memory: 20, network: 10, weight: 4 },
};

const fallbackProfile = { label: 'App', category: 'General', cpu: 4, memory: 18, network: 4, weight: 1 };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const getProfile = (appId: string) => appProfiles[appId] ?? fallbackProfile;

const getTimeBias = (hour: number) => {
  if (hour >= 6 && hour < 10) return ['Calendar', 'Mail', 'To-Do', 'Chrome'];
  if (hour >= 10 && hour < 15) return ['Code Editor', 'Terminal', 'NexFiles', 'Chrome'];
  if (hour >= 15 && hour < 19) return ['Photos', 'Maps', 'Music', 'Mail'];
  if (hour >= 19 && hour < 23) return ['Video Player', 'Music', 'Books', 'Paint'];
  return ['Notepad', 'Settings', 'NexOS AI', 'Chrome'];
};

export const buildSystemTelemetry = (
  windows: OSWindow[],
  usage: Record<string, AppUsageSnapshot>,
  pulse = 0
): SystemTelemetry => {
  const activeWindows = windows.filter(window => !window.minimized);
  const activeWindowCount = activeWindows.length;
  const appLoad = activeWindows.reduce((total, window) => {
    const profile = getProfile(window.appId);
    return total + profile.cpu + profile.memory / 12 + profile.network / 8;
  }, 0);
  const recentUsageLoad = Object.values(usage).reduce((total, entry) => total + Math.min(entry.opens * 1.4, 12), 0);
  const networkLoad = activeWindows.reduce((total, window) => total + getProfile(window.appId).network, 0);

  const cpu = clamp(Math.round(16 + activeWindowCount * 6.5 + appLoad * 1.6 + (pulse % 5) * 1.2), 4, 96);
  const memory = clamp(Math.round(24 + activeWindowCount * 5.2 + appLoad * 2.1 + recentUsageLoad), 8, 97);
  const network = clamp(Math.round(12 + networkLoad * 1.5 + activeWindowCount * 2.2 + (pulse % 7)), 0, 100);
  const temperature = clamp(Math.round(32 + cpu * 0.28 + memory * 0.12 + activeWindowCount * 0.6), 30, 92);
  const efficiency = clamp(Math.round(100 - cpu * 0.42 - memory * 0.26 - network * 0.08), 12, 100);
  const backgroundLoad = clamp(Math.round(18 + recentUsageLoad * 1.3 + activeWindowCount * 3.2), 8, 100);

  return {
    cpu,
    memory,
    network,
    temperature,
    efficiency,
    activeWindows: activeWindowCount,
    backgroundLoad,
  };
};

export const buildResourceAllocation = (telemetry: SystemTelemetry): ResourceAllocation => {
  const foreground = clamp(Math.round(30 + telemetry.activeWindows * 4 + telemetry.cpu * 0.18), 20, 56);
  const background = clamp(Math.round(18 + telemetry.backgroundLoad * 0.28), 12, 42);
  const ai = clamp(Math.round(10 + (100 - telemetry.efficiency) * 0.22), 8, 34);
  const network = clamp(Math.round(12 + telemetry.network * 0.2), 10, 34);
  const storage = clamp(Math.round(100 - (foreground * 0.55 + background * 0.4 + ai * 0.35 + network * 0.3)), 8, 34);

  return { foreground, background, ai, network, storage };
};

export const buildPredictedApps = (
  usage: Record<string, AppUsageSnapshot>,
  windows: OSWindow[]
): PredictedApp[] => {
  const hour = new Date().getHours();
  const timeBias = getTimeBias(hour);
  const activeIds = new Set(windows.map(window => window.appId));

  const scores = Object.keys(appProfiles).map(appId => {
    const profile = getProfile(appId);
    const history = usage[appId];
    const recency = history ? Math.max(0, 48 - (Date.now() - history.lastOpenedAt) / 3_600_000) : 0;
    const frequency = history ? Math.min(history.opens * 10, 28) : 0;
    const timeMatch = timeBias.includes(profile.label) ? 14 : 0;
    const categoryBoost = activeIds.size > 0 && Array.from(activeIds).some(id => getProfile(id).category === profile.category) ? 8 : 0;
    const appInFocusBoost = activeIds.has(appId) ? -8 : 0;
    const score = profile.weight * 2 + frequency + recency * 0.65 + timeMatch + categoryBoost + appInFocusBoost;

    return {
      appId,
      label: profile.label,
      category: profile.category,
      score,
      reason: history
        ? `You opened it ${history.opens} time${history.opens === 1 ? '' : 's'} recently.`
        : timeMatch > 0
          ? `It matches your current time-of-day workflow.`
          : `It complements your active apps and usage patterns.`,
    } satisfies PredictedApp;
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(entry => ({ ...entry, score: Math.round(entry.score) }));
};

export const buildOptimizationPlan = (telemetry: SystemTelemetry): OptimizationStep[] => {
  const plan: OptimizationStep[] = [];

  if (telemetry.cpu >= 65) {
    plan.push({
      area: 'CPU',
      action: 'Prioritize foreground windows and defer background effects.',
      impact: 'Reduce perceived lag and keep interactions responsive.',
    });
  }

  if (telemetry.memory >= 68) {
    plan.push({
      area: 'Memory',
      action: 'Consolidate inactive windows and keep only high-value apps warm.',
      impact: 'Free memory for the apps you are actively using.',
    });
  }

  if (telemetry.network >= 55) {
    plan.push({
      area: 'Network',
      action: 'Delay sync-heavy tasks until the system is idle.',
      impact: 'Avoid bandwidth spikes during browsing and media playback.',
    });
  }

  if (!plan.length) {
    plan.push({
      area: 'Workflow',
      action: 'Keep the current balance and pre-load the apps you open most.',
      impact: 'Maintain a fast, low-friction desktop without changing the style.',
    });
  }

  return plan;
};

export const buildAiInsights = (
  windows: OSWindow[],
  usage: Record<string, AppUsageSnapshot>,
  pulse = 0
): AiInsights => {
  const telemetry = buildSystemTelemetry(windows, usage, pulse);
  const resourceAllocation = buildResourceAllocation(telemetry);
  const topPicks = buildPredictedApps(usage, windows);
  const automationMode = telemetry.efficiency >= 72 ? 'Performance' : telemetry.cpu >= 68 ? 'Efficiency' : 'Balanced';
  const optimizationPlan = buildOptimizationPlan(telemetry);
  const summary = `NexOS is running in ${automationMode.toLowerCase()} mode with ${telemetry.activeWindows} active window${telemetry.activeWindows === 1 ? '' : 's'}. CPU is at ${telemetry.cpu}%, memory at ${telemetry.memory}%, and the system is prioritizing ${topPicks[0]?.label ?? 'your most useful app'}.`;

  return {
    summary,
    automationMode,
    topPicks,
    optimizationPlan,
    resourceAllocation,
  };
};

export const buildAssistantContext = (
  windows: OSWindow[],
  usage: Record<string, AppUsageSnapshot>,
  theme: OSTheme,
  wallpaper: OSWallpaper,
  pulse = 0
): AssistantContext => {
  const insights = buildAiInsights(windows, usage, pulse);

  return {
    systemSummary: `${insights.summary} Theme ${theme.name} and wallpaper ${wallpaper.name} are active.`,
    telemetry: buildSystemTelemetry(windows, usage, pulse),
    topPicks: insights.topPicks,
    optimizationPlan: insights.optimizationPlan,
    resourceAllocation: insights.resourceAllocation,
    automationMode: insights.automationMode,
  };
};

export const generateAssistantReply = async (
  messages: ChatMessage[],
  context: AssistantContext
): Promise<string> => {

  const userMessage = messages[messages.length - 1]?.content ?? '';
  const lower = userMessage.toLowerCase();

  if (lower.includes('help') || lower.includes('what can')) {
    return `I can help with app launches, system status, app usage prediction, settings, calculations, and workflow optimization. Right now your system is in ${context.automationMode.toLowerCase()} mode, and the most likely next app is ${context.topPicks[0]?.label ?? 'an app you use often'}.`;
  }

  if (lower.includes('system') || lower.includes('status') || lower.includes('health')) {
    return `System status: CPU ${context.telemetry.cpu}%, memory ${context.telemetry.memory}%, network ${context.telemetry.network}%, efficiency ${context.telemetry.efficiency}%. I am prioritizing foreground work and can suggest the best next app if you want.`;
  }

  if (lower.includes('what should i open') || lower.includes('suggest') || lower.includes('recommend')) {
    const top = context.topPicks[0];
    if (top) {
      return `Open ${top.label} next. ${top.reason}`;
    }
  }

  if (lower.includes('theme')) {
    return `You are currently using ${context.systemSummary}. If you want, I can help you choose a better theme from Settings based on your current workflow.`;
  }

  const recentApps = context.topPicks.slice(0, 3).map(app => app.label).join(', ');
  return `I’m online and local. I can respond to commands, explain your system state, and predict your next app. Based on usage, you are most likely to open ${recentApps || 'your usual apps'} next.`;
};