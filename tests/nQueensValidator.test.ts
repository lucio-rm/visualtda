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

describe('NQueens Partial Board Validation (Playground Defect 3.1 Fix)', () => {
  it('accepts knight-move L-shape partial placement without false conflict [1, 3, -1, -1]', () => {
    const board = [1, 3, -1, -1];
    const result = nQueensValidator.validatePartial({ n: 4 }, board);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.conflict).toBeUndefined();
  });

  it('accepts single queen on board', () => {
    const result = nQueensValidator.validatePartial({ n: 4 }, [2, -1, -1, -1]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts completely empty board', () => {
    const result = nQueensValidator.validatePartial({ n: 4 }, [-1, -1, -1, -1]);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('flags column collision on partial board [1, -1, 1, -1]', () => {
    const result = nQueensValidator.validatePartial({ n: 4 }, [1, -1, 1, -1]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('columna'))).toBe(true);
    expect(result.conflict?.type).toBe('column');
    expect(result.conflict?.row1).toBe(0);
    expect(result.conflict?.row2).toBe(2);
  });

  it('flags diagonal collision on partial board [0, 1, -1, -1]', () => {
    const result = nQueensValidator.validatePartial({ n: 4 }, [0, 1, -1, -1]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('diagonal principal'))).toBe(true);
    expect(result.conflict?.type).toBe('diag_main');
  });

  it('flags anti-diagonal collision on partial board [2, 1, -1, -1]', () => {
    const result = nQueensValidator.validatePartial({ n: 4 }, [2, 1, -1, -1]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('diagonal secundaria'))).toBe(true);
    expect(result.conflict?.type).toBe('diag_sec');
  });

  // Exhaustive Pairwise Regression across N=4..8
  // Checks all distinct pairs (r1, c1) and (r2, c2)
  for (const n of [4, 5, 6, 7, 8]) {
    it(`exhaustively verifies all cell pairs for N=${n} without crashing and matching attack formula`, () => {
      let pairsChecked = 0;
      for (let r1 = 0; r1 < n; r1++) {
        for (let c1 = 0; c1 < n; c1++) {
          for (let r2 = r1 + 1; r2 < n; r2++) {
            for (let c2 = 0; c2 < n; c2++) {
              pairsChecked++;
              const board = new Array(n).fill(-1);
              board[r1] = c1;
              board[r2] = c2;

              const expectedAttack = c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2);

              const partialRes = nQueensValidator.validatePartial({ n }, board);
              expect(partialRes.valid).toBe(!expectedAttack);

              if (expectedAttack) {
                expect(partialRes.errors.length).toBeGreaterThan(0);
                expect(partialRes.conflict).toBeDefined();
                expect(partialRes.conflict?.row1).toBe(r1);
                expect(partialRes.conflict?.row2).toBe(r2);
              } else {
                expect(partialRes.errors).toHaveLength(0);
                expect(partialRes.conflict).toBeUndefined();
              }
            }
          }
        }
      }
      expect(pairsChecked).toBeGreaterThan(0);
    });
  }
});
