import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { registry } from '../engine/registry';

interface StudentProgressContextType {
  completedExerciseIds: string[];
  isCompleted: (exerciseId: string) => boolean;
  markCompleted: (exerciseId: string) => void;
  unmarkCompleted: (exerciseId: string) => void;
  resetProgress: () => void;
  completedCount: number;
  totalExercisesCount: number;
  getCompletedCountByCategory: (categoryId: string) => number;
}

const StudentProgressContext = createContext<StudentProgressContextType | undefined>(undefined);

const STORAGE_KEY = 'visual_tda_completed_exercises';

export const StudentProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback on storage read error
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedExerciseIds));
    } catch {
      // Ignore storage write error
    }
  }, [completedExerciseIds]);

  const completedSet = useMemo(() => new Set(completedExerciseIds), [completedExerciseIds]);

  const isCompleted = (exerciseId: string): boolean => {
    return completedSet.has(exerciseId);
  };

  const markCompleted = (exerciseId: string) => {
    setCompletedExerciseIds((prev) => {
      if (prev.includes(exerciseId)) return prev;
      return [...prev, exerciseId];
    });
  };

  const unmarkCompleted = (exerciseId: string) => {
    setCompletedExerciseIds((prev) => prev.filter((id) => id !== exerciseId));
  };

  const resetProgress = () => {
    setCompletedExerciseIds([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const allExercises = registry.getExercises();
  const totalExercisesCount = allExercises.length;
  const completedCount = completedExerciseIds.length;

  const getCompletedCountByCategory = (categoryId: string): number => {
    const categoryExercises = registry.getExercises(categoryId);
    return categoryExercises.filter((ex) => completedSet.has(ex.id)).length;
  };

  return (
    <StudentProgressContext.Provider
      value={{
        completedExerciseIds,
        isCompleted,
        markCompleted,
        unmarkCompleted,
        resetProgress,
        completedCount,
        totalExercisesCount,
        getCompletedCountByCategory
      }}
    >
      {children}
    </StudentProgressContext.Provider>
  );
};

const defaultProgressContext: StudentProgressContextType = {
  completedExerciseIds: [],
  isCompleted: () => false,
  markCompleted: () => {},
  unmarkCompleted: () => {},
  resetProgress: () => {},
  completedCount: 0,
  totalExercisesCount: 0,
  getCompletedCountByCategory: () => 0
};

export const useStudentProgress = (): StudentProgressContextType => {
  const context = useContext(StudentProgressContext);
  return context || defaultProgressContext;
};
