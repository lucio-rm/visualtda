import { describe, it, expect } from 'vitest';
import { compute1DLabelLevels } from '../src/utils/staggerLayout';

describe('compute1DLabelLevels', () => {
  it('assigns level 0 to well-spaced items', () => {
    const items = [
      { id: 'a', x: 10 },
      { id: 'b', x: 60 },
      { id: 'c', x: 120 }
    ];
    const levels = compute1DLabelLevels(items, 30);
    expect(levels['a']).toBe(0);
    expect(levels['b']).toBe(0);
    expect(levels['c']).toBe(0);
  });

  it('assigns different levels to items with identical coordinates (complete crowding)', () => {
    const items = [
      { id: 'j1', x: 100 },
      { id: 'j2', x: 100 },
      { id: 'j3', x: 100 }
    ];
    const levels = compute1DLabelLevels(items, 30);
    const assigned = [levels['j1'], levels['j2'], levels['j3']];
    expect(assigned).toContain(0);
    expect(assigned).toContain(1);
    expect(assigned).toContain(2);
    // Distinct levels for identical x coordinates
    expect(new Set(assigned).size).toBe(3);
  });

  it('assigns distinct levels to closely-spaced items within proximity threshold', () => {
    const items = [
      { id: 'd5', x: 140 },
      { id: 'd6', x: 155 } // delta is 15 < threshold 36
    ];
    const levels = compute1DLabelLevels(items, 36);
    expect(levels['d5']).not.toBe(levels['d6']);
    expect(new Set([levels['d5'], levels['d6']]).size).toBe(2);
  });

  it('reuses lower levels when items move beyond the threshold', () => {
    const items = [
      { id: 'a', x: 10 },
      { id: 'b', x: 20 }, // conflicts with a -> lvl 1
      { id: 'c', x: 80 }  // far away from both -> lvl 0
    ];
    const levels = compute1DLabelLevels(items, 30);
    expect(levels['a']).toBe(0);
    expect(levels['b']).toBe(1);
    expect(levels['c']).toBe(0);
  });
});
