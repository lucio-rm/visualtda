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
  const [negativeNodes, setNegativeNodes] = useState<DijkstraNode[]>(GRAPH_NEGATIVE_DEFAULT.nodes);

  const activeGraph = useMemo(() => {
    return preset === 'standard'
      ? { nodes: standardNodes, edges: GRAPH_STANDARD_DEFAULT.edges }
      : { nodes: negativeNodes, edges: GRAPH_NEGATIVE_DEFAULT.edges };
  }, [preset, standardNodes, negativeNodes]);

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
      aria-label="Laboratorio de Dijkstra y Exploración Voraz"
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
        <div className="sdk-conflict-banner" role="alert" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444' }}>
          <strong style={{ color: '#ef4444' }}>{language === 'es' ? 'Falla de Invariante Voraz (Greedy Stays Ahead)' : 'Greedy Invariant Failure'}:</strong>{' '}
          {language === 'es'
            ? 'Dijkstra asume que una vez que un nodo entra al conjunto explorado S, su distancia es mínima e irrevocable. Pero al existir pesos negativos, el camino S → B → A tiene costo 3 + (-2) = 1, superando la elección voraz de d[A] = 2. Para grafos con aristas negativas, se debe usar Bellman-Ford.'
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
              <span style={{ color: '#10b981' }}>● En S (Fijado)</span> · <span style={{ color: '#38bdf8' }}>● En Cola Q</span>
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
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
                    stroke={isTreeEdge ? '#10b981' : isRelaxingNow ? '#38bdf8' : isNeg ? '#ef4444' : 'var(--border, #475569)'}
                    strokeWidth={isTreeEdge ? 3.5 : isRelaxingNow ? 2.5 : 1.5}
                    markerEnd={isTreeEdge ? 'url(#djk-arr-active)' : 'url(#djk-arr)'}
                  />
                  <circle
                    cx={midX}
                    cy={midY}
                    r={11}
                    fill="var(--surface-hover, #0f172a)"
                    stroke={isTreeEdge ? '#10b981' : isNeg ? '#ef4444' : 'var(--border, #64748b)'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isTreeEdge ? '#10b981' : isNeg ? '#ef4444' : 'var(--text, #f8fafc)'}
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

              let strokeColor = 'var(--accent, #6366f1)';
              if (isSettled) strokeColor = '#10b981';
              if (isCurrent) strokeColor = '#38bdf8';

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
                    fill="var(--surface, #0f172a)"
                    stroke={strokeColor}
                    strokeWidth={isCurrent || isDragging ? 3.5 : 2.5}
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

                  {/* Distance Tag */}
                  <rect
                    x={n.x - 20}
                    y={n.y - 38}
                    width={40}
                    height={16}
                    rx={3}
                    fill="var(--bg, #1e293b)"
                    stroke={isSettled ? '#10b981' : '#38bdf8'}
                    strokeWidth={1}
                  />
                  <text
                    x={n.x}
                    y={n.y - 26}
                    textAnchor="middle"
                    fill={isSettled ? '#10b981' : '#38bdf8'}
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
                      ? 'rgba(56, 189, 248, 0.18)'
                      : isSettled
                      ? 'rgba(16, 185, 129, 0.12)'
                      : 'var(--bg)',
                    border: `1px solid ${isCurrent ? '#38bdf8' : isSettled ? '#10b981' : 'var(--border)'}`,
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
                      color: isSettled ? '#10b981' : isCurrent ? '#38bdf8' : 'var(--text-muted)'
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

          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            <strong>{language === 'es' ? 'Conjunto Explorador S' : 'Settled Set S'}:</strong>{' '}
            {currentStep.settled.length > 0 ? `{ ${currentStep.settled.join(', ')} }` : '∅'}
          </div>
        </div>
      </div>
    </div>
  );
};
