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

export const nQueensValidator = new NQueensValidator();
