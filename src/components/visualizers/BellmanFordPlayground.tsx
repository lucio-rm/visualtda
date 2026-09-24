import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { BellmanFordNode, BellmanFordEdge } from '../../engine/algorithms/bellmanFordTrace';

const GRAPH_STABLE: { nodes: BellmanFordNode[]; edges: BellmanFordEdge[] } = {
  nodes: [
    { id: 'S', x: 70, y: 130 },
    { id: 'A', x: 200, y: 50 },
    { id: 'B', x: 200, y: 210 },
    { id: 'T', x: 340, y: 130 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 4 },
    { u: 'S', v: 'B', weight: 3 },
    { u: 'B', v: 'A', weight: -2 },
    { u: 'A', v: 'T', weight: 2 },
    { u: 'B', v: 'T', weight: 5 }
  ]
};

const GRAPH_CYCLE: { nodes: BellmanFordNode[]; edges: BellmanFordEdge[] } = {
  nodes: [
    { id: 'S', x: 60, y: 130 },
    { id: 'A', x: 190, y: 60 },
    { id: 'B', x: 310, y: 60 },
    { id: 'C', x: 250, y: 210 }
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

  const activeGraph = mode === 'stable' ? GRAPH_STABLE : GRAPH_CYCLE;
  const { nodes, edges } = activeGraph;
  const maxIters = nodes.length - 1;

  // Compute table up to iteration
  const table: Array<Record<string, number>> = [];
  const row0: Record<string, number> = {};
  for (const n of nodes) row0[n.id] = Infinity;
  row0['S'] = 0;
  table.push(row0);

  for (let i = 1; i <= Math.min(iteration, maxIters + 1); i++) {
    const prev = table[i - 1];
    const curr: Record<string, number> = { ...prev };
    for (const e of edges) {
      if (prev[e.u] !== Infinity && prev[e.u] + e.weight < curr[e.v]) {
        curr[e.v] = prev[e.u] + e.weight;
      }
    }
    table.push(curr);
  }

  const currentDists = table[table.length - 1] || row0;
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

  const handleReset = (newMode: 'stable' | 'cycle') => {
    setMode(newMode);
    setIteration(0);
    if (newMode === 'cycle') {
      markAttempted('bellman-ford-dp');
    }
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Bellman-Ford y Ciclos Negativos">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${mode === 'stable' ? 'active' : ''}`}
            onClick={() => handleReset('stable')}
          >
            {language === 'es' ? 'Pesos Negativos Válidos (Sin Ciclo)' : 'Valid Negative Weights (No Cycle)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${mode === 'cycle' ? 'active' : ''}`}
            onClick={() => handleReset('cycle')}
          >
            {language === 'es' ? 'Grafo con Ciclo Negativo ⚠️' : 'Negative Cycle Graph ⚠️'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={handleStep}
            disabled={iteration >= nodes.length}
          >
            {language === 'es' ? `Avanzar Iteración (${iteration} / ${maxIters}) →` : `Advance Iteration (${iteration} / ${maxIters}) →`}
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

      {hasNegativeCycleDetected && (
        <div className="sdk-conflict-banner" role="alert">
          <strong>{language === 'es' ? 'Ciclo Negativo Identificado' : 'Negative Cycle Identified'}:</strong>{' '}
          {language === 'es'
            ? 'En la iteración |V| = 4, las distancias continúan decreciendo (M[4, A] < M[3, A]). Esto demuestra formalmente que existe un ciclo cerrado con suma de pesos negativa (A → B → C → A con costo 2 - 3 - 1 = -2), por lo que las distancias mínimas convergen a -∞ y no están acotadas.'
            : 'At iteration |V|, distances continue to decrease. This proves a negative cycle exists; distances diverge to -∞.'}
        </div>
      )}

      {/* SVG Canvas */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 460 250"
          style={{ maxWidth: '460px', width: '100%', height: 'auto', borderRadius: '4px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
          role="img"
          aria-label="Grafo interactivo de Bellman-Ford"
        >
          <defs>
            <marker id="bf-pg-arr" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted, #94a3b8)" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e, idx) => {
            const u = nodeMap.get(e.u);
            const v = nodeMap.get(e.v);
            if (!u || !v) return null;

            const isNeg = e.weight < 0;
            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g key={`bf-pg-e-${idx}`}>
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={isNeg ? 'var(--danger, #ef4444)' : 'var(--border, #475569)'}
                  strokeWidth={isNeg ? 2.5 : 1.5}
                  markerEnd="url(#bf-pg-arr)"
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
                  {e.weight}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n) => {
            const dist = currentDists[n.id];
            const distStr = dist === Infinity ? '∞' : String(dist);

            return (
              <g key={`bf-pg-n-${n.id}`}>
                <circle cx={n.x} cy={n.y} r={22} fill="var(--surface, #0f172a)" stroke="var(--accent, #6366f1)" strokeWidth={2.5} />
                <text x={n.x} y={n.y + 5} textAnchor="middle" fill="var(--text, #f8fafc)" fontFamily="var(--font-mono)" fontSize="14px" fontWeight="700">
                  {n.id}
                </text>
                <rect x={n.x - 18} y={n.y - 38} width={36} height={16} rx={4} fill="var(--surface-hover, #1e293b)" stroke="var(--border, #475569)" />
                <text x={n.x} y={n.y - 26} textAnchor="middle" fill="var(--accent, #38bdf8)" fontFamily="var(--font-mono)" fontSize="11px" fontWeight="800">
                  d:{distStr}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento Teórico (Kleinberg & Tardos Cap. 6.8)' : 'Theory Foundation'}:</strong>{' '}
        {language === 'es'
          ? 'En un grafo sin ciclos negativos, el camino más simple entre dos nodos contiene a lo sumo |V| - 1 aristas. Por tanto, si al ejecutar la iteración |V| alguna distancia aún se reduce, obligatoriamente existe un ciclo negativo absorbente.'
          : 'In graphs without negative cycles, shortest paths have at most |V|-1 edges. Any decrease at iteration |V| proves a negative cycle.'}
      </div>
    </div>
  );
};
