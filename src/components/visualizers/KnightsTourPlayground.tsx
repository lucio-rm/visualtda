import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { KNIGHT_MOVES } from '../../engine/algorithms/knightsTourValidator';

export const KnightsTourPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

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

  const cellSize = n === 5 ? 78 : 66;
  const boardSize = cellSize * n;

  return (
    <div className="knights-tour-playground" role="region" aria-label="Laboratorio del Recorrido del Caballo">
      {/* Top Presets and Controls */}
      <div
        className="sdk-pg-controls"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}
      >
        <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
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

        {bestWarnsdorffMove && !isComplete && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Elección heurística óptima:' : 'Best heuristic move:'}{' '}
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
          style={{ maxWidth: '580px', width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
          role="img"
          aria-label="Tablero de ajedrez interactivo para el Recorrido del Caballo"
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
              const isBest = bestWarnsdorffMove && bestWarnsdorffMove.r === r && bestWarnsdorffMove.c === c;

              let fill = isDark ? 'var(--board-cell-dark)' : 'var(--board-cell-light)';
              let stroke = 'var(--board-border)';
              let strokeWidth = 1;

              if (isCur) {
                fill = 'var(--state-active-bg)';
                stroke = 'var(--accent)';
                strokeWidth = 3;
              } else if (isBest) {
                fill = 'var(--state-solution-bg)';
                stroke = 'var(--success)';
                strokeWidth = 2.5;
              } else if (legal) {
                fill = 'var(--state-solution-bg)';
                stroke = 'var(--state-solution-bg)';
                strokeWidth = 1.5;
              }

              return (
                <g
                  key={`cell-kt-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{ cursor: legal || isPickingStart ? 'pointer' : 'default' }}
                  role="button"
                  tabIndex={legal || isPickingStart ? 0 : -1}
                  aria-label={`Casilla (${String.fromCharCode(65 + c)}${n - r}) ${
                    isVis
                      ? `Visitada en paso ${val + 1}`
                      : legal
                      ? `Movimiento legal con grado ${legal.degree}`
                      : 'No visitada'
                  }`}
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

                  {/* Visit sequence number */}
                  {isVis && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 6}
                      textAnchor="middle"
                      fill={isCur ? 'var(--accent)' : 'var(--text)'}
                      fontFamily="var(--font-mono)"
                      fontSize={n === 5 ? '18px' : '15px'}
                      fontWeight="700"
                    >
                      {val + 1}
                    </text>
                  )}

                  {/* Warnsdorff Degree Tag */}
                  {legal && (
                    <g transform={`translate(${x + cellSize - 22}, ${y + 5})`}>
                      <rect
                        width={22}
                        height={18}
                        rx={4}
                        fill={isBest ? 'var(--success)' : 'var(--surface)'}
                        stroke={isBest ? 'var(--success)' : 'var(--border)'}
                        strokeWidth={1}
                      />
                      <text
                        x={11}
                        y={13}
                        textAnchor="middle"
                        fill={isBest ? '#ffffff' : 'var(--text-muted)'}
                        fontFamily="var(--font-mono)"
                        fontSize="13px"
                        fontWeight="800"
                      >
                        {legal.degree}
                      </text>
                    </g>
                  )}

                  {/* Best move gold indicator badge */}
                  {isBest && (
                    <text
                      x={x + 7}
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

          {/* Polyline trajectory of moves with glow */}
          {history.length > 1 && (
            <polyline
              points={history
                .map(([r, c]) => `${c * cellSize + cellSize / 2},${r * cellSize + cellSize / 2}`)
                .join(' ')}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}

          {/* Knight glyph at current position */}
          {currentPos && (
            <g
              transform={`translate(${currentPos[1] * cellSize + cellSize / 2 - 14}, ${
                currentPos[0] * cellSize + cellSize / 2 - 14
              })`}
            >
              <text fontSize="28" textAnchor="middle" x="14" y="24">
                ♞
              </text>
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
          {language === 'es' ? 'Fundamento: Regla de Warnsdorff' : "Rationale: Warnsdorff's Rule"}
        </strong>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)' }}>
          {language === 'es'
            ? 'En cada paso, el caballo se mueve hacia la casilla que tiene el menor número de salidas posibles hacia casillas no visitadas (grado mínimo, marcado con ★). Esta heurística Greedy evita dejar casillas aisladas en las esquinas o bordes que luego se convertirían en callejones sin salida imposibles de visitar.'
            : 'At each step, the knight moves to the square with the minimum number of onward unvisited exits (minimum degree, marked with ★). This greedy heuristic prevents isolating corner and edge squares that would later become dead-ends.'}
        </p>
      </div>
    </div>
  );
};
