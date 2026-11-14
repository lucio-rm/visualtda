import React, { useState, useMemo } from 'react';
import { TraceScrubber } from '../TraceScrubber';
import {
  generateCoinChangeTrace,
  CoinChangeStepData
} from '../../engine/algorithms/coinChangeTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './CoinChangeVisualizer.css';

const PRESETS = [
  {
    id: 'counterexample',
    label: { es: 'Contraejemplo Greedy [1, 3, 4] (V = 6)', en: 'Greedy Counterexample [1, 3, 4] (V = 6)' },
    coins: [1, 3, 4],
    target: 6
  },
  {
    id: 'trap2',
    label: { es: 'Trampa Greedy II [1, 5, 6, 9] (V = 11)', en: 'Greedy Trap II [1, 5, 6, 9] (V = 11)' },
    coins: [1, 5, 6, 9],
    target: 11
  },
  {
    id: 'stamps',
    label: { es: 'Sellos [2, 5, 7] (V = 11)', en: 'Stamps [2, 5, 7] (V = 11)' },
    coins: [2, 5, 7],
    target: 11
  },
  {
    id: 'currency',
    label: { es: 'Monedas [1, 2, 5, 10, 20] (V = 27)', en: 'Currency [1, 2, 5, 10, 20] (V = 27)' },
    coins: [1, 2, 5, 10, 20],
    target: 27
  }
];

export const CoinChangeVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('counterexample');
  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const coins = activePreset.coins;
  const target = activePreset.target;

  const timeline = useMemo(() => generateCoinChangeTrace(coins, target), [coins, target]);

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
  } = useTraceTimeline<CoinChangeStepData>(timeline, {
    baseIntervalMs: 750,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const dp = data?.dp || [];
  const choice = data?.choice || [];
  const currentV = data?.currentV ?? null;
  const currentCoin = data?.currentCoin ?? null;
  const evaluatingTransitionFrom = data?.evaluatingTransitionFrom ?? null;
  const reconstructedCoins = data?.reconstructedCoins || [];
  const greedyCoins = data?.greedyCoins ?? null;
  const action = data?.action || 'INIT';

  const isReconstruction =
    action === 'START_RECONSTRUCTION' ||
    action === 'RECONSTRUCT_COIN' ||
    action === 'COMPLETE';

  const INF = 999999;

  return (
    <div className="coin-change-visualizer">
      {/* Preset Selector */}
      <div className="coin-presets" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Escenario:' : 'Scenario:'}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`btn-secondary ${selectedPresetId === p.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedPresetId(p.id);
              reset();
            }}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.825rem',
              backgroundColor: selectedPresetId === p.id ? 'var(--accent)' : 'var(--surface)',
              color: selectedPresetId === p.id ? '#ffffff' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
          >
            {p.label[language]}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="visualizer-header">
        <div className="phase-indicator">
          <span className="phase-badge-label">
            {language === 'es' ? 'Fase Algoritmo:' : 'Algorithm Phase:'}
          </span>
          <span className="phase-badge-name">{action.replace(/_/g, ' ')}</span>
        </div>
        <div className="status-counter">
          {language === 'es' ? 'Objetivo:' : 'Target:'}{' '}
          <strong className="target-badge">${target}</strong> |{' '}
          {language === 'es' ? 'Monedas:' : 'Coins:'}{' '}
          <span className="coins-list">[{coins.join(', ')}]</span>
        </div>
      </div>

      {/* Denominations Row */}
      <div className="coins-panel">
        <div className="panel-title">
          {language === 'es' ? 'Sistema de Denominaciones Disponibles' : 'Available Coin Denominations'}
        </div>
        <div className="coins-tokens-strip">
          {coins.map((c) => {
            const isBeingTested = currentCoin === c && !isReconstruction;
            return (
              <div
                key={c}
                className={`coin-token ${isBeingTested ? 'testing-token' : ''}`}
              >
                <span className="token-symbol">$</span>
                <span className="token-value">{c}</span>
                {isBeingTested && (
                  <span className="token-probing-badge">
                    {language === 'es' ? 'Probando' : 'Testing'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 1D DP Array View */}
      <div className="panel-title">
        {language === 'es'
          ? 'Tabla de Estados 1D: dp[v] = cantidad mínima de monedas para cambio de $v'
          : '1D State Table: dp[v] = minimum number of coins for change $v'}
      </div>
      <div className="dp-table-container">
        <div className="dp-cells-row">
          {dp.map((val, v) => {
            const isTarget = v === target;
            const isCurrent = currentV === v && !isReconstruction;
            const isAntecedent = evaluatingTransitionFrom === v;
            const isReconActive = isReconstruction && currentV === v;

            let cellClass = 'coin-dp-cell';
            if (val !== INF) cellClass += ' filled';
            if (isCurrent) cellClass += ' cell-current';
            if (isAntecedent) cellClass += ' cell-antecedent';
            if (isReconActive) cellClass += ' cell-recon';
            if (isTarget) cellClass += ' cell-target';

            return (
              <div key={v} className={cellClass}>
                <div className="cell-header">v = {v}</div>
                <div className="cell-main-val">
                  {val === INF ? '∞' : val}
                </div>
                <div className="cell-choice">
                  {choice[v] !== undefined && choice[v] > 0
                    ? `+$${choice[v]}`
                    : v === 0
                    ? 'base'
                    : '—'}
                </div>
                {isAntecedent && (
                  <div className="antecedent-indicator">
                    {language === 'es' ? `dp[${v}]` : `dp[${v}]`}
                  </div>
                )}
                {isCurrent && (
                  <div className="current-indicator">
                    {language === 'es' ? 'calculando' : 'solving'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Formula Callout when Evaluating */}
      {action === 'EVALUATE_CELL' && currentV !== null && currentCoin !== null && (
        <div className="formula-callout">
          <div className="callout-title">
            {language === 'es' ? 'Subproblema en evaluación:' : 'Subproblem under evaluation:'}
          </div>
          <div className="callout-equation">
            <code>
              dp[{currentV}] = min(dp[{currentV}], dp[{currentV} - {currentCoin}] + 1)
              {' ⟶ '}
              min({dp[currentV] === INF ? '∞' : dp[currentV]}, {dp[evaluatingTransitionFrom ?? 0] === INF ? '∞' : (dp[evaluatingTransitionFrom ?? 0] + 1)})
            </code>
          </div>
        </div>
      )}

      {/* Comparison: Greedy vs Dynamic Programming */}
      <div className="comparison-section">
        <div className="strategy-card dp-card">
          <div className="strategy-badge">
            {language === 'es' ? 'Óptimo Global (Programación Dinámica)' : 'Global Optimum (Dynamic Programming)'}
          </div>
          <div className="strategy-result">
            {reconstructedCoins.length > 0 ? (
              <>
                <span className="coin-count-highlight">
                  {reconstructedCoins.length} {language === 'es' ? 'monedas' : 'coins'}
                </span>
                <span className="coins-bag">
                  [{reconstructedCoins.join(', ')}]
                </span>
              </>
            ) : (
              <span className="pending-text">
                {language === 'es' ? 'Calculando tabla...' : 'Computing table...'}
              </span>
            )}
          </div>
          <div className="strategy-note">
            {language === 'es'
              ? 'Explora exhaustivamente subproblemas memoizados garantizando el mínimo exacto.'
              : 'Thoroughly evaluates memoized subproblems guaranteeing true global minimum.'}
          </div>
        </div>

        <div className="strategy-card greedy-card">
          <div className="strategy-badge greedy-badge">
            {language === 'es' ? 'Heurística Greedy' : 'Greedy Heuristic'}
          </div>
          <div className="strategy-result">
            {greedyCoins ? (
              <>
                <span className={`coin-count-highlight ${greedyCoins.length > (dp[target] ?? 0) ? 'greedy-worse' : ''}`}>
                  {greedyCoins.length} {language === 'es' ? 'monedas' : 'coins'}
                </span>
                <span className="coins-bag">
                  [{greedyCoins.join(', ')}]
                </span>
              </>
            ) : (
              <span className="failed-text">
                {language === 'es' ? 'Falla (no puede dar cambio exacto)' : 'Failed (cannot make exact change)'}
              </span>
            )}
          </div>
          <div className="strategy-note">
            {greedyCoins && greedyCoins.length > (dp[target] ?? 0) ? (
              <span className="suboptimal-alert">
                {language === 'es'
                  ? `Subóptimo: Toma $4 y queda obligado a dos $1 (3 monedas) perdiendo el óptimo $3+$3 (2 monedas).`
                  : `Suboptimal: Grabs $4 then forced into two $1s (3 coins), missing the optimal $3+$3 (2 coins).`}
              </span>
            ) : (
              <span>
                {language === 'es'
                  ? 'Elige siempre la moneda de mayor denominación posible.'
                  : 'Always picks largest denomination possible.'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Narrative Event Box */}
      <div className="narrative-box">
        <p className="narrative-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es}
        </p>
      </div>

      {/* DP Recurrence & Greedy Counterexample Rationale (Section 12, 25 & 94) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Recurrencia DP y Contraejemplo Greedy:' : 'DP Recurrence & Greedy Counterexample:'}</strong>{' '}
        {language === 'es'
          ? 'Para cada valor v: dp[v] = min_{c_i ≤ v} (dp[v - c_i] + 1). El enfoque Greedy (tomar la moneda más grande) falla para sistemas no canónicos: con monedas {1, 3, 4} y valor 6, Greedy produce 4+1+1 (3 monedas) mientras que el óptimo es 3+3 (2 monedas). La programación dinámica evalúa exhaustivamente todas las transiciones posibles en tiempo O(V · n) garantizando el mínimo global.'
          : 'For each target value v: dp[v] = min_{c_i ≤ v} (dp[v - c_i] + 1). Greedy selection fails for non-canonical systems: given coins {1, 3, 4} and target 6, greedy picks 4+1+1 (3 coins) while optimal is 3+3 (2 coins). DP explores all optimal subproblems in O(V · n) time, guaranteeing global minimality.'}
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
          <TraceScrubber
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSeek={goToStep}
            language={language}
            showCounter={false}
            ariaLabel={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
          />
          <span className="step-counter">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="speed-selector">
          <span className="speed-label">{language === 'es' ? 'Vel:' : 'Speed:'}</span>
          <div className="segmented-control speed-segmented-control" role="group" aria-label={language === 'es' ? 'Velocidad' : 'Speed'}>
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                className={`segmented-btn ${playbackSpeed === spd ? 'active' : ''}`}
                onClick={() => setSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
