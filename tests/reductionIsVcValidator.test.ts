import { describe, it, expect } from 'vitest';
import { reductionIsVcValidator } from '../src/engine/algorithms/reductionIsVcValidator';
import { DEFAULT_REDUCTION_GRAPH } from '../src/engine/algorithms/reductionIsVcTrace';

describe('ReductionIsVcValidator', () => {
  const { vertices, edges, k } = DEFAULT_REDUCTION_GRAPH;

  it('validates a correct independent set S = {A, D}', () => {
    const isRes = reductionIsVcValidator.validateIndependentSet({ vertices, edges }, ['A', 'D']);
    expect(isRes.valid).toBe(true);
    expect(isRes.errors).toHaveLength(0);
  });

  it('rejects an independent set with edge conflicts S = {A, B}', () => {
    const isRes = reductionIsVcValidator.validateIndependentSet({ vertices, edges }, ['A', 'B']);
    expect(isRes.valid).toBe(false);
    expect(isRes.errors[0]).toContain('Violación de independencia');
  });

  it('validates a correct vertex cover C = {B, C, E}', () => {
    const vcRes = reductionIsVcValidator.validateVertexCover({ vertices, edges }, ['B', 'C', 'E']);
    expect(vcRes.valid).toBe(true);
    expect(vcRes.errors).toHaveLength(0);
  });

  it('rejects an incomplete vertex cover missing edge (A, C)', () => {
    const vcRes = reductionIsVcValidator.validateVertexCover({ vertices, edges }, ['B', 'D']);
    expect(vcRes.valid).toBe(false);
    expect(vcRes.errors.some((e) => e.includes('Arista descubierta'))).toBe(true);
  });

  it('validates a complete reduction instance and duality theorem', () => {
    const fullRes = reductionIsVcValidator.validate(
      { vertices, edges, k },
      {
        independentSet: ['A', 'D'],
        vertexCover: ['B', 'C', 'E'],
        reductionKPrime: 3
      }
    );
    expect(fullRes.valid).toBe(true);
    expect(fullRes.errors).toHaveLength(0);
  });

  it('detects mismatch in reduction parameter kPrime != |V| - k', () => {
    const fullRes = reductionIsVcValidator.validate(
      { vertices, edges, k },
      {
        independentSet: ['A', 'D'],
        vertexCover: ['B', 'C', 'E'],
        reductionKPrime: 4 // Wrong k'
      }
    );
    expect(fullRes.valid).toBe(false);
    expect(fullRes.errors[0]).toContain("Parámetro de reducción k' incorrecto");
  });
});
