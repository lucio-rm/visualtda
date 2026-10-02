import React, { useState, useMemo, useRef, useCallback } from 'react';
import { DEFAULT_HAM_GRAPH, HamNode, HamEdge } from '../../engine/algorithms/hamiltonianCycleTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

interface GraphPreset {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  isHamiltonian: boolean;
  nodes: HamNode[];
  edges: HamEdge[];
  optimalCycle?: number[];
}

const GRAPH_PRESETS: GraphPreset[] = [
  {
    id: 'default',
    name: { es: 'Grafo Estándar (6 vértices)', en: 'Standard Graph (6 vertices)' },
    description: {
      es: 'Grafo estándar con múltiples caminos y al menos un ciclo hamiltoniano completo.',
      en: 'Standard graph with multiple paths and at least one complete Hamiltonian cycle.'
    },
    isHamiltonian: true,
    nodes: DEFAULT_HAM_GRAPH.nodes,
    edges: DEFAULT_HAM_GRAPH.edges,
    optimalCycle: [0, 1, 3, 5, 4, 2, 0]
  },
  {
    id: 'k5',
    name: { es: 'Grafo Completo K₅ (5 vértices)', en: 'Complete Graph K₅ (5 vertices)' },
    description: {
      es: 'Todo par de vértices está conectado. Existen múltiples ciclos hamiltonianos posibles.',
      en: 'Every pair of vertices is connected. Multiple Hamiltonian cycles exist.'
    },
    isHamiltonian: true,
    nodes: [
      { id: 0, label: 'v0', x: 250, y: 55 },
      { id: 1, label: 'v1', x: 400, y: 155 },
      { id: 2, label: 'v2', x: 345, y: 295 },
      { id: 3, label: 'v3', x: 155, y: 295 },
      { id: 4, label: 'v4', x: 100, y: 155 }
    ],
    edges: [
      { u: 0, v: 1 }, { u: 0, v: 2 }, { u: 0, v: 3 }, { u: 0, v: 4 },
      { u: 1, v: 2 }, { u: 1, v: 3 }, { u: 1, v: 4 },
      { u: 2, v: 3 }, { u: 2, v: 4 },
      { u: 3, v: 4 }
    ],
    optimalCycle: [0, 1, 2, 3, 4, 0]
  },
  {
    id: 'bipartite-odd',
    name: { es: 'Bipartito Impar K₃,₄ (Contraejemplo)', en: 'Odd Bipartite K₃,₄ (Counterexample)' },
    description: {
      es: 'Partición con |L|=3 y |R|=4 (|V|=7 impar). Demuestra por qué un grafo bipartito con |L| ≠ |R| NUNCA puede tener ciclo hamiltoniano.',
      en: 'Partition with |L|=3 and |R|=4 (|V|=7 odd). Proves why bipartite graphs with |L| ≠ |R| NEVER admit a Hamiltonian cycle.'
    },
    isHamiltonian: false,
    nodes: [
      // Left partition (3 nodes)
      { id: 0, label: 'L0', x: 140, y: 80 },
      { id: 1, label: 'L1', x: 140, y: 180 },
      { id: 2, label: 'L2', x: 140, y: 280 },
      // Right partition (4 nodes)
      { id: 3, label: 'R0', x: 360, y: 50 },
      { id: 4, label: 'R1', x: 360, y: 130 },
      { id: 5, label: 'R2', x: 360, y: 210 },
      { id: 6, label: 'R3', x: 360, y: 290 }
    ],
    edges: [
      { u: 0, v: 3 }, { u: 0, v: 4 }, { u: 0, v: 5 }, { u: 0, v: 6 },
      { u: 1, v: 3 }, { u: 1, v: 4 }, { u: 1, v: 5 }, { u: 1, v: 6 },
      { u: 2, v: 3 }, { u: 2, v: 4 }, { u: 2, v: 5 }, { u: 2, v: 6 }
    ]
  },
  {
    id: 'petersen',
    name: { es: 'Grafo de Petersen (10 vértices)', en: 'Petersen Graph (10 vertices)' },
    description: {
      es: 'Clásico contraejemplo de teoría de grafos: es hipohamiltoniano (eliminar un vértice lo hace hamiltoniano, pero el grafo entero NO tiene ciclo).',
      en: 'Classic graph theory counterexample: hypohamiltonian (removing any vertex yields a cycle, but the graph itself has NO Hamiltonian cycle).'
    },
    isHamiltonian: false,
    nodes: [
      // Outer pentagon (0-4)
      { id: 0, label: '0', x: 250, y: 40 },
      { id: 1, label: '1', x: 410, y: 145 },
      { id: 2, label: '2', x: 355, y: 300 },
      { id: 3, label: '3', x: 145, y: 300 },
      { id: 4, label: '4', x: 90, y: 145 },
      // Inner star (5-9)
      { id: 5, label: '5', x: 250, y: 110 },
      { id: 6, label: '6', x: 350, y: 175 },
      { id: 7, label: '7', x: 315, y: 250 },
      { id: 8, label: '8', x: 185, y: 250 },
      { id: 9, label: '9', x: 150, y: 175 }
    ],
    edges: [
      // Outer pentagon
      { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 }, { u: 3, v: 4 }, { u: 4, v: 0 },
      // Inner star
      { u: 5, v: 7 }, { u: 7, v: 9 }, { u: 9, v: 6 }, { u: 6, v: 8 }, { u: 8, v: 5 },
      // Spokes
      { u: 0, v: 5 }, { u: 1, v: 6 }, { u: 2, v: 7 }, { u: 3, v: 8 }, { u: 4, v: 9 }
    ]
  }
];

export const HamiltonianCyclePlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [selectedPresetId, setSelectedPresetId] = useState<string>('default');
  const currentPreset = useMemo(
    () => GRAPH_PRESETS.find((p) => p.id === selectedPresetId) || GRAPH_PRESETS[0],
    [selectedPresetId]
  );

  const [nodePositions, setNodePositions] = useState<Record<number, { x: number; y: number }>>(() => {
    const init: Record<number, { x: number; y: number }> = {};
    for (const n of GRAPH_PRESETS[0].nodes) {
      init[n.id] = { x: n.x, y: n.y };
    }
    return init;
  });

  const [path, setPath] = useState<number[]>([0]);

  // Dragging state for 2D vertex manipulation
  const [draggingNodeId, setDraggingNodeId] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const [customEdges, setCustomEdges] = useState<Record<string, HamEdge[]>>({});
  const [edgeU, setEdgeU] = useState<number>(0);
  const [edgeV, setEdgeV] = useState<number>(1);
  const [edgeError, setEdgeError] = useState<string | null>(null);

  const nodes = currentPreset.nodes;
  const edges = customEdges[selectedPresetId] || currentPreset.edges;
  const numV = nodes.length;

  const handleAddEdge = (e: React.FormEvent) => {
    e.preventDefault();
    setEdgeError(null);
    if (edgeU === edgeV) {
      setEdgeError(language === 'es' ? 'Los bucles no están permitidos.' : 'Self-loops are not allowed.');
      return;
    }
    const exists = edges.some(
      (ed) => (ed.u === edgeU && ed.v === edgeV) || (ed.u === edgeV && ed.v === edgeU)
    );
    if (exists) {
      setEdgeError(language === 'es' ? 'La arista ya existe en el grafo.' : 'Edge already exists in graph.');
      return;
    }
    const newEdges = [...edges, { u: edgeU, v: edgeV }];
    setCustomEdges((prev) => ({ ...prev, [selectedPresetId]: newEdges }));
    setPath([0]);
    markAttempted('hamiltonian-cycle-backtracking');
  };

  const handleRemoveEdge = (u: number, v: number) => {
    const newEdges = edges.filter(
      (ed) => !((ed.u === u && ed.v === v) || (ed.u === v && ed.v === u))
    );
    setCustomEdges((prev) => ({ ...prev, [selectedPresetId]: newEdges }));
    setPath([0]);
  };

  const handleResetEdges = () => {
    setCustomEdges((prev) => {
      const copy = { ...prev };
      delete copy[selectedPresetId];
      return copy;
    });
    setPath([0]);
    setEdgeError(null);
  };

  const adj = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const n of nodes) map.set(n.id, []);
    for (const e of edges) {
      map.get(e.u)?.push(e.v);
      map.get(e.v)?.push(e.u);
    }
    return map;
  }, [nodes, edges]);

  const currentU = path[path.length - 1];
  const visitedSet = useMemo(() => {
    return new Set(path.slice(0, path.length === numV + 1 ? numV : path.length));
  }, [path, numV]);

  const isCompleteCycle = path.length === numV + 1 && path[path.length - 1] === 0;

  const validNext = useMemo(() => {
    if (isCompleteCycle) return [];
    const neighbors = adj.get(currentU) || [];
    if (path.length === numV) {
      // Must return to start node 0
      return neighbors.includes(0) ? [0] : [];
    }
    return neighbors.filter((v) => !visitedSet.has(v));
  }, [adj, currentU, path.length, numV, visitedSet, isCompleteCycle]);

  const isDeadEnd = path.length < numV && validNext.length === 0;

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const target = GRAPH_PRESETS.find((p) => p.id === presetId) || GRAPH_PRESETS[0];
    const newPositions: Record<number, { x: number; y: number }> = {};
    for (const n of target.nodes) {
      newPositions[n.id] = { x: n.x, y: n.y };
    }
    setNodePositions(newPositions);
    setPath([0]);
  };

  const handleSelectNode = (v: number) => {
    if (!validNext.includes(v)) return;
    const nextPath = [...path, v];
    setPath(nextPath);

    if (nextPath.length === numV + 1 && nextPath[nextPath.length - 1] === 0) {
      markAttempted('hamiltonian-cycle-backtracking');
    }
  };

  const handleUndo = () => {
    if (path.length > 1) {
      setPath(path.slice(0, path.length - 1));
    }
  };

  const handleReset = () => {
    setPath([0]);
  };


  // 2D Pointer Drag Handlers
  const handlePointerDown = (nodeId: number, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    setDraggingNodeId(nodeId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (draggingNodeId === null || !svgRef.current) return;
      const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (dist > 5) {
        hasDraggedRef.current = true;
      }
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 500;
      const rawY = ((e.clientY - rect.top) / rect.height) * 350;

      const clampedX = Math.max(25, Math.min(475, Math.round(rawX)));
      const clampedY = Math.max(25, Math.min(325, Math.round(rawY)));

      setNodePositions((prev) => ({
        ...prev,
        [draggingNodeId]: { x: clampedX, y: clampedY }
      }));
    },
    [draggingNodeId]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId !== null) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored if pointer capture already released
      }
      setDraggingNodeId(null);
    }
  };

  return (
    <div
      className="algorithm-playground hamiltonian-cycle-playground"
      role="region"
      aria-label={language === 'es' ? 'Laboratorio de Ciclo Hamiltoniano' : 'Hamiltonian Cycle Playground'}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Controls & Instance Presets */}
      <div className="sdk-pg-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {GRAPH_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn-preset ${selectedPresetId === p.id ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p.id)}
              >
                {p.name[language]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-preset"
              onClick={handleUndo}
              disabled={path.length <= 1}
              style={{ fontWeight: '600' }}
            >
              ↩ {language === 'es' ? 'Retroceder (Backtrack)' : 'Backtrack (Undo)'}
            </button>
            <button type="button" className="btn-preset" onClick={handleReset}>
              ↺ {language === 'es' ? 'Reiniciar' : 'Reset'}
            </button>
          </div>
        </div>

        {/* Instance description and live stats */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--surface)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>
            {currentPreset.description[language]}
          </span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', whiteSpace: 'nowrap' }}>
            <span>
              {language === 'es' ? 'Vértices visitados:' : 'Visited vertices:'}{' '}
              <strong style={{ color: visitedSet.size === numV ? 'var(--success)' : 'var(--accent)' }}>
                {visitedSet.size} / {numV}
              </strong>
            </span>
            <span>
              {language === 'es' ? 'Vértice actual:' : 'Current vertex:'}{' '}
              <strong style={{ color: 'var(--warning)' }}>v{currentU}</strong>
            </span>
          </div>
        </div>

        {/* Interactive Edge Editor */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', backgroundColor: 'var(--surface)', padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
          <form onSubmit={handleAddEdge} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text)' }}>
              {language === 'es' ? 'Editar Aristas:' : 'Edit Edges:'}
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>u:</span>
              <select value={edgeU} onChange={(e) => setEdgeU(Number(e.target.value))} style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>v{n.id}</option>
                ))}
              </select>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span>v:</span>
              <select value={edgeV} onChange={(e) => setEdgeV(Number(e.target.value))} style={{ padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}>
                {nodes.map((n) => (
                  <option key={n.id} value={n.id}>v{n.id}</option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn-secondary" style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}>
              + {language === 'es' ? 'Conectar' : 'Connect'}
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => handleRemoveEdge(edgeU, edgeV)}
              style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}
            >
              - {language === 'es' ? 'Desconectar' : 'Disconnect'}
            </button>
            {customEdges[selectedPresetId] && (
              <button type="button" className="btn-secondary" onClick={handleResetEdges} style={{ padding: '0.25rem 0.6rem', fontSize: '0.8125rem' }}>
                {language === 'es' ? 'Restablecer Aristas' : 'Reset Edges'}
              </button>
            )}
            {edgeError && <span style={{ color: 'var(--error)', fontSize: '0.8125rem' }}>{edgeError}</span>}
          </form>
        </div>
      </div>

      {/* Status banner */}
      {isCompleteCycle ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--state-solution-bg)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            color: 'var(--success)'
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Ciclo Hamiltoniano Válido' : 'Valid Hamiltonian Cycle'}</strong>:{' '}
          {language === 'es'
            ? `Visitaste los ${numV} vértices exactamente una vez y retornaste al inicio: [${path.map((v) => `v${v}`).join(' → ')}].`
            : `Visited all ${numV} vertices exactly once and returned to start: [${path.map((v) => `v${v}`).join(' → ')}].`}
        </div>
      ) : isDeadEnd ? (
        <div
          className="sdk-conflict-banner"
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--state-conflict-bg)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--error)'
          }}
        >
          <strong>{language === 'es' ? 'Poda por Inviabilidad (Dead End / Backtrack Obligatorio)' : 'Dead End State (Backtrack Required)'}:</strong>{' '}
          {language === 'es'
            ? `Desde v${currentU}, todos los vecinos ya fueron visitados o no permiten cerrar el ciclo. El algoritmo de Backtracking debe descartar este subárbol y hacer retroceso.`
            : `From v${currentU}, all neighbors are already visited. Backtracking must prune this branch and backtrack.`}
        </div>
      ) : !currentPreset.isHamiltonian ? (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--state-candidate-bg)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            color: 'var(--warning)'
          }}
        >
          <strong>{language === 'es' ? 'Instancia No Hamiltoniana' : 'Non-Hamiltonian Instance'}:</strong>{' '}
          {language === 'es'
            ? 'Ninguna permutación de vértices puede cerrar un ciclo simple. Experimentá para comprobar cómo toda rama termina inevitablemente en Dead End.'
            : 'No permutation of vertices forms a simple cycle. Experiment to observe how every path leads to a Dead End.'}
        </div>
      ) : (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem'
          }}
        >
          {language === 'es' ? 'Candidatos adyacentes válidos para el siguiente paso:' : 'Valid adjacent candidates for next step:'}{' '}
          <strong style={{ color: 'var(--success)' }}>
            {validNext.map((v) => `v${v}`).join(', ') || (language === 'es' ? 'Ninguno' : 'None')}
          </strong>
        </div>
      )}

      {/* SVG Interactive Canvas with 2D Dragging */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--canvas-bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          padding: '0.5rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: '0.25rem',
            padding: '0 0.5rem'
          }}
        >
          <span>
            {language === 'es'
              ? 'Podes arrastrar los vértices libremente para reorganizar la topología del grafo.'
              : 'You can freely drag vertices to rearrange graph topology.'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            |V| = {numV}, |E| = {edges.length}
          </span>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 500 350"
          style={{
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            touchAction: 'none'
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          aria-label="Grafo interactivo de ciclo hamiltoniano con arrastre 2D"
        >
          {/* Edges */}
          {edges.map((e, idx) => {
            const uPos = nodePositions[e.u] || { x: 50, y: 50 };
            const vPos = nodePositions[e.v] || { x: 100, y: 100 };

            // Check if edge is traversed in path
            let inPath = false;
            let pathOrder = -1;
            for (let i = 0; i < path.length - 1; i++) {
              if (
                (path[i] === e.u && path[i + 1] === e.v) ||
                (path[i] === e.v && path[i + 1] === e.u)
              ) {
                inPath = true;
                pathOrder = i + 1;
                break;
              }
            }

            return (
              <g key={`ham-edge-${e.u}-${e.v}-${idx}`}>
                <line
                  x1={uPos.x}
                  y1={uPos.y}
                  x2={vPos.x}
                  y2={vPos.y}
                  stroke={inPath ? (isCompleteCycle ? 'var(--success)' : 'var(--accent)') : 'var(--border)'}
                  strokeWidth={inPath ? 3.5 : 1.5}
                  opacity={inPath ? 1 : 0.35}
                />
                {inPath && (
                  <circle
                    cx={(uPos.x + vPos.x) / 2}
                    cy={(uPos.y + vPos.y) / 2}
                    r={12}
                    fill={isCompleteCycle ? 'var(--success)' : 'var(--accent)'}
                  />
                )}
                {inPath && (
                  <text
                    x={(uPos.x + vPos.x) / 2}
                    y={(uPos.y + vPos.y) / 2 + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13px"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {pathOrder}
                  </text>
                )}
              </g>
            );
          })}

          {/* Interactive Draggable Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id] || { x: node.x, y: node.y };
            const isVisited = visitedSet.has(node.id);
            const isCurrent = currentU === node.id;
            const isSelectable = validNext.includes(node.id);
            const pathIdx = path.indexOf(node.id);
            const isStart = node.id === 0;

            return (
              <g
                key={`ham-node-${node.id}`}
                onPointerDown={(e) => handlePointerDown(node.id, e)}
                onClick={() => {
                  if (hasDraggedRef.current) {
                    hasDraggedRef.current = false;
                    return;
                  }
                  if (isSelectable) handleSelectNode(node.id);
                }}
                tabIndex={0}
                role="button"
                aria-label={
                  language === 'es'
                    ? `Vértice v${node.id}${isCurrent ? ' (actual)' : isSelectable ? ' (adyacente seleccionable)' : isVisited ? ' (visitado)' : ''}`
                    : `Vertex v${node.id}${isCurrent ? ' (current)' : isSelectable ? ' (selectable neighbor)' : isVisited ? ' (visited)' : ''}`
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isSelectable) handleSelectNode(node.id);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [node.id]: { x: pos.x, y: Math.max(25, pos.y - 10) } }));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [node.id]: { x: pos.x, y: Math.min(325, pos.y + 10) } }));
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [node.id]: { x: Math.max(25, pos.x - 10), y: pos.y } }));
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [node.id]: { x: Math.min(475, pos.x + 10), y: pos.y } }));
                  }
                }}
                style={{ cursor: isSelectable ? 'pointer' : 'grab' }}
              >
                {/* Glow ring on selectable or current node */}
                {(isCurrent || isSelectable) && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={26}
                    fill="none"
                    stroke={isCurrent ? 'var(--warning)' : 'var(--success)'}
                    strokeWidth={2}
                    strokeDasharray={isSelectable ? '3,3' : undefined}
                    opacity={0.8}
                  />
                )}

                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={22}
                  fill={
                    isCurrent
                      ? 'var(--warning-bg)'
                      : isSelectable
                      ? 'var(--state-candidate-bg)'
                      : isVisited
                      ? 'var(--accent-subtle)'
                      : 'var(--surface)'
                  }
                  stroke={
                    isCurrent
                      ? 'var(--warning)'
                      : isSelectable
                      ? 'var(--state-candidate)'
                      : isVisited
                      ? 'var(--accent)'
                      : 'var(--border-strong)'
                  }
                  strokeWidth={isCurrent || isSelectable ? 2.5 : 1.5}
                />

                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fill={isCurrent ? '#0f172a' : 'var(--text)'}
                  fontSize="13px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  pointerEvents="none"
                >
                  {node.label}
                </text>

                {/* Path order badge */}
                {pathIdx >= 0 && (
                  <g pointerEvents="none">
                    <rect
                      x={pos.x + 12}
                      y={pos.y - 24}
                      width={22}
                      height={18}
                      rx={3}
                      fill={isStart && pathIdx === 0 ? 'var(--accent)' : 'var(--accent)'}
                    />
                    <text
                      x={pos.x + 23}
                      y={pos.y - 11}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13px"
                      fontWeight="800"
                      fontFamily="var(--font-mono)"
                    >
                      {pathIdx + 1}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Decision Stack & Path Sequence */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '600' }}>
            {language === 'es' ? 'Recorrido en Pila (Stack):' : 'Traversal Stack:'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent)' }}>
            [{path.map((v) => `v${v}`).join(' → ')}]
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {language === 'es' ? 'Profundidad de árbol:' : 'Tree depth:'} {path.length - 1} / {numV}
        </span>
      </div>
    </div>
  );
};
