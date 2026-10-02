import React, { useMemo } from 'react';
import {
  generateMedianOfMediansTrace,
  MedianOfMediansStepData,
  DEFAULT_MOM_ARRAY
} from '../../engine/algorithms/medianOfMediansTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './MedianOfMediansVisualizer.css';

export const MedianOfMediansVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateMedianOfMediansTrace(DEFAULT_MOM_ARRAY, 7), []);

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
  } = useTraceTimeline<MedianOfMediansStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const k = data?.k ?? 7;
  const groups = data?.groups || [];
  const pivot = data?.pivot;
  const lesser = data?.lesser || [];
  const equal = data?.equal || [];
  const greater = data?.greater || [];
  const guaranteedElim = data?.guaranteedEliminatedCount ?? 0;
  const action = data?.action || 'INIT';
  const description = data?.description;

  const colWidth = 64;
  const cellHeight = 32;
  const numCols = Math.max(4, groups.length);
  const svgWidth = Math.max(450, numCols * colWidth + 80);
  const svgHeight = 230;

  return (
    <div
      className="median-of-medians-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Mediana de Medianas' : 'Median of Medians Visualizer'}
    >
      {/* Metrics Row */}
      <div className="mom-metrics-row">
        <div className="mom-metric-badge">
          <span>{language === 'es' ? 'Objetivo (k):' : 'Target (k):'}</span>
          <strong>{k} ({k + 1}° {language === 'es' ? 'menor' : 'smallest'})</strong>
        </div>
        <div className="mom-metric-badge">
          <span>{language === 'es' ? 'Grupos de 5:' : 'Groups of 5:'}</span>
          <strong>{groups.length}</strong>
        </div>
        <div className="mom-metric-badge">
          <span>{language === 'es' ? 'Pivote (p):' : 'Pivot (p):'}</span>
          <strong style={{ color: pivot !== null ? 'var(--warning)' : 'var(--text-muted)' }}>
            {pivot !== null ? pivot : '—'}
          </strong>
        </div>
        <div className="mom-metric-badge">
          <span>{language === 'es' ? 'Poda garantizada:' : 'Guaranteed Pruning:'}</span>
          <strong style={{ color: 'var(--success)' }}>≥ 30% ({guaranteedElim} elem.)</strong>
        </div>
        <div className="mom-metric-badge mom-action-badge">
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Canvas with groups of 5 matrix */}
      <div className="mom-canvas-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label={language === 'es' ? 'Matriz de grupos de 5 y fila de medianas' : 'Groups of 5 matrix and medians row'}
        >
          {/* Header text for columns */}
          {groups.map((_, colIdx) => (
            <text
              key={`col-hdr-${colIdx}`}
              x={40 + colIdx * colWidth + 24}
              y={22}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="13px"
              fontFamily="var(--font-mono)"
            >
              G{colIdx + 1}
            </text>
          ))}

          {/* Median Row Highlight Band (Row 2, 0-indexed) */}
          {groups.length > 0 && (
            <rect
              x={30}
              y={32 + 2 * (cellHeight + 4) - 2}
              width={numCols * colWidth + 20}
              height={cellHeight + 8}
              rx={6}
              fill="var(--state-active-bg)"
              stroke="var(--accent)"
              strokeWidth={1}
              strokeDasharray="4,2"
            />
          )}

          {/* Matrix Cells */}
          {groups.map((group, colIdx) => {
            const sorted = [...group.elements].sort((a, b) => a - b);
            return sorted.map((val, rowIdx) => {
              const x = 40 + colIdx * colWidth;
              const y = 32 + rowIdx * (cellHeight + 4);
              const isMedian = rowIdx === 2;
              const isPivot = pivot !== null && val === pivot;

              return (
                <g key={`cell-${colIdx}-${rowIdx}`}>
                  <rect
                    x={x}
                    y={y}
                    width={colWidth - 8}
                    height={cellHeight}
                    rx={4}
                    fill={
                      isPivot
                        ? 'var(--warning)'
                        : isMedian
                        ? 'var(--state-active-bg)'
                        : 'var(--surface)'
                    }
                    stroke={isPivot ? 'var(--warning)' : isMedian ? 'var(--accent)' : 'var(--border-strong)'}
                    strokeWidth={isPivot ? 2.5 : isMedian ? 2 : 1.5}
                  />
                  <text
                    x={x + (colWidth - 8) / 2}
                    y={y + cellHeight / 2 + 5}
                    textAnchor="middle"
                    fill={isPivot ? '#0f172a' : 'var(--text)'}
                    fontSize="13px"
                    fontWeight={isPivot || isMedian ? '700' : '400'}
                    fontFamily="var(--font-mono)"
                  >
                    {val}
                  </text>
                </g>
              );
            });
          })}
        </svg>
      </div>

      {/* 3-Way Partition Display */}
      {pivot !== null && (
        <div className="mom-partition-pills">
          <div className="mom-partition-box">
            <h4>
              <span>{language === 'es' ? 'Menores (< p)' : 'Lesser (< p)'}</span>
              <span style={{ color: 'var(--accent)' }}>{lesser.length}</span>
            </h4>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {lesser.length > 0 ? lesser.join(', ') : '∅'}
            </div>
          </div>

          <div className="mom-partition-box" style={{ borderColor: 'var(--warning)' }}>
            <h4>
              <span>{language === 'es' ? 'Pivote (= p)' : 'Pivot (= p)'}</span>
              <span style={{ color: 'var(--warning)' }}>{equal.length}</span>
            </h4>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: '700' }}>
              {equal.join(', ')}
            </div>
          </div>

          <div className="mom-partition-box">
            <h4>
              <span>{language === 'es' ? 'Mayores (> p)' : 'Greater (> p)'}</span>
              <span style={{ color: 'var(--accent)' }}>{greater.length}</span>
            </h4>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {greater.length > 0 ? greater.join(', ') : '∅'}
            </div>
          </div>
        </div>
      )}

      {/* Median of Medians Worst-Case Linear Time Proof Card (K&T §13.5 / CLRS §9.3) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento Teórico: Garantía de Tiempo Lineal en el Peor Caso:' : 'Theoretical Foundation: Worst-Case Linear Time Guarantee:'}</strong>{' '}
        {language === 'es'
          ? 'Al particionar n elementos en ⌈n/5⌉ grupos de 5 y obtener recursivamente la mediana de sus medianas p, al menos la mitad de las medianas de grupo son ≤ p. Como en cada grupo al menos 3 de sus 5 elementos son menores o iguales a su respectiva mediana, se garantiza que al menos 3 · ⌈⌈n/5⌉ / 2⌉ ≥ 3n/10 elementos son menores o iguales que p (y análogamente ≥ p). Por lo tanto, el peor subproblema recursivo tiene tamaño a lo sumo 7n/10. La recurrencia T(n) ≤ T(n/5) + T(7n/10) + c·n satisface que (1/5 + 7/10) = 9/10 < 1, lo que por inducción acota la suma geométrica demostrando T(n) = O(n) determinístico en el peor caso.'
          : 'Partitioning n items into ⌈n/5⌉ groups of 5 and recursively choosing the median of medians p ensures at least half the group medians are ≤ p. Because each group has at least 3 elements ≤ its group median, at least 3 · ⌈⌈n/5⌉ / 2⌉ ≥ 3n/10 elements are guaranteed ≤ p (and symmetrically ≥ p). Thus, the surviving recursive subproblem after partitioning has at most 7n/10 elements. The recurrence T(n) ≤ T(n/5) + T(7n/10) + c·n satisfies (1/5 + 7/10) = 9/10 < 1, which bounds the recursion by a converging geometric series, establishing deterministic worst-case O(n) selection.'}
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
