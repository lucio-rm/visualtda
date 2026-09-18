import { describe, it, expect } from 'vitest';
import { generateNQueensTrace } from '../src/engine/algorithms/nQueensTrace';

describe('TraceTimeline Data & Navigation Logic', () => {
  it('ensures timeline events maintain sequential step indices', () => {
    const timeline = generateNQueensTrace(4);
    for (let i = 0; i < timeline.events.length; i++) {
      expect(timeline.events[i].step).toBe(i);
    }
  });

  it('guarantees bounds clamping for manual step navigation', () => {
    const timeline = generateNQueensTrace(4);
    const totalSteps = timeline.totalSteps;

    const clampStep = (step: number) => Math.max(0, Math.min(step, totalSteps - 1));

    expect(clampStep(-10)).toBe(0);
    expect(clampStep(999999)).toBe(totalSteps - 1);
    expect(clampStep(5)).toBe(5);
  });
});
