import { describe, it, expect } from 'vitest';
import { generateReductionTrace, DEFAULT_REDUCTION_GRAPH } from '../src/engine/algorithms/reductionIsVcTrace';

describe('ReductionIsVcTrace Engine', () => {
  it('generates a complete reproducible timeline', () => {
    const timeline = generateReductionTrace();
    expect(timeline.totalSteps).toBeGreaterThanOrEqual(10);
    expect(timeline.events).toHaveLength(timeline.totalSteps);

    const firstEvent = timeline.events[0];
    expect(firstEvent.type).toBe('init');
    expect(firstEvent.data.k).toBe(2);
    expect(firstEvent.data.kPrime).toBe(3);

    const lastEvent = timeline.events[timeline.totalSteps - 1];
    expect(lastEvent.type).toBe('completed');
    expect(lastEvent.data.independentSet).toEqual(['A', 'D']);
    expect(lastEvent.data.vertexCover).toEqual(['B', 'C', 'E']);
    expect(lastEvent.data.coveredEdges).toHaveLength(DEFAULT_REDUCTION_GRAPH.edges.length);
  });

  it('contains candidate conflict step when attempting to add adjacent vertex B', () => {
    const timeline = generateReductionTrace();
    const conflictStep = timeline.events.find((e) => e.type === 'candidate_conflict');
    expect(conflictStep).toBeDefined();
    expect(conflictStep?.data.activeNode).toBe('B');
    expect(conflictStep?.data.conflictEdge).toEqual(['A', 'B']);
  });

  it('contains polynomial reduction transform step computing complement V \\ S', () => {
    const timeline = generateReductionTrace();
    const transformStep = timeline.events.find((e) => e.type === 'reduction_transform');
    expect(transformStep).toBeDefined();
    expect(transformStep?.data.phase).toBe('complement_calculation');
    expect(transformStep?.data.vertexCover).toEqual(['B', 'C', 'E']);
  });
});
