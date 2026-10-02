import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  DEFAULT_REDUCTION_GRAPH,
  DEFAULT_GRAPH_LAYOUT
} from '../../engine/algorithms/reductionIsVcTrace';
import { reductionIsVcValidator } from '../../engine/algorithms/reductionIsVcValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './ReductionIsVcPlayground.css';
import './ReductionIsVcVisualizer.css';

interface ReductionPreset {
  id: string;
  name: { es: string; en: string };
  description: { es: string; en: string };
  vertices: string[];
  edges: [string, string][];
  k: number;
  optimalIS: string[];
  layout: Record<string, { x: number; y: number }>;
}

const REDUCTION_PRESETS: ReductionPreset[] = [
  {
    id: 'default',
    name: { es: 'Grafo Estándar (k = 3)', en: 'Standard Graph (k = 3)' },
    description: {
      es: 'Instancia canónica con 6 vértices. Posee un Conjunto Independiente de tamaño 3 y Cobertura de tamaño 3.',
      en: 'Canonical 6-vertex instance. Admits Independent Set of size 3 and Vertex Cover of size 3.'
    },
    vertices: DEFAULT_REDUCTION_GRAPH.vertices,
    edges: DEFAULT_REDUCTION_GRAPH.edges,
    k: DEFAULT_REDUCTION_GRAPH.k,
    optimalIS: ['A', 'C', 'E'],
    layout: DEFAULT_GRAPH_LAYOUT
  },
  {
    id: 'c5',
    name: { es: 'Ciclo Impar C₅ (Pentágono)', en: 'Odd Cycle C₅ (Pentagon)' },
    description: {
      es: 'Pentágono simple: α(C₅) = 2 (IS máximo) y β(C₅) = 3 (VC mínimo). Suma: 2 + 3 = 5 = |V|.',
      en: 'Simple pentagon: α(C₅) = 2 and β(C₅) = 3. Sum: 2 + 3 = 5 = |V|.'
    },
    vertices: ['1', '2', '3', '4', '5'],
    edges: [['1', '2'], ['2', '3'], ['3', '4'], ['4', '5'], ['5', '1']],
    k: 2,
    optimalIS: ['1', '3'],
    layout: {
      '1': { x: 270, y: 45 },
      '2': { x: 420, y: 140 },
      '3': { x: 370, y: 260 },
      '4': { x: 170, y: 260 },
      '5': { x: 120, y: 140 }
    }
  },
  {
    id: 'bipartite-k33',
    name: { es: 'Bipartito Completo K₃,₃', en: 'Complete Bipartite K₃,₃' },
    description: {
      es: 'Grafo bipartito completo con 2 particiones de 3 vértices: α(K₃,₃) = 3, β(K₃,₃) = 3.',
      en: 'Complete bipartite graph with 2 partitions of 3 vertices: α(K₃,₃) = 3, β(K₃,₃) = 3.'
    },
    vertices: ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'],
    edges: [
      ['L1', 'R1'], ['L1', 'R2'], ['L1', 'R3'],
      ['L2', 'R1'], ['L2', 'R2'], ['L2', 'R3'],
      ['L3', 'R1'], ['L3', 'R2'], ['L3', 'R3']
    ],
    k: 3,
    optimalIS: ['L1', 'L2', 'L3'],
    layout: {
      'L1': { x: 140, y: 65 },
      'L2': { x: 140, y: 155 },
      'L3': { x: 140, y: 245 },
      'R1': { x: 400, y: 65 },
      'R2': { x: 400, y: 155 },
      'R3': { x: 400, y: 245 }
    }
  },
  {
    id: 'triangle-tail',
    name: { es: 'Triángulo con Cola (4 vértices)', en: 'Triangle with Tail (4 vertices)' },
    description: {
      es: 'Triángulo {A, B, C} conectado a una cola {D}: α = 2, β = 2.',
      en: 'Triangle {A, B, C} connected to tail {D}: α = 2, β = 2.'
    },
    vertices: ['A', 'B', 'C', 'D'],
    edges: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['C', 'D']],
    k: 2,
    optimalIS: ['A', 'D'],
    layout: {
      'A': { x: 150, y: 70 },
      'B': { x: 150, y: 230 },
      'C': { x: 290, y: 150 },
      'D': { x: 430, y: 150 }
    }
  }
];

export const ReductionIsVcPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePresetId, setActivePresetId] = useState<string>('default');
  const currentPreset = useMemo(
    () => REDUCTION_PRESETS.find((p) => p.id === activePresetId) || REDUCTION_PRESETS[0],
    [activePresetId]
  );

  const [selectedIS, setSelectedIS] = useState<string[]>([]);
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(
    currentPreset.layout
  );

  // 2D Dragging state
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const isPointerDownRef = useRef(false);

  const { vertices, edges, k } = currentPreset;

  const handleSelectPreset = (presetId: string) => {
    setActivePresetId(presetId);
    const target = REDUCTION_PRESETS.find((p) => p.id === presetId) || REDUCTION_PRESETS[0];
    setPositions(target.layout);
    setSelectedIS([]);
  };

  const toggleNode = (nodeId: string) => {
    if (selectedIS.includes(nodeId)) {
      setSelectedIS(selectedIS.filter((id) => id !== nodeId));
    } else {
      setSelectedIS([...selectedIS, nodeId]);
    }
  };

  const handleClear = () => {
    setSelectedIS([]);
  };



  // Complement C = V \ S
  const vertexCover = vertices.filter((v) => !selectedIS.includes(v));

  // Validate Independent Set
  const isValidation = reductionIsVcValidator.validateIndependentSet(
    { vertices, edges },
    selectedIS
  );

  // Validate Vertex Cover
  const vcValidation = reductionIsVcValidator.validateVertexCover(
    { vertices, edges },
    vertexCover
  );

  // Detect conflict edges (both endpoints in S)
  const sSet = new Set(selectedIS);
  const conflictEdges = edges.filter(([u, v]) => sSet.has(u) && sSet.has(v));
  const hasConflict = conflictEdges.length > 0;
  const isOptimal = isValidation.valid && selectedIS.length >= k;

  useEffect(() => {
    if (isOptimal) {
      markAttempted('vertex-cover-reduction');
    }
  }, [isOptimal, markAttempted]);

  // Pointer drag handlers
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
      const rectWidth = rect.width || 540;
      const rectHeight = rect.height || 310;
      const rawX = ((e.clientX - rect.left) / rectWidth) * 540;
      const rawY = ((e.clientY - rect.top) / rectHeight) * 310;

      const clampedX = Math.max(30, Math.min(510, Math.round(rawX)));
      const clampedY = Math.max(30, Math.min(280, Math.round(rawY)));

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
      className="reduction-playground-box"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Header and Controls */}
      <div className="reduction-playground-header">
        <div>
          <h4 style={{ margin: 0 }}>
            {language === 'es'
              ? 'Laboratorio Interactivo de Reducción: IS ⟺ VC'
              : 'Interactive Reduction Lab: IS ⟺ VC'}
          </h4>
          <p className="reduction-playground-inst">
            {language === 'es'
              ? 'Haz clic en los nodos para armar el Conjunto Independiente S (verde). El complemento V \\ S (violeta) forma simultáneamente la Cobertura de Vértices.'
              : 'Click nodes to build Independent Set S (green). Complement V \\ S (purple) simultaneously forms Vertex Cover.'}
          </p>
        </div>

        <div className="playground-button-group" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {language === 'es' ? 'Vaciar Selección' : 'Clear Selection'}
          </button>
        </div>
      </div>

      {/* Preset Instances Selector */}
      <div className="sdk-pg-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {REDUCTION_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn-preset ${activePresetId === p.id ? 'active' : ''}`}
                onClick={() => handleSelectPreset(p.id)}
              >
                {p.name[language]}
              </button>
            ))}
          </div>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {currentPreset.description[language]}
          </span>
        </div>
      </div>

      {/* Duality Panels */}
      <div className="reduction-duality-banner">
        <div className="duality-panel is-panel">
          <h5>{language === 'es' ? 'Conjunto Independiente S (Verde)' : 'Independent Set S (Green)'}</h5>
          <span className="panel-value">
            {selectedIS.length > 0 ? `{${selectedIS.join(', ')}}` : '∅'} ({selectedIS.length}/{k})
          </span>
          <span className={`panel-status ${hasConflict ? 'status-err' : 'status-ok'}`}>
            {hasConflict
              ? (language === 'es' ? `[Conflicto] En ${conflictEdges.length} arista(s)` : `[Conflict] In ${conflictEdges.length} edge(s)`)
              : (isOptimal
                  ? (language === 'es' ? '[Válido] Objetivo k alcanzado' : '[Valid] Target k reached')
                  : (language === 'es' ? '[Válido] Sin aristas internas' : '[Valid] No internal edges'))}
          </span>
        </div>

        <div className="duality-panel vc-panel">
          <h5>{language === 'es' ? 'Cobertura Dual C = V \\ S (Violeta)' : 'Dual Cover C = V \\ S (Purple)'}</h5>
          <span className="panel-value">
            {vertexCover.length > 0 ? `{${vertexCover.join(', ')}}` : '∅'} ({vertexCover.length}/{vertices.length - k})
          </span>
          <span className={`panel-status ${vcValidation.valid ? 'status-ok' : 'status-err'}`}>
            {vcValidation.valid
              ? (language === 'es' ? '[Válido] 100% Aristas Cubiertas' : '[Valid] 100% Edges Covered')
              : (language === 'es' ? '[Incompleto] Aristas sin cubrir' : '[Incomplete] Uncovered edges')}
          </span>
        </div>
      </div>

      {/* Theorem Explanatory Callout */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <span style={{ fontWeight: '600', color: 'var(--accent)' }}>
          {language === 'es'
            ? 'Teorema Fundamental de Reducción: S es Independiente ⟺ V \\ S es Cobertura de Vértices'
            : 'Fundamental Reduction Theorem: S is Independent Set ⟺ V \\ S is Vertex Cover'}
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
          |S| + |C| = {selectedIS.length} + {vertexCover.length} = {vertices.length}
        </span>
      </div>

      {/* Interactive SVG Canvas with 2D Dragging */}
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
              ? 'Hacé clic para alternar S / C, o arrastrá los vértices para reorganizar la topología.'
              : 'Click to toggle S / C, or drag vertices to rearrange topology.'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            |V| = {vertices.length}, |E| = {edges.length}
          </span>
        </div>

        <svg
          ref={svgRef}
          className="reduction-interactive-svg"
          viewBox="0 0 540 310"
          style={{
            width: '100%',
            maxWidth: '560px',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            touchAction: 'none'
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          aria-label="Grafo interactivo de reducción con arrastre 2D"
        >
          {/* Edges */}
          <g className="edges-layer">
            {edges.map(([u, v]) => {
              const p1 = positions[u] || { x: 50, y: 50 };
              const p2 = positions[v] || { x: 100, y: 100 };

              const isConflict = sSet.has(u) && sSet.has(v);
              const isCovered = !isConflict;

              let edgeStroke = 'var(--border)';
              let strokeW = 1.5;
              let opacity = 0.5;

              if (isConflict) {
                edgeStroke = 'var(--error)';
                strokeW = 3;
                opacity = 1;
              } else if (isCovered) {
                edgeStroke = '#8b5cf6';
                strokeW = 2;
                opacity = 0.85;
              }

              return (
                <line
                  key={`${u}-${v}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={edgeStroke}
                  strokeWidth={strokeW}
                  opacity={opacity}
                  strokeDasharray={isConflict ? '3 3' : undefined}
                />
              );
            })}
          </g>

          {/* Nodes with 2D Dragging & Dual Labels */}
          <g className="nodes-layer">
            {vertices.map((v) => {
              const pos = positions[v] || { x: 50, y: 50 };
              const inIS = selectedIS.includes(v);
              const inVC = vertexCover.includes(v);
              const isConflict = conflictEdges.some((e) => e[0] === v || e[1] === v);
              const isDragging = draggingNode === v;

              let fillColor = 'var(--surface)';
              let strokeColor = 'var(--border)';

              if (inIS) {
                fillColor = 'var(--success)';
                strokeColor = isConflict ? 'var(--error)' : '#059669';
              } else if (inVC) {
                fillColor = '#8b5cf6';
                strokeColor = '#7c3aed';
              }

              return (
                <g
                  key={v}
                  onPointerDown={(e) => handlePointerDown(v, e)}
                  onClick={() => {
                    if (hasDraggedRef.current) {
                      hasDraggedRef.current = false;
                      return;
                    }
                    toggleNode(v);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={
                    language === 'es'
                      ? `Vértice ${v}${inIS ? ' en Conjunto Independiente' : inVC ? ' en Cobertura de Vértices' : ''}`
                      : `Vertex ${v}${inIS ? ' in Independent Set' : inVC ? ' in Vertex Cover' : ''}`
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleNode(v);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: pos.x, y: Math.max(30, pos.y - 10) } }));
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: pos.x, y: Math.min(270, pos.y + 10) } }));
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: Math.max(30, pos.x - 10), y: pos.y } }));
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setPositions((prev) => ({ ...prev, [v]: { x: Math.min(510, pos.x + 10), y: pos.y } }));
                    }
                  }}
                  style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
                >
                  {/* Outer selection ring */}
                  {(inIS || inVC) && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={28}
                      fill="none"
                      stroke={inIS ? 'var(--success)' : '#8b5cf6'}
                      strokeWidth={2.5}
                      opacity={0.5}
                    />
                  )}

                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isConflict ? 3 : 2}
                  />

                  <text
                    x={pos.x}
                    y={pos.y + 5}
                    textAnchor="middle"
                    fill={inIS || inVC ? '#ffffff' : 'var(--text)'}
                    fontSize="14px"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    {v}
                  </text>

                  {/* Dual membership tag */}
                  <text
                    x={pos.x}
                    y={pos.y - 25}
                    textAnchor="middle"
                    fill={inIS ? 'var(--success)' : '#8b5cf6'}
                    fontSize="13px"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    {inIS ? '∈ S' : '∈ C'}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
