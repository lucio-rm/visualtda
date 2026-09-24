// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { StudentProgressProvider, useStudentProgress } from '../src/context/StudentProgressContext';

// Enable React act environment flag
// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Student Progress Context - 7-Stage Learning Progress Model', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
  });

  function renderWithProgress(callback: (progress: ReturnType<typeof useStudentProgress>) => void) {
    let capturedProgress: ReturnType<typeof useStudentProgress> | null = null;
    const TestConsumer: React.FC = () => {
      const progress = useStudentProgress();
      capturedProgress = progress;
      callback(progress);
      return <div data-testid="test-consumer">Ready</div>;
    };

    act(() => {
      root.render(
        <StudentProgressProvider>
          <TestConsumer />
        </StudentProgressProvider>
      );
    });

    return capturedProgress!;
  }

  it('initializes exercises with unseen state and 0 completed count', () => {
    let progressApi!: ReturnType<typeof useStudentProgress>;
    renderWithProgress((progress) => {
      progressApi = progress;
    });

    expect(progressApi.getExerciseState('n-queens')).toBe('unseen');
    expect(progressApi.isCompleted('n-queens')).toBe(false);
    expect(progressApi.isMastered('n-queens')).toBe(false);
    expect(progressApi.completedCount).toBe(0);
  });

  it('transitions state monotonically: unseen -> exploring -> attempted -> testing -> passed -> completed', () => {
    let progressApi!: ReturnType<typeof useStudentProgress>;
    renderWithProgress((progress) => {
      progressApi = progress;
    });

    // Step 1: Exploring
    act(() => {
      progressApi.markExploring('n-queens');
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('exploring');
    expect(progressApi.isCompleted('n-queens')).toBe(false);

    // Step 2: Attempted
    act(() => {
      progressApi.markAttempted('n-queens');
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('attempted');
    expect(progressApi.isCompleted('n-queens')).toBe(false);

    // Step 3: Testing with partial count
    act(() => {
      progressApi.markTesting('n-queens', 1, 3);
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('testing');
    expect(progressApi.getExerciseRecord('n-queens')?.passedTestsCount).toBe(1);
    expect(progressApi.getExerciseRecord('n-queens')?.totalTestsCount).toBe(3);
    expect(progressApi.isCompleted('n-queens')).toBe(false);

    // Step 4: Passed
    act(() => {
      progressApi.markPassed('n-queens', 3, 3);
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('passed');
    expect(progressApi.isCompleted('n-queens')).toBe(true);
    expect(progressApi.isMastered('n-queens')).toBe(false);
    expect(progressApi.completedCount).toBe(1);

    // Step 5: Completed (Mastered)
    act(() => {
      progressApi.markCompleted('n-queens');
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('completed');
    expect(progressApi.isCompleted('n-queens')).toBe(true);
    expect(progressApi.isMastered('n-queens')).toBe(true);
    expect(progressApi.completedCount).toBe(1);
  });

  it('enforces monotonic progression: earlier stages cannot degrade higher achievements', () => {
    let progressApi!: ReturnType<typeof useStudentProgress>;
    renderWithProgress((progress) => {
      progressApi = progress;
    });

    act(() => {
      progressApi.markCompleted('n-queens');
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('completed');

    // Attempting to downgrade should be ignored
    act(() => {
      progressApi.markAttempted('n-queens');
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('completed');

    act(() => {
      progressApi.markTesting('n-queens', 0, 3);
    });
    expect(progressApi.getExerciseState('n-queens')).toBe('completed');
    expect(progressApi.isCompleted('n-queens')).toBe(true);
  });

  it('resetProgress clears all records back to pristine state', () => {
    let progressApi!: ReturnType<typeof useStudentProgress>;
    renderWithProgress((progress) => {
      progressApi = progress;
    });

    act(() => {
      progressApi.markCompleted('n-queens');
      progressApi.markCompleted('subset-sum-backtracking');
    });
    expect(progressApi.completedCount).toBe(2);

    act(() => {
      progressApi.resetProgress();
    });
    expect(progressApi.completedCount).toBe(0);
    expect(progressApi.getExerciseState('n-queens')).toBe('unseen');
    expect(progressApi.getExerciseState('subset-sum-backtracking')).toBe('unseen');
  });

  it('correctly calculates completed count per category', () => {
    let progressApi!: ReturnType<typeof useStudentProgress>;
    renderWithProgress((progress) => {
      progressApi = progress;
    });

    act(() => {
      progressApi.markCompleted('n-queens');
      progressApi.markPassed('subset-sum-backtracking');
    });

    const btCount = progressApi.getCompletedCountByCategory('backtracking');
    expect(btCount).toBe(2);

    const greedyCount = progressApi.getCompletedCountByCategory('greedy');
    expect(greedyCount).toBe(0);
  });
});
