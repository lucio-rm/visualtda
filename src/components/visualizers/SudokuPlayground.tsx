import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { isValidSudokuCell, solveSudoku } from '../../engine/algorithms/sudokuValidator';
import './SudokuPlayground.css';

const PRESET_EASY: number[][] = [
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

const PRESET_MRV_SHOWCASE: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 1, 2],
  [0, 0, 0, 0, 3, 5, 0, 0, 0],
  [0, 0, 0, 6, 0, 0, 0, 7, 0],
  [7, 0, 0, 0, 0, 0, 3, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 4, 0, 0, 0, 0, 0, 8],
  [0, 5, 0, 0, 0, 9, 0, 0, 0],
  [0, 0, 0, 7, 8, 0, 0, 0, 0],
  [3, 2, 0, 0, 0, 0, 0, 0, 0]
];

export const SudokuPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePreset, setActivePreset] = useState<'easy' | 'mrv' | 'empty'>('easy');
  const [board, setBoard] = useState<number[][]>(() => PRESET_EASY.map((row) => [...row]));
  const [fixedCells, setFixedCells] = useState<boolean[][]>(() =>
    PRESET_EASY.map((row) => row.map((v) => v !== 0))
  );
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>([0, 2]);
  const [showDomainSizes, setShowDomainSizes] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [solvedMessage, setSolvedMessage] = useState<string | null>(null);

  const setPreset = (preset: 'easy' | 'mrv' | 'empty') => {
    setActivePreset(preset);
    setConflictMsg(null);
    setSolvedMessage(null);
    let newBoard: number[][];
    if (preset === 'easy') {
      newBoard = PRESET_EASY.map((row) => [...row]);
    } else if (preset === 'mrv') {
      newBoard = PRESET_MRV_SHOWCASE.map((row) => [...row]);
    } else {
      newBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
    }
    setBoard(newBoard);
    setFixedCells(newBoard.map((row) => row.map((v) => v !== 0)));
  };

  const domainSizes = useMemo(() => {
    const ds: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          let count = 0;
          for (let d = 1; d <= 9; d++) {
            if (isValidSudokuCell(board, r, c, d)) count++;
          }
          ds[r][c] = count;
        }
      }
    }
    return ds;
  }, [board]);

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell([r, c]);
    setConflictMsg(null);
  };

  const handleSetNumber = (num: number) => {
    if (!selectedCell) return;
    const [r, c] = selectedCell;
    if (fixedCells[r][c] && activePreset !== 'empty') {
      setConflictMsg(
        language === 'es'
          ? `La celda (${r + 1}, ${c + 1}) es una pista fija del puzzle inicial.`
          : `Cell (${r + 1}, ${c + 1}) is a fixed initial clue.`
      );
      return;
    }

    if (num !== 0 && !isValidSudokuCell(board, r, c, num)) {
      setConflictMsg(
        language === 'es'
          ? `¡Conflicto! El número ${num} ya existe en la fila ${r + 1}, columna ${c + 1} o en el cuadrante 3×3 correspondiente.`
          : `Conflict! Number ${num} already exists in row ${r + 1}, column ${c + 1} or 3x3 block.`
      );
      return;
    }

    setConflictMsg(null);
    const newBoard = board.map((row, ri) =>
      row.map((val, ci) => (ri === r && ci === c ? num : val))
    );
    setBoard(newBoard);

    // Check if fully solved
    const isComplete = newBoard.every((row) => row.every((v) => v !== 0));
    if (isComplete) {
      setSolvedMessage(
        language === 'es'
          ? 'Asignación completa y factible: todas las restricciones de fila, columna y cuadrante 3×3 se satisfacen.'
          : 'Complete feasible assignment: all row, column, and 3x3 subgrid constraints are satisfied.'
      );
      markAttempted('sudoku-backtracking');
    }
  };

  const handleSolveWithBacktracking = () => {
    const boardCopy = board.map((row) => [...row]);
    const success = solveSudoku(boardCopy);
    if (success) {
      setBoard(boardCopy);
      setConflictMsg(null);
      setSolvedMessage(
        language === 'es'
          ? '✓ Solución completa encontrada mediante Backtracking sistemático con poda MRV.'
          : '✓ Complete solution found via systematic Backtracking with MRV pruning.'
      );
      markAttempted('sudoku-backtracking');
    } else {
      setConflictMsg(
        language === 'es'
          ? 'No existe solución válida para la configuración actual de números.'
          : 'No valid solution exists for current configuration.'
      );
    }
  };

  const cellSize = 44;
  const boardWidth = cellSize * 9;

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio Interactivo de Sudoku">
      {/* Top Toolbar */}
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${activePreset === 'easy' ? 'active' : ''}`}
            onClick={() => setPreset('easy')}
          >
            {language === 'es' ? 'Puzzle Estándar' : 'Standard Puzzle'}
          </button>
          <button
            type="button"
            className={`btn-preset ${activePreset === 'mrv' ? 'active' : ''}`}
            onClick={() => setPreset('mrv')}
          >
            {language === 'es' ? 'Demostración MRV' : 'MRV Showcase'}
          </button>
          <button
            type="button"
            className={`btn-preset ${activePreset === 'empty' ? 'active' : ''}`}
            onClick={() => setPreset('empty')}
          >
            {language === 'es' ? 'Caso Propio (Vacío)' : 'Custom Board (Empty)'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={() => setShowDomainSizes(!showDomainSizes)}
          >
            {showDomainSizes
              ? (language === 'es' ? 'Ocultar Opciones (MRV)' : 'Hide Options (MRV)')
              : (language === 'es' ? 'Ver Opciones Restantes (MRV)' : 'Show Remaining Options (MRV)')}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleSolveWithBacktracking}
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            {language === 'es' ? 'Resolver con Backtracking ⚡' : 'Solve with Backtracking ⚡'}
          </button>
        </div>
      </div>

      {conflictMsg && <div className="sdk-conflict-banner" role="alert">{conflictMsg}</div>}
      {solvedMessage && <div className="sdk-success-banner" role="status">{solvedMessage}</div>}

      {/* SVG Board */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={`-4 -4 ${boardWidth + 8} ${boardWidth + 8}`}
          style={{ maxWidth: '440px', width: '100%', height: 'auto', borderRadius: '4px' }}
          role="img"
          aria-label="Tablero de Sudoku interactivo"
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const x = c * cellSize;
              const y = r * cellSize;
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isFixed = fixedCells[r][c] && activePreset !== 'empty';
              const blockIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
              const isAltBlock = blockIndex % 2 === 1;

              let fill = isAltBlock ? 'var(--surface-hover, #1e293b)' : 'var(--surface, #0f172a)';
              let stroke = 'var(--border, #334155)';
              let strokeWidth = 1;

              if (isSelected) {
                fill = 'rgba(99, 102, 241, 0.25)';
                stroke = 'var(--accent, #6366f1)';
                strokeWidth = 2.5;
              }

              return (
                <g
                  key={`cell-pg-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Fila ${r + 1}, Columna ${c + 1}, Valor ${val || 'vacío'}`}
                  onKeyDown={(e) => {
                    if (e.key >= '1' && e.key <= '9') handleSetNumber(Number(e.key));
                    if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') handleSetNumber(0);
                  }}
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
                  {val !== 0 ? (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 7}
                      textAnchor="middle"
                      fill={isFixed ? 'var(--text, #f8fafc)' : 'var(--accent, #38bdf8)'}
                      fontFamily="var(--font-mono)"
                      fontSize="20px"
                      fontWeight={isFixed ? '800' : '600'}
                    >
                      {val}
                    </text>
                  ) : (
                    showDomainSizes && domainSizes[r]?.[c] !== undefined && (
                      <text
                        x={x + cellSize - 5}
                        y={y + cellSize - 4}
                        textAnchor="end"
                        fill="var(--text-muted)"
                        fontFamily="var(--font-mono)"
                        fontSize="10px"
                        opacity={0.7}
                      >
                        {domainSizes[r][c]}
                      </text>
                    )
                  )}
                </g>
              );
            })
          )}

          {/* 3x3 Block Grid Lines */}
          {[0, 1, 2, 3].map((b) => (
            <React.Fragment key={`grid-line-${b}`}>
              <line
                x1={0}
                y1={b * cellSize * 3}
                x2={boardWidth}
                y2={b * cellSize * 3}
                stroke="var(--text, #94a3b8)"
                strokeWidth={b === 0 || b === 3 ? 3 : 2}
              />
              <line
                x1={b * cellSize * 3}
                y1={0}
                x2={b * cellSize * 3}
                y2={boardWidth}
                stroke="var(--text, #94a3b8)"
                strokeWidth={b === 0 || b === 3 ? 3 : 2}
              />
            </React.Fragment>
          ))}
        </svg>
      </div>

      {/* Number Pad for Mobile and Fast Selection */}
      <div className="sdk-pg-numpad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={`num-${num}`}
            type="button"
            className="btn-num"
            onClick={() => handleSetNumber(num)}
            aria-label={`Ingresar ${num}`}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          className="btn-num btn-clear"
          onClick={() => handleSetNumber(0)}
          aria-label="Borrar número de la celda"
        >
          {language === 'es' ? 'Borrar' : 'Clear'}
        </button>
      </div>
    </div>
  );
};
