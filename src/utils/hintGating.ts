/**
 * Progressive Hint Gating Engine
 * 
 * Enforces effort-based unlocking of pedagogical hints in Solve phase:
 * - Hint 1: >= 3 test execution attempts AND >= 20 meaningful lines added
 * - Hint 2: >= 5 test execution attempts AND >= 25 meaningful lines added
 * - Hint 3: >= 7 test execution attempts AND >= 30 meaningful lines added
 * - Instructor Mode: All hints immediately accessible for faculty review.
 */

import { analyzeStudentCodeEffort } from './codeEffortAnalyzer';
import { getStudentAttemptCount } from './studentAttempts';

export interface HintRequirementTier {
  hintIndex: number;
  requiredAttempts: number;
  requiredLines: number;
}

export interface HintUnlockStatus {
  hintIndex: number;
  isUnlocked: boolean;
  requiredAttempts: number;
  currentAttempts: number;
  requiredLines: number;
  currentLines: number;
  attemptsFulfilled: boolean;
  linesFulfilled: boolean;
  attemptsProgress: number; // 0 - 100
  linesProgress: number; // 0 - 100
  isInstructorBypassed: boolean;
}

/**
 * Returns the effort requirement thresholds for a given hint index (0-indexed).
 */
export function getHintRequirements(hintIndex: number): { attempts: number; lines: number } {
  switch (hintIndex) {
    case 0: // Hint 1
      return { attempts: 3, lines: 20 };
    case 1: // Hint 2
      return { attempts: 5, lines: 25 };
    case 2: // Hint 3
    default:
      return { attempts: 7, lines: 30 };
  }
}

/**
 * Calculates current unlock status and progress for a specific hint.
 */
export function getHintUnlockStatus(
  exerciseId: string,
  hintIndex: number,
  currentCode: string,
  starterCode?: string,
  isInstructorMode?: boolean
): HintUnlockStatus {
  const req = getHintRequirements(hintIndex);

  // Faculty bypass
  if (isInstructorMode) {
    return {
      hintIndex,
      isUnlocked: true,
      requiredAttempts: req.attempts,
      currentAttempts: 99,
      requiredLines: req.lines,
      currentLines: 99,
      attemptsFulfilled: true,
      linesFulfilled: true,
      attemptsProgress: 100,
      linesProgress: 100,
      isInstructorBypassed: true
    };
  }

  const currentAttempts = getStudentAttemptCount(exerciseId);
  const effort = analyzeStudentCodeEffort(currentCode, starterCode);
  const currentLines = effort.meaningfulLinesAdded;

  const attemptsFulfilled = currentAttempts >= req.attempts;
  const linesFulfilled = currentLines >= req.lines;
  const isUnlocked = attemptsFulfilled && linesFulfilled;

  const attemptsProgress = Math.min(100, Math.round((currentAttempts / req.attempts) * 100));
  const linesProgress = Math.min(100, Math.round((currentLines / req.lines) * 100));

  return {
    hintIndex,
    isUnlocked,
    requiredAttempts: req.attempts,
    currentAttempts,
    requiredLines: req.lines,
    currentLines,
    attemptsFulfilled,
    linesFulfilled,
    attemptsProgress,
    linesProgress,
    isInstructorBypassed: false
  };
}
