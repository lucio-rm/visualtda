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
  const [showDomainSizes, setShowDomainSizes] = useState<boolean>(true);
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
    // Select first empty cell
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newBoard[r][c] === 0) {
          setSelectedCell([r, c]);
          return;
        }
      }
    }
  };

  // Precompute domain legal candidates for each empty cell
  const domainInfo = useMemo(() => {
    const ds: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
    const legalDigits: Record<string, number[]> = {};
    let minSize = 10;
    let bestCell: [number, number] | null = null;
    let totalEmpty = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          totalEmpty++;
          const valid: number[] = [];
          for (let d = 1; d <= 9; d++) {
            if (isValidSudokuCell(board, r, c, d)) valid.push(d);
          }
          ds[r][c] = valid.length;
          legalDigits[`${r},${c}`] = valid;

          if (valid.length > 0 && valid.length < minSize) {
            minSize = valid.length;
            bestCell = [r, c];
          }
        }
      }
    }

    return { domainSizes: ds, legalDigits, bestCell, minSize, totalEmpty };
  }, [board]);

  const selectedValue = selectedCell ? board[selectedCell[0]][selectedCell[1]] : 0;

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
          ? `La celda (${r + 1}, ${c + 1}) es una pista fija e inmutable del puzzle inicial.`
          : `Cell (${r + 1}, ${c + 1}) is a fixed initial clue.`
      );
      return;
    }

    if (num !== 0 && !isValidSudokuCell(board, r, c, num)) {
      setConflictMsg(
        language === 'es'
          ? `Restricción violada: el dígito ${num} ya se encuentra presente en la fila ${r + 1}, columna ${c + 1} o en el cuadrante 3×3 correspondiente.`
          : `Constraint violated: digit ${num} already present in row ${r + 1}, column ${c + 1} or 3x3 block.`
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
          ? '¡Asignación completa y factible! Todas las restricciones de fila, columna y bloque 3×3 se satisfacen.'
          : 'Complete feasible assignment! All row, column, and 3x3 block constraints satisfied.'
      );
      markAttempted('sudoku-backtracking');
    }
  };

  const handleStepMRV = () => {
    if (!domainInfo.bestCell) {
      setConflictMsg(
        language === 'es'
          ? 'No hay celdas vacías o existe un callejón sin salida (dominio vacío).'
          : 'No empty cells or a dead-end exists (empty domain).'
      );
      return;
    }
    const [r, c] = domainInfo.bestCell;
    const valid = domainInfo.legalDigits[`${r},${c}`];
    if (valid && valid.length > 0) {
      setSelectedCell([r, c]);
      handleSetNumber(valid[0]);
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
          ? 'Solución completa hallada mediante Backtracking sistemático con poda MRV (Minimum Remaining Values).'
          : 'Complete solution found via systematic Backtracking with MRV pruning.'
      );
      markAttempted('sudoku-backtracking');
    } else {
      setConflictMsg(
        language === 'es'
          ? 'No existe solución válida para la configuración actual de números (inconsistencia).'
          : 'No valid solution exists for current configuration.'
      );
    }
  };

  const cellSize = 44;
  const boardWidth = cellSize * 9;

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio Interactivo de Sudoku">
      {/* Top Presets and Controls */}
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
            {language === 'es' ? 'Tablero Vacío (Caso Propio)' : 'Empty Board (Custom)'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={() => setShowDomainSizes(!showDomainSizes)}
            style={{ color: showDomainSizes ? 'var(--accent)' : 'inherit' }}
          >
            {showDomainSizes
              ? (language === 'es' ? 'Ocultar Opciones (MRV)' : 'Hide Options (MRV)')
              : (language === 'es' ? 'Mostrar Opciones (MRV)' : 'Show Options (MRV)')}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleStepMRV}
            disabled={!domainInfo.bestCell || domainInfo.totalEmpty === 0}
            title={language === 'es' ? 'Avanzar 1 paso con la variable más restringida' : 'Step 1 move with most constrained variable'}
            style={{ color: '#10b981', borderColor: '#10b981', fontWeight: 600 }}
          >
            ★ {language === 'es' ? 'Paso MRV' : 'Step MRV'}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleSolveWithBacktracking}
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            ⚡ {language === 'es' ? 'Resolver con Backtracking' : 'Solve with Backtracking'}
          </button>
        </div>
      </div>

      {/* Status Bar */}
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
          border: '1px solid var(--border)',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Celdas vacías restantes:' : 'Remaining empty cells:'}{' '}
          <strong style={{ color: 'var(--text)' }}>{domainInfo.totalEmpty} / 81</strong>
        </span>

        {domainInfo.bestCell && domainInfo.totalEmpty > 0 && (
          <span style={{ color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Variable más restringida (MRV):' : 'Most constrained variable (MRV):'}{' '}
            <strong style={{ color: '#10b981' }}>
              Fila {domainInfo.bestCell[0] + 1}, Col {domainInfo.bestCell[1] + 1} ({domainInfo.minSize} opciones)
            </strong>
          </span>
        )}

        {selectedCell && (
          <span style={{ color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Celda seleccionada:' : 'Selected cell:'}{' '}
            <strong>({selectedCell[0] + 1}, {selectedCell[1] + 1})</strong>
          </span>
        )}
      </div>

      {conflictMsg && <div className="sdk-conflict-banner" role="alert">{conflictMsg}</div>}
      {solvedMessage && <div className="sdk-success-banner" role="status">{solvedMessage}</div>}

      {/* SVG Board */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox={`-8 -8 ${boardWidth + 16} ${boardWidth + 16}`}
          style={{ maxWidth: '440px', width: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}
          role="img"
          aria-label="Tablero de Sudoku interactivo con heurística MRV"
        >
          {board.map((row, r) =>
            row.map((val, c) => {
              const x = c * cellSize;
              const y = r * cellSize;
              const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;
              const isFixed = fixedCells[r][c] && activePreset !== 'empty';
              const isMRVBest =
                domainInfo.bestCell &&
                domainInfo.bestCell[0] === r &&
                domainInfo.bestCell[1] === c &&
                val === 0;

              // Constraint crosshair highlight (same row, col, or 3x3 block)
              const isInSelectedRow = selectedCell && selectedCell[0] === r;
              const isInSelectedCol = selectedCell && selectedCell[1] === c;
              const isInSelectedBlock =
                selectedCell &&
                Math.floor(selectedCell[0] / 3) === Math.floor(r / 3) &&
                Math.floor(selectedCell[1] / 3) === Math.floor(c / 3);
              const isCrosshair = (isInSelectedRow || isInSelectedCol || isInSelectedBlock) && !isSelected;

              // Same number highlight
              const isSameNum = selectedValue > 0 && val === selectedValue && !isSelected;

              const blockIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
              const isAltBlock = blockIndex % 2 === 1;

              let fill = isAltBlock ? 'var(--surface-hover)' : 'var(--surface)';
              let stroke = 'var(--border)';
              let strokeWidth = 1;

              if (isCrosshair) {
                fill = isAltBlock ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)';
              }

              if (isSameNum) {
                fill = 'rgba(56, 189, 248, 0.2)';
              }

              if (isMRVBest) {
                fill = 'rgba(16, 185, 129, 0.2)';
                stroke = '#10b981';
                strokeWidth = 2;
              }

              if (isSelected) {
                fill = 'rgba(99, 102, 241, 0.3)';
                stroke = 'var(--accent, #6366f1)';
                strokeWidth = 2.5;
              }

              const domainSize = domainInfo.domainSizes[r]?.[c] ?? 0;

              return (
                <g
                  key={`cell-pg-${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{ cursor: 'pointer' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Fila ${r + 1}, Columna ${c + 1}, Valor ${val || 'vacío'}${
                    val === 0 ? `, ${domainSize} candidatos válidos` : ''
                  }`}
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
                      fill={isFixed ? 'var(--text)' : 'var(--accent)'}
                      fontFamily="var(--font-mono)"
                      fontSize="20px"
                      fontWeight={isFixed ? '800' : '600'}
                    >
                      {val}
                    </text>
                  ) : (
                    showDomainSizes && (
                      <g>
                        <text
                          x={x + cellSize - 5}
                          y={y + cellSize - 4}
                          textAnchor="end"
                          fill={domainSize === 1 ? '#10b981' : domainSize === 0 ? '#ef4444' : 'var(--text-muted)'}
                          fontFamily="var(--font-mono)"
                          fontSize="10px"
                          fontWeight={domainSize <= 2 ? '800' : '400'}
                          opacity={0.8}
                        >
                          {domainSize}
                        </text>
                        {isMRVBest && (
                          <text
                            x={x + 5}
                            y={y + 12}
                            fill="#10b981"
                            fontSize="9px"
                            fontWeight="800"
                            fontFamily="var(--font-mono)"
                          >
                            MRV
                          </text>
                        )}
                      </g>
                    )
                  )}
                </g>
              );
            })
          )}

          {/* 3x3 Block Grid Separators */}
          {[0, 1, 2, 3].map((b) => (
            <React.Fragment key={`grid-line-${b}`}>
              <line
                x1={0}
                y1={b * cellSize * 3}
                x2={boardWidth}
                y2={b * cellSize * 3}
                stroke="var(--text)"
                strokeWidth={b === 0 || b === 3 ? 3 : 2}
                opacity={0.65}
              />
              <line
                x1={b * cellSize * 3}
                y1={0}
                x2={b * cellSize * 3}
                y2={boardWidth}
                stroke="var(--text)"
                strokeWidth={b === 0 || b === 3 ? 3 : 2}
                opacity={0.65}
              />
            </React.Fragment>
          ))}
        </svg>
      </div>

      {/* Number Pad for Fast Tactile Input */}
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

      {/* Rationale Callout: Minimum Remaining Values */}
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
          {language === 'es' ? 'Fundamento: Heurística MRV (Minimum Remaining Values)' : 'Rationale: MRV Heuristic'}
        </strong>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--text-muted)' }}>
          {language === 'es'
            ? 'En problemas de satisfacción de restricciones (CSP), la heurística MRV selecciona siempre la variable libre que cuenta con la menor cantidad de valores válidos en su dominio (marcada con "MRV"). Esta estrategia minimiza el factor de ramificación del árbol de búsqueda y detecta contradicciones mucho antes (fallo temprano), logrando podar ramas infructuosas antes de explorarlas.'
            : 'In Constraint Satisfaction Problems (CSP), the MRV heuristic always chooses the unassigned variable with the fewest legal values remaining in its domain (marked "MRV"). This minimizes the branching factor and catches contradictions early, pruning dead subtrees before exploration.'}
        </p>
      </div>
    </div>
  );
};
