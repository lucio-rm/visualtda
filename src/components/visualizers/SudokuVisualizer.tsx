import React, { useMemo } from 'react';
import {
  generateSudokuTrace,
  SudokuStepData,
  DEFAULT_SUDOKU_BOARD
} from '../../engine/algorithms/sudokuTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './SudokuVisualizer.css';

export const SudokuVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateSudokuTrace(DEFAULT_SUDOKU_BOARD), []);

  const {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed
  } = useTraceTimeline<SudokuStepData>(timeline, {
    baseIntervalMs: 600,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const board = data?.board || DEFAULT_SUDOKU_BOARD;
  const fixed = data?.fixed || DEFAULT_SUDOKU_BOARD.map((row) => row.map((v) => v !== 0));
  const currentCell = data?.currentCell;
  const action = data?.action || 'INIT';
  const conflicts = data?.conflictingCells || [];
  const domainSizes = data?.domainSizes || Array.from({ length: 9 }, () => Array(9).fill(0));
  const exploredStates = data?.exploredStates ?? 0;
  const backtrackCount = data?.backtrackCount ?? 0;
  const description = data?.description;

  const filledCount = board.reduce((acc, row) => acc + row.filter((v) => v !== 0).length, 0);

  const cellSize = 52;
  const boardWidth = cellSize * 9;

  return (
    <div className="sudoku-visualizer" role="region" aria-label={language === 'es' ? 'Visualizador de Sudoku con Backtracking y MRV' : 'Sudoku Visualizer with Backtracking and MRV'}>
      {/* Metrics Row */}
      <div className="sdk-metrics-row">
        <div className="sdk-metric-badge">
          <span>{language === 'es' ? 'Celdas asignadas:' : 'Assigned cells:'}</span>
          <strong>{filledCount} / 81</strong>
        </div>
        <div className="sdk-metric-badge">
          <span>{language === 'es' ? 'Estados explorados:' : 'Explored states:'}</span>
          <strong>{exploredStates}</strong>
        </div>
        <div className="sdk-metric-badge">
          <span>{language === 'es' ? 'Retrocesos (Backtracks):' : 'Backtracks:'}</span>
          <strong>{backtrackCount}</strong>
        </div>
        <div className={`sdk-metric-badge sdk-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción actual:' : 'Current action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* SVG Board */}
      <div className="sdk-board-container">
        <svg
          viewBox={`-4 -4 ${boardWidth + 8} ${boardWidth + 8}`}
          className="sdk-svg-board"
          role="img"
          aria-label={language === 'es' ? 'Tablero 9x9 de Sudoku' : '9x9 Sudoku Board'}
        >
          {/* Background and Cells */}
          {board.map((row, r) =>
            row.map((val, c) => {
              const x = c * cellSize;
              const y = r * cellSize;
              const isFixed = fixed[r][c];
              const isCurrent = currentCell && currentCell[0] === r && currentCell[1] === c;
              const isConflict = conflicts.some(([cr, cc]) => cr === r && cc === c);
              const blockIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
              const isAltBlock = blockIndex % 2 === 1;

              let fillColor = isAltBlock ? 'var(--board-cell-dark)' : 'var(--board-cell-light)';
              let strokeColor = 'var(--board-border)';
              let strokeWidth = 1;

              if (isConflict) {
                fillColor = 'var(--board-conflict)';
                strokeColor = 'var(--danger, var(--error))';
                strokeWidth = 2;
              } else if (isCurrent) {
                fillColor = 'rgba(6, 182, 212, 0.25)';
                strokeColor = 'var(--accent)';
                strokeWidth = 2.5;
              }

              return (
                <g key={`cell-${r}-${c}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="sdk-cell-rect"
                  />
                  {val !== 0 ? (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 8}
                      textAnchor="middle"
                      fill={isFixed ? 'var(--board-text)' : 'var(--accent)'}
                      className="sdk-cell-text"
                      fontWeight={isFixed ? '800' : '600'}
                    >
                      {val}
                    </text>
                  ) : (
                    domainSizes[r]?.[c] > 0 && (
                      <text
                        x={x + cellSize - 6}
                        y={y + cellSize - 5}
                        textAnchor="end"
                        className="sdk-cell-domain"
                      >
                        {domainSizes[r][c]}
                      </text>
                    )
                  )}
                </g>
              );
            })
          )}

          {/* Bold 3x3 Block Grid Lines */}
          {[0, 1, 2, 3].map((b) => (
            <React.Fragment key={`grid-${b}`}>
              {/* Horizontal line */}
              <line
                x1={0}
                y1={b * cellSize * 3}
                x2={boardWidth}
                y2={b * cellSize * 3}
                stroke="var(--board-border-strong)"
                strokeWidth={b === 0 || b === 3 ? 3 : 2}
              />
              {/* Vertical line */}
              <line
                x1={b * cellSize * 3}
                y1={0}
                x2={b * cellSize * 3}
                y2={boardWidth}
                stroke="var(--board-border-strong)"
                strokeWidth={b === 0 || b === 3 ? 3 : 2}
              />
            </React.Fragment>
          ))}
        </svg>
      </div>

      {/* Description */}
      {description && (
        <div className="sdk-description-box" role="status" aria-live="polite">
          {language === 'es' ? description.es : description.en}
        </div>
      )}

      {/* Pruning & MRV Analysis Card (Section 24) */}
      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fuerza Bruta vs. Backtracking con Heurística MRV:' : 'Brute Force vs. Backtracking with MRV:'}</strong>{' '}
        {language === 'es'
          ? 'Una búsqueda exhaustiva ingenua que pruebe dígitos del 1 al 9 en las casillas vacías exploraría hasta 9⁵⁰ ≈ 10⁴⁷ estados. El algoritmo con Backtracking valida restricciones de fila, columna y cuadrante 3×3 inmediatamente, podando ramas inviables. Con la heurística MRV (Minimum Remaining Values), se selecciona siempre la casilla con menor dominio restante, provocando fallas tempranas en ramas sin salida y resolviendo el tablero con un número mínimo de retrocesos.'
          : 'Naive brute force across ~50 empty cells would test 9⁵⁰ ≈ 10⁴⁷ states. Backtracking checks row, column, and box constraints immediately. With MRV (Minimum Remaining Values), choosing the cell with smallest remaining domain causes rapid failures on dead ends, solving the board with minimal backtracks.'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-toolbar" role="toolbar" aria-label="Controles de línea de tiempo">
        <div className="timeline-nav-group">
          <button
            type="button"
            className="ctrl-btn"
            onClick={reset}
            title={language === 'es' ? 'Reiniciar (R)' : 'Reset (R)'}
            aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
          >
            ↺
          </button>
          <button
            type="button"
            className="ctrl-btn"
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            title={language === 'es' ? 'Paso anterior (←)' : 'Step backward (←)'}
            aria-label={language === 'es' ? 'Paso anterior' : 'Step backward'}
          >
            ←
          </button>
          <button
            type="button"
            className={`ctrl-btn ctrl-play-btn ${isPlaying ? 'is-playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="ctrl-btn"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title={language === 'es' ? 'Paso siguiente (→)' : 'Step forward (→)'}
            aria-label={language === 'es' ? 'Paso siguiente' : 'Step forward'}
          >
            →
          </button>
        </div>

        <div className="timeline-scrubber-group">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="scrubber-slider"
            aria-label={language === 'es' ? 'Progreso de pasos del algoritmo' : 'Algorithm step progress'}
          />
          <span className="step-tag">
            {language === 'es' ? `Paso ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} / ${totalSteps}`}
          </span>
        </div>

        <div className="timeline-speed-group">
          <button
            type="button"
            className={`btn-speed ${playbackSpeed === 0.5 ? 'active' : ''}`}
            onClick={() => setSpeed(0.5)}
          >
            0.5x
          </button>
          <button
            type="button"
            className={`btn-speed ${playbackSpeed === 1 ? 'active' : ''}`}
            onClick={() => setSpeed(1)}
          >
            1x
          </button>
          <button
            type="button"
            className={`btn-speed ${playbackSpeed === 2 ? 'active' : ''}`}
            onClick={() => setSpeed(2)}
          >
            2x
          </button>
        </div>
      </div>
    </div>
  );
};
