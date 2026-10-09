// src/hooks/useTraceHotkeys.ts
import { useEffect } from 'react';

export interface UseTraceHotkeysOptions {
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onReset?: () => void;
  onGoToEnd?: () => void;
  enabled?: boolean;
}

/**
 * Global keyboard listener hook for trace playback:
 * - Space: Play / Pause
 * - ArrowRight: Step Forward
 * - ArrowLeft: Step Backward
 * - Home or 'r': Reset to Step 0
 * - End: Jump to last step
 * 
 * Safely ignores events when focus is inside text inputs, textareas, or contentEditable.
 */
export function useTraceHotkeys({
  isPlaying,
  onPlay,
  onPause,
  onStepForward,
  onStepBackward,
  onReset,
  onGoToEnd,
  enabled = true
}: UseTraceHotkeysOptions): void {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
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

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) {
          onPause?.();
        } else {
          onPlay?.();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onStepForward?.();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onStepBackward?.();
      } else if (e.key === 'Home' || e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          onReset?.();
        }
      } else if (e.key === 'End') {
        e.preventDefault();
        onGoToEnd?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, isPlaying, onPlay, onPause, onStepForward, onStepBackward, onReset, onGoToEnd]);
}
