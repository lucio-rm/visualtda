import React, { useMemo } from 'react';
import {
  generateKruskalTrace,
  KruskalStepData,
  DEFAULT_KRUSKAL_GRAPH
} from '../../engine/algorithms/kruskalTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './KruskalVisualizer.css';

const COMPONENT_COLORS: Record<string, string> = {
  A: '#38bdf8',
  B: '#f43f5e',
  C: '#10b981',
  D: '#a855f7',
  E: '#f59e0b',
  F: '#06b6d4'
};

export const KruskalVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateKruskalTrace(DEFAULT_KRUSKAL_GRAPH), []);

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
  } = useTraceTimeline<KruskalStepData>(timeline, {
    baseIntervalMs: 700,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const nodes = data?.nodes || DEFAULT_KRUSKAL_GRAPH.nodes;
  const edges = data?.edges || DEFAULT_KRUSKAL_GRAPH.edges;
  const sortedEdges = data?.sortedEdges || [];
  const currentEdgeIndex = data?.currentEdgeIndex ?? -1;
  const mstEdges = data?.mstEdges || [];
  const rejectedEdges = data?.rejectedEdges || [];
  const components = data?.components || {};
  const totalMstWeight = data?.totalMstWeight ?? 0;
  const action = data?.action || 'INIT';
  const description = data?.description;

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className="kruskal-visualizer" role="region" aria-label="Visualizador del Algoritmo de Kruskal">
      {/* Metrics Row */}
      <div className="kru-metrics-row">
        <div className="kru-metric-badge">
          <span>{language === 'es' ? 'Aristas en el AGM:' : 'MST Edges:'}</span>
          <strong>{mstEdges.length} / {nodes.length - 1}</strong>
        </div>
        <div className="kru-metric-badge">
          <span>{language === 'es' ? 'Costo total del AGM:' : 'Total MST Weight:'}</span>
          <strong>{totalMstWeight}</strong>
        </div>
        <div className="kru-metric-badge">
          <span>{language === 'es' ? 'Aristas rechazadas (ciclos):' : 'Rejected (cycles):'}</span>
          <strong>{rejectedEdges.length}</strong>
        </div>
        <div className={`kru-metric-badge kru-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción actual:' : 'Current action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Sorted Edge Pills Bar */}
      <div className="kru-edges-list" aria-label="Lista de aristas ordenadas por peso">
        {sortedEdges.map((e, idx) => {
          const isAccepted = mstEdges.includes(e.id);
          const isRejected = rejectedEdges.includes(e.id);
          const isCurrent = currentEdgeIndex === idx;

          let pillClass = 'kru-edge-pill';
          if (isAccepted) pillClass += ' accepted';
          else if (isRejected) pillClass += ' rejected';
          if (isCurrent) pillClass += ' current';

          return (
            <div key={e.id} className={pillClass}>
              <span>{e.u}—{e.v}</span>
              <strong>w:{e.weight}</strong>
              {isAccepted && <span>[MST]</span>}
              {isRejected && <span>{language === 'es' ? '[Ciclo]' : '[Cycle]'}</span>}
            </div>
          );
        })}
      </div>

      {/* SVG Canvas */}
      <div className="kru-canvas-container">
        <svg
          viewBox="0 0 480 310"
          className="kru-svg-canvas"
          role="img"
          aria-label={language === 'es' ? 'Grafo no dirigido para el algoritmo de Kruskal' : 'Undirected graph for Kruskal algorithm'}
        >
          {/* Edges */}
          {edges.map((edge, idx) => {
            const u = nodeMap.get(edge.u);
            const v = nodeMap.get(edge.v);
            if (!u || !v) return null;

            const isAccepted = mstEdges.includes(edge.id);
            const isRejected = rejectedEdges.includes(edge.id);
            const currentEdge = sortedEdges[currentEdgeIndex];
            const isCurrent = currentEdge && currentEdge.id === edge.id;

            let strokeColor = 'var(--border-strong, #64748b)';
            let strokeWidth = 1.5;
            let strokeDash: string | undefined = undefined;

            if (isAccepted) {
              strokeColor = '#10b981';
              strokeWidth = 3.5;
            } else if (isCurrent) {
              strokeColor = '#38bdf8';
              strokeWidth = 3;
            } else if (isRejected) {
              strokeColor = 'rgba(239, 68, 68, 0.4)';
              strokeWidth = 1.5;
              strokeDash = '4 4';
            }

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g key={`edge-${edge.id}-${idx}`}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDash}
                />
                <circle cx={midX} cy={midY} r={11} fill="var(--surface, #0f172a)" stroke={strokeColor} strokeWidth={1} />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill="var(--text, #f8fafc)"
                  fontFamily="var(--font-mono)"
                  fontSize="11px"
                  fontWeight="700"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const root = components[node.id] || node.id;
            const rootColor = COMPONENT_COLORS[root] || 'var(--accent, #6366f1)';

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill="var(--surface, #0f172a)"
                  stroke={rootColor}
                  strokeWidth={3}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="var(--text, #f8fafc)"
                  fontFamily="var(--font-mono)"
                  fontSize="14px"
                  fontWeight="700"
                >
                  {node.id}
                </text>
                {/* Component Label */}
                <rect
                  x={node.x - 24}
                  y={node.y - 36}
                  width={48}
                  height={15}
                  rx={3}
                  fill={rootColor}
                  opacity={0.85}
                />
                <text
                  x={node.x}
                  y={node.y - 25}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontFamily="var(--font-mono)"
                  fontSize="9px"
                  fontWeight="800"
                >
                  comp:{root}
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
            ⏮
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
            {isPlaying ? '⏸' : '▶'}
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
            aria-label="Progreso de pasos de Kruskal"
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
