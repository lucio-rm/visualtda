import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import {
  DEFAULT_APPROX_GRAPH,
  DEFAULT_APPROX_LAYOUT
} from '../../engine/algorithms/vertexCoverApproxTrace';
import './VertexCoverApproxPlayground.css';

export const VertexCoverApproxPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const { vertices, edges } = DEFAULT_APPROX_GRAPH;

  // Selected matching M (array of edges [u, v])
  const [matching, setMatching] = useState<[string, string][]>([]);
  // Node layout with dragging support
  const [layout, setLayout] = useState<Record<string, { x: number; y: number }>>(DEFAULT_APPROX_LAYOUT);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Derived vertex cover C (endpoints of M)
  const cover = useMemo(() => {
    const s = new Set<string>();
    for (const [u, v] of matching) {
      s.add(u);
      s.add(v);
    }
    return Array.from(s);
  }, [matching]);

  const coverSet = useMemo(() => new Set(cover), [cover]);

  // Check which edges are covered
  const coveredCount = edges.filter(([u, v]) => coverSet.has(u) || coverSet.has(v)).length;
  const isAllCovered = coveredCount === edges.length;
  const coveragePercent = Math.round((coveredCount / edges.length) * 100);

  useEffect(() => {
    if (isAllCovered && matching.length > 0) {
      markAttempted('vertex-cover-approx');
    }
  }, [isAllCovered, matching.length, markAttempted]);

  const toggleEdge = (u: string, v: string) => {
    const isAlreadyMatched = matching.some(
      (e) => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u)
    );

    if (isAlreadyMatched) {
      setMatching(matching.filter((e) => !(e[0] === u && e[1] === v) && !(e[0] === v && e[1] === u)));
      return;
    }

    // Check disjointness
    if (coverSet.has(u) || coverSet.has(v)) {
      return;
    }

    setMatching([...matching, [u, v]]);
  };

  const handleClear = () => {
    setMatching([]);
  };

  const handleResetLayout = () => {
    setLayout(DEFAULT_APPROX_LAYOUT);
    setMatching([]);
  };

  // Node Dragging Handling
  const handlePointerDownNode = (v: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingNode(v);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 540 / rect.width;
    const scaleY = 300 / rect.height;

    const newX = Math.round(Math.max(40, Math.min(500, (e.clientX - rect.left) * scaleX)));
    const newY = Math.round(Math.max(40, Math.min(260, (e.clientY - rect.top) * scaleY)));

    setLayout((prev) => ({
      ...prev,
      [draggingNode]: { x: newX, y: newY }
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNode) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDraggingNode(null);
    }
  };

  return (
    <div className="approx-playground-box" role="region" aria-label="Laboratorio de 2-Aproximación para Vertex Cover">
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
        <div className="playground-button-group" style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {language === 'es' ? 'Vaciar' : 'Clear'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleResetLayout}>
            {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Coverage Progress Bar */}
      <div style={{ margin: '0.5rem 0 0.75rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
          <span>
            {language === 'es' ? 'Progreso de Cobertura de Aristas:' : 'Edge Coverage Progress:'}{' '}
            <strong>{coveredCount} / {edges.length} ({coveragePercent}%)</strong>
          </span>
          <span style={{ color: isAllCovered ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            {isAllCovered
              ? (language === 'es' ? '✓ Cobertura Factible Válida Alcanzada' : '✓ Feasible Cover Reached')
              : (language === 'es' ? 'Faltan aristas por cubrir' : 'Uncovered edges remain')}
          </span>
        </div>
        <div style={{ height: '8px', background: 'var(--surface-hover)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${coveragePercent}%`,
              height: '100%',
              background: isAllCovered ? '#10b981' : '#38bdf8',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="approx-stats-grid">
        <div className="approx-stat-card">
          <h5>{language === 'es' ? 'Matching M (Disjunto)' : 'Matching M (Disjoint)'}</h5>
          <span className="stat-num">{matching.length} {language === 'es' ? 'aristas' : 'edges'}</span>
          <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
            {language === 'es' ? 'Cota Inferior: |C*| ≥ ' + matching.length : 'Lower Bound: |C*| ≥ ' + matching.length}
          </span>
        </div>

        <div className="approx-stat-card">
          <h5>{language === 'es' ? 'Cobertura C (Extremos de M)' : 'Cover C (Endpoints)'}</h5>
          <span className="stat-num">{cover.length} {language === 'es' ? 'vértices' : 'vertices'}</span>
          <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600 }}>
            |C| = 2 · {matching.length} = {cover.length}
          </span>
        </div>

        <div className="approx-stat-card">
          <h5>{language === 'es' ? 'Factor de Aproximación' : 'Approximation Factor'}</h5>
          <span className="stat-num" style={{ color: isAllCovered ? '#10b981' : 'var(--text)' }}>
            {isAllCovered
              ? (language === 'es' ? '≤ 2.0 × Óptimo' : '≤ 2.0 × Optimal')
              : (language === 'es' ? 'En progreso' : 'In progress')}
          </span>
          <span style={{ fontSize: '0.75rem', color: isAllCovered ? '#10b981' : 'var(--text-muted)', fontWeight: 600 }}>
            {isAllCovered
              ? (language === 'es' ? '|C| ≤ 2 · |C*| Demostrado' : '|C| ≤ 2 · |C*| Verified')
              : (language === 'es' ? 'Cubre el 100% para verificar' : 'Reach 100% to verify')}
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
                {u}—{v} {isMatched ? '★' : isCovered ? '✓' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Graph with draggable vertices */}
      <svg
        ref={svgRef}
        className="approx-interactive-svg"
        viewBox="0 0 540 300"
        aria-label="Grafo interactivo de aproximación"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        {/* Edges */}
        <g className="edges-layer">
          {edges.map(([u, v]) => {
            const p1 = layout[u];
            const p2 = layout[v];
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
                {/* Hit Area */}
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
                  stroke={isMatched ? '#f59e0b' : isCovered ? '#38bdf8' : 'var(--border, #475569)'}
                  strokeWidth={isMatched ? 4.5 : isCovered ? 2.5 : 1.5}
                />
              </g>
            );
          })}
        </g>

        {/* Nodes with dragging support */}
        <g className="nodes-layer">
          {vertices.map((v) => {
            const pos = layout[v];
            if (!pos) return null;

            const inCover = coverSet.has(v);
            const isDragging = draggingNode === v;

            return (
              <g
                key={v}
                transform={`translate(${pos.x}, ${pos.y})`}
                onPointerDown={(e) => handlePointerDownNode(v, e)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <circle
                  r={22}
                  fill={inCover ? '#0284c7' : 'var(--surface, #1e293b)'}
                  stroke={inCover ? '#38bdf8' : 'var(--border, #64748b)'}
                  strokeWidth={inCover ? 3 : 2}
                />
                <text
                  textAnchor="middle"
                  dy="5"
                  fill="#ffffff"
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="700"
                  style={{ userSelect: 'none' }}
                >
                  {v}
                </text>
                {inCover && (
                  <text
                    textAnchor="middle"
                    dy="-28"
                    fill="#38bdf8"
                    fontFamily="var(--font-mono)"
                    fontSize="9px"
                    fontWeight="800"
                  >
                    ∈ C
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Theorem Banner */}
      <div className="approx-theorem-banner">
        <strong>{language === 'es' ? 'Cota Formal de Calidad (2-Aproximación):' : 'Formal Quality Bound (2-Approximation):'}</strong>{' '}
        {language === 'es'
          ? 'Como las aristas del matching M son disjuntas en vértices, cualquier cobertura óptima C* debe elegir al menos un vértice distinto de cada arista de M, lo que impone |C*| ≥ |M|. Como el algoritmo 2-Aprox toma ambos extremos de cada arista de M, |C| = 2|M| ≤ 2|C*|.'
          : 'Because matched edges share no vertices, any optimal cover C* must pick at least one distinct vertex from each matched edge, requiring |C*| ≥ |M|. As the algorithm takes both endpoints, |C| = 2|M| ≤ 2|C*|.'}
      </div>
    </div>
  );
};
