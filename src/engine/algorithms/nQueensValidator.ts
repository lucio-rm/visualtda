import { ValidationResult, Validator } from '../../types/validation';

export type NQueensConflictKind = 'column' | 'diag_main' | 'diag_sec';

export interface NQueensConflict {
  row1: number;
  col1: number;
  row2: number;
  col2: number;
  type: NQueensConflictKind;
  message: string;
}

export interface NQueensPartialValidationResult extends ValidationResult {
  conflict?: NQueensConflict;
  conflicts: NQueensConflict[];
}

export function areQueensAttacking(r1: number, c1: number, r2: number, c2: number): boolean {
  if (r1 === r2 && c1 === c2) return false;
  if (r1 === r2) return true;
  if (c1 === c2) return true;
  return Math.abs(r1 - r2) === Math.abs(c1 - c2);
}

export function getQueenConflictType(
  r1: number,
  c1: number,
  r2: number,
  c2: number
): NQueensConflictKind | 'row' | null {
  if (r1 === r2 && c1 === c2) return null;
  if (r1 === r2) return 'row';
  if (c1 === c2) return 'column';
  if (r1 - c1 === r2 - c2) return 'diag_main';
  if (r1 + c1 === r2 + c2) return 'diag_sec';
  return null;
}

export class NQueensValidator implements Validator<{ n: number }, number[]> {
  validate(input: { n: number }, board: number[]): ValidationResult {
    const { n } = input;
    const errors: string[] = [];

    if (!Array.isArray(board)) {
      return { valid: false, errors: ['El tablero debe ser un arreglo de enteros.'] };
    }

    if (board.length !== n) {
      errors.push(`El tablero debe contener exactamente ${n} reinas, pero contiene ${board.length}.`);
      return { valid: false, errors };
    }

    const seenCols = new Map<number, number>(); // col -> row
    const seenDiagPrin = new Map<number, number>(); // (r - c) -> row
    const seenDiagSec = new Map<number, number>(); // (r + c) -> row

    for (let r = 0; r < n; r++) {
      const c = board[r];

      // Check bounds
      if (!Number.isInteger(c) || c < 0 || c >= n) {
        errors.push(`Posición inválida en la fila ${r}: columna ${c} fuera de rango [0, ${n - 1}].`);
        continue;
      }

      // Check column collision
      if (seenCols.has(c)) {
        const prevRow = seenCols.get(c)!;
        errors.push(`Conflicto de columna: las reinas en fila ${prevRow} y fila ${r} comparten la columna ${c}.`);
      } else {
        seenCols.set(c, r);
      }

      // Check main diagonal collision (r - c)
      const diagPrin = r - c;
      if (seenDiagPrin.has(diagPrin)) {
        const prevRow = seenDiagPrin.get(diagPrin)!;
        errors.push(`Conflicto diagonal principal: reina en (${prevRow}, ${board[prevRow]}) y reina en (${r}, ${c}).`);
      } else {
        seenDiagPrin.set(diagPrin, r);
      }

      // Check secondary diagonal collision (r + c)
      const diagSec = r + c;
      if (seenDiagSec.has(diagSec)) {
        const prevRow = seenDiagSec.get(diagSec)!;
        errors.push(`Conflicto diagonal secundaria: reina en (${prevRow}, ${board[prevRow]}) y reina en (${r}, ${c}).`);
      } else {
        seenDiagSec.set(diagSec, r);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates a partial manual board state where unplaced rows are denoted by -1.
   * Only checks pairwise collisions between actually placed queens.
   */
  validatePartial(input: { n: number }, board: number[]): NQueensPartialValidationResult {
    const { n } = input;
    const errors: string[] = [];
    const conflicts: NQueensConflict[] = [];

    if (!Array.isArray(board)) {
      return {
        valid: false,
        errors: ['El tablero debe ser un arreglo de enteros.'],
        conflicts: []
      };
    }

    const placed: Array<{ row: number; col: number }> = [];
    for (let r = 0; r < board.length && r < n; r++) {
      const c = board[r];
      if (c === -1 || c === null || c === undefined) {
        continue;
      }
      if (!Number.isInteger(c) || c < 0 || c >= n) {
        errors.push(`Posición inválida en la fila ${r}: columna ${c} fuera de rango [0, ${n - 1}].`);
        continue;
      }
      placed.push({ row: r, col: c });
    }

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const q1 = placed[i];
        const q2 = placed[j];

        if (q1.col === q2.col) {
          const message = `Conflicto de columna: las reinas en fila ${q1.row} y fila ${q2.row} comparten la columna ${q1.col}.`;
          errors.push(message);
          conflicts.push({
            row1: q1.row,
            col1: q1.col,
            row2: q2.row,
            col2: q2.col,
            type: 'column',
            message
          });
        } else if (q1.row - q1.col === q2.row - q2.col) {
          const message = `Conflicto diagonal principal: reina en (${q1.row}, ${q1.col}) y reina en (${q2.row}, ${q2.col}).`;
          errors.push(message);
          conflicts.push({
            row1: q1.row,
            col1: q1.col,
            row2: q2.row,
            col2: q2.col,
            type: 'diag_main',
            message
          });
        } else if (q1.row + q1.col === q2.row + q2.col) {
          const message = `Conflicto diagonal secundaria: reina en (${q1.row}, ${q1.col}) y reina en (${q2.row}, ${q2.col}).`;
          errors.push(message);
          conflicts.push({
            row1: q1.row,
            col1: q1.col,
            row2: q2.row,
            col2: q2.col,
            type: 'diag_sec',
            message
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      conflict: conflicts[0],
      conflicts
    };
  }
}

export function solveNQueens(n: number): number[][] {
  const solutions: number[][] = [];
  const board: number[] = new Array(n).fill(-1);
  const cols = new Set<number>();
  const diagPrin = new Set<number>();
  const diagSec = new Set<number>();

  function backtrack(row: number) {
    if (row === n) {
      solutions.push([...board]);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diagPrin.has(row - col) || diagSec.has(row + col)) {
        continue;
      }
      board[row] = col;
      cols.add(col);
      diagPrin.add(row - col);
      diagSec.add(row + col);

      backtrack(row + 1);

      board[row] = -1;
      cols.delete(col);
      diagPrin.delete(row - col);
      diagSec.delete(row + col);
    }
  }

  backtrack(0);
  return solutions;
}

export const nQueensValidator = new NQueensValidator();
