import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileManager } from '@/components/FileManager';
import { ThemeBackground } from '@/components/ThemeBackground';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { CreateCourseModal } from '@/components/CreateCourseModal';
import { SettingsModal } from '@/components/SettingsModal';
import { storage } from '@/lib/storage';
import { Project, Course, Folder } from '@/types';
import { generateCode, generateCourseOutline } from '@/services/aiService';
import { performWebSearch, buildSearchQuery } from '@/services/searchService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const initialized = storage.initializeDefaultProject();
    if (initialized) {
      toast({
        title: "👋 ¡Bienvenido!",
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

  const handleOpenProject = (projectId: string) => {
    navigate(`/practice?id=${projectId}`);
  };

  const handleOpenCourse = (courseId: string) => {
    setCurrentFolderId(courseId);
  };

  const handleCreateProject = async (data: { type: any; language: string; prompt: string }) => {
    setIsGenerating(true);
    try {
      const config = storage.getConfig();
      const apiKey = config.aiProvider === 'openai' ? config.openaiKey :
        config.aiProvider === 'grok' ? config.grokKey : config.geminiKey;

      // Perform web search
      const searchQuery = buildSearchQuery(data.language);
      const searchResult = await performWebSearch(searchQuery, config.searchProvider, config.searchApiKey);

      // Generate code
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
        createdAt: new Date().toISOString(),
        folderId: currentFolderId,
      };

      storage.saveProject(project);
      loadData();

      toast({
        title: 'Proyecto creado',
        description: 'El proyecto se ha generado correctamente',
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el proyecto',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateCourse = async (data: { language: string; prompt: string }) => {
    setIsGenerating(true);
    try {
      const config = storage.getConfig();
      const apiKey = config.aiProvider === 'openai' ? config.openaiKey :
        config.aiProvider === 'grok' ? config.grokKey : config.geminiKey;

      // Perform web search once for the entire course
      const searchQuery = buildSearchQuery(data.language);
      const searchResult = await performWebSearch(searchQuery, config.searchProvider, config.searchApiKey);

      // Generate course outline
      const outline = await generateCourseOutline({
        provider: config.aiProvider,
        apiKey,
        model: config.model,
        language: data.language,
        prompt: data.prompt,
        searchContext: searchResult.context,
      });

      // Create course folder
      const courseId = Date.now().toString();
      const course: Course = {
        id: courseId,
        name: outline.title,
        description: outline.description,
        lessons: [],
        createdAt: new Date().toISOString(),
        folderId: currentFolderId,
      };

      // Generate each lesson
      for (let i = 0; i < outline.lessons.length; i++) {
        const lesson = outline.lessons[i];

        const result = await generateCode({
          provider: config.aiProvider,
          apiKey,
          model: config.model,
          language: data.language,
          prompt: lesson.description,
          type: 'editor',
          searchContext: searchResult.context, // Reuse the same search context
        });

        const project: Project = {
          id: `${courseId}-${i}`,
          name: lesson.title,
          type: result.mode,
          language: result.language,
          code: result.code,
          comments: result.comments,
          createdAt: new Date().toISOString(),
          folderId: courseId,
        };

        storage.saveProject(project);
        course.lessons.push(project.id);
      }

      storage.saveCourse(course);
      loadData();

      toast({
        title: 'Curso creado',
        description: `Se han generado ${outline.lessons.length} lecciones`,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear el curso',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Nombre de la carpeta:');
    if (!name) return;

    const folder: Folder = {
      id: Date.now().toString(),
      name,
      parentId: currentFolderId,
      createdAt: new Date().toISOString(),
    };

    storage.saveFolder(folder);
    loadData();
  };

  return (
    <>
      <ThemeBackground theme={theme} />

      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-semibold">Estamos creando tu contenido...</p>
            <p className="text-sm text-muted-foreground">Esto puede tomar unos minutos</p>
          </div>
        </div>
      )}

      <FileManager
        projects={projects}
        courses={courses}
        folders={folders}
        currentFolderId={currentFolderId}
        onOpenProject={handleOpenProject}
        onOpenCourse={handleOpenCourse}
        onNavigateToFolder={setCurrentFolderId}
        onCreateProject={() => setCreateProjectOpen(true)}
        onCreateCourse={() => setCreateCourseOpen(true)}
        onCreateFolder={handleCreateFolder}
        onOpenSettings={() => setSettingsOpen(true)}
      />

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
    </>
  );
};

export default Index;
