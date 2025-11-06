import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FolderIcon, FileIcon, GraduationCapIcon, PlusIcon, ArrowLeftIcon } from 'lucide-react';
import { Project, Course, Folder } from '@/types';

interface FileManagerProps {
  projects: Project[];
  courses: Course[];
  folders: Folder[];
  currentFolderId: string | null;
  onOpenProject: (projectId: string) => void;
  onOpenCourse: (courseId: string) => void;
  onNavigateToFolder: (folderId: string | null) => void;
  onCreateProject: () => void;
  onCreateCourse: () => void;
  onCreateFolder: () => void;
}

export function FileManager({
  projects,
  courses,
  folders,
  currentFolderId,
  onOpenProject,
  onOpenCourse,
  onNavigateToFolder,
  onCreateProject,
  onCreateCourse,
  onCreateFolder,
}: FileManagerProps) {
  const currentItems = {
    folders: folders.filter(f => f.parentId === currentFolderId),
    projects: projects.filter(p => p.parentId === currentFolderId),
    courses: courses.filter(c => c.parentId === currentFolderId),
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentFolderId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const currentFolder = folders.find(f => f.id === currentFolderId);
                  onNavigateToFolder(currentFolder?.parentId || null);
                }}
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Regresar
              </Button>
            )}
            <h1 className="text-3xl font-bold">Mis Proyectos</h1>
          </div>

          <div className="flex gap-2">
            <Button onClick={onCreateFolder} variant="outline">
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Carpeta
            </Button>
            <Button onClick={onCreateProject} variant="outline">
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
            <Button onClick={onCreateCourse}>
              <GraduationCapIcon className="h-4 w-4 mr-2" />
              Nuevo Curso
            </Button>
          </div>
        </div>

        {/* Grid of items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Folders */}
          {currentItems.folders.map((folder) => (
            <Card
              key={folder.id}
              className="p-4 cursor-pointer hover:border-primary transition-smooth"
              onClick={() => onNavigateToFolder(folder.id)}
            >
              <div className="flex items-center gap-3">
                <FolderIcon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{folder.name}</p>
                  <p className="text-sm text-muted-foreground">Carpeta</p>
                </div>
              </div>
            </Card>
          ))}

          {/* Courses */}
          {currentItems.courses.map((course) => (
            <Card
              key={course.id}
              className="p-4 cursor-pointer hover:border-accent transition-smooth"
              onClick={() => onOpenCourse(course.id)}
            >
              <div className="flex items-center gap-3">
                <GraduationCapIcon className="h-8 w-8 text-accent" />
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.lessons.length} lecciones
                  </p>
                </div>
              </div>
            </Card>
          ))}

          {/* Projects */}
          {currentItems.projects.map((project) => (
            <Card
              key={project.id}
              className="p-4 cursor-pointer hover:border-success transition-smooth"
              onClick={() => onOpenProject(project.id)}
            >
              <div className="flex items-center gap-3">
                <FileIcon className="h-8 w-8 text-success" />
                <div className="flex-1">
                  <p className="font-medium truncate">{project.name}</p>
                  <p className="text-sm text-muted-foreground">{project.language}</p>
                  {project.wpm && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.wpm} WPM • {project.accuracy}%
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {currentItems.folders.length === 0 &&
          currentItems.projects.length === 0 &&
          currentItems.courses.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                No hay proyectos aquí. ¡Crea tu primer proyecto!
              </p>
              <Button onClick={onCreateProject}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Crear Proyecto
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
