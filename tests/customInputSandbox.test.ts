import { describe, it, expect } from 'vitest';
import { parseCustomIntervalString } from '../src/components/visualizers/IntervalSchedulingPlayground';

describe('Custom Input Sandbox - parseCustomIntervalString', () => {
  it('parses valid JSON array of intervals correctly', () => {
    const raw = '[[1, 4], [3, 5], [0, 6], [5, 7]]';
    const res = parseCustomIntervalString(raw, 'es');
    expect(res.error).toBeUndefined();
    expect(res.intervals).toEqual([
      [1, 4],
      [3, 5],
      [0, 6],
      [5, 7]
    ]);
  });

  it('parses regex dash/comma separated pairs format correctly', () => {
    const raw = '1-4, 3-6, 7-10';
    const res = parseCustomIntervalString(raw, 'en');
    expect(res.error).toBeUndefined();
    expect(res.intervals).toEqual([
      [1, 4],
      [3, 6],
      [7, 10]
    ]);
  });

  it('rejects empty input string', () => {
    const res = parseCustomIntervalString('   ', 'es');
    expect(res.error).toContain('vacía');
  });

  it('rejects intervals where start >= end', () => {
    const res = parseCustomIntervalString('[[5, 2]]', 'es');
    expect(res.error).toContain('Intervalo inválido');
  });

  it('rejects intervals with negative numbers or exceeding 100', () => {
    const resNegative = parseCustomIntervalString('[[-1, 5]]', 'es');
    expect(resNegative.error).toContain('Intervalo inválido');

    const resOverflow = parseCustomIntervalString('[[0, 150]]', 'es');
    expect(resOverflow.error).toContain('Intervalo inválido');
  });

  it('rejects inputs exceeding maximum 10 intervals', () => {
    const eleven = '[[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11]]';
    const res = parseCustomIntervalString(eleven, 'es');
    expect(res.error).toContain('Máximo 10');
  });

  it('rejects malformed non-numeric array elements', () => {
    const bad = '[["a", "b"]]';
    const res = parseCustomIntervalString(bad, 'en');
    expect(res.error).toBeDefined();
  });
});
