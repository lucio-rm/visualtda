import { TraceTimeline, TraceEvent } from '../../types';
import { KNIGHT_MOVES } from './knightsTourValidator';

export interface KnightsTourStepData {
  n: number;
  board: number[][]; // -1 unvisited, 0..k step numbers
  currentPos: [number, number] | null;
  path: Array<[number, number]>;
  action: 'INIT' | 'MOVE_KNIGHT' | 'BACKTRACK' | 'COMPLETE';
  candidates: Array<{ r: number; c: number; degree: number }>;
  stepCount: number;
  backtrackCount: number;
  description: { es: string; en: string };
}

export function generateKnightsTourTrace(n: number = 5): TraceTimeline<KnightsTourStepData> {
  const events: TraceEvent<KnightsTourStepData>[] = [];
  const board: number[][] = Array.from({ length: n }, () => Array(n).fill(-1));
  const path: Array<[number, number]> = [];

  let eventCounter = 0;
  let backtrackCount = 0;

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

  function pushEvent(
    action: KnightsTourStepData['action'],
    pos: [number, number] | null,
    candidates: Array<{ r: number; c: number; degree: number }>,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        n,
        board: board.map((row) => [...row]),
        currentPos: pos,
        path: [...path],
        action,
        candidates,
        stepCount: path.length,
        backtrackCount,
        description: { es: descEs, en: descEn }
      }
    });
  }

  pushEvent(
    'INIT',
    [0, 0],
    [],
    `Tablero de ${n}×${n} inicializado. El caballo inicia en la casilla (0, 0).`,
    `${n}×${n} board initialized. Knight begins at square (0, 0).`
  );

  function solve(r: number, c: number, step: number): boolean {
    board[r][c] = step;
    path.push([r, c]);

    if (step === n * n - 1) {
      pushEvent(
        'COMPLETE',
        [r, c],
        [],
        `¡Recorrido del Caballo completado! Las ${n * n} casillas del tablero fueron visitadas exactamente una vez.`,
        `Knight's Tour completed! All ${n * n} squares visited exactly once.`
      );
      return true;
    }

    // Evaluate candidates with Warnsdorff's heuristic
    const rawCandidates: Array<{ r: number; c: number; degree: number }> = [];
    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = r + dr;
      const nc = c + dc;
      if (isValid(nr, nc)) {
        rawCandidates.push({ r: nr, c: nc, degree: getDegree(nr, nc) });
      }
    }

    rawCandidates.sort((a, b) => a.degree - b.degree);

    pushEvent(
      'MOVE_KNIGHT',
      [r, c],
      rawCandidates,
      `Paso ${step + 1}: Caballo en (${r}, ${c}). Opciones evaluadas por regla de Warnsdorff: ${rawCandidates.map((c) => `(${c.r},${c.c})[grado=${c.degree}]`).join(', ') || 'ninguna'}.`,
      `Step ${step + 1}: Knight at (${r}, ${c}). Options evaluated by Warnsdorff's rule: ${rawCandidates.map((c) => `(${c.r},${c.c})[deg=${c.degree}]`).join(', ') || 'none'}.`
    );

    for (const cand of rawCandidates) {
      if (solve(cand.r, cand.c, step + 1)) return true;
    }

    // Backtrack
    backtrackCount++;
    board[r][c] = -1;
    path.pop();
    const prevPos = path.length > 0 ? path[path.length - 1] : null;

    pushEvent(
      'BACKTRACK',
      prevPos,
      [],
      `Retroceso (Backtrack): El camino desde (${r}, ${c}) se bloqueó sin cubrir el tablero. Retrocediendo a casilla anterior.`,
      `Backtrack: Path from (${r}, ${c}) is dead end. Retreating to previous square.`
    );

    return false;
  }

  solve(0, 0, 0);

  return {
    events,
    totalSteps: events.length
  };
}
