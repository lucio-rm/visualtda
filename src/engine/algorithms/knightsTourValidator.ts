export interface KnightsTourValidationResult {
  valid: boolean;
  errors: string[];
}

export const KNIGHT_MOVES = [
  [2, 1], [1, 2], [-1, 2], [-2, 1],
  [-2, -1], [-1, -2], [1, -2], [2, -1]
];

export function solveKnightsTour(n: number): number[][] | null {
  if (n <= 0) return null;
  if (n === 1) return [[0]];
  if (n === 2 || n === 3 || n === 4) return null; // No open tour for n=2, 3, 4 from (0,0)

  const board: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));

  function isValid(r: number, c: number): boolean {
    return r >= 0 && r < n && c >= 0 && c < n && board[r][c] === -1;
  }

  function getDegree(r: number, c: number): number {
    let count = 0;
    for (const [dr, dc] of KNIGHT_MOVES) {
      if (isValid(r + dr, c + dc)) count++;
    }
    return count;
  }

  function backtrack(r: number, c: number, step: number): boolean {
    board[r][c] = step;
    if (step === n * n - 1) return true;

    const candidates: [number, number, number][] = [];
    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = r + dr;
      const nc = c + dc;
      if (isValid(nr, nc)) {
        candidates.push([getDegree(nr, nc), nr, nc]);
      }
    }
    // Warnsdorff's heuristic: sort by lowest degree first
    candidates.sort((a, b) => a[0] - b[0]);

    for (const [, nr, nc] of candidates) {
      if (backtrack(nr, nc, step + 1)) return true;
    }

    board[r][c] = -1;
    return false;
  }

  if (backtrack(0, 0, 0)) {
    return board;
  }
  return null;
}

export const knightsTourValidator = {
  validate(n: number, board: number[][] | null): KnightsTourValidationResult {
    const errors: string[] = [];

    const expected = solveKnightsTour(n);
    if (expected === null) {
      if (board === null || board === undefined) {
        return { valid: true, errors: [] };
      }
      return { valid: false, errors: [`Para N=${n} no existe recorrido del caballo, pero se retornó un tablero.`] };
    }

    if (board === null || board === undefined) {
      return { valid: false, errors: [`Existe un recorrido válido para N=${n}, pero se retornó None.`] };
    }

    if (!Array.isArray(board) || board.length !== n) {
      return { valid: false, errors: [`El tablero debe tener ${n} filas.`] };
    }

    const totalCells = n * n;
    const positions: [number, number][] = Array(totalCells);

    for (let r = 0; r < n; r++) {
      if (!Array.isArray(board[r]) || board[r].length !== n) {
        return { valid: false, errors: [`La fila ${r} debe tener ${n} columnas.`] };
      }
      for (let c = 0; c < n; c++) {
        const step = board[r][c];
        if (typeof step !== 'number' || step < 0 || step >= totalCells || !Number.isInteger(step)) {
          errors.push(`Paso inválido en (${r}, ${c}): ${step}. Debe estar entre 0 y ${totalCells - 1}.`);
        } else {
          if (positions[step] !== undefined) {
            errors.push(`El número de paso ${step} está duplicado en el tablero.`);
          }
          positions[step] = [r, c];
        }
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // Verify step 0 starts at (0, 0)
    if (positions[0][0] !== 0 || positions[0][1] !== 0) {
      errors.push(`El recorrido debe comenzar en la casilla (0, 0), pero comenzó en (${positions[0][0]}, ${positions[0][1]}).`);
    }

    // Verify knight moves between step t and step t+1
    for (let t = 0; t < totalCells - 1; t++) {
      const [r1, c1] = positions[t];
      const [r2, c2] = positions[t + 1];
      const dr = Math.abs(r1 - r2);
      const dc = Math.abs(c1 - c2);
      const isKnightMove = (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
      if (!isKnightMove) {
        errors.push(`Movimiento inválido entre el paso ${t} (${r1},${c1}) y el paso ${t + 1} (${r2},${c2}). No es un salto de caballo en 'L'.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
