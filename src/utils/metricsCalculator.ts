import { TypingMetrics } from '@/types';

export function calculateWPM(metrics: TypingMetrics): number {
  if (metrics.activeTimeMs === 0) return 0;
  
  const minutes = metrics.activeTimeMs / 60000;
  const words = metrics.correctCharacters / 5; // Standard: 5 characters = 1 word
  
  return Math.round(words / minutes);
}

export function calculateAccuracy(metrics: TypingMetrics): number {
  if (metrics.totalCharacters === 0) return 100;
  
  const correctPositions = metrics.totalCharacters - metrics.errorPositions.size;
  return Math.round((correctPositions / metrics.totalCharacters) * 100);
}

export function initializeMetrics(): TypingMetrics {
  return {
    totalCharacters: 0,
    correctCharacters: 0,
    errorPositions: new Set(),
    activeTimeMs: 0,
    startTime: null,
    isPaused: true,
  };
}

export function updateMetricsOnType(
  metrics: TypingMetrics,
  position: number,
  isCorrect: boolean
): TypingMetrics {
  const newMetrics = { ...metrics };
  
  if (!isCorrect) {
    newMetrics.errorPositions.add(position);
  }
  
  if (position >= newMetrics.totalCharacters) {
    newMetrics.totalCharacters = position + 1;
  }
  
  return newMetrics;
}

export function startTimer(metrics: TypingMetrics): TypingMetrics {
  return {
    ...metrics,
    startTime: Date.now(),
    isPaused: false,
  };
}

export function pauseTimer(metrics: TypingMetrics): TypingMetrics {
  if (!metrics.startTime || metrics.isPaused) {
    return metrics;
  }
  
  const elapsed = Date.now() - metrics.startTime;
  
  return {
    ...metrics,
    activeTimeMs: metrics.activeTimeMs + elapsed,
    startTime: null,
    isPaused: true,
  };
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function calculateMetrics(totalChars: number, errorCount: number, activeTimeMs: number) {
  if (activeTimeMs === 0) return { wpm: 0, accuracy: 100 };
  
  const minutes = activeTimeMs / 60000;
  const words = totalChars / 5;
  const wpm = Math.round(words / minutes);
  
  const correctChars = totalChars - errorCount;
  const accuracy = totalChars === 0 ? 100 : Math.round((correctChars / totalChars) * 100);
  
  return { wpm, accuracy };
}
