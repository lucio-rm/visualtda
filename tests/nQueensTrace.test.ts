import { describe, it, expect } from 'vitest';
import { generateNQueensTrace } from '../src/engine/algorithms/nQueensTrace';
import { nQueensValidator } from '../src/engine/algorithms/nQueensValidator';

describe('generateNQueensTrace', () => {
  it('generates a deterministic timeline for N=4', () => {
    const timeline1 = generateNQueensTrace(4);
    const timeline2 = generateNQueensTrace(4);

    expect(timeline1.totalSteps).toBe(timeline2.totalSteps);
    expect(timeline1.events.length).toBeGreaterThan(10);
    expect(timeline1.events[0].type).toBe('init');
    expect(timeline1.events[timeline1.events.length - 1].type).toBe('complete');
  });

  it('finds exactly 2 solutions for N=4', () => {
    const timeline = generateNQueensTrace(4);
    const solutionEvents = timeline.events.filter((e) => e.type === 'solution');

    expect(solutionEvents).toHaveLength(2);

    // Validate that each solution emitted satisfies the NQueensValidator
    for (const solEvent of solutionEvents) {
      const valResult = nQueensValidator.validate({ n: 4 }, solEvent.data.board);
      expect(valResult.valid).toBe(true);
      expect(valResult.errors).toHaveLength(0);
    }
  });

  it('verifies conflict events correctly flag pruned branches', () => {
    const timeline = generateNQueensTrace(4);
    const conflictEvents = timeline.events.filter((e) => e.type === 'conflict');

    expect(conflictEvents.length).toBeGreaterThan(0);
    for (const conf of conflictEvents) {
      expect(conf.data.conflictWith).toBeDefined();
      expect(['column', 'diag_main', 'diag_sec']).toContain(conf.data.conflictWith?.type);
    }
  });

  it('verifies backtrack events restore previous board states', () => {
    const timeline = generateNQueensTrace(4);
    const backtrackEvents = timeline.events.filter((e) => e.type === 'backtrack');

    expect(backtrackEvents.length).toBeGreaterThan(0);
    for (const b of backtrackEvents) {
      expect(b.data.board[b.data.currentRow]).toBe(-1);
    }
  });

  it('supports findFirstOnly option to pause after first solution', () => {
    const fullTimeline = generateNQueensTrace(4, false);
    const firstOnlyTimeline = generateNQueensTrace(4, true);

    expect(firstOnlyTimeline.totalSteps).toBeLessThan(fullTimeline.totalSteps);
    const solutionEvents = firstOnlyTimeline.events.filter((e) => e.type === 'solution');
    expect(solutionEvents).toHaveLength(1);
  });
});
