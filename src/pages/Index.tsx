import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeBackground } from '@/components/ThemeBackground';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { CreateCourseModal } from '@/components/CreateCourseModal';
import { SettingsModal } from '@/components/SettingsModal';
import { storage } from '@/lib/storage';
import { Project, Course, Folder } from '@/types';
import { generateCode, generateCourseOutline } from '@/services/aiService';
import { performWebSearch, buildSearchQuery } from '@/services/searchService';
import { toast } from 'sonner';
import { Loader2, Zap, Target, TrendingUp, Plus, Settings, Trophy } from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/button';
import { StatsDetailboard } from '@/components/StatsDetailboard';
import { StreakTracker } from '@/components/StreakTracker';
import { Leaderboard } from '@/components/Leaderboard';
import { AchievementsModal, UnlockNotification } from '@/components/AchievementsModal';

import { ACHIEVEMENTS } from '@/types/achievements';


const Index = () => {
  const navigate = useNavigate();
  // const { toast } = useToast(); // Removed
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<any>(null);

  const calculateStreak = (projects: Project[]) => {
    if (!projects.length) return 0;

    const dates = projects.map(p => new Date(p.createdAt || 0).toDateString());
    // Unique dates sorted descending (newest first)
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (!uniqueDates.length) return 0;

    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    // Check if the most recent practice was today or yesterday
    // If last practice was older than yesterday, streak is broken (0), unless we want to show 0.
    // Actually, if last practice was older than yesterday, streak should be 0. 
    // But let's check current consecutive days ending at today OR yesterday.

    const lastPractice = uniqueDates[0];
    if (lastPractice !== today && lastPractice !== yesterday) {
      return 0;
    }

    streak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const curr = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffDays = Math.round((curr.getTime() - next.getTime()) / 86400000);

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Memoize streak to avoid recalculation on every render if projects didn't change? 
  // For now simple variable is fine as projects is state.
  const currentStreak = calculateStreak(projects);

  useEffect(() => {
    // Check for achievements based on loaded projects
    const allStats = {
      projectsCompleted: projects.length,
      maxWPM: Math.max(...projects.map(p => p.wpm || 0), 0),
      perfectProjects: projects.filter(p => (p.accuracy || 0) === 100).length,
      languagesPracticed: new Set(projects.map(p => p.language)).size,
      totalTime: 0,
      currentStreak: currentStreak
    };

    const storedUnlocked = storage.getUnlockedAchievements();
    const newUnlockIds: string[] = [];

    ACHIEVEMENTS.forEach(achievement => {
      if (!storedUnlocked.includes(achievement.id) && achievement.requirement(allStats)) {
        newUnlockIds.push(achievement.id);
        storage.saveUnlockedAchievement(achievement.id);
        setNewlyUnlockedAchievement(achievement);
      }
    });

    if (newUnlockIds.length > 0) {
      setUnlockedAchievements([...storedUnlocked, ...newUnlockIds]);
      // Play sound? (Optional)
    } else {
      setUnlockedAchievements(storedUnlocked);
    }
  }, [projects, currentStreak]);

  useEffect(() => {
    const initialized = storage.initializeDefaultProject();
    if (initialized) {
      toast.success("👋 ¡Bienvenido!", {
        description: "¡Prueba el proyecto demo para comenzar!",
        duration: 5000,
      });
    }
    loadData();
  }, []);

  const loadData = () => {
    setProjects(storage.getProjects());
    setCourses(storage.getCourses());
    setFolders(storage.getFolders());

    const config = storage.getConfig();
    setTheme(config.theme);
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
  };


  // Stats Calculation
  const totalProjects = projects.length;
  const averageWPM = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.wpm || 0), 0) / totalProjects)
    : 0;
  const averageAccuracy = totalProjects > 0
    ? Math.round(projects.reduce((acc, p) => acc + (p.accuracy || 0), 0) / totalProjects)
    : 0;

  const handleCreateProject = useCallback(async (data: { type: any; language: string; prompt: string }) => {
    setIsGenerating(true);
    try {
      const config = storage.getConfig();
      const apiKey = config.aiProvider === 'openai' ? config.openaiKey :
        config.aiProvider === 'grok' ? config.grokKey : config.geminiKey;

      const searchQuery = buildSearchQuery(data.language);
      const searchResult = await performWebSearch(searchQuery, config.searchProvider, config.searchApiKey);

      const result = await generateCode({
        provider: config.aiProvider,
        apiKey,
        model: config.model,
        language: data.language,
        prompt: data.prompt,
        type: data.type,
        searchContext: searchResult.context,
      });

      const project: Project = {
        id: Date.now().toString(),
        name: `${data.language} - ${data.prompt.slice(0, 30)}`,
        type: result.mode,
        language: result.language,
        code: result.code,
        comments: result.comments,
        notes: result.notes,
        description: result.description,
        createdAt: new Date().toISOString(),
        folderId: currentFolderId,
      };

      storage.saveProject(project);
      loadData();

      toast.success('Proyecto creado', {
        description: 'El proyecto se ha generado correctamente',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'No se pudo crear el proyecto',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [currentFolderId]);

  const handleCreateCourse = useCallback(async (data: { language: string; prompt: string }) => {
    setIsGenerating(true);
    try {
      const config = storage.getConfig();
      const apiKey = config.aiProvider === 'openai' ? config.openaiKey :
        config.aiProvider === 'grok' ? config.grokKey : config.geminiKey;

      const searchQuery = buildSearchQuery(data.language);
      const searchResult = await performWebSearch(searchQuery, config.searchProvider, config.searchApiKey);

      const outline = await generateCourseOutline({
        provider: config.aiProvider,
        apiKey,
        model: config.model,
        language: data.language,
        prompt: data.prompt,
        searchContext: searchResult.context,
      });

      const courseId = Date.now().toString();
      const course: Course = {
        id: courseId,
        name: outline.title,
        description: outline.description,
        lessons: [],
        createdAt: new Date().toISOString(),
        folderId: currentFolderId,
      };

      for (let i = 0; i < outline.lessons.length; i++) {
        const lesson = outline.lessons[i];
        const result = await generateCode({
          provider: config.aiProvider,
          apiKey,
          model: config.model,
          language: data.language,
          prompt: lesson.description,
          type: 'editor',
          searchContext: searchResult.context,
        });

        const project: Project = {
          id: `${courseId}-${i}`,
          name: lesson.title,
          type: result.mode,
          language: result.language,
          code: result.code,
          comments: result.comments,
          notes: result.notes,
          description: result.description,
          createdAt: new Date().toISOString(),
          folderId: courseId,
        };

        storage.saveProject(project);
        course.lessons.push(project.id);
      }

      storage.saveCourse(course);
      loadData();
      toast.success('Curso creado', { description: `Se han generado ${outline.lessons.length} lecciones` });
    } catch (error) {
      toast.error('Error', { description: 'No se pudo crear el curso' });
    } finally {
      setIsGenerating(false);
    }
  }, [currentFolderId]);

  return (
    <>
      <div className="min-h-screen bg-gray-950 text-white relative overflow-hidden font-sans">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-950 to-gray-950 z-0" />
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-cyan-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 container mx-auto px-6 py-12">
          <div className="flex justify-between items-start mb-16">
            <div className="flex items-center gap-6">
              <img
                src="/logo.jpg"
                alt="CodeFlow Logo"
                className="w-24 h-24 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] border border-purple-500/30"
              />
              <div>
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-100 to-gray-300 tracking-tight">
                  CodeFlow
                  <span className="block text-purple-400 text-3xl md:text-4xl mt-2 font-light">Master the art of typing code</span>
                </h1>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="border-yellow-500/20 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400"
                onClick={() => setAchievementsOpen(true)}
              >
                <Trophy className="w-5 h-5 mr-2" />
                Achievements
              </Button>
              <Button
                variant="outline"
                className="border-gray-700 bg-gray-900/50 hover:bg-gray-800 text-gray-300"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                onClick={() => setCreateProjectOpen(true)}
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Proyecto
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard
              icon={<Zap />}
              label="PROMEDIO WPM"
              value={averageWPM}
              gradient="from-cyan-500 to-blue-500"
            />
            <StatsCard
              icon={<Target />}
              label="PRECISIÓN MEDIA"
              value={`${averageAccuracy}%`}
              gradient="from-green-500 to-emerald-500"
            />
            <StatsCard
              icon={<TrendingUp />}
              label="PROYECTOS"
              value={totalProjects}
              gradient="from-purple-500 to-pink-500"
            />
          </div>


          {/* Gamification Dashboard */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mt-12 mb-20">
            {/* Left Column: Charts & Streak */}
            <div className="xl:col-span-3 space-y-8">
              <StatsDetailboard projects={projects} />
              <StreakTracker currentStreak={currentStreak} projects={projects} />
            </div>

            {/* Right Column: Leaderboard */}
            <div className="xl:col-span-1 h-full">
              <Leaderboard />
            </div>
          </div>

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-white/90 flex items-center gap-2">
                <span className="w-2 h-8 bg-purple-500 rounded-full" />
                Mis Proyectos
              </h2>
            </div>

            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800 border-dashed backdrop-blur-sm">
                <p className="text-gray-400 mb-6 text-lg">Aún no tienes proyectos creados.</p>
                <Button
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  onClick={() => setCreateProjectOpen(true)}
                >
                  Comenzar ahora
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Modals & Overlays */}
        <CreateProjectModal
          open={createProjectOpen}
          onOpenChange={setCreateProjectOpen}
          onCreateProject={handleCreateProject}
        />

        <CreateCourseModal
          open={createCourseOpen}
          onOpenChange={setCreateCourseOpen}
          onCreateCourse={handleCreateCourse}
        />

        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />

        <AchievementsModal
          isOpen={achievementsOpen}
          onClose={() => setAchievementsOpen(false)}
          achievements={ACHIEVEMENTS}
          unlockedIds={unlockedAchievements}
        />

        <UnlockNotification
          achievement={newlyUnlockedAchievement}
          onClose={() => setNewlyUnlockedAchievement(null)}
        />

        {/* Loading Overlay - Moved to end to prevent structural shifts */}
        {isGenerating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] flex items-center justify-center">
            <div className="text-center space-y-6 p-12 bg-gray-900/90 border border-purple-500/30 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
                <Loader2 className="absolute inset-0 m-auto h-8 w-8 text-purple-400 animate-pulse" />
              </div>
              <div>
                <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 animate-pulse">
                  Creando tu contenido...
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Nuestra IA está escribiendo el código para ti
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Index;
