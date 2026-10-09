import { describe, it, expect } from 'vitest';
import { formatMathFormula, toSuperscript, toSubscript } from '../src/utils/mathTypography';

describe('MathTypography Engine', () => {
  it('converts superscripts correctly', () => {
    expect(toSuperscript('2')).toBe('²');
    expect(toSuperscript('j')).toBe('ʲ');
    expect(toSuperscript('n+1')).toBe('ⁿ⁺¹');
  });

  it('converts subscripts correctly', () => {
    expect(toSubscript('1')).toBe('₁');
    expect(toSubscript('i')).toBe('ᵢ');
    expect(toSubscript('j')).toBe('ⱼ');
  });

  it('normalizes 2^j into 2ʲ and c_1 into c₁', () => {
    expect(formatMathFormula('2^j')).toBe('2ʲ');
    expect(formatMathFormula('c_1')).toBe('c₁');
    expect(formatMathFormula('d_j')).toBe('dⱼ');
    expect(formatMathFormula('O(n^2)')).toBe('O(n²)');
    expect(formatMathFormula('2^{j+1}')).toBe('2ʲ⁺¹');
  });

  it('normalizes LaTeX symbols and summations', () => {
    expect(formatMathFormula('\\sum_{i=1}^{n} c_i')).toBe('∑(i=1..n) cᵢ');
    expect(formatMathFormula('a \\le b \\implies x \\in S')).toBe('a ≤ b ⟹ x ∈ S');
    expect(formatMathFormula('\\frac{n}{2}')).toBe('(n / 2)');
  });

  it('safely handles empty strings and plain text without distortion', () => {
    expect(formatMathFormula('')).toBe('');
    expect(formatMathFormula('Algoritmo Greedy')).toBe('Algoritmo Greedy');
  });
});
