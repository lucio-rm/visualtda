import React, { useMemo } from 'react';
import {
  generateKnapsackBBTrace,
  KnapsackBBStepData,
  DEFAULT_BB_ITEMS
} from '../../engine/algorithms/knapsackBranchAndBoundTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './KnapsackBranchAndBoundVisualizer.css';

export const KnapsackBranchAndBoundVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateKnapsackBBTrace(7, DEFAULT_BB_ITEMS), []);

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
  } = useTraceTimeline<KnapsackBBStepData>(timeline, {
    baseIntervalMs: 700,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const treeNodes = data?.treeNodes || [];
  const currentNodeId = data?.currentNodeId;
  const incumbentBest = data?.incumbentBest ?? 0;
  const prunedCount = data?.prunedCount ?? 0;
  const exploredCount = data?.exploredCount ?? 0;
  const action = data?.action || 'INIT';
  const description = data?.description;

  const nodeMap = useMemo(() => new Map(treeNodes.map((n) => [n.id, n])), [treeNodes]);

  return (
    <div className="knapsack-bb-visualizer" role="region" aria-label={language === 'es' ? 'Visualizador de Mochila con Branch & Bound' : 'Knapsack Branch & Bound Visualizer'}>
      {/* Metrics Row */}
      <div className="kbb-metrics-row">
        <div className="kbb-metric-badge">
          <span>{language === 'es' ? 'Mejor valor alcanzado:' : 'Incumbent best:'}</span>
          <strong>{incumbentBest}</strong>
        </div>
        <div className="kbb-metric-badge">
          <span>{language === 'es' ? 'Nodos explorados:' : 'Explored nodes:'}</span>
          <strong>{exploredCount}</strong>
        </div>
        <div className="kbb-metric-badge">
          <span>{language === 'es' ? 'Ramas podadas por cota:' : 'Pruned by bound:'}</span>
          <strong>{prunedCount}</strong>
        </div>
        <div className={`kbb-metric-badge kbb-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción actual:' : 'Current action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* SVG Tree */}
      <div className="kbb-canvas-container">
        <svg
          viewBox="0 0 500 320"
          className="kbb-svg-canvas"
          role="img"
          aria-label={language === 'es' ? 'Árbol de búsqueda Branch and Bound' : 'Branch and Bound search tree'}
        >
          {/* Edges from Parent to Child */}
          {treeNodes.map((node) => {
            if (!node.parentId) return null;
            const parent = nodeMap.get(node.parentId);
            if (!parent) return null;

            const isCurrentEdge = currentNodeId === node.id;
            let stroke = 'var(--border, #475569)';
            let strokeWidth = 1.5;

            if (isCurrentEdge) {
              stroke = 'var(--accent)';
              strokeWidth = 2.5;
            } else if (node.pruned) {
              stroke = 'var(--state-conflict-bg)';
              strokeWidth = 1;
            } else if (node.isBest) {
              stroke = 'var(--success)';
              strokeWidth = 2.5;
            }

            return (
              <g key={`bb-link-${node.id}`}>
                <line
                  x1={parent.x}
                  y1={parent.y + 12}
                  x2={node.x}
                  y2={node.y - 18}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={(parent.x + node.x) / 2 + (node.decision === 'include' ? -14 : 14)}
                  y={(parent.y + node.y) / 2}
                  fill="var(--text-muted)"
                  fontSize="13px"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {node.decision === 'include' ? '+1' : '0'}
                </text>
              </g>
            );
          })}

          {/* Tree Nodes */}
          {treeNodes.map((node) => {
            const isCurrent = currentNodeId === node.id;
            let fill = 'var(--surface, #0f172a)';
            let stroke = 'var(--border, #64748b)';
            let strokeWidth = 1.5;

            if (isCurrent) {
              fill = 'var(--state-active-bg)';
              stroke = 'var(--accent)';
              strokeWidth = 3;
            } else if (node.isBest) {
              fill = 'var(--state-solution-bg)';
              stroke = 'var(--success)';
              strokeWidth = 2.5;
            } else if (node.pruned) {
              fill = 'var(--state-conflict-bg)';
              stroke = 'var(--danger, var(--error))';
            }

            return (
              <g key={`bb-node-${node.id}`}>
                <rect
                  x={node.x - 42}
                  y={node.y - 18}
                  width={84}
                  height={36}
                  rx={6}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={node.x}
                  y={node.y - 2}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="700"
                >
                  v:{node.value} w:{node.weight}
                </text>
                <text
                  x={node.x}
                  y={node.y + 13}
                  textAnchor="middle"
                  fill={node.pruned ? 'var(--danger, var(--error))' : 'var(--accent)'}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="700"
                >
                  {node.pruned ? (node.pruneReason === 'capacity' ? 'Exceso W' : 'UB ≤ Best') : `UB:${node.upperBound}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Description */}
      {description && (
        <div className="djk-description-box" role="status" aria-live="polite">
          {language === 'es' ? description.es : description.en}
        </div>
      )}

      {/* Branch & Bound Pruning Analysis Card (Section 24 & 31) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Principio de Poda por Cota (Branch & Bound):' : 'Bound-based Pruning Principle (Branch & Bound):'}</strong>{' '}
        {language === 'es'
          ? 'En lugar de podar únicamente cuando la mochila se desborda (peso > capacidad), Branch & Bound calcula en cada nodo una cota superior optimista (UB) resolviendo la relajación continua con la heurística Greedy fraccionaria. Si UB ≤ mejor solución conocida (incumbent), esa rama no puede superar al óptimo y se poda por completo, eliminando ramas enteras del árbol.'
          : 'Rather than pruning only when the knapsack overflows (weight > capacity), Branch & Bound computes an optimistic upper bound (UB) at each node using fractional greedy relaxation. If UB ≤ incumbent best, the entire subtree is pruned, guaranteeing optimality without evaluating all leaves.'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-toolbar" role="toolbar" aria-label="Controles de línea de tiempo">
        <div className="timeline-nav-group">
          <button
            type="button"
            className="ctrl-btn"
            onClick={reset}
            title={language === 'es' ? 'Reiniciar' : 'Reset'}
            aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
          >
            ↺
          </button>
          <button
            type="button"
            className="ctrl-btn"
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            title={language === 'es' ? 'Paso anterior (←)' : 'Step backward (←)'}
            aria-label={language === 'es' ? 'Paso anterior' : 'Step backward'}
          >
            ←
          </button>
          <button
            type="button"
            className={`ctrl-btn ctrl-play-btn ${isPlaying ? 'is-playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="ctrl-btn"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title={language === 'es' ? 'Paso siguiente (→)' : 'Step forward (→)'}
            aria-label={language === 'es' ? 'Paso siguiente' : 'Step forward'}
          >
            →
          </button>
        </div>

        <div className="timeline-scrubber-group">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="scrubber-slider"
            aria-label={language === 'es' ? 'Progreso de pasos de Branch and Bound' : 'Branch and Bound step progress'}
          />
          <span className="step-tag">
            {language === 'es' ? `Paso ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} / ${totalSteps}`}
          </span>
        </div>

        <div className="timeline-speed-group">
          <button
            type="button"
            className={`btn-speed ${playbackSpeed === 0.5 ? 'active' : ''}`}
            onClick={() => setSpeed(0.5)}
          >
            0.5x
          </button>
          <button
            type="button"
            className={`btn-speed ${playbackSpeed === 1 ? 'active' : ''}`}
            onClick={() => setSpeed(1)}
          >
            1x
          </button>
          <button
            type="button"
            className={`btn-speed ${playbackSpeed === 2 ? 'active' : ''}`}
            onClick={() => setSpeed(2)}
          >
            2x
          </button>
        </div>
      </div>
    </div>
  );
};
