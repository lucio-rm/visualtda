import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { BellmanFordNode, BellmanFordEdge } from '../../engine/algorithms/bellmanFordTrace';

const GRAPH_STABLE_DEFAULT: { nodes: BellmanFordNode[]; edges: BellmanFordEdge[] } = {
  nodes: [
    { id: 'S', x: 80, y: 130 },
    { id: 'A', x: 210, y: 60 },
    { id: 'B', x: 210, y: 200 },
    { id: 'T', x: 370, y: 130 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 4 },
    { u: 'S', v: 'B', weight: 3 },
    { u: 'B', v: 'A', weight: -2 },
    { u: 'A', v: 'T', weight: 2 },
    { u: 'B', v: 'T', weight: 5 }
  ]
};

const GRAPH_CYCLE_DEFAULT: { nodes: BellmanFordNode[]; edges: BellmanFordEdge[] } = {
  nodes: [
    { id: 'S', x: 70, y: 130 },
    { id: 'A', x: 200, y: 60 },
    { id: 'B', x: 340, y: 60 },
    { id: 'C', x: 270, y: 210 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 1 },
    { u: 'A', v: 'B', weight: 2 },
    { u: 'B', v: 'C', weight: -3 },
    { u: 'C', v: 'A', weight: -1 } // Cycle A -> B -> C -> A sum = 2 - 3 - 1 = -2 < 0!
  ]
};

export const BellmanFordPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [mode, setMode] = useState<'stable' | 'cycle'>('stable');
  const [iteration, setIteration] = useState<number>(0);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Editable / draggable node coordinates
  const [stableNodes, setStableNodes] = useState<BellmanFordNode[]>(GRAPH_STABLE_DEFAULT.nodes);
  const [cycleNodes, setCycleNodes] = useState<BellmanFordNode[]>(GRAPH_CYCLE_DEFAULT.nodes);

  const activeGraph = useMemo(() => {
    return mode === 'stable'
      ? { nodes: stableNodes, edges: GRAPH_STABLE_DEFAULT.edges }
      : { nodes: cycleNodes, edges: GRAPH_CYCLE_DEFAULT.edges };
  }, [mode, stableNodes, cycleNodes]);

  const { nodes, edges } = activeGraph;
  const maxIters = nodes.length - 1;
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute DP table M[i, v] for all i from 0 up to nodes.length
  const fullTable: Array<Record<string, number>> = useMemo(() => {
    const rows: Array<Record<string, number>> = [];
    const row0: Record<string, number> = {};
    for (const n of nodes) row0[n.id] = Infinity;
    row0['S'] = 0;
    rows.push(row0);

    for (let i = 1; i <= nodes.length; i++) {
      const prev = rows[i - 1];
      const curr: Record<string, number> = { ...prev };
      for (const e of edges) {
        if (prev[e.u] !== Infinity && prev[e.u] + e.weight < curr[e.v]) {
          curr[e.v] = prev[e.u] + e.weight;
        }
      }
      rows.push(curr);
    }
    return rows;
  }, [nodes, edges]);

  const currentDists = fullTable[iteration] || fullTable[0];
  const hasNegativeCycleDetected = mode === 'cycle' && iteration >= nodes.length;

  const handleStep = () => {
    if (iteration < nodes.length) {
      const nextIter = iteration + 1;
      setIteration(nextIter);
      if (nextIter >= nodes.length && mode === 'cycle') {
        markAttempted('bellman-ford-dp');
      }
    }
  };

  const handlePrevStep = () => {
    if (iteration > 0) {
      setIteration(iteration - 1);
    }
  };

  const handleReset = (newMode: 'stable' | 'cycle') => {
    setMode(newMode);
    setIteration(0);
    setDraggingNodeId(null);
    if (newMode === 'cycle') {
      markAttempted('bellman-ford-dp');
    }
  };

  // Node Dragging Handling
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingNodeId(id);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 460 / rect.width;
    const scaleY = 260 / rect.height;

    const newX = Math.round(Math.max(30, Math.min(430, (e.clientX - rect.left) * scaleX)));
    const newY = Math.round(Math.max(30, Math.min(230, (e.clientY - rect.top) * scaleY)));

    if (mode === 'stable') {
      setStableNodes((prev) => prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n)));
    } else {
      setCycleNodes((prev) => prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDraggingNodeId(null);
    }
  };

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <div
      className="algorithm-playground bellman-ford-playground"
      role="region"
      aria-label="Laboratorio de Bellman-Ford y Ciclos Negativos"
    >
      {/* Top Presets & Controls Bar */}
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${mode === 'stable' ? 'active' : ''}`}
            onClick={() => handleReset('stable')}
          >
            {language === 'es' ? 'Pesos Negativos Factibles (Sin Ciclo)' : 'Valid Negative Weights (No Cycle)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${mode === 'cycle' ? 'active' : ''}`}
            onClick={() => handleReset('cycle')}
          >
            {language === 'es' ? 'Grafo con Ciclo Negativo (Kleinberg Cap. 6.8)' : 'Negative Cycle Graph'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={handlePrevStep}
            disabled={iteration === 0}
          >
            ← {language === 'es' ? 'Paso Anterior' : 'Prev Step'}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleStep}
            disabled={iteration >= nodes.length}
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            {iteration === maxIters && mode === 'cycle'
              ? (language === 'es' ? 'Probar Iteración |V| (Detector Ciclo) →' : 'Test Iteration |V| (Cycle Check) →')
              : (language === 'es' ? `Avanzar Iteración (${iteration} / ${maxIters}) →` : `Advance Iteration (${iteration} / ${maxIters}) →`)}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={() => setIteration(0)}
          >
            {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
        </div>
      </div>

      {/* Cycle Detection Banner */}
      {hasNegativeCycleDetected && (
        <div className="sdk-conflict-banner" role="alert" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444' }}>
          <strong style={{ color: '#ef4444' }}>
            {language === 'es' ? '¡Ciclo Negativo Identificado por la Ecuación de Bellman!' : 'Negative Cycle Detected via Bellman Equation!'}:
          </strong>{' '}
          {language === 'es'
            ? 'En la iteración |V| = 4, las distancias continuaron disminuyendo (M[4, A] = -1 < M[3, A] = 0). Esto demuestra formalmente que existe el ciclo cerrado A → B → C → A con costo 2 + (-3) + (-1) = -2 < 0. En consecuencia, el camino más corto diverge a -∞.'
            : 'At iteration |V| = 4, distances decreased further (M[4, A] = -1 < M[3, A] = 0). Cycle A -> B -> C -> A has weight sum -2 < 0. Distances diverge to -∞.'}
        </div>
      )}

      {/* Interactive SVG Graph */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          <span>{language === 'es' ? 'Grafo Dirigido (Arrastrá los nodos para moverlos):' : 'Directed Graph (Drag nodes to rearrange):'}</span>
          <span>{language === 'es' ? 'Iteración actual i =' : 'Current iter i ='} <strong>{iteration}</strong></span>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 460 260"
          style={{
            maxWidth: '480px',
            width: '100%',
            height: 'auto',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            touchAction: 'none'
          }}
          role="img"
          aria-label="Grafo interactivo de Bellman-Ford"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <defs>
            <marker id="bf-pg-arr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
            </marker>
            <marker id="bf-pg-arr-neg" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
            </marker>
            <marker id="bf-pg-arr-cycle" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e, idx) => {
            const u = nodeMap.get(e.u);
            const v = nodeMap.get(e.v);
            if (!u || !v) return null;

            const isNeg = e.weight < 0;
            const isCycleEdge = mode === 'cycle' && ['A-B', 'B-C', 'C-A'].includes(`${e.u}-${e.v}`);
            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            let strokeColor = isNeg ? '#ef4444' : 'var(--border, #475569)';
            let markerId = isNeg ? 'url(#bf-pg-arr-neg)' : 'url(#bf-pg-arr)';

            if (hasNegativeCycleDetected && isCycleEdge) {
              strokeColor = '#f59e0b';
              markerId = 'url(#bf-pg-arr-cycle)';
            }

            return (
              <g key={`bf-pg-e-${idx}`}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={isNeg || (hasNegativeCycleDetected && isCycleEdge) ? 2.5 : 1.75}
                  markerEnd={markerId}
                />
                <circle
                  cx={midX}
                  cy={midY}
                  r={12}
                  fill="var(--surface-hover, #0f172a)"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isNeg ? '#ef4444' : 'var(--text, #f8fafc)'}
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
            const dist = currentDists[n.id];
            const distStr = dist === Infinity ? '∞' : String(dist);
            const isDragging = draggingNodeId === n.id;
            const isSource = n.id === 'S';

            return (
              <g
                key={`bf-pg-n-${n.id}`}
                onPointerDown={(e) => handlePointerDown(n.id, e)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={22}
                  fill="var(--surface, #0f172a)"
                  stroke={isSource ? '#10b981' : isDragging ? '#38bdf8' : 'var(--accent, #6366f1)'}
                  strokeWidth={isDragging ? 3.5 : 2.5}
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fill="var(--text, #f8fafc)"
                  fontFamily="var(--font-mono)"
                  fontSize="14px"
                  fontWeight="700"
                  style={{ userSelect: 'none' }}
                >
                  {n.id}
                </text>

                {/* Distance Badge */}
                <rect
                  x={n.x - 22}
                  y={n.y - 40}
                  width={44}
                  height={18}
                  rx={4}
                  fill="var(--bg, #1e293b)"
                  stroke={dist === Infinity ? 'var(--border)' : '#38bdf8'}
                  strokeWidth={1}
                />
                <text
                  x={n.x}
                  y={n.y - 27}
                  textAnchor="middle"
                  fill={dist === Infinity ? 'var(--text-muted)' : '#38bdf8'}
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  fontWeight="800"
                  style={{ userSelect: 'none' }}
                >
                  d={distStr}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic Programming Table M[i, v] */}
      <div style={{ marginTop: '0.75rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem' }}>
          {language === 'es' ? 'Matriz de Programación Dinámica M[i, v] (Kleinberg & Tardos):' : 'Dynamic Programming Matrix M[i, v]:'}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="djk-pq-table" style={{ width: '100%', fontSize: '0.85rem' }} aria-label="Tabla M[i, v] Bellman-Ford">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>{language === 'es' ? 'Paso i (≤ i aristas)' : 'Step i (≤ i edges)'}</th>
                {nodes.map((n) => (
                  <th key={`th-node-${n.id}`} style={{ textAlign: 'center' }}>
                    v = {n.id}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fullTable.slice(0, iteration + 1).map((row, iIdx) => {
                const isCurrentRow = iIdx === iteration;
                const isCycleDetectionRow = mode === 'cycle' && iIdx === nodes.length;

                return (
                  <tr
                    key={`dp-row-${iIdx}`}
                    style={{
                      background: isCycleDetectionRow
                        ? 'rgba(239, 68, 68, 0.15)'
                        : isCurrentRow
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'transparent'
                    }}
                  >
                    <td>
                      <strong>
                        {iIdx === nodes.length && mode === 'cycle'
                          ? (language === 'es' ? 'i = 4 (|V| cheq.)' : 'i = 4 (|V| test)')
                          : `M[${iIdx}, v]`}
                      </strong>
                    </td>
                    {nodes.map((n) => {
                      const val = row[n.id];
                      const prevVal = iIdx > 0 ? fullTable[iIdx - 1][n.id] : Infinity;
                      const hasDecreased = iIdx > 0 && val < prevVal;

                      return (
                        <td
                          key={`cell-${iIdx}-${n.id}`}
                          style={{
                            textAlign: 'center',
                            fontFamily: 'var(--font-mono)',
                            color: hasDecreased
                              ? isCycleDetectionRow
                                ? '#ef4444'
                                : '#10b981'
                              : 'var(--text)',
                            fontWeight: hasDecreased || isCurrentRow ? 700 : 400
                          }}
                        >
                          {val === Infinity ? '∞' : val}
                          {hasDecreased && (
                            <span style={{ fontSize: '0.7rem', marginLeft: '3px' }}>
                              {isCycleDetectionRow ? '▼!' : '▼'}
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
