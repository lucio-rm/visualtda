import { describe, it, expect } from 'vitest';
import {
  solveLcs,
  isSubsequence,
  lcsValidator,
  computeLcsTable
} from '../src/engine/algorithms/lcsValidator';
import { generateLcsTrace } from '../src/engine/algorithms/lcsTrace';

describe('LCS Dynamic Programming Solver', () => {
  it('solves classic CLRS case "ABCBDAB" and "BDCABA" with length 4', () => {
    const lcs = solveLcs('ABCBDAB', 'BDCABA');
    expect(lcs.length).toBe(4);
    expect(isSubsequence(lcs, 'ABCBDAB')).toBe(true);
    expect(isSubsequence(lcs, 'BDCABA')).toBe(true);
  });

  it('handles identical strings returning full string', () => {
    expect(solveLcs('ALGORITMO', 'ALGORITMO')).toBe('ALGORITMO');
  });

  it('handles completely disjoint strings returning empty string', () => {
    expect(solveLcs('HOLA', 'TREN')).toBe('');
  });

  it('handles empty string edge cases', () => {
    expect(solveLcs('', 'CASA')).toBe('');
    expect(solveLcs('CASA', '')).toBe('');
    expect(solveLcs('', '')).toBe('');
  });

  it('handles sub-word embedded in longer word', () => {
    expect(solveLcs('RAZON', 'CORAZON')).toBe('RAZON');
  });

  it('computes DP table with correct dimensions and optimal length', () => {
    const table = computeLcsTable('ABC', 'AC');
    expect(table.length).toBe(4);
    expect(table[0].length).toBe(3);
    expect(table[3][2]).toBe(2);
  });
});

describe('Subsequence Utility', () => {
  it('identifies valid subsequences', () => {
    expect(isSubsequence('ACE', 'ABCDE')).toBe(true);
    expect(isSubsequence('', 'ABCDE')).toBe(true);
    expect(isSubsequence('BDAB', 'ABCBDAB')).toBe(true);
  });

  it('rejects invalid or out-of-order sequences', () => {
    expect(isSubsequence('AEC', 'ABCDE')).toBe(false);
    expect(isSubsequence('XYZ', 'ABCDE')).toBe(false);
    expect(isSubsequence('ABCDEF', 'ABCDE')).toBe(false);
  });
});

describe('LCS Validator', () => {
  it('validates an optimal LCS result', () => {
    const validation = lcsValidator.validate({ s1: 'ABCBDAB', s2: 'BDCABA' }, 'BCBA');
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects a common subsequence that is suboptimal in length', () => {
    const validation = lcsValidator.validate({ s1: 'ABCBDAB', s2: 'BDCABA' }, 'BCA'); // length 3 vs optimal 4
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('subóptima');
  });

  it('rejects strings that are not subsequences of s1', () => {
    const validation = lcsValidator.validate({ s1: 'ABC', s2: 'ABC' }, 'CBA');
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('no es una subsecuencia'))).toBe(true);
  });

  it('handles empty strings requiring empty result', () => {
    const valid = lcsValidator.validate({ s1: '', s2: 'TEST' }, '');
    expect(valid.valid).toBe(true);

    const invalid = lcsValidator.validate({ s1: '', s2: 'TEST' }, 'T');
    expect(invalid.valid).toBe(false);
  });
});

describe('LCS Trace Generator', () => {
  it('generates full 2D trace with match, mismatch, and reconstruction events', () => {
    const timeline = generateLcsTrace('ABC', 'AC');
    expect(timeline.totalSteps).toBeGreaterThan(5);

    const types = timeline.events.map((e) => e.type);
    expect(types).toContain('INIT');
    expect(types).toContain('MATCH_DIAGONAL');
    expect(types).toContain('START_RECONSTRUCTION');
    expect(types).toContain('RECONSTRUCT_MATCH');
    expect(types).toContain('COMPLETE');

    const completeEvent = timeline.events[timeline.events.length - 1];
    expect(completeEvent.data.reconstructed).toBe('AC');
  });
});
