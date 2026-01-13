import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { Code, Clock, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectCardProps {
    project: Project;
}

export const ProjectCard = React.memo(({ project }: ProjectCardProps) => {
    const navigate = useNavigate();

    return (
        <Card
            className="group relative overflow-hidden bg-gray-900/50 border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer"
            onClick={() => navigate(`/practice?id=${project.id}`)}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                        {project.language}
                    </Badge>
                    {project.wpm && (
                        <span className="text-xs font-mono text-cyan-400">
                            {project.wpm} WPM
                        </span>
                    )}
                </div>
                <CardTitle className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors line-clamp-1">
                    {project.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-gray-500" />
                        <span>{Array.isArray(project.code) ? project.code.length : project.code.split('\n').length} lines</span>
                    </div>
                    {project.completed ? (
                        <div className="flex items-center gap-2 text-green-400">
                            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 px-2 py-0 h-5 text-[10px]">COMPLETED</Badge>
                        </div>
                    ) : (project.progress && project.progress > 0) ? (
                        <div className="flex items-center gap-2 w-full">
                            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-purple-500 rounded-full"
                                    style={{ width: `${Math.min(project.progress, 100)}%` }}
                                />
                            </div>
                            <span className="text-xs text-purple-400">{Math.round(project.progress)}%</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Not started</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center text-purple-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 transition-transform duration-300">
                    Practice Now <ChevronRight className="w-4 h-4 ml-1" />
                </div>
            </CardContent>
        </Card>
    );
});

ProjectCard.displayName = 'ProjectCard';
