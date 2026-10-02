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

  // Editable / draggable node coordinates and edges
  const [stableNodes, setStableNodes] = useState<BellmanFordNode[]>(GRAPH_STABLE_DEFAULT.nodes);
  const [stableEdges, setStableEdges] = useState<BellmanFordEdge[]>(GRAPH_STABLE_DEFAULT.edges);
  const [cycleNodes, setCycleNodes] = useState<BellmanFordNode[]>(GRAPH_CYCLE_DEFAULT.nodes);
  const [cycleEdges, setCycleEdges] = useState<BellmanFordEdge[]>(GRAPH_CYCLE_DEFAULT.edges);

  const [edgeU, setEdgeU] = useState<string>('S');
  const [edgeV, setEdgeV] = useState<string>('A');
  const [edgeWeight, setEdgeWeight] = useState<number>(-1);
  const [editorError, setEditorError] = useState<string | null>(null);

  const activeGraph = useMemo(() => {
    return mode === 'stable'
      ? { nodes: stableNodes, edges: stableEdges }
      : { nodes: cycleNodes, edges: cycleEdges };
  }, [mode, stableNodes, stableEdges, cycleNodes, cycleEdges]);

  const handleAddOrUpdateEdge = () => {
    if (edgeU === edgeV) {
      setEditorError(language === 'es' ? 'No se permiten bucles reflexivos (u = v).' : 'Self-loops are not allowed (u = v).');
      return;
    }
    setEditorError(null);
    const updateEdges = (prev: BellmanFordEdge[]) => {
      const idx = prev.findIndex((e) => e.u === edgeU && e.v === edgeV);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { u: edgeU, v: edgeV, weight: edgeWeight };
        return copy;
      }
      return [...prev, { u: edgeU, v: edgeV, weight: edgeWeight }];
    };
    if (mode === 'stable') {
      setStableEdges(updateEdges);
    } else {
      setCycleEdges(updateEdges);
    }
    setIteration(0);
    markAttempted('bellman-ford');
  };

  const handleDeleteEdge = (u: string, v: string) => {
    const filterEdges = (prev: BellmanFordEdge[]) => prev.filter((e) => !(e.u === u && e.v === v));
    if (mode === 'stable') {
      setStableEdges(filterEdges);
    } else {
      setCycleEdges(filterEdges);
    }
    setIteration(0);
  };

  const handleAddNode = () => {
    const activeNodes = mode === 'stable' ? stableNodes : cycleNodes;
    const existingIds = new Set(activeNodes.map((n) => n.id));
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nextId = '';
    for (const char of alphabet) {
      if (!existingIds.has(char)) {
        nextId = char;
        break;
      }
    }
    if (!nextId) nextId = `N${activeNodes.length + 1}`;
    const newNode: BellmanFordNode = {
      id: nextId,
      x: 120 + (activeNodes.length % 4) * 75,
      y: 90 + Math.floor(activeNodes.length / 4) * 65
    };
    if (mode === 'stable') {
      setStableNodes((prev) => [...prev, newNode]);
    } else {
      setCycleNodes((prev) => [...prev, newNode]);
    }
    setIteration(0);
  };

  const handleResetGraph = () => {
    if (mode === 'stable') {
      setStableNodes(GRAPH_STABLE_DEFAULT.nodes);
      setStableEdges(GRAPH_STABLE_DEFAULT.edges);
    } else {
      setCycleNodes(GRAPH_CYCLE_DEFAULT.nodes);
      setCycleEdges(GRAPH_CYCLE_DEFAULT.edges);
    }
    setIteration(0);
    setEditorError(null);
  };

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
      aria-label={language === 'es' ? 'Laboratorio de Bellman-Ford y Ciclos Negativos' : 'Bellman-Ford and Negative Cycles Playground'}
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
            {language === 'es' ? 'Grafo con Ciclo Negativo' : 'Negative Cycle Graph'}
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
        <div className="sdk-conflict-banner" role="alert" style={{ background: 'var(--state-conflict-bg)', border: '1px solid var(--error)' }}>
          <strong style={{ color: 'var(--error)' }}>
            {language === 'es' ? '¡Ciclo Negativo Identificado por la Ecuación de Bellman!' : 'Negative Cycle Detected via Bellman Equation!'}:
          </strong>{' '}
          {language === 'es'
            ? 'En la iteración |V| = 4, las distancias continuaron disminuyendo (M[4, A] = -1 < M[3, A] = 0). Esto demuestra formalmente que existe el ciclo cerrado A → B → C → A con costo 2 + (-3) + (-1) = -2 < 0. En consecuencia, el camino más corto diverge a -∞.'
            : 'At iteration |V| = 4, distances decreased further (M[4, A] = -1 < M[3, A] = 0). Cycle A -> B -> C -> A has weight sum -2 < 0. Distances diverge to -∞.'}
        </div>
      )}

      {/* Interactive SVG Graph */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
          <span>{language === 'es' ? 'Grafo Dirigido (Arrastrá los nodos para moverlos):' : 'Directed Graph (Drag nodes to rearrange):'}</span>
          <span>{language === 'es' ? 'Iteración actual i =' : 'Current iter i ='} <strong>{iteration}</strong></span>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 460 260"
          style={{
            maxWidth: '100%',
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
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--graph-edge)" />
            </marker>
            <marker id="bf-pg-arr-neg" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--error)" />
            </marker>
            <marker id="bf-pg-arr-cycle" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--warning)" />
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

            let strokeColor = isNeg ? 'var(--error)' : 'var(--graph-edge)';
            let markerId = isNeg ? 'url(#bf-pg-arr-neg)' : 'url(#bf-pg-arr)';

            if (hasNegativeCycleDetected && isCycleEdge) {
              strokeColor = 'var(--warning)';
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
                  strokeWidth={isNeg || (hasNegativeCycleDetected && isCycleEdge) ? 3 : 2.5}
                  markerEnd={markerId}
                />
                <circle
                  cx={midX}
                  cy={midY}
                  r={12}
                  fill="var(--surface)"
                  stroke={strokeColor}
                  strokeWidth={1.5}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isNeg ? 'var(--error)' : 'var(--text)'}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
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
                  fill="var(--surface)"
                  stroke={isSource ? 'var(--success)' : isDragging ? 'var(--accent)' : 'var(--accent)'}
                  strokeWidth={isDragging ? 3.5 : 2.5}
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  fill="var(--text)"
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
                  stroke={dist === Infinity ? 'var(--border)' : 'var(--accent)'}
                  strokeWidth={1}
                />
                <text
                  x={n.x}
                  y={n.y - 27}
                  textAnchor="middle"
                  fill={dist === Infinity ? 'var(--text-muted)' : 'var(--accent)'}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
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
          {language === 'es' ? 'Matriz de Programación Dinámica M[i, v]:' : 'Dynamic Programming Matrix M[i, v]:'}
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
                        ? 'var(--state-conflict-bg)'
                        : isCurrentRow
                        ? 'var(--state-active-bg)'
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
                                ? 'var(--error)'
                                : 'var(--success)'
                              : 'var(--text)',
                            fontWeight: hasDecreased || isCurrentRow ? 700 : 400
                          }}
                        >
                          {val === Infinity ? '∞' : val}
                          {hasDecreased && (
                            <span style={{ fontSize: '0.8125rem', marginLeft: '3px' }}>
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

      {/* Interactive Custom Graph Editor for Bellman-Ford */}
      <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>
              {language === 'es' ? 'Editor Interactivo de Grafo (Aristas Dirigidas y Pesos ±)' : 'Interactive Graph Editor (Directed Edges & ± Weights)'}
            </h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {language === 'es'
                ? 'Conectá aristas con pesos positivos o negativos para observar cómo se propagan las relajaciones en la tabla DP o se provocan ciclos negativos.'
                : 'Connect edges with positive or negative weights to see DP relaxations propagate or trigger negative cycles.'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleAddNode}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
            >
              + {language === 'es' ? 'Agregar Nodo' : 'Add Node'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleResetGraph}
              style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
            >
              {language === 'es' ? 'Restaurar Predeterminado' : 'Reset to Default'}
            </button>
          </div>
        </div>

        {/* Edge Form Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--canvas-bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
            <span>{language === 'es' ? 'De (u):' : 'From (u):'}</span>
            <select
              value={edgeU}
              onChange={(e) => setEdgeU(e.target.value)}
              style={{ padding: '0.25rem 0.5rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.id}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
            <span>{language === 'es' ? 'Hacia (v):' : 'To (v):'}</span>
            <select
              value={edgeV}
              onChange={(e) => setEdgeV(e.target.value)}
              style={{ padding: '0.25rem 0.5rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.id}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
            <span>{language === 'es' ? 'Peso (±):' : 'Weight (±):'}</span>
            <input
              type="number"
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(Number(e.target.value))}
              style={{ width: '70px', padding: '0.25rem 0.5rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            />
          </label>

          <button
            type="button"
            className="btn-primary"
            onClick={handleAddOrUpdateEdge}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.85rem' }}
          >
            {language === 'es' ? 'Conectar / Modificar' : 'Connect / Update'}
          </button>
        </div>

        {editorError && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--error)' }}>
            {editorError}
          </div>
        )}

        {/* Existing Edges Badges */}
        <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '0.35rem' }}>
            {language === 'es' ? 'Aristas activas:' : 'Active edges:'}
          </span>
          {edges.map((e, idx) => (
            <span
              key={`bf-edge-badge-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.55rem',
                background: 'var(--canvas-bg)',
                border: `1px solid ${e.weight < 0 ? 'var(--error)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)',
                color: e.weight < 0 ? 'var(--error)' : 'var(--text)'
              }}
            >
              <span>{e.u} → {e.v} (w={e.weight})</span>
              <button
                type="button"
                onClick={() => handleDeleteEdge(e.u, e.v)}
                title={language === 'es' ? 'Eliminar arista' : 'Delete edge'}
                aria-label={language === 'es' ? `Eliminar arista ${e.u} a ${e.v}` : `Delete edge ${e.u} to ${e.v}`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--error)',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
