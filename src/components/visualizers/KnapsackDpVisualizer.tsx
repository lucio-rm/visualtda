import React, { useState, useMemo } from 'react';
import {
  generateKnapsackDpTrace,
  KnapsackDpStepData,
  DEFAULT_DP_ITEMS,
  DEFAULT_DP_CAPACITY
} from '../../engine/algorithms/knapsackDpTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './KnapsackDpVisualizer.css';

const PRESETS = [
  {
    id: 'standard',
    label: { es: 'Estándar (4 ítems, C = 7)', en: 'Standard (4 items, C = 7)' },
    items: DEFAULT_DP_ITEMS,
    capacity: DEFAULT_DP_CAPACITY
  },
  {
    id: 'counterexample',
    label: { es: 'Contraejemplo Heurística Greedy (C = 10)', en: 'Greedy Heuristic Counterexample (C = 10)' },
    items: [
      { id: 'A', name: 'Ítem A', weight: 6, value: 30 },
      { id: 'B', name: 'Ítem B', weight: 3, value: 14 },
      { id: 'C', name: 'Ítem C', weight: 4, value: 16 },
      { id: 'D', name: 'Ítem D', weight: 2, value: 9 }
    ],
    capacity: 10
  }
];

export const KnapsackDpVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('standard');
  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const timeline = useMemo(
    () => generateKnapsackDpTrace(activePreset.items, activePreset.capacity),
    [activePreset]
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
  } = useTraceTimeline<KnapsackDpStepData>(timeline, {
    baseIntervalMs: 700,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const items = data?.items || DEFAULT_DP_ITEMS;
  const capacity = data?.capacity || DEFAULT_DP_CAPACITY;
  const table = data?.table || [];
  const computedMask = data?.computedMask || [];
  const highlightTarget = data?.highlightTarget;
  const excludeSource = data?.excludeSource;
  const includeSource = data?.includeSource;
  const comparison = data?.comparison;
  const decisionType = data?.decisionType || 'init';
  const selectedItemIds = data?.selectedItemIds || [];
  const totalWeight = data?.totalWeight || 0;
  const totalValue = data?.totalValue || 0;

  const getCellClassName = (r: number, c: number) => {
    const classes = ['dp-cell'];
    if (computedMask[r]?.[c]) {
      classes.push('computed');
    }
    if (highlightTarget && highlightTarget[0] === r && highlightTarget[1] === c) {
      if (decisionType === 'reconstruct') {
        classes.push('reconstruction-cell');
      } else {
        classes.push('target-cell');
      }
    } else if (excludeSource && excludeSource[0] === r && excludeSource[1] === c) {
      classes.push('exclude-source');
    } else if (includeSource && includeSource[0] === r && includeSource[1] === c) {
      classes.push('include-source');
    }
    return classes.join(' ');
  };

  return (
    <div className="knapsack-dp-visualizer">
      {/* Preset Selector */}
      <div className="knapsack-presets" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Instancia:' : 'Instance:'}
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

      {/* Header & Badges */}
      <div className="knapsack-header-bar">
        <h4>Construcción de la Tabla 2D (Bottom-Up)</h4>
        <div className="knapsack-stats-group">
          <span className="stat-badge stat-highlight">
            <span className="stat-num">${totalValue}</span>
            <span className="stat-label">Valor Óptimo</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">
              {totalWeight} / {capacity}
            </span>
            <span className="stat-label">Peso Mochila</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{selectedItemIds.length}</span>
            <span className="stat-label">Ítems Óptimos</span>
          </span>
        </div>
      </div>

      {/* Step Narrative Banner */}
      <div className={`step-narrative-banner ${currentEvent?.type || 'init'}`}>
        <span className="step-tag">
          {language === 'es' ? `Paso ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <p className="step-message-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es || (language === 'es' ? 'Inicializando algoritmo...' : 'Initializing algorithm...')}
        </p>
      </div>

      {/* Formula & Live Decision Box */}
      <div className="formula-callout">
        <span className="formula-title">
          {language === 'es' ? 'Decisión de Recurrencia en Celda Actual:' : 'Recurrence Decision at Current Cell:'}
        </span>
        <div className="formula-body">
          {decisionType === 'base_case' && (
            <span>
              {language === 'es'
                ? 'Caso Base: Con 0 elementos o capacidad 0, DP[i][w] = 0.'
                : 'Base Case: With 0 items or capacity 0, DP[i][w] = 0.'}
            </span>
          )}
          {decisionType === 'cannot_fit' && highlightTarget && (
            <span>
              {language === 'es'
                ? `El ítem ${highlightTarget[0]} tiene peso ${items[highlightTarget[0] - 1]?.weight} > capacidad actual ${highlightTarget[1]}. Se hereda directamente: `
                : `Item ${highlightTarget[0]} has weight ${items[highlightTarget[0] - 1]?.weight} > current capacity ${highlightTarget[1]}. Inherited directly: `}
              <strong>DP[{highlightTarget[0]}][{highlightTarget[1]}] = DP[{highlightTarget[0] - 1}][{highlightTarget[1]}]</strong>.
            </span>
          )}
          {decisionType === 'compare' && comparison && highlightTarget && (
            <>
              <span>
                DP[{highlightTarget[0]}][{highlightTarget[1]}] = max(
              </span>
              <span className="formula-tag exclude">
                {language === 'es' ? 'Excluir: $' : 'Exclude: $'}{comparison.excludeValue}
              </span>
              <span>,</span>
              <span className="formula-tag include">
                {language === 'es' ? 'Incluir: $' : 'Include: $'}{comparison.includeValue}
              </span>
              <span>) &rarr;</span>
              <span className="formula-tag chosen">
                {comparison.chosen === 'include'
                  ? (language === 'es' ? 'INCLUIDO' : 'INCLUDED')
                  : (language === 'es' ? 'EXCLUIDO' : 'EXCLUDED')} ({language === 'es' ? 'Valor: $' : 'Value: $'}{Math.max(comparison.excludeValue, comparison.includeValue)})
              </span>
            </>
          )}
          {decisionType === 'reconstruct' && (
            <span>
              {language === 'es'
                ? 'Fase de Reconstrucción: Rastreo de retroceso desde celda final hacia casos base para identificar ítems que aportaron valor.'
                : 'Backtracking Reconstruction Phase: Tracing backwards from final cell to identify which items contributed value.'}
            </span>
          )}
          {decisionType === 'complete' && (
            <span>
              {language === 'es'
                ? 'Solución óptima alcanzada: subconjunto reconstruido que maximiza el valor respetando la restricción de capacidad W.'
                : 'Optimal solution achieved: reconstructed subset that maximizes value respecting capacity bound W.'}
            </span>
          )}
          {decisionType === 'init' && (
            <span>
              {language === 'es'
                ? 'Asignando memoria para la matriz DP de (n+1) × (W+1).'
                : 'Allocating memory for DP matrix of dimensions (n+1) × (W+1).'}
            </span>
          )}
        </div>
      </div>

      {/* 2D DP Table */}
      <div className="dp-table-wrapper" tabIndex={0} aria-label={language === 'es' ? 'Tabla de Programación Dinámica' : 'Dynamic Programming Table'}>
        <table className="dp-table">
          <thead>
            <tr>
              <th className="row-header-th">
                {language === 'es' ? 'Ítem \\ Capacidad (w)' : 'Item \\ Capacity (w)'}
              </th>
              {Array.from({ length: capacity + 1 }, (_, w) => (
                <th key={`head-w-${w}`}>w={w}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Row 0: Base Case */}
            <tr>
              <th className="row-header-th">
                <div className="item-row-info">
                  <span className="item-name">{language === 'es' ? 'i=0 (Vacío)' : 'i=0 (Empty)'}</span>
                  <span className="item-specs">{language === 'es' ? 'Base: 0 ítems' : 'Base: 0 items'}</span>
                </div>
              </th>
              {Array.from({ length: capacity + 1 }, (_, w) => (
                <td key={`cell-0-${w}`} className={getCellClassName(0, w)}>
                  {computedMask[0]?.[w] ? table[0]?.[w] : '-'}
                </td>
              ))}
            </tr>

            {/* Rows 1..n */}
            {items.map((item, idx) => {
              const r = idx + 1;
              return (
                <tr key={item.id}>
                  <th className="row-header-th">
                    <div className="item-row-info">
                      <span className="item-name">
                        i={r}: {item.name}
                      </span>
                      <span className="item-specs">
                        {language === 'es' ? `peso=${item.weight} | val=$${item.value}` : `weight=${item.weight} | val=$${item.value}`}
                      </span>
                    </div>
                  </th>
                  {Array.from({ length: capacity + 1 }, (_, w) => (
                    <td key={`cell-${r}-${w}`} className={getCellClassName(r, w)}>
                      {computedMask[r]?.[w] ? `$${table[r]?.[w]}` : '-'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Backpack Status Preview */}
      <div className="backpack-summary-card">
        <div className="gauge-label-row">
          <span>{language === 'es' ? 'Ocupación de la Mochila' : 'Knapsack Occupancy'}</span>
          <span>
            {totalWeight} kg / {capacity} kg ({Math.round((totalWeight / capacity) * 100)}%)
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(100, (totalWeight / capacity) * 100)}%` }}
          />
        </div>
        {selectedItemIds.length > 0 && (
          <div className="backpack-items-list">
            {items
              .filter((it) => selectedItemIds.includes(it.id))
              .map((it) => (
                <span key={it.id} className="backpack-item-chip">
                  {it.name} (w={it.weight}, v=${it.value})
                </span>
              ))}
          </div>
        )}
      </div>

      {/* DP Table & Reconstruction Rationale Card (Section 12, 25 & 50) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Recurrencia de Mochila 0/1 y Reconstrucción Óptima (K&T §6.4):' : '0/1 Knapsack DP Recurrence & Reconstruction (K&T §6.4):'}</strong>{' '}
        {language === 'es'
          ? 'Para el objeto i y capacidad w: si w_i > w se hereda M[i-1, w]; si w_i ≤ w se elige max(M[i-1, w], v_i + M[i-1, w - w_i]). Para reconstruir el subconjunto óptimo, se retrocede desde M[n, W]: si M[i, w] > M[i-1, w], el objeto i fue tomado obligatoriamente, se añade a la mochila y se salta a la capacidad remanente w - w_i. Tiempo y memoria: O(n · W).'
          : 'For item i and capacity w: if w_i > w inherit M[i-1, w]; if w_i ≤ w pick max(M[i-1, w], v_i + M[i-1, w - w_i]). To reconstruct optimal items, backtrack from M[n, W]: if M[i, w] > M[i-1, w], item i was included, and capacity decrements to w - w_i. Runtime and memory: O(n · W).'}
      </div>

      {/* Playback Controls */}
      <div className="timeline-controls-bar">
        <div className="timeline-buttons-group">
          <button
            type="button"
            className="btn-ctrl"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar (R)' : 'Reset (R)'}
            title={language === 'es' ? 'Reiniciar (tecla R)' : 'Reset (key R)'}
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-ctrl"
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            aria-label={language === 'es' ? 'Paso anterior (Flecha Izquierda)' : 'Previous step (Left Arrow)'}
            title={language === 'es' ? 'Paso anterior (←)' : 'Previous step (←)'}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-ctrl btn-play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
            title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="btn-ctrl"
            onClick={stepForward}
            disabled={currentStepIndex === totalSteps - 1}
            aria-label={language === 'es' ? 'Paso siguiente (Flecha Derecha)' : 'Next step (Right Arrow)'}
            title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
          >
            →
          </button>
        </div>

        <div className="timeline-slider-wrapper">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-slider"
            aria-label={language === 'es' ? 'Línea de tiempo de estados' : 'State timeline'}
          />
        </div>

        <div className="timeline-speed-group">
          <span className="speed-label">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
          {[0.5, 1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => setSpeed(spd)}
              aria-label={language === 'es' ? `Velocidad ${spd}x` : `Speed ${spd}x`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
