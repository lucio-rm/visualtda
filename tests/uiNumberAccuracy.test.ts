import { describe, it, expect } from 'vitest';
import { countInversions } from '../src/engine/algorithms/inversionCountingValidator';
import { DEFAULT_DP_CAPACITY, generateKnapsackDpTrace, DEFAULT_DP_ITEMS } from '../src/engine/algorithms/knapsackDpTrace';
import { generateMedianOfMediansTrace, DEFAULT_MOM_ARRAY } from '../src/engine/algorithms/medianOfMediansTrace';
import {
  solveWeightedIntervals,
  solveWeightedIntervalsGreedy
} from '../src/engine/algorithms/weightedIntervalValidator';
import { DEFAULT_WEIGHTED_INTERVALS } from '../src/engine/algorithms/weightedIntervalTrace';
import { generateKaratsubaTrace } from '../src/engine/algorithms/karatsubaTrace';
import { generateKnapsackBBTrace } from '../src/engine/algorithms/knapsackBranchAndBoundTrace';
import { generateTspBBTrace } from '../src/engine/algorithms/tspBranchAndBoundTrace';
import { generateRoadAntennasTrace } from '../src/engine/algorithms/roadAntennasTrace';

describe('UI Number Accuracy & Consistency Regression Sweep', () => {
  it('1. Inversion Counting: preset array [1, 5, 2, 6, 3, 4] has exactly 5 inversions', () => {
    const arr = [1, 5, 2, 6, 3, 4];
    const inv = countInversions(arr);
    // Inversions: (5,2), (5,3), (5,4), (6,3), (6,4) = 5
    expect(inv).toBe(5);
  });

  it('2. Knapsack DP: capacity constant matches table columns and preset definition (C = 6)', () => {
    expect(DEFAULT_DP_CAPACITY).toBe(6);
    const trace = generateKnapsackDpTrace(DEFAULT_DP_ITEMS, DEFAULT_DP_CAPACITY);
    const lastEvent = trace.events[trace.events.length - 1];
    expect(lastEvent.data.capacity).toBe(6);
    expect(lastEvent.data.table[0].length).toBe(7); // columns 0..6
  });

  it('3. Median of Medians: complete event retains guaranteed >= 30% pruning count', () => {
    const trace = generateMedianOfMediansTrace(DEFAULT_MOM_ARRAY, 7);
    const lastEvent = trace.events[trace.events.length - 1];
    expect(lastEvent.type).toBe('COMPLETE');
    expect(lastEvent.data.guaranteedEliminatedCount).toBeGreaterThanOrEqual(
      Math.floor((3 * DEFAULT_MOM_ARRAY.length) / 10)
    );
  });

  it('4. Weighted Interval Scheduling: DP optimal (18) strictly exceeds greedy (9) on canonical failure case', () => {
    const optimal = solveWeightedIntervals(DEFAULT_WEIGHTED_INTERVALS);
    const optWeight = optimal.reduce((sum, t) => sum + t.weight, 0);
    const greedy = solveWeightedIntervalsGreedy(DEFAULT_WEIGHTED_INTERVALS);
    const greedyWeight = greedy.reduce((sum, t) => sum + t.weight, 0);

    expect(optWeight).toBe(18); // T2(10) + T4(8) = 18
    expect(greedyWeight).toBe(9); // T1(2) + T3(3) + T5(4) = 9
    expect(greedyWeight).toBeLessThan(optWeight);
  });

  it('5. Karatsuba: verifies 3 multiplications compute correct product (1234 * 5678 = 7006652)', () => {
    const trace = generateKaratsubaTrace(1234, 5678);
    const last = trace.events[trace.events.length - 1];
    expect(last.data.result).toBe(1234 * 5678);
    expect(last.data.result).toBe(7006652);
    expect(last.data.multiplicationCount).toBe(3);
  });

  it('6. Knapsack Branch & Bound: finds exact optimal value 110 for default capacity 7', () => {
    const trace = generateKnapsackBBTrace(7);
    const last = trace.events[trace.events.length - 1];
    // I2(w=3, v=50) + I3(w=4, v=60) = w=7, v=110
    expect(last.data.incumbentBest).toBe(110);
  });

  it('7. TSP Branch & Bound: finds exact optimal tour cost 30 for default 5-city matrix', () => {
    const trace = generateTspBBTrace();
    const last = trace.events[trace.events.length - 1];
    expect(last.data.incumbentBest).toBe(30);
  });

  it('8. Road Antennas: places exactly 3 antennas for default 9 houses with R=10', () => {
    const trace = generateRoadAntennasTrace([4, 12, 18, 26, 32, 45, 60, 68, 75], 10);
    const last = trace.events[trace.events.length - 1];
    expect(last.data.antennas.length).toBe(3);
    expect(last.data.coveredHouseIndices.length).toBe(9);
  });
});
