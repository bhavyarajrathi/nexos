import Calculator from './apps/Calculator';
import Notepad from './apps/Notepad';
import Terminal from './apps/Terminal';
import FileManager from './apps/FileManager';
import Settings from './apps/Settings';
import Browser from './apps/Browser';
import Weather from './apps/Weather';
import MusicPlayer from './apps/MusicPlayer';
import Camera from './apps/Camera';
import ClockApp from './apps/Clock';
import Photos from './apps/Photos';
import CalendarApp from './apps/Calendar';
import TaskManager from './apps/TaskManager';
import AIAssistant from './apps/AIAssistant';
import Maps from './apps/Maps';
import MailApp from './apps/Mail';

export interface AppDef {
  id: string;
  name: string;
  icon: string;
  component: React.FC;
  category: string;
}

export const apps: AppDef[] = [
  { id: 'calculator', name: 'Calculator', icon: '🧮', component: Calculator, category: 'Utilities' },
  { id: 'notepad', name: 'Notepad', icon: '📝', component: Notepad, category: 'Productivity' },
  { id: 'terminal', name: 'Terminal', icon: '💻', component: Terminal, category: 'System' },
  { id: 'files', name: 'Files', icon: '📁', component: FileManager, category: 'System' },
  { id: 'settings', name: 'Settings', icon: '⚙️', component: Settings, category: 'System' },
  { id: 'browser', name: 'Browser', icon: '🌐', component: Browser, category: 'Internet' },
  { id: 'weather', name: 'Weather', icon: '🌤️', component: Weather, category: 'Utilities' },
  { id: 'music', name: 'Music', icon: '🎵', component: MusicPlayer, category: 'Media' },
  { id: 'camera', name: 'Camera', icon: '📷', component: Camera, category: 'Media' },
  { id: 'clock', name: 'Clock', icon: '🕐', component: ClockApp, category: 'Utilities' },
  { id: 'photos', name: 'Photos', icon: '🖼️', component: Photos, category: 'Media' },
  { id: 'calendar', name: 'Calendar', icon: '📅', component: CalendarApp, category: 'Productivity' },
  { id: 'taskmanager', name: 'Task Manager', icon: '📊', component: TaskManager, category: 'System' },
  { id: 'ai', name: 'NOVA AI', icon: '🤖', component: AIAssistant, category: 'AI' },
  { id: 'maps', name: 'Maps', icon: '🗺️', component: Maps, category: 'Utilities' },
  { id: 'mail', name: 'Mail', icon: '✉️', component: MailApp, category: 'Internet' },
];
