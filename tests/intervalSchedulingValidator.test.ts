import { describe, it, expect } from 'vitest';
import { intervalSchedulingValidator, Interval } from '../src/engine/algorithms/intervalSchedulingValidator';

describe('IntervalSchedulingValidator', () => {
  const sampleInput: { intervals: Interval[] } = {
    intervals: [
      [0, 3],
      [1, 5],
      [3, 6],
      [4, 8],
      [6, 9],
      [7, 10]
    ]
  };

  it('validates a strictly optimal set [(0, 3), (3, 6), (6, 9)]', () => {
    const validSelection: Interval[] = [
      [0, 3],
      [3, 6],
      [6, 9]
    ];
    const result = intervalSchedulingValidator.validate(sampleInput, validSelection);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects selections with overlapping intervals', () => {
    const overlapping: Interval[] = [
      [0, 3],
      [1, 5]
    ];
    const result = intervalSchedulingValidator.validate(sampleInput, overlapping);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Solapamiento detectado'))).toBe(true);
  });

  it('rejects sub-optimal selections (compatible but cardinality < optimal)', () => {
    const suboptimal: Interval[] = [
      [1, 5],
      [6, 9]
    ];
    const result = intervalSchedulingValidator.validate(sampleInput, suboptimal);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Subóptimo'))).toBe(true);
  });

  it('rejects foreign intervals not present in input pool', () => {
    const foreign: Interval[] = [
      [0, 3],
      [10, 20]
    ];
    const result = intervalSchedulingValidator.validate(sampleInput, foreign);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('no pertenece'))).toBe(true);
  });
});
