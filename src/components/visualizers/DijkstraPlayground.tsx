import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { DijkstraNode, DijkstraEdge } from '../../engine/algorithms/dijkstraTrace';

const GRAPH_STANDARD_DEFAULT: { nodes: DijkstraNode[]; edges: DijkstraEdge[] } = {
  nodes: [
    { id: 'S', label: 'S', x: 80, y: 130 },
    { id: 'A', label: 'A', x: 210, y: 60 },
    { id: 'B', label: 'B', x: 210, y: 200 },
    { id: 'T', label: 'T', x: 370, y: 130 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 4 },
    { u: 'S', v: 'B', weight: 2 },
    { u: 'B', v: 'A', weight: 1 },
    { u: 'A', v: 'T', weight: 3 },
    { u: 'B', v: 'T', weight: 6 }
  ]
};

const GRAPH_NEGATIVE_DEFAULT: { nodes: DijkstraNode[]; edges: DijkstraEdge[] } = {
  nodes: [
    { id: 'S', label: 'S', x: 80, y: 130 },
    { id: 'A', label: 'A', x: 240, y: 60 },
    { id: 'B', label: 'B', x: 240, y: 200 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 2 },
    { u: 'S', v: 'B', weight: 3 },
    { u: 'B', v: 'A', weight: -2 }
  ]
};

interface DijkstraStepHistory {
  settled: string[];
  currentU: string | null;
  dists: Record<string, number>;
  predecessor: Record<string, string | null>;
  relaxedEdges: Array<{ u: string; v: string; oldDist: number; newDist: number }>;
}

export const DijkstraPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [preset, setPreset] = useState<'standard' | 'negative'>('standard');
  const [source, setSource] = useState<string>('S');
  const [stepIdx, setStepIdx] = useState<number>(0);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const [standardNodes, setStandardNodes] = useState<DijkstraNode[]>(GRAPH_STANDARD_DEFAULT.nodes);
  const [standardEdges, setStandardEdges] = useState<DijkstraEdge[]>(GRAPH_STANDARD_DEFAULT.edges);
  const [negativeNodes, setNegativeNodes] = useState<DijkstraNode[]>(GRAPH_NEGATIVE_DEFAULT.nodes);
  const [negativeEdges, setNegativeEdges] = useState<DijkstraEdge[]>(GRAPH_NEGATIVE_DEFAULT.edges);

  const [edgeU, setEdgeU] = useState<string>('S');
  const [edgeV, setEdgeV] = useState<string>('T');
  const [edgeWeight, setEdgeWeight] = useState<number>(3);
  const [editorError, setEditorError] = useState<string | null>(null);

  const activeGraph = useMemo(() => {
    return preset === 'standard'
      ? { nodes: standardNodes, edges: standardEdges }
      : { nodes: negativeNodes, edges: negativeEdges };
  }, [preset, standardNodes, standardEdges, negativeNodes, negativeEdges]);

  const handleAddOrUpdateEdge = () => {
    if (edgeU === edgeV) {
      setEditorError(language === 'es' ? 'No se permiten bucles reflexivos (u = v).' : 'Self-loops are not allowed (u = v).');
      return;
    }
    setEditorError(null);
    const updateEdges = (prev: DijkstraEdge[]) => {
      const idx = prev.findIndex((e) => e.u === edgeU && e.v === edgeV);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { u: edgeU, v: edgeV, weight: edgeWeight };
        return copy;
      }
      return [...prev, { u: edgeU, v: edgeV, weight: edgeWeight }];
    };
    if (preset === 'standard') {
      setStandardEdges(updateEdges);
    } else {
      setNegativeEdges(updateEdges);
    }
    setStepIdx(0);
    markAttempted('dijkstra');
  };

  const handleDeleteEdge = (u: string, v: string) => {
    const filterEdges = (prev: DijkstraEdge[]) => prev.filter((e) => !(e.u === u && e.v === v));
    if (preset === 'standard') {
      setStandardEdges(filterEdges);
    } else {
      setNegativeEdges(filterEdges);
    }
    setStepIdx(0);
  };

  const handleAddNode = () => {
    const activeNodes = preset === 'standard' ? standardNodes : negativeNodes;
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
    const newNode: DijkstraNode = {
      id: nextId,
      label: nextId,
      x: 130 + (activeNodes.length % 4) * 70,
      y: 90 + Math.floor(activeNodes.length / 4) * 60
    };
    if (preset === 'standard') {
      setStandardNodes((prev) => [...prev, newNode]);
    } else {
      setNegativeNodes((prev) => [...prev, newNode]);
    }
    setStepIdx(0);
  };

  const handleResetGraph = () => {
    if (preset === 'standard') {
      setStandardNodes(GRAPH_STANDARD_DEFAULT.nodes);
      setStandardEdges(GRAPH_STANDARD_DEFAULT.edges);
    } else {
      setNegativeNodes(GRAPH_NEGATIVE_DEFAULT.nodes);
      setNegativeEdges(GRAPH_NEGATIVE_DEFAULT.edges);
    }
    setStepIdx(0);
    setEditorError(null);
  };

  const { nodes, edges } = activeGraph;
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute step-by-step history of Dijkstra
  const stepsHistory = useMemo(() => {
    const history: DijkstraStepHistory[] = [];
    const dists: Record<string, number> = {};
    const pred: Record<string, string | null> = {};
    for (const n of nodes) {
      dists[n.id] = Infinity;
      pred[n.id] = null;
    }
    dists[source] = 0;
    const settled: string[] = [];

    // Initial Step 0
    history.push({
      settled: [],
      currentU: null,
      dists: { ...dists },
      predecessor: { ...pred },
      relaxedEdges: []
    });

    for (let i = 0; i < nodes.length; i++) {
      let u: string | null = null;
      let minD = Infinity;

      for (const n of nodes) {
        if (!settled.includes(n.id) && dists[n.id] < minD) {
          minD = dists[n.id];
          u = n.id;
        }
      }

      if (!u) break;

      settled.push(u);
      const relaxedThisStep: Array<{ u: string; v: string; oldDist: number; newDist: number }> = [];

      for (const e of edges.filter((ed) => ed.u === u)) {
        if (dists[u] + e.weight < dists[e.v]) {
          relaxedThisStep.push({
            u: e.u,
            v: e.v,
            oldDist: dists[e.v],
            newDist: dists[u] + e.weight
          });
          dists[e.v] = dists[u] + e.weight;
          pred[e.v] = u;
        }
      }

      history.push({
        settled: [...settled],
        currentU: u,
        dists: { ...dists },
        predecessor: { ...pred },
        relaxedEdges: relaxedThisStep
      });
    }

    return history;
  }, [nodes, edges, source]);

  const currentStep = stepsHistory[Math.min(stepIdx, stepsHistory.length - 1)];
  const hasNegativeEdge = edges.some((e) => e.weight < 0);

  const handleSelectPreset = (p: 'standard' | 'negative') => {
    setPreset(p);
    setSource('S');
    setStepIdx(0);
    setDraggingNodeId(null);
    if (p === 'negative') {
      markAttempted('dijkstra-greedy');
    }
  };

  const handleNextStep = () => {
    if (stepIdx < stepsHistory.length - 1) {
      setStepIdx(stepIdx + 1);
    }
  };

  const handlePrevStep = () => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
    }
  };

  // Node Dragging
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

    if (preset === 'standard') {
      setStandardNodes((prev) => prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n)));
    } else {
      setNegativeNodes((prev) => prev.map((n) => (n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n)));
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
      className="algorithm-playground dijkstra-playground"
      role="region"
      aria-label="Laboratorio de Dijkstra y Exploración Greedy"
    >
      {/* Controls Bar */}
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${preset === 'standard' ? 'active' : ''}`}
            onClick={() => handleSelectPreset('standard')}
          >
            {language === 'es' ? 'Grafo Estándar (Pesos ≥ 0)' : 'Standard Graph (Weights ≥ 0)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${preset === 'negative' ? 'active' : ''}`}
            onClick={() => handleSelectPreset('negative')}
          >
            {language === 'es' ? 'Contraejemplo Pesos Negativos' : 'Negative Weight Counterexample'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
            <span>{language === 'es' ? 'Origen:' : 'Source:'}</span>
            <select
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setStepIdx(0);
              }}
              style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.2rem 0.5rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.id}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className="btn-tool"
            onClick={handlePrevStep}
            disabled={stepIdx === 0}
          >
            ← {language === 'es' ? 'Anterior' : 'Prev'}
          </button>

          <button
            type="button"
            className="btn-tool"
            onClick={handleNextStep}
            disabled={stepIdx >= stepsHistory.length - 1}
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            {language === 'es' ? `Avanzar Paso (${stepIdx} / ${stepsHistory.length - 1}) →` : `Next Step (${stepIdx} / ${stepsHistory.length - 1}) →`}
          </button>

          <button
            type="button"
            className="btn-tool"
            onClick={() => setStepIdx(0)}
          >
            {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
        </div>
      </div>

      {hasNegativeEdge && (
        <div className="sdk-conflict-banner" role="alert" style={{ background: 'var(--state-conflict-bg)', border: '1px solid var(--error)' }}>
          <strong style={{ color: 'var(--error)' }}>{language === 'es' ? 'Falla del Invariante Greedy (Greedy Stays Ahead)' : 'Greedy Invariant Failure'}:</strong>{' '}
          {language === 'es'
            ? 'Dijkstra asume que una vez que un nodo entra al conjunto explorado S, su distancia es mínima e irrevocable. Pero al existir pesos negativos, el camino S → B → A tiene costo 3 + (-2) = 1, superando la elección greedy de d[A] = 2. Para grafos con aristas negativas, se debe usar Bellman-Ford.'
            : 'Dijkstra permanently fixes distances when entering S. With negative weights, S → B → A costs 1, breaking d[A]=2. Use Bellman-Ford DP for negative weights.'}
        </div>
      )}

      {/* Main Grid: Interactive SVG Graph + Min-Heap Priority Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) 220px', gap: '1rem', alignItems: 'start' }}>
        {/* SVG Canvas */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{language === 'es' ? 'Grafo Dirigido (Arrastrá los nodos):' : 'Directed Graph (Drag nodes):'}</span>
            <span>
              <span style={{ color: 'var(--success)' }}>● En S (Fijado)</span> · <span style={{ color: 'var(--accent)' }}>● En Cola Q</span>
            </span>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 460 260"
            style={{ width: '100%', height: 'auto', display: 'block', touchAction: 'none' }}
            role="img"
            aria-label="Grafo interactivo de Dijkstra"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <marker id="djk-arr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
              </marker>
              <marker id="djk-arr-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--success)" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((e, idx) => {
              const u = nodeMap.get(e.u);
              const v = nodeMap.get(e.v);
              if (!u || !v) return null;

              const isTreeEdge = currentStep.predecessor[e.v] === e.u;
              const isRelaxingNow = currentStep.currentU === e.u;
              const isNeg = e.weight < 0;
              const midX = (u.x + v.x) / 2;
              const midY = (u.y + v.y) / 2;

              return (
                <g key={`djk-e-${idx}`}>
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={isTreeEdge ? 'var(--success)' : isRelaxingNow ? 'var(--accent)' : isNeg ? 'var(--error)' : 'var(--border, #475569)'}
                    strokeWidth={isTreeEdge ? 3.5 : isRelaxingNow ? 2.5 : 1.5}
                    markerEnd={isTreeEdge ? 'url(#djk-arr-active)' : 'url(#djk-arr)'}
                  />
                  <circle
                    cx={midX}
                    cy={midY}
                    r={11}
                    fill="var(--surface-hover, #0f172a)"
                    stroke={isTreeEdge ? 'var(--success)' : isNeg ? 'var(--error)' : 'var(--border, #64748b)'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isTreeEdge ? 'var(--success)' : isNeg ? 'var(--error)' : 'var(--text)'}
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
              const isSettled = currentStep.settled.includes(n.id);
              const isCurrent = currentStep.currentU === n.id;
              const dist = currentStep.dists[n.id];
              const distStr = dist === Infinity ? '∞' : String(dist);
              const isDragging = draggingNodeId === n.id;

              let strokeColor = 'var(--accent)';
              if (isSettled) strokeColor = 'var(--success)';
              if (isCurrent) strokeColor = 'var(--accent)';

              return (
                <g
                  key={`djk-n-${n.id}`}
                  onPointerDown={(e) => handlePointerDown(n.id, e)}
                  style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={22}
                    fill="var(--surface)"
                    stroke={strokeColor}
                    strokeWidth={isCurrent || isDragging ? 3.5 : 2.5}
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

                  {/* Distance Tag */}
                  <rect
                    x={n.x - 20}
                    y={n.y - 38}
                    width={40}
                    height={16}
                    rx={3}
                    fill="var(--bg, #1e293b)"
                    stroke={isSettled ? 'var(--success)' : 'var(--accent)'}
                    strokeWidth={1}
                  />
                  <text
                    x={n.x}
                    y={n.y - 26}
                    textAnchor="middle"
                    fill={isSettled ? 'var(--success)' : 'var(--accent)'}
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

        {/* Min-Heap Priority Queue Q & Settled S Panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.65rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>
            {language === 'es' ? 'Cola de Prioridad Q (Min-Heap):' : 'Min-Heap Priority Queue Q:'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {nodes.map((n) => {
              const isSettled = currentStep.settled.includes(n.id);
              const dist = currentStep.dists[n.id];
              const distStr = dist === Infinity ? '∞' : String(dist);
              const isCurrent = currentStep.currentU === n.id;

              return (
                <div
                  key={`pq-row-${n.id}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.3rem 0.5rem',
                    background: isCurrent
                      ? 'var(--state-active-bg)'
                      : isSettled
                      ? 'var(--state-solution-bg)'
                      : 'var(--bg)',
                    border: `1px solid ${isCurrent ? 'var(--accent)' : isSettled ? 'var(--success)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {n.id}: d = {distStr}
                  </span>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: isSettled ? 'var(--success)' : isCurrent ? 'var(--accent)' : 'var(--text-muted)'
                    }}
                  >
                    {isCurrent
                      ? (language === 'es' ? 'Extrayendo' : 'Extracting')
                      : isSettled
                      ? (language === 'es' ? '✓ En S' : '✓ In S')
                      : (language === 'es' ? 'En Q' : 'In Q')}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            <strong>{language === 'es' ? 'Conjunto Explorador S' : 'Settled Set S'}:</strong>{' '}
            {currentStep.settled.length > 0 ? `{ ${currentStep.settled.join(', ')} }` : '∅'}
          </div>
        </div>
      </div>

      {/* Interactive Custom Graph Editor */}
      <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>
              {language === 'es' ? 'Editor Interactivo de Grafo (Aristas y Pesos)' : 'Interactive Graph Editor (Edges & Weights)'}
            </h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {language === 'es'
                ? 'Conectá nodos, modificá pesos de aristas o agregá nuevos vértices para experimentar.'
                : 'Connect nodes, update edge weights, or insert new vertices to experiment.'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
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
            <span>{language === 'es' ? 'Peso:' : 'Weight:'}</span>
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
              key={`edge-badge-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.55rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)'
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
