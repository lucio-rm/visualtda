import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { KNIGHT_MOVES, solveKnightsTour } from '../../engine/algorithms/knightsTourValidator';

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

  const currentPos = history[history.length - 1];
  const stepCount = history.length;
  const isComplete = stepCount === n * n;

  const resetBoard = (newN: number = n) => {
    setN(newN);
    const b = Array.from({ length: newN }, () => Array(newN).fill(-1));
    b[0][0] = 0;
    setBoard(b);
    setHistory([[0, 0]]);
    setMessage(null);
  };

  // Find legal moves from currentPos
  const legalMoves: Array<{ r: number; c: number; degree: number }> = [];
  if (!isComplete && currentPos) {
    const [cr, cc] = currentPos;
    for (const [dr, dc] of KNIGHT_MOVES) {
      const nr = cr + dr;
      const nc = cc + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n && board[nr][nc] === -1) {
        // Calculate degree (exits from next square)
        let deg = 0;
        for (const [ddr, ddc] of KNIGHT_MOVES) {
          const nnr = nr + ddr;
          const nnc = nc + ddc;
          if (nnr >= 0 && nnr < n && nnc >= 0 && nnc < n && board[nnr][nnc] === -1 && !(nnr === cr && nnc === cc)) {
            deg++;
          }
        }
        legalMoves.push({ r: nr, c: nc, degree: deg });
      }
    }
  }

  const handleCellClick = (r: number, c: number) => {
    if (isComplete) return;
    const isLegal = legalMoves.some((m) => m.r === r && m.c === c);
    if (!isLegal) {
      setMessage(
        language === 'es'
          ? `Movimiento no válido. El caballo debe moverse en forma de "L" (2 casillas en una dirección y 1 en la perpendicular) a una casilla no visitada.`
          : 'Invalid move. The knight must move in an "L" pattern (2 squares one way, 1 square perpendicular) to an unvisited square.'
      );
      return;
    }

    setMessage(null);
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = stepCount;
    setBoard(newBoard);
    const newHistory: Array<[number, number]> = [...history, [r, c]];
    setHistory(newHistory);

    if (newHistory.length === n * n) {
      setMessage(
        language === 'es'
          ? 'Recorrido completo factible: 64 casillas transitadas sin repetición.'
          : "Complete feasible tour: all 64 squares visited without repetition."
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
  };

  const handleAutoSolve = () => {
    const solved = solveKnightsTour(n);
    if (solved) {
      setBoard(solved);
      const newHist: Array<[number, number]> = Array(n * n);
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          newHist[solved[r][c]] = [r, c];
        }
      }
      setHistory(newHist);
      setMessage(
        language === 'es'
          ? '✓ Recorrido completado exitosamente mediante la Regla de Warnsdorff.'
          : "✓ Tour completed successfully via Warnsdorff's Rule."
      );
      markAttempted('knights-tour-backtracking');
    }
  };

  const cellSize = n === 5 ? 60 : 50;
  const boardSize = cellSize * n;

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio del Recorrido del Caballo">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${n === 5 ? 'active' : ''}`}
            onClick={() => resetBoard(5)}
          >
            Tablero 5×5 (25 casillas)
          </button>
          <button
            type="button"
            className={`btn-preset ${n === 6 ? 'active' : ''}`}
            onClick={() => resetBoard(6)}
          >
            Tablero 6×6 (36 casillas)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={handleUndo}
            disabled={history.length <= 1}
          >
            {language === 'es' ? 'Deshacer Paso ↺' : 'Undo ↺'}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={() => resetBoard(n)}
          >
            {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleAutoSolve}
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            {language === 'es' ? 'Resolver Warnsdorff ⚡' : 'Solve Warnsdorff ⚡'}
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Casillas recorridas:' : 'Squares visited:'} <strong>{stepCount} / {n * n}</strong>
        </span>
        {legalMoves.length === 0 && !isComplete && (
          <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 600, fontSize: '0.85rem' }}>
            ⚠️ {language === 'es' ? '¡Caballo acorralado sin movimientos!' : 'Knight trapped!'}
          </span>
        )}
      </div>

      {message && (
        <div
          className={isComplete ? 'sdk-success-banner' : 'sdk-conflict-banner'}
          role={isComplete ? 'status' : 'alert'}
        >
          {message}
        </div>
      )}

      {/* Chessboard SVG */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={`-6 -6 ${boardSize + 12} ${boardSize + 12}`}
          style={{ maxWidth: '400px', width: '100%', height: 'auto', borderRadius: '4px' }}
          role="img"
          aria-label="Tablero de ajedrez interactivo"
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const x = c * cellSize;
              const y = r * cellSize;
              const isDark = (r + c) % 2 === 1;
              const isCur = currentPos && currentPos[0] === r && currentPos[1] === c;
              const isVis = val !== -1;
              const legal = legalMoves.find((m) => m.r === r && m.c === c);

              let fill = isDark ? 'var(--surface-hover, #1e293b)' : 'var(--surface, #0f172a)';
              let stroke = 'var(--border, #334155)';
              let strokeWidth = 1;

              if (isCur) {
                fill = 'rgba(56, 189, 248, 0.35)';
                stroke = '#38bdf8';
                strokeWidth = 3;
              } else if (legal) {
                fill = 'rgba(16, 185, 129, 0.25)';
                stroke = '#10b981';
                strokeWidth = 2;
              }

              return (
                <g
                  key={`cell-kt-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{ cursor: legal ? 'pointer' : 'default' }}
                  role="button"
                  tabIndex={legal ? 0 : -1}
                  aria-label={`Casilla (${r}, ${c}) ${isVis ? `Visitada en paso ${val + 1}` : legal ? `Movimiento legal, grado ${legal.degree}` : 'No visitada'}`}
                >
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                  {isVis && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 5}
                      textAnchor="middle"
                      fill="var(--text, #f8fafc)"
                      fontFamily="var(--font-mono)"
                      fontSize="14px"
                      fontWeight="700"
                    >
                      {val + 1}
                    </text>
                  )}
                  {legal && (
                    <text
                      x={x + cellSize - 5}
                      y={y + 13}
                      textAnchor="end"
                      fill="#10b981"
                      fontFamily="var(--font-mono)"
                      fontSize="11px"
                      fontWeight="700"
                    >
                      deg:{legal.degree}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* Polyline trajectory of moves */}
          {history.length > 1 && (
            <polyline
              points={history.map(([r, c]) => `${c * cellSize + cellSize / 2},${r * cellSize + cellSize / 2}`).join(' ')}
              fill="none"
              stroke="var(--accent, #38bdf8)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}

          {/* Knight glyph at current position */}
          {currentPos && (
            <g transform={`translate(${currentPos[1] * cellSize + cellSize / 2 - 12}, ${currentPos[0] * cellSize + cellSize / 2 - 12})`}>
              <text fontSize="24" textAnchor="middle" x="12" y="20">
                ♞
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};
