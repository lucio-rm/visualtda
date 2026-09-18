import { useState, useEffect, useCallback, useRef } from 'react';
import { TraceTimeline, TraceEvent } from '../types/trace';

export interface UseTraceTimelineOptions {
  baseIntervalMs?: number; // default interval in ms at 1x speed
  autoPlay?: boolean;
  enableKeyboardShortcuts?: boolean;
}

export interface UseTraceTimelineReturn<T> {
  currentStepIndex: number;
  totalSteps: number;
  currentEvent: TraceEvent<T> | undefined;
  isPlaying: boolean;
  playbackSpeed: number;
  isAtStart: boolean;
  isAtEnd: boolean;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (stepIndex: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
}

export function useTraceTimeline<T>(
  timeline: TraceTimeline<T>,
  options: UseTraceTimelineOptions = {}
): UseTraceTimelineReturn<T> {
  const { baseIntervalMs = 500, autoPlay = false } = options;

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const totalSteps = timeline.events.length;
  const isAtStart = currentStepIndex === 0;
  const isAtEnd = currentStepIndex >= totalSteps - 1;
  const currentEvent = timeline.events[currentStepIndex];

  // Ref to always access latest state in timer callbacks
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const stepForward = useCallback(() => {
    setCurrentStepIndex((prev) => {
      if (prev < totalSteps - 1) {
        return prev + 1;
      }
      setIsPlaying(false);
      return prev;
    });
  }, [totalSteps]);

  const stepBackward = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback(
    (stepIndex: number) => {
      const clamped = Math.max(0, Math.min(stepIndex, totalSteps - 1));
      setCurrentStepIndex(clamped);
      if (clamped >= totalSteps - 1) {
        setIsPlaying(false);
      }
    },
    [totalSteps]
  );

  const play = useCallback(() => {
    if (isAtEnd) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
  }, [isAtEnd]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  }, []);

  const setSpeed = useCallback((speed: number) => {
    if (speed > 0) {
      setPlaybackSpeed(speed);
    }
  }, []);

  // Timer effect for playback
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (currentStepIndex >= totalSteps - 1) {
      setIsPlaying(false);
      return;
    }

    const interval = Math.max(50, Math.round(baseIntervalMs / playbackSpeed));
    const timerId = window.setTimeout(() => {
      stepForward();
    }, interval);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isPlaying, currentStepIndex, totalSteps, baseIntervalMs, playbackSpeed, stepForward]);

  // Keyboard navigation effect
  useEffect(() => {
    if (!options.enableKeyboardShortcuts) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid intercepting input if active element is an input, select or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'r') {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [options.enableKeyboardShortcuts, stepForward, stepBackward, togglePlay, reset]);

  return {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    isAtStart,
    isAtEnd,
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed
  };
}
