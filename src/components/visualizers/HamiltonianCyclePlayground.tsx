import React, { useState, useMemo } from 'react';
import { DEFAULT_HAM_GRAPH } from '../../engine/algorithms/hamiltonianCycleTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const HamiltonianCyclePlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markCompleted } = useStudentProgress();

  const { nodes, edges } = DEFAULT_HAM_GRAPH;
  const numV = nodes.length;

  const [path, setPath] = useState<number[]>([0]);

  const adj = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const n of nodes) map.set(n.id, []);
    for (const e of edges) {
      map.get(e.u)?.push(e.v);
      map.get(e.v)?.push(e.u);
    }
    return map;
  }, [nodes, edges]);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const currentU = path[path.length - 1];
  const visitedSet = new Set(path.slice(0, path.length === numV + 1 ? numV : path.length));

  // Determine valid next candidates
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

  const handleSelectNode = (v: number) => {
    if (!validNext.includes(v)) return;
    const nextPath = [...path, v];
    setPath(nextPath);

    if (nextPath.length === numV + 1 && nextPath[nextPath.length - 1] === 0) {
      markCompleted('hamiltonian-cycle-backtracking');
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

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Ciclo Hamiltoniano">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button type="button" className="btn-preset" onClick={handleUndo} disabled={path.length <= 1}>
            ↩ {language === 'es' ? 'Retroceder (Backtrack)' : 'Backtrack (Undo)'}
          </button>
          <button type="button" className="btn-preset" onClick={handleReset}>
            ⏮ {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Visitados:' : 'Visited:'}{' '}
            <strong style={{ color: 'var(--accent)' }}>
              {visitedSet.size} / {numV}
            </strong>
          </span>
          <span>
            {language === 'es' ? 'Vértice actual:' : 'Current vertex:'}{' '}
            <strong>v = {currentU}</strong>
          </span>
        </div>
      </div>

      {/* Status banner */}
      {isCompleteCycle ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            color: '#10b981'
          }}
          role="status"
        >
          ✓ <strong>{language === 'es' ? '¡Ciclo Hamiltoniano Completo!' : 'Hamiltonian Cycle Complete!'}</strong>{' '}
          {language === 'es'
            ? `Visitaste los ${numV} vértices exactamente una vez y retornaste al inicio: [${path.join(' → ')}].`
            : `Visited all ${numV} vertices exactly once and returned to start: [${path.join(' → ')}].`}
        </div>
      ) : isDeadEnd ? (
        <div className="sdk-conflict-banner" role="alert">
          <strong>⚠️ {language === 'es' ? '¡Callejón sin salida (Dead End)!' : 'Dead End!'}:</strong>{' '}
          {language === 'es'
            ? 'Todos los vecinos del vértice actual ya fueron visitados, pero aún faltan vértices por recorrer. Hacé clic en "Retroceder (Backtrack)" para explorar otra rama.'
            : 'All neighbors are already visited, but vertices remain unvisited. Click "Backtrack" to try another branch.'}
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
          💡 {language === 'es' ? 'Hacé clic en los vértices resaltados en verde para avanzar por el camino:' : 'Click highlighted green vertices to advance path:'}{' '}
          <strong>{validNext.map((v) => `v${v}`).join(', ') || (language === 'es' ? 'Ninguno' : 'None')}</strong>
        </div>
      )}

      {/* SVG Interactive Graph */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 500 320"
          style={{ width: '100%', maxWidth: '500px', height: 'auto', display: 'block', backgroundColor: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}
          role="img"
          aria-label="Grafo interactivo para construir ciclo hamiltoniano"
        >
          {/* Edges */}
          {edges.map((e, idx) => {
            const u = nodeMap.get(e.u);
            const v = nodeMap.get(e.v);
            if (!u || !v) return null;

            // Check if part of path
            let inPath = false;
            for (let i = 0; i < path.length - 1; i++) {
              if ((path[i] === e.u && path[i + 1] === e.v) || (path[i] === e.v && path[i + 1] === e.u)) {
                inPath = true;
                break;
              }
            }

            return (
              <line
                key={`pg-edge-${e.u}-${e.v}-${idx}`}
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                stroke={inPath ? (isCompleteCycle ? '#10b981' : 'var(--accent)') : 'var(--border)'}
                strokeWidth={inPath ? 3.5 : 1.5}
                opacity={inPath ? 1 : 0.4}
              />
            );
          })}

          {/* Interactive Nodes */}
          {nodes.map((node) => {
            const isVisited = visitedSet.has(node.id);
            const isCurrent = currentU === node.id;
            const isSelectable = validNext.includes(node.id);
            const pathIdx = path.indexOf(node.id);

            return (
              <g
                key={`pg-node-${node.id}`}
                onClick={() => handleSelectNode(node.id)}
                style={{ cursor: isSelectable ? 'pointer' : 'default' }}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={20}
                  fill={
                    isCurrent
                      ? '#f59e0b'
                      : isSelectable
                      ? 'rgba(16, 185, 129, 0.25)'
                      : isVisited
                      ? 'var(--surface-active, #38bdf8)'
                      : 'var(--surface)'
                  }
                  stroke={isSelectable ? '#10b981' : isCurrent ? '#ffffff' : isVisited ? 'var(--accent)' : 'var(--border)'}
                  strokeWidth={isSelectable || isCurrent ? 3 : 1.5}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill={isCurrent ? '#0f172a' : 'var(--text)'}
                  fontSize="13px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {node.label}
                </text>
                {pathIdx >= 0 && (
                  <text
                    x={node.x + 18}
                    y={node.y - 10}
                    fill="var(--accent)"
                    fontSize="10px"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    #{pathIdx + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path sequence */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span>{language === 'es' ? 'Secuencia:' : 'Sequence:'}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
          [{path.join(' → ')}]
        </span>
      </div>
    </div>
  );
};
