import { TraceTimeline, TraceEvent } from '../../types';
import { isValidSudokuCell } from './sudokuValidator';

export interface SudokuStepData {
  board: number[][];
  fixed: boolean[][];
  currentCell: [number, number] | null;
  action: 'INIT' | 'MRV_SELECT' | 'TRY_DIGIT' | 'PRUNE_CONFLICT' | 'PLACE_DIGIT' | 'BACKTRACK' | 'SOLVED';
  attemptedDigit: number | null;
  conflictingCells: Array<[number, number]>;
  domainSizes: number[][];
  exploredStates: number;
  backtrackCount: number;
  description: { es: string; en: string };
}

// 9x9 puzzle designed for educational demonstration of MRV heuristic and backtracking
export const DEFAULT_SUDOKU_BOARD: number[][] = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

function cloneBoard(b: number[][]): number[][] {
  return b.map((row) => [...row]);
}

function calculateDomainSizes(b: number[][]): number[][] {
  const domains: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (b[r][c] === 0) {
        let count = 0;
        for (let d = 1; d <= 9; d++) {
          if (isValidSudokuCell(b, r, c, d)) count++;
        }
        domains[r][c] = count;
      }
    }
  }
  return domains;
}

function findConflicts(b: number[][], r: number, c: number, num: number): Array<[number, number]> {
  const conflicts: Array<[number, number]> = [];
  // Row
  for (let i = 0; i < 9; i++) {
    if (i !== c && b[r][i] === num) conflicts.push([r, i]);
  }
  // Col
  for (let i = 0; i < 9; i++) {
    if (i !== r && b[i][c] === num) conflicts.push([i, c]);
  }
  // 3x3 Block
  const br = 3 * Math.floor(r / 3);
  const bc = 3 * Math.floor(c / 3);
  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if ((i !== r || j !== c) && b[i][j] === num) {
        if (!conflicts.some(([cr, cc]) => cr === i && cc === j)) {
          conflicts.push([i, j]);
        }
      }
    }
  }
  return conflicts;
}

export function generateSudokuTrace(initialBoard: number[][] = DEFAULT_SUDOKU_BOARD, maxSteps: number = 80): TraceTimeline<SudokuStepData> {
  const events: TraceEvent<SudokuStepData>[] = [];
  const currentBoard = cloneBoard(initialBoard);
  const fixed: boolean[][] = initialBoard.map((row) => row.map((val) => val !== 0));

  let stepCounter = 0;
  let exploredStates = 0;
  let backtrackCount = 0;

  function pushEvent(
    action: SudokuStepData['action'],
    cell: [number, number] | null,
    digit: number | null,
    conflicts: Array<[number, number]>,
    descEs: string,
    descEn: string
  ) {
    if (stepCounter >= maxSteps) return;
    events.push({
      step: stepCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        board: cloneBoard(currentBoard),
        fixed,
        currentCell: cell,
        action,
        attemptedDigit: digit,
        conflictingCells: conflicts,
        domainSizes: calculateDomainSizes(currentBoard),
        exploredStates,
        backtrackCount,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // Initial event
  pushEvent(
    'INIT',
    null,
    null,
    [],
    'Tablero inicial configurado. Aplicando heurística MRV (Minimum Remaining Values).',
    'Initial board configured. Applying MRV (Minimum Remaining Values) heuristic.'
  );

  function solve(): boolean {
    if (stepCounter >= maxSteps) return false;

    // Find cell with minimum remaining values (MRV)
    let minChoices = 10;
    let bestCell: [number, number] | null = null;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] === 0) {
          let count = 0;
          for (let d = 1; d <= 9; d++) {
            if (isValidSudokuCell(currentBoard, r, c, d)) count++;
          }
          if (count < minChoices) {
            minChoices = count;
            bestCell = [r, c];
          }
        }
      }
    }

    if (!bestCell) {
      pushEvent(
        'SOLVED',
        null,
        null,
        [],
        '¡Sudoku resuelto con éxito! Todas las 81 celdas satisfacen las restricciones de fila, columna y cuadrante 3×3.',
        'Sudoku solved successfully! All 81 cells satisfy row, column, and 3×3 block constraints.'
      );
      return true;
    }

    const [r, c] = bestCell;
    exploredStates++;

    pushEvent(
      'MRV_SELECT',
      [r, c],
      null,
      [],
      `Seleccionada celda (${r + 1}, ${c + 1}) por heurística MRV con ${minChoices} valor(es) posibles.`,
      `Selected cell (${r + 1}, ${c + 1}) via MRV heuristic with ${minChoices} possible value(s).`
    );

    for (let d = 1; d <= 9; d++) {
      if (stepCounter >= maxSteps) return false;

      const conflicts = findConflicts(currentBoard, r, c, d);
      if (conflicts.length > 0) {
        pushEvent(
          'PRUNE_CONFLICT',
          [r, c],
          d,
          conflicts,
          `Poda: El dígito ${d} en (${r + 1}, ${c + 1}) colisiona con ${conflicts.length} celda(s) existente(s).`,
          `Pruned: Digit ${d} at (${r + 1}, ${c + 1}) conflicts with ${conflicts.length} existing cell(s).`
        );
        continue;
      }

      currentBoard[r][c] = d;
      pushEvent(
        'PLACE_DIGIT',
        [r, c],
        d,
        [],
        `Dígito ${d} colocado válidamente en (${r + 1}, ${c + 1}). Avanzando recursivamente.`,
        `Digit ${d} placed validly at (${r + 1}, ${c + 1}). Proceeding recursively.`
      );

      if (solve()) return true;

      // Backtrack
      backtrackCount++;
      currentBoard[r][c] = 0;
      pushEvent(
        'BACKTRACK',
        [r, c],
        d,
        [],
        `Retroceso (Backtracking): La asignación ${d} en (${r + 1}, ${c + 1}) no condujo a una solución completa. Restaurando celda a vacío.`,
        `Backtrack: Assignment ${d} at (${r + 1}, ${c + 1}) led to dead end. Restoring cell to empty.`
      );
    }

    return false;
  }

  solve();

  return {
    events,
    totalSteps: events.length
  };
}
