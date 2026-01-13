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
  // AI Configuration
  aiProvider: AIProvider;
  openaiKey: string;
  grokKey: string;
  geminiKey: string;
  model: string;

  // Search Configuration
  searchProvider: SearchProvider;
  searchApiKey: string;

  // Features
  showComments: boolean;
  showKeyboard: boolean;

  // Goals
  dailyGoalMinutes: number;

  // Internationalization
  appLanguage: 'es' | 'en';
  keyboardLayout: 'es' | 'en';

  // Theme
  theme: 'light' | 'dark';
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
