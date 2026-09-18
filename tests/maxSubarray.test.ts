import { describe, it, expect } from 'vitest';
import {
  maxSubarrayValidator,
  computeOptimalMaxSubarray,
  MaxSubarrayInput
} from '../src/engine/algorithms/maxSubarrayValidator';
import {
  generateMaxSubarrayTrace,
  DEFAULT_MAX_SUBARRAY
} from '../src/engine/algorithms/maxSubarrayTrace';

describe('MaxSubarrayValidator', () => {
  it('correctly computes ground truth with Kadane', () => {
    expect(computeOptimalMaxSubarray([5, 3, 2, 4, -1]).maxSum).toBe(14);
    expect(computeOptimalMaxSubarray([5, 3, -5, 4, -1]).maxSum).toBe(8);
    expect(computeOptimalMaxSubarray([5, -4, 2, 4, -1]).maxSum).toBe(7);
    expect(computeOptimalMaxSubarray([-5, -2, -8]).maxSum).toBe(-2);
  });

  it('validates optimal contiguous subarray', () => {
    const input: MaxSubarrayInput = { array: [5, -4, 2, 4, -1] };
    const result = [5, -4, 2, 4];
    const validation = maxSubarrayValidator.validate(input, result);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects non-contiguous selections', () => {
    const input: MaxSubarrayInput = { array: [5, -4, 2, 4, -1] };
    const result = [5, 2, 4]; // skipped -4, not contiguous
    const validation = maxSubarrayValidator.validate(input, result);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('no es un subarreglo contiguo'))).toBe(true);
  });

  it('rejects suboptimal contiguous subarrays', () => {
    const input: MaxSubarrayInput = { array: [5, -4, 2, 4, -1] };
    const result = [2, 4]; // sum is 6, optimal is 7
    const validation = maxSubarrayValidator.validate(input, result);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Suma subóptima'))).toBe(true);
  });
});

describe('MaxSubarrayTrace', () => {
  it('generates a complete trace with divide, scan, and combine events', () => {
    const timeline = generateMaxSubarrayTrace(DEFAULT_MAX_SUBARRAY);

    expect(timeline.totalSteps).toBeGreaterThan(10);
    expect(timeline.events[0].type).toBe('init');

    const divideEvents = timeline.events.filter((e) => e.type === 'divide');
    expect(divideEvents.length).toBeGreaterThan(0);

    const scanLeftEvents = timeline.events.filter((e) => e.type === 'scan_left');
    expect(scanLeftEvents.length).toBeGreaterThan(0);

    const scanRightEvents = timeline.events.filter((e) => e.type === 'scan_right');
    expect(scanRightEvents.length).toBeGreaterThan(0);

    const combineEvents = timeline.events.filter((e) => e.type === 'combine_cross');
    expect(combineEvents.length).toBeGreaterThan(0);

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect(lastEvent.data.currentWinner?.sum).toBe(7);
  });

  it('handles single element array', () => {
    const timeline = generateMaxSubarrayTrace([42]);
    expect(timeline.totalSteps).toBeGreaterThanOrEqual(2);
    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.data.currentWinner?.sum).toBe(42);
  });
});
