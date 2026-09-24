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
    <div className="knapsack-bb-visualizer" role="region" aria-label="Visualizador de Mochila con Branch & Bound">
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
              stroke = '#38bdf8';
              strokeWidth = 2.5;
            } else if (node.pruned) {
              stroke = 'rgba(239, 68, 68, 0.4)';
              strokeWidth = 1;
            } else if (node.isBest) {
              stroke = '#10b981';
              strokeWidth = 2.5;
            }

            return (
              <g key={`bb-link-${node.id}`}>
                <line
                  x1={parent.x}
                  y1={parent.y + 12}
                  x2={node.x}
                  y2={node.y - 12}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={(parent.x + node.x) / 2 + (node.decision === 'include' ? -12 : 12)}
                  y={(parent.y + node.y) / 2}
                  fill="var(--text-muted)"
                  fontSize="9px"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
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
              fill = 'rgba(56, 189, 248, 0.25)';
              stroke = '#38bdf8';
              strokeWidth = 3;
            } else if (node.isBest) {
              fill = 'rgba(16, 185, 129, 0.25)';
              stroke = '#10b981';
              strokeWidth = 2.5;
            } else if (node.pruned) {
              fill = 'rgba(239, 68, 68, 0.2)';
              stroke = 'var(--danger, #ef4444)';
            }

            return (
              <g key={`bb-node-${node.id}`}>
                <rect
                  x={node.x - 28}
                  y={node.y - 14}
                  width={56}
                  height={28}
                  rx={4}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                />
                <text
                  x={node.x}
                  y={node.y - 2}
                  textAnchor="middle"
                  fill="var(--text, #f8fafc)"
                  fontFamily="var(--font-mono)"
                  fontSize="9px"
                  fontWeight="700"
                >
                  v:{node.value} w:{node.weight}
                </text>
                <text
                  x={node.x}
                  y={node.y + 10}
                  textAnchor="middle"
                  fill={node.pruned ? 'var(--danger, #ef4444)' : 'var(--accent, #38bdf8)'}
                  fontFamily="var(--font-mono)"
                  fontSize="8.5px"
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
            title={language === 'es' ? 'Paso anterior' : 'Step backward'}
            aria-label={language === 'es' ? 'Paso anterior' : 'Step backward'}
          >
            ◀
          </button>
          <button
            type="button"
            className={`ctrl-btn ctrl-play-btn ${isPlaying ? 'is-playing' : ''}`}
            onClick={togglePlay}
            title={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="ctrl-btn"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title={language === 'es' ? 'Paso siguiente' : 'Step forward'}
            aria-label={language === 'es' ? 'Paso siguiente' : 'Step forward'}
          >
            ▶
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
            aria-label="Progreso de pasos de Branch and Bound"
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
