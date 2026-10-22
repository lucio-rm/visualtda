import { describe, it, expect } from 'vitest';
import { CROSS_EXERCISE_RELATIONS, getRelatedExercisesFor } from '../src/engine/crossExerciseConnections';
import { registry } from '../src/engine/registry';

describe('Cross-Exercise Connections & Technique Comparisons', () => {
  it('ensures every source exercise exists in the registry', () => {
    const allRegisteredIds = new Set(registry.getExercises().map((e) => e.id));

    for (const sourceId of Object.keys(CROSS_EXERCISE_RELATIONS)) {
      expect(allRegisteredIds.has(sourceId)).toBe(true);
    }
  });

  it('ensures every target exercise exists in the registry', () => {
    const allRegisteredIds = new Set(registry.getExercises().map((e) => e.id));

    for (const [sourceId, relations] of Object.entries(CROSS_EXERCISE_RELATIONS)) {
      for (const rel of relations) {
        expect(
          allRegisteredIds.has(rel.targetExerciseId),
          `Target exercise "${rel.targetExerciseId}" from "${sourceId}" must be registered`
        ).toBe(true);
      }
    }
  });

  it('verifies all relations have bilingual titles, insights, and badges', () => {
    for (const [sourceId, relations] of Object.entries(CROSS_EXERCISE_RELATIONS)) {
      expect(relations.length).toBeGreaterThan(0);
      for (const rel of relations) {
        expect(rel.comparisonTitle.es.trim().length, `Title es for ${sourceId}`).toBeGreaterThan(3);
        expect(rel.comparisonTitle.en.trim().length, `Title en for ${sourceId}`).toBeGreaterThan(3);
        expect(rel.comparisonInsight.es.trim().length, `Insight es for ${sourceId}`).toBeGreaterThan(15);
        expect(rel.comparisonInsight.en.trim().length, `Insight en for ${sourceId}`).toBeGreaterThan(15);
        expect(rel.paradigmBadge.es.trim().length, `Badge es for ${sourceId}`).toBeGreaterThan(2);
        expect(rel.paradigmBadge.en.trim().length, `Badge en for ${sourceId}`).toBeGreaterThan(2);
      }
    }
  });

  it('returns empty array safely for exercises without relations', () => {
    expect(getRelatedExercisesFor('non-existent-exercise')).toEqual([]);
  });

  it('verifies bidirectional relations for major flagship pairs', () => {
    // Knapsack DP <-> Knapsack Greedy
    const dpRelations = getRelatedExercisesFor('knapsack-dp');
    expect(dpRelations.some((r) => r.targetExerciseId === 'knapsack-greedy')).toBe(true);

    const greedyRelations = getRelatedExercisesFor('knapsack-greedy');
    expect(greedyRelations.some((r) => r.targetExerciseId === 'knapsack-dp')).toBe(true);

    // Dijkstra <-> Bellman-Ford
    const dijkstraRelations = getRelatedExercisesFor('dijkstra-greedy');
    expect(dijkstraRelations.some((r) => r.targetExerciseId === 'bellman-ford-dp')).toBe(true);

    const bfRelations = getRelatedExercisesFor('bellman-ford-dp');
    expect(bfRelations.some((r) => r.targetExerciseId === 'dijkstra-greedy')).toBe(true);

    // Max Flow <-> Linear Programming
    const maxFlowRelations = getRelatedExercisesFor('max-flow');
    expect(maxFlowRelations.some((r) => r.targetExerciseId === 'linear-programming-formulation')).toBe(true);

    const lpRelations = getRelatedExercisesFor('linear-programming-formulation');
    expect(lpRelations.some((r) => r.targetExerciseId === 'max-flow')).toBe(true);

    // Graph Coloring <-> Sudoku
    const gcRelations = getRelatedExercisesFor('graph-coloring-backtracking');
    expect(gcRelations.some((r) => r.targetExerciseId === 'sudoku-backtracking')).toBe(true);

    const sudokuRelations = getRelatedExercisesFor('sudoku-backtracking');
    expect(sudokuRelations.some((r) => r.targetExerciseId === 'graph-coloring-backtracking')).toBe(true);

    // Hamiltonian Cycle <-> TSP B&B
    const hcRelations = getRelatedExercisesFor('hamiltonian-cycle-backtracking');
    expect(hcRelations.some((r) => r.targetExerciseId === 'tsp-branch-and-bound')).toBe(true);

    const tspRelations = getRelatedExercisesFor('tsp-branch-and-bound');
    expect(tspRelations.some((r) => r.targetExerciseId === 'hamiltonian-cycle-backtracking')).toBe(true);
  });
});
