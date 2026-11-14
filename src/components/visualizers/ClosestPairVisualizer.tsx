import React, { useMemo } from 'react';
import { TraceScrubber } from '../TraceScrubber';
import {
  generateClosestPairTrace,
  ClosestPairStepData,
  DEFAULT_CLOSEST_PAIR_POINTS
} from '../../engine/algorithms/closestPairTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './ClosestPairVisualizer.css';

export const ClosestPairVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateClosestPairTrace(DEFAULT_CLOSEST_PAIR_POINTS), []);

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
  } = useTraceTimeline<ClosestPairStepData>(timeline, {
    baseIntervalMs: 700,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const points = data?.points || DEFAULT_CLOSEST_PAIR_POINTS;
  const splitX = data?.splitX;
  const delta = data?.delta ?? Infinity;
  const bestPair = data?.bestPair;
  const stripPoints = data?.stripPoints || [];
  const activePair = data?.activePair;
  const action = data?.action || 'INIT';
  const description = data?.description;

  return (
    <div className="closest-pair-visualizer" role="region" aria-label={language === 'es' ? 'Visualizador de Par Más Cercano 2D' : 'Closest Pair 2D Visualizer'}>
      {/* Metrics Row */}
      <div className="cp-metrics-row">
        <div className="cp-metric-badge">
          <span>{language === 'es' ? 'Distancia mínima (δ):' : 'Minimal distance (δ):'}</span>
          <strong>{delta === Infinity ? '∞' : delta}</strong>
        </div>
        <div className="cp-metric-badge">
          <span>{language === 'es' ? 'Mejor par actual:' : 'Current best pair:'}</span>
          <strong>{bestPair ? `${bestPair[0].id} — ${bestPair[1].id}` : (language === 'es' ? 'Ninguno' : 'None')}</strong>
        </div>
        <div className={`cp-metric-badge cp-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción actual:' : 'Action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="cp-canvas-container">
        <svg
          viewBox="0 0 500 280"
          className="cp-svg-canvas"
          role="img"
          aria-label={language === 'es' ? 'Plano 2D de puntos para par más cercano' : '2D point plane for closest pair'}
        >
          {/* Delta-Strip rectangle */}
          {/* Delta-Strip rectangle with δ/2 columns */}
          {splitX !== null && splitX !== undefined && delta < 500 && (
            <g>
              <rect
                x={Math.max(0, splitX - delta)}
                y={0}
                width={Math.min(500, delta * 2)}
                height={280}
                fill="var(--state-active-bg)"
                stroke="var(--accent)"
                strokeOpacity={0.4}
                strokeDasharray="4 4"
              />
              {delta > 15 && (
                <>
                  <line
                    x1={splitX - delta / 2}
                    y1={0}
                    x2={splitX - delta / 2}
                    y2={280}
                    stroke="var(--accent)"
                    strokeOpacity={0.25}
                    strokeDasharray="2 3"
                  />
                  <line
                    x1={splitX + delta / 2}
                    y1={0}
                    x2={splitX + delta / 2}
                    y2={280}
                    stroke="var(--accent)"
                    strokeOpacity={0.25}
                    strokeDasharray="2 3"
                  />
                </>
              )}
            </g>
          )}

          {/* Vertical dividing line */}
          {splitX !== null && splitX !== undefined && (
            <g>
              <line
                x1={splitX}
                y1={0}
                x2={splitX}
                y2={280}
                stroke="var(--accent)"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <text x={splitX + 6} y={20} fill="var(--accent)" fontSize="13px" fontFamily="var(--font-mono)" fontWeight="700">
                x = {splitX} (L)
              </text>
            </g>
          )}

          {/* Connecting line for best pair */}
          {bestPair && (
            <line
              x1={bestPair[0].x}
              y1={bestPair[0].y}
              x2={bestPair[1].x}
              y2={bestPair[1].y}
              stroke="var(--success)"
              strokeWidth={3}
            />
          )}

          {/* Connecting line for active candidate pair */}
          {activePair && (
            <line
              x1={activePair[0].x}
              y1={activePair[0].y}
              x2={activePair[1].x}
              y2={activePair[1].y}
              stroke="var(--warning)"
              strokeWidth={2}
              strokeDasharray="3 3"
            />
          )}

          {/* Points */}
          {points.map((p) => {
            const isBest = bestPair && (bestPair[0].id === p.id || bestPair[1].id === p.id);
            const inStrip = stripPoints.some((sp) => sp.id === p.id);

            let fill = 'var(--surface, #0f172a)';
            let stroke = 'var(--border-strong, #64748b)';
            let r = 7;

            if (isBest) {
              fill = 'var(--success)';
              stroke = '#059669';
              r = 9;
            } else if (inStrip) {
              fill = 'var(--accent)';
              stroke = '#0284c7';
              r = 8;
            }

            return (
              <g key={`pt-${p.id}`}>
                <circle cx={p.x} cy={p.y} r={r} fill={fill} stroke={stroke} strokeWidth={2.5} />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="700"
                >
                  {p.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Description */}
      {description && (
        <div className="djk-description-box" role="status" aria-live="polite">
          {language === 'es' ? description.es : description.en}
        </div>
      )}

      {/* 2D Strip Packing Lemma & 15-Point Upper Bound Explanation */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.25rem' }}>
          {language === 'es' ? 'Fundamento: Lema de Celdas δ/2 y Empaquetamiento de 15 Puntos (Kleinberg-Tardos §5.4):' : 'Rationale: δ/2 Grid Lemma & 15-Point Upper Bound (Kleinberg-Tardos §5.4):'}
        </strong>
        {language === 'es'
          ? 'Particionando la franja 2δ en celdas cuadradas de δ/2 × δ/2, la distancia diagonal interna es δ/√2 ≈ 0.707δ < δ. Por hipótesis de inducción, cada celda contiene a lo sumo 1 punto. Una caja de inspección 2δ × 2δ alrededor de cualquier punto contiene 4×4 = 16 celdas, conteniendo a lo sumo 15 otros puntos. Cualquier punto 16 en orden de Y dista verticalmente más de δ, permitiendo combinar en tiempo lineal O(n) y garantizando T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'
          : 'Partitioning the 2δ strip into δ/2 × δ/2 square cells, each cell diagonal is δ/√2 ≈ 0.707δ < δ. By induction, each cell holds at most 1 point. A 2δ × 2δ inspection box contains 4×4 = 16 cells, hosting at most 15 other points. The 16th point onwards is guaranteed to be farther than δ vertically, achieving linear O(n) combine time and T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'}
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
          <TraceScrubber
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSeek={goToStep}
            language={language}
            showCounter={false}
            ariaLabel={language === 'es' ? 'Progreso de pasos de Par Más Cercano' : 'Closest pair step progress'}
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
