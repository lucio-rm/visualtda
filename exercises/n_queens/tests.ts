import { nQueensValidator } from '../../src/engine/algorithms/nQueensValidator';
import { ValidationResult } from '../../src/types/validation';

export interface NQueensTestCase {
  n: number;
  description: string;
}

export const N_QUEENS_TEST_CASES: NQueensTestCase[] = [
  { n: 1, description: 'Caso trivial 1x1' },
  { n: 4, description: 'Tablero estándar 4x4 (2 soluciones)' },
  { n: 5, description: 'Tablero 5x5 (10 soluciones)' },
  { n: 6, description: 'Tablero 6x6 (4 soluciones)' },
  { n: 8, description: 'Problema clásico 8x8 (92 soluciones)' }
];

export function testNQueensSolution(n: number, candidate: number[]): ValidationResult {
  return nQueensValidator.validate({ n }, candidate);
}
