import { describe, it, expect } from 'vitest';
import {
  countInversions,
  countInversionsNaive,
  getInversionPairs,
  inversionCountingValidator
} from '../src/engine/algorithms/inversionCountingValidator';
import { generateInversionTrace } from '../src/engine/algorithms/inversionCountingTrace';

describe('Inversion Counting DyC Solver', () => {
  it('correctly handles already sorted arrays (0 inversions)', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(countInversions(arr)).toBe(0);
    expect(countInversionsNaive(arr)).toBe(0);
    expect(getInversionPairs(arr)).toHaveLength(0);
  });

  it('correctly handles strictly reversed arrays (n*(n-1)/2 inversions)', () => {
    const arr = [5, 4, 3, 2, 1];
    const expected = (5 * 4) / 2; // 10
    expect(countInversions(arr)).toBe(expected);
    expect(countInversionsNaive(arr)).toBe(expected);
    expect(getInversionPairs(arr)).toHaveLength(expected);
  });

  it('computes correct inversions for classic CLRS instance [2, 3, 8, 6, 1]', () => {
    const arr = [2, 3, 8, 6, 1];
    // Inverted pairs:
    // (2, 1) -> indices (0, 4)
    // (3, 1) -> indices (1, 4)
    // (8, 6) -> indices (2, 3)
    // (8, 1) -> indices (2, 4)
    // (6, 1) -> indices (3, 4)
    // Total = 5
    expect(countInversions(arr)).toBe(5);
    expect(countInversionsNaive(arr)).toBe(5);
    const pairs = getInversionPairs(arr);
    expect(pairs).toEqual([
      [0, 4],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4]
    ]);
  });

  it('handles arrays with duplicate values and negatives', () => {
    const arr = [-5, 10, -2, 0, 7, 0];
    const fast = countInversions(arr);
    const naive = countInversionsNaive(arr);
    expect(fast).toBe(naive);
  });

  it('handles edge cases: empty array and single element', () => {
    expect(countInversions([])).toBe(0);
    expect(countInversions([99])).toBe(0);
  });
});

describe('Inversion Counting Validator', () => {
  it('accepts correct count for classic array', () => {
    const arr = [2, 3, 8, 6, 1];
    const res = inversionCountingValidator.validate({ array: arr }, 5);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('rejects incorrect count with helpful diagnostic error', () => {
    const arr = [2, 3, 8, 6, 1];
    const res = inversionCountingValidator.validate({ array: arr }, 3);
    expect(res.valid).toBe(false);
    expect(res.errors[0]).toContain('Conteo incorrecto');
    expect(res.errors[0]).toContain('exactamente 5 inversiones');
  });

  it('rejects invalid inputs like negative counts, strings or NaN', () => {
    const arr = [1, 2, 3];
    expect(inversionCountingValidator.validate({ array: arr }, -1).valid).toBe(false);
    expect(inversionCountingValidator.validate({ array: arr }, NaN).valid).toBe(false);
    // @ts-expect-error Testing invalid runtime type
    expect(inversionCountingValidator.validate({ array: arr }, '3').valid).toBe(false);
  });
});

describe('Inversion Counting Trace Generator', () => {
  it('generates a full trace with DIVIDE, COMPARE, COUNT_SPLIT and COMPLETE steps', () => {
    const arr = [2, 3, 8, 6, 1];
    const timeline = generateInversionTrace(arr);

    expect(timeline.events.length).toBeGreaterThan(0);
    expect(timeline.events[0].type).toBe('INIT');
    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('COMPLETE');
    expect(lastEvent.data.totalInversions).toBe(5);

    const splitSteps = timeline.events.filter((s) => s.type === 'COUNT_SPLIT');
    expect(splitSteps.length).toBeGreaterThan(0);
    const sumAdded = splitSteps.reduce((sum, s) => sum + s.data.inversionsAddedThisStep, 0);
    expect(sumAdded).toBe(5);
  });

  it('generates a clean 2-step trace for trivial arrays', () => {
    const timeline = generateInversionTrace([42]);
    expect(timeline.events).toHaveLength(2);
    expect(timeline.events[0].type).toBe('INIT');
    expect(timeline.events[1].type).toBe('COMPLETE');
    expect(timeline.events[1].data.totalInversions).toBe(0);
  });
});
