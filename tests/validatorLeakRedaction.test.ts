import { describe, it, expect } from 'vitest';
import { coinChangeValidator } from '../src/engine/algorithms/coinChangeValidator';
import { linearProgrammingValidator } from '../src/engine/algorithms/linearProgrammingValidator';

describe('Validator Answer Leak Redaction', () => {
  it('does not leak optimal coin witness array in coinChangeValidator error messages', () => {
    // Coins [1, 3, 4], target 6. Optimal is [3, 3] (length 2).
    // Suboptimal candidate [4, 1, 1] has length 3.
    const result = coinChangeValidator.validate({ coins: [1, 3, 4], target: 6 }, [4, 1, 1]);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    const errorMsg = result.errors[0];

    // Must report optimal count 2
    expect(errorMsg).toContain('2 moneda(s)');
    // Must NOT leak witness array [3, 3]
    expect(errorMsg).not.toContain('[3, 3]');
    expect(errorMsg).not.toContain('[3,3]');
  });

  it('does not leak optimal coordinate point in linearProgrammingValidator error messages', () => {
    // Objective: 3x + 2y
    // Constraints: 2x + y <= 18, 2x + 3y <= 42, 3x + y <= 24
    // Optimal point is (3, 12) with value 33.
    // [0, 0] is suboptimal with value 0.
    const result = linearProgrammingValidator.validate(
      {
        objective: [3, 2],
        constraints: [
          { a: 2, b: 1, c: 18 },
          { a: 2, b: 3, c: 42 },
          { a: 3, b: 1, c: 24 }
        ]
      },
      [0, 0]
    );

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    const errorMsg = result.errors[0];

    // Reports optimal value 33
    expect(errorMsg).toContain('valor óptimo es 33');
    // Must NOT leak the optimal point coordinates (3, 12)
    expect(errorMsg).not.toContain('(3, 12)');
    expect(errorMsg).not.toContain('(3,12)');
  });
});
