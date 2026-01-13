import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Project } from '@/types';
import { ThemeBackground } from '@/components/ThemeBackground';



interface CharacterState {
  status: 'correct' | 'incorrect' | 'pending';
  attempts: number;
  corrected: boolean;
}

// Ensure code is always array for practice
interface PracticeProject extends Omit<Project, 'code'> {
  code: string[];
}

export default function Practice() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('id');
  const [project, setProject] = useState<PracticeProject | null>(null);

  // State for tracking position
  const [currentLine, setCurrentLine] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  // State for typing content
  const [typedLines, setTypedLines] = useState<string[]>([]);

  // New state for detailed character tracking
  const [charStates, setCharStates] = useState<Record<string, CharacterState>>({});

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
      const codeArray = Array.isArray(found.code) ? found.code : found.code.split('\n');
      setProject({ ...found, code: codeArray });
      setTypedLines(Array(codeArray.length).fill(''));
      // Initialize charStates could be lazy, but empty is fine
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

    const key = `${currentLine}-${currentCol}`;

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
        // Backspace within line
        const newLines = [...typedLines];
        newLines[currentLine] = newLines[currentLine].slice(0, -1);
        setTypedLines(newLines);

        // Reset state for the deleted character
        const charKey = `${currentLine}-${currentCol - 1}`;
        setCharStates(prev => {
          const next = { ...prev };
          // Don't delete, just set to pending so we keep attempts history?
          // Actually requirements say "NO penalizar precisión", implies we keep attempts history?
          // But if we delete, we are "un-typing". 
          // Let's keep the record but mark as pending or remove status.
          // If we remove from map, we lose attempt count. 
          // Let's update it to pending.
          if (next[charKey]) {
            next[charKey] = { ...next[charKey], status: 'pending' };
          }
          return next;
        });

        setCurrentCol(currentCol - 1);
      } else if (currentLine > 0) {
        // Backspace to previous line
        setCurrentLine(currentLine - 1);
        const prevLineLen = typedLines[currentLine - 1].length;
        setCurrentCol(prevLineLen);
        scrollToLine(currentLine - 1);
      }
    } else if (e.key.length === 1) {
      e.preventDefault();

      const expectedLine = project.code[currentLine] || '';
      // Prevent typing beyond line length
      if (currentCol >= expectedLine.length) return;

      const expected = expectedLine[currentCol];
      const isCorrect = e.key === expected;

      const newLines = [...typedLines];
      newLines[currentLine] += e.key;
      setTypedLines(newLines);

      // Update character state
      setCharStates(prev => {
        const currentState = prev[key] || { attempts: 0, corrected: false, status: 'pending' };
        const newAttempts = currentState.attempts + 1;

        // corrected = true if it was corrected (meaning attempts > 0 and now it is correct)
        // Actually attempts counts EVERY try. 
        // If it was previously incorrect (implied by attempts > 0 before this success?), 
        // Or simply if this is a success and attempts > 1?
        // Let's follow: "corrected: currentState.attempts > 0 && isCorrect" (from agent.md example)
        // Wait, currentState.attempts is previous attempts.
        // If previous attempts > 0, it means we tried before. 
        // If we tried before, we presumably failed or backspaced.

        return {
          ...prev,
          [key]: {
            index: currentCol, // Not strictly needed in map but useful
            status: isCorrect ? 'correct' : 'incorrect',
            attempts: newAttempts,
            corrected: currentState.attempts > 0 && isCorrect
          } as CharacterState
        };
      });

      setCurrentCol(currentCol + 1);

      // Horizontal scroll
      if (codeAreaRef.current) {
        const charWidth = 9.6;
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
  }, [isActive, currentLine, currentCol, typedLines, charStates, project]); // Added charStates dependency

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
      setStartTime(prev => prev ? prev : Date.now() - activeTime); // Resume correctly
    } else {
      setIsActive(false);
      setStartTime(null); // Pause logic needs check
    }
  };

  // Fix pause logic: When pausing, we stop updating activeTime. 
  // When resuming, we need a new startTime that accounts for already elapsed activeTime.
  // togglePractice above does: setStartTime(Date.now() - activeTime) which is correct for resume.

  const reset = () => {
    setCurrentLine(0);
    setCurrentCol(0);
    setTypedLines(Array(project?.code.length || 0).fill(''));
    setCharStates({});
    setIsActive(false);
    setStartTime(null);
    setActiveTime(0);
  };

  if (!project) return null;

  // Metrics Calculation
  const calculateMetricsLocal = () => {
    const totalChars = project.code.join('').length;
    const typedCount = Object.values(charStates).filter(s => s.status !== 'pending').length;

    // Count errors: currently incorrect
    const currentErrors = Object.values(charStates).filter(s => s.status === 'incorrect').length;

    // Count corrections
    const corrections = Object.values(charStates).filter(s => s.corrected).length;

    // Accuracy ignores corrected errors (they count as correct eventually)
    // Formula: (Total Typed - Current Errors) / Total Typed
    // If I type 'a' (wrong) -> error. Accuracy 0/1 = 0%.
    // Backspace. Type 'b' (correct). State: Correct, Corrected=true. Accuracy 1/1 = 100%.

    const accuracy = typedCount === 0 ? 100 : Math.round(((typedCount - currentErrors) / typedCount) * 100);

    // WPM
    const wpm = activeTime > 0 ? Math.round((typedCount / 5) / (activeTime / 60000)) : 0;

    const progress = (typedLines.join('').length / totalChars) * 100;

    return { wpm, accuracy, corrections, progress };
  };

  const metrics = calculateMetricsLocal();

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
            <div className="text-sm">
              <span className="text-muted-foreground">Correcciones:</span>{' '}
              <span className="font-mono font-bold text-yellow-400">{metrics.corrections}</span>
            </div>
            <div className="w-32">
              <Progress value={metrics.progress} />
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
                    const key = `${lineIdx}-${charIdx}`;
                    const state = charStates[key];
                    const isCurrent = lineIdx === currentLine && charIdx === currentCol;

                    let charClass = 'text-muted-foreground'; // Default (pending/not reached)

                    if (state && state.status !== 'pending') {
                      if (state.status === 'correct') {
                        charClass = state.corrected
                          ? 'text-green-500' // Corrected
                          : 'text-foreground'; // Correct on first try (White/Foreground)
                      } else if (state.status === 'incorrect') {
                        charClass = 'text-destructive bg-destructive/20';
                      }
                    }

                    return (
                      <span key={charIdx} className="relative">
                        {isCurrent && isActive && (
                          <span className="absolute inset-0 border-l-2 border-primary animate-pulse" />
                        )}
                        <span className={charClass}>
                          {char}
                        </span>
                      </span>
                    );
                  })}
                  {/* Cursor at end of line */}
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
                    <p className="mt-2">{project.comments?.[currentLine] || project.notes?.find(n => n.line === currentLine + 1)?.content || "Sin comentario"}</p>
                  </div>
                ) : (
                  // Show all comments when paused
                  project.comments ? (
                    project.comments.map((comment, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-muted-foreground font-mono">Línea {idx + 1}:</span>
                        <p className="mt-1 text-foreground">{comment}</p>
                      </div>
                    ))
                  ) : (
                    project.notes?.map((note, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="text-muted-foreground font-mono">Línea {note.line}:</span>
                        <p className="mt-1 text-foreground">{note.content}</p>
                      </div>
                    ))
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
