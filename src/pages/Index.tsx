import { useState, useEffect } from 'react';
import { FileManager } from '@/components/FileManager';
import { ThemeBackground } from '@/components/ThemeBackground';
import { storage } from '@/lib/storage';
import { Project, Course, Folder } from '@/types';

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Load data from storage
    setProjects(storage.getProjects());
    setCourses(storage.getCourses());
    setFolders(storage.getFolders());
    
    const config = storage.getConfig();
    setTheme(config.theme);
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', config.theme === 'dark');
  }, []);

  const handleOpenProject = (projectId: string) => {
    console.log('Open project:', projectId);
    // TODO: Navigate to practice view
  };

  const handleOpenCourse = (courseId: string) => {
    console.log('Open course:', courseId);
    // TODO: Show course lessons
  };

  const handleCreateProject = () => {
    console.log('Create project');
    // TODO: Open create project modal
  };

  const handleCreateCourse = () => {
    console.log('Create course');
    // TODO: Open create course modal
  };

  const handleCreateFolder = () => {
    console.log('Create folder');
    // TODO: Open create folder modal
  };

  return (
    <>
      <ThemeBackground theme={theme} />
      <FileManager
        projects={projects}
        courses={courses}
        folders={folders}
        currentFolderId={currentFolderId}
        onOpenProject={handleOpenProject}
        onOpenCourse={handleOpenCourse}
        onNavigateToFolder={setCurrentFolderId}
        onCreateProject={handleCreateProject}
        onCreateCourse={handleCreateCourse}
        onCreateFolder={handleCreateFolder}
      />
    </>
  );
};

export default Index;
