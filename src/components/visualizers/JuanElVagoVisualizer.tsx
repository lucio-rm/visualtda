import React, { useMemo } from 'react';
import {
  generateJuanElVagoTrace,
  JuanElVagoStepData,
  DEFAULT_GANANCIAS
} from '../../engine/algorithms/juanElVagoTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './JuanElVagoVisualizer.css';

export const JuanElVagoVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(() => generateJuanElVagoTrace(DEFAULT_GANANCIAS), []);

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
  } = useTraceTimeline<JuanElVagoStepData>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const ganancias = data?.ganancias || DEFAULT_GANANCIAS;
  const dp = data?.dp || [];
  const currentDay = data?.currentDay ?? 0;
  const phase = data?.phase || 'init';
  const optionSkip = data?.optionSkip;
  const optionWork = data?.optionWork;
  const decision = data?.decision;
  const selectedDays = data?.selectedDays || [];
  const reconstructionPointer = data?.reconstructionPointer;

  const isReconstruction = phase === 'reconstruct_step' || phase === 'complete';

  return (
    <div className="juan-vago-visualizer">
      {/* Top Header */}
      <div className="visualizer-header">
        <div className="phase-indicator">
          <span className="phase-badge-label">
            {language === 'es' ? 'Fase DP:' : 'DP Phase:'}
          </span>
          <span className="phase-badge-name">{phase.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <div className="status-counter">
          {language === 'es' ? 'Días Trabajados:' : 'Days Worked:'}{' '}
          <strong>[{selectedDays.join(', ')}]</strong> |{' '}
          {language === 'es' ? 'Ganancia Acumulada:' : 'Accumulated Profit:'}{' '}
          <span className="profit-highlight">${data?.currentTotal ?? 0}</span>
        </div>
      </div>

      {/* Daily Offers Row */}
      <div className="section-title">
        {language === 'es' ? '📅 Ofertas de Trabajo Diarias' : '📅 Daily Job Offers'}
      </div>
      <div className="days-strip">
        {ganancias.map((val, idx) => {
          const isSelected = selectedDays.includes(idx);
          const isCurrent = currentDay === idx;
          const isReconPoint = reconstructionPointer === idx;

          let cardClass = 'day-card';
          if (isSelected) cardClass += ' worked-day';
          if (isCurrent && !isReconstruction) cardClass += ' current-day';
          if (isReconPoint) cardClass += ' recon-focus';

          return (
            <div key={idx} className={cardClass}>
              <div className="day-header">
                {language === 'es' ? `Día ${idx}` : `Day ${idx}`}
              </div>
              <div className="day-val">${val}</div>
              <div className="day-badge">
                {isSelected ? (
                  <span className="badge-work">
                    {language === 'es' ? 'TRABAJA' : 'WORKS'}
                  </span>
                ) : isReconstruction && reconstructionPointer !== undefined && idx >= reconstructionPointer ? (
                  <span className="badge-rest">
                    {language === 'es' ? 'DESCANSA' : 'RESTS'}
                  </span>
                ) : (
                  <span className="badge-empty">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DP Table 1D */}
      <div className="section-title">
        {language === 'es' ? '📊 Tabla de Programación Dinámica (1D Memoization)' : '📊 DP Table (1D Memoization)'}
      </div>
      <div className="dp-strip">
        {dp.map((val, idx) => {
          const isCurrent = currentDay === idx && !isReconstruction;
          const isAntecedentSkip = optionSkip?.antecedentDay === idx;
          const isAntecedentWork = optionWork?.antecedentDay === idx;
          const isRecon = reconstructionPointer === idx;

          let cellClass = 'dp-cell';
          if (val !== null) cellClass += ' filled';
          if (isCurrent) cellClass += ' active-cell';
          if (isAntecedentSkip) cellClass += ' ante-skip';
          if (isAntecedentWork) cellClass += ' ante-work';
          if (isRecon) cellClass += ' recon-cell';

          return (
            <div key={idx} className={cellClass}>
              <div className="dp-cell-label">dp[{idx}]</div>
              <div className="dp-cell-val">{val !== null ? `$${val}` : '?'}</div>
              <div className="dp-tag">
                {isAntecedentSkip && <span className="tag-skip">dp[i-1]</span>}
                {isAntecedentWork && <span className="tag-work">dp[i-2]</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Decision Box during Evaluation */}
      {optionSkip && optionWork && !isReconstruction && (
        <div className="decision-box">
          <div className="decision-col col-skip">
            <span className="decision-title">
              {language === 'es' ? 'Opción A: Descansar el día actual' : 'Option A: Rest current day'}
            </span>
            <span className="decision-math">
              dp[{optionSkip.antecedentDay}] = <strong>${optionSkip.value}</strong>
            </span>
          </div>

          <div className="vs-badge">VS</div>

          <div className="decision-col col-work">
            <span className="decision-title">
              {language === 'es' ? 'Opción B: Trabajar el día actual' : 'Option B: Work current day'}
            </span>
            <span className="decision-math">
              dp[{optionWork.antecedentDay}] (${optionWork.value - optionWork.dayGain}) + ${optionWork.dayGain} ={' '}
              <strong>${optionWork.value}</strong>
            </span>
          </div>

          {decision && (
            <div className="decision-winner">
              {language === 'es' ? 'Decisión óptima:' : 'Optimal choice:'}{' '}
              <span className={`choice-badge ${decision}`}>
                {decision === 'work'
                  ? language === 'es' ? 'TRABAJAR (Opción B)' : 'WORK (Option B)'
                  : language === 'es' ? 'DESCANSAR (Opción A)' : 'REST (Option A)'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Event Message */}
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
          ⏮
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
          {isPlaying ? '⏸' : '▶'}
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
