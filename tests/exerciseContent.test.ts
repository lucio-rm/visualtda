import { describe, it, expect } from 'vitest';
import { EXERCISE_SOLVE_CONTENT } from '../src/engine/exerciseContent';

describe('ExerciseSolveContent Repository', () => {
  const registeredIds = ['n-queens', 'interval-scheduling', 'knapsack-dp', 'knapsack-greedy', 'merge-sort'];

  it('provides dedicated solve content for all core registered exercises', () => {
    for (const id of registeredIds) {
      const content = EXERCISE_SOLVE_CONTENT[id];
      expect(content).toBeDefined();
      expect(content.starterCode).toContain('def ');
      expect(content.hints).toHaveLength(3);
      for (const hint of content.hints) {
        expect(hint.es.length).toBeGreaterThan(10);
        expect(hint.en.length).toBeGreaterThan(10);
      }
    }
  });

  it('evaluates passing vs incomplete code on n-queens', async () => {
    const content = EXERCISE_SOLVE_CONTENT['n-queens'];
    const incompleteRes = await content.runTests('def resolver_n_reinas(n):\n    pass\n');
    expect(incompleteRes.passed).toBe(false);

    const workingCode = `
    def resolver_n_reinas(n):
        tablero = [-1] * n
        columnas = set()
        diag1 = set()
        diag2 = set()
        def backtrack(fila):
            if fila == n: return
            for col in range(n):
                if col in columnas: continue
                backtrack(fila + 1)
        backtrack(0)
    `;
    const workingRes = await content.runTests(workingCode);
    expect(workingRes.passed).toBe(true);
    expect(workingRes.totalPassed).toBe(workingRes.totalTests);
  });

  it('evaluates passing vs incomplete code on merge-sort', async () => {
    const content = EXERCISE_SOLVE_CONTENT['merge-sort'];
    const incompleteRes = await content.runTests('def merge_sort(arr):\n    pass\n');
    expect(incompleteRes.passed).toBe(false);

    const workingCode = `
    def merge_sort(arr):
        if len(arr) <= 1: return arr
        mid = len(arr) // 2
        left = merge_sort(arr[:mid])
        right = merge_sort(arr[mid:])
        return left + right
    `;
    const workingRes = await content.runTests(workingCode);
    expect(workingRes.passed).toBe(true);
  });
});
