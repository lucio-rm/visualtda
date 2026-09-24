import React, { useMemo } from 'react';
import {
  generateKnightsTourTrace,
  KnightsTourStepData
} from '../../engine/algorithms/knightsTourTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './KnightsTourVisualizer.css';

export const KnightsTourVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateKnightsTourTrace(5), []);

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
    <div className="knights-tour-visualizer" role="region" aria-label="Visualizador del Recorrido del Caballo">
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
          viewBox={`-8 -8 ${boardSize + 16} ${boardSize + 16}`}
          className="kt-svg-board"
          role="img"
          aria-label={language === 'es' ? 'Tablero del recorrido del caballo' : "Knight's tour board"}
        >
          {/* Squares */}
          {board.map((row, r) =>
            row.map((val, c) => {
              const x = c * cellSize;
              const y = r * cellSize;
              const isDark = (r + c) % 2 === 1;
              const isCurrent = currentPos && currentPos[0] === r && currentPos[1] === c;
              const isVisited = val !== -1;
              const cand = candidates.find((cand) => cand.r === r && cand.c === c);

              let fill = isDark ? 'var(--surface-hover, #1e293b)' : 'var(--surface, #0f172a)';
              let stroke = 'var(--border, #334155)';
              let strokeWidth = 1;

              if (isCurrent) {
                fill = 'rgba(56, 189, 248, 0.3)';
                stroke = '#38bdf8';
                strokeWidth = 3;
              } else if (cand) {
                fill = 'rgba(16, 185, 129, 0.2)';
                stroke = '#10b981';
                strokeWidth = 2;
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
                  {isVisited && (
                    <circle
                      cx={x + cellSize / 2}
                      cy={y + cellSize / 2}
                      r={18}
                      fill="rgba(99, 102, 241, 0.25)"
                      stroke="var(--accent, #6366f1)"
                      strokeWidth={1.5}
                    />
                  )}
                  {isVisited && (
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
                  {cand && (
                    <text
                      x={x + cellSize - 6}
                      y={y + 14}
                      textAnchor="end"
                      fill="#10b981"
                      fontFamily="var(--font-mono)"
                      fontSize="11px"
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
              stroke="var(--accent, #38bdf8)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.8}
            />
          )}

          {/* Knight Icon at Current Pos */}
          {currentPos && (
            <g transform={`translate(${currentPos[1] * cellSize + cellSize / 2 - 12}, ${currentPos[0] * cellSize + cellSize / 2 - 12})`}>
              <text fontSize="24" textAnchor="middle" x="12" y="20">
                ♞
              </text>
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

      {/* Timeline Controls */}
      <div className="timeline-toolbar" role="toolbar" aria-label="Controles de línea de tiempo">
        <div className="timeline-nav-group">
          <button
            type="button"
            className="ctrl-btn"
            onClick={reset}
            title={language === 'es' ? 'Reiniciar' : 'Reset'}
            aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
          >
            ⏮
          </button>
          <button
            type="button"
            className="ctrl-btn"
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            title={language === 'es' ? 'Paso anterior' : 'Step backward'}
            aria-label={language === 'es' ? 'Paso anterior' : 'Step backward'}
          >
            ◀
          </button>
          <button
            type="button"
            className={`ctrl-btn ctrl-play-btn ${isPlaying ? 'is-playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            className="ctrl-btn"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title={language === 'es' ? 'Paso siguiente' : 'Step forward'}
            aria-label={language === 'es' ? 'Paso siguiente' : 'Step forward'}
          >
            ▶
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
            aria-label="Progreso de pasos del caballo"
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
