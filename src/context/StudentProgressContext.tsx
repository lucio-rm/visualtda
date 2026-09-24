import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { registry } from '../engine/registry';

export type ExerciseProgressState =
  | 'unseen'
  | 'exploring'
  | 'attempted'
  | 'testing'
  | 'passed'
  | 'completed';

export interface ExerciseProgressRecord {
  state: ExerciseProgressState;
  updatedAt: number;
  passedTestsCount?: number;
  totalTestsCount?: number;
}

const STATE_RANK: Record<ExerciseProgressState, number> = {
  unseen: 0,
  exploring: 1,
  attempted: 2,
  testing: 3,
  passed: 4,
  completed: 5
};

interface StudentProgressContextType {
  // Existing fields for 100% backward compatibility
  completedExerciseIds: string[];
  isCompleted: (exerciseId: string) => boolean;
  markCompleted: (exerciseId: string) => void;
  unmarkCompleted: (exerciseId: string) => void;
  resetProgress: () => void;
  completedCount: number;
  totalExercisesCount: number;
  getCompletedCountByCategory: (categoryId: string) => number;

  // Multi-stage learning progress model
  records: Record<string, ExerciseProgressRecord>;
  getExerciseState: (exerciseId: string) => ExerciseProgressState;
  getExerciseRecord: (exerciseId: string) => ExerciseProgressRecord | undefined;
  setExerciseState: (
    exerciseId: string,
    state: ExerciseProgressState,
    meta?: { passedTestsCount?: number; totalTestsCount?: number; force?: boolean }
  ) => void;
  markExploring: (exerciseId: string) => void;
  markAttempted: (exerciseId: string) => void;
  markTesting: (exerciseId: string, passedCount?: number, totalCount?: number) => void;
  markPassed: (exerciseId: string, passedCount?: number, totalCount?: number) => void;
  isMastered: (exerciseId: string) => boolean;
}

const StudentProgressContext = createContext<StudentProgressContextType | undefined>(undefined);

const STORAGE_KEY_COMPLETED = 'visual_tda_completed_exercises';
const STORAGE_KEY_RECORDS = 'visual_tda_student_progress_records';

export const StudentProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<Record<string, ExerciseProgressRecord>>(() => {
    const loadedRecords: Record<string, ExerciseProgressRecord> = {};

    // 1. Try reading detailed records
    try {
      const storedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (storedRecords) {
        const parsed = JSON.parse(storedRecords);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.assign(loadedRecords, parsed);
        }
      }
    } catch {
      // Fallback on read error
    }

    // 2. Migration from legacy completed IDs if missing from records
    try {
      const legacyStored = localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (legacyStored) {
        const legacyParsed = JSON.parse(legacyStored);
        if (Array.isArray(legacyParsed)) {
          for (const id of legacyParsed) {
            if (typeof id === 'string' && !loadedRecords[id]) {
              loadedRecords[id] = {
                state: 'completed',
                updatedAt: Date.now()
              };
            }
          }
        }
      }
    } catch {
      // Fallback
    }

    return loadedRecords;
  });

  // Save records to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
      // Keep legacy array synchronized with all passed/completed exercises
      const completedIds = Object.entries(records)
        .filter(([_, rec]) => rec.state === 'passed' || rec.state === 'completed')
        .map(([id]) => id);
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(completedIds));
    } catch {
      // Ignore storage write error
    }
  }, [records]);

  const completedExerciseIds = useMemo(() => {
    return Object.entries(records)
      .filter(([_, rec]) => rec.state === 'passed' || rec.state === 'completed')
      .map(([id]) => id);
  }, [records]);

  const completedSet = useMemo(() => new Set(completedExerciseIds), [completedExerciseIds]);

  const isCompleted = useCallback((exerciseId: string): boolean => {
    const state = records[exerciseId]?.state;
    return state === 'completed' || state === 'passed';
  }, [records]);

  const isMastered = useCallback((exerciseId: string): boolean => {
    return records[exerciseId]?.state === 'completed';
  }, [records]);

  const getExerciseState = useCallback((exerciseId: string): ExerciseProgressState => {
    return records[exerciseId]?.state || 'unseen';
  }, [records]);

  const getExerciseRecord = useCallback((exerciseId: string): ExerciseProgressRecord | undefined => {
    return records[exerciseId];
  }, [records]);

  const setExerciseState = useCallback((
    exerciseId: string,
    nextState: ExerciseProgressState,
    meta?: { passedTestsCount?: number; totalTestsCount?: number; force?: boolean }
  ) => {
    setRecords((prev) => {
      const currentRec = prev[exerciseId];
      const currentState = currentRec?.state || 'unseen';

      // Monotonic progression: only advance forward in rank unless forced
      if (!meta?.force && STATE_RANK[nextState] <= STATE_RANK[currentState]) {
        // Still update test counts if provided without degrading state
        if (meta?.passedTestsCount !== undefined || meta?.totalTestsCount !== undefined) {
          return {
            ...prev,
            [exerciseId]: {
              ...currentRec,
              updatedAt: Date.now(),
              passedTestsCount: meta.passedTestsCount ?? currentRec?.passedTestsCount,
              totalTestsCount: meta.totalTestsCount ?? currentRec?.totalTestsCount
            }
          };
        }
        return prev;
      }

      return {
        ...prev,
        [exerciseId]: {
          state: nextState,
          updatedAt: Date.now(),
          passedTestsCount: meta?.passedTestsCount ?? currentRec?.passedTestsCount,
          totalTestsCount: meta?.totalTestsCount ?? currentRec?.totalTestsCount
        }
      };
    });
  }, []);

  const markExploring = useCallback((exerciseId: string) => {
    setExerciseState(exerciseId, 'exploring');
  }, [setExerciseState]);

  const markAttempted = useCallback((exerciseId: string) => {
    setExerciseState(exerciseId, 'attempted');
  }, [setExerciseState]);

  const markTesting = useCallback((exerciseId: string, passedCount?: number, totalCount?: number) => {
    setExerciseState(exerciseId, 'testing', { passedTestsCount: passedCount, totalTestsCount: totalCount });
  }, [setExerciseState]);

  const markPassed = useCallback((exerciseId: string, passedCount?: number, totalCount?: number) => {
    setExerciseState(exerciseId, 'passed', { passedTestsCount: passedCount, totalTestsCount: totalCount });
  }, [setExerciseState]);

  const markCompleted = useCallback((exerciseId: string) => {
    setExerciseState(exerciseId, 'completed');
  }, [setExerciseState]);

  const unmarkCompleted = useCallback((exerciseId: string) => {
    setExerciseState(exerciseId, 'unseen', { force: true });
  }, [setExerciseState]);

  const resetProgress = useCallback(() => {
    setRecords({});
    try {
      localStorage.removeItem(STORAGE_KEY_RECORDS);
      localStorage.removeItem(STORAGE_KEY_COMPLETED);
    } catch {
      // ignore
    }
  }, []);

  const allExercises = registry.getExercises();
  const totalExercisesCount = allExercises.length;
  const completedCount = completedExerciseIds.length;

  const getCompletedCountByCategory = useCallback((categoryId: string): number => {
    const categoryExercises = registry.getExercises(categoryId);
    return categoryExercises.filter((ex) => completedSet.has(ex.id)).length;
  }, [completedSet]);

  return (
    <StudentProgressContext.Provider
      value={{
        completedExerciseIds,
        isCompleted,
        isMastered,
        markCompleted,
        unmarkCompleted,
        resetProgress,
        completedCount,
        totalExercisesCount,
        getCompletedCountByCategory,
        records,
        getExerciseState,
        getExerciseRecord,
        setExerciseState,
        markExploring,
        markAttempted,
        markTesting,
        markPassed
      }}
    >
      {children}
    </StudentProgressContext.Provider>
  );
};

const defaultProgressContext: StudentProgressContextType = {
  completedExerciseIds: [],
  isCompleted: () => false,
  isMastered: () => false,
  markCompleted: () => {},
  unmarkCompleted: () => {},
  resetProgress: () => {},
  completedCount: 0,
  totalExercisesCount: 0,
  getCompletedCountByCategory: () => 0,
  records: {},
  getExerciseState: () => 'unseen',
  getExerciseRecord: () => undefined,
  setExerciseState: () => {},
  markExploring: () => {},
  markAttempted: () => {},
  markTesting: () => {},
  markPassed: () => {}
};

export const useStudentProgress = (): StudentProgressContextType => {
  const context = useContext(StudentProgressContext);
  return context || defaultProgressContext;
};
