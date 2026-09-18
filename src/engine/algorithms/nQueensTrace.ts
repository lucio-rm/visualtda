import { TraceEvent, TraceTimeline } from '../../types/trace';

export type NQueensConflictType = 'column' | 'diag_main' | 'diag_sec';

export interface NQueensStepData {
  n: number;
  board: number[]; // board[row] = col, or -1 if unplaced
  currentRow: number;
  currentCol: number;
  conflictWith?: {
    row: number;
    col: number;
    type: NQueensConflictType;
  };
  solutionsFound: number;
  totalStatesVisited: number;
  totalBacktracks: number;
  isSolution: boolean;
}

export function generateNQueensTrace(n: number, findFirstOnly = false): TraceTimeline<NQueensStepData> {
  const events: TraceEvent<NQueensStepData>[] = [];
  const board: number[] = new Array(n).fill(-1);

  let stepCounter = 0;
  let solutionsFound = 0;
  let totalStatesVisited = 0;
  let totalBacktracks = 0;

  // Emit initial state
  events.push({
    step: stepCounter++,
    type: 'init',
    message: {
      es: `Iniciando búsqueda de N-Reinas para tablero de ${n}×${n}.`,
      en: `Starting N-Queens search for an ${n}×${n} board.`
    },
    data: {
      n,
      board: [...board],
      currentRow: 0,
      currentCol: -1,
      solutionsFound: 0,
      totalStatesVisited: 0,
      totalBacktracks: 0,
      isSolution: false
    }
  });

  function checkConflict(row: number, col: number): { row: number; col: number; type: NQueensConflictType } | null {
    for (let prevRow = 0; prevRow < row; prevRow++) {
      const prevCol = board[prevRow];
      if (prevCol === col) {
        return { row: prevRow, col: prevCol, type: 'column' };
      }
      if (prevRow - prevCol === row - col) {
        return { row: prevRow, col: prevCol, type: 'diag_main' };
      }
      if (prevRow + prevCol === row + col) {
        return { row: prevRow, col: prevCol, type: 'diag_sec' };
      }
    }
    return null;
  }

  function backtrack(row: number): boolean {
    if (row === n) {
      solutionsFound++;
      events.push({
        step: stepCounter++,
        type: 'solution',
        message: {
          es: `¡Solución #${solutionsFound} encontrada! Tablero completo y válido.`,
          en: `Solution #${solutionsFound} found! Complete and valid board.`
        },
        data: {
          n,
          board: [...board],
          currentRow: row - 1,
          currentCol: board[row - 1],
          solutionsFound,
          totalStatesVisited,
          totalBacktracks,
          isSolution: true
        }
      });
      return findFirstOnly;
    }

    for (let col = 0; col < n; col++) {
      totalStatesVisited++;

      // Emit 'try' event
      events.push({
        step: stepCounter++,
        type: 'try',
        message: {
          es: `Fila ${row}: Evaluando colocar reina en columna ${col}.`,
          en: `Row ${row}: Evaluating queen placement at column ${col}.`
        },
        data: {
          n,
          board: [...board],
          currentRow: row,
          currentCol: col,
          solutionsFound,
          totalStatesVisited,
          totalBacktracks,
          isSolution: false
        }
      });

      const conflict = checkConflict(row, col);

      if (conflict) {
        // Emit 'conflict' event (Pruning)
        const typeLabels: Record<NQueensConflictType, { es: string; en: string }> = {
          column: { es: 'misma columna', en: 'same column' },
          diag_main: { es: 'misma diagonal principal', en: 'same main diagonal' },
          diag_sec: { es: 'misma diagonal secundaria', en: 'same secondary diagonal' }
        };

        events.push({
          step: stepCounter++,
          type: 'conflict',
          message: {
            es: `PODA: Conflicto con la reina en (${conflict.row}, ${conflict.col}) (${typeLabels[conflict.type].es}). Casilla descartada.`,
            en: `PRUNING: Conflict with queen at (${conflict.row}, ${conflict.col}) (${typeLabels[conflict.type].en}). Cell discarded.`
          },
          data: {
            n,
            board: [...board],
            currentRow: row,
            currentCol: col,
            conflictWith: conflict,
            solutionsFound,
            totalStatesVisited,
            totalBacktracks,
            isSolution: false
          }
        });
        continue;
      }

      // Safe placement
      board[row] = col;
      events.push({
        step: stepCounter++,
        type: 'place',
        message: {
          es: `Posición segura. Reina colocada en fila ${row}, columna ${col}. Avanzando a la fila ${row + 1}.`,
          en: `Safe position. Queen placed at row ${row}, column ${col}. Advancing to row ${row + 1}.`
        },
        data: {
          n,
          board: [...board],
          currentRow: row,
          currentCol: col,
          solutionsFound,
          totalStatesVisited,
          totalBacktracks,
          isSolution: false
        }
      });

      const shouldStop = backtrack(row + 1);
      if (shouldStop) {
        return true;
      }

      // Backtracking: Undo choice
      totalBacktracks++;
      board[row] = -1;
      events.push({
        step: stepCounter++,
        type: 'backtrack',
        message: {
          es: `BACKTRACKING: Deshaciendo reina en fila ${row}, columna ${col}. Probando siguiente opción.`,
          en: `BACKTRACKING: Undoing queen at row ${row}, column ${col}. Trying next option.`
        },
        data: {
          n,
          board: [...board],
          currentRow: row,
          currentCol: col,
          solutionsFound,
          totalStatesVisited,
          totalBacktracks,
          isSolution: false
        }
      });
    }

    return false;
  }

  backtrack(0);

  // Emit final completion event
  events.push({
    step: stepCounter++,
    type: 'complete',
    message: {
      es: `Exploración finalizada. Soluciones encontradas: ${solutionsFound}. Estados evaluados: ${totalStatesVisited}. Retrocesos: ${totalBacktracks}.`,
      en: `Search completed. Solutions found: ${solutionsFound}. States evaluated: ${totalStatesVisited}. Backtracks: ${totalBacktracks}.`
    },
    data: {
      n,
      board: [...board],
      currentRow: -1,
      currentCol: -1,
      solutionsFound,
      totalStatesVisited,
      totalBacktracks,
      isSolution: false
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
