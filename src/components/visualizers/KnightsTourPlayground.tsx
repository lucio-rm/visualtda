import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { useInstructorMode } from '../../context/InstructorModeContext';
import { KNIGHT_MOVES } from '../../engine/algorithms/knightsTourValidator';

export const ChessKnightIcon: React.FC<{ size?: number; fill?: string; stroke?: string }> = ({
  size = 28,
  fill = 'var(--accent)',
  stroke = 'var(--board-border-strong)'
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 45 45"
    style={{ display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.35))' }}
    aria-hidden="true"
  >
    <g
      style={{
        opacity: 1,
        fill: fill,
        fillRule: 'evenodd',
        fillOpacity: 1,
        stroke: stroke,
        strokeWidth: 2,
        strokeLinecap: 'round',
        strokeLinejoin: 'round'
      }}
    >
      <path
        d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
      />
      <path
        d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.07 18,8.5 C 18.72,8.87 21.05,8.8 21,10 C 20.95,10.6 20.3,11.2 20,11.5 C 19.7,11.8 18.7,12 18,12 C 16.6,12 15.6,11.4 15.6,11.4 C 15.6,11.4 17.3,12.6 18,13 C 18.7,13.4 20.3,13.4 21,13.5 C 22,13.5 23,13.8 23.5,14.5 C 24,15.2 24.4,16.5 24,18 z"
      />
      <circle cx="9.5" cy="25.5" r="0.75" fill={stroke} />
      <circle cx="15" cy="15.5" r="1.2" fill={stroke} />
    </g>
  </svg>
);

export const KnightsTourPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted, isCompleted: isExerciseCompleted } = useStudentProgress();
  const { isInstructorMode } = useInstructorMode();

  const hasMastered = isExerciseCompleted('knights-tour-backtracking');
  const canSeeHeuristic = isInstructorMode || hasMastered;

  const [n, setN] = useState<number>(5);
  const [board, setBoard] = useState<number[][]>(() => {
    const b = Array.from({ length: 5 }, () => Array(5).fill(-1));
    b[0][0] = 0;
    return b;
  });
  const [history, setHistory] = useState<Array<[number, number]>>([[0, 0]]);
  const [message, setMessage] = useState<string | null>(null);
  const [isPickingStart, setIsPickingStart] = useState<boolean>(false);

  const currentPos = history.length > 0 ? history[history.length - 1] : null;
  const stepCount = history.length;
  const isComplete = stepCount === n * n;

  const resetBoard = (newN: number = n, startR: number = 0, startC: number = 0) => {
    setN(newN);
    const b = Array.from({ length: newN }, () => Array(newN).fill(-1));
    b[startR][startC] = 0;
    setBoard(b);
    setHistory([[startR, startC]]);
    setMessage(null);
    setIsPickingStart(false);
  };

  // Find legal moves from currentPos
  const legalMoves: Array<{ r: number; c: number; degree: number }> = useMemo(() => {
    if (isComplete || !currentPos || isPickingStart) return [];
    const [cr, cc] = currentPos;
    const moves: Array<{ r: number; c: number; degree: number }> = [];

    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === -1) {
        // Calculate Warnsdorff degree (unvisited exits from candidate square)
        let deg = 0;
        for (const [ddr, ddc] of KNIGHT_MOVES) {
          const nnr = nr + ddr;
          const nnc = nc + ddc;
          if (
            nnr >= 0 &&
            nnr < n &&
            nnc >= 0 &&
            nnc < n &&
            board[nnr][nnc] === -1 &&
            !(nnr === cr && nnc === cc)
          ) {
            deg++;
          }
        }
        moves.push({ r: nr, c: nc, degree: deg });
      }
    }
    return moves;
  }, [board, currentPos, isComplete, isPickingStart, n]);

  // Find move with minimum Warnsdorff degree
  const bestWarnsdorffMove = useMemo(() => {
    if (legalMoves.length === 0) return null;
    return legalMoves.reduce((best, curr) => (curr.degree < best.degree ? curr : best), legalMoves[0]);
  }, [legalMoves]);

  const handleCellClick = (r: number, c: number) => {
    if (isPickingStart) {
      resetBoard(n, r, c);
      setMessage(
        language === 'es'
          ? `Caballo posicionado en casilla (${String.fromCharCode(65 + c)}${n - r}). ¡Comienza tu recorrido!`
          : `Knight placed at square (${String.fromCharCode(65 + c)}${n - r}). Begin your tour!`
      );
      return;
    }

    if (isComplete) return;

    const isLegal = legalMoves.some((m) => m.r === r && m.c === c);
    if (!isLegal) {
      setMessage(
        language === 'es'
          ? 'Movimiento no válido. El caballo se desplaza en "L" (2 casillas en una dirección y 1 en la perpendicular) hacia una casilla aún no visitada.'
          : 'Invalid move. The knight moves in an "L" pattern (2 squares in one direction, 1 perpendicular) to an unvisited square.'
      );
      return;
    }

    applyMove(r, c);
  };

  const applyMove = (r: number, c: number) => {
    setMessage(null);
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = stepCount;
    setBoard(newBoard);
    const newHistory: Array<[number, number]> = [...history, [r, c]];
    setHistory(newHistory);

    if (newHistory.length === n * n) {
      setMessage(
        language === 'es'
          ? `¡Recorrido hamiltoniano completo! Las ${n * n} casillas del tablero fueron visitadas sin ninguna repetición.`
          : `Complete Hamiltonian tour! All ${n * n} squares were visited without repetition.`
      );
      markAttempted('knights-tour-backtracking');
    }
  };


  const handleUndo = () => {
    if (history.length <= 1) return;
    const [lastR, lastC] = history[history.length - 1];
    const newBoard = board.map((row) => [...row]);
    newBoard[lastR][lastC] = -1;
    setBoard(newBoard);
    setHistory(history.slice(0, history.length - 1));
    setMessage(null);
    setIsPickingStart(false);
  };

  const cellSize = n === 4 ? 80 : n === 5 ? 72 : n === 6 ? 60 : 46;
  const boardSize = cellSize * n;
  const knightSize = n === 8 ? 24 : n === 6 ? 30 : 34;

  return (
    <div
      className="knights-tour-playground"
      role="region"
      aria-label={language === 'es' ? 'Laboratorio del Recorrido del Caballo' : "Knight's Tour Playground"}
    >
      {/* Top Presets and Controls */}
      <div
        className="sdk-pg-controls"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}
      >
        <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn-preset ${n === 4 && !isPickingStart ? 'active' : ''}`}
            onClick={() => resetBoard(4, 0, 0)}
          >
            {language === 'es' ? 'Tablero 4×4 (16)' : 'Board 4×4 (16)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${n === 5 && !isPickingStart ? 'active' : ''}`}
            onClick={() => resetBoard(5, 0, 0)}
          >
            {language === 'es' ? 'Tablero 5×5 (25)' : 'Board 5×5 (25)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${n === 6 && !isPickingStart ? 'active' : ''}`}
            onClick={() => resetBoard(6, 0, 0)}
          >
            {language === 'es' ? 'Tablero 6×6 (36)' : 'Board 6×6 (36)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${n === 8 && !isPickingStart ? 'active' : ''}`}
            onClick={() => resetBoard(8, 0, 0)}
          >
            {language === 'es' ? 'Tablero 8×8 (64)' : 'Board 8×8 (64)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${isPickingStart ? 'active' : ''}`}
            onClick={() => {
              setIsPickingStart(true);
              setMessage(
                language === 'es'
                  ? 'Haz clic en cualquier casilla del tablero para elegir la posición de salida.'
                  : 'Click any square on the board to choose starting position.'
              );
            }}
          >
            {language === 'es' ? 'Cambiar Inicio' : 'Custom Start'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={handleUndo}
            disabled={history.length <= 1}
          >
            {language === 'es' ? 'Deshacer ↺' : 'Undo ↺'}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={() => resetBoard(n, currentPos ? currentPos[0] : 0, currentPos ? currentPos[1] : 0)}
          >
            {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Progress & Heuristic Status Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}
      >
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Casillas recorridas:' : 'Squares visited:'}{' '}
          <strong style={{ color: 'var(--text)', fontSize: '0.95rem' }}>
            {stepCount} / {n * n}
          </strong>{' '}
          ({Math.round((stepCount / (n * n)) * 100)}%)
        </span>

        {legalMoves.length === 0 && !isComplete && (
          <span style={{ color: 'var(--danger, var(--error))', fontWeight: 700, fontSize: '0.85rem' }}>
            {language === 'es' ? 'Callejón sin salida (Dead-end). Presiona "Deshacer" para retroceder.' : 'Dead-end reached. Click "Undo" to backtrack.'}
          </span>
        )}

        {canSeeHeuristic && bestWarnsdorffMove && !isComplete && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Elección heurística óptima (Warnsdorff):' : 'Best heuristic move (Warnsdorff):'}{' '}
            <strong style={{ color: 'var(--success)' }}>
              ({String.fromCharCode(65 + bestWarnsdorffMove.c)}{n - bestWarnsdorffMove.r}) con {bestWarnsdorffMove.degree} salidas
            </strong>
          </span>
        )}
      </div>

      {/* Educational message banner */}
      {message && (
        <div
          className={isComplete ? 'sdk-success-banner' : 'sdk-conflict-banner'}
          role={isComplete ? 'status' : 'alert'}
          style={{
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            lineHeight: 1.4,
            borderLeft: isComplete ? '4px solid var(--success)' : '4px solid var(--warning)',
            backgroundColor: isComplete ? 'var(--state-solution-bg)' : 'var(--state-candidate-bg)'
          }}
        >
          {message}
        </div>
      )}

      {/* Chessboard SVG Canvas */}
      <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
        <svg
          viewBox={`-24 -24 ${boardSize + 48} ${boardSize + 48}`}
          style={{ maxWidth: '100%', width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
          role="img"
          aria-label={language === 'es' ? 'Tablero de ajedrez interactivo para el Recorrido del Caballo' : "Interactive chessboard for Knight's Tour"}
        >
          {/* Outer Border */}
          <rect
            x={-1}
            y={-1}
            width={boardSize + 2}
            height={boardSize + 2}
            fill="none"
            stroke="var(--board-border-strong)"
            strokeWidth={2.5}
            rx={4}
          />

          {/* Coordinate labels: Column Letters (A, B, C...) */}
          {Array.from({ length: n }).map((_, c) => (
            <text
              key={`col-lbl-${c}`}
              x={c * cellSize + cellSize / 2}
              y={-8}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="13px"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {String.fromCharCode(65 + c)}
            </text>
          ))}

          {/* Coordinate labels: Row Numbers (1, 2, 3...) */}
          {Array.from({ length: n }).map((_, r) => (
            <text
              key={`row-lbl-${r}`}
              x={-10}
              y={r * cellSize + cellSize / 2 + 5}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="13px"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {n - r}
            </text>
          ))}

          {/* Grid Cells */}
          {board.map((row, r) =>
            row.map((val, c) => {
              const x = c * cellSize;
              const y = r * cellSize;
              const isDark = (r + c) % 2 === 1;
              const isCur = currentPos && currentPos[0] === r && currentPos[1] === c;
              const isVis = val !== -1;
              const legal = legalMoves.find((m) => m.r === r && m.c === c);
              const isBest = canSeeHeuristic && bestWarnsdorffMove && bestWarnsdorffMove.r === r && bestWarnsdorffMove.c === c;

              let fill = isDark ? 'var(--board-cell-dark)' : 'var(--board-cell-light)';
              let stroke = 'var(--board-border)';
              let strokeWidth = 1.5;

              if (isCur) {
                fill = 'var(--state-active-bg)';
                stroke = 'var(--accent)';
                strokeWidth = 3;
              } else if (isBest) {
                fill = 'var(--state-solution-bg)';
                stroke = 'var(--success)';
                strokeWidth = 2.5;
              } else if (legal) {
                fill = 'var(--state-candidate-bg)';
                stroke = 'var(--warning)';
                strokeWidth = 2.5;
              }

              return (
                <g
                  key={`cell-kt-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{ cursor: legal || isPickingStart ? 'pointer' : 'default' }}
                  role="button"
                  tabIndex={legal || isPickingStart ? 0 : -1}
                  aria-label={
                    language === 'es'
                      ? `Casilla (${String.fromCharCode(65 + c)}${n - r}) ${
                          isVis
                            ? `Visitada en paso ${val + 1}`
                            : legal
                            ? canSeeHeuristic
                              ? `Movimiento legal con grado ${legal.degree}`
                              : 'Movimiento legal'
                            : 'No visitada'
                        }`
                      : `Square (${String.fromCharCode(65 + c)}${n - r}) ${
                          isVis
                            ? `Visited on step ${val + 1}`
                            : legal
                            ? canSeeHeuristic
                              ? `Legal move with degree ${legal.degree}`
                              : 'Legal move'
                            : 'Unvisited'
                        }`
                  }
                >
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    rx={2}
                  />

                  {/* Legal move target indicator: concentric target ring and dot with halo */}
                  {legal && !isVis && (
                    <g pointerEvents="none">
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2}
                        r={cellSize * 0.22}
                        fill="none"
                        stroke="var(--board-bg)"
                        strokeWidth={4}
                      />
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2}
                        r={cellSize * 0.22}
                        fill={isBest ? 'var(--grass-3)' : 'var(--amber-3)'}
                        stroke={isBest ? 'var(--success)' : 'var(--warning)'}
                        strokeWidth={2}
                        strokeDasharray={isBest ? undefined : '3 2'}
                      />
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2}
                        r={cellSize * 0.08}
                        fill={isBest ? 'var(--success)' : 'var(--warning)'}
                      />
                    </g>
                  )}

                  {/* Visit sequence pill for crisp contrast */}
                  {isVis && (
                    <g pointerEvents="none">
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2}
                        r={n === 8 ? 13 : 16}
                        fill="var(--surface)"
                        stroke="var(--border-strong)"
                        strokeWidth={1.5}
                      />
                      <text
                        x={x + cellSize / 2}
                        y={y + cellSize / 2 + (n === 8 ? 4 : 5)}
                        textAnchor="middle"
                        fill="var(--text)"
                        fontFamily="var(--font-mono)"
                        fontSize={n === 8 ? '11px' : n === 6 ? '13px' : '15px'}
                        fontWeight="800"
                      >
                        {val + 1}
                      </text>
                    </g>
                  )}

                  {/* Warnsdorff Degree Tag - visible only for instructors or mastered */}
                  {legal && canSeeHeuristic && (
                    <g transform={`translate(${x + cellSize - (n === 8 ? 18 : 22)}, ${y + 4})`}>
                      <rect
                        width={n === 8 ? 16 : 20}
                        height={n === 8 ? 14 : 16}
                        rx={3}
                        fill={isBest ? 'var(--success)' : 'var(--surface)'}
                        stroke={isBest ? 'var(--success)' : 'var(--border-strong)'}
                        strokeWidth={1}
                      />
                      <text
                        x={n === 8 ? 8 : 10}
                        y={n === 8 ? 11 : 12}
                        textAnchor="middle"
                        fill={isBest ? '#ffffff' : 'var(--text)'}
                        fontFamily="var(--font-mono)"
                        fontSize={n === 8 ? '10px' : '11px'}
                        fontWeight="800"
                      >
                        {legal.degree}
                      </text>
                    </g>
                  )}

                  {/* Best move gold indicator badge - visible only for instructors or mastered */}
                  {isBest && canSeeHeuristic && (
                    <text
                      x={x + 6}
                      y={y + 14}
                      fill="var(--warning)"
                      fontSize="14px"
                      fontWeight="900"
                    >
                      ★
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* Candidate jump trajectory rays from current knight to each legal move */}
          {currentPos &&
            legalMoves.map((lm, idx) => {
              const kX = currentPos[1] * cellSize + cellSize / 2;
              const kY = currentPos[0] * cellSize + cellSize / 2;
              const cX = lm.c * cellSize + cellSize / 2;
              const cY = lm.r * cellSize + cellSize / 2;
              const isThisBest = canSeeHeuristic && bestWarnsdorffMove && bestWarnsdorffMove.r === lm.r && bestWarnsdorffMove.c === lm.c;
              return (
                <g key={`pg-cand-ray-${lm.r}-${lm.c}-${idx}`} pointerEvents="none">
                  <line
                    x1={kX}
                    y1={kY}
                    x2={cX}
                    y2={cY}
                    stroke="var(--board-bg)"
                    strokeWidth={5}
                    strokeLinecap="round"
                    opacity={0.8}
                  />
                  <line
                    x1={kX}
                    y1={kY}
                    x2={cX}
                    y2={cY}
                    stroke={isThisBest ? 'var(--success)' : 'var(--warning)'}
                    strokeWidth={2.5}
                    strokeDasharray="5 3"
                    strokeLinecap="round"
                  />
                </g>
              );
            })}

          {/* Polyline trajectory of moves with halo */}
          {history.length > 1 && (
            <>
              <polyline
                points={history
                  .map(([r, c]) => `${c * cellSize + cellSize / 2},${r * cellSize + cellSize / 2}`)
                  .join(' ')}
                fill="none"
                stroke="var(--board-bg)"
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.8}
              />
              <polyline
                points={history
                  .map(([r, c]) => `${c * cellSize + cellSize / 2},${r * cellSize + cellSize / 2}`)
                  .join(' ')}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Vector Knight piece at current position with elevated backing circle */}
          {currentPos && (
            <g
              transform={`translate(${currentPos[1] * cellSize + (cellSize - knightSize) / 2}, ${
                currentPos[0] * cellSize + (cellSize - knightSize) / 2
              })`}
              pointerEvents="none"
            >
              <circle
                cx={knightSize / 2}
                cy={knightSize / 2}
                r={knightSize / 2 + 2}
                fill="var(--surface)"
                stroke="var(--accent)"
                strokeWidth={2}
              />
              <ChessKnightIcon size={knightSize} fill="var(--accent)" stroke="var(--accent)" />
            </g>
          )}
        </svg>
      </div>

      {/* Rationale Callout: Why Warnsdorff's Rule works */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          lineHeight: 1.5
        }}
      >
        <strong>
          {language === 'es' ? 'Fundamento: Recorrido del Caballo y Regla de Warnsdorff' : "Rationale: Knight's Tour and Warnsdorff's Rule"}
        </strong>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)' }}>
          {canSeeHeuristic
            ? (language === 'es'
                ? 'En cada paso, el caballo se mueve hacia la casilla que tiene el menor número de salidas posibles hacia casillas no visitadas (grado mínimo, marcado con ★). Esta heurística Greedy evita dejar casillas aisladas en las esquinas o bordes que luego se convertirían en callejones sin salida imposibles de visitar.'
                : 'At each step, the knight moves to the square with the minimum number of onward unvisited exits (minimum degree, marked with ★). This greedy heuristic prevents isolating corner and edge squares that would later become dead-ends.')
            : (language === 'es'
                ? 'Intenta recorrer todas las casillas sin quedar atrapado en un callejón sin salida. ¿A qué casillas conviene saltar primero para no aislar los rincones? (La guía heurística de Warnsdorff se revelará al completar el ejercicio o en Modo Docente).'
                : 'Try to visit all squares without getting trapped in a dead end. Which squares should you prioritize to avoid isolating corners? (Warnsdorff heuristic hints will unlock upon completion or in Instructor Mode).')}
        </p>
      </div>
    </div>
  );
};
