// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { QuickSwitcherModal, filterExercises } from '../src/components/QuickSwitcherModal';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { StudentProgressProvider } from '../src/context/StudentProgressContext';
import type { ExerciseMetadata } from '../src/types';

describe('QuickSwitcherModal & filterExercises', () => {
  const dummyExercises: ExerciseMetadata[] = [
    {
      id: 'n-queens',
      problemId: 'n-queens',
      techniqueId: 'backtracking',
      categoryId: 'backtracking',
      order: 1,
      difficulty: 2,
      title: { es: 'N Reinas', en: 'N-Queens' },
      subtitle: { es: 'Sub', en: 'Sub' },
      supportedPhases: ['discover', 'solve', 'understand'],
      tags: ['chess', 'board']
    },
    {
      id: 'knapsack-dp',
      problemId: 'knapsack-dp',
      techniqueId: 'dynamic-programming',
      categoryId: 'dynamic-programming',
      order: 2,
      difficulty: 3,
      title: { es: 'Mochila 0/1', en: '0/1 Knapsack' },
      subtitle: { es: 'Sub', en: 'Sub' },
      supportedPhases: ['discover', 'solve', 'understand'],
      tags: ['capacity', 'weights']
    },
    {
      id: 'max-flow',
      problemId: 'max-flow',
      techniqueId: 'network-flow',
      categoryId: 'network-flow',
      order: 3,
      difficulty: 4,
      title: { es: 'Flujo Máximo', en: 'Maximum Flow' },
      subtitle: { es: 'Sub', en: 'Sub' },
      supportedPhases: ['discover', 'solve', 'understand'],
      tags: ['graph', 'ford-fulkerson']
    }
  ];

  it('filters exercises by title in English and Spanish, technique, and tags', () => {
    expect(filterExercises(dummyExercises, 'reinas', 'es')).toHaveLength(1);
    expect(filterExercises(dummyExercises, 'queens', 'en')).toHaveLength(1);
    expect(filterExercises(dummyExercises, 'knapsack', 'en')).toHaveLength(1);
    expect(filterExercises(dummyExercises, 'mochila', 'es')).toHaveLength(1);
    expect(filterExercises(dummyExercises, 'backtracking', 'es')).toHaveLength(1);
    expect(filterExercises(dummyExercises, 'ford-fulkerson', 'es')).toHaveLength(1);
    expect(filterExercises(dummyExercises, 'non-existent-xyz', 'es')).toHaveLength(0);
  });

  it('renders modal when isOpen is true, updates query, and handles Enter key selection', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onClose = vi.fn();
    const onSelectExercise = vi.fn();

    act(() => {
      root.render(
        <LanguageProvider>
          <StudentProgressProvider>
            <QuickSwitcherModal
              isOpen={true}
              onClose={onClose}
              exercises={dummyExercises}
              onSelectExercise={onSelectExercise}
            />
          </StudentProgressProvider>
        </LanguageProvider>
      );
    });

    const input = container.querySelector('.quick-switcher-input') as HTMLInputElement;
    expect(input).toBeDefined();

    const items = container.querySelectorAll('.quick-switcher-item');
    expect(items.length).toBe(3);

    // Simulate clicking an item
    act(() => {
      (items[1] as HTMLElement).click();
    });

    expect(onSelectExercise).toHaveBeenCalledWith('knapsack-dp');
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape key', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onClose = vi.fn();
    const onSelectExercise = vi.fn();

    act(() => {
      root.render(
        <LanguageProvider>
          <StudentProgressProvider>
            <QuickSwitcherModal
              isOpen={true}
              onClose={onClose}
              exercises={dummyExercises}
              onSelectExercise={onSelectExercise}
            />
          </StudentProgressProvider>
        </LanguageProvider>
      );
    });

    const input = container.querySelector('.quick-switcher-input') as HTMLInputElement;
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });

    expect(onClose).toHaveBeenCalled();
  });
});
