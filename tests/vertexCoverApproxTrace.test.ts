import { describe, it, expect } from 'vitest';
import { generateVertexCoverApproxTrace, DEFAULT_APPROX_GRAPH } from '../src/engine/algorithms/vertexCoverApproxTrace';

describe('VertexCoverApproxTrace Engine', () => {
  it('generates a valid timeline executing maximal matching', () => {
    const timeline = generateVertexCoverApproxTrace();
    expect(timeline.totalSteps).toBe(DEFAULT_APPROX_GRAPH.edges.length + 2); // init + edges + finished

    const firstEvent = timeline.events[0];
    expect(firstEvent.type).toBe('init');
    expect(firstEvent.data.matching).toHaveLength(0);
    expect(firstEvent.data.cover).toHaveLength(0);

    const lastEvent = timeline.events[timeline.totalSteps - 1];
    expect(lastEvent.type).toBe('finished');
    expect(lastEvent.data.matching).toHaveLength(3);
    expect(lastEvent.data.cover).toHaveLength(6);
    expect(lastEvent.data.coveredEdges).toHaveLength(DEFAULT_APPROX_GRAPH.edges.length);
  });

  it('contains both match_edge and skip_edge events', () => {
    const timeline = generateVertexCoverApproxTrace();
    const matched = timeline.events.filter((e) => e.type === 'match_edge');
    const skipped = timeline.events.filter((e) => e.type === 'skip_edge');

    expect(matched.length).toBe(3);
    expect(skipped.length).toBe(4);
  });
});
