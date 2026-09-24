import React, { useMemo } from 'react';
import {
  generateMajorityElementTrace,
  MajorityElementStepData,
  DEFAULT_MAJORITY_ARRAY
} from '../../engine/algorithms/majorityElementTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './MajorityElementVisualizer.css';

export const MajorityElementVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateMajorityElementTrace(DEFAULT_MAJORITY_ARRAY), []);

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
  } = useTraceTimeline<MajorityElementStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const array = data?.array || DEFAULT_MAJORITY_ARRAY;
  const left = data?.left ?? 0;
  const right = data?.right ?? array.length - 1;
  const mid = data?.mid;
  const candLeft = data?.candLeft;
  const candRight = data?.candRight;
  const countLeft = data?.countLeft ?? 0;
  const countRight = data?.countRight ?? 0;
  const threshold = data?.threshold ?? Math.floor(array.length / 2);
  const winner = data?.winner;
  const action = data?.action || 'INIT';
  const description = data?.description;

  const cellWidth = 48;
  const cellHeight = 44;
  const svgWidth = Math.max(500, array.length * cellWidth + 60);
  const svgHeight = 180;
  const startX = (svgWidth - array.length * cellWidth) / 2;
  const startY = 40;

  return (
    <div
      className="majority-element-visualizer"
      role="region"
      aria-label="Visualizador del Elemento Mayoritario"
    >
      {/* Metrics Row */}
      <div className="me-metrics-row">
        <div className="me-metric-badge">
          <span>{language === 'es' ? 'Rango Activo:' : 'Active Range:'}</span>
          <strong>[{left} .. {right}]</strong>
        </div>
        <div className="me-metric-badge">
          <span>{language === 'es' ? 'Umbral (> n/2):' : 'Threshold (> n/2):'}</span>
          <strong>&gt; {threshold}</strong>
        </div>
        <div className="me-metric-badge">
          <span>{language === 'es' ? 'Ganador Actual:' : 'Current Winner:'}</span>
          <strong style={{ color: winner !== null && winner !== undefined ? '#10b981' : '#f59e0b' }}>
            {winner !== null && winner !== undefined ? winner : language === 'es' ? 'Ninguno' : 'None'}
          </strong>
        </div>
        <div className="me-metric-badge me-action-badge">
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Canvas */}
      <div className="me-canvas-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', maxWidth: `${svgWidth}px`, height: 'auto', display: 'block' }}
          role="img"
          aria-label="Arreglo de elementos y división recursiva"
        >
          {/* Active Range Highlight Box */}
          <rect
            x={startX + left * cellWidth - 4}
            y={startY - 6}
            width={(right - left + 1) * cellWidth + 8}
            height={cellHeight + 12}
            rx={8}
            fill="rgba(56, 189, 248, 0.08)"
            stroke="var(--accent)"
            strokeWidth={2}
            strokeDasharray="4,2"
          />

          {/* Midpoint dividing line */}
          {mid !== null && mid !== undefined && (
            <line
              x1={startX + (mid + 1) * cellWidth}
              y1={startY - 14}
              x2={startX + (mid + 1) * cellWidth}
              y2={startY + cellHeight + 20}
              stroke="#f59e0b"
              strokeWidth={3}
            />
          )}

          {/* Array Cells */}
          {array.map((val, idx) => {
            const x = startX + idx * cellWidth;
            const inActiveRange = idx >= left && idx <= right;
            const isWinner = winner !== null && winner !== undefined && val === winner && inActiveRange;

            return (
              <g key={`cell-${idx}`}>
                <rect
                  x={x}
                  y={startY}
                  width={cellWidth - 4}
                  height={cellHeight}
                  rx={4}
                  fill={
                    isWinner
                      ? 'rgba(16, 185, 129, 0.25)'
                      : inActiveRange
                      ? 'var(--surface-active, rgba(255,255,255,0.06))'
                      : 'var(--bg)'
                  }
                  stroke={isWinner ? '#10b981' : inActiveRange ? 'var(--border)' : 'var(--border-muted, rgba(255,255,255,0.08))'}
                  strokeWidth={isWinner ? 2 : 1}
                />
                <text
                  x={x + (cellWidth - 4) / 2}
                  y={startY + cellHeight / 2 + 5}
                  textAnchor="middle"
                  fill={inActiveRange ? 'var(--text)' : 'var(--text-muted)'}
                  fontSize="16px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {val}
                </text>
                {/* Index label below */}
                <text
                  x={x + (cellWidth - 4) / 2}
                  y={startY + cellHeight + 16}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="10px"
                  fontFamily="var(--font-mono)"
                >
                  [{idx}]
                </text>
              </g>
            );
          })}

          {/* Subproblem Candidate annotations */}
          {candLeft !== null && candLeft !== undefined && (
            <text
              x={startX + left * cellWidth + 6}
              y={startY + cellHeight + 36}
              fill="#38bdf8"
              fontSize="11px"
              fontWeight="600"
              fontFamily="var(--font-mono)"
            >
              CandIzq: {candLeft} {countLeft > 0 ? `(${countLeft}x)` : ''}
            </text>
          )}

          {candRight !== null && candRight !== undefined && (
            <text
              x={startX + (mid !== null && mid !== undefined ? (mid + 1) * cellWidth + 6 : (left + 1) * cellWidth)}
              y={startY + cellHeight + 36}
              fill="#ec4899"
              fontSize="11px"
              fontWeight="600"
              fontFamily="var(--font-mono)"
            >
              CandDer: {candRight} {countRight > 0 ? `(${countRight}x)` : ''}
            </text>
          )}
        </svg>
      </div>

      {/* Playback Controls */}
      <div className="trace-controls" role="toolbar" aria-label="Controles de reproducción">
        <div className="trace-buttons">
          <button
            type="button"
            className="btn-control"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar visualización' : 'Reset visualization'}
          >
            ⏮
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ⏪
          </button>
          <button
            type="button"
            className="btn-control btn-play"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            aria-label={language === 'es' ? 'Siguiente paso' : 'Next step'}
          >
            ⏩
          </button>
        </div>

        <div className="trace-scrubber">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            aria-label={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
          />
          <span className="step-counter">
            {language === 'es' ? 'Paso' : 'Step'} {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="trace-speed">
          <span>{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => setSpeed(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
