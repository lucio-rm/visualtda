import { describe, it, expect } from 'vitest';
import { ExerciseRegistry, registry, CATEGORIES, EXERCISES } from '../src/engine/registry';

describe('ExerciseRegistry', () => {
  it('loads and sorts categories by order', () => {
    const cats = registry.getCategories();
    expect(cats.length).toBe(CATEGORIES.length);
    expect(cats[0].id).toBe('divide-and-conquer');
    expect(cats[1].id).toBe('greedy');
    expect(cats[2].id).toBe('backtracking');
  });

  it('retrieves category by ID', () => {
    const cat = registry.getCategory('backtracking');
    expect(cat).toBeDefined();
    expect(cat?.title.es).toBe('Backtracking');
    expect(cat?.title.en).toBe('Backtracking');
  });

  it('returns undefined for non-existent category', () => {
    expect(registry.getCategory('non-existent')).toBeUndefined();
  });

  it('retrieves all exercises when no category filter is provided', () => {
    const all = registry.getExercises();
    expect(all.length).toBe(EXERCISES.length);
  });

  it('filters exercises by category correctly', () => {
    const btExercises = registry.getExercises('backtracking');
    expect(btExercises.length).toBe(2);
    expect(btExercises.map((e) => e.id)).toContain('n-queens');
    expect(btExercises.map((e) => e.id)).toContain('subset-sum-backtracking');

    const greedyExercises = registry.getExercises('greedy');
    expect(greedyExercises.length).toBe(3);
    expect(greedyExercises.map((e) => e.id)).toContain('interval-scheduling');
    expect(greedyExercises.map((e) => e.id)).toContain('knapsack-greedy');
    expect(greedyExercises.map((e) => e.id)).toContain('road-antennas-greedy');

    const dpExercises = registry.getExercises('dynamic-programming');
    expect(dpExercises.length).toBe(3);
    expect(dpExercises.map((e) => e.id)).toContain('knapsack-dp');
    expect(dpExercises.map((e) => e.id)).toContain('juan-el-vago');
    expect(dpExercises.map((e) => e.id)).toContain('coin-change-dp');

    const dycExercises = registry.getExercises('divide-and-conquer');
    expect(dycExercises.length).toBe(3);
    expect(dycExercises.map((e) => e.id)).toContain('merge-sort');
    expect(dycExercises.map((e) => e.id)).toContain('max-subarray-dyc');
    expect(dycExercises.map((e) => e.id)).toContain('peak-finding-dyc');
  });

  it('retrieves specific exercise by ID', () => {
    const ex = registry.getExercise('n-queens');
    expect(ex).toBeDefined();
    expect(ex?.problemId).toBe('n-queens');
    expect(ex?.techniqueId).toBe('backtracking');
    expect(ex?.difficulty).toBe(2);
  });

  it('demonstrates multiple exercises sharing the same problem with different techniques', () => {
    const knapsackExercises = registry.getExercisesByProblem('knapsack');
    expect(knapsackExercises.length).toBe(2);

    const techniques = knapsackExercises.map((e) => e.techniqueId);
    expect(techniques).toContain('greedy');
    expect(techniques).toContain('dynamic-programming');
  });

  it('allows custom registry instantiation for testing isolation', () => {
    const custom = new ExerciseRegistry([], []);
    expect(custom.getCategories()).toEqual([]);
    expect(custom.getExercises()).toEqual([]);
  });
});
