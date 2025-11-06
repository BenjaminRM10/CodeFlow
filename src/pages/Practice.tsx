import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Project } from '@/types';
import { calculateMetrics } from '@/utils/metricsCalculator';
import { ThemeBackground } from '@/components/ThemeBackground';

export default function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('id');
  const [project, setProject] = useState<Project | null>(null);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [activeTime, setActiveTime] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const codeAreaRef = useRef<HTMLDivElement>(null);
  const config = storage.getConfig();

  useEffect(() => {
    const cfg = storage.getConfig();
    setTheme(cfg.theme);
    
    if (!projectId) {
      navigate('/');
      return;
    }

    const projects = storage.getProjects();
    const found = projects.find(p => p.id === projectId);
    if (found) {
      setProject(found);
      setTypedLines(Array(found.code.length).fill(''));
    } else {
      navigate('/');
    }
  }, [projectId, navigate]);

  useEffect(() => {
    let interval: number;
    if (isActive && startTime) {
      interval = window.setInterval(() => {
        setActiveTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive || !project) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentLine < project.code.length - 1) {
        setCurrentLine(currentLine + 1);
        setCurrentCol(0);
        scrollToLine(currentLine + 1);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      if (currentCol > 0) {
        const newLines = [...typedLines];
        newLines[currentLine] = newLines[currentLine].slice(0, -1);
        setTypedLines(newLines);
        setCurrentCol(currentCol - 1);
      } else if (currentLine > 0) {
        setCurrentLine(currentLine - 1);
        setCurrentCol(typedLines[currentLine - 1].length);
        scrollToLine(currentLine - 1);
      }
    } else if (e.key.length === 1) {
      e.preventDefault();
      const expected = project.code[currentLine][currentCol];
      const newLines = [...typedLines];
      newLines[currentLine] += e.key;
      setTypedLines(newLines);

      if (e.key !== expected) {
        const errorKey = `${currentLine}-${currentCol}`;
        setErrors(new Set([...errors, errorKey]));
      }

      setCurrentCol(currentCol + 1);
      
      // Horizontal scroll
      if (codeAreaRef.current) {
        const charWidth = 9.6; // approximate monospace char width
        const containerWidth = codeAreaRef.current.offsetWidth;
        const scrollThreshold = containerWidth - 30 * charWidth;
        if (currentCol * charWidth > scrollThreshold) {
          codeAreaRef.current.scrollLeft = (currentCol - 30) * charWidth;
        }
      }
    }
  };

  useEffect(() => {
    if (isActive) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, currentLine, currentCol, typedLines, errors, project]);

  const scrollToLine = (lineIndex: number) => {
    if (codeAreaRef.current) {
      const lineHeight = 24;
      const containerHeight = codeAreaRef.current.offsetHeight;
      const targetScroll = lineIndex * lineHeight - containerHeight / 2;
      codeAreaRef.current.scrollTop = Math.max(0, targetScroll);
    }
  };

  const togglePractice = () => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now() - activeTime);
    } else {
      setIsActive(false);
    }
  };

  const reset = () => {
    setCurrentLine(0);
    setCurrentCol(0);
    setTypedLines(Array(project?.code.length || 0).fill(''));
    setErrors(new Set());
    setIsActive(false);
    setStartTime(null);
    setActiveTime(0);
  };

  if (!project) return null;

  const totalChars = project.code.join('').length;
  const typedChars = typedLines.join('').length;
  const metrics = calculateMetrics(typedChars, errors.size, activeTime);
  const progress = (typedChars / totalChars) * 100;

  return (
    <>
      <ThemeBackground theme={theme} />
      <div className="min-h-screen flex flex-col">
        {/* Top Bar */}
        <div className="border-b bg-background/80 backdrop-blur-sm px-4 py-2 flex items-center justify-between sticky top-0 z-10">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar
          </Button>

          <div className="flex items-center gap-6">
            <div className="text-sm">
              <span className="text-muted-foreground">WPM:</span>{' '}
              <span className="font-mono font-bold">{metrics.wpm}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Precisión:</span>{' '}
              <span className="font-mono font-bold">{metrics.accuracy}%</span>
            </div>
            <div className="w-32">
              <Progress value={progress} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={reset}>
              Reiniciar
            </Button>
            <Button size="sm" onClick={togglePractice}>
              {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isActive ? 'Pausar' : 'Empezar'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Code Area */}
          <div
            ref={codeAreaRef}
            className="flex-[3] overflow-auto bg-card/50 backdrop-blur-sm p-8 font-mono text-sm"
            style={{ scrollBehavior: 'smooth' }}
          >
            {project.code.map((line, lineIdx) => (
              <div key={lineIdx} className="flex items-center min-h-[24px]" style={{ lineHeight: '24px' }}>
                <span className="text-muted-foreground mr-4 select-none w-8 text-right">
                  {lineIdx + 1}
                </span>
                <div className="flex-1 relative whitespace-pre">
                  {line.split('').map((char, charIdx) => {
                    const typed = typedLines[lineIdx]?.[charIdx];
                    const hasError = errors.has(`${lineIdx}-${charIdx}`);
                    const isCurrent = lineIdx === currentLine && charIdx === currentCol;

                    return (
                      <span key={charIdx} className="relative">
                        {isCurrent && isActive && (
                          <span className="absolute inset-0 border-l-2 border-primary animate-pulse" />
                        )}
                        <span
                          className={
                            typed === undefined
                              ? 'text-muted-foreground'
                              : hasError
                              ? 'text-destructive bg-destructive/20'
                              : 'text-green-500'
                          }
                        >
                          {char}
                        </span>
                      </span>
                    );
                  })}
                  {lineIdx === currentLine && currentCol === line.length && isActive && (
                    <span className="inline-block w-0 border-l-2 border-primary animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Comments Panel */}
          {config.showComments && (
            <div className="flex-1 border-l overflow-auto bg-card/50 backdrop-blur-sm p-6">
              <h3 className="font-semibold mb-4 text-sm uppercase text-muted-foreground">Comentarios</h3>
              <div className="space-y-4">
                {isActive ? (
                  // Show only current line comment when active
                  <div className="text-sm text-foreground">
                    <span className="text-muted-foreground font-mono">Línea {currentLine + 1}:</span>
                    <p className="mt-2">{project.comments[currentLine]}</p>
                  </div>
                ) : (
                  // Show all comments when paused
                  project.comments.map((comment, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-muted-foreground font-mono">Línea {idx + 1}:</span>
                      <p className="mt-1 text-foreground">{comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
