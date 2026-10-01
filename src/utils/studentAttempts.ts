/**
 * Student Attempts Management Utility
 * 
 * Records, retrieves, and manages student code attempts and approved solutions
 * per exercise, persisted in localStorage with in-memory fallback.
 */

export interface StudentAttemptRecord {
  id: string;
  exerciseId: string;
  timestamp: number;
  code: string;
  passed: boolean;
  passedTestsCount: number;
  totalTestsCount: number;
  meaningfulLinesCount: number;
  engine: 'ts' | 'pyodide';
  executionTimeMs?: number | null;
}

const STORAGE_PREFIX_ATTEMPTS = 'visual_tda_attempts_';
const STORAGE_PREFIX_APPROVED = 'visual_tda_approved_solution_';

// In-memory fallback map if localStorage is blocked/unavailable
const inMemoryAttempts = new Map<string, StudentAttemptRecord[]>();
const inMemoryApproved = new Map<string, StudentAttemptRecord>();

export function getStudentAttempts(exerciseId: string): StudentAttemptRecord[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_ATTEMPTS}${exerciseId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fall back to in-memory
  }
  return inMemoryAttempts.get(exerciseId) || [];
}

export function getStudentAttemptCount(exerciseId: string): number {
  return getStudentAttempts(exerciseId).length;
}

export function recordStudentAttempt(
  exerciseId: string,
  attemptDataOrCode: string | Omit<StudentAttemptRecord, 'id' | 'timestamp'>,
  _starterCode?: string,
  passed: boolean = false,
  passedTestsCount: number = 0,
  totalTestsCount: number = 0,
  executionTimeMs?: number | null,
  engine: 'ts' | 'pyodide' = 'ts'
): StudentAttemptRecord {
  let attemptData: Omit<StudentAttemptRecord, 'id' | 'timestamp'>;

  if (typeof attemptDataOrCode === 'string') {
    attemptData = {
      exerciseId,
      code: attemptDataOrCode,
      passed,
      passedTestsCount,
      totalTestsCount,
      meaningfulLinesCount: 0,
      engine,
      executionTimeMs
    };
  } else {
    attemptData = attemptDataOrCode;
  }

  const newAttempt: StudentAttemptRecord = {
    ...attemptData,
    id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now()
  };

  const existing = getStudentAttempts(exerciseId);
  const updated = [newAttempt, ...existing].slice(0, 50); // Keep last 50 attempts

  inMemoryAttempts.set(exerciseId, updated);

  try {
    localStorage.setItem(`${STORAGE_PREFIX_ATTEMPTS}${exerciseId}`, JSON.stringify(updated));
  } catch {
    // Local storage quota exceeded or disabled
  }

  // If this attempt passed, also record it as the latest approved solution
  if (newAttempt.passed) {
    recordApprovedSolution(exerciseId, newAttempt);
  }

  return newAttempt;
}

export function recordApprovedSolution(exerciseId: string, attempt: StudentAttemptRecord): void {
  inMemoryApproved.set(exerciseId, attempt);
  try {
    localStorage.setItem(`${STORAGE_PREFIX_APPROVED}${exerciseId}`, JSON.stringify(attempt));
  } catch {
    // Storage quota exceeded
  }
}

export function getApprovedStudentSolution(exerciseId: string): StudentAttemptRecord | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_APPROVED}${exerciseId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.code === 'string') return parsed;
    }
  } catch {
    // Fall back to in-memory
  }

  const mem = inMemoryApproved.get(exerciseId);
  if (mem) return mem;

  // Search in attempts list for any passed attempt
  const attempts = getStudentAttempts(exerciseId);
  const passedAttempt = attempts.find((a) => a.passed);
  return passedAttempt || null;
}

export function getLatestStudentAttempt(exerciseId: string): StudentAttemptRecord | null {
  const attempts = getStudentAttempts(exerciseId);
  return attempts.length > 0 ? attempts[0] : null;
}

export function clearStudentAttempts(exerciseId: string): void {
  inMemoryAttempts.delete(exerciseId);
  inMemoryApproved.delete(exerciseId);
  try {
    localStorage.removeItem(`${STORAGE_PREFIX_ATTEMPTS}${exerciseId}`);
    localStorage.removeItem(`${STORAGE_PREFIX_APPROVED}${exerciseId}`);
  } catch {
    // Ignore
  }
}
