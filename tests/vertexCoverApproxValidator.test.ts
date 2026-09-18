import { describe, it, expect } from 'vitest';
import { vertexCoverApproxValidator } from '../src/engine/algorithms/vertexCoverApproxValidator';
import { DEFAULT_APPROX_GRAPH } from '../src/engine/algorithms/vertexCoverApproxTrace';

describe('VertexCoverApproxValidator', () => {
  const { vertices, edges } = DEFAULT_APPROX_GRAPH;

  it('validates a correct 2-approximation cover and matching', () => {
    const res = vertexCoverApproxValidator.validate(
      { vertices, edges, optimalMinCoverSize: 3 },
      {
        cover: ['A', 'B', 'C', 'D', 'E', 'F'],
        matching: [
          ['A', 'B'],
          ['C', 'D'],
          ['E', 'F']
        ]
      }
    );
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('rejects when an edge is left uncovered', () => {
    const res = vertexCoverApproxValidator.validate(
      { vertices, edges },
      {
        cover: ['A', 'B'], // Leaves (C, D), (E, F), etc. uncovered
        matching: [['A', 'B']]
      }
    );
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('Arista descubierta'))).toBe(true);
  });

  it('rejects when matching edges share a vertex', () => {
    const res = vertexCoverApproxValidator.validate(
      { vertices, edges },
      {
        cover: ['A', 'B', 'C', 'D'],
        matching: [
          ['A', 'B'],
          ['B', 'D'] // B is shared! Not a matching!
        ]
      }
    );
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('Violación de matching'))).toBe(true);
  });

  it('detects violation if cover size exceeds 2 * optimalMinCoverSize', () => {
    const res = vertexCoverApproxValidator.validate(
      { vertices, edges, optimalMinCoverSize: 2 },
      {
        cover: ['A', 'B', 'C', 'D', 'E', 'F'], // Size 6 > 2 * 2 = 4
        matching: [
          ['A', 'B'],
          ['C', 'D'],
          ['E', 'F']
        ]
      }
    );
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('Violación del ratio de 2-aproximación'))).toBe(true);
  });
});
