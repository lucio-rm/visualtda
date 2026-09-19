import { describe, it, expect } from 'vitest';
import {
  solvePeakFinding,
  peakFindingValidator
} from '../src/engine/algorithms/peakFindingValidator';
import { generatePeakFindingTrace } from '../src/engine/algorithms/peakFindingTrace';

describe('Peak Finding D&C Solver', () => {
  it('finds the peak in a single-mountain array', () => {
    const arr = [1, 3, 7, 12, 18, 14, 9, 2];
    const peakIdx = solvePeakFinding(arr);
    expect(peakIdx).toBe(4);
    expect(arr[peakIdx]).toBe(18);
  });

  it('finds a valid local peak in a multi-peak mountain range', () => {
    const arr = [4, 10, 5, 8, 15, 3, 11, 2];
    const peakIdx = solvePeakFinding(arr);
    const val = arr[peakIdx];
    const leftOk = peakIdx === 0 || val >= arr[peakIdx - 1];
    const rightOk = peakIdx === arr.length - 1 || val >= arr[peakIdx + 1];
    expect(leftOk && rightOk).toBe(true);
  });

  it('handles strictly increasing array (peak at right edge)', () => {
    const arr = [1, 2, 3, 4, 5];
    const peakIdx = solvePeakFinding(arr);
    expect(peakIdx).toBe(4);
    expect(arr[peakIdx]).toBe(5);
  });

  it('handles strictly decreasing array (peak at left edge)', () => {
    const arr = [5, 4, 3, 2, 1];
    const peakIdx = solvePeakFinding(arr);
    expect(peakIdx).toBe(0);
    expect(arr[peakIdx]).toBe(5);
  });

  it('handles single-element array', () => {
    const arr = [42];
    const peakIdx = solvePeakFinding(arr);
    expect(peakIdx).toBe(0);
  });

  it('handles empty array', () => {
    expect(solvePeakFinding([])).toBe(-1);
  });

  it('handles array with duplicate values (plateau)', () => {
    const arr = [2, 5, 5, 5, 1];
    const peakIdx = solvePeakFinding(arr);
    expect(arr[peakIdx]).toBe(5);
  });
});

describe('Peak Finding Validator', () => {
  it('accepts valid peak index', () => {
    const arr = [1, 3, 7, 12, 18, 14, 9, 2];
    const validation = peakFindingValidator.validate({ array: arr }, 4);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects valley / non-peak index with informative message', () => {
    const arr = [1, 3, 7, 12, 18, 14, 9, 2];
    const validation = peakFindingValidator.validate({ array: arr }, 2); // arr[2]=7 < arr[3]=12
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('menor que su vecino derecho');
  });

  it('rejects out of bounds index', () => {
    const arr = [1, 2, 3];
    const validation = peakFindingValidator.validate({ array: arr }, 5);
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('fuera de los límites');
  });

  it('validates edge cases: empty array requires -1', () => {
    expect(peakFindingValidator.validate({ array: [] }, -1).valid).toBe(true);
    expect(peakFindingValidator.validate({ array: [] }, 0).valid).toBe(false);
  });
});

describe('Peak Finding Trace Generator', () => {
  it('generates a logarithmic trace reaching a peak', () => {
    const arr = [4, 7, 12, 9, 3, 8, 15, 6, 2];
    const timeline = generatePeakFindingTrace(arr);

    expect(timeline.totalSteps).toBeGreaterThan(3);
    const initEvent = timeline.events[0];
    expect(initEvent.type).toBe('INIT');

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('PEAK_FOUND');
    expect(lastEvent.data.foundIndex).not.toBeNull();

    // Verify foundIndex is indeed a peak
    const peakIdx = lastEvent.data.foundIndex!;
    const val = arr[peakIdx];
    const leftOk = peakIdx === 0 || val >= arr[peakIdx - 1];
    const rightOk = peakIdx === arr.length - 1 || val >= arr[peakIdx + 1];
    expect(leftOk && rightOk).toBe(true);
  });
});
