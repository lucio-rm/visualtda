import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './MaxFlowPlayground.css';

interface PlaygroundEdge {
  u: string;
  v: string;
  capacity: number;
  flow: number;
}

interface PlaygroundPreset {
  name: { es: string; en: string };
  nodes: { id: string; label: string; x: number; y: number; isSource?: boolean; isSink?: boolean }[];
  edges: { u: string; v: string; capacity: number }[];
  source: string;
  sink: string;
}

const PRESETS: PlaygroundPreset[] = [
  {
    name: {
      es: 'Red Clásica con Arista Cruzada (Demostración de Red Residual)',
      en: 'Classic Network with Cross-Edge (Residual Network Demo)'
    },
    nodes: [
      { id: 's', label: 's (Fuente)', x: 80, y: 140, isSource: true },
      { id: 'u', label: 'u', x: 250, y: 60 },
      { id: 'v', label: 'v', x: 250, y: 220 },
      { id: 't', label: 't (Sumidero)', x: 420, y: 140, isSink: true }
    ],
    edges: [
      { u: 's', v: 'u', capacity: 10 },
      { u: 's', v: 'v', capacity: 10 },
      { u: 'u', v: 'v', capacity: 2 },
      { u: 'u', v: 't', capacity: 10 },
      { u: 'v', v: 't', capacity: 10 }
    ],
    source: 's',
    sink: 't'
  },
  {
    name: {
      es: 'Red Diamante Simple',
      en: 'Simple Diamond Network'
    },
    nodes: [
      { id: 's', label: 's', x: 80, y: 140, isSource: true },
      { id: 'u', label: 'A', x: 250, y: 60 },
      { id: 'v', label: 'B', x: 250, y: 220 },
      { id: 't', label: 't', x: 420, y: 140, isSink: true }
    ],
    edges: [
      { u: 's', v: 'u', capacity: 15 },
      { u: 's', v: 'v', capacity: 8 },
      { u: 'u', v: 't', capacity: 12 },
      { u: 'v', v: 't', capacity: 10 }
    ],
    source: 's',
    sink: 't'
  },
  {
    name: {
      es: 'Cuello de Botella Estricto',
      en: 'Strict Bottleneck Network'
    },
    nodes: [
      { id: 's', label: 's', x: 80, y: 140, isSource: true },
      { id: 'u', label: 'u', x: 250, y: 60 },
      { id: 'v', label: 'v', x: 250, y: 220 },
      { id: 't', label: 't', x: 420, y: 140, isSink: true }
    ],
    edges: [
      { u: 's', v: 'u', capacity: 20 },
      { u: 's', v: 'v', capacity: 20 },
      { u: 'u', v: 't', capacity: 5 },
      { u: 'v', v: 't', capacity: 6 }
    ],
    source: 's',
    sink: 't'
  }
];

export const MaxFlowPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const activePreset = PRESETS[selectedPresetIndex];

  // Dynamic node coordinates for 2D dragging
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const init: Record<string, { x: number; y: number }> = {};
    for (const n of activePreset.nodes) {
      init[n.id] = { x: n.x, y: n.y };
    }
    return init;
  });

  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const [edges, setEdges] = useState<PlaygroundEdge[]>(() =>
    activePreset.edges.map((e) => ({ ...e, flow: 0 }))
  );
  const [selectedPath, setSelectedPath] = useState<string[]>(['s']);
  const [message, setMessage] = useState<{ es: string; en: string }>({
    es: 'Haz clic en los nodos en secuencia para construir un camino de aumento desde la fuente s hacia el sumidero t.',
    en: 'Click nodes in sequence to construct an augmenting path from source s to sink t.'
  });

  const resetNetwork = useCallback((preset: PlaygroundPreset) => {
    setEdges(preset.edges.map((e) => ({ ...e, flow: 0 })));
    setSelectedPath([preset.source]);
    const initPos: Record<string, { x: number; y: number }> = {};
    for (const n of preset.nodes) {
      initPos[n.id] = { x: n.x, y: n.y };
    }
    setNodePositions(initPos);
    setMessage({
      es: 'Red reiniciada con flujo cero. Selecciona el siguiente nodo conectado en la red residual.',
      en: 'Network reset with zero flow. Select the next connected node in the residual network.'
    });
  }, []);

  const [editU, setEditU] = useState<string>('s');
  const [editV, setEditV] = useState<string>('u');
  const [editCapacity, setEditCapacity] = useState<number>(10);
  const [editorError, setEditorError] = useState<string | null>(null);

  const handleAddOrUpdateEdge = () => {
    if (editU === editV) {
      setEditorError(language === 'es' ? 'No se permiten bucles reflexivos (u = v).' : 'Self-loops are not allowed (u = v).');
      return;
    }
    if (editCapacity <= 0) {
      setEditorError(language === 'es' ? 'La capacidad debe ser un entero positivo (> 0).' : 'Capacity must be positive (> 0).');
      return;
    }
    setEditorError(null);
    setEdges((prev) => {
      const idx = prev.findIndex((e) => e.u === editU && e.v === editV);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], capacity: editCapacity, flow: Math.min(copy[idx].flow, editCapacity) };
        return copy;
      }
      return [...prev, { u: editU, v: editV, capacity: editCapacity, flow: 0 }];
    });
    setSelectedPath([activePreset.source]);
    markAttempted('max-flow-ford-fulkerson');
  };

  const handleDeleteEdge = (u: string, v: string) => {
    setEdges((prev) => prev.filter((e) => !(e.u === u && e.v === v)));
    setSelectedPath([activePreset.source]);
  };

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    resetNetwork(PRESETS[idx]);
  };

  // Residual capacity query between two vertices u and v
  const getResidualCapacity = useCallback((u: string, v: string, currentEdges: PlaygroundEdge[]) => {
    const fwd = currentEdges.find((e) => e.u === u && e.v === v);
    if (fwd) {
      return fwd.capacity - fwd.flow;
    }
    const bwd = currentEdges.find((e) => e.u === v && e.v === u);
    if (bwd) {
      return bwd.flow; // backward residual capacity
    }
    return 0;
  }, []);

  const totalFlow = useMemo(() => {
    return edges
      .filter((e) => e.u === activePreset.source)
      .reduce((sum, e) => sum + e.flow, 0);
  }, [edges, activePreset.source]);

  // Bottleneck capacity of current selected path
  const bottleneck = useMemo(() => {
    if (selectedPath.length < 2) return null;
    let minCap = Infinity;
    for (let i = 0; i < selectedPath.length - 1; i++) {
      const u = selectedPath[i];
      const v = selectedPath[i + 1];
      const cap = getResidualCapacity(u, v, edges);
      if (cap < minCap) minCap = cap;
    }
    return minCap === Infinity ? 0 : minCap;
  }, [selectedPath, edges, getResidualCapacity]);

  const handleNodeClick = (nodeId: string) => {
    markAttempted('max-flow');

    if (selectedPath.length === 0 || selectedPath[selectedPath.length - 1] === activePreset.sink) {
      if (nodeId === activePreset.source) {
        setSelectedPath([nodeId]);
        setMessage({
          es: 'Inicio de nuevo camino en la fuente s. Selecciona el próximo nodo con capacidad residual positiva.',
          en: 'Started new path at source s. Select next node with positive residual capacity.'
        });
      }
      return;
    }

    const lastNode = selectedPath[selectedPath.length - 1];

    if (nodeId === lastNode) {
      // Deselect last node
      if (selectedPath.length > 1) {
        setSelectedPath((p) => p.slice(0, -1));
      }
      return;
    }

    if (selectedPath.includes(nodeId)) {
      setMessage({
        es: `El nodo ${nodeId} ya está en el camino actual (evita ciclos simples innecesarios).`,
        en: `Node ${nodeId} is already in the current path (avoids unnecessary cycles).`
      });
      return;
    }

    const residual = getResidualCapacity(lastNode, nodeId, edges);
    if (residual <= 0) {
      setMessage({
        es: `No hay capacidad residual disponible entre ${lastNode} y ${nodeId} (cf = 0). La arista está saturada o no existe conexión.`,
        en: `No residual capacity available between ${lastNode} and ${nodeId} (cf = 0). Edge is saturated or no connection exists.`
      });
      return;
    }

    const newPath = [...selectedPath, nodeId];
    setSelectedPath(newPath);

    if (nodeId === activePreset.sink) {
      setMessage({
        es: `¡Camino de aumento s-t encontrado! Presiona "Aumentar Flujo".`,
        en: `Augmenting s-t path found! Click "Push Flow".`
      });
    } else {
      setMessage({
        es: `Añadido nodo ${nodeId}. Continúa hacia el sumidero t.`,
        en: `Added node ${nodeId}. Continue towards sink t.`
      });
    }
  };

  const handlePushFlow = () => {
    if (!bottleneck || bottleneck <= 0 || selectedPath[selectedPath.length - 1] !== activePreset.sink) {
      return;
    }

    const delta = bottleneck;
    setEdges((prev) => {
      const nextEdges = prev.map((e) => ({ ...e }));
      for (let i = 0; i < selectedPath.length - 1; i++) {
        const u = selectedPath[i];
        const v = selectedPath[i + 1];

        const fwd = nextEdges.find((e) => e.u === u && e.v === v);
        if (fwd) {
          fwd.flow += delta;
        } else {
          const bwd = nextEdges.find((e) => e.u === v && e.v === u);
          if (bwd) {
            bwd.flow -= delta; // Flow cancellation via backward edge!
          }
        }
      }
      return nextEdges;
    });

    setSelectedPath([activePreset.source]);
    setMessage({
      es: `Flujo aumentado exitosamente en ${delta} unidades. Flujo total actual: ${totalFlow + delta}.`,
      en: `Flow successfully augmented by ${delta} units. Current total flow: ${totalFlow + delta}.`
    });
  };

  // Find augmenting path via BFS in residual network (Edmonds-Karp step)
  const handleFindAugmentingPathBFS = () => {
    const parent: Record<string, string> = {};
    const visited = new Set<string>([activePreset.source]);
    const queue = [activePreset.source];
    let found = false;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === activePreset.sink) {
        found = true;
        break;
      }
      for (const node of activePreset.nodes) {
        if (!visited.has(node.id) && getResidualCapacity(curr, node.id, edges) > 0) {
          visited.add(node.id);
          parent[node.id] = curr;
          queue.push(node.id);
        }
      }
    }

    if (!found) {
      setMessage({
        es: 'No existen más caminos de aumento en la red residual. Se alcanzó el Flujo Máximo global.',
        en: 'No more augmenting paths exist in residual network. Global Max-Flow reached.'
      });
      return;
    }

    const pathReconstructed: string[] = [];
    let curr: string | undefined = activePreset.sink;
    while (curr) {
      pathReconstructed.unshift(curr);
      curr = parent[curr];
    }
    setSelectedPath(pathReconstructed);
    setMessage({
      es: `Camino de aumento hallado por BFS: [${pathReconstructed.join(' → ')}]. Presiona "Aumentar Flujo".`,
      en: `Augmenting path found via BFS: [${pathReconstructed.join(' → ')}]. Click "Push Flow".`
    });
  };



  // Find reachable nodes from s in residual graph (Cut S)
  const reachableNodes = useMemo(() => {
    const visited = new Set<string>([activePreset.source]);
    const queue = [activePreset.source];

    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const node of activePreset.nodes) {
        if (!visited.has(node.id) && getResidualCapacity(u, node.id, edges) > 0) {
          visited.add(node.id);
          queue.push(node.id);
        }
      }
    }
    return visited;
  }, [activePreset, edges, getResidualCapacity]);

  const isMaxFlowAchieved = !reachableNodes.has(activePreset.sink);

  // 2D Pointer Drag Handlers
  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    setDraggingNode(nodeId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingNode || !svgRef.current) return;
      const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (dist > 5) {
        hasDraggedRef.current = true;
      }
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 500;
      const rawY = ((e.clientY - rect.top) / rect.height) * 280;

      const clampedX = Math.max(30, Math.min(470, Math.round(rawX)));
      const clampedY = Math.max(30, Math.min(250, Math.round(rawY)));

      setNodePositions((prev) => ({
        ...prev,
        [draggingNode]: { x: clampedX, y: clampedY }
      }));
    },
    [draggingNode]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNode) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      setDraggingNode(null);
    }
  };

  return (
    <div
      className="maxflow-playground"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
          {language === 'es'
            ? 'Laboratorio Interactivo: Redes de Flujo y Caminos de Aumento'
            : 'Interactive Lab: Flow Networks & Augmenting Paths'}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          {language === 'es'
            ? 'Construye caminos de aumento hacia el sumidero, envía flujo para saturar cuellos de botella y observa el surgimiento del corte mínimo S-T. Puedes arrastrar los nodos para reorganizar el grafo.'
            : 'Construct augmenting paths to sink, push flow to saturate bottlenecks, and observe min-cut emergence. Drag nodes to rearrange graph.'}
        </p>
      </div>

      {/* Preset selection bar */}
      <div className="presets-row" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          {language === 'es' ? 'Topologías de Red:' : 'Network Topologies:'}
        </span>
        {PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            className={`btn-preset ${selectedPresetIndex === idx ? 'active' : ''}`}
            onClick={() => handleSelectPreset(idx)}
          >
            {p.name[language]}
          </button>
        ))}
      </div>

      {/* Interactive SVG Canvas with 2D Dragging */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg)',
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
              ? 'Hacé clic en los nodos en orden para trazar el camino de aumento. Arrastralos para moverlos.'
              : 'Click nodes in order to trace augmenting path. Drag to reposition.'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>|V| = {activePreset.nodes.length}, |E| = {edges.length}</span>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 500 280"
          style={{
            width: '100%',
            maxWidth: '540px',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            touchAction: 'none'
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          aria-label="Red de flujo interactiva con arrastre 2D"
        >
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="19"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
            </marker>
            <marker
              id="arrow-saturated"
              viewBox="0 0 10 10"
              refX="19"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--error)" />
            </marker>
            <marker
              id="arrow-flow"
              viewBox="0 0 10 10"
              refX="19"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--success)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e) => {
            const uPos = nodePositions[e.u] || { x: 50, y: 50 };
            const vPos = nodePositions[e.v] || { x: 100, y: 100 };
            const midX = (uPos.x + vPos.x) / 2;
            const midY = (uPos.y + vPos.y) / 2 - 8;

            const isSaturated = e.flow === e.capacity;
            const hasFlow = e.flow > 0;

            let marker = 'url(#arrow)';
            if (isSaturated) marker = 'url(#arrow-saturated)';
            else if (hasFlow) marker = 'url(#arrow-flow)';

            // Check if edge is in selected augmenting path
            let inAugmentingPath = false;
            for (let i = 0; i < selectedPath.length - 1; i++) {
              if (selectedPath[i] === e.u && selectedPath[i + 1] === e.v) {
                inAugmentingPath = true;
                break;
              }
            }

            return (
              <g key={`${e.u}->${e.v}`}>
                <line
                  x1={uPos.x}
                  y1={uPos.y}
                  x2={vPos.x}
                  y2={vPos.y}
                  stroke={inAugmentingPath ? 'var(--accent)' : isSaturated ? 'var(--error)' : hasFlow ? 'var(--success)' : 'var(--border)'}
                  strokeWidth={inAugmentingPath ? 3.5 : hasFlow ? 2.5 : 1.5}
                  markerEnd={marker}
                  opacity={isSaturated ? 0.7 : 1}
                />
                <circle cx={midX} cy={midY} r={15} fill="var(--surface)" stroke="var(--border)" strokeWidth={1} />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isSaturated ? 'var(--error)' : hasFlow ? 'var(--success)' : 'var(--text)'}
                  fontSize="13px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  pointerEvents="none"
                >
                  {e.flow}/{e.capacity}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {activePreset.nodes.map((n) => {
            const pos = nodePositions[n.id] || { x: n.x, y: n.y };
            const isSelected = selectedPath.includes(n.id);
            const isReachable = reachableNodes.has(n.id);
            const isDragging = draggingNode === n.id;

            return (
              <g
                key={n.id}
                onPointerDown={(e) => handlePointerDown(n.id, e)}
                onClick={() => {
                  if (hasDraggedRef.current) {
                    hasDraggedRef.current = false;
                    return;
                  }
                  handleNodeClick(n.id);
                }}
                tabIndex={0}
                role="button"
                aria-label={
                  language === 'es'
                    ? `Nodo ${n.id}${n.isSource ? ' (Fuente s)' : n.isSink ? ' (Sumidero t)' : ''}${isSelected ? ' (seleccionado)' : ''}`
                    : `Node ${n.id}${n.isSource ? ' (Source s)' : n.isSink ? ' (Sink t)' : ''}${isSelected ? ' (selected)' : ''}`
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNodeClick(n.id);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [n.id]: { x: pos.x, y: Math.max(30, pos.y - 10) } }));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [n.id]: { x: pos.x, y: Math.min(270, pos.y + 10) } }));
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [n.id]: { x: Math.max(30, pos.x - 10), y: pos.y } }));
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setNodePositions((prev) => ({ ...prev, [n.id]: { x: Math.min(570, pos.x + 10), y: pos.y } }));
                  }
                }}
                style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
              >
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={24}
                  fill={n.isSource ? 'var(--accent)' : n.isSink ? 'var(--success)' : isSelected ? 'var(--accent)' : 'var(--surface)'}
                  stroke={isSelected ? 'var(--text)' : n.isSource ? 'var(--accent-hover)' : n.isSink ? 'var(--success)' : 'var(--border-strong)'}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text
                  x={pos.x}
                  y={pos.y + 5}
                  textAnchor="middle"
                  fill={n.isSource || n.isSink || isSelected ? 'var(--accent-contrast)' : 'var(--text)'}
                  fontSize="14px"
                  fontWeight="600"
                  fontFamily="var(--font-mono)"
                  pointerEvents="none"
                >
                  {n.id}
                </text>
                {isMaxFlowAchieved && (
                  <text
                    x={pos.x}
                    y={pos.y + 36}
                    fontSize="13px"
                    textAnchor="middle"
                    fill={isReachable ? 'var(--accent)' : 'var(--text-muted)'}
                    fontWeight="600"
                    pointerEvents="none"
                  >
                    {isReachable ? '∈ S' : '∈ T'}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path building info and action buttons */}
      <div
        className="mf-controls-row"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {language === 'es' ? 'Camino Seleccionado:' : 'Selected Path:'}
          </span>
          <code style={{ background: 'var(--surface)', padding: '3px 8px', borderRadius: 4, fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent)' }}>
            {selectedPath.join(' → ')}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-preset"
            onClick={handleFindAugmentingPathBFS}
            disabled={isMaxFlowAchieved}
            title={language === 'es' ? 'Buscar camino de aumento en la red residual con BFS' : 'Find augmenting path via BFS'}
          >
            {language === 'es' ? 'Buscar Camino (BFS)' : 'Find Path (BFS)'}
          </button>
          <button
            type="button"
            className="btn-preset active"
            onClick={handlePushFlow}
            disabled={!bottleneck || bottleneck <= 0 || selectedPath[selectedPath.length - 1] !== activePreset.sink}
          >
            {language === 'es'
              ? `Aumentar Flujo (+${bottleneck || 0})`
              : `Push Flow (+${bottleneck || 0})`}
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={() => resetNetwork(activePreset)}
          >
            ↺ {language === 'es' ? 'Reiniciar Flujo' : 'Reset Flow'}
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div
        style={{
          padding: '0.65rem 0.85rem',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem'
        }}
      >
        {message[language]}
      </div>

      {/* Metrics */}
      <div className="mf-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
        <div className="mf-metric-card" style={{ padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <span className="mf-metric-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Flujo Total Actual |f|:' : 'Current Total Flow |f|:'}
          </span>
          <div className="mf-metric-val" style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--accent)' }}>
            {totalFlow}
          </div>
        </div>
        <div className="mf-metric-card" style={{ padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <span className="mf-metric-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Cuello de Botella del Camino (Δ):' : 'Path Bottleneck (Δ):'}
          </span>
          <div className="mf-metric-val" style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--warning)' }}>
            {bottleneck ?? 0}
          </div>
        </div>
        <div className="mf-metric-card" style={{ padding: '0.75rem', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <span className="mf-metric-label" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Estado del Teorema Min-Cut:' : 'Min-Cut Theorem State:'}
          </span>
          <div className="mf-metric-val" style={{ fontSize: '1rem', fontWeight: '700', color: isMaxFlowAchieved ? 'var(--success)' : 'var(--text)' }}>
            {isMaxFlowAchieved
              ? (language === 'es' ? 'Flujo Máximo = Cap(S, T)' : 'Max Flow = Cap(S, T)')
              : (language === 'es' ? 'Caminos residuales activos' : 'Residual paths active')}
          </div>
        </div>
      </div>

      {isMaxFlowAchieved && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--state-solution-bg)',
            borderLeft: '4px solid var(--success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}
        >
          <strong>
            {language === 'es' ? 'Teorema de Flujo Máximo / Corte Mínimo (Ford-Fulkerson):' : 'Max-Flow Min-Cut Theorem:'}
          </strong>{' '}
          {language === 'es'
            ? `No existen más caminos de aumento entre s y t en la red residual. La partición S = {${Array.from(
                reachableNodes
              ).join(', ')}} define el corte mínimo con capacidad idéntica al flujo total (|f*| = ${totalFlow}).`
            : `No more augmenting paths exist. Partition S = {${Array.from(
                reachableNodes
              ).join(', ')}} defines the minimum cut with capacity identical to total flow (|f*| = ${totalFlow}).`}
        </div>
      )}

      {/* Interactive Custom Capacity & Edge Editor for Max Flow */}
      <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>
              {language === 'es' ? 'Editor de Capacidades y Aristas de la Red' : 'Network Capacities & Edge Editor'}
            </h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {language === 'es'
                ? 'Modificá las capacidades de corte o agregá nuevos conductos para simular cuellos de botella personalizados.'
                : 'Modify cut capacities or add new pipelines to simulate custom bottlenecks.'}
            </span>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={() => resetNetwork(activePreset)}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.75rem' }}
          >
            {language === 'es' ? 'Restaurar Red' : 'Reset Network'}
          </button>
        </div>

        {/* Edge Form Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
            <span>{language === 'es' ? 'De (u):' : 'From (u):'}</span>
            <select
              value={editU}
              onChange={(e) => setEditU(e.target.value)}
              style={{ padding: '0.25rem 0.5rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            >
              {activePreset.nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.label || n.id}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
            <span>{language === 'es' ? 'Hacia (v):' : 'To (v):'}</span>
            <select
              value={editV}
              onChange={(e) => setEditV(e.target.value)}
              style={{ padding: '0.25rem 0.5rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            >
              {activePreset.nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.label || n.id}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
            <span>{language === 'es' ? 'Capacidad c(e):' : 'Capacity c(e):'}</span>
            <input
              type="number"
              min={1}
              value={editCapacity}
              onChange={(e) => setEditCapacity(Number(e.target.value))}
              style={{ width: '70px', padding: '0.25rem 0.5rem', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
            />
          </label>

          <button
            type="button"
            className="btn-primary"
            onClick={handleAddOrUpdateEdge}
            style={{ fontSize: '0.8125rem', padding: '0.35rem 0.85rem' }}
          >
            {language === 'es' ? 'Fijar Capacidad' : 'Set Capacity'}
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
            {language === 'es' ? 'Conductos activos:' : 'Active pipes:'}
          </span>
          {edges.map((e, idx) => (
            <span
              key={`mf-edge-badge-${idx}`}
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
              <span>{e.u} → {e.v} (cap={e.capacity})</span>
              <button
                type="button"
                onClick={() => handleDeleteEdge(e.u, e.v)}
                title={language === 'es' ? 'Eliminar conducto' : 'Delete pipe'}
                aria-label={language === 'es' ? `Eliminar conducto ${e.u} a ${e.v}` : `Delete pipe ${e.u} to ${e.v}`}
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
