import React, { useMemo } from 'react';
import {
  generateMaxSubarrayTrace,
  MaxSubarrayStepData,
  DEFAULT_MAX_SUBARRAY
} from '../../engine/algorithms/maxSubarrayTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './MaxSubarrayVisualizer.css';

export const MaxSubarrayVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(() => generateMaxSubarrayTrace(DEFAULT_MAX_SUBARRAY), []);

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
  } = useTraceTimeline<MaxSubarrayStepData>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const array = data?.array || DEFAULT_MAX_SUBARRAY;
  const activeRange = data?.activeRange;
  const midIndex = data?.midIndex;
  const leftScanPointer = data?.leftScanPointer;
  const rightScanPointer = data?.rightScanPointer;
  const bestLeftIndex = data?.bestLeftIndex;
  const bestRightIndex = data?.bestRightIndex;
  const highlightRange = data?.highlightRange;
  const leftCandidate = data?.leftCandidate;
  const rightCandidate = data?.rightCandidate;
  const crossCandidate = data?.crossCandidate;
  const winner = data?.currentWinner;
  const phase = data?.phase || 'init';

  const getItemClass = (idx: number) => {
    const classes = ['subarray-cell'];

    // In highlight range (winner or crossing)
    if (highlightRange && idx >= highlightRange[0] && idx <= highlightRange[1]) {
      classes.push('in-highlight');
    }

    // Active subproblem range
    if (activeRange && (idx < activeRange[0] || idx > activeRange[1])) {
      classes.push('dimmed');
    } else if (activeRange) {
      classes.push('in-active-range');
    }

    // Scanning pointers
    if (leftScanPointer === idx) {
      classes.push('left-scan');
    }
    if (rightScanPointer === idx) {
      classes.push('right-scan');
    }

    // Best boundary candidates
    if (bestLeftIndex === idx && phase.startsWith('scan')) {
      classes.push('best-left-anchor');
    }
    if (bestRightIndex === idx && phase.startsWith('scan')) {
      classes.push('best-right-anchor');
    }

    // Midpoint
    if (midIndex === idx) {
      classes.push('mid-element');
    }

    return classes.join(' ');
  };

  return (
    <div className="max-subarray-visualizer">
      {/* Top Header / Status */}
      <div className="visualizer-header">
        <div className="phase-badge">
          <span className="phase-label">
            {language === 'es' ? 'Fase DyC:' : 'D&C Phase:'}
          </span>
          <span className="phase-name">{phase.toUpperCase()}</span>
        </div>
        <div className="range-indicator">
          {activeRange ? (
            <span>
              {language === 'es' ? 'Subproblema activo:' : 'Active subproblem:'}{' '}
              <code>[{activeRange[0]}..{activeRange[1]}]</code>
              {midIndex !== undefined && (
                <> (m = <code>{midIndex}</code>)</>
              )}
            </span>
          ) : (
            <span>{language === 'es' ? 'Arreglo Completo' : 'Full Array'}</span>
          )}
        </div>
      </div>

      {/* Main Array Display */}
      <div className="array-track-container">
        <div className="array-track">
          {array.map((val, idx) => (
            <div key={idx} className={getItemClass(idx)}>
              <div className="cell-index">i = {idx}</div>
              <div className={`cell-value ${val >= 0 ? 'positive' : 'negative'}`}>
                {val}
              </div>
              <div className="cell-markers">
                {midIndex === idx && <span className="marker mid-tag">mid</span>}
                {leftScanPointer === idx && <span className="marker scan-tag">← i</span>}
                {rightScanPointer === idx && <span className="marker scan-tag">j →</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates & Crossing Status Box */}
      <div className="candidates-panel">
        <div className="candidate-card left-box">
          <div className="cand-title">
            {language === 'es' ? 'Mejor Izquierda' : 'Best Left'}
          </div>
          <div className="cand-value">
            {leftCandidate ? (
              <>
                <span>Suma: <strong>{leftCandidate.sum}</strong></span>
                <span className="cand-range">[{leftCandidate.range[0]}..{leftCandidate.range[1]}]</span>
              </>
            ) : (
              <em>{language === 'es' ? 'Pendiente...' : 'Pending...'}</em>
            )}
          </div>
        </div>

        <div className="candidate-card cross-box">
          <div className="cand-title">
            {language === 'es' ? 'Subarreglo Cruzado' : 'Crossing Subarray'}
          </div>
          <div className="cand-value">
            {crossCandidate ? (
              <>
                <span>Suma: <strong>{crossCandidate.sum}</strong></span>
                <span className="cand-range">[{crossCandidate.range[0]}..{crossCandidate.range[1]}]</span>
              </>
            ) : data?.bestLeftSum !== undefined || data?.bestRightSum !== undefined ? (
              <div className="cross-live-sums">
                <span>{language === 'es' ? 'Izq max:' : 'Left max:'} {data.bestLeftSum ?? '-'}</span>
                <span>{language === 'es' ? 'Der max:' : 'Right max:'} {data.bestRightSum ?? '-'}</span>
              </div>
            ) : (
              <em>{language === 'es' ? 'Pendiente...' : 'Pending...'}</em>
            )}
          </div>
        </div>

        <div className="candidate-card right-box">
          <div className="cand-title">
            {language === 'es' ? 'Mejor Derecha' : 'Best Right'}
          </div>
          <div className="cand-value">
            {rightCandidate ? (
              <>
                <span>Suma: <strong>{rightCandidate.sum}</strong></span>
                <span className="cand-range">[{rightCandidate.range[0]}..{rightCandidate.range[1]}]</span>
              </>
            ) : (
              <em>{language === 'es' ? 'Pendiente...' : 'Pending...'}</em>
            )}
          </div>
        </div>
      </div>

      {/* Winner banner */}
      {winner && (
        <div className="winner-banner">
          <span className="winner-label">
            {language === 'es' ? 'Ganador Actual:' : 'Current Winner:'}
          </span>{' '}
          <strong>{winner.source?.toUpperCase()}</strong> —{' '}
          {language === 'es' ? 'Rango' : 'Range'}: <code>[{winner.range[0]}..{winner.range[1]}]</code> |{' '}
          {language === 'es' ? 'Suma' : 'Sum'}: <code>{winner.sum}</code>
        </div>
      )}

      {/* Narrative Event Message */}
      <div className="event-narrative">
        <p className="message-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es}
        </p>
      </div>

      {/* Master Theorem & Kadane Comparison Card (Section 12, 31 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento: División y Conquista vs. Kadane O(n):' : 'Rationale: Divide & Conquer vs. Kadane O(n):'}</strong>{' '}
        {language === 'es'
          ? 'El enfoque por división y conquista divide el arreglo en dos mitades (2T(n/2)) y calcula el subarreglo cruzado óptimo expandiéndose desde el punto medio en tiempo lineal O(n). Por Teorema Maestro, T(n) = 2T(n/2) + O(n) ⇒ O(n log n). Como contraste formativo, el algoritmo dinámico de Kadane resuelve el problema en una única pasada O(n) mediante la recurrencia local dp[i] = max(A[i], dp[i-1] + A[i]), superando el costo logarítmico adicional.'
          : 'Divide & Conquer splits into two halves (2T(n/2)) and finds the maximal crossing subarray starting from midpoint in linear O(n) time. By Master Theorem, T(n) = 2T(n/2) + O(n) ⇒ O(n log n). In contrast, Kadane’s dynamic programming scan achieves O(n) single-pass runtime via local invariant dp[i] = max(A[i], dp[i-1] + A[i]).'}
      </div>

      {/* Playback Controls */}
      <div className="controls-bar">
        <button
          className="btn-control"
          onClick={reset}
          title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
          aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
        >
          ↺
        </button>
        <button
          className="btn-control"
          onClick={stepBackward}
          disabled={currentStepIndex === 0}
          title={language === 'es' ? 'Paso anterior (←)' : 'Step backward (←)'}
          aria-label={language === 'es' ? 'Paso anterior' : 'Step backward'}
        >
          ←
        </button>
        <button
          className="btn-control btn-play"
          onClick={togglePlay}
          title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
          aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          className="btn-control"
          onClick={stepForward}
          disabled={currentStepIndex === totalSteps - 1}
          title={language === 'es' ? 'Paso siguiente (→)' : 'Step forward (→)'}
          aria-label={language === 'es' ? 'Paso siguiente' : 'Step forward'}
        >
          →
        </button>

        <div className="timeline-slider-wrapper">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-slider"
            aria-label={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
          />
          <span className="step-counter">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="speed-selector">
          <label>{language === 'es' ? 'Vel:' : 'Speed:'}</label>
          <select
            value={playbackSpeed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>
        </div>
      </div>
    </div>
  );
};
