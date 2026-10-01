import React, { useMemo } from 'react';
import {
  generateSegmentedLeastSquaresTrace,
  SegmentedLeastSquaresStepData,
  DEFAULT_SLS_POINTS
} from '../../engine/algorithms/segmentedLeastSquaresTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './SegmentedLeastSquaresVisualizer.css';

export const SegmentedLeastSquaresVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateSegmentedLeastSquaresTrace(DEFAULT_SLS_POINTS, 3.5), []);

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
  } = useTraceTimeline<SegmentedLeastSquaresStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const points = data?.points || DEFAULT_SLS_POINTS;
  const costC = data?.costC ?? 3.5;
  const currentJ = data?.currentJ ?? 0;
  const currentI = data?.currentI ?? 0;
  const opt = data?.opt || [];
  const segments = data?.optimalSegments || [];
  const action = data?.action || 'INIT';
  const description = data?.description;

  // Coordinate scales for SVG
  const svgWidth = 560;
  const svgHeight = 240;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;

  const minX = 0;
  const maxX = 11;
  const minY = 0;
  const maxY = 13;

  const scaleX = (x: number) => padLeft + ((x - minX) / (maxX - minX)) * (svgWidth - padLeft - padRight);
  const scaleY = (y: number) => svgHeight - padBottom - ((y - minY) / (maxY - minY)) * (svgHeight - padTop - padBottom);

  const colors = ['var(--accent)', 'var(--success)', 'var(--warning)', '#ec4899'];

  return (
    <div
      className="segmented-least-squares-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Mínimos Cuadrados Segmentados' : 'Segmented Least Squares Visualizer'}
    >
      {/* Metrics Row */}
      <div className="sls-metrics-row">
        <div className="sls-metric-badge">
          <span>{language === 'es' ? 'Penalización C:' : 'Penalty C:'}</span>
          <strong>{costC}</strong>
        </div>
        <div className="sls-metric-badge">
          <span>{language === 'es' ? 'Subproblema j:' : 'Subproblem j:'}</span>
          <strong>{currentJ} / {points.length}</strong>
        </div>
        <div className="sls-metric-badge">
          <span>{language === 'es' ? 'Segmentos Óptimos:' : 'Optimal Segments:'}</span>
          <strong>{segments.length}</strong>
        </div>
        <div className="sls-metric-badge sls-action-badge">
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Scatter & Line Plot */}
      <div className="sls-canvas-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', maxWidth: '560px', height: 'auto', display: 'block' }}
          role="img"
          aria-label={language === 'es' ? 'Gráfico de puntos y líneas ajustadas' : 'Points and fitted lines chart'}
        >
          {/* Axes */}
          <line
            x1={padLeft}
            y1={scaleY(0)}
            x2={svgWidth - padRight}
            y2={scaleY(0)}
            stroke="var(--border)"
            strokeWidth={1.5}
          />
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={scaleY(0)}
            stroke="var(--border)"
            strokeWidth={1.5}
          />

          {/* Grid ticks */}
          {[0, 2, 4, 6, 8, 10].map((tx) => (
            <text
              key={`tx-${tx}`}
              x={scaleX(tx)}
              y={scaleY(0) + 16}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="13px"
              fontFamily="var(--font-mono)"
            >
              {tx}
            </text>
          ))}
          {[0, 4, 8, 12].map((ty) => (
            <text
              key={`ty-${ty}`}
              x={padLeft - 10}
              y={scaleY(ty) + 4}
              textAnchor="end"
              fill="var(--text-muted)"
              fontSize="13px"
              fontFamily="var(--font-mono)"
            >
              {ty}
            </text>
          ))}

          {/* Fitted Line Segments */}
          {segments.map((seg, sIdx) => {
            const pStart = points[seg.startIndex];
            const pEnd = points[seg.endIndex];
            const x1 = pStart.x;
            const y1 = seg.a * x1 + seg.b;
            const x2 = pEnd.x;
            const y2 = seg.a * x2 + seg.b;
            const color = colors[sIdx % colors.length];

            return (
              <g key={`seg-${sIdx}`}>
                <line
                  x1={scaleX(x1)}
                  y1={scaleY(y1)}
                  x2={scaleX(x2)}
                  y2={scaleY(y2)}
                  stroke={color}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Data Points */}
          {points.map((p, idx) => {
            const inCurrentEval = idx >= currentI - 1 && idx <= currentJ - 1;

            return (
              <g key={p.id}>
                <circle
                  cx={scaleX(p.x)}
                  cy={scaleY(p.y)}
                  r={inCurrentEval ? 6 : 4.5}
                  fill={inCurrentEval ? 'var(--accent)' : 'var(--text)'}
                  stroke="#0f172a"
                  strokeWidth={1.5}
                />
                <text
                  x={scaleX(p.x)}
                  y={scaleY(p.y) - 8}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="13px"
                  fontFamily="var(--font-mono)"
                >
                  p{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 1D DP Array Display: OPT[j] */}
      <div style={{ overflowX: 'auto' }}>
        <table className="sls-dp-table">
          <thead>
            <tr>
              <th>j</th>
              {Array.from({ length: points.length + 1 }).map((_, j) => (
                <th
                  key={`th-${j}`}
                  style={{
                    backgroundColor: j === currentJ ? 'var(--state-active-bg)' : undefined,
                    color: j === currentJ ? 'var(--accent)' : undefined
                  }}
                >
                  {j}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontWeight: '600' }}>OPT[j]</td>
              {Array.from({ length: points.length + 1 }).map((_, j) => (
                <td
                  key={`td-${j}`}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: j === currentJ ? '700' : '400',
                    backgroundColor: j === currentJ ? 'var(--state-active-bg)' : undefined
                  }}
                >
                  {j < opt.length ? opt[j] : '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* DP Recurrence & Penalty Trade-Off Card (Section 12, 25 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Recurrencia DP y Balance de Penalización C:' : 'DP Recurrence & Penalty Trade-Off C:'}</strong>{' '}
        {language === 'es'
          ? 'Para minimizar el error cuadrático acumulado más la penalización c por segmento: OPT(j) = min_{1 ≤ i ≤ j} (e_{i, j} + c + OPT(i-1)). El último segmento comienza forzosamente en algún punto i y termina en j. Al variar el hiperparámetro c se controla el balance entre ajuste preciso (sobreajuste con c bajo) y parsimonia del modelo (pocos segmentos con c alto). Tiempo de llenado de tabla: O(n²).'
          : 'To minimize cumulative squared error plus per-segment penalty c: OPT(j) = min_{1 ≤ i ≤ j} (e_{i, j} + c + OPT(i-1)). The final segment necessarily begins at some index i and ends at j. Hyperparameter c balances precision against parsimony, avoiding overfitting. DP table filling runs in O(n²).'}
      </div>

      {/* Playback Controls */}
      <div className="trace-controls" role="toolbar" aria-label={language === 'es' ? 'Controles de reproducción' : 'Playback controls'}>
        <div className="trace-buttons">
          <button
            type="button"
            className="btn-control"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar visualización' : 'Reset visualization'}
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-control btn-play"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            aria-label={language === 'es' ? 'Siguiente paso' : 'Next step'}
          >
            →
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
