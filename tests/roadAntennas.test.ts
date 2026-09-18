import { describe, it, expect } from 'vitest';
import {
  solveRoadAntennas,
  roadAntennasValidator
} from '../src/engine/algorithms/roadAntennasValidator';
import { generateRoadAntennasTrace } from '../src/engine/algorithms/roadAntennasTrace';

describe('Road Antennas (Greedy Interval Covering)', () => {
  it('handles empty houses and single house edge cases', () => {
    expect(solveRoadAntennas([], 10)).toEqual([]);

    const single = solveRoadAntennas([5], 10);
    expect(single).toEqual([15]); // 5 + 10 = 15, covers [-5, 25] including 5

    const valSingle = roadAntennasValidator.validate({ houses: [5], radius: 10 }, single);
    expect(valSingle.valid).toBe(true);
  });

  it('correctly covers multiple houses with a single antenna within span 2R', () => {
    // Houses at 10, 15, 20, 25, 30. Radius = 10.
    // First house = 10 -> antenna placed at 10 + 10 = 20.
    // Coverage span = [10, 30]. All 5 houses covered!
    const houses = [10, 15, 20, 25, 30];
    const antennas = solveRoadAntennas(houses, 10);
    expect(antennas).toEqual([20]);

    const val = roadAntennasValidator.validate({ houses, radius: 10 }, antennas);
    expect(val.valid).toBe(true);
  });

  it('correctly places multiple antennas across disjoint clusters', () => {
    // Houses: [4, 12, 18, 26, 32, 45, 60, 68, 75], radius = 10
    // Uncovered: 4 -> antenna at 14 (covers up to 24: 4, 12, 18)
    // Next uncovered: 26 -> antenna at 36 (covers up to 46: 26, 32, 45)
    // Next uncovered: 60 -> antenna at 70 (covers up to 80: 60, 68, 75)
    const houses = [4, 12, 18, 26, 32, 45, 60, 68, 75];
    const antennas = solveRoadAntennas(houses, 10);
    expect(antennas).toEqual([14, 36, 70]);

    const val = roadAntennasValidator.validate({ houses, radius: 10 }, antennas);
    expect(val.valid).toBe(true);
  });

  it('detects missing house coverage as invalid', () => {
    const houses = [5, 25, 50];
    const incomplete = [15]; // only covers 5 and 25, misses 50
    const val = roadAntennasValidator.validate({ houses, radius: 10 }, incomplete);
    expect(val.valid).toBe(false);
    expect(val.errors.some((e) => e.includes('sin cobertura'))).toBe(true);
  });

  it('detects non-minimal antenna count as suboptimal', () => {
    const houses = [5, 15, 25]; // Optimal is 1 antenna at 15
    const suboptimal = [5, 15, 25]; // 3 antennas
    const val = roadAntennasValidator.validate({ houses, radius: 10 }, suboptimal);
    expect(val.valid).toBe(false);
    expect(val.errors.some((e) => e.includes('no es mínima'))).toBe(true);
  });

  it('generates complete trace with valid step progression and full coverage', () => {
    const houses = [28, 4, 12, 50];
    const radius = 10;
    const trace = generateRoadAntennasTrace(houses, radius);

    expect(trace.totalSteps).toBeGreaterThan(4);
    expect(trace.events[0].type).toBe('INIT');
    expect(trace.events[1].type).toBe('SORT');
    expect(trace.events[1].data.houses).toEqual([4, 12, 28, 50]);

    const finalStep = trace.events[trace.totalSteps - 1].data;
    expect(finalStep.action).toBe('COMPLETE');
    expect(finalStep.coveredHouseIndices.length).toBe(4);
    expect(finalStep.antennas.length).toBe(3); // 4->14 (covers 4,12), 28->38 (covers 28), 50->60 (covers 50)
  });
});
