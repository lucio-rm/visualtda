import React, { useState, useMemo, useCallback } from 'react';
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
    setMessage({
      es: 'Red reiniciada con flujo cero. Selecciona el siguiente nodo conectado en la red residual.',
      en: 'Network reset with zero flow. Select the next connected node in the residual network.'
    });
  }, []);

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
        es: `¡Camino de aumento s-t encontrado! Capacidad de cuello de botella: ${bottleneck}. Presiona "Aumentar Flujo".`,
        en: `Augmenting s-t path found! Bottleneck capacity: ${bottleneck}. Click "Push Flow".`
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
      es: `Flujo aumentado exitosamente en ${delta} unidades. El flujo total actual es ${totalFlow + delta}.`,
      en: `Flow successfully augmented by ${delta} units. Current total flow is ${totalFlow + delta}.`
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

  return (
    <div className="maxflow-playground">
      <div>
        <h3>
          {language === 'es'
            ? 'Laboratorio Interactivo: Redes de Flujo y Caminos de Aumento'
            : 'Interactive Playground: Flow Networks & Augmenting Paths'}
        </h3>
        <p>
          {language === 'es'
            ? 'Experimenta con el método de Ford-Fulkerson. Selecciona nodos conectados para definir un camino de aumento s-t en la red residual, observa el cuello de botella Δ y cancela flujo mediante aristas hacia atrás cuando sea necesario.'
            : 'Experiment with the Ford-Fulkerson method. Select connected nodes to define an augmenting s-t path in the residual network, observe bottleneck capacity Δ, and cancel flow via backward edges when necessary.'}
        </p>
      </div>

      {/* Presets */}
      <div className="presets-section">
        <span className="section-label">
          {language === 'es' ? 'Topologías de Red Curadas:' : 'Curated Network Topologies:'}
        </span>
        <div className="preset-chips">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className={`chip-btn ${selectedPresetIndex === idx ? 'active' : ''}`}
              onClick={() => handleSelectPreset(idx)}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Network SVG */}
      <svg className="mf-network-svg" viewBox="0 0 500 280">
        <defs>
          <marker
            id="mf-arrow"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--border-strong, #94a3b8)" />
          </marker>
          <marker
            id="mf-arrow-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--primary, #2563eb)" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((e, idx) => {
          const uNode = activePreset.nodes.find((n) => n.id === e.u)!;
          const vNode = activePreset.nodes.find((n) => n.id === e.v)!;

          let isInSelectedPath = false;
          for (let i = 0; i < selectedPath.length - 1; i++) {
            if (
              (selectedPath[i] === e.u && selectedPath[i + 1] === e.v) ||
              (selectedPath[i] === e.v && selectedPath[i + 1] === e.u)
            ) {
              isInSelectedPath = true;
              break;
            }
          }

          const midX = (uNode.x + vNode.x) / 2;
          const midY = (uNode.y + vNode.y) / 2;

          return (
            <g key={idx}>
              <line
                x1={uNode.x}
                y1={uNode.y}
                x2={vNode.x}
                y2={vNode.y}
                className={`mf-edge-line ${isInSelectedPath ? 'in-path' : ''}`}
                markerEnd={isInSelectedPath ? 'url(#mf-arrow-active)' : 'url(#mf-arrow)'}
              />
              <rect
                x={midX - 22}
                y={midY - 11}
                width={44}
                height={22}
                className="mf-edge-bg"
              />
              <text x={midX} y={midY} className="mf-edge-text">
                {e.flow}/{e.capacity}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {activePreset.nodes.map((n) => {
          const isSelected = selectedPath.includes(n.id);
          const isReachable = reachableNodes.has(n.id);
          return (
            <g key={n.id} onClick={() => handleNodeClick(n.id)}>
              <circle
                cx={n.x}
                cy={n.y}
                r={18}
                className={`mf-node-circle ${n.isSource ? 'source' : ''} ${
                  n.isSink ? 'sink' : ''
                } ${isSelected ? 'selected-in-path' : ''}`}
              />
              <text x={n.x} y={n.y} className="mf-node-text">
                {n.id}
              </text>
              {isMaxFlowAchieved && (
                <text
                  x={n.x}
                  y={n.y + 26}
                  fontSize={10}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                >
                  {isReachable ? 'S' : 'T'}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Path building info and action buttons */}
      <div className="mf-controls-row">
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
          {language === 'es' ? 'Camino Seleccionado:' : 'Selected Path:'}{' '}
          <code style={{ background: 'var(--bg)', padding: '2px 6px', borderRadius: 4 }}>
            {selectedPath.join(' → ')}
          </code>
        </span>

        <button
          className="mf-btn primary"
          onClick={handlePushFlow}
          disabled={!bottleneck || bottleneck <= 0 || selectedPath[selectedPath.length - 1] !== activePreset.sink}
        >
          {language === 'es'
            ? `Aumentar Flujo (+${bottleneck || 0})`
            : `Push Flow (+${bottleneck || 0})`}
        </button>

        <button className="mf-btn" onClick={() => resetNetwork(activePreset)}>
          {language === 'es' ? 'Reiniciar Flujo' : 'Reset Flow'}
        </button>
      </div>

      {/* Status banner */}
      <div className="mf-status-box">{message[language]}</div>

      {/* Metrics */}
      <div className="mf-metrics-grid">
        <div className="mf-metric-card">
          <span className="mf-metric-label">
            {language === 'es' ? 'Flujo Total Actual |f|:' : 'Current Total Flow |f|:'}
          </span>
          <span className="mf-metric-val">{totalFlow}</span>
        </div>
        <div className="mf-metric-card">
          <span className="mf-metric-label">
            {language === 'es' ? 'Cuello de Botella del Camino (Δ):' : 'Path Bottleneck (Δ):'}
          </span>
          <span className="mf-metric-val">{bottleneck ?? 0}</span>
        </div>
        <div className="mf-metric-card">
          <span className="mf-metric-label">
            {language === 'es' ? 'Estado del Teorema Min-Cut:' : 'Min-Cut Theorem State:'}
          </span>
          <span className="mf-metric-val" style={{ fontSize: '0.95rem' }}>
            {isMaxFlowAchieved
              ? language === 'es'
                ? 'Flujo Máximo = Cap(S, T)'
                : 'Max Flow = Cap(S, T)'
              : language === 'es'
              ? 'Existen caminos residuales'
              : 'Residual paths exist'}
          </span>
        </div>
      </div>

      {isMaxFlowAchieved && (
        <div
          className="mf-status-box"
          style={{
            background: 'var(--surface-hover)',
            borderLeft: '4px solid #10b981',
            lineHeight: 1.5
          }}
        >
          <strong>
            {language === 'es' ? 'Teorema de Flujo Máximo / Corte Mínimo:' : 'Max-Flow Min-Cut Theorem:'}
          </strong>{' '}
          {language === 'es'
            ? `No existen más caminos de aumento entre s y t en la red residual (t no es alcanzable desde s). La partición S = {${Array.from(
                reachableNodes
              ).join(', ')}} define el corte mínimo con capacidad idéntica al flujo total (|f*| = ${totalFlow}).`
            : `No more augmenting paths exist between s and t in the residual network (t is unreachable from s). The partition S = {${Array.from(
                reachableNodes
              ).join(', ')}} defines the minimum cut with capacity identical to total flow (|f*| = ${totalFlow}).`}
        </div>
      )}
    </div>
  );
};
