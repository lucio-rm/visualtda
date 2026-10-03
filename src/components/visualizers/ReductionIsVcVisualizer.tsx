import React, { useMemo } from 'react';
import {
  generateReductionTrace,
  ReductionTraceState,
  DEFAULT_REDUCTION_GRAPH,
  DEFAULT_GRAPH_LAYOUT
} from '../../engine/algorithms/reductionIsVcTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './ReductionIsVcVisualizer.css';

export const ReductionIsVcVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateReductionTrace(DEFAULT_REDUCTION_GRAPH), []);

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
  } = useTraceTimeline<ReductionTraceState>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const vertices = data?.vertices || DEFAULT_REDUCTION_GRAPH.vertices;
  const edges = data?.edges || DEFAULT_REDUCTION_GRAPH.edges;
  const k = data?.k ?? 2;
  const kPrime = data?.kPrime ?? 3;
  const independentSet = data?.independentSet || [];
  const vertexCover = data?.vertexCover || [];
  const activeNode = data?.activeNode;
  const activeEdge = data?.activeEdge;
  const conflictEdge = data?.conflictEdge;
  const coveredEdges = data?.coveredEdges || [];
  const explanation = data?.explanation;

  const isEdgeCovered = (u: string, v: string) => {
    return coveredEdges.some(
      (e) => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u)
    );
  };

  const isEdgeActive = (u: string, v: string) => {
    if (!activeEdge) return false;
    return (activeEdge[0] === u && activeEdge[1] === v) || (activeEdge[0] === v && activeEdge[1] === u);
  };

  const isEdgeConflict = (u: string, v: string) => {
    if (!conflictEdge) return false;
    return (conflictEdge[0] === u && conflictEdge[1] === v) || (conflictEdge[0] === v && conflictEdge[1] === u);
  };

  return (
    <div
      className="reduction-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Reducción IS a VC' : 'IS to VC Reduction Visualizer'}
    >
      {/* Metrics Row */}
      <div className="reduction-metrics-row">
        <div className="reduction-metric-badge is-badge">
          <span>● {language === 'es' ? 'Conjunto Independiente S:' : 'Independent Set S:'}</span>
          <strong>{independentSet.length > 0 ? `{${independentSet.join(', ')}}` : '∅'} ({independentSet.length}/{k})</strong>
        </div>

        <div className="reduction-metric-badge vc-badge">
          <span>● {language === 'es' ? 'Cobertura C = V \\ S:' : 'Vertex Cover C = V \\ S:'}</span>
          <strong>{vertexCover.length > 0 ? `{${vertexCover.join(', ')}}` : '∅'} ({vertexCover.length}/{kPrime})</strong>
        </div>

        <div className="reduction-metric-badge duality-badge">
          <span>{language === 'es' ? 'Aristas Cubiertas:' : 'Covered Edges:'}</span>
          <strong>{coveredEdges.length} / {edges.length}</strong>
        </div>
      </div>

      {/* Interactive SVG Graph */}
      <svg
        className="reduction-graph-canvas"
        viewBox="0 0 540 300"
        aria-label={language === 'es' ? 'Grafo de reducción entre Conjunto Independiente y Cobertura de Vértices' : 'Reduction graph between Independent Set and Vertex Cover'}
      >
        {/* Draw Edges */}
        <g className="edges-layer">
          {edges.map(([u, v]) => {
            const p1 = DEFAULT_GRAPH_LAYOUT[u];
            const p2 = DEFAULT_GRAPH_LAYOUT[v];
            if (!p1 || !p2) return null;

            const covered = isEdgeCovered(u, v);
            const active = isEdgeActive(u, v);
            const conflict = isEdgeConflict(u, v);

            let edgeClass = 'graph-edge';
            if (conflict) edgeClass += ' conflict';
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

        {/* Draw Nodes */}
        <g className="nodes-layer">
          {vertices.map((v) => {
            const pos = DEFAULT_GRAPH_LAYOUT[v];
            if (!pos) return null;

            const inIS = independentSet.includes(v);
            const inVC = vertexCover.includes(v);
            const isActive = activeNode === v;
            const isConflict = conflictEdge && (conflictEdge[0] === v || conflictEdge[1] === v);

            let nodeClass = 'graph-node';
            if (inIS) nodeClass += ' in-is';
            if (inVC) nodeClass += ' in-vc';
            if (isActive) nodeClass += ' active-node';
            if (isConflict) nodeClass += ' conflict-node';

            return (
              <g key={v} className={nodeClass} transform={`translate(${pos.x}, ${pos.y})`}>
                <circle r={24} className="node-circle" />
                <text className="node-text">{v}</text>
                {inIS && <text y={36} className="node-subtext is-sub">S</text>}
                {inVC && <text y={36} className="node-subtext vc-sub">VC</text>}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Explanation Box */}
      {explanation && (
        <div className="reduction-explanation-box">
          {language === 'es' ? explanation.es : explanation.en}
        </div>
      )}

      {/* Karp Polynomial Reduction Theorem Card (Section 12, 23 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Teorema de Reducción Polinomial (Dualidad IS-VC):' : 'Polynomial Reduction Theorem (IS-VC Duality):'}</strong>{' '}
        {language === 'es'
          ? 'Un subconjunto S ⊆ V es un Conjunto Independiente en G=(V, E) si y sólo si su complemento V \\ S es un Vertex Cover en G. (⇒) Si S es independiente, ninguna arista tiene ambos extremos en S, luego toda arista tiene al menos un extremo en V \\ S. (⇐) Si V \\ S cubre toda arista, ninguna arista puede tener ambos extremos en S, luego S es independiente. Esto establece que G tiene un Independent Set de tamaño k si y sólo si tiene un Vertex Cover de tamaño |V| - k, reducible en tiempo lineal O(|V|).'
          : 'A subset S ⊆ V is an Independent Set in G=(V, E) if and only if its complement V \\ S is a Vertex Cover in G. (⇒) If S is independent, no edge connects two vertices in S, so every edge has at least one endpoint in V \\ S. (⇐) If V \\ S covers all edges, no edge has both endpoints in S, so S is independent. Thus, G has an Independent Set of size k iff it has a Vertex Cover of size |V| - k, reducible in linear time O(|V|).'}
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
            aria-label={language === 'es' ? 'Paso de la reducción' : 'Reduction step'}
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
            <span className="speed-label">{language === 'es' ? 'Vel:' : 'Speed:'}</span>
            <div className="segmented-control speed-segmented-control" role="group" aria-label={language === 'es' ? 'Velocidad' : 'Speed'}>
              {[0.5, 1, 2].map((spd) => (
                <button
                  key={spd}
                  type="button"
                  className={`segmented-btn ${playbackSpeed === spd ? 'active' : ''}`}
                  onClick={() => setSpeed(spd)}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
