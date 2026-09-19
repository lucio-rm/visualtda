import { ValidationResult, Validator } from '../../types/validation';

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
