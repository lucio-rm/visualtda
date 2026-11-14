import React, { useMemo } from 'react';
import { TraceScrubber } from '../TraceScrubber';
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
      aria-label={language === 'es' ? 'Visualizador del Elemento Mayoritario' : 'Majority Element Visualizer'}
    >
      {/* Metrics Row */}
      <div className="me-metrics-row">
        <div className="me-metric-badge">
          <span>{language === 'es' ? 'Rango Activo:' : 'Active Range:'}</span>
          <strong>[{left} .. {right}]</strong>
        </div>
        <div className="me-metric-badge">
          <span>{language === 'es' ? 'Umbral (> n/2):' : 'Threshold (> n/2):'}</span>
          <strong>{`> ${threshold}`}</strong>
        </div>
        <div className="me-metric-badge">
          <span>{language === 'es' ? 'Ganador Actual:' : 'Current Winner:'}</span>
          <strong style={{ color: winner !== null && winner !== undefined ? 'var(--success)' : 'var(--warning)' }}>
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
          style={{
            width: '100%',
            maxWidth: 'min(100%, 640px)',
            maxHeight: 'min(320px, calc(100vh - 340px))',
            height: 'auto',
            display: 'block',
            margin: '0 auto'
          }}
          role="img"
          aria-label={language === 'es' ? 'Arreglo de elementos y división recursiva' : 'Elements array and recursive partition'}
        >
          {/* Active Range Highlight Box */}
          <rect
            x={startX + left * cellWidth - 4}
            y={startY - 6}
            width={(right - left + 1) * cellWidth + 8}
            height={cellHeight + 12}
            rx={8}
            fill="var(--state-active-bg)"
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
              stroke="var(--warning)"
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
                      ? 'var(--state-solution-bg)'
                      : inActiveRange
                      ? 'var(--surface-hover)'
                      : 'var(--surface)'
                  }
                  stroke={isWinner ? 'var(--success)' : inActiveRange ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isWinner ? 2.5 : inActiveRange ? 1.5 : 1}
                />
                <text
                  x={x + (cellWidth - 4) / 2}
                  y={startY + cellHeight / 2 + 5}
                  textAnchor="middle"
                  fill={isWinner ? 'var(--success)' : inActiveRange ? 'var(--text)' : 'var(--text-muted)'}
                  fontSize="16px"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {val}
                </text>
                {/* Index label below */}
                <text
                  x={x + (cellWidth - 4) / 2}
                  y={startY + cellHeight + 18}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="12px"
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
              y={startY + cellHeight + 38}
              fill="var(--accent)"
              fontSize="13px"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {language === 'es' ? 'CandIzq' : 'LeftCand'}: {candLeft} {countLeft > 0 ? `(${countLeft}x)` : ''}
            </text>
          )}

          {candRight !== null && candRight !== undefined && (
            <text
              x={startX + (mid !== null && mid !== undefined ? (mid + 1) * cellWidth + 6 : (left + 1) * cellWidth)}
              y={startY + cellHeight + 38}
              fill="var(--warning)"
              fontSize="13px"
              fontWeight="700"
              fontFamily="var(--font-mono)"
            >
              {language === 'es' ? 'CandDer' : 'RightCand'}: {candRight} {countRight > 0 ? `(${countRight}x)` : ''}
            </text>
          )}
        </svg>
      </div>

      {/* Majority Element Theoretical Lemma & Recurrence (K&T §5.2) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento Teórico: Lema de Preservación en Subproblemas:' : 'Theoretical Foundation: Subproblem Preservation Lemma:'}</strong>{' '}
        {language === 'es'
          ? 'Si un elemento x es mayoritario estricto en el arreglo A (frecuencia > n/2), entonces x DEBE ser el elemento mayoritario en al menos una de las dos mitades A[1..⌊n/2⌋] o A[⌊n/2⌋+1..n]. Demostración por reducción al absurdo: si x no fuera mayoritario en ninguna mitad, su frecuencia en la izquierda sería ≤ ⌊n/4⌋ y en la derecha ≤ ⌈n/4⌉, sumando a lo sumo ⌊n/2⌋ apariciones, contradiciendo la hipótesis. Por lo tanto, la recursión solo necesita evaluar a lo sumo dos candidatos devueltos por las mitades, verificando sus frecuencias totales en tiempo lineal O(n). La recurrencia resultante T(n) = 2T(n/2) + O(n) resuelve en O(n log n).'
          : 'If an element x is strictly majority in array A (frequency > n/2), then x MUST be majority in at least one of the two halves A[1..⌊n/2⌋] or A[⌊n/2⌋+1..n]. Proof by contradiction: if x were majority in neither half, its count in the left would be ≤ ⌊n/4⌋ and in the right ≤ ⌈n/4⌉, totaling at most ⌊n/2⌋ occurrences, contradicting the majority premise. Thus, recursion only evaluates at most two candidate values returned by the subproblems, counting their occurrences in linear O(n) time. The recurrence T(n) = 2T(n/2) + O(n) yields O(n log n).'}
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
          <TraceScrubber
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSeek={goToStep}
            language={language}
            showCounter={false}
            ariaLabel={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
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
