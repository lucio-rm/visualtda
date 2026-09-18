import { describe, it, expect } from 'vitest';
import { nQueensValidator } from '../src/engine/algorithms/nQueensValidator';

describe('NQueensValidator', () => {
  it('validates a correct 4x4 solution [1, 3, 0, 2]', () => {
    const result = nQueensValidator.validate({ n: 4 }, [1, 3, 0, 2]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates the second correct 4x4 solution [2, 0, 3, 1]', () => {
    const result = nQueensValidator.validate({ n: 4 }, [2, 0, 3, 1]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates the classic 8x8 solution [0, 4, 7, 5, 2, 6, 1, 3]', () => {
    const result = nQueensValidator.validate({ n: 8 }, [0, 4, 7, 5, 2, 6, 1, 3]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects boards with column collisions', () => {
    // Both row 0 and row 2 on column 1
    const result = nQueensValidator.validate({ n: 4 }, [1, 3, 1, 2]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('columna'))).toBe(true);
  });

  it('rejects boards with main diagonal collisions', () => {
    // Row 0 at col 0, Row 1 at col 1
    const result = nQueensValidator.validate({ n: 4 }, [0, 1, 3, 2]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('diagonal principal'))).toBe(true);
  });

  it('rejects boards with secondary diagonal collisions', () => {
    // Row 0 at col 2, Row 1 at col 1 (0+2 == 1+1 == 2)
    const result = nQueensValidator.validate({ n: 4 }, [2, 1, 0, 3]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('diagonal secundaria'))).toBe(true);
  });

  it('rejects board with incorrect queen count', () => {
    const result = nQueensValidator.validate({ n: 4 }, [1, 3, 0]);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('exactamente 4 reinas');
  });

  it('rejects out-of-bounds positions', () => {
    const result = nQueensValidator.validate({ n: 4 }, [1, 5, 0, 2]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('fuera de rango'))).toBe(true);
  });
});
