import React, { useMemo } from 'react';
import {
  generateMaxFlowTrace,
  MaxFlowStepData,
  DEFAULT_FLOW_NETWORK,
  DEFAULT_NODE_POSITIONS
} from '../../engine/algorithms/maxFlowTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './MaxFlowVisualizer.css';

export const MaxFlowVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(
    () => generateMaxFlowTrace(DEFAULT_FLOW_NETWORK, DEFAULT_NODE_POSITIONS),
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
  } = useTraceTimeline<MaxFlowStepData>(timeline, {
    baseIntervalMs: 850,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const nodes = data?.nodes || DEFAULT_NODE_POSITIONS;
  const edges = data?.edges || [];
  const currentFlow = data?.currentFlow || 0;
  const augmentingPath = data?.augmentingPath;
  const bottleneckCapacity = data?.bottleneckCapacity;
  const minCutS = data?.minCutS || [];
  const minCutT = data?.minCutT || [];
  const minCutCapacity = data?.minCutCapacity;
  const phase = data?.phase || 'init';

  const nodeMap = useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    for (const n of nodes) {
      map.set(n.id, { x: n.x, y: n.y });
    }
    return map;
  }, [nodes]);

  const sSet = useMemo(() => new Set(minCutS), [minCutS]);
  const tSet = useMemo(() => new Set(minCutT), [minCutT]);

  return (
    <div
      className="maxflow-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Flujo Máximo' : 'Max Flow Visualizer'}
    >
      {/* Header Bar */}
      <div className="maxflow-header-bar">
        <h4>{language === 'es' ? 'Algoritmo de Edmonds-Karp: Redes y Corte Mínimo' : 'Edmonds-Karp Algorithm: Networks & Min-Cut'}</h4>
        <div className="knapsack-stats-group">
          <span className="stat-badge stat-highlight">
            <span className="stat-num">{currentFlow}</span>
            <span className="stat-label">{language === 'es' ? 'Flujo Actual' : 'Current Flow'}</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{minCutCapacity ?? '-'}</span>
            <span className="stat-label">{language === 'es' ? 'Corte Mínimo' : 'Min Cut'}</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{edges.filter((e) => e.flow === e.capacity && e.capacity > 0).length}</span>
            <span className="stat-label">{language === 'es' ? 'Saturadas' : 'Saturated'}</span>
          </span>
        </div>
      </div>

      {/* Step Narrative Banner */}
      <div className={`step-narrative-banner ${currentEvent?.type || 'init'}`}>
        <span className="step-tag">
          {language === 'es' ? `Paso ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <p className="step-message-text">
          {language === 'es'
            ? currentEvent?.message?.es || 'Iniciando red de flujo...'
            : currentEvent?.message?.en || 'Starting flow network...'}
        </p>
      </div>

      {/* Augmenting Path or Min-Cut Callout */}
      {augmentingPath && (
        <div className="path-info-box">
          <span className="path-info-title">
            {language === 'es' ? 'Camino de Aumento BFS Activo:' : 'Active BFS Augmenting Path:'}
          </span>
          <div>
            <span className="path-badge">{augmentingPath.join(' → ')}</span>
            <span style={{ marginLeft: '12px' }}>
              {language === 'es' ? `Cuello de botella: Δ = ${bottleneckCapacity}` : `Bottleneck: Δ = ${bottleneckCapacity}`}
            </span>
          </div>
        </div>
      )}

      {minCutS.length > 0 && (
        <div className="path-info-box">
          <span className="path-info-title">
            {language === 'es' ? 'Partición de Corte Mínimo (S, T):' : 'Minimum Cut Partition (S, T):'}
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="mincut-badge-s">{`S = {${minCutS.join(', ')}}`}</span>
            <span>&nbsp;|&nbsp;</span>
            <span className="mincut-badge-t">{`T = {${minCutT.join(', ')}}`}</span>
            <span style={{ marginLeft: '12px', fontWeight: 700 }}>
              {language === 'es' ? `Capacidad c(S, T) = ${minCutCapacity} == Flujo ${currentFlow}` : `Capacity c(S, T) = ${minCutCapacity} == Flow ${currentFlow}`}
            </span>
          </div>
        </div>
      )}

      {/* SVG Graph Canvas */}
      <div className="flow-graph-container">
        <svg
          viewBox="0 0 500 300"
          className="flow-graph-svg"
          role="img"
          aria-label={language === 'es' ? 'Grafo de la red de capacidades y flujo' : 'Capacities and flow network graph'}
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--color-border-strong)" />
            </marker>
            <marker
              id="arrow-sat"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
            <marker
              id="arrow-aug"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker
              id="arrow-cut"
              viewBox="0 0 10 10"
              refX="26"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e) => {
            const p1 = nodeMap.get(e.u);
            const p2 = nodeMap.get(e.v);
            if (!p1 || !p2) return null;

            const isSat = e.flow === e.capacity && e.capacity > 0;
            const isAug = e.isInAugmentingPath;
            const isCut = e.isMinCutCrossing;

            let markerId = 'arrow';
            if (isCut) markerId = 'arrow-cut';
            else if (isAug) markerId = 'arrow-aug';
            else if (isSat) markerId = 'arrow-sat';

            let lineClass = 'flow-edge-line';
            if (isCut) lineClass += ' mincut-crossing';
            else if (isAug) lineClass += ' augmenting';
            else if (isSat) lineClass += ' saturated';

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g key={`edge-${e.u}-${e.v}`}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={lineClass}
                  markerEnd={`url(#${markerId})`}
                />
                {/* Edge Flow / Capacity Label */}
                <rect
                  x={midX - 22}
                  y={midY - 10}
                  width={44}
                  height={20}
                  className="edge-label-bg"
                />
                <text
                  x={midX}
                  y={midY}
                  className={`edge-label-text ${isAug ? 'augmenting' : isSat ? 'saturated' : ''}`}
                >
                  {e.flow}/{e.capacity}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            let nodeClass = 'graph-node-circle';
            if (n.isSource) nodeClass += ' source';
            if (n.isSink) nodeClass += ' sink';
            if (phase === 'min_cut' || phase === 'complete') {
              if (sSet.has(n.id)) nodeClass += ' in-cut-s';
              if (tSet.has(n.id)) nodeClass += ' in-cut-t';
            }

            return (
              <g key={`node-${n.id}`}>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={20}
                  className={nodeClass}
                />
                <text
                  x={n.x}
                  y={n.y}
                  className="graph-node-label"
                >
                  {n.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Max-Flow Min-Cut Theorem Card (Section 12, 23 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Teorema de Flujo Máximo / Corte Mínimo:' : 'Max-Flow Min-Cut Theorem:'}</strong>{' '}
        {language === 'es'
          ? 'En cualquier red de flujo con capacidades enteras, el valor del flujo máximo equivale exactamente a la capacidad del corte s-t mínimo: max v(f) = min cap(A, B). Mientras exista un camino s-t en el grafo residual G_f, aumentamos por el cuello de botella. Al agotarse los caminos aumentantes, los vértices alcanzables desde s definen un corte saturado (A, B) que certifica matemáticamente la optimalidad del flujo.'
          : 'In any flow network, the maximum flow value equals the capacity of the minimum s-t cut: max v(f) = min cap(A, B). While an augmenting path exists in residual graph G_f, flow increases by bottleneck capacity. When no s-t paths remain in G_f, reachable nodes from s form a saturated cut (A, B) rigorously proving global optimality.'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls-bar">
        <div className="timeline-buttons-group">
          <button
            type="button"
            className="btn-ctrl"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar (R)' : 'Reset (R)'}
            title={language === 'es' ? 'Reiniciar (tecla R)' : 'Reset (R key)'}
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
