import React, { useMemo } from 'react';
import {
  generateVertexCoverApproxTrace,
  ApproxTraceState,
  DEFAULT_APPROX_GRAPH,
  DEFAULT_APPROX_LAYOUT
} from '../../engine/algorithms/vertexCoverApproxTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './VertexCoverApproxVisualizer.css';

export const VertexCoverApproxVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateVertexCoverApproxTrace(DEFAULT_APPROX_GRAPH), []);

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
  } = useTraceTimeline<ApproxTraceState>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const vertices = data?.vertices || DEFAULT_APPROX_GRAPH.vertices;
  const edges = data?.edges || DEFAULT_APPROX_GRAPH.edges;
  const matching = data?.matching || [];
  const cover = data?.cover || [];
  const activeEdge = data?.activeEdge;
  const coveredEdges = data?.coveredEdges || [];
  const lowerBound = data?.lowerBound || 0;
  const coverSize = data?.coverSize || 0;
  const explanation = data?.explanation;

  const isEdgeMatched = (u: string, v: string) => {
    return matching.some(
      (m) => (m[0] === u && m[1] === v) || (m[0] === v && m[1] === u)
    );
  };

  const isEdgeCovered = (u: string, v: string) => {
    return coveredEdges.some(
      (e) => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u)
    );
  };

  const isEdgeActive = (u: string, v: string) => {
    if (!activeEdge) return false;
    return (activeEdge[0] === u && activeEdge[1] === v) || (activeEdge[0] === v && activeEdge[1] === u);
  };

  return (
    <div
      className="approx-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de 2-Aproximación para Vertex Cover' : '2-Approximation for Vertex Cover Visualizer'}
    >
      {/* Metrics Row */}
      <div className="approx-metrics-row">
        <div className="approx-metric-badge matching-badge">
          <span>{language === 'es' ? 'Matching M (Disjunto):' : 'Matching M (Disjoint):'}</span>
          <strong>{matching.length} {language === 'es' ? 'aristas' : 'edges'}</strong>
        </div>

        <div className="approx-metric-badge cover-badge">
          <span>{language === 'es' ? 'Cobertura C (2·|M|):' : 'Cover C (2·|M|):'}</span>
          <strong>{coverSize} {language === 'es' ? 'vértices' : 'vertices'}</strong>
        </div>

        <div className="approx-metric-badge ratio-badge">
          <span>{language === 'es' ? 'Cota Inferior & Garantía:' : 'Lower Bound & Ratio:'}</span>
          <strong>|C*| ≥ {lowerBound} ⟹ |C|/|C*| ≤ 2.0</strong>
        </div>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        className="approx-graph-canvas"
        viewBox="0 0 540 300"
        aria-label={language === 'es' ? 'Grafo de 2-aproximación para Vertex Cover' : '2-approximation graph for Vertex Cover'}
      >
        {/* Edges */}
        <g className="edges-layer">
          {edges.map(([u, v]) => {
            const p1 = DEFAULT_APPROX_LAYOUT[u];
            const p2 = DEFAULT_APPROX_LAYOUT[v];
            if (!p1 || !p2) return null;

            const matched = isEdgeMatched(u, v);
            const active = isEdgeActive(u, v);
            const covered = isEdgeCovered(u, v);

            let edgeClass = 'approx-edge';
            if (matched) edgeClass += ' matched';
            else if (active) edgeClass += ' active';
            else if (covered) edgeClass += ' covered';

            return (
              <line
                key={`${u}-${v}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                className={edgeClass}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes-layer">
          {vertices.map((v) => {
            const pos = DEFAULT_APPROX_LAYOUT[v];
            if (!pos) return null;

            const inCover = cover.includes(v);
            let nodeClass = 'approx-node';
            if (inCover) nodeClass += ' in-cover';

            return (
              <g key={v} className={nodeClass} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r={24} className="approx-node-circle" />
                <text className="approx-node-text">{v}</text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Explanation Box */}
      {explanation && (
        <div className="approx-explanation-box">
          {language === 'es' ? explanation.es : explanation.en}
        </div>
      )}

      {/* 2-Approximation Theorem Rationale (Section 12, 23 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Teorema de 2-Aproximación:' : '2-Approximation Theorem:'}</strong>{' '}
        {language === 'es'
          ? 'Sea M el conjunto de aristas disjuntas elegidas (emparejamiento maximal). Como ninguna arista en M comparte vértices, cualquier Vertex Cover óptimo S* debe contener al menos un extremo por cada arista en M, luego |S*| ≥ |M|. Nuestro algoritmo selecciona ambos extremos de cada arista en M, alcanzando |S| = 2|M| ≤ 2|S*|, garantizando un factor de aproximación exactamente ≤ 2 en tiempo lineal O(|V| + |E|).'
          : 'Let M be the set of disjoint chosen edges (maximal matching). Since no two edges in M share endpoints, every optimal vertex cover S* must select at least one endpoint per edge in M, hence |S*| ≥ |M|. The algorithm selects both endpoints, so |S| = 2|M| ≤ 2|S*|, guaranteeing an approximation ratio ≤ 2 in linear time O(|V| + |E|).'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls-card">
        <div className="timeline-slider-row">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-progress-bar"
            aria-label={language === 'es' ? 'Paso del algoritmo de aproximación' : 'Approximation algorithm step'}
          />
          <span className="step-counter">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="timeline-button-toolbar">
          <div className="button-group">
            <button
              type="button"
              className="btn-ctrl"
              onClick={stepBackward}
              disabled={currentStepIndex === 0}
              title={language === 'es' ? 'Paso anterior (←)' : 'Previous step (←)'}
              aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
            >
              ←
            </button>
            <button
              type="button"
              className="btn-ctrl btn-play"
              onClick={togglePlay}
              title={isPlaying ? (language === 'es' ? 'Pausar (Espacio / k)' : 'Pause (Space / k)') : (language === 'es' ? 'Reproducir (Espacio / k)' : 'Play (Space / k)')}
              aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button
              type="button"
              className="btn-ctrl"
              onClick={stepForward}
              disabled={currentStepIndex >= totalSteps - 1}
              title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
              aria-label={language === 'es' ? 'Paso siguiente' : 'Next step'}
            >
              →
            </button>
            <button
              type="button"
              className="btn-ctrl"
              onClick={reset}
              title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
              aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
            >
              ↺
            </button>
          </div>

          <div className="speed-selector">
            <label htmlFor="speed-select-approx">{language === 'es' ? 'Velocidad:' : 'Speed:'}</label>
            <select
              id="speed-select-approx"
              value={playbackSpeed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              aria-label={language === 'es' ? 'Velocidad de reproducción' : 'Playback speed'}
              className="speed-dropdown"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1.0x</option>
              <option value={2}>2.0x</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
