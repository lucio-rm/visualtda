import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { DEFAULT_KRUSKAL_GRAPH, KruskalNode, KruskalEdge } from '../../engine/algorithms/kruskalTrace';

const COMPONENT_COLORS: Record<string, string> = {
  A: 'var(--success)',
  B: 'var(--accent)',
  C: 'var(--warning)',
  D: '#06b6d4',
  E: '#ec4899',
  F: '#8b5cf6'
};

export const KruskalPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [nodes, setNodes] = useState<KruskalNode[]>(DEFAULT_KRUSKAL_GRAPH.nodes);
  const [edges, setEdges] = useState<KruskalEdge[]>(DEFAULT_KRUSKAL_GRAPH.edges);
  const [selectedEdgeIds, setSelectedEdgeIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCycleWarning, setIsCycleWarning] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'incomplete' | 'suboptimal'>('idle');
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [edgeU, setEdgeU] = useState<string>('A');
  const [edgeV, setEdgeV] = useState<string>('B');
  const [edgeWeight, setEdgeWeight] = useState<number>(3);
  const [editorError, setEditorError] = useState<string | null>(null);

  // Dynamic true MST weight computation on current graph
  const optimalMSTWeight = useMemo(() => {
    const sorted = [...edges].sort((a, b) => a.weight - b.weight);
    const p: Record<string, string> = {};
    for (const n of nodes) p[n.id] = n.id;
    function f(i: string): string {
      if (p[i] === i) return i;
      p[i] = f(p[i]);
      return p[i];
    }
    let cost = 0;
    let count = 0;
    for (const e of sorted) {
      const rU = f(e.u);
      const rV = f(e.v);
      if (rU !== rV) {
        p[rU] = rV;
        cost += e.weight;
        count++;
        if (count === nodes.length - 1) break;
      }
    }
    return cost;
  }, [nodes, edges]);

  const handleAddOrUpdateEdge = () => {
    if (edgeU === edgeV) {
      setEditorError(language === 'es' ? 'No se permiten bucles reflexivos (u = v).' : 'Self-loops are not allowed (u = v).');
      return;
    }
    setEditorError(null);
    setEdges((prev) => {
      const existingIdx = prev.findIndex(
        (e) => (e.u === edgeU && e.v === edgeV) || (e.u === edgeV && e.v === edgeU)
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = { ...copy[existingIdx], weight: edgeWeight };
        return copy;
      }
      const newEdge: KruskalEdge = {
        id: `e-${edgeU}-${edgeV}-${Date.now()}`,
        u: edgeU,
        v: edgeV,
        weight: edgeWeight
      };
      return [...prev, newEdge];
    });
    setSelectedEdgeIds([]);
    setFeedback(null);
    markAttempted('kruskal');
  };

  const handleDeleteEdge = (edgeId: string) => {
    setEdges((prev) => prev.filter((e) => e.id !== edgeId));
    setSelectedEdgeIds((prev) => prev.filter((id) => id !== edgeId));
    setFeedback(null);
  };

  const handleAddNode = () => {
    const existingIds = new Set(nodes.map((n) => n.id));
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let nextId = '';
    for (const char of alphabet) {
      if (!existingIds.has(char)) {
        nextId = char;
        break;
      }
    }
    if (!nextId) nextId = `N${nodes.length + 1}`;
    const newNode: KruskalNode = {
      id: nextId,
      label: nextId,
      x: 100 + (nodes.length % 5) * 75,
      y: 80 + Math.floor(nodes.length / 5) * 70
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedEdgeIds([]);
    setFeedback(null);
  };

  const handleResetGraph = () => {
    setNodes(DEFAULT_KRUSKAL_GRAPH.nodes);
    setEdges(DEFAULT_KRUSKAL_GRAPH.edges);
    setSelectedEdgeIds([]);
    setFeedback(null);
    setEditorError(null);
  };

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
    setVerificationStatus('idle');

    if (selectedEdgeIds.includes(edgeId)) {
      const updated = selectedEdgeIds.filter((id) => id !== edgeId);
      setSelectedEdgeIds(updated);
      setFeedback(
        language === 'es'
          ? `Arista ${edge.u}—${edge.v} removida. Aristas seleccionadas: ${updated.length} / ${nodes.length - 1}.`
          : `Edge ${edge.u}—${edge.v} removed. Selected edges: ${updated.length} / ${nodes.length - 1}.`
      );
      setIsCycleWarning(false);
      return;
    }

    const rootU = find(edge.u);
    const rootV = find(edge.v);

    if (rootU === rootV) {
      setIsCycleWarning(true);
      setFeedback(
        language === 'es'
          ? `Ciclo detectado: los vértices ${edge.u} y ${edge.v} ya están en la misma componente conexa (raíz ${rootU}). Por la Propiedad del Ciclo (Cycle Property), esta arista es redundante y se debe descartar.`
          : `Cycle detected: vertices ${edge.u} and ${edge.v} already connected in same component (root ${rootU}). By the Cycle Property, this edge is redundant.`
      );
      return;
    }

    const updated = [...selectedEdgeIds, edgeId];
    setSelectedEdgeIds(updated);
    setIsCycleWarning(false);

    setFeedback(
      language === 'es'
        ? `Arista ${edge.u}—${edge.v} (peso ${edge.weight}) agregada. Se unieron las componentes de ${edge.u} y ${edge.v}. Aristas en el árbol: ${updated.length} / ${nodes.length - 1}. Presioná "Verificar AGM" para validar.`
        : `Edge ${edge.u}—${edge.v} added. Merged components of ${edge.u} and ${edge.v}. Tree edges: ${updated.length} / ${nodes.length - 1}. Click "Check MST" to evaluate.`
    );
  };

  const handleVerify = () => {
    setIsCycleWarning(false);
    if (selectedEdgeIds.length !== nodes.length - 1) {
      setVerificationStatus('incomplete');
      setFeedback(
        language === 'es'
          ? `Árbol incompleto: un Árbol Generador Mínimo para |V| = ${nodes.length} vértices requiere exactamente |V| - 1 = ${nodes.length - 1} aristas. Actualmente tenés ${selectedEdgeIds.length}. Continuá seleccionando aristas.`
          : `Incomplete tree: an MST with |V| = ${nodes.length} vertices requires exactly ${nodes.length - 1} edges. Currently selected: ${selectedEdgeIds.length}. Keep exploring.`
      );
      return;
    }

    const totalWeight = selectedEdgeIds.reduce((acc, id) => {
      const e = edges.find((item) => item.id === id);
      return acc + (e ? e.weight : 0);
    }, 0);

    if (totalWeight <= optimalMSTWeight) {
      setVerificationStatus('success');
      setFeedback(
        language === 'es'
          ? `¡Excelente! Árbol Generador Mínimo factible y óptimo verificado. Costo total: ${totalWeight} (óptimo según Kruskal: ${optimalMSTWeight}).`
          : `Excellent! Feasible and optimal Minimum Spanning Tree verified. Total cost: ${totalWeight} (optimal per Kruskal: ${optimalMSTWeight}).`
      );
      markAttempted('kruskal-mst-greedy');
    } else {
      setVerificationStatus('suboptimal');
      setFeedback(
        language === 'es'
          ? `El conjunto de aristas conecta el grafo, pero el costo total (${totalWeight}) excede el óptimo mínimo (${optimalMSTWeight}). En un Árbol Generador MÍNIMO, un menor costo es estrictamente mejor. Priorizá aristas de menor peso.`
          : `Connected all vertices, but total weight (${totalWeight}) exceeds the minimum optimal (${optimalMSTWeight}). For a MINIMUM Spanning Tree, lower weight is strictly better. Prioritize lighter edges.`
      );
    }
  };

  const handleReset = () => {
    setSelectedEdgeIds([]);
    setFeedback(null);
    setIsCycleWarning(false);
    setVerificationStatus('idle');
  };

  const handleResetLayout = () => {
    setNodes(DEFAULT_KRUSKAL_GRAPH.nodes);
  };

  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setDraggingNodeId(id);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingNodeId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 460 / rect.width;
    const scaleY = 280 / rect.height;
    const rawX = (e.clientX - rect.left) * scaleX;
    const rawY = (e.clientY - rect.top) * scaleY;
    const clampedX = Math.max(25, Math.min(435, Math.round(rawX)));
    const clampedY = Math.max(25, Math.min(255, Math.round(rawY)));

    setNodes((prev) =>
      prev.map((n) => (n.id === draggingNodeId ? { ...n, x: clampedX, y: clampedY } : n))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNodeId) {
      try {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setDraggingNodeId(null);
    }
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
      aria-label={language === 'es' ? 'Laboratorio de Kruskal y AGM' : 'Kruskal and MST Playground'}
    >
      {/* Controls Bar */}
      <div className="sdk-pg-controls">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Aristas en el árbol:' : 'Tree edges:'}{' '}
            <strong style={{ color: selectedEdgeIds.length === nodes.length - 1 ? 'var(--success)' : 'var(--text)' }}>
              {selectedEdgeIds.length} / {nodes.length - 1}
            </strong>
          </span>

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Costo acumulado:' : 'Current weight:'}{' '}
            <strong style={{ color: currentTotalWeight === optimalMSTWeight ? 'var(--success)' : 'var(--accent)' }}>
              {currentTotalWeight}
            </strong>{' '}
            <span style={{ fontSize: '0.8125rem', opacity: 0.8 }}>({language === 'es' ? 'Óptimo' : 'Optimal'} = {optimalMSTWeight})</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-preset"
            onClick={handleVerify}
            style={{ fontWeight: 700 }}
          >
            {language === 'es' ? 'Verificar AGM' : 'Check MST'}
          </button>
          <button type="button" className="btn-tool" onClick={handleReset}>
            {language === 'es' ? 'Limpiar Selección ↺' : 'Reset Selection ↺'}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleResetLayout}
            title={language === 'es' ? 'Reiniciar posiciones' : 'Reset positions'}
          >
            ⤢
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={
            isCycleWarning
              ? 'sdk-conflict-banner'
              : verificationStatus === 'success'
              ? 'sdk-success-banner'
              : 'sdk-description-box'
          }
          role={isCycleWarning ? 'alert' : 'status'}
          style={isCycleWarning ? { background: 'var(--state-conflict-bg)', border: '1px solid var(--error)' } : undefined}
        >
          {feedback}
        </div>
      )}

      {/* Main Dual Area: SVG Graph + Sorted Edge Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 240px', gap: '1rem', alignItems: 'start' }}>
        {/* Interactive SVG Graph */}
        <div style={{ background: 'var(--canvas-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'flex', justifyContent: 'space-between' }}>
            <span>{language === 'es' ? 'Grafo (Hacé clic en aristas para sumar/quitar):' : 'Graph (Click edges to add/remove):'}</span>
            <span>{language === 'es' ? 'Colores = Componentes Conexas (Union-Find)' : 'Colors = Connected Components'}</span>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 460 280"
            style={{
              width: '100%',
              maxWidth: 'min(100%, 520px, calc((100vh - 340px) * 1.64))',
              maxHeight: 'min(340px, calc(100vh - 340px))',
              height: 'auto',
              aspectRatio: '460 / 280',
              display: 'block',
              margin: '0 auto',
              touchAction: 'none'
            }}
            role="img"
            aria-label={language === 'es' ? 'Grafo interactivo para seleccionar aristas del AGM' : 'Interactive graph to select MST edges'}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
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
                  aria-label={language === 'es' ? `Arista ${edge.u}-${edge.v}, peso ${edge.weight}` : `Edge ${edge.u}-${edge.v}, weight ${edge.weight}`}
                >
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={isSelected ? 'var(--success)' : 'var(--graph-edge)'}
                    strokeWidth={isSelected ? 4 : 2.5}
                  />
                  <circle
                    cx={midX}
                    cy={midY}
                    r={12}
                    fill={isSelected ? 'var(--success)' : 'var(--surface)'}
                    stroke={isSelected ? '#059669' : 'var(--graph-edge)'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : 'var(--text)'}
                    fontFamily="var(--font-mono)"
                    fontSize="13px"
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
              const color = COMPONENT_COLORS[rootId] || 'var(--accent)';

              return (
                <g
                  key={`kru-pg-node-${node.id}`}
                  onPointerDown={(e) => handlePointerDown(node.id, e)}
                  style={{ cursor: draggingNodeId === node.id ? 'grabbing' : 'grab' }}
                >
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
                    fontSize="13px"
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
                      ? 'var(--state-solution-bg)'
                      : wouldFormCycle
                      ? 'var(--state-conflict-bg)'
                      : 'var(--canvas-bg)',
                    border: `1px solid ${isSelected ? 'var(--success)' : wouldFormCycle ? 'var(--state-conflict-bg)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {e.u} — {e.v} (w={e.weight})
                  </span>

                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--success)' : wouldFormCycle ? 'var(--error)' : 'var(--text-muted)'
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

      {/* Interactive Custom Graph Editor for Kruskal */}
      <div style={{ marginTop: '1.25rem', padding: '1rem 1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text)' }}>
              {language === 'es' ? 'Editor Interactivo de Grafo (Aristas y Pesos)' : 'Interactive Graph Editor (Edges & Weights)'}
            </h4>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {language === 'es'
                ? 'Agregá o modificá aristas no dirigidas y experimentá cómo Kruskal detecta ciclos y construye el AGM.'
                : 'Add or modify undirected edges and observe how Kruskal detects cycles and builds the MST.'}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', background: 'var(--canvas-bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', color: 'var(--text)' }}>
            <span>{language === 'es' ? 'Extremo 1 (u):' : 'Endpoint 1 (u):'}</span>
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
            <span>{language === 'es' ? 'Extremo 2 (v):' : 'Endpoint 2 (v):'}</span>
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
            {language === 'es' ? 'Aristas del grafo:' : 'Graph edges:'}
          </span>
          {edges.map((e) => (
            <span
              key={`kruskal-edge-badge-${e.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.55rem',
                background: 'var(--canvas-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8125rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <span>{e.u} — {e.v} (w={e.weight})</span>
              <button
                type="button"
                onClick={() => handleDeleteEdge(e.id)}
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
