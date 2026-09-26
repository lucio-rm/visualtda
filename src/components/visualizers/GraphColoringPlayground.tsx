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

  const { vertices, edges } = useMemo(() => {
    if (activePresetId === 'custom') {
      return { vertices: customGraph.vertices, edges: customGraph.edges };
    }
    return { vertices: currentPreset.vertices, edges: currentPreset.edges };
  }, [activePresetId, customGraph, currentPreset]);

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

  // Pointer Dragging Handlers
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
      if (dist > 4) {
        hasDraggedRef.current = true;
      }
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 500;
      const rawY = ((e.clientY - rect.top) / rect.height) * 350;

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
      aria-label="Laboratorio de Coloreo de Grafos"
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
              {language === 'es' ? '★ Grafo Personalizado' : '★ Custom Graph'}
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
                backgroundColor: 'var(--bg)',
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
              <strong style={{ color: coloredCount === vertices.length ? '#10b981' : 'var(--text)' }}>
                {coloredCount}/{vertices.length}
              </strong>
            </span>
            <span>
              {language === 'es' ? 'Conflictos:' : 'Conflicts:'}{' '}
              <strong style={{ color: conflicts.length > 0 ? '#ef4444' : '#10b981' }}>
                {conflicts.length}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Canvas with 2D Dragging */}
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
            fontSize: '0.75rem',
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
            maxWidth: '600px',
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
                    stroke={inConflict ? '#ef4444' : bothColored ? 'var(--accent)' : 'var(--border-strong)'}
                    strokeWidth={inConflict ? 3.5 : 2.5}
                    opacity={1}
                  />
                  {inConflict && (
                    <circle
                      cx={(posU.x + posV.x) / 2}
                      cy={(posU.y + posV.y) / 2}
                      r={7}
                      fill="#ef4444"
                    />
                  )}
                  {inConflict && (
                    <text
                      x={(posU.x + posV.x) / 2}
                      y={(posU.y + posV.y) / 2 + 3}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9px"
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
              const strokeColor = isNodeInConflict ? '#ef4444' : colorObj ? colorObj.stroke : 'var(--border-strong)';
              const isDragging = draggingNode === v;
              const isYellow = assignedColor === 4;

              return (
                <g
                  key={`pg-vertex-${v}`}
                  onPointerDown={(e) => handlePointerDown(v, e)}
                  onClick={() => handleVertexClick(v)}
                  onContextMenu={(e) => handleVertexRightClick(e, v)}
                  style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
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
                      y={pos.y + 32}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9px"
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
            backgroundColor: feedback.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${feedback.valid ? '#10b981' : '#ef4444'}`,
            borderRadius: 'var(--radius-sm)',
            color: feedback.valid ? '#10b981' : '#ef4444',
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
