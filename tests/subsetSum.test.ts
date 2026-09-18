import { describe, it, expect } from 'vitest';
import {
  solveSubsetSum,
  subsetSumValidator
} from '../src/engine/algorithms/subsetSumValidator';
import { generateSubsetSumTrace } from '../src/engine/algorithms/subsetSumTrace';

describe('Subset Sum (Backtracking with Pruning)', () => {
  it('handles edge cases: empty list, zero target, and single matching element', () => {
    expect(solveSubsetSum([], 10)).toEqual([]);
    expect(solveSubsetSum([1, 2, 3], 0)).toEqual([]);

    const single = solveSubsetSum([10], 10);
    expect(single).toEqual([[10]]);
    const val = subsetSumValidator.validate({ numbers: [10], target: 10 }, single);
    expect(val.valid).toBe(true);
  });

  it('correctly finds all subsets that sum to target', () => {
    // [2, 3, 5, 7, 8] with target S = 10
    // Elements sorted desc: [8, 7, 5, 3, 2]
    // Subsets: [8, 2], [7, 3], [5, 3, 2]
    const numbers = [2, 3, 5, 7, 8];
    const target = 10;
    const solutions = solveSubsetSum(numbers, target);

    expect(solutions.length).toBe(3);
    for (const sol of solutions) {
      expect(sol.reduce((a, b) => a + b, 0)).toBe(10);
    }

    const val = subsetSumValidator.validate({ numbers, target }, solutions);
    expect(val.valid).toBe(true);
  });

  it('returns empty list when target cannot be reached', () => {
    const numbers = [2, 4, 6];
    const target = 7; // all even numbers cannot sum to odd
    const solutions = solveSubsetSum(numbers, target);
    expect(solutions).toEqual([]);

    const val = subsetSumValidator.validate({ numbers, target }, []);
    expect(val.valid).toBe(true);
  });

  it('detects incorrect subset sums as invalid', () => {
    const numbers = [2, 3, 5, 7, 8];
    const target = 10;
    const invalidSum = [[8, 3]]; // 8 + 3 = 11 != 10
    const val = subsetSumValidator.validate({ numbers, target }, invalidSum);
    expect(val.valid).toBe(false);
    expect(val.errors.some((e) => e.includes('inválido'))).toBe(true);
  });

  it('detects fabricated or overused numbers as invalid', () => {
    const numbers = [2, 3, 5];
    const target = 4;
    // Trying to use 2 twice: [2, 2], but original only has one 2
    const overused = [[2, 2]];
    const val = subsetSumValidator.validate({ numbers, target }, overused);
    expect(val.valid).toBe(false);
    expect(val.errors.some((e) => e.includes('utiliza el número 2'))).toBe(true);
  });

  it('generates complete trace with pruning events and solutions', () => {
    const numbers = [2, 3, 5, 7, 8];
    const target = 10;
    const timeline = generateSubsetSumTrace(numbers, target);

    expect(timeline.totalSteps).toBeGreaterThan(10);
    expect(timeline.events[0].type).toBe('INIT');

    const pruneExcessEvents = timeline.events.filter((e) => e.type === 'PRUNE_EXCESS');
    const pruneDeficitEvents = timeline.events.filter((e) => e.type === 'PRUNE_DEFICIT');
    const solutionEvents = timeline.events.filter((e) => e.type === 'SOLUTION_FOUND');

    expect(pruneExcessEvents.length).toBeGreaterThan(0);
    expect(pruneDeficitEvents.length).toBeGreaterThan(0);
    expect(solutionEvents.length).toBe(3);

    const finalEvent = timeline.events[timeline.totalSteps - 1];
    expect(finalEvent.type).toBe('COMPLETE');
    expect(finalEvent.data.solutions.length).toBe(3);
  });
});
