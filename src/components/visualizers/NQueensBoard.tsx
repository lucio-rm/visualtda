import React from 'react';
import { NQueensConflictType } from '../../engine/algorithms/nQueensTrace';
import './NQueensVisualizer.css';

export type BoardConflictType = NQueensConflictType | 'row' | 'col' | 'diag';

export interface QueenConflictPair {
  row1: number;
  col1: number;
  row2: number;
  col2: number;
  type: BoardConflictType;
}

export interface NQueensBoardProps {
  n: number;
  board?: number[]; // board[row] = col, or -1 if empty (legacy/trace mode)
  queens?: Array<{ row: number; col: number }>; // Free manual placement coordinates
  currentRow?: number;
  currentCol?: number;
  conflictWith?: {
    row: number;
    col: number;
    type: NQueensConflictType;
  };
  conflicts?: QueenConflictPair[]; // Multiple collision laser rays
  isSolution?: boolean;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
}

export const NQueensBoard: React.FC<NQueensBoardProps> = ({
  n,
  board,
  queens,
  currentRow = -1,
  currentCol = -1,
  conflictWith,
  conflicts = [],
  isSolution = false,
  onCellClick,
  interactive = false
}) => {
  const cellSize = 50;
  const boardPixelSize = n * cellSize;

  return (
    <div className={`nqueens-board-wrapper ${isSolution ? 'solution-board' : ''}`}>
      <svg
        viewBox={`0 0 ${boardPixelSize} ${boardPixelSize}`}
        className="nqueens-board-svg"
        aria-label={`Tablero de ajedrez ${n} por ${n}`}
        role="img"
      >
        <defs>
          <filter id="queen-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.4" />
          </filter>
          <filter id="conflict-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#dc2626" floodOpacity="0.5" />
          </filter>
        </defs>

        {/* Board squares */}
        {Array.from({ length: n }).map((_, r) =>
          Array.from({ length: n }).map((__, c) => {
            const isDark = (r + c) % 2 === 1;
            const isCandidate = r === currentRow && c === currentCol;
            const isPlaced = queens
              ? queens.some((q) => q.row === r && q.col === c)
              : board
                ? board[r] === c
                : false;
            const inConflictList = conflicts.some(
              (cf) => (cf.row1 === r && cf.col1 === c) || (cf.row2 === r && cf.col2 === c)
            );
            const isConflictSource =
              (conflictWith && conflictWith.row === r && conflictWith.col === c) || inConflictList;
            const isConflictTarget = conflictWith && currentRow === r && currentCol === c;
            const isConflictedCandidate = isCandidate && !!conflictWith;

            let cellClass = `board-cell ${isDark ? 'cell-dark' : 'cell-light'}`;
            if (isSolution) cellClass += ' cell-solution';
            if (isConflictSource || isConflictTarget) cellClass += ' cell-conflict-source';
            if (isConflictedCandidate && !isPlaced) cellClass += ' cell-conflict-target';
            if (isCandidate && !conflictWith) cellClass += ' cell-candidate';

            return (
              <g
                key={`${r}-${c}`}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                aria-label={interactive ? `Fila ${r}, Columna ${c}${isPlaced ? ', con reina' : ', vacía'}` : undefined}
                onClick={() => interactive && onCellClick?.(r, c)}
                onKeyDown={(e) => {
                  if (interactive && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onCellClick?.(r, c);
                  }
                }}
                style={{ cursor: interactive ? 'pointer' : 'default', outline: 'none' }}
              >
                <rect
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize}
                  height={cellSize}
                  className={cellClass}
                />

                {/* Coordinate indicators along borders */}
                {c === 0 && (
                  <text
                    x={c * cellSize + 3}
                    y={r * cellSize + 12}
                    className="cell-coord-text"
                    aria-hidden="true"
                  >
                    {r}
                  </text>
                )}
                {r === n - 1 && (
                  <text
                    x={(c + 1) * cellSize - 10}
                    y={(r + 1) * cellSize - 3}
                    className="cell-coord-text"
                    aria-hidden="true"
                  >
                    {c}
                  </text>
                )}

                {/* Placed Queen */}
                {isPlaced && (
                  <g className="queen-glyph-group">
                    <circle
                      cx={c * cellSize + cellSize / 2}
                      cy={r * cellSize + cellSize / 2}
                      r={cellSize * 0.38}
                      className={`queen-bg-circle ${isSolution ? 'solution-circle' : ''} ${isConflictSource || isConflictTarget ? 'conflict-circle' : ''}`}
                      filter={isConflictSource || isConflictTarget ? 'url(#conflict-glow)' : 'url(#queen-glow)'}
                    />
                    <text
                      x={c * cellSize + cellSize / 2}
                      y={r * cellSize + cellSize / 2 + 7}
                      className="queen-icon"
                      textAnchor="middle"
                      aria-label={`Reina en fila ${r}, columna ${c}`}
                    >
                      ♛
                    </text>
                    {(isConflictSource || isConflictTarget) && (
                      <circle
                        cx={c * cellSize + cellSize - 8}
                        cy={r * cellSize + 8}
                        r={5}
                        fill="#ef4444"
                        stroke="#ffffff"
                        strokeWidth={1.5}
                      />
                    )}
                  </g>
                )}

                {/* Candidate Queen being tested */}
                {isCandidate && !isPlaced && (
                  <g className="candidate-glyph-group">
                    <circle
                      cx={c * cellSize + cellSize / 2}
                      cy={r * cellSize + cellSize / 2}
                      r={cellSize * 0.36}
                      className={`candidate-bg-circle ${conflictWith ? 'conflict-candidate-circle' : ''}`}
                    />
                    <text
                      x={c * cellSize + cellSize / 2}
                      y={r * cellSize + cellSize / 2 + 7}
                      className="queen-icon candidate-icon"
                      textAnchor="middle"
                    >
                      ♛
                    </text>
                  </g>
                )}
              </g>
            );
          })
        )}

        {/* Multiple Conflict Rays (for free interactive placement) */}
        {conflicts.map((cf, idx) => (
          <line
            key={`cf-ray-${idx}-${cf.row1}-${cf.col1}-${cf.row2}-${cf.col2}`}
            x1={cf.col1 * cellSize + cellSize / 2}
            y1={cf.row1 * cellSize + cellSize / 2}
            x2={cf.col2 * cellSize + cellSize / 2}
            y2={cf.row2 * cellSize + cellSize / 2}
            className="conflict-ray-line"
            style={{ pointerEvents: 'none' }}
          />
        ))}

        {/* Conflict Ray indicator connecting candidate and conflicting queen (trace mode) */}
        {conflictWith && currentRow >= 0 && currentCol >= 0 && (
          <line
            x1={conflictWith.col * cellSize + cellSize / 2}
            y1={conflictWith.row * cellSize + cellSize / 2}
            x2={currentCol * cellSize + cellSize / 2}
            y2={currentRow * cellSize + cellSize / 2}
            className="conflict-ray-line"
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>
    </div>
  );
};
