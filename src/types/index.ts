export type ProjectType = 'terminal' | 'editor';

export type AIProvider = 'openai' | 'grok' | 'gemini';

export type SearchProvider = 'bing' | 'google' | 'serpapi' | 'serper';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  language: string;
  code: string[] | string; // Support both for now, migration later
  comments?: string[]; // Legacy
  notes?: Array<{ line: number; content: string }>; // New format
  description?: string;
  createdAt: string;
  folderId: string | null;
  wpm?: number;
  accuracy?: number;
  lastPracticed?: string;
  completed?: boolean;
  progress?: number;
}

export interface Course {
  id: string;
  name: string;
  language?: string;
  description: string;
  lessons: string[];
  createdAt: string;
  folderId: string | null;
  searchContext?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface AppConfig {
  // Features
  showComments: boolean;
  showKeyboard: boolean;
  showFingerGuide: boolean;

  // Audio
  soundEnabled: boolean;
  soundVolume: number; // 0-1
  soundType: 'mechanical' | 'laptop' | 'bubble';

  // Visuals
  fontSize: 'small' | 'medium' | 'large';
  cursorStyle: 'block' | 'line' | 'underline';
  smoothCaret: boolean;

  // Goals
  dailyGoalMinutes: number;

  // Internationalization
  appLanguage: 'es' | 'en';
  keyboardLayout: 'es' | 'en';

  // Theme
  theme: 'light' | 'dark';

  // AI & Search Configuration (Backing for env vars and user overrides)
  aiProvider: AIProvider;
  model: string;
  openaiKey?: string;
  grokKey?: string;
  geminiKey?: string;
  searchProvider: SearchProvider;
  searchApiKey?: string;
}

export interface TypingMetrics {
  totalCharacters: number;
  correctCharacters: number;
  errorPositions: Set<number>;
  activeTimeMs: number;
  startTime: number | null;
  isPaused: boolean;
}

export interface DailyProgress {
  date: string;
  minutesPracticed: number;
  projectsCompleted: number;
}
