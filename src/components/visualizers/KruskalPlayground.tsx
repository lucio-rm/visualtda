import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { DEFAULT_KRUSKAL_GRAPH } from '../../engine/algorithms/kruskalTrace';

export const KruskalPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const { nodes, edges } = DEFAULT_KRUSKAL_GRAPH;
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCycleWarning, setIsCycleWarning] = useState<boolean>(false);

  // Union-Find on current selected edges
  const parent: Record<string, string> = {};
  for (const n of nodes) parent[n.id] = n.id;

  function find(i: string): string {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(i: string, j: string) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) parent[rootI] = rootJ;
  }

  for (const edgeId of selectedEdgeIds) {
    const edge = edges.find((e) => e.id === edgeId);
    if (edge) union(edge.u, edge.v);
  }

  const handleToggleEdge = (edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;

    if (selectedEdgeIds.includes(edgeId)) {
      // Remove edge
      const updated = selectedEdgeIds.filter((id) => id !== edgeId);
      setSelectedEdgeIds(updated);
      setFeedback(null);
      setIsCycleWarning(false);
      return;
    }

    // Check if adding this edge creates a cycle
    const rootU = find(edge.u);
    const rootV = find(edge.v);

    if (rootU === rootV) {
      setIsCycleWarning(true);
      setFeedback(
        language === 'es'
          ? `¡Ciclo detectado! Los vértices ${edge.u} y ${edge.v} ya están conectados indirectamente. Por la Propiedad de Ciclo de Kleinberg & Tardos, agregarla genera redundancia cíclica.`
          : `Cycle detected! Vertices ${edge.u} and ${edge.v} already connected. Adding it forms a cycle.`
      );
      return;
    }

    const updated = [...selectedEdgeIds, edgeId];
    setSelectedEdgeIds(updated);
    setIsCycleWarning(false);

    const totalWeight = updated.reduce((acc, id) => {
      const e = edges.find((item) => item.id === id);
      return acc + (e ? e.weight : 0);
    }, 0);

    if (updated.length === nodes.length - 1) {
      if (totalWeight === 10) {
        setFeedback(
          language === 'es'
            ? `🎉 ¡Felicitaciones! Has construido el Árbol Generador Mínimo óptimo con costo total ${totalWeight}.`
            : `🎉 Congratulations! You constructed the optimal MST with total cost ${totalWeight}.`
        );
        markAttempted('kruskal-mst-greedy');
      } else {
        setFeedback(
          language === 'es'
            ? `Has conectado todos los vértices pero el costo (${totalWeight}) no es el mínimo posible. ¡Intenta priorizar aristas más livianas!`
            : `Connected all vertices, but weight (${totalWeight}) is not minimal. Try lighter edges!`
        );
      }
    } else {
      setFeedback(
        language === 'es'
          ? `Arista ${edge.u}—${edge.v} (peso ${edge.weight}) agregada. Aristas seleccionadas: ${updated.length} / ${nodes.length - 1}.`
          : `Edge ${edge.u}—${edge.v} added. Selected: ${updated.length} / ${nodes.length - 1}.`
      );
    }
  };

  const handleReset = () => {
    setSelectedEdgeIds([]);
    setFeedback(null);
    setIsCycleWarning(false);
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const currentTotalWeight = selectedEdgeIds.reduce((acc, id) => {
    const e = edges.find((item) => item.id === id);
    return acc + (e ? e.weight : 0);
  }, 0);

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Kruskal y AGM">
      <div className="sdk-pg-controls">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Aristas en el árbol:' : 'Tree edges:'}{' '}
            <strong>{selectedEdgeIds.length} / {nodes.length - 1}</strong>
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Costo actual:' : 'Current weight:'}{' '}
            <strong>{currentTotalWeight}</strong>
          </span>
        </div>

        <button type="button" className="btn-tool" onClick={handleReset}>
          {language === 'es' ? 'Limpiar Selección ↺' : 'Reset Selection ↺'}
        </button>
      </div>

      {feedback && (
        <div
          className={isCycleWarning ? 'sdk-conflict-banner' : selectedEdgeIds.length === nodes.length - 1 ? 'sdk-success-banner' : 'sdk-description-box'}
          role={isCycleWarning ? 'alert' : 'status'}
        >
          {feedback}
        </div>
      )}

      {/* Interactive SVG Graph */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 480 300"
          style={{ maxWidth: '480px', width: '100%', height: 'auto', borderRadius: '4px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
          role="img"
          aria-label="Grafo interactivo para seleccionar aristas del AGM"
        >
          {/* Edges */}
          {edges.map((edge) => {
            const u = nodeMap.get(edge.u);
            const v = nodeMap.get(edge.v);
            if (!u || !v) return null;

            const isSelected = selectedEdgeIds.includes(edge.id);
            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g
                key={`kru-pg-edge-${edge.id}`}
                onClick={() => handleToggleEdge(edge.id)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`Arista ${edge.u}-${edge.v}, peso ${edge.weight}`}
              >
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={isSelected ? '#10b981' : 'var(--border, #475569)'}
                  strokeWidth={isSelected ? 4 : 2}
                />
                <circle
                  cx={midX}
                  cy={midY}
                  r={12}
                  fill={isSelected ? '#10b981' : 'var(--surface, #0f172a)'}
                  stroke={isSelected ? '#059669' : 'var(--border, #64748b)'}
                  strokeWidth={1.5}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : 'var(--text, #f8fafc)'}
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
          {nodes.map((node) => (
            <g key={`kru-pg-node-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={20}
                fill="var(--surface, #0f172a)"
                stroke="var(--accent, #6366f1)"
                strokeWidth={2.5}
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
            </g>
          ))}
        </svg>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        💡 <strong>{language === 'es' ? 'Cómo Interactuar' : 'How to Interact'}:</strong>{' '}
        {language === 'es'
          ? 'Hacé clic sobre las aristas del grafo para incorporarlas o removerlas del árbol. El sistema evaluará automáticamente si la arista genera un ciclo o si expande el árbol hacia un corte válido.'
          : 'Click edges on the graph to add or remove them from the tree. The system evaluates cycle and cut properties.'}
      </div>
    </div>
  );
};
