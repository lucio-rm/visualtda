import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  DEFAULT_COLORING_GRAPH,
  DEFAULT_COLORING_LAYOUT,
  COLOR_PALETTE
} from '../../engine/algorithms/graphColoringTrace';
import { graphColoringValidator } from '../../engine/algorithms/graphColoringValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './GraphColoringPlayground.css';

interface ColoringPreset {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  vertices: string[];
  edges: [string, string][];
  chromaticNumber: number;
  canonicalColoring: Record<string, number>;
  layout: Record<string, { x: number; y: number }>;
}

const COLORING_PRESETS: ColoringPreset[] = [
  {
    id: 'default',
    name: { es: 'Grafo Estándar (5 vértices)', en: 'Standard Graph (5 vertices)' },
    description: {
      es: 'Instancia canónica con 5 vértices: número cromático χ(G) = 3.',
      en: 'Standard 5-vertex instance: chromatic number χ(G) = 3.'
    },
    vertices: DEFAULT_COLORING_GRAPH.vertices,
    edges: DEFAULT_COLORING_GRAPH.edges,
    chromaticNumber: 3,
    canonicalColoring: { A: 1, B: 2, C: 1, D: 3, E: 2 },
    layout: DEFAULT_COLORING_LAYOUT
  },
  {
    id: 'c5',
    name: { es: 'Ciclo Impar C₅ (Pentágono)', en: 'Odd Cycle C₅ (Pentagon)' },
    description: {
      es: 'Todo ciclo impar requiere exactamente χ = 3 colores (demuestra por qué no es bipartito).',
      en: 'Every odd cycle requires exactly χ = 3 colors (proves non-bipartiteness).'
    },
    vertices: ['1', '2', '3', '4', '5'],
    edges: [['1', '2'], ['2', '3'], ['3', '4'], ['4', '5'], ['5', '1']],
    chromaticNumber: 3,
    canonicalColoring: { '1': 1, '2': 2, '3': 1, '4': 2, '5': 3 },
    layout: {
      '1': { x: 250, y: 40 },
      '2': { x: 390, y: 140 },
      '3': { x: 340, y: 290 },
      '4': { x: 160, y: 290 },
      '5': { x: 110, y: 140 }
    }
  },
  {
    id: 'k4',
    name: { es: 'Grafo Completo K₄ (4 vértices)', en: 'Complete Graph K₄ (4 vertices)' },
    description: {
      es: 'Grafo completo de 4 vértices: requiere exactamente χ = 4 colores.',
      en: 'Complete graph of 4 vertices: strictly requires χ = 4 colors.'
    },
    vertices: ['A', 'B', 'C', 'D'],
    edges: [['A', 'B'], ['A', 'C'], ['A', 'D'], ['B', 'C'], ['B', 'D'], ['C', 'D']],
    chromaticNumber: 4,
    canonicalColoring: { A: 1, B: 2, C: 3, D: 4 },
    layout: {
      'A': { x: 250, y: 45 },
      'B': { x: 390, y: 240 },
      'C': { x: 110, y: 240 },
      'D': { x: 250, y: 165 }
    }
  },
  {
    id: 'bipartite-k33',
    name: { es: 'Bipartito K₃,₃ (Bicoloreable)', en: 'Bipartite K₃,₃ (2-Colorable)' },
    description: {
      es: 'Grafo bipartito: sus dos particiones independientes se colorean perfectamente con solo χ = 2 colores.',
      en: 'Bipartite graph: two independent sets colorable with just χ = 2 colors.'
    },
    vertices: ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'],
    edges: [
      ['L1', 'R1'], ['L1', 'R2'], ['L1', 'R3'],
      ['L2', 'R1'], ['L2', 'R2'], ['L2', 'R3'],
      ['L3', 'R1'], ['L3', 'R2'], ['L3', 'R3']
    ],
    chromaticNumber: 2,
    canonicalColoring: { L1: 1, L2: 1, L3: 1, R1: 2, R2: 2, R3: 2 },
    layout: {
      L1: { x: 140, y: 70 },
      L2: { x: 140, y: 170 },
      L3: { x: 140, y: 270 },
      R1: { x: 360, y: 70 },
      R2: { x: 360, y: 170 },
      R3: { x: 360, y: 270 }
    }
  }
];

export const GraphColoringPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePresetId, setActivePresetId] = useState<string>('default');
  const currentPreset = useMemo(
    () => COLORING_PRESETS.find((p) => p.id === activePresetId) || COLORING_PRESETS[0],
    [activePresetId]
  );

  const [k, setK] = useState<number>(3);
  const [selectedColor, setSelectedColor] = useState<number>(1);
  const [coloring, setColoring] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ valid: boolean; text: string } | null>(null);

  // 2D Dragging state
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    currentPreset.layout
  );
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [customN, setCustomN] = useState<number>(5);

  const customGraph = useMemo(() => {
    const n = customN;
    const verts = Array.from({ length: n }, (_, i) => String(i + 1));
    const eds: [string, string][] = [];
    for (let i = 0; i < n; i++) {
      eds.push([String(i + 1), String(((i + 1) % n) + 1)]);
    }
    if (n >= 5) {
      eds.push(['1', '3']);
      eds.push(['2', '4']);
    }
    if (n >= 7) {
      eds.push(['3', '6']);
    }
    const R = 115;
    const cx = 250;
    const cy = 175;
    const lay: Record<string, { x: number; y: number }> = {};
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      lay[String(i + 1)] = {
        x: Math.round(cx + R * Math.cos(angle)),
        y: Math.round(cy + R * Math.sin(angle))
      };
    }
    return { vertices: verts, edges: eds, layout: lay };
  }, [customN]);

  const [customEdges, setCustomEdges] = useState<[string, string][] | null>(null);
  const [edgeU, setEdgeU] = useState<string>('1');
  const [edgeV, setEdgeV] = useState<string>('2');
  const [edgeError, setEdgeError] = useState<string | null>(null);

  const { vertices, edges } = useMemo(() => {
    if (activePresetId === 'custom') {
      return { vertices: customGraph.vertices, edges: customEdges ?? customGraph.edges };
    }
    return { vertices: currentPreset.vertices, edges: currentPreset.edges };
  }, [activePresetId, customGraph, customEdges, currentPreset]);

  const handleAddEdge = () => {
    if (edgeU === edgeV) {
      setEdgeError(language === 'es' ? 'No se permiten bucles reflexivos (u = v).' : 'Self-loops are not allowed (u = v).');
      return;
    }
    const current = customEdges ?? customGraph.edges;
    const exists = current.some(([u, v]) => (u === edgeU && v === edgeV) || (u === edgeV && v === edgeU));
    if (exists) {
      setEdgeError(language === 'es' ? 'La arista ya existe.' : 'Edge already exists.');
      return;
    }
    setEdgeError(null);
    setCustomEdges([...current, [edgeU, edgeV]]);
    setColoring({});
    setFeedback(null);
    markAttempted('graph-coloring');
  };

  const handleRemoveEdge = (uToRemove: string, vToRemove: string) => {
    const current = customEdges ?? customGraph.edges;
    setCustomEdges(current.filter(([u, v]) => !((u === uToRemove && v === vToRemove) || (u === vToRemove && v === uToRemove))));
    setColoring({});
    setFeedback(null);
  };

  const handleResetEdges = () => {
    setCustomEdges(null);
    setColoring({});
    setFeedback(null);
    setEdgeError(null);
  };

  const conflicts = useMemo(() => {
    const list: [string, string][] = [];
    for (const [u, v] of edges) {
      if (coloring[u] !== undefined && coloring[v] !== undefined && coloring[u] === coloring[v]) {
        list.push([u, v]);
      }
    }
    return list;
  }, [coloring, edges]);

  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    if (presetId === 'custom') {
      setPositions(customGraph.layout);
      setK(3);
    } else {
      const target = COLORING_PRESETS.find((p) => p.id === presetId) || COLORING_PRESETS[0];
      setPositions(target.layout);
      setK(target.chromaticNumber);
    }
    setColoring({});
    setFeedback(null);
  };

  const handleCustomNChange = (newN: number) => {
    setCustomN(newN);
    const n = newN;
    const R = 115;
    const cx = 250;
    const cy = 175;
    const lay: Record<string, { x: number; y: number }> = {};
    for (let i = 0; i < n; i++) {
      const angle = (2 * Math.PI * i) / n - Math.PI / 2;
      lay[String(i + 1)] = {
        x: Math.round(cx + R * Math.cos(angle)),
        y: Math.round(cy + R * Math.sin(angle))
      };
    }
    setPositions(lay);
    setColoring({});
    setFeedback(null);
  };

  const handleVertexClick = (v: string) => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    setColoring((prev) => {
      const current = prev[v];
      const next = { ...prev };
      if (current === undefined) {
        next[v] = 1;
      } else if (current < k) {
        next[v] = current + 1;
      } else {
        delete next[v];
      }
      return next;
    });
    setFeedback(null);
  };

  const handleVertexRightClick = (e: React.MouseEvent, v: string) => {
    e.preventDefault();
    setColoring((prev) => {
      const next = { ...prev };
      delete next[v];
      return next;
    });
    setFeedback(null);
  };

  const handleClear = () => {
    setColoring({});
    setFeedback(null);
  };



  const coloredCount = Object.keys(coloring).length;

  const handleValidate = () => {
    const result = graphColoringValidator.validate({ vertices, edges, k }, coloring);
    setFeedback({
      valid: result.valid,
      text: language === 'es' ? result.message.es : result.message.en
    });
    if (result.valid && coloredCount === vertices.length) {
      markAttempted('graph-coloring-backtracking');
    }
  };

  const isEdgeInConflict = (u: string, v: string) => {
    return conflicts.some(
      ([x, y]) => (x === u && y === v) || (x === v && y === u)
    );
  };

  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const isPointerDownRef = useRef(false);

  // Pointer Dragging Handlers
  const handlePointerDown = (nodeId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    isPointerDownRef.current = true;
    setDraggingNode(nodeId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isPointerDownRef.current) return;
      const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (dist > 5) {
        hasDraggedRef.current = true;
      }
      if (!draggingNode || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rectWidth = rect.width || 500;
      const rectHeight = rect.height || 350;
      const rawX = ((e.clientX - rect.left) / rectWidth) * 500;
      const rawY = ((e.clientY - rect.top) / rectHeight) * 350;

      const clampedX = Math.max(25, Math.min(475, Math.round(rawX)));
      const clampedY = Math.max(25, Math.min(325, Math.round(rawY)));

      setPositions((prev) => ({
        ...prev,
        [draggingNode]: { x: clampedX, y: clampedY }
      }));
    },
    [draggingNode]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    isPointerDownRef.current = false;
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
      className="algorithm-playground gc-playground"
      role="region"
      aria-label={language === 'es' ? 'Laboratorio de Coloreo de Grafos' : 'Graph Coloring Playground'}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Controls & Instance Presets */}
      <div className="sdk-pg-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {COLORING_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn-preset ${activePresetId === p.id ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p.id)}
              >
                {p.name[language]}
              </button>
            ))}
            <button
              type="button"
              className={`btn-preset ${activePresetId === 'custom' ? 'active' : ''}`}
              onClick={() => handleSelectPreset('custom')}
              style={{ fontWeight: 600 }}
            >
              {language === 'es' ? 'Grafo Personalizado' : 'Custom Graph'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {activePresetId === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {language === 'es' ? 'Vértices (|V|):' : 'Vertices (|V|):'}
                </label>
                <select
                  value={customN}
                  onChange={(e) => handleCustomNChange(Number(e.target.value))}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1.5px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text)',
                    fontWeight: 700
                  }}
                >
                  {[3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      |V| = {num}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="button" className="btn-preset" onClick={handleClear}>
              {language === 'es' ? 'Limpiar' : 'Clear'}
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={handleValidate}
              style={{ fontWeight: '700' }}
            >
              {language === 'es' ? 'Verificar Coloreo' : 'Check Coloring'}
            </button>
          </div>
        </div>

        {/* Toolbar: Color Swatches & k Limit */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--surface)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          {/* Palette brush selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
              {language === 'es' ? 'Pincel:' : 'Brush:'}
            </span>
            {[1, 2, 3, 4].slice(0, k).map((cId) => {
              const pItem = COLOR_PALETTE[cId];
              const isSelected = selectedColor === cId;
              return (
                <button
                  key={`brush-${cId}`}
                  type="button"
                  onClick={() => setSelectedColor(cId)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    backgroundColor: pItem.fill,
                    border: `2px solid ${isSelected ? 'var(--text)' : pItem.stroke}`,
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px var(--accent)' : 'none',
                    transition: 'all 0.1s ease'
                  }}
                  title={language === 'es' ? pItem.name.es : pItem.name.en}
                />
              );
            })}
          </div>

          {/* k selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <label htmlFor="gc-k-select" style={{ fontWeight: '600' }}>
              {language === 'es' ? 'Colores disponibles (k):' : 'Colors limit (k):'}
            </label>
            <select
              id="gc-k-select"
              value={k}
              onChange={(e) => {
                const newK = Number(e.target.value);
                setK(newK);
                setSelectedColor((prev) => Math.min(prev, newK));
                setColoring((prev) => {
                  const next: Record<string, number> = {};
                  for (const [v, c] of Object.entries(prev)) {
                    if (c <= newK) next[v] = c;
                  }
                  return next;
                });
                setFeedback(null);
              }}
              style={{
                padding: '0.2rem 0.5rem',
                backgroundColor: 'var(--canvas-bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <option value={2}>k = 2 ({language === 'es' ? 'Bipartito' : 'Bipartite'})</option>
              <option value={3}>k = 3</option>
              <option value={4}>k = 4</option>
            </select>
          </div>

          {/* Live stats */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' }}>
            <span>
              {language === 'es' ? 'Coloreados:' : 'Colored:'}{' '}
              <strong style={{ color: coloredCount === vertices.length ? 'var(--success)' : 'var(--text)' }}>
                {coloredCount}/{vertices.length}
              </strong>
            </span>
            <span>
              {language === 'es' ? 'Conflictos:' : 'Conflicts:'}{' '}
              <strong style={{ color: conflicts.length > 0 ? 'var(--error)' : 'var(--success)' }}>
                {conflicts.length}
              </strong>
            </span>
          </div>
        </div>

        {/* Custom Edge Topology Editor */}
        {activePresetId === 'custom' && (
          <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)' }}>
                {language === 'es' ? 'Editor de Topología de Aristas:' : 'Custom Edge Topology Editor:'}
              </span>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleResetEdges}
                style={{ fontSize: '0.8125rem', padding: '0.2rem 0.6rem' }}
              >
                {language === 'es' ? 'Reiniciar Aristas' : 'Reset Edges'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>{language === 'es' ? 'De (u):' : 'From (u):'}</span>
                <select
                  value={edgeU}
                  onChange={(e) => setEdgeU(e.target.value)}
                  style={{ padding: '0.25rem 0.5rem', background: 'var(--canvas-bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
                >
                  {vertices.map((v) => (
                    <option key={`opt-u-${v}`} value={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: '0.8125rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span>{language === 'es' ? 'A (v):' : 'To (v):'}</span>
                <select
                  value={edgeV}
                  onChange={(e) => setEdgeV(e.target.value)}
                  style={{ padding: '0.25rem 0.5rem', background: 'var(--canvas-bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-mono)' }}
                >
                  {vertices.map((v) => (
                    <option key={`opt-v-${v}`} value={v}>{v}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="btn-primary"
                onClick={handleAddEdge}
                style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
              >
                {language === 'es' ? '+ Conectar Arista' : '+ Connect Edge'}
              </button>
            </div>
            {edgeError && (
              <div style={{ marginTop: '0.35rem', color: 'var(--error)', fontSize: '0.8125rem' }}>
                {edgeError}
              </div>
            )}
            <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {edges.map(([u, v], eIdx) => (
                <span
                  key={`edge-tag-${eIdx}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.2rem 0.5rem',
                    background: 'var(--canvas-bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8125rem',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  <span>({u}, {v})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEdge(u, v)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontWeight: 'bold', padding: 0 }}
                    title={language === 'es' ? 'Eliminar arista' : 'Remove edge'}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SVG Canvas with 2D Dragging */}
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
              ? 'Clic para pintar con el pincel seleccionado. Clic derecho para descolorear. Arrastrá los nodos para moverlos.'
              : 'Click to paint with selected brush. Right-click to uncolor. Drag nodes to move.'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            |V| = {vertices.length}, |E| = {edges.length}
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
          aria-label="Grafo interactivo de coloreo con arrastre 2D"
        >
          {/* Edges */}
          <g className="gc-edges-layer">
            {edges.map(([u, v]) => {
              const posU = positions[u] || { x: 50, y: 50 };
              const posV = positions[v] || { x: 100, y: 100 };
              const inConflict = isEdgeInConflict(u, v);
              const colorU = coloring[u];
              const colorV = coloring[v];
              const bothColored = colorU !== undefined && colorV !== undefined;

              return (
                <g key={`pg-edge-${u}-${v}`}>
                  <line
                    x1={posU.x}
                    y1={posU.y}
                    x2={posV.x}
                    y2={posV.y}
                    stroke={inConflict ? 'var(--error)' : bothColored ? 'var(--accent)' : 'var(--border-strong)'}
                    strokeWidth={inConflict ? 3.5 : 2.5}
                    opacity={1}
                  />
                  {inConflict && (
                    <circle
                      cx={(posU.x + posV.x) / 2}
                      cy={(posU.y + posV.y) / 2}
                      r={7}
                      fill="var(--error)"
                    />
                  )}
                  {inConflict && (
                    <text
                      x={(posU.x + posV.x) / 2}
                      y={(posU.y + posV.y) / 2 + 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="13px"
                      fontWeight="800"
                    >
                      !
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* Vertices */}
          <g className="gc-vertices-layer">
            {vertices.map((v) => {
              const pos = positions[v] || { x: 50, y: 50 };
              const assignedColor = coloring[v];
              const colorObj = assignedColor ? COLOR_PALETTE[assignedColor] : null;
              const isNodeInConflict = conflicts.some(([x, y]) => x === v || y === v);

              const fillColor = colorObj ? colorObj.fill : 'var(--surface)';
              const strokeColor = isNodeInConflict ? 'var(--error)' : colorObj ? colorObj.stroke : 'var(--border-strong)';
              const isDragging = draggingNode === v;
              const isYellow = assignedColor === 4;

              return (
                <g
                  key={`pg-vertex-${v}`}
                  className="gc-interactive-node"
                  onPointerDown={(e) => handlePointerDown(v, e)}
                  onClick={() => handleVertexClick(v)}
                  onContextMenu={(e) => handleVertexRightClick(e, v)}
                  tabIndex={0}
                  role="button"
                  aria-label={
                    language === 'es'
                      ? `Vértice ${v}${assignedColor ? `, Color: ${COLOR_PALETTE[assignedColor].name.es}` : ', Sin color'}${isNodeInConflict ? ' (en conflicto)' : ''}`
                      : `Vertex ${v}${assignedColor ? `, Color: ${COLOR_PALETTE[assignedColor].name.en}` : ', Uncolored'}${isNodeInConflict ? ' (conflicted)' : ''}`
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleVertexClick(v);
                    } else if (e.key === 'Delete' || e.key === 'Backspace') {
                      e.preventDefault();
                      handleVertexRightClick(e as unknown as React.MouseEvent, v);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: pos.x, y: Math.max(25, pos.y - 10) } }));
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: pos.x, y: Math.min(300, pos.y + 10) } }));
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: Math.max(25, pos.x - 10), y: pos.y } }));
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: Math.min(475, pos.x + 10), y: pos.y } }));
                    }
                  }}
                  style={{ cursor: isDragging ? 'grabbing' : 'pointer', outline: 'none' }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={24}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2.5}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill={assignedColor ? (isYellow ? '#0f172a' : '#ffffff') : 'var(--text)'}
                    fontSize="14px"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    {v}
                  </text>
                  {assignedColor && (
                    <text
                      x={pos.x}
                      y={pos.y + 42}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="11px"
                      fontWeight="600"
                      fontFamily="var(--font-mono)"
                      pointerEvents="none"
                    >
                      {language === 'es' ? COLOR_PALETTE[assignedColor]?.name.es : COLOR_PALETTE[assignedColor]?.name.en}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: feedback.valid ? 'var(--state-solution-bg)' : 'var(--state-conflict-bg)',
            border: `1px solid ${feedback.valid ? 'var(--success)' : 'var(--error)'}`,
            borderRadius: 'var(--radius-sm)',
            color: feedback.valid ? 'var(--success)' : 'var(--error)',
            fontSize: '0.85rem'
          }}
          role="alert"
        >
          <strong>{feedback.valid ? (language === 'es' ? '[Válido]' : '[Valid]') : (language === 'es' ? '[Conflicto]' : '[Conflict]')}: </strong>
          {feedback.text}
        </div>
      )}
    </div>
  );
};
