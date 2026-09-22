import React, { useState } from 'react';
import {
  DEFAULT_APPROX_GRAPH,
  DEFAULT_APPROX_LAYOUT
} from '../../engine/algorithms/vertexCoverApproxTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import './VertexCoverApproxPlayground.css';
import './VertexCoverApproxVisualizer.css';

export const VertexCoverApproxPlayground: React.FC = () => {
  const { language } = useLanguage();
  const [matching, setMatching] = useState<[string, string][]>([]);

  const { vertices, edges } = DEFAULT_APPROX_GRAPH;

  // Cover is always the union of endpoints of edges in matching
  const cover = React.useMemo(() => {
    const s = new Set<string>();
    for (const [u, v] of matching) {
      s.add(u);
      s.add(v);
    }
    return Array.from(s);
  }, [matching]);

  const coverSet = new Set(cover);

  // Check which edges are covered
  const coveredCount = edges.filter(([u, v]) => coverSet.has(u) || coverSet.has(v)).length;
  const isAllCovered = coveredCount === edges.length;

  const toggleEdge = (u: string, v: string) => {
    const isAlreadyMatched = matching.some(
      (e) => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u)
    );

    if (isAlreadyMatched) {
      // Remove from matching
      setMatching(matching.filter((e) => !(e[0] === u && e[1] === v) && !(e[0] === v && e[1] === u)));
      return;
    }

    // Check if either endpoint already belongs to another matched edge (matching disjointness)
    if (coverSet.has(u) || coverSet.has(v)) {
      // In a matching, edges must be disjoint
      return;
    }

    setMatching([...matching, [u, v]]);
  };

  const handleClear = () => {
    setMatching([]);
  };

  const handleGreedyAuto = () => {
    // Canonical greedy matching
    const curC = new Set<string>();
    const m: [string, string][] = [];
    for (const [u, v] of edges) {
      if (!curC.has(u) && !curC.has(v)) {
        m.push([u, v]);
        curC.add(u);
        curC.add(v);
      }
    }
    setMatching(m);
  };

  return (
    <div className="approx-playground-box">
      <div className="approx-playground-header">
        <div>
          <h4 style={{ margin: 0 }}>
            {language === 'es'
              ? 'Laboratorio Interactivo de 2-Aproximación'
              : 'Interactive 2-Approximation Lab'}
          </h4>
          <p className="reduction-playground-inst">
            {language === 'es'
              ? 'Haz clic en aristas para construir un Matching Disjunto M (dorado). Ambos extremos ingresan a la cobertura C (azul). Cubre el 100% de aristas para comprobar la cota |C| ≤ 2·|C*|.'
              : 'Click edges to build a Disjoint Matching M (gold). Both endpoints enter cover C (blue). Cover 100% of edges to verify |C| ≤ 2·|C*|.'}
          </p>
        </div>
        <div className="playground-button-group">
          <button type="button" className="btn-secondary" onClick={handleGreedyAuto}>
            {language === 'es' ? 'Solución Greedy' : 'Greedy Solution'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {language === 'es' ? 'Vaciar' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="approx-stats-grid">
        <div className="approx-stat-card">
          <h5>{language === 'es' ? 'Matching M' : 'Matching M'}</h5>
          <span className="stat-num">{matching.length} {language === 'es' ? 'aristas' : 'edges'}</span>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
            {language === 'es' ? 'Cota: |C*| ≥ ' + matching.length : 'Bound: |C*| ≥ ' + matching.length}
          </span>
        </div>

        <div className="approx-stat-card">
          <h5>{language === 'es' ? 'Cobertura C' : 'Cover C'}</h5>
          <span className="stat-num">{cover.length} {language === 'es' ? 'vértices' : 'vertices'}</span>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
            |C| = 2 · {matching.length}
          </span>
        </div>

        <div className="approx-stat-card">
          <h5>{language === 'es' ? 'Aristas Cubiertas' : 'Covered Edges'}</h5>
          <span className="stat-num">{coveredCount} / {edges.length}</span>
          <span style={{ fontSize: '0.75rem', color: isAllCovered ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {isAllCovered
              ? (language === 'es' ? '✓ Cobertura Factible' : '✓ Feasible Cover')
              : (language === 'es' ? 'Faltan aristas' : 'Edges remaining')}
          </span>
        </div>
      </div>

      {/* Accessible Edge Keyboard Controls */}
      <div className="approx-edge-buttons-bar" role="group" aria-label={language === 'es' ? 'Controles de aristas del grafo' : 'Graph edge controls'}>
        <span className="approx-edge-buttons-label">
          {language === 'es' ? 'Aristas (Matching / Cobertura):' : 'Edges (Matching / Cover):'}
        </span>
        <div className="approx-edge-chips">
          {edges.map(([u, v]) => {
            const isMatched = matching.some(
              (m) => (m[0] === u && m[1] === v) || (m[0] === v && m[1] === u)
            );
            const isCovered = coverSet.has(u) || coverSet.has(v);
            const edgeStatus = isMatched
              ? (language === 'es' ? 'en matching' : 'in matching')
              : isCovered
                ? (language === 'es' ? 'cubierta' : 'covered')
                : (language === 'es' ? 'no cubierta' : 'uncovered');

            return (
              <button
                key={`btn-edge-${u}-${v}`}
                type="button"
                className={`approx-edge-btn ${isMatched ? 'matched' : isCovered ? 'covered' : ''}`}
                onClick={() => toggleEdge(u, v)}
                aria-pressed={isMatched}
                aria-label={`Arista ${u}-${v}: ${edgeStatus}`}
              >
                {isMatched ? '★ ' : isCovered ? '✓ ' : '○ '}{u}—{v}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        className="approx-interactive-svg"
        viewBox="0 0 540 300"
        aria-label="Grafo interactivo de aproximación"
      >
        {/* Edges */}
        <g className="edges-layer">
          {edges.map(([u, v]) => {
            const p1 = DEFAULT_APPROX_LAYOUT[u];
            const p2 = DEFAULT_APPROX_LAYOUT[v];
            if (!p1 || !p2) return null;

            const isMatched = matching.some(
              (m) => (m[0] === u && m[1] === v) || (m[0] === v && m[1] === u)
            );
            const isCovered = coverSet.has(u) || coverSet.has(v);

            let edgeClass = 'approx-edge interactive-edge';
            if (isMatched) edgeClass += ' matched';
            else if (isCovered) edgeClass += ' covered';

            const edgeStatus = isMatched
              ? (language === 'es' ? 'en matching' : 'in matching')
              : isCovered
                ? (language === 'es' ? 'cubierta' : 'covered')
                : (language === 'es' ? 'no cubierta' : 'uncovered');

            return (
              <g
                key={`${u}-${v}`}
                role="button"
                tabIndex={0}
                aria-pressed={isMatched}
                aria-label={`Arista entre ${u} y ${v}, ${edgeStatus}`}
                onClick={() => toggleEdge(u, v)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleEdge(u, v);
                  }
                }}
                className="interactive-edge-group"
                style={{ cursor: 'pointer', outline: 'none' }}
              >
                {/* Invisible wide hit area for easy clicking / touch */}
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="transparent"
                  strokeWidth="24"
                />
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  className={edgeClass}
                />
              </g>
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes-layer">
          {vertices.map((v) => {
            const pos = DEFAULT_APPROX_LAYOUT[v];
            if (!pos) return null;

            const inCover = coverSet.has(v);
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

      {/* Theorem Banner */}
      <div className="approx-theorem-banner">
        <strong>{language === 'es' ? 'Cota de Calidad de Kleinberg & Tardos:' : 'Kleinberg & Tardos Quality Bound:'}</strong>{' '}
        {language === 'es'
          ? 'Como las aristas del matching no comparten ningún vértice, cualquier cobertura óptima C* debe elegir al menos un vértice distinto de cada arista de M, lo que impone |C*| ≥ |M|. Como el algoritmo toma ambos extremos, |C| = 2|M| ≤ 2|C*|.'
          : 'Because matched edges share no vertices, any optimal cover C* must pick at least one distinct vertex from each matched edge, requiring |C*| ≥ |M|. As the algorithm takes both endpoints, |C| = 2|M| ≤ 2|C*|.'}
      </div>
    </div>
  );
};
