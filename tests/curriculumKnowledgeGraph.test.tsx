// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CurriculumKnowledgeGraph } from '../src/components/CurriculumKnowledgeGraph';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { StudentProgressProvider } from '../src/context/StudentProgressContext';
import type { ExerciseMetadata } from '../src/types';

describe('CurriculumKnowledgeGraph Component', () => {
  const dummyExercises: ExerciseMetadata[] = [
    {
      id: 'merge-sort',
      problemId: 'merge-sort',
      techniqueId: 'divide-and-conquer',
      categoryId: 'divide-and-conquer',
      order: 1,
      difficulty: 1,
      title: { es: 'Merge Sort', en: 'Merge Sort' },
      subtitle: { es: 'Sub', en: 'Sub' },
      supportedPhases: ['discover', 'solve', 'understand'],
      tags: ['sort']
    },
    {
      id: 'interval-scheduling',
      problemId: 'interval-scheduling',
      techniqueId: 'greedy',
      categoryId: 'greedy',
      order: 2,
      difficulty: 2,
      title: { es: 'Planif. Intervalos', en: 'Interval Scheduling' },
      subtitle: { es: 'Sub', en: 'Sub' },
      supportedPhases: ['discover', 'solve', 'understand'],
      tags: ['greedy']
    },
    {
      id: 'weighted-interval',
      problemId: 'weighted-interval',
      techniqueId: 'dynamic-programming',
      categoryId: 'dynamic-programming',
      order: 3,
      difficulty: 3,
      title: { es: 'Intervalos Ponderados', en: 'Weighted Intervals' },
      subtitle: { es: 'Sub', en: 'Sub' },
      supportedPhases: ['discover', 'solve', 'understand'],
      tags: ['dp']
    }
  ];

  it('renders skill tree nodes and columns and handles selection click', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onSelectExercise = vi.fn();

    act(() => {
      root.render(
        <LanguageProvider>
          <StudentProgressProvider>
            <CurriculumKnowledgeGraph
              exercises={dummyExercises}
              onSelectExercise={onSelectExercise}
            />
          </StudentProgressProvider>
        </LanguageProvider>
      );
    });

    expect(container.textContent).toContain('Reducciones');
    expect(container.textContent).toContain('DIVISIÓN Y CONQUISTA');
    expect(container.textContent).toContain('ALGORITMOS GREEDY');
    expect(container.textContent).toContain('PROGRAMACIÓN DINÁMICA');
    expect(container.textContent).toContain('FLUJO & REDUCCIONES');

    // Click on a node
    const nodeGroups = container.querySelectorAll('.ckg-node-group');
    expect(nodeGroups.length).toBeGreaterThan(5);

    const mergeSortNode = Array.from(nodeGroups).find((el) =>
      el.textContent?.includes('Merge Sort')
    ) as SVGGElement;
    expect(mergeSortNode).toBeDefined();

    act(() => {
      mergeSortNode.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(onSelectExercise).toHaveBeenCalledWith('merge-sort');
  });

  it('renders hover hint and node details on mouse interaction', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onSelectExercise = vi.fn();

    act(() => {
      root.render(
        <LanguageProvider>
          <StudentProgressProvider>
            <CurriculumKnowledgeGraph
              exercises={dummyExercises}
              onSelectExercise={onSelectExercise}
            />
          </StudentProgressProvider>
        </LanguageProvider>
      );
    });

    const nodeGroups = container.querySelectorAll('.ckg-node-group');
    const mergeSortNode = Array.from(nodeGroups).find((el) =>
      el.textContent?.includes('Merge Sort')
    ) as SVGGElement;

    act(() => {
      mergeSortNode.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    });

    expect(container.textContent).toContain('KT Ch 5.1');
    expect(container.textContent).toContain('Divide & Conquer');
  });
});
