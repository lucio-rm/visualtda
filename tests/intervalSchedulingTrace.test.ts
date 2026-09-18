import { describe, it, expect } from 'vitest';
import { generateIntervalSchedulingTrace } from '../src/engine/algorithms/intervalSchedulingTrace';
import { intervalSchedulingValidator } from '../src/engine/algorithms/intervalSchedulingValidator';

describe('generateIntervalSchedulingTrace', () => {
  it('generates a sequential timeline starting with init and sort', () => {
    const timeline = generateIntervalSchedulingTrace();
    expect(timeline.totalSteps).toBeGreaterThan(5);
    expect(timeline.events[0].type).toBe('init');
    expect(timeline.events[1].type).toBe('sort');
    expect(timeline.events[timeline.events.length - 1].type).toBe('complete');
  });

  it('verifies final selected intervals match validator optimality', () => {
    const raw = [
      [0, 3] as [number, number],
      [1, 5] as [number, number],
      [3, 6] as [number, number],
      [4, 8] as [number, number],
      [6, 9] as [number, number],
      [7, 10] as [number, number]
    ];
    const timeline = generateIntervalSchedulingTrace(raw);
    const completeEvent = timeline.events[timeline.events.length - 1];

    const selectedIds = completeEvent.data.selectedIds;
    const allIntervals = completeEvent.data.allIntervals;
    const selectedIntervals = allIntervals
      .filter((i) => selectedIds.includes(i.id))
      .map((i) => [i.start, i.end] as [number, number]);

    expect(selectedIntervals).toHaveLength(3);

    const validation = intervalSchedulingValidator.validate(
      { intervals: raw },
      selectedIntervals
    );
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });
});
