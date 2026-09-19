import { describe, it, expect } from 'vitest';
import {
  generateGraphColoringTrace,
  DEFAULT_COLORING_GRAPH
} from '../src/engine/algorithms/graphColoringTrace';
import {
  solveGraphColoring,
  graphColoringValidator
} from '../src/engine/algorithms/graphColoringValidator';
import { bruteForceGraphColoring } from './oracles/referenceSolvers';

describe('Graph Coloring Backtracking Algorithm & Trace Engine', () => {
  it('generates a deterministic trace that reaches SUCCESS on the default 3-colorable graph', () => {
    const trace = generateGraphColoringTrace(DEFAULT_COLORING_GRAPH);
    expect(trace.totalSteps).toBeGreaterThan(5);

    const first = trace.events[0];
    expect(first.type).toBe('INIT');
    expect(first.data.currentVertex).toBeNull();

    const last = trace.events[trace.events.length - 1];
    expect(last.type).toBe('SUCCESS');
    expect(Object.keys(last.data.coloring).length).toBe(DEFAULT_COLORING_GRAPH.vertices.length);

    // Verify final coloring is mathematically valid
    const validation = graphColoringValidator.validate(DEFAULT_COLORING_GRAPH, last.data.coloring);
    expect(validation.valid).toBe(true);
  });

  it('generates a trace ending in FAILURE when graph is not k-colorable', () => {
    // Triangle K3 cannot be 2-colored
    const triangleK2 = {
      vertices: ['A', 'B', 'C'],
      edges: [['A', 'B'], ['B', 'C'], ['C', 'A']] as [string, string][],
      k: 2
    };

    const trace = generateGraphColoringTrace(triangleK2);
    const last = trace.events[trace.events.length - 1];
    expect(last.type).toBe('FAILURE');

    const sol = solveGraphColoring(triangleK2);
    expect(sol).toBeNull();
  });

  it('validates correct coloring and detects invalid coloring or conflicts', () => {
    const graph = {
      vertices: ['1', '2', '3'],
      edges: [['1', '2'], ['2', '3']] as [string, string][],
      k: 2
    };

    // Valid bipartite 2-coloring
    const valid = graphColoringValidator.validate(graph, { '1': 1, '2': 2, '3': 1 });
    expect(valid.valid).toBe(true);

    // Conflict: 1 and 2 share color 1
    const conflict = graphColoringValidator.validate(graph, { '1': 1, '2': 1, '3': 2 });
    expect(conflict.valid).toBe(false);
    expect(conflict.conflictEdge).toEqual(['1', '2']);

    // Invalid color out of bounds
    const outOfBounds = graphColoringValidator.validate(graph, { '1': 1, '2': 3, '3': 1 });
    expect(outOfBounds.valid).toBe(false);
  });

  it('agrees with independent brute-force oracle across multiple graph instances', () => {
    const testCases = [
      // 4-cycle C4 with k=2 (bipartite: solvable)
      {
        vertices: ['A', 'B', 'C', 'D'],
        edges: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A']] as [string, string][],
        k: 2
      },
      // K4 complete graph with k=3 (requires 4 colors: unsolvable)
      {
        vertices: ['1', '2', '3', '4'],
        edges: [
          ['1', '2'], ['1', '3'], ['1', '4'],
          ['2', '3'], ['2', '4'],
          ['3', '4']
        ] as [string, string][],
        k: 3
      },
      // K4 with k=4 (solvable)
      {
        vertices: ['1', '2', '3', '4'],
        edges: [
          ['1', '2'], ['1', '3'], ['1', '4'],
          ['2', '3'], ['2', '4'],
          ['3', '4']
        ] as [string, string][],
        k: 4
      }
    ];

    for (const tc of testCases) {
      const solverSol = solveGraphColoring(tc);
      const oracleSol = bruteForceGraphColoring(tc.vertices, tc.edges, tc.k);

      if (oracleSol === null) {
        expect(solverSol).toBeNull();
      } else {
        expect(solverSol).not.toBeNull();
        const check = graphColoringValidator.validate(tc, solverSol);
        expect(check.valid).toBe(true);
      }
    }
  });
});
