import React, { useMemo } from 'react';
import {
  generateDijkstraTrace,
  DijkstraStepData,
  DEFAULT_DIJKSTRA_GRAPH
} from '../../engine/algorithms/dijkstraTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './DijkstraVisualizer.css';

export const DijkstraVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateDijkstraTrace(DEFAULT_DIJKSTRA_GRAPH), []);

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
  } = useTraceTimeline<DijkstraStepData>(timeline, {
    baseIntervalMs: 700,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const nodes = data?.nodes || DEFAULT_DIJKSTRA_GRAPH.nodes;
  const edges = data?.edges || DEFAULT_DIJKSTRA_GRAPH.edges;
  const distances = data?.distances || {};
  const predecessors = data?.predecessors || {};
  const visited = data?.visited || [];
  const currentU = data?.currentU;
  const currentV = data?.currentV;
  const relaxedEdge = data?.relaxedEdge;
  const priorityQueue = data?.priorityQueue || [];
  const action = data?.action || 'INIT';
  const description = data?.description;

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div className="dijkstra-visualizer" role="region" aria-label={language === 'es' ? 'Visualizador del Algoritmo de Dijkstra' : 'Dijkstra Algorithm Visualizer'}>
      {/* Metrics Row */}
      <div className="djk-metrics-row">
        <div className="djk-metric-badge">
          <span>{language === 'es' ? 'Nodos definitivos (S):' : 'Settled nodes (S):'}</span>
          <strong>{visited.length} / {nodes.length}</strong>
        </div>
        <div className="djk-metric-badge">
          <span>{language === 'es' ? 'Cola de prioridad (Q):' : 'Priority Queue (Q):'}</span>
          <strong>{priorityQueue.length} {language === 'es' ? 'elementos' : 'elements'}</strong>
        </div>
        <div className={`djk-metric-badge djk-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción actual:' : 'Current action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="djk-canvas-container">
        <svg
          viewBox="0 0 510 300"
          className="djk-svg-canvas"
          role="img"
          aria-label={language === 'es' ? 'Grafo dirigido con pesos de Dijkstra' : 'Directed weighted graph for Dijkstra'}
        >
          <defs>
            <marker
              id="djk-arrow"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--graph-edge)" />
            </marker>
            <marker
              id="djk-arrow-active"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--warning)" />
            </marker>
            <marker
              id="djk-arrow-tree"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge) => {
            const uNode = nodeMap.get(edge.u);
            const vNode = nodeMap.get(edge.v);
            if (!uNode || !vNode) return null;

            const isRelaxing = relaxedEdge && relaxedEdge.u === edge.u && relaxedEdge.v === edge.v;
            const isTreeEdge = predecessors[edge.v] === edge.u;

            let strokeColor = 'var(--graph-edge)';
            let strokeWidth = 2.5;
            let marker = 'url(#djk-arrow)';

            if (isTreeEdge) {
              strokeColor = 'var(--success)';
              strokeWidth = 3.5;
              marker = 'url(#djk-arrow-tree)';
            } else if (isRelaxing) {
              strokeColor = 'var(--warning)';
              strokeWidth = 3;
              marker = 'url(#djk-arrow-active)';
            }

            const hasOpposite = edges.some((other) => other.u === edge.v && other.v === edge.u);
            const midX = (uNode.x + vNode.x) / 2;
            const midY = (uNode.y + vNode.y) / 2;

            let pathD = `M ${uNode.x} ${uNode.y} L ${vNode.x} ${vNode.y}`;
            let labelX = midX;
            let labelY = midY;

            if (hasOpposite) {
              const dx = vNode.x - uNode.x;
              const dy = vNode.y - uNode.y;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;
              const curveOffset = 26;
              const cx = midX + nx * curveOffset;
              const cy = midY + ny * curveOffset;
              pathD = `M ${uNode.x} ${uNode.y} Q ${cx} ${cy} ${vNode.x} ${vNode.y}`;
              labelX = midX + nx * (curveOffset * 0.65);
              labelY = midY + ny * (curveOffset * 0.65);
            }

            return (
              <g key={`edge-${edge.u}-${edge.v}`}>
                <path
                  d={pathD}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                  fill="none"
                />
                <circle cx={labelX} cy={labelY} r={13} fill="var(--surface)" stroke={strokeColor} strokeWidth={1.5} />
                <text
                  x={labelX}
                  y={labelY + 4}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="700"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSettled = visited.includes(node.id);
            const isU = currentU === node.id;
            const isV = currentV === node.id;
            const dist = distances[node.id];
            const distLabel = dist === Infinity ? '∞' : String(dist);

            let fill = 'var(--surface)';
            let stroke = 'var(--border-strong)';
            let strokeWidth = 2.5;

            if (isU) {
              fill = 'var(--state-active-bg)';
              stroke = 'var(--accent)';
              strokeWidth = 3.5;
            } else if (isV) {
              fill = 'var(--state-candidate-bg)';
              stroke = 'var(--warning)';
              strokeWidth = 3;
            } else if (isSettled) {
              fill = 'var(--state-solution-bg)';
              stroke = 'var(--success)';
              strokeWidth = 2.5;
            }

            return (
              <g key={`node-${node.id}`}>
                <circle cx={node.x} cy={node.y} r={22} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontFamily="var(--font-mono)"
                  fontSize="14px"
                  fontWeight="700"
                >
                  {node.id}
                </text>
                {/* Distance Badge Above Node */}
                <rect
                  x={node.x - 22}
                  y={node.y - 42}
                  width={44}
                  height={20}
                  rx={4}
                  fill={isSettled ? 'var(--success)' : 'var(--surface-hover)'}
                  stroke={isSettled ? 'var(--success)' : 'var(--border)'}
                />
                <text
                  x={node.x}
                  y={node.y - 28}
                  textAnchor="middle"
                  fill={isSettled ? '#ffffff' : 'var(--accent)'}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="800"
                >
                  d:{distLabel}
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

      {/* Priority Queue State Display */}
      {priorityQueue.length > 0 && (
        <table className="djk-pq-table" aria-label={language === 'es' ? 'Estado de la Cola de Prioridad' : 'Priority Queue State'}>
          <thead>
            <tr>
              <th>{language === 'es' ? 'Prioridad en Cola (Q)' : 'Queue Priority (Q)'}</th>
              {priorityQueue.map((item) => (
                <th key={`th-${item.node}`}>{item.node}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{language === 'es' ? 'Distancia Acumulada' : 'Accumulated Dist'}</td>
              {priorityQueue.map((item) => (
                <td key={`td-${item.node}`}>
                  <strong>{item.dist}</strong>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}

      {/* Dijkstra Invariant & Non-Negative Weights Card */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Invariante de Dijkstra y Restricción de Pesos No Negativos:' : 'Dijkstra Invariant & Non-Negative Edge Constraint:'}</strong>{' '}
        {language === 'es'
          ? 'Para todo nodo explorado u ∈ S, d[u] es su distancia mínima definitiva. Al extraer el nodo frontera v con d[v] mínimo, cualquier camino alternativo debe salir de S cruzando alguna arista (x, y). Como los pesos son no negativos (w_e ≥ 0), la longitud de dicho camino satisface d[x] + w_{xy} ≥ d[y] ≥ d[v], impidiendo que exista un camino más corto posterior. Con min-heap, el costo es O((|V| + |E|) log |V|).'
          : 'For every explored vertex u ∈ S, d[u] is its exact shortest distance. When extracting frontier node v with minimal d[v], any alternate path must leave S via some edge (x, y). Since edge weights are non-negative (w_e ≥ 0), path length is d[x] + w_{xy} ≥ d[y] ≥ d[v], precluding any shorter route. With a binary min-heap, runtime is O((|V| + |E|) log |V|).'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-toolbar" role="toolbar" aria-label={language === 'es' ? 'Controles de línea de tiempo' : 'Timeline controls'}>
        <div className="timeline-nav-group">
          <button
            type="button"
            className="ctrl-btn"
            onClick={reset}
            title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
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
            aria-label={language === 'es' ? 'Progreso de pasos de Dijkstra' : 'Dijkstra step progress'}
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
