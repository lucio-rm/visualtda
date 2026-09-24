import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { DijkstraNode, DijkstraEdge } from '../../engine/algorithms/dijkstraTrace';

const GRAPH_STANDARD: { nodes: DijkstraNode[]; edges: DijkstraEdge[] } = {
  nodes: [
    { id: 'S', label: 'S', x: 70, y: 140 },
    { id: 'A', label: 'A', x: 200, y: 60 },
    { id: 'B', label: 'B', x: 200, y: 220 },
    { id: 'T', label: 'T', x: 350, y: 140 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 4 },
    { u: 'S', v: 'B', weight: 2 },
    { u: 'B', v: 'A', weight: 1 },
    { u: 'A', v: 'T', weight: 3 },
    { u: 'B', v: 'T', weight: 6 }
  ]
};

const GRAPH_NEGATIVE_COUNTEREXAMPLE: { nodes: DijkstraNode[]; edges: DijkstraEdge[] } = {
  nodes: [
    { id: 'S', label: 'S', x: 80, y: 140 },
    { id: 'A', label: 'A', x: 230, y: 70 },
    { id: 'B', label: 'B', x: 230, y: 210 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 2 },
    { u: 'S', v: 'B', weight: 3 },
    { u: 'B', v: 'A', weight: -2 }
  ]
};

export const DijkstraPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [preset, setPreset] = useState<'standard' | 'negative'>('standard');
  const [source, setSource] = useState<string>('S');

  const activeGraph = preset === 'standard' ? GRAPH_STANDARD : GRAPH_NEGATIVE_COUNTEREXAMPLE;
  const { nodes, edges } = activeGraph;

  // Run Dijkstra client-side to compute distances
  const dists: Record<string, number> = {};
  for (const n of nodes) dists[n.id] = Infinity;
  dists[source] = 0;
  const visited = new Set<string>();

  for (let i = 0; i < nodes.length; i++) {
    let u: string | null = null;
    let minD = Infinity;
    for (const n of nodes) {
      if (!visited.has(n.id) && dists[n.id] < minD) {
        minD = dists[n.id];
        u = n.id;
      }
    }
    if (!u) break;
    visited.add(u);
    for (const e of edges.filter((ed) => ed.u === u)) {
      if (dists[u] + e.weight < dists[e.v]) {
        dists[e.v] = dists[u] + e.weight;
      }
    }
  }

  const hasNegativeEdge = edges.some((e) => e.weight < 0);

  const handleSelectPreset = (p: 'standard' | 'negative') => {
    setPreset(p);
    setSource('S');
    if (p === 'negative') {
      markAttempted('dijkstra-greedy');
    }
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="dijkstra-playground" role="region" aria-label="Laboratorio de Dijkstra">
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span>{language === 'es' ? 'Nodo Origen:' : 'Source Node:'}</span>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem'
            }}
          >
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasNegativeEdge && (
        <div className="sdk-conflict-banner" role="alert">
          <strong>{language === 'es' ? 'Falla de Invariante Greedy' : 'Greedy Invariant Failure'}:</strong>{' '}
          {language === 'es'
            ? 'Dijkstra asume que las distancias mínimas en S jamás pueden disminuir agregando aristas posteriores (Greedy Stays Ahead). Al existir aristas de peso negativo, el camino S → B → A tiene costo 3 + (-2) = 1, pero Dijkstra ya fijó irrevocablemente d[A] = 2. Para grafos con pesos negativos, debe usarse Programación Dinámica (Bellman-Ford).'
            : "Dijkstra assumes distances in S never decrease later. With negative weights, S → B → A has cost 1, but Dijkstra permanently fixed d[A]=2. Use Bellman-Ford DP instead."}
        </div>
      )}

      {/* SVG Canvas */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 460 260"
          style={{ maxWidth: '460px', width: '100%', height: 'auto', borderRadius: '4px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
          role="img"
          aria-label="Grafo interactivo de Dijkstra"
        >
          <defs>
            <marker id="pg-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border-strong, #94a3b8)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((edge, idx) => {
            const u = nodeMap.get(edge.u);
            const v = nodeMap.get(edge.v);
            if (!u || !v) return null;

            const isNeg = edge.weight < 0;
            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g key={`pg-edge-${edge.u}-${edge.v}-${idx}`}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={isNeg ? 'var(--danger, #ef4444)' : 'var(--border-strong, #94a3b8)'}
                  strokeWidth={isNeg ? 2.5 : 1.5}
                  markerEnd="url(#pg-arrow)"
                />
                <circle cx={midX} cy={midY} r={11} fill="var(--surface, #0f172a)" stroke={isNeg ? 'var(--danger, #ef4444)' : 'var(--border, #475569)'} />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isNeg ? 'var(--danger, #ef4444)' : 'var(--text, #f8fafc)'}
                  fontFamily="var(--font-mono)"
                  fontSize="11px"
                  fontWeight="700"
                >
                  {edge.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSource = node.id === source;
            const dist = dists[node.id];
            const distStr = dist === Infinity ? '∞' : String(dist);

            return (
              <g
                key={`pg-node-${node.id}`}
                onClick={() => setSource(node.id)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`Nodo ${node.id}, Distancia ${distStr}`}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill={isSource ? 'rgba(56, 189, 248, 0.35)' : 'var(--surface, #0f172a)'}
                  stroke={isSource ? '#38bdf8' : 'var(--border, #64748b)'}
                  strokeWidth={isSource ? 3 : 2}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill="var(--text, #f8fafc)"
                  fontFamily="var(--font-mono)"
                  fontSize="14px"
                  fontWeight="700"
                >
                  {node.id}
                </text>
                {/* Distance Badge */}
                <rect
                  x={node.x - 18}
                  y={node.y - 38}
                  width={36}
                  height={16}
                  rx={4}
                  fill={isSource ? '#38bdf8' : 'var(--surface-hover, #1e293b)'}
                  stroke="var(--border, #475569)"
                />
                <text
                  x={node.x}
                  y={node.y - 26}
                  textAnchor="middle"
                  fill={isSource ? '#0f172a' : 'var(--accent, #38bdf8)'}
                  fontFamily="var(--font-mono)"
                  fontSize="11px"
                  fontWeight="800"
                >
                  d:{distStr}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Interactividad' : 'Interactivity'}:</strong>{' '}
        {language === 'es'
          ? 'Hacé clic sobre cualquier nodo para fijarlo como origen y observar el cálculo instantáneo de distancias mínimas en tiempo real.'
          : 'Click any node to set it as source and inspect real-time minimal distance calculation.'}
      </div>
    </div>
  );
};
