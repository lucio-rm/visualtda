import React, { useMemo } from 'react';
import {
  generateWeightedIntervalTrace,
  WeightedIntervalStepData,
  DEFAULT_WEIGHTED_INTERVALS
} from '../../engine/algorithms/weightedIntervalTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './WeightedIntervalVisualizer.css';

export const WeightedIntervalVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(() => generateWeightedIntervalTrace(DEFAULT_WEIGHTED_INTERVALS), []);

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
  } = useTraceTimeline<WeightedIntervalStepData>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const sorted = data?.sortedIntervals || DEFAULT_WEIGHTED_INTERVALS;
  const pArray = data?.pArray || [];
  const optArray = data?.optArray || [];
  const currentJ = data?.currentJ ?? null;
  const evalExcludeVal = data?.evalExcludeVal ?? null;
  const evalIncludeVal = data?.evalIncludeVal ?? null;
  const reconstructedIds = data?.reconstructedIds || [];
  const greedyIds = data?.greedyIds || [];
  const action = data?.action || 'INIT';

  // Calculate coordinate mapping for intervals: max time in default set is 12
  const maxTime = Math.max(...sorted.map((i) => i.end), 12);

  const dpWeight = sorted
    .filter((t) => reconstructedIds.includes(t.id))
    .reduce((sum, t) => sum + t.weight, 0);

  const greedyWeight = sorted
    .filter((t) => greedyIds.includes(t.id))
    .reduce((sum, t) => sum + t.weight, 0);

  return (
    <div className="weighted-interval-visualizer">
      {/* Top Header */}
      <div className="visualizer-header">
        <div className="phase-indicator">
          <span className="phase-badge-label">
            {language === 'es' ? 'Fase DP:' : 'DP Phase:'}
          </span>
          <span className="phase-badge-name">{action.replace(/_/g, ' ')}</span>
        </div>
        <div className="status-counter">
          {language === 'es' ? 'Tareas Elegidas:' : 'Selected Tasks:'}{' '}
          <strong className="tasks-highlight">
            [{reconstructedIds.join(', ') || '—'}]
          </strong>{' '}
          | {language === 'es' ? 'Valor Total:' : 'Total Weight:'}{' '}
          <span className="weight-badge">${dpWeight}</span>
        </div>
      </div>

      {/* Timeline Schedule Canvas */}
      <div className="timeline-schedule-box">
        <div className="schedule-legend">
          <span>
            {language === 'es'
              ? '⏱️ Diagrama Temporal de Tareas (Ordenadas por Fin)'
              : '⏱️ Task Timeline (Sorted by Finish Time)'}
          </span>
          <div className="legend-items">
            <span className="legend-pill pill-selected">
              <span className="dot dot-sel"></span>
              {language === 'es' ? 'Óptima (DP)' : 'Optimal (DP)'}
            </span>
            <span className="legend-pill pill-eval">
              <span className="dot dot-eval"></span>
              {language === 'es' ? 'Evaluando j' : 'Evaluating j'}
            </span>
          </div>
        </div>

        <div className="schedule-tracks">
          {sorted.map((task, idx) => {
            const j = idx + 1;
            const isEvaluating = currentJ === j;
            const isSelected = reconstructedIds.includes(task.id);
            const isGreedy = greedyIds.includes(task.id);
            const predIndex = pArray[j] ?? 0;

            const leftPct = (task.start / maxTime) * 100;
            const widthPct = ((task.end - task.start) / maxTime) * 100;

            let barClass = 'task-interval-bar';
            if (isEvaluating) barClass += ' bar-evaluating';
            if (isSelected) barClass += ' bar-selected';

            return (
              <div key={task.id} className="task-track-row">
                <div className="task-row-label">
                  <span className="task-id-text">{task.id}</span>
                  <span className="task-pred-badge">
                    p({j})={predIndex}
                  </span>
                </div>
                <div className="task-track-timeline">
                  <div
                    className={barClass}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="bar-task-name">{task.id}</span>
                    <span className="bar-task-weight">${task.weight}</span>
                    <span className="bar-task-range">
                      [{task.start}, {task.end}]
                    </span>
                  </div>
                </div>
                <div className="task-flags">
                  {isSelected && (
                    <span className="flag-dp" title="Elegido por DP">
                      ✓ DP
                    </span>
                  )}
                  {isGreedy && (
                    <span className="flag-greedy" title="Elegido por Greedy">
                      ★ Greedy
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DP Table & Evaluation Callout */}
      <div className="dp-panel-grid">
        <div className="dp-table-container">
          <div className="panel-title">
            {language === 'es' ? '📊 Tabla de Estados DP' : '📊 DP State Table'}
          </div>
          <table className="dp-opt-table">
            <thead>
              <tr>
                <th>j</th>
                <th>0</th>
                {sorted.map((t, idx) => (
                  <th key={t.id} className={currentJ === idx + 1 ? 'th-active' : ''}>
                    {idx + 1} ({t.id})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="row-hdr">p(j)</td>
                <td>—</td>
                {sorted.map((_, idx) => (
                  <td key={idx}>
                    {pArray[idx + 1] !== undefined ? pArray[idx + 1] : '?'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="row-hdr">OPT[j]</td>
                <td>0</td>
                {sorted.map((_, idx) => {
                  const j = idx + 1;
                  const isCurrent = currentJ === j;
                  return (
                    <td key={idx} className={isCurrent ? 'td-active' : ''}>
                      {optArray[j] !== undefined && optArray[j] > 0
                        ? `$${optArray[j]}`
                        : optArray[j] === 0 && j <= (currentJ ?? 0)
                        ? '$0'
                        : '?'}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Live Evaluation Box */}
        {action === 'EVALUATE_INTERVAL' && currentJ !== null && (
          <div className="eval-callout-card">
            <div className="callout-title">
              {language === 'es'
                ? `Decisión de Bellman para Tarea ${sorted[currentJ - 1]?.id}:`
                : `Bellman Choice for Task ${sorted[currentJ - 1]?.id}:`}
            </div>
            <div className="choices-row">
              <div className={`choice-col ${evalExcludeVal! >= evalIncludeVal! ? 'winner' : ''}`}>
                <span className="choice-title">
                  {language === 'es' ? 'Excluir Tarea' : 'Exclude Task'}
                </span>
                <span className="choice-math">
                  OPT[{currentJ - 1}] = <strong>${evalExcludeVal}</strong>
                </span>
              </div>
              <div className="vs-tag">VS</div>
              <div className={`choice-col ${evalIncludeVal! > evalExcludeVal! ? 'winner' : ''}`}>
                <span className="choice-title">
                  {language === 'es' ? 'Incluir Tarea' : 'Include Task'}
                </span>
                <span className="choice-math">
                  ${sorted[currentJ - 1]?.weight} + OPT[{pArray[currentJ]}] ={' '}
                  <strong>${evalIncludeVal}</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison: Greedy vs Dynamic Programming */}
      <div className="comparison-cards-row">
        <div className="strategy-card card-dp">
          <div className="strategy-tag">
            {language === 'es' ? 'Óptimo Global (Programación Dinámica)' : 'Global Optimum (Dynamic Programming)'}
          </div>
          <div className="strategy-stat">${dpWeight}</div>
          <div className="strategy-items">
            [{reconstructedIds.join(', ') || '...'}]
          </div>
          <div className="strategy-desc">
            {language === 'es'
              ? 'Evalúa exhaustivamente subproblemas compatibles memoizados en O(n log n).'
              : 'Thoroughly evaluates memoized compatible subproblems in O(n log n).'}
          </div>
        </div>

        <div className="strategy-card card-greedy">
          <div className="strategy-tag greedy-tag">
            {language === 'es' ? 'Heurística Greedy (Fin Más Temprano)' : 'Greedy Heuristic (Earliest Finish)'}
          </div>
          <div className="strategy-stat greedy-stat">${greedyWeight}</div>
          <div className="strategy-items">[{greedyIds.join(', ')}]</div>
          <div className="strategy-desc">
            {greedyWeight < dpWeight ? (
              <span className="greedy-fail-alert">
                ⚠️ {language === 'es'
                  ? `Falla al priorizar tareas cortas de bajo valor ($${greedyWeight} vs $${dpWeight}).`
                  : `Fails by prioritizing short low-value tasks ($${greedyWeight} vs $${dpWeight}).`}
              </span>
            ) : (
              <span>{language === 'es' ? 'Coincide en este caso.' : 'Matches in this case.'}</span>
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
