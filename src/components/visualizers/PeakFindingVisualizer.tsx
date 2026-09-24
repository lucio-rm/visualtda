import React, { useMemo } from 'react';
import {
  generatePeakFindingTrace,
  PeakFindingStepData,
  DEFAULT_PEAK_ARRAY
} from '../../engine/algorithms/peakFindingTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './PeakFindingVisualizer.css';

export const PeakFindingVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(() => generatePeakFindingTrace(DEFAULT_PEAK_ARRAY), []);

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
  } = useTraceTimeline<PeakFindingStepData>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const array = data?.array || DEFAULT_PEAK_ARRAY;
  const start = data?.start ?? 0;
  const end = data?.end ?? array.length - 1;
  const mid = data?.mid ?? null;
  const leftVal = data?.leftVal ?? null;
  const rightVal = data?.rightVal ?? null;
  const decision = data?.decision || 'INIT';
  const foundIndex = data?.foundIndex ?? null;

  const maxVal = Math.max(...array, 1);

  return (
    <div className="peak-finding-visualizer">
      {/* Top Header */}
      <div className="visualizer-header">
        <div className="phase-indicator">
          <span className="phase-badge-label">
            {language === 'es' ? 'Fase DyC:' : 'D&C Phase:'}
          </span>
          <span className="phase-badge-name">{decision.replace(/_/g, ' ')}</span>
        </div>
        <div className="status-counter">
          {language === 'es' ? 'Ventana Activa:' : 'Active Window:'}{' '}
          <strong>[{start}, {end}]</strong> |{' '}
          {language === 'es' ? 'Tamaño:' : 'Size:'}{' '}
          <span className="size-highlight">{Math.max(0, end - start + 1)}</span>
        </div>
      </div>

      {/* Elevation Profile / Mountain Bars */}
      <div className="mountain-chart-wrapper">
        <div className="chart-legend">
          <span>{language === 'es' ? 'Perfil de Valores del Arreglo' : 'Array Value Profile'}</span>
          <div className="legend-pills">
            <span className="pill-item pill-window">
              <span className="pill-dot dot-active"></span>
              {language === 'es' ? 'Ventana [l, r]' : 'Window [l, r]'}
            </span>
            <span className="pill-item pill-mid">
              <span className="pill-dot dot-mid"></span>
              {language === 'es' ? 'Punto Medio' : 'Midpoint'}
            </span>
            <span className="pill-item pill-peak">
              <span className="pill-dot dot-peak"></span>
              {language === 'es' ? 'Pico Confirmado' : 'Confirmed Peak'}
            </span>
          </div>
        </div>

        <div className="mountain-bars-container">
          {array.map((val, idx) => {
            const isWithinWindow = idx >= start && idx <= end;
            const isMid = idx === mid;
            const isPeak = idx === foundIndex;
            const isLeftNeighbor = mid !== null && idx === mid - 1;
            const isRightNeighbor = mid !== null && idx === mid + 1;

            const heightPct = Math.max(15, Math.round((val / maxVal) * 100));

            let barClass = 'mountain-bar-col';
            if (!isWithinWindow) barClass += ' bar-discarded';
            if (isWithinWindow) barClass += ' bar-active-window';
            if (isMid) barClass += ' bar-mid';
            if (isPeak) barClass += ' bar-peak';
            if (isLeftNeighbor || isRightNeighbor) barClass += ' bar-neighbor';

            return (
              <div key={idx} className={barClass}>
                {isPeak && (
                  <div className="peak-crown" title="Pico local confirmado">
                    ▲
                  </div>
                )}
                <div className="bar-value-bubble">{val}</div>
                <div
                  className="bar-column"
                  style={{ height: `${heightPct}%` }}
                ></div>
                <div className="bar-index-tag">
                  [{idx}]
                  {idx === start && <span className="idx-marker">l</span>}
                  {idx === end && <span className="idx-marker">r</span>}
                  {isMid && <span className="idx-marker m-marker">m</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Callout */}
      {mid !== null && (
        <div className="gradient-evaluation-card">
          <div className="eval-title">
            {language === 'es'
              ? 'Evaluación del Gradiente (Pendiente Ascendente):'
              : 'Gradient Evaluation (Uphill Walk):'}
          </div>
          <div className="eval-row">
            <div className={`eval-cell ${leftVal !== null && leftVal > array[mid] ? 'uphill-target' : ''}`}>
              <span className="eval-label">A[m - 1] (Izq)</span>
              <span className="eval-value">{leftVal ?? '∅'}</span>
              {leftVal !== null && leftVal > array[mid] && (
                <span className="arrow-badge">⇦ {language === 'es' ? 'Sube' : 'Uphill'}</span>
              )}
            </div>

            <div className="eval-cell cell-center-mid">
              <span className="eval-label">A[m] (Centro)</span>
              <span className="eval-value mid-val-highlight">{array[mid]}</span>
              {decision === 'PEAK_FOUND' && (
                <span className="peak-badge">{language === 'es' ? 'PICO LOCAL' : 'LOCAL PEAK'}</span>
              )}
            </div>

            <div className={`eval-cell ${rightVal !== null && rightVal > array[mid] ? 'uphill-target' : ''}`}>
              <span className="eval-label">A[m + 1] (Der)</span>
              <span className="eval-value">{rightVal ?? '∅'}</span>
              {rightVal !== null && rightVal > array[mid] && (
                <span className="arrow-badge">{language === 'es' ? 'Sube' : 'Uphill'} ⇨</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Narrative Event Box */}
      <div className="narrative-box">
        <p className="narrative-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es}
        </p>
      </div>

      {/* Playback Controls */}
      <div className="controls-bar">
        <button
          className="btn-control"
          onClick={reset}
          title={language === 'es' ? 'Reiniciar' : 'Reset'}
        >
          ↺
        </button>
        <button
          className="btn-control"
          onClick={stepBackward}
          disabled={currentStepIndex === 0}
          title={language === 'es' ? 'Paso Anterior' : 'Step Backward'}
        >
          ◀
        </button>
        <button
          className="btn-control btn-play"
          onClick={togglePlay}
          title={isPlaying ? 'Pausa' : 'Reproducir'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          className="btn-control"
          onClick={stepForward}
          disabled={currentStepIndex === totalSteps - 1}
          title={language === 'es' ? 'Paso Siguiente' : 'Step Forward'}
        >
          ▶
        </button>

        <div className="timeline-slider-wrapper">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-slider"
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
