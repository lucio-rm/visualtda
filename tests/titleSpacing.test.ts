import { describe, it, expect } from 'vitest';
import { formatTitleSpacing } from '../src/utils/textFormatting';

describe('formatTitleSpacing helper', () => {
  it('normalizes irregular spacing around em-dashes and en-dashes', () => {
    expect(formatTitleSpacing('Kleinberg & Tardos—Capítulo 5')).toBe('Kleinberg & Tardos — Capítulo 5');
    expect(formatTitleSpacing('Kleinberg & Tardos  —  Capítulo 5')).toBe('Kleinberg & Tardos — Capítulo 5');
    expect(formatTitleSpacing('Codificación de Huffman—Teoría y Fundamentos')).toBe('Codificación de Huffman — Teoría y Fundamentos');
    expect(formatTitleSpacing('Algoritmos–Avanzados')).toBe('Algoritmos – Avanzados');
  });

  it('normalizes colons without extra spacing before and single space after', () => {
    expect(formatTitleSpacing('Programación Lineal : Región Factible')).toBe('Programación Lineal: Región Factible');
    expect(formatTitleSpacing('Reducción:Conjunto Independiente')).toBe('Reducción: Conjunto Independiente');
    expect(formatTitleSpacing('Mochila 0/1 : Fundamento')).toBe('Mochila 0/1: Fundamento');
  });

  it('preserves hyphens in compound words and notations', () => {
    expect(formatTitleSpacing('N-Reinas')).toBe('N-Reinas');
    expect(formatTitleSpacing('N-Queens')).toBe('N-Queens');
    expect(formatTitleSpacing('k-Coloring')).toBe('k-Coloring');
    expect(formatTitleSpacing('2-Aproximación')).toBe('2-Aproximación');
    expect(formatTitleSpacing('Min-Heap')).toBe('Min-Heap');
    expect(formatTitleSpacing('Branch-and-Bound')).toBe('Branch-and-Bound');
  });

  it('normalizes middle dots with single spaces', () => {
    expect(formatTitleSpacing('KISS·Separación Algoritmo/UI·FIUBA')).toBe('KISS · Separación Algoritmo/UI · FIUBA');
    expect(formatTitleSpacing('KISS  ·   Separación')).toBe('KISS · Separación');
  });

  it('preserves mathematical asymptotic notations while formatting parentheses on words', () => {
    expect(formatTitleSpacing('Contar Inversiones en O(n log n)')).toBe('Contar Inversiones en O(n log n)');
    expect(formatTitleSpacing('Peak Finding (O(log n))')).toBe('Peak Finding (O(log n))');
    expect(formatTitleSpacing('Sudoku Solver(CSP)')).toBe('Sudoku Solver (CSP)');
    expect(formatTitleSpacing('Juan el Vago ( PD 1D )')).toBe('Juan el Vago (PD 1D)');
  });

  it('collapses multiple whitespace characters and trims', () => {
    expect(formatTitleSpacing('   Mochila   0/1   (Programación   Dinámica)   ')).toBe('Mochila 0/1 (Programación Dinámica)');
  });
});
