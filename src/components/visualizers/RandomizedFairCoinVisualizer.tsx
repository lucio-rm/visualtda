import React, { useMemo } from 'react';
import {
  generateRandomizedFairCoinTrace,
  FairCoinStepData,
  DEFAULT_COIN_BIAS
} from '../../engine/algorithms/randomizedFairCoinTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './RandomizedFairCoinVisualizer.css';

export const RandomizedFairCoinVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(
    () => generateRandomizedFairCoinTrace(DEFAULT_COIN_BIAS),
    []
  );

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
  } = useTraceTimeline<FairCoinStepData>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const bias = data?.bias ?? DEFAULT_COIN_BIAS;
  const rounds = data?.rounds || [];
  const currentRoundIndex = data?.currentRoundIndex ?? 0;
  const currentToss = data?.currentToss;
  const activeToss1 = data?.activeToss1;
  const activeToss2 = data?.activeToss2;
  const outputBit = data?.outputBit;
  const totalTosses = data?.totalTosses ?? 0;
  const theoreticalExpected = data?.theoreticalExpectedTosses ?? 4.167;
  const phase = data?.phase || 'init';

  return (
    <div className="fair-coin-visualizer">
      {/* Top Header */}
      <div className="visualizer-header">
        <div className="phase-indicator">
          <span className="phase-badge-label">
            {language === 'es' ? 'Fase Randomizada:' : 'Randomized Phase:'}
          </span>
          <span className="phase-badge-name">{phase.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <div className="source-info">
          {language === 'es' ? 'Sesgo de la fuente:' : 'Source bias:'}{' '}
          <code>P(1) = {bias * 100}% | P(0) = {((1 - bias) * 100).toFixed(0)}%</code>
        </div>
      </div>

      {/* Current Round Flip Arena */}
      <div className="arena-box">
        <div className="arena-title">
          {language === 'es'
            ? `🎲 Ronda ${currentRoundIndex + 1} — Lanzamientos en Pares (T1, T2)`
            : `🎲 Round ${currentRoundIndex + 1} — Paired Tosses (T1, T2)`}
        </div>

        <div className="coins-stage">
          {/* Coin 1 */}
          <div className={`coin-slot ${currentToss === 1 ? 'flipping' : ''}`}>
            <span className="coin-label">{language === 'es' ? 'Tiro 1 (T1)' : 'Toss 1 (T1)'}</span>
            <div className={`coin-disc ${activeToss1 !== undefined ? `face-${activeToss1}` : 'empty'}`}>
              {activeToss1 !== undefined ? activeToss1 : '?'}
            </div>
            <span className="coin-sub">
              {activeToss1 !== undefined
                ? activeToss1 === 1 ? `Prob: ${bias}` : `Prob: ${(1 - bias).toFixed(1)}`
                : '...'}
            </span>
          </div>

          <div className="pair-connector">&</div>

          {/* Coin 2 */}
          <div className={`coin-slot ${currentToss === 2 ? 'flipping' : ''}`}>
            <span className="coin-label">{language === 'es' ? 'Tiro 2 (T2)' : 'Toss 2 (T2)'}</span>
            <div className={`coin-disc ${activeToss2 !== undefined ? `face-${activeToss2}` : 'empty'}`}>
              {activeToss2 !== undefined ? activeToss2 : '?'}
            </div>
            <span className="coin-sub">
              {activeToss2 !== undefined
                ? activeToss2 === 1 ? `Prob: ${bias}` : `Prob: ${(1 - bias).toFixed(1)}`
                : '...'}
            </span>
          </div>
        </div>

        {/* Symmetry Logic Banner */}
        <div className="symmetry-rule-box">
          <div className="rule-item">
            <span className="rule-pair">(0, 1)</span>
            <span className="rule-arrow">➔</span>
            <span className="rule-res res-0">Bit 0</span>
            <span className="rule-prob">P = (1-p)·p = {( (1 - bias) * bias ).toFixed(2)}</span>
          </div>
          <div className="rule-item">
            <span className="rule-pair">(1, 0)</span>
            <span className="rule-arrow">➔</span>
            <span className="rule-res res-1">Bit 1</span>
            <span className="rule-prob">P = p·(1-p) = {( bias * (1 - bias) ).toFixed(2)}</span>
          </div>
          <div className="rule-item discard">
            <span className="rule-pair">(0,0) / (1,1)</span>
            <span className="rule-arrow">➔</span>
            <span className="rule-res res-discard">
              {language === 'es' ? 'DESCARTAR' : 'DISCARD'}
            </span>
            <span className="rule-prob">P = p² + (1-p)²</span>
          </div>
        </div>
      </div>

      {/* Rounds History List */}
      {rounds.length > 0 && (
        <div className="rounds-history">
          <div className="history-title">
            {language === 'es' ? '📜 Historial de Rondas:' : '📜 Rounds History:'}
          </div>
          <div className="history-chips">
            {rounds.map((r, idx) => {
              const isDiscard = r.outcome.startsWith('discard');
              return (
                <div
                  key={idx}
                  className={`history-chip ${isDiscard ? 'chip-discard' : 'chip-success'}`}
                >
                  <span className="chip-r">R{r.roundNumber}:</span>
                  <span className="chip-pair">({r.toss1}, {r.toss2})</span>
                  <span className="chip-outcome">
                    {isDiscard
                      ? language === 'es' ? '✕ Descartado' : '✕ Discarded'
                      : `✓ Emite Bit ${r.outputBit}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Result Card */}
      {outputBit !== undefined && (
        <div className="final-result-card">
          <div className="final-title">
            {language === 'es' ? 'Bit Equilibrado Generado (50% / 50%):' : 'Fair Bit Generated (50% / 50%):'}
          </div>
          <div className="final-bit-badge">{outputBit}</div>
          <div className="final-stats">
            <span>
              {language === 'es' ? 'Lanzamientos totales:' : 'Total physical tosses:'}{' '}
              <strong>{totalTosses}</strong>
            </span>
            <span>
              {language === 'es' ? 'Esperanza teórica E[T]:' : 'Theoretical expectation E[T]:'}{' '}
              <code>{theoreticalExpected.toFixed(2)}</code>
            </span>
          </div>
        </div>
      )}

      {/* Narrative Box */}
      <div className="event-narrative">
        <p className="narrative-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es}
        </p>
      </div>

      {/* Playback Controls */}
      <div className="controls-bar">
        <button className="btn-control" onClick={reset} title="Reiniciar">⏮</button>
        <button className="btn-control" onClick={stepBackward} disabled={currentStepIndex === 0} title="Paso Anterior">◀</button>
        <button className="btn-control btn-play" onClick={togglePlay} title={isPlaying ? 'Pausa' : 'Reproducir'}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="btn-control" onClick={stepForward} disabled={currentStepIndex === totalSteps - 1} title="Paso Siguiente">▶</button>

        <div className="timeline-slider-wrapper">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-slider"
          />
          <span className="step-counter">{currentStepIndex + 1} / {totalSteps}</span>
        </div>

        <div className="speed-selector">
          <label>{language === 'es' ? 'Vel:' : 'Speed:'}</label>
          <select value={playbackSpeed} onChange={(e) => setSpeed(Number(e.target.value))}>
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
