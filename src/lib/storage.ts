import { AppConfig, Project, Course, Folder, DailyProgress } from '@/types';
import { DEFAULT_DEMO_PROJECT } from '@/data/defaultProject';

const STORAGE_KEYS = {
  CONFIG: 'appcreator_config',
  PROJECTS: 'appcreator_projects',
  COURSES: 'appcreator_courses',
  FOLDERS: 'appcreator_folders',
  DAILY_PROGRESS: 'appcreator_daily_progress',
};

const DEFAULT_CONFIG: AppConfig = {
  aiProvider: 'openai',
  openaiKey: '',
  grokKey: '',
  geminiKey: '',
  model: 'gpt-4o',
  searchProvider: 'serper',
  searchApiKey: '',
  showComments: true,
  showKeyboard: true,
  dailyGoalMinutes: 15,
  appLanguage: 'es',
  keyboardLayout: 'es',
  theme: 'dark',
};

export const storage = {
  // Config
  getConfig(): AppConfig {
    const stored = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
  },

  setConfig(config: AppConfig): void {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  },

  // Projects
  getProjects(): Project[] {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  },

  saveProject(project: Project): void {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  deleteProject(id: string): void {
    const projects = this.getProjects().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },

  // Courses
  getCourses(): Course[] {
    const stored = localStorage.getItem(STORAGE_KEYS.COURSES);
    return stored ? JSON.parse(stored) : [];
  },

  saveCourse(course: Course): void {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  deleteCourse(id: string): void {
    const courses = this.getCourses().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
  },

  // Folders
  getFolders(): Folder[] {
    const stored = localStorage.getItem(STORAGE_KEYS.FOLDERS);
    return stored ? JSON.parse(stored) : [];
  },

  saveFolder(folder: Folder): void {
    const folders = this.getFolders();
    const index = folders.findIndex(f => f.id === folder.id);
    if (index >= 0) {
      folders[index] = folder;
    } else {
      folders.push(folder);
    }
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  },

  deleteFolder(id: string): void {
    const folders = this.getFolders().filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
  },

  // Daily Progress
  getDailyProgress(): DailyProgress[] {
    const stored = localStorage.getItem(STORAGE_KEYS.DAILY_PROGRESS);
    return stored ? JSON.parse(stored) : [];
  },

  updateDailyProgress(date: string, minutesPracticed: number, projectsCompleted: number): void {
    const progress = this.getDailyProgress();
    const today = progress.find(p => p.date === date);

    if (today) {
      today.minutesPracticed += minutesPracticed;
      today.projectsCompleted += projectsCompleted;
    } else {
      progress.push({ date, minutesPracticed, projectsCompleted });
    }

    localStorage.setItem(STORAGE_KEYS.DAILY_PROGRESS, JSON.stringify(progress));
  },

  initializeDefaultProject(): boolean {
    const projects = this.getProjects();
    if (projects.length === 0) {
      this.saveProject(DEFAULT_DEMO_PROJECT);
      return true;
    }
    return false;
  },
};
