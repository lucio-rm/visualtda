import React, { useMemo } from 'react';
import {
  generateKnapsackDpTrace,
  KnapsackDpStepData,
  DEFAULT_DP_ITEMS,
  DEFAULT_DP_CAPACITY
} from '../../engine/algorithms/knapsackDpTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import './KnapsackDpVisualizer.css';

export const KnapsackDpVisualizer: React.FC = () => {
  const timeline = useMemo(
    () => generateKnapsackDpTrace(DEFAULT_DP_ITEMS, DEFAULT_DP_CAPACITY),
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
          Paso {currentStepIndex + 1} / {totalSteps}
        </span>
        <p className="step-message-text">
          {currentEvent?.message?.es || 'Inicializando algoritmo...'}
        </p>
      </div>

      {/* Formula & Live Decision Box */}
      <div className="formula-callout">
        <span className="formula-title">Decisión de Recurrencia en Celda Actual:</span>
        <div className="formula-body">
          {decisionType === 'base_case' && (
            <span>Caso Base: Con 0 elementos o capacidad 0, DP[i][w] = 0.</span>
          )}
          {decisionType === 'cannot_fit' && highlightTarget && (
            <span>
              El ítem {highlightTarget[0]} tiene peso {items[highlightTarget[0] - 1]?.weight} &gt; capacidad actual {highlightTarget[1]}.
              Se hereda directamente: <strong>DP[{highlightTarget[0]}][{highlightTarget[1]}] = DP[{highlightTarget[0] - 1}][{highlightTarget[1]}]</strong>.
            </span>
          )}
          {decisionType === 'compare' && comparison && highlightTarget && (
            <>
              <span>
                DP[{highlightTarget[0]}][{highlightTarget[1]}] = max(
              </span>
              <span className="formula-tag exclude">
                Excluir: ${comparison.excludeValue}
              </span>
              <span>,</span>
              <span className="formula-tag include">
                Incluir: ${comparison.includeValue}
              </span>
              <span>) &rarr;</span>
              <span className="formula-tag chosen">
                {comparison.chosen === 'include' ? '¡INCLUIDO!' : 'EXCLUIDO'} (Valor: ${Math.max(comparison.excludeValue, comparison.includeValue)})
              </span>
            </>
          )}
          {decisionType === 'reconstruct' && (
            <span>
              Fase de Reconstrucción: Rastreo de retroceso desde celda final hacia casos base para identificar ítems que aportaron valor.
            </span>
          )}
          {decisionType === 'complete' && (
            <span>
              ¡Solución Final! Subconjunto óptimo reconstruido que maximiza el valor respetando la capacidad máxima.
            </span>
          )}
          {decisionType === 'init' && (
            <span>Asignando memoria para la matriz DP de (n+1) × (W+1).</span>
          )}
        </div>
      </div>

      {/* 2D DP Table */}
      <div className="dp-table-wrapper" tabIndex={0} aria-label="Tabla de Programación Dinámica">
        <table className="dp-table">
          <thead>
            <tr>
              <th className="row-header-th">Ítem \ Capacidad (w)</th>
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
                  <span className="item-name">i=0 (Vacío)</span>
                  <span className="item-specs">Base: 0 ítems</span>
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
                        peso={item.weight} | val=${item.value}
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
          <span>Ocupación de la Mochila</span>
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
                  🎒 {it.name} (w={it.weight}, v=${it.value})
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Playback Controls */}
      <div className="timeline-controls-bar">
        <div className="timeline-buttons-group">
          <button
            type="button"
            className="btn-ctrl"
            onClick={reset}
            aria-label="Reiniciar (R)"
            title="Reiniciar (tecla R)"
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-ctrl"
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            aria-label="Paso anterior (Flecha Izquierda)"
            title="Paso anterior (←)"
          >
            ◀
          </button>
          <button
            type="button"
            className="btn-ctrl btn-play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
            title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="btn-ctrl"
            onClick={stepForward}
            disabled={currentStepIndex === totalSteps - 1}
            aria-label="Paso siguiente (Flecha Derecha)"
            title="Paso siguiente (→)"
          >
            ▶
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
            aria-label="Línea de tiempo de estados"
          />
        </div>

        <div className="timeline-speed-group">
          <span className="speed-label">Velocidad:</span>
          {[0.5, 1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => setSpeed(spd)}
              aria-label={`Velocidad ${spd}x`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
