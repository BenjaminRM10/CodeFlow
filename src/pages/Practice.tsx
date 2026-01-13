import { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion'; // Removed for performance
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Play, Pause } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Project } from '@/types';
import { ThemeBackground } from '@/components/ThemeBackground';
import { VirtualKeyboard } from '@/components/VirtualKeyboard';
import { NotesPanel } from '@/components/NotesPanel';
import { CodeLine, CharacterState } from '@/components/CodeLine';
import { soundManager } from '@/lib/sounds';
import { achievementManager } from '@/lib/achievements';


// Interface moved to CodeLine component

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

  // Keyboard tracking
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [activeTime, setActiveTime] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const codeAreaRef = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState(storage.getConfig());

  useEffect(() => {
    const cfg = storage.getConfig();
    setConfig(cfg);
    setTheme(cfg.theme);

    // Init Audio
    if (cfg.soundEnabled) {
      soundManager.setVolume(cfg.soundVolume);
    }

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

    // Play Sound
    if (config.soundEnabled) {
      soundManager.play(config.soundType);
    }

    setPressedKey(e.key);
    setTimeout(() => setPressedKey(null), 150);

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
        const fontSizePx = config.fontSize === 'small' ? 14 : config.fontSize === 'large' ? 18 : 16;
        const charWidth = fontSizePx * 0.6; // approx
        const containerWidth = codeAreaRef.current.offsetWidth;
        // Adjust scroll threshold based on font size roughly
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
  }, [isActive, currentLine, currentCol, typedLines, charStates, project, config]); // Added config dependency for sound

  const scrollToLine = (lineIndex: number) => {
    // Strict scrolling: Ensure the defined line is at the top (or very close)
    const lineElement = document.getElementById(`line-${lineIndex}`);
    if (lineElement && codeAreaRef.current) {
      // We use 'start' to snap it to the top.
      // Adding scrollMarginTop via class or style could help with offset, 
      // but let's try strict start first as requested.
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    if (project?.id) {
      storage.updateProjectMetrics(project.id, {
        wpm: 0,
        accuracy: 0,
        progress: 0,
        completed: false
      });
    }
  };

  // Metrics Calculation - Safe if project is null
  const calculateMetricsLocal = () => {
    if (!project) return { wpm: 0, accuracy: 0, corrections: 0, progress: 0 };

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

  // Save progress when line changes or project finishes
  useEffect(() => {
    if (!project || !isActive) return;

    const metrics = calculateMetricsLocal();
    const isCompleted = currentLine >= project.code.length;

    // Save to storage
    if (project.id) {
      storage.updateProjectMetrics(project.id, {
        wpm: metrics.wpm,
        accuracy: metrics.accuracy,
        progress: metrics.progress,
        completed: isCompleted && metrics.progress >= 100
      });
    }

    // Update daily progress if completed
    if (isCompleted && metrics.progress >= 100) {
      // Only count once per session or day? 
      // For now simple increment is enough as per requirement "projectsCompleted"
      // But we need to be careful not to spam it. 
      // In `Practice` component, maybe we can track if we already marked it completed this session.
      // However, the main request is just saving the state.
      storage.updateDailyProgress(new Date().toISOString().split('T')[0], Math.round(activeTime / 60000), 1);
      achievementManager.checkAchievements();
    }

  }, [currentLine, isActive, project]); // Added project dependency for safety

  const metrics = calculateMetricsLocal();

  const nextChar = project?.code[currentLine]?.[currentCol] || '';

  // Font Size Class
  const fontSizeClass =
    config.fontSize === 'small' ? 'text-sm' :
      config.fontSize === 'large' ? 'text-lg' :
        'text-base'; // medium default

  if (!project) return null;

  return (
    <>
      <ThemeBackground theme={theme} />
      <div className="h-screen w-full flex flex-col overflow-hidden bg-gray-950">
        {/* Top Bar */}
        <div className="flex-none border-b border-white/10 bg-gray-950/80 backdrop-blur-md px-4 py-3 flex items-center justify-between z-10 shadow-lg relative">
          {/* Subtle gradient line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-gray-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">WPM</span>
              <span className="font-mono font-bold text-xl text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]">{metrics.wpm}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Accuracy</span>
              <span className="font-mono font-bold text-xl text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.3)]">{metrics.accuracy}%</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-wider text-gray-500">Corrections</span>
              <span className="font-mono font-bold text-xl text-yellow-400">{metrics.corrections}</span>
            </div>
            <div className="w-48 flex flex-col justify-center gap-1">
              <span className="text-[10px] text-gray-500 text-right">{Math.round(metrics.progress)}%</span>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  style={{ width: `${metrics.progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" variant="ghost" onClick={reset} className="text-gray-400 hover:text-white hover:bg-white/5">
              Reset
            </Button>
            <Button
              size="sm"
              onClick={togglePractice}
              className={`
                    min-w-[100px] transition-all duration-300 shadow-lg
                    ${isActive
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 shadow-purple-500/20'
                }
                `}
            >
              {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isActive ? 'Pause' : 'Start'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Section: Code & Notes (50% Height) */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Code Area (75% Width) */}
            <div
              ref={codeAreaRef}
              className={`w-3/4 overflow-auto bg-card/50 backdrop-blur-sm p-8 font-mono scroll-smooth transition-all duration-200 ${fontSizeClass}`}
            >
              <div className="min-h-full pb-[40vh]"> {/* Padding bottom to allow scrolling last lines to top */}
                {project.code.map((line, lineIdx) => (
                  <CodeLine
                    key={lineIdx}
                    lineIndex={lineIdx}
                    lineContent={line}
                    typedLine={typedLines[lineIdx]}
                    isActive={lineIdx === currentLine}
                    isPracticeActive={isActive}
                    currentCol={currentCol}
                    charStates={charStates}
                    // Config Props
                    cursorStyle={config.cursorStyle}
                    smoothCaret={config.smoothCaret}
                  />
                ))}
              </div>
            </div>

            {/* Notes Panel (25% Width) */}
            <div className="w-1/4 border-l border-border/50 h-full overflow-hidden">
              <NotesPanel
                notes={project.notes}
                comments={project.comments}
                currentLine={currentLine}
                isVisible={config.showComments}
              />
            </div>
          </div>

          {/* Bottom Section: Virtual Keyboard (50% Height) */}
          {config.showKeyboard && (
            <div className="h-[50vh] flex-none border-t border-border/50 bg-background/95 backdrop-blur shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-30">
              <VirtualKeyboard
                nextKey={nextChar}
                pressedKey={pressedKey}
                showFingerGuide={config.showFingerGuide}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
