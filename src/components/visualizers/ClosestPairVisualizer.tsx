import React, { useMemo } from 'react';
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
          {splitX !== null && splitX !== undefined && delta < 500 && (
            <rect
              x={Math.max(0, splitX - delta)}
              y={0}
              width={Math.min(500, delta * 2)}
              height={280}
              fill="rgba(56, 189, 248, 0.08)"
              stroke="rgba(56, 189, 248, 0.25)"
              strokeDasharray="4 4"
            />
          )}

          {/* Vertical dividing line */}
          {splitX !== null && splitX !== undefined && (
            <g>
              <line
                x1={splitX}
                y1={0}
                x2={splitX}
                y2={280}
                stroke="var(--accent, #6366f1)"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <text x={splitX + 6} y={20} fill="var(--accent, #6366f1)" fontSize="11px" fontFamily="var(--font-mono)" fontWeight="700">
                x = {splitX}
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
              stroke="#10b981"
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
              stroke="#f59e0b"
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
              fill = '#10b981';
              stroke = '#059669';
              r = 9;
            } else if (inStrip) {
              fill = '#38bdf8';
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
                  fontSize="11px"
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

      {/* 2D Strip Packing Lemma Explanation (Section 12 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento: Lema de Empaquetamiento en la Franja δ:' : 'Rationale: δ-Strip Packing Lemma:'}</strong>{' '}
        {language === 'es'
          ? 'En lugar de comparar todos los pares en la franja central (lo que costaría O(n²)), el lema de empaquetamiento demuestra que ninguna caja de dimensiones δ × 2δ puede contener más de 8 puntos sin violar que dos puntos del mismo lado disten al menos δ. Por tanto, al ordenar la franja por coordenada y, cada punto solo debe compararse con los siguientes 7 puntos contiguos, combinando las soluciones en O(n) lineal y logrando T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'
          : 'Instead of comparing all pairs in the strip (O(n²)), the packing lemma proves that no δ × 2δ box can contain more than 8 points without violating the left/right minimal distance δ. Sorting the strip by y-coordinate allows each point to be compared against at most the next 7 points, yielding linear O(n) combine time and T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'}
      </div>

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
            aria-label={language === 'es' ? 'Progreso de pasos de Par Más Cercano' : 'Closest pair step progress'}
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
