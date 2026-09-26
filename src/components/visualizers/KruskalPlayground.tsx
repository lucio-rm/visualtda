import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { DEFAULT_KRUSKAL_GRAPH } from '../../engine/algorithms/kruskalTrace';

const COMPONENT_COLORS: Record<string, string> = {
  A: '#10b981',
  B: '#6366f1',
  C: '#f59e0b',
  D: '#06b6d4',
  E: '#ec4899',
  F: '#8b5cf6'
};

export const KruskalPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const { nodes, edges } = DEFAULT_KRUSKAL_GRAPH;
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCycleWarning, setIsCycleWarning] = useState<boolean>(false);

  // Edges sorted ascending by weight (Kruskal canonical order)
  const sortedEdges = useMemo(() => {
    return [...edges].sort((a, b) => a.weight - b.weight);
  }, [edges]);

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

  // Component colors based on current roots
  const nodeRoots = useMemo(() => {
    const roots: Record<string, string> = {};
    for (const n of nodes) {
      roots[n.id] = find(n.id);
    }
    return roots;
  }, [nodes, selectedEdgeIds]);

  const handleToggleEdge = (edgeId: string) => {
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;

    if (selectedEdgeIds.includes(edgeId)) {
      const updated = selectedEdgeIds.filter((id) => id !== edgeId);
      setSelectedEdgeIds(updated);
      setFeedback(null);
      setIsCycleWarning(false);
      return;
    }

    const rootU = find(edge.u);
    const rootV = find(edge.v);

    if (rootU === rootV) {
      setIsCycleWarning(true);
      setFeedback(
        language === 'es'
          ? `Ciclo detectado: los vértices ${edge.u} y ${edge.v} ya están en la misma componente conexa (raíz ${rootU}). Por la Propiedad del Ciclo (Kleinberg & Tardos), esta arista es redundante y se debe descartar.`
          : `Cycle detected: vertices ${edge.u} and ${edge.v} already connected in same component (root ${rootU}). By the Cycle Property, this edge is redundant.`
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
            ? `¡Árbol Generador Mínimo factible y óptimo verificado! Costo total: ${totalWeight} (igual al costo canónico de Kruskal).`
            : `Feasible and optimal Minimum Spanning Tree verified! Total cost: ${totalWeight}.`
        );
        markAttempted('kruskal-mst-greedy');
      } else {
        setFeedback(
          language === 'es'
            ? `Todos los vértices están conectados, pero el costo total (${totalWeight}) excede el óptimo (10). Se deben priorizar aristas de menor peso según la Propiedad del Corte.`
            : `Connected all vertices, but weight (${totalWeight}) exceeds optimal (10). Prioritize lighter edges.`
        );
      }
    } else {
      setFeedback(
        language === 'es'
          ? `Arista ${edge.u}—${edge.v} (peso ${edge.weight}) agregada. Se unieron las componentes de ${edge.u} y ${edge.v}. Aristas en el árbol: ${updated.length} / ${nodes.length - 1}.`
          : `Edge ${edge.u}—${edge.v} added. Merged components of ${edge.u} and ${edge.v}. Tree edges: ${updated.length} / ${nodes.length - 1}.`
      );
    }
  };

  // Next Kruskal Step Assistant
  const handleNextKruskalStep = () => {
    for (const e of sortedEdges) {
      if (selectedEdgeIds.includes(e.id)) continue;
      const rootU = find(e.u);
      const rootV = find(e.v);
      if (rootU !== rootV) {
        handleToggleEdge(e.id);
        return;
      }
    }
  };

  const handleReset = () => {
    setSelectedEdgeIds([]);
    setFeedback(null);
    setIsCycleWarning(false);
  };

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const currentTotalWeight = selectedEdgeIds.reduce((acc, id) => {
    const e = edges.find((item) => item.id === id);
    return acc + (e ? e.weight : 0);
  }, 0);

  return (
    <div
      className="algorithm-playground kruskal-playground"
      role="region"
      aria-label="Laboratorio de Kruskal y AGM"
    >
      {/* Controls Bar */}
      <div className="sdk-pg-controls">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Aristas en el árbol:' : 'Tree edges:'}{' '}
            <strong style={{ color: selectedEdgeIds.length === nodes.length - 1 ? '#10b981' : 'var(--text)' }}>
              {selectedEdgeIds.length} / {nodes.length - 1}
            </strong>
          </span>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Costo acumulado:' : 'Current weight:'}{' '}
            <strong style={{ color: currentTotalWeight === 10 ? '#10b981' : '#38bdf8' }}>
              {currentTotalWeight}
            </strong>{' '}
            <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(Óptimo = 10)</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={handleNextKruskalStep}
            disabled={selectedEdgeIds.length === nodes.length - 1}
            style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
          >
            {language === 'es' ? 'Paso Voraz (Siguiente Arista Liviana) →' : 'Greedy Step (Next Light Edge) →'}
          </button>
          <button type="button" className="btn-tool" onClick={handleReset}>
            {language === 'es' ? 'Limpiar Selección ↺' : 'Reset Selection ↺'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={
            isCycleWarning
              ? 'sdk-conflict-banner'
              : selectedEdgeIds.length === nodes.length - 1
              ? 'sdk-success-banner'
              : 'sdk-description-box'
          }
          role={isCycleWarning ? 'alert' : 'status'}
          style={isCycleWarning ? { background: 'rgba(239, 68, 68, 0.12)', border: '1px solid #ef4444' } : undefined}
        >
          {feedback}
        </div>
      )}

      {/* Main Dual Area: SVG Graph + Sorted Edge Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 240px', gap: '1rem', alignItems: 'start' }}>
        {/* Interactive SVG Graph */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{language === 'es' ? 'Grafo (Hacé clic en aristas para sumar/quitar):' : 'Graph (Click edges to add/remove):'}</span>
            <span>{language === 'es' ? 'Colores = Componentes Conexas (Union-Find)' : 'Colors = Connected Components'}</span>
          </div>

          <svg
            viewBox="0 0 460 280"
            style={{ width: '100%', height: 'auto', display: 'block' }}
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
                    fill={isSelected ? '#10b981' : 'var(--surface)'}
                    stroke={isSelected ? '#059669' : 'var(--border)'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'var(--text)'}
                    fontFamily="var(--font-mono)"
                    fontSize="11px"
                    fontWeight="700"
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes with Component Colors */}
            {nodes.map((node) => {
              const rootId = nodeRoots[node.id] || node.id;
              const color = COMPONENT_COLORS[rootId] || '#38bdf8';

              return (
                <g key={`kru-pg-node-${node.id}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={20}
                    fill="var(--surface)"
                    stroke={color}
                    strokeWidth={3}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="var(--text)"
                    fontFamily="var(--font-mono)"
                    fontSize="14px"
                    fontWeight="700"
                  >
                    {node.id}
                  </text>

                  {/* Component Root Badge */}
                  <rect
                    x={node.x - 14}
                    y={node.y - 32}
                    width={28}
                    height={14}
                    rx={3}
                    fill={color}
                    opacity={0.9}
                  />
                  <text
                    x={node.x}
                    y={node.y - 22}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontFamily="var(--font-mono)"
                    fontSize="9px"
                    fontWeight="800"
                  >
                    {rootId}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Sorted Edges Priority Queue Panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.65rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            {language === 'es' ? 'Cola de Aristas (Orden Ascendente):' : 'Sorted Edges Queue:'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '250px', overflowY: 'auto' }}>
            {sortedEdges.map((e) => {
              const isSelected = selectedEdgeIds.includes(e.id);
              const rootU = find(e.u);
              const rootV = find(e.v);
              const wouldFormCycle = !isSelected && rootU === rootV;

              return (
                <div
                  key={`queue-e-${e.id}`}
                  onClick={() => handleToggleEdge(e.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.3rem 0.5rem',
                    background: isSelected
                      ? 'rgba(16, 185, 129, 0.15)'
                      : wouldFormCycle
                      ? 'rgba(239, 68, 68, 0.08)'
                      : 'var(--bg)',
                    border: `1px solid ${isSelected ? '#10b981' : wouldFormCycle ? 'rgba(239, 68, 68, 0.4)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {e.u} — {e.v} (w={e.weight})
                  </span>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: isSelected ? '#10b981' : wouldFormCycle ? '#ef4444' : 'var(--text-muted)'
                    }}
                  >
                    {isSelected
                      ? (language === 'es' ? '✓ En AGM' : '✓ In MST')
                      : wouldFormCycle
                      ? (language === 'es' ? '✕ Ciclo' : '✕ Cycle')
                      : (language === 'es' ? 'Pendiente' : 'Pending')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
