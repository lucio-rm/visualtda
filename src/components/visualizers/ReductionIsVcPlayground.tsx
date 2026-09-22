import React, { useState, useEffect } from 'react';
import {
  DEFAULT_REDUCTION_GRAPH,
  DEFAULT_GRAPH_LAYOUT
} from '../../engine/algorithms/reductionIsVcTrace';
import { reductionIsVcValidator } from '../../engine/algorithms/reductionIsVcValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './ReductionIsVcPlayground.css';
import './ReductionIsVcVisualizer.css';

export const ReductionIsVcPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markCompleted } = useStudentProgress();
  const [selectedIS, setSelectedIS] = useState<string[]>([]);

  const { vertices, edges, k } = DEFAULT_REDUCTION_GRAPH;

  const toggleNode = (nodeId: string) => {
    if (selectedIS.includes(nodeId)) {
      setSelectedIS(selectedIS.filter((id) => id !== nodeId));
    } else {
      setSelectedIS([...selectedIS, nodeId]);
    }
  };

  const handleClear = () => {
    setSelectedIS([]);
  };

  // Complement C = V \ S
  const vertexCover = vertices.filter((v) => !selectedIS.includes(v));

  // Validate Independent Set
  const isValidation = reductionIsVcValidator.validateIndependentSet(
    { vertices, edges },
    selectedIS
  );

  // Validate Vertex Cover
  const vcValidation = reductionIsVcValidator.validateVertexCover(
    { vertices, edges },
    vertexCover
  );

  // Detect conflict edges (both endpoints in S)
  const sSet = new Set(selectedIS);
  const conflictEdges = edges.filter(([u, v]) => sSet.has(u) && sSet.has(v));
  const hasConflict = conflictEdges.length > 0;
  const isOptimal = isValidation.valid && selectedIS.length >= k;

  useEffect(() => {
    if (isOptimal) {
      markCompleted('vertex-cover-reduction');
    }
  }, [isOptimal, markCompleted]);

  return (
    <div className="reduction-playground-box">
      <div className="reduction-playground-header">
        <div>
          <h4 style={{ margin: 0 }}>
            {language === 'es'
              ? 'Laboratorio Interactivo de Reducción: IS ⟺ VC'
              : 'Interactive Reduction Lab: IS ⟺ VC'}
          </h4>
          <p className="reduction-playground-inst">
            {language === 'es'
              ? 'Haz clic en los nodos para armar el Conjunto Independiente S (verde). Observa cómo el complemento V \\ S (violeta) forma simultáneamente la Cobertura de Vértices.'
              : 'Click nodes to construct the Independent Set S (green). Watch how the complement V \\ S (purple) simultaneously forms the Vertex Cover.'}
          </p>
        </div>
        <div className="playground-button-group">
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {language === 'es' ? 'Vaciar' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Duality Panels */}
      <div className="reduction-duality-banner">
        <div className="duality-panel is-panel">
          <h5>{language === 'es' ? 'Conjunto Independiente S' : 'Independent Set S'}</h5>
          <span className="panel-value">
            {selectedIS.length > 0 ? `{${selectedIS.join(', ')}}` : '∅'} ({selectedIS.length}/{k})
          </span>
          <span className={`panel-status ${hasConflict ? 'status-err' : 'status-ok'}`}>
            {hasConflict
              ? (language === 'es' ? `⚠️ Conflicto en ${conflictEdges.length} arista(s)` : `⚠️ Conflict on ${conflictEdges.length} edge(s)`)
              : (isOptimal
                  ? (language === 'es' ? '✓ Válido (Objetivo k alcanzado)' : '✓ Valid (Target k reached)')
                  : (language === 'es' ? '✓ Válido (Sin aristas internas)' : '✓ Valid (No internal edges)'))}
          </span>
        </div>

        <div className="duality-panel vc-panel">
          <h5>{language === 'es' ? 'Cobertura Dual C = V \\ S' : 'Dual Cover C = V \\ S'}</h5>
          <span className="panel-value">
            {vertexCover.length > 0 ? `{${vertexCover.join(', ')}}` : '∅'} ({vertexCover.length}/{vertices.length - k})
          </span>
          <span className={`panel-status ${vcValidation.valid ? 'status-ok' : 'status-err'}`}>
            {vcValidation.valid
              ? (language === 'es' ? '✓ 100% Aristas Cubiertas' : '✓ 100% Edges Covered')
              : (language === 'es' ? '✗ Aristas sin cubrir' : '✗ Uncovered edges')}
          </span>
        </div>
      </div>

      {/* Interactive SVG */}
      <svg
        className="reduction-interactive-svg"
        viewBox="0 0 540 300"
        aria-label="Grafo interactivo de reducción"
      >
        {/* Edges */}
        <g className="edges-layer">
          {edges.map(([u, v]) => {
            const p1 = DEFAULT_GRAPH_LAYOUT[u];
            const p2 = DEFAULT_GRAPH_LAYOUT[v];
            if (!p1 || !p2) return null;

            const isConflict = sSet.has(u) && sSet.has(v);
            const isCovered = !isConflict; // In complement duality, an edge is covered by C iff it does not have both ends in S

            let edgeClass = 'graph-edge';
            if (isConflict) edgeClass += ' conflict';
            else if (isCovered) edgeClass += ' covered';

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
            const pos = DEFAULT_GRAPH_LAYOUT[v];
            if (!pos) return null;

            const inIS = selectedIS.includes(v);
            const inVC = vertexCover.includes(v);
            const isConflict = conflictEdges.some((e) => e[0] === v || e[1] === v);

            let nodeClass = 'graph-node interactive-node';
            if (inIS) nodeClass += ' in-is';
            if (inVC) nodeClass += ' in-vc';
            if (isConflict) nodeClass += ' conflict-node';

            return (
              <g
                key={v}
                className={nodeClass}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => toggleNode(v)}
                role="button"
                tabIndex={0}
                aria-label={`Vértice ${v}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleNode(v);
                  }
                }}
              >
                <circle r={24} className="node-circle" />
                <text className="node-text">{v}</text>
                {inIS && <text y={36} className="node-subtext is-sub">S (IS)</text>}
                {inVC && <text y={36} className="node-subtext vc-sub">V\S (VC)</text>}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Theorem Callout */}
      <div className="playground-theorem-callout">
        <strong>{language === 'es' ? 'Principio Matemático (Kleinberg & Tardos 8.1):' : 'Mathematical Principle (Kleinberg & Tardos 8.1):'}</strong>{' '}
        {language === 'es'
          ? 'Una arista queda sin cubrir por la cobertura C si y solo si sus DOS extremos quedan afuera de C, lo cual significa que ambos están adentro de S. Por lo tanto, C cubre todas las aristas si y solo si S no contiene ninguna arista interna.'
          : 'An edge is left uncovered by cover C if and only if BOTH endpoints lie outside of C, meaning both lie inside S. Thus, C covers every edge if and only if S contains no internal edge.'}
      </div>
    </div>
  );
};
