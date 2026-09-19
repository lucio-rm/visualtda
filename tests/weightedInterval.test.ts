import { describe, it, expect } from 'vitest';
import {
  WeightedInterval,
  computePArray,
  solveWeightedIntervals,
  solveWeightedIntervalsGreedy,
  weightedIntervalValidator
} from '../src/engine/algorithms/weightedIntervalValidator';
import { generateWeightedIntervalTrace } from '../src/engine/algorithms/weightedIntervalTrace';

describe('Weighted Interval Scheduling DP Solver', () => {
  const classicTrap: WeightedInterval[] = [
    { id: 'T1', start: 0, end: 3, weight: 2 },
    { id: 'T2', start: 1, end: 6, weight: 10 },
    { id: 'T3', start: 4, end: 8, weight: 3 },
    { id: 'T4', start: 7, end: 11, weight: 8 },
    { id: 'T5', start: 9, end: 12, weight: 4 }
  ];

  it('computes correct predecessor p(j) array using binary search', () => {
    const sorted = [...classicTrap].sort((a, b) => a.end - b.end);
    const p = computePArray(sorted);
    // sorted:
    // 1: T1 [0, 3] -> p(1) = 0
    // 2: T2 [1, 6] -> p(2) = 0 (T1 ends 3 > 1)
    // 3: T3 [4, 8] -> p(3) = 1 (T1 ends 3 <= 4, but T2 ends 6 > 4)
    // 4: T4 [7, 11] -> p(4) = 2 (T2 ends 6 <= 7, T3 ends 8 > 7)
    // 5: T5 [9, 12] -> p(5) = 3 (T3 ends 8 <= 9, T4 ends 11 > 9)
    expect(p[1]).toBe(0);
    expect(p[2]).toBe(0);
    expect(p[3]).toBe(1);
    expect(p[4]).toBe(2);
    expect(p[5]).toBe(3);
  });

  it('proves DP outscores greedy on the classic trap instance', () => {
    const dpOptimal = solveWeightedIntervals(classicTrap);
    const dpWeight = dpOptimal.reduce((sum, t) => sum + t.weight, 0);
    expect(dpWeight).toBe(18); // T2 (10) + T4 (8)
    expect(dpOptimal.map((t) => t.id)).toEqual(['T2', 'T4']);

    const greedy = solveWeightedIntervalsGreedy(classicTrap);
    const greedyWeight = greedy.reduce((sum, t) => sum + t.weight, 0);
    expect(greedyWeight).toBe(9); // T1 (2) + T3 (3) + T5 (4) = 9
    expect(dpWeight).toBeGreaterThan(greedyWeight);
  });

  it('handles completely disjoint intervals selecting all', () => {
    const disjoint: WeightedInterval[] = [
      { id: 'A', start: 1, end: 3, weight: 5 },
      { id: 'B', start: 4, end: 6, weight: 10 },
      { id: 'C', start: 7, end: 9, weight: 15 }
    ];
    const res = solveWeightedIntervals(disjoint);
    expect(res.length).toBe(3);
    expect(res.reduce((sum, t) => sum + t.weight, 0)).toBe(30);
  });

  it('handles edge cases: empty list and single interval', () => {
    expect(solveWeightedIntervals([])).toEqual([]);

    const single: WeightedInterval[] = [{ id: 'X', start: 2, end: 5, weight: 42 }];
    const resSingle = solveWeightedIntervals(single);
    expect(resSingle).toEqual(single);
  });
});

describe('Weighted Interval Validator', () => {
  const sample: WeightedInterval[] = [
    { id: 'T1', start: 0, end: 3, weight: 2 },
    { id: 'T2', start: 1, end: 6, weight: 10 },
    { id: 'T3', start: 7, end: 11, weight: 8 }
  ];

  it('accepts optimal compatible subset', () => {
    const validation = weightedIntervalValidator.validate(
      { intervals: sample },
      [sample[1], sample[2]] // T2 + T3, weight 18
    );
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects overlapping intervals', () => {
    const validation = weightedIntervalValidator.validate(
      { intervals: sample },
      [sample[0], sample[1]] // T1 [0,3] and T2 [1,6] overlap
    );
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('Conflicto de superposición');
  });

  it('rejects suboptimal valid subset', () => {
    const validation = weightedIntervalValidator.validate(
      { intervals: sample },
      [sample[0], sample[2]] // T1 + T3 = 10 < 18
    );
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('subóptimo');
  });

  it('rejects foreign intervals not in input', () => {
    const foreign: WeightedInterval = { id: 'FAKE', start: 20, end: 30, weight: 100 };
    const validation = weightedIntervalValidator.validate({ intervals: sample }, [foreign]);
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('no existe');
  });

  it('validates empty list requires empty result', () => {
    expect(weightedIntervalValidator.validate({ intervals: [] }, []).valid).toBe(true);
    expect(
      weightedIntervalValidator.validate({ intervals: [] }, [{ id: 'A', start: 1, end: 2, weight: 3 }]).valid
    ).toBe(false);
  });
});

describe('Weighted Interval Trace Generator', () => {
  it('generates a full trace timeline with DP table and reconstruction', () => {
    const timeline = generateWeightedIntervalTrace();
    expect(timeline.totalSteps).toBeGreaterThan(5);

    const types = timeline.events.map((e) => e.type);
    expect(types).toContain('INIT');
    expect(types).toContain('COMPUTE_P');
    expect(types).toContain('EVALUATE_INTERVAL');
    expect(types).toContain('START_RECONSTRUCTION');
    expect(types).toContain('RECONSTRUCT_INCLUDE');
    expect(types).toContain('COMPLETE');

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.data.reconstructedIds).toEqual(['T2', 'T4']);
  });
});
