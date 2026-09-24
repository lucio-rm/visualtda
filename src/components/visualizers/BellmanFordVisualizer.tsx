import React, { useMemo } from 'react';
import {
  generateBellmanFordTrace,
  BellmanFordStepData,
  DEFAULT_BELLMAN_FORD_GRAPH
} from '../../engine/algorithms/bellmanFordTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './BellmanFordVisualizer.css';

export const BellmanFordVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateBellmanFordTrace(DEFAULT_BELLMAN_FORD_GRAPH), []);

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
  } = useTraceTimeline<BellmanFordStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const nodes = data?.nodes || DEFAULT_BELLMAN_FORD_GRAPH.nodes;
  const edges = data?.edges || DEFAULT_BELLMAN_FORD_GRAPH.edges;
  const source = data?.source || 'S';
  const iteration = data?.iteration ?? 0;
  const table = data?.table || [];
  const currentEdge = data?.currentEdge;
  const updatedNode = data?.updatedNode;
  const action = data?.action || 'INIT';
  const description = data?.description;

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const latestRow = table.length > 0 ? table[table.length - 1] : {};

  return (
    <div className="bellman-ford-visualizer" role="region" aria-label="Visualizador del Algoritmo de Bellman-Ford">
      {/* Metrics Row */}
      <div className="bf-metrics-row">
        <div className="bf-metric-badge">
          <span>{language === 'es' ? 'Iteración actual (i):' : 'Current iteration (i):'}</span>
          <strong>{iteration} / {nodes.length - 1}</strong>
        </div>
        <div className="bf-metric-badge">
          <span>{language === 'es' ? 'Vértice Origen:' : 'Source vertex:'}</span>
          <strong>{source}</strong>
        </div>
        <div className={`bf-metric-badge bf-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción:' : 'Action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Grid: Graph on Left, DP Table on Right */}
      <div className="bf-grid-split">
        {/* SVG Graph */}
        <div>
          <svg
            viewBox="0 0 510 280"
            className="bf-svg-canvas"
            role="img"
            aria-label={language === 'es' ? 'Grafo dirigido con pesos para Bellman-Ford' : 'Directed weighted graph for Bellman-Ford'}
          >
            <defs>
              <marker id="bf-arr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted, #94a3b8)" />
              </marker>
              <marker id="bf-arr-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
              </marker>
              <marker id="bf-arr-neg" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--danger, #ef4444)" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((e, idx) => {
              const u = nodeMap.get(e.u);
              const v = nodeMap.get(e.v);
              if (!u || !v) return null;

              const isCurrent = currentEdge && currentEdge.u === e.u && currentEdge.v === e.v;
              const isNeg = e.weight < 0;

              let stroke = isNeg ? 'var(--danger, #ef4444)' : 'var(--border-strong, #64748b)';
              let strokeWidth = isNeg ? 2.5 : 1.5;
              let marker = isNeg ? 'url(#bf-arr-neg)' : 'url(#bf-arr)';

              if (isCurrent) {
                stroke = '#38bdf8';
                strokeWidth = 3.5;
                marker = 'url(#bf-arr-active)';
              }

              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={`bf-e-${e.u}-${e.v}-${idx}`}>
                  <line x1={u.x} y1={u.y} x2={v.x} y2={v.y} stroke={stroke} strokeWidth={strokeWidth} markerEnd={marker} />
                  <circle cx={midX} cy={midY} r={11} fill="var(--surface, #0f172a)" stroke={stroke} strokeWidth={1} />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isNeg ? 'var(--danger, #ef4444)' : 'var(--text, #f8fafc)'}
                    fontFamily="var(--font-mono)"
                    fontSize="11px"
                    fontWeight="700"
                  >
                    {e.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((n) => {
              const isUpdated = updatedNode === n.id;
              const dist = latestRow[n.id];
              const distStr = dist === Infinity ? '∞' : String(dist);

              return (
                <g key={`bf-n-${n.id}`}>
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={22}
                    fill={isUpdated ? 'rgba(16, 185, 129, 0.3)' : 'var(--surface, #0f172a)'}
                    stroke={isUpdated ? '#10b981' : 'var(--accent, #6366f1)'}
                    strokeWidth={isUpdated ? 3.5 : 2}
                  />
                  <text
                    x={n.x}
                    y={n.y + 5}
                    textAnchor="middle"
                    fill="var(--text, #f8fafc)"
                    fontFamily="var(--font-mono)"
                    fontSize="14px"
                    fontWeight="700"
                  >
                    {n.id}
                  </text>
                  {/* Distance label */}
                  <rect
                    x={n.x - 16}
                    y={n.y - 38}
                    width={32}
                    height={15}
                    rx={3}
                    fill="var(--surface-hover, #1e293b)"
                    stroke="var(--border, #475569)"
                  />
                  <text
                    x={n.x}
                    y={n.y - 27}
                    textAnchor="middle"
                    fill="var(--accent, #38bdf8)"
                    fontFamily="var(--font-mono)"
                    fontSize="10px"
                    fontWeight="800"
                  >
                    {distStr}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 2D DP Recurrence Table */}
        <div className="bf-matrix-container">
          <table className="bf-dp-table" aria-label="Matriz de Programación Dinámica M[i, v]">
            <thead>
              <tr>
                <th>i \ v</th>
                {nodes.map((n) => (
                  <th key={`hdr-${n.id}`}>{n.id}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, rIdx) => (
                <tr key={`row-${rIdx}`}>
                  <td>
                    <strong>i = {rIdx}</strong>
                  </td>
                  {nodes.map((n) => {
                    const val = row[n.id];
                    const valStr = val === Infinity ? '∞' : String(val);
                    const isCellActive = rIdx === iteration && currentEdge && currentEdge.v === n.id;
                    const isCellUpdated = rIdx === iteration && updatedNode === n.id;

                    let cellClass = '';
                    if (isCellUpdated) cellClass = 'cell-updated';
                    else if (isCellActive) cellClass = 'cell-active';

                    return (
                      <td key={`cell-${rIdx}-${n.id}`} className={cellClass}>
                        {valStr}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
            aria-label="Progreso de pasos de Bellman-Ford"
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
