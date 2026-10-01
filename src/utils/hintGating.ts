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
import { registry } from '../engine/registry';

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
  categoryLabel?: string;
}

/**
 * Returns the effort requirement thresholds calibrated per algorithmic technique/exercise.
 * - Dynamic Programming & Network Flow: matrix loops, recurrence transitions, residual paths (16, 22, 28 lines)
 * - Backtracking, D&C, Linear Programming, Reductions: recursive branches, bounding, pivots (10, 15, 20 lines)
 * - Greedy, Approximation, Randomized: concise decision loops, sorting, heuristics (8, 12, 16 lines)
 */
export function getHintRequirements(hintIndex: number, exerciseId?: string): { attempts: number; lines: number } {
  let categoryId: string | undefined;
  if (exerciseId) {
    const ex = registry.getExercise(exerciseId);
    categoryId = ex?.categoryId;
  }

  let lineBase = 10;
  let lineStep = 5;

  if (categoryId === 'dynamic-programming' || categoryId === 'network-flow') {
    lineBase = 16;
    lineStep = 6;
  } else if (categoryId === 'backtracking') {
    lineBase = 8;
    lineStep = 4;
  } else if (
    categoryId === 'divide-and-conquer' ||
    categoryId === 'linear-programming' ||
    categoryId === 'reductions'
  ) {
    lineBase = 10;
    lineStep = 5;
  } else if (categoryId === 'greedy' || categoryId === 'approximation') {
    lineBase = 8;
    lineStep = 4;
  } else if (categoryId === 'randomized') {
    lineBase = 6;
    lineStep = 4;
  }

  switch (hintIndex) {
    case 0: // Hint 1
      return { attempts: 3, lines: lineBase };
    case 1: // Hint 2
      return { attempts: 5, lines: lineBase + lineStep };
    case 2: // Hint 3
    default:
      return { attempts: 7, lines: lineBase + lineStep * 2 };
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
  const req = getHintRequirements(hintIndex, exerciseId);

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
