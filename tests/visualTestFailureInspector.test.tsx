// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { VisualTestFailureInspector, getPedagogicalDiagnosis } from '../src/components/VisualTestFailureInspector';
import type { ExerciseMetadata } from '../src/types';
import type { TestCaseResult } from '../src/engine/exerciseContent';

describe('VisualTestFailureInspector & getPedagogicalDiagnosis', () => {
  const dummyGreedyExercise: ExerciseMetadata = {
    id: 'road-antennas',
    problemId: 'road-antennas',
    techniqueId: 'greedy',
    categoryId: 'greedy',
    order: 1,
    difficulty: 3,
    title: { es: 'Antenas en la Ruta', en: 'Road Antennas' },
    subtitle: { es: 'Sub', en: 'Sub' },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['greedy']
  };

  const dummyDpExercise: ExerciseMetadata = {
    id: 'knapsack-dp',
    problemId: 'knapsack-dp',
    techniqueId: 'dynamic-programming',
    categoryId: 'dynamic-programming',
    order: 2,
    difficulty: 3,
    title: { es: 'Mochila 0/1', en: '0/1 Knapsack' },
    subtitle: { es: 'Sub', en: 'Sub' },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['dp']
  };

  const dummyDcExercise: ExerciseMetadata = {
    id: 'closest-pair',
    problemId: 'closest-pair',
    techniqueId: 'divide-and-conquer',
    categoryId: 'divide-and-conquer',
    order: 3,
    difficulty: 4,
    title: { es: 'Par más cercano', en: 'Closest Pair' },
    subtitle: { es: 'Sub', en: 'Sub' },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['dc']
  };

  const dummyBacktrackingExercise: ExerciseMetadata = {
    id: 'n-queens',
    problemId: 'n-queens',
    techniqueId: 'backtracking',
    categoryId: 'backtracking',
    order: 4,
    difficulty: 2,
    title: { es: 'N Reinas', en: 'N-Queens' },
    subtitle: { es: 'Sub', en: 'Sub' },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['backtracking']
  };

  it('generates targeted pedagogical diagnosis for greedy, dp, divide-and-conquer, and backtracking', () => {
    const testResult: TestCaseResult = {
      testId: 't1',
      description: { es: 'Prueba Greedy', en: 'Greedy Test' },
      passed: false,
      actual: '[2, 6, 12]',
      expected: '[2, 11]'
    };

    const greedyDiag = getPedagogicalDiagnosis(dummyGreedyExercise, testResult, 'es');
    expect(greedyDiag.title).toContain('Greedy Choice');

    const dpDiag = getPedagogicalDiagnosis(dummyDpExercise, testResult, 'en');
    expect(dpDiag.title).toContain('Recurrence Mismatch');

    const dcDiag = getPedagogicalDiagnosis(dummyDcExercise, testResult, 'es');
    expect(dcDiag.title).toContain('Frontera de partición');

    const btDiag = getPedagogicalDiagnosis(dummyBacktrackingExercise, testResult, 'en');
    expect(btDiag.title).toContain('Premature Pruning');
  });

  it('renders modal with actual, expected values, and calls onClose and onOpenInVisualizer', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const onClose = vi.fn();
    const onOpenInVisualizer = vi.fn();

    const testResult: TestCaseResult = {
      testId: 't-fail',
      description: { es: 'Caso con números negativos', en: 'Negative numbers case' },
      passed: false,
      actual: '-15',
      expected: '0',
      message: 'Fallo de optimalidad'
    };

    act(() => {
      root.render(
        <VisualTestFailureInspector
          testResult={testResult}
          exercise={dummyGreedyExercise}
          language="es"
          onClose={onClose}
          onOpenInVisualizer={onOpenInVisualizer}
        />
      );
    });

    expect(container.textContent).toContain('Diagnóstico Pedagógico de Caso Fallido');
    expect(container.textContent).toContain('Caso con números negativos');
    expect(container.textContent).toContain('-15');
    expect(container.textContent).toContain('0');
    expect(container.textContent).toContain('Fallo de optimalidad');

    const inspectBtn = container.querySelector('.inspector-action-btn') as HTMLButtonElement;
    expect(inspectBtn).toBeDefined();
    act(() => {
      inspectBtn.click();
    });

    expect(onClose).toHaveBeenCalled();
    expect(onOpenInVisualizer).toHaveBeenCalled();
  });

  it('handles empty and undefined actual/expected gracefully without crashing', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const onClose = vi.fn();
    const testResult: TestCaseResult = {
      testId: 't-null',
      description: { es: 'Caso nulo', en: 'Null case' },
      passed: false,
      actual: undefined,
      expected: undefined
    };

    act(() => {
      root.render(
        <VisualTestFailureInspector
          testResult={testResult}
          exercise={dummyGreedyExercise}
          language="en"
          onClose={onClose}
        />
      );
    });

    expect(container.textContent).toContain('(null / undefined)');

    const closeBtn = container.querySelector('.test-failure-close-btn') as HTMLButtonElement;
    expect(closeBtn).toBeDefined();
    act(() => {
      closeBtn.click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
