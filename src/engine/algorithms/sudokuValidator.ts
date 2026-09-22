export interface SudokuValidationResult {
  valid: boolean;
  errors: string[];
}

export function isValidSudokuCell(board: number[][], r: number, c: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[r][i] === num || board[i][c] === num) return false;
  }
  const br = 3 * Math.floor(r / 3);
  const bc = 3 * Math.floor(c / 3);
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }
  return true;
}

export function solveSudoku(board: number[][]): boolean {
  function findMRV(): [number, number] | null {
    let minChoices = 10;
    let best: [number, number] | null = null;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          let count = 0;
          for (let num = 1; num <= 9; num++) {
            if (isValidSudokuCell(board, r, c, num)) count++;
          }
          if (count < minChoices) {
            minChoices = count;
            best = [r, c];
          }
        }
      }
    }
    return best;
  }

  const empty = findMRV();
  if (!empty) return true;
  const [r, c] = empty;

  for (let num = 1; num <= 9; num++) {
    if (isValidSudokuCell(board, r, c, num)) {
      board[r][c] = num;
      if (solveSudoku(board)) return true;
      board[r][c] = 0;
    }
  }
  return false;
}

export const sudokuValidator = {
  validate(original: number[][], candidate: number[][]): SudokuValidationResult {
    const errors: string[] = [];

    if (!Array.isArray(candidate) || candidate.length !== 9) {
      return { valid: false, errors: ['El tablero debe tener exactamente 9 filas.'] };
    }

    for (let r = 0; r < 9; r++) {
      if (!Array.isArray(candidate[r]) || candidate[r].length !== 9) {
        return { valid: false, errors: [`La fila ${r} debe tener 9 columnas.`] };
      }
      for (let c = 0; c < 9; c++) {
        const val = candidate[r][c];
        if (val < 1 || val > 9 || !Number.isInteger(val)) {
          errors.push(`Celda (${r}, ${c}) contiene valor inválido: ${val}.`);
        }
        if (original[r][c] !== 0 && original[r][c] !== val) {
          errors.push(`Celda fija inicial (${r}, ${c}) fue modificada de ${original[r][c]} a ${val}.`);
        }
      }
    }

    // Check rows and columns
    for (let i = 0; i < 9; i++) {
      const rowSeen = new Set<number>();
      const colSeen = new Set<number>();
      for (let j = 0; j < 9; j++) {
        const rVal = candidate[i][j];
        if (rowSeen.has(rVal)) {
          errors.push(`Fila ${i} contiene dígito duplicado: ${rVal}.`);
        }
        rowSeen.add(rVal);

        const cVal = candidate[j][i];
        if (colSeen.has(cVal)) {
          errors.push(`Columna ${i} contiene dígito duplicado: ${cVal}.`);
        }
        colSeen.add(cVal);
      }
    }

    // Check 3x3 blocks
    for (let br = 0; br < 9; br += 3) {
      for (let bc = 0; bc < 9; bc += 3) {
        const blockSeen = new Set<number>();
        for (let r = br; r < br + 3; r++) {
          for (let c = bc; c < bc + 3; c++) {
            const val = candidate[r][c];
            if (blockSeen.has(val)) {
              errors.push(`Bloque 3x3 en (${br}, ${bc}) contiene dígito repetido: ${val}.`);
            }
            blockSeen.add(val);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
