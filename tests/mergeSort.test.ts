import { describe, it, expect } from 'vitest';
import {
  mergeSortValidator,
  MergeSortInput
} from '../src/engine/algorithms/mergeSortValidator';
import {
  generateMergeSortTrace,
  DEFAULT_MERGE_SORT_ARRAY
} from '../src/engine/algorithms/mergeSortTrace';

describe('MergeSortValidator', () => {
  const input: MergeSortInput = {
    array: [38, 27, 43, 3, 9, 82, 10, 19]
  };

  it('validates a correctly sorted permutation', () => {
    const sorted = [3, 9, 10, 19, 27, 38, 43, 82];
    const result = mergeSortValidator.validate(input, sorted);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an unsorted array', () => {
    const unsorted = [3, 9, 10, 27, 19, 38, 43, 82]; // 27 > 19
    const result = mergeSortValidator.validate(input, unsorted);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Infracción de orden'))).toBe(true);
  });

  it('rejects an array with modified elements or counts', () => {
    const altered = [3, 9, 10, 19, 27, 38, 43, 99]; // 99 instead of 82
    const result = mergeSortValidator.validate(input, altered);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('no pertenece'))).toBe(true);
  });

  it('rejects an array with incorrect length', () => {
    const truncated = [3, 9, 10];
    const result = mergeSortValidator.validate(input, truncated);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Longitud incorrecta'))).toBe(true);
  });
});

describe('MergeSortTrace', () => {
  it('generates a full trace from initial state to complete sorted array', () => {
    const timeline = generateMergeSortTrace(DEFAULT_MERGE_SORT_ARRAY);

    expect(timeline.totalSteps).toBeGreaterThan(15);
    expect(timeline.events[0].type).toBe('init');

    const divideEvents = timeline.events.filter((e) => e.type === 'divide');
    expect(divideEvents.length).toBeGreaterThan(0);

    const compareEvents = timeline.events.filter((e) => e.type === 'merge_compare');
    expect(compareEvents.length).toBeGreaterThan(0);

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect(lastEvent.data.array).toEqual([3, 9, 10, 19, 27, 38, 43, 82]);
    expect(lastEvent.data.comparisonsCount).toBeGreaterThan(0);
  });
});
