import React, { useMemo } from 'react';
import {
  generateKnightsTourTrace,
  KnightsTourStepData
} from '../../engine/algorithms/knightsTourTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import { ChessKnightIcon } from './KnightsTourPlayground';
import './KnightsTourVisualizer.css';

export const KnightsTourVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const [boardN, setBoardN] = React.useState<number>(5);

  const timeline = useMemo(() => generateKnightsTourTrace(boardN), [boardN]);

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
  } = useTraceTimeline<KnightsTourStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const n = data?.n ?? 5;
  const board = data?.board || Array.from({ length: n }, () => Array(n).fill(-1));
  const currentPos = data?.currentPos;
  const path = data?.path || [];
  const action = data?.action || 'INIT';
  const candidates = data?.candidates || [];
  const stepCount = data?.stepCount ?? 0;
  const backtrackCount = data?.backtrackCount ?? 0;
  const description = data?.description;

  const cellSize = 64;
  const boardSize = cellSize * n;

  // Path polyline coordinates
  const polylinePoints = path
    .map(([r, c]) => `${c * cellSize + cellSize / 2},${r * cellSize + cellSize / 2}`)
    .join(' ');

  return (
    <div className="knights-tour-visualizer" role="region" aria-label={language === 'es' ? 'Visualizador del Recorrido del Caballo' : "Knight's Tour Visualizer"}>
      {/* Board Size Selector */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Dimensiones del Tablero:' : 'Board Dimensions:'}
        </span>
        {[4, 5, 6, 8].map((size) => (
          <button
            key={size}
            type="button"
            className={`btn-ctrl ${boardN === size ? 'active' : ''}`}
            style={{
              padding: '0.25rem 0.65rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: boardN === size ? 'var(--accent)' : 'var(--surface)',
              color: boardN === size ? 'var(--accent-contrast)' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)'
            }}
            onClick={() => setBoardN(size)}
          >
            {size}×{size}
          </button>
        ))}
      </div>

      {/* Metrics Row */}
      <div className="kt-metrics-row">
        <div className="kt-metric-badge">
          <span>{language === 'es' ? 'Casillas visitadas:' : 'Visited squares:'}</span>
          <strong>{stepCount} / {n * n}</strong>
        </div>
        <div className="kt-metric-badge">
          <span>{language === 'es' ? 'Retrocesos (Backtracks):' : 'Backtracks:'}</span>
          <strong>{backtrackCount}</strong>
        </div>
        <div className={`kt-metric-badge kt-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción actual:' : 'Current action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* SVG Board */}
      <div className="kt-board-container">
        <svg
          viewBox={`-20 -20 ${boardSize + 40} ${boardSize + 40}`}
          className="kt-svg-board"
          role="img"
          aria-label={language === 'es' ? 'Tablero del recorrido del caballo' : "Knight's tour board"}
        >
          {/* Outer Framing Bezel */}
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
              key={`kt-col-${c}`}
              x={c * cellSize + cellSize / 2}
              y={-6}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="12px"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {String.fromCharCode(65 + c)}
            </text>
          ))}

          {/* Coordinate labels: Row Numbers (1, 2, 3...) */}
          {Array.from({ length: n }).map((_, r) => (
            <text
              key={`kt-row-${r}`}
              x={-8}
              y={r * cellSize + cellSize / 2 + 4}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="12px"
              fontFamily="var(--font-mono)"
              fontWeight="600"
            >
              {n - r}
            </text>
          ))}

          {/* Squares */}
          {board.map((row, r) =>
            row.map((val, c) => {
              const x = c * cellSize;
              const y = r * cellSize;
              const isDark = (r + c) % 2 === 1;
              const isCurrent = currentPos && currentPos[0] === r && currentPos[1] === c;
              const isVisited = val !== -1;
              const cand = candidates.find((cand) => cand.r === r && cand.c === c);

              let fill = isDark ? 'var(--board-cell-dark)' : 'var(--board-cell-light)';
              let stroke = 'var(--board-border)';
              let strokeWidth = 1.5;

              if (isCurrent) {
                fill = isDark ? 'var(--board-cell-dark)' : 'var(--board-cell-light)';
                stroke = 'var(--accent)';
                strokeWidth = 3;
              } else if (cand) {
                fill = isDark ? 'var(--board-cell-dark)' : 'var(--board-cell-light)';
                stroke = 'var(--accent)';
                strokeWidth = 2.5;
              }

              return (
                <g key={`sq-${r}-${c}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />

                  {/* Candidate target marker */}
                  {cand && !isVisited && (
                    <g pointerEvents="none">
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2}
                        r={cellSize * 0.22}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={2}
                        strokeDasharray="3 2"
                        opacity={0.9}
                      />
                      <circle
                        cx={x + cellSize / 2}
                        cy={y + cellSize / 2}
                        r={cellSize * 0.09}
                        fill="var(--accent)"
                      />
                    </g>
                  )}

                  {isVisited && (
                    <circle
                      cx={x + cellSize / 2}
                      cy={y + cellSize / 2}
                      r={18}
                      fill="rgba(99, 102, 241, 0.25)"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                    />
                  )}
                  {isVisited && (
                    <text
                      x={x + cellSize / 2}
                      y={y + cellSize / 2 + 5}
                      textAnchor="middle"
                      fill={isDark ? '#f8fafc' : '#0f172a'}
                      fontFamily="var(--font-mono)"
                      fontSize="14px"
                      fontWeight="700"
                    >
                      {val + 1}
                    </text>
                  )}
                  {cand && (
                    <text
                      x={x + cellSize - 6}
                      y={y + 14}
                      textAnchor="end"
                      fill="var(--success)"
                      fontFamily="var(--font-mono)"
                      fontSize="13px"
                      fontWeight="700"
                    >
                      <title>Grado de Warnsdorff</title>
                      deg:{cand.degree}
                    </text>
                  )}
                </g>
              );
            })
          )}


          {/* Polyline trajectory of visited path */}
          {path.length > 1 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}

          {/* Knight Icon at Current Pos */}
          {currentPos && (
            <g
              transform={`translate(${currentPos[1] * cellSize + (cellSize - 30) / 2}, ${currentPos[0] * cellSize + (cellSize - 30) / 2})`}
              pointerEvents="none"
            >
              <ChessKnightIcon size={30} fill="var(--accent)" stroke="#ffffff" />
            </g>
          )}
        </svg>
      </div>

      {/* Description */}
      {description && (
        <div className="kt-description-box" role="status" aria-live="polite">
          {language === 'es' ? description.es : description.en}
        </div>
      )}

      {/* Warnsdorff Pruning Analysis Card (Section 24) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fuerza Bruta vs. Regla de Warnsdorff:' : 'Brute Force vs. Warnsdorff Heuristic:'}</strong>{' '}
        {language === 'es'
          ? `En un tablero ${n}×${n}, el caballo dispone de hasta 8 movimientos en L por casilla. Un árbol exhaustivo sin guía colapsa en un espacio de búsqueda astronómico. La heurística de Warnsdorff ordena los saltos candidatos por grado de accesibilidad creciente (priorizando casillas periféricas con menos salidas libres), reduciendo los retrocesos a prácticamente cero y resolviendo el recorrido eficientemente.`
          : `On an ${n}×${n} board, the knight has up to 8 moves per square. An unguided search tree explodes exponentially. Warnsdorff heuristic sorts moves by increasing forward degree (prioritizing hard-to-reach corner squares first), reducing backtracks to near zero.`}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-toolbar" role="toolbar" aria-label={language === 'es' ? 'Controles de línea de tiempo' : 'Timeline controls'}>
        <div className="timeline-nav-group">
          <button
            type="button"
            className="ctrl-btn"
            onClick={reset}
            title={language === 'es' ? 'Reiniciar' : 'Reset'}
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
            aria-label={language === 'es' ? 'Progreso de pasos del caballo' : "Knight's tour step progress"}
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
