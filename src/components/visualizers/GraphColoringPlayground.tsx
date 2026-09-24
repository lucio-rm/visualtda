import React, { useState, useMemo } from 'react';
import {
  DEFAULT_COLORING_GRAPH,
  DEFAULT_COLORING_LAYOUT,
  COLOR_PALETTE
} from '../../engine/algorithms/graphColoringTrace';
import { graphColoringValidator } from '../../engine/algorithms/graphColoringValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './GraphColoringPlayground.css';

export const GraphColoringPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [k, setK] = useState<number>(3);
  const [coloring, setColoring] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ valid: boolean; text: string } | null>(null);

  const { vertices, edges } = DEFAULT_COLORING_GRAPH;

  const conflicts = useMemo(() => {
    const list: [string, string][] = [];
    for (const [u, v] of edges) {
      if (coloring[u] !== undefined && coloring[v] !== undefined && coloring[u] === coloring[v]) {
        list.push([u, v]);
      }
    }
    return list;
  }, [coloring, edges]);

  const handleVertexClick = (v: string) => {
    setColoring((prev) => {
      const current = prev[v] || 0;
      const next = (current % k) + 1;
      return { ...prev, [v]: next };
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

  return (
    <div className="gc-playground" role="region" aria-label="Playground de Coloreo de Grafos">
      <div className="gc-playground-header">
        <p className="gc-playground-instruction">
          {language === 'es'
            ? 'Haz clic en los nodos para ciclar su color. Clic derecho para descolorear. Intenta colorear todos los vértices sin que ningún par de vecinos comparta el mismo color.'
            : 'Click nodes to cycle their color. Right-click to uncolor. Try to color all vertices so no two adjacent vertices share the same color.'}
        </p>
      </div>

      {/* Control Bar */}
      <div className="gc-playground-controls">
        <div className="gc-k-selector">
          <label htmlFor="gc-k-select">
            {language === 'es' ? 'Límite de colores (k):' : 'Color limit (k):'}
          </label>
          <select
            id="gc-k-select"
            value={k}
            onChange={(e) => {
              const newK = Number(e.target.value);
              setK(newK);
              setColoring((prev) => {
                const next: Record<string, number> = {};
                for (const [v, c] of Object.entries(prev)) {
                  if (c <= newK) next[v] = c;
                }
                return next;
              });
              setFeedback(null);
            }}
          >
            <option value={2}>k = 2 ({language === 'es' ? 'Bipartito' : 'Bipartite'})</option>
            <option value={3}>k = 3</option>
            <option value={4}>k = 4</option>
          </select>
        </div>

        <div className="gc-playground-stats">
          <span className="gc-stat-item">
            {language === 'es' ? 'Coloreados:' : 'Colored:'} <strong>{coloredCount}/{vertices.length}</strong>
          </span>
          <span className={`gc-stat-item ${conflicts.length > 0 ? 'gc-stat-conflict' : ''}`}>
            {language === 'es' ? 'Conflictos:' : 'Conflicts:'} <strong>{conflicts.length}</strong>
          </span>
        </div>

        <div className="gc-playground-action-buttons">
          <button className="btn btn-secondary btn-sm" onClick={handleClear}>
            {language === 'es' ? 'Limpiar' : 'Clear'}
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleValidate}>
            {language === 'es' ? 'Verificar Coloreo' : 'Check Coloring'}
          </button>
        </div>
      </div>

      {/* SVG Interactive Canvas */}
      <div className="gc-playground-canvas-box">
        <svg
          viewBox="0 0 500 370"
          className="gc-playground-svg"
          role="img"
          aria-label={language === 'es' ? 'Lienzo interactivo de coloreo' : 'Interactive coloring canvas'}
        >
          {/* Edges */}
          <g className="gc-edges-layer">
            {edges.map(([u, v]) => {
              const posU = DEFAULT_COLORING_LAYOUT[u] || { x: 50, y: 50 };
              const posV = DEFAULT_COLORING_LAYOUT[v] || { x: 100, y: 100 };
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
                    className={`gc-edge ${inConflict ? 'gc-edge-conflict' : ''} ${bothColored ? 'gc-edge-colored' : ''}`}
                  />
                  {inConflict && (
                    <circle
                      cx={(posU.x + posV.x) / 2}
                      cy={(posU.y + posV.y) / 2}
                      r={10}
                      className="gc-conflict-pin"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Vertices */}
          <g className="gc-vertices-layer">
            {vertices.map((v) => {
              const pos = DEFAULT_COLORING_LAYOUT[v] || { x: 50, y: 50 };
              const assignedColor = coloring[v];
              const colorObj = assignedColor ? COLOR_PALETTE[assignedColor] : null;

              const fillColor = colorObj ? colorObj.fill : 'var(--surface)';
              const strokeColor = colorObj ? colorObj.stroke : 'var(--border)';

              return (
                <g
                  key={`pg-vertex-${v}`}
                  className="gc-interactive-node"
                  onClick={() => handleVertexClick(v)}
                  onContextMenu={(e) => handleVertexRightClick(e, v)}
                  tabIndex={0}
                  role="button"
                  aria-label={`${v}, ${assignedColor ? (language === 'es' ? COLOR_PALETTE[assignedColor]?.name.es : COLOR_PALETTE[assignedColor]?.name.en) : (language === 'es' ? 'sin color' : 'uncolored')}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleVertexClick(v);
                    } else if (e.key === 'Backspace' || e.key === 'Delete') {
                      e.preventDefault();
                      handleVertexRightClick(e as unknown as React.MouseEvent, v);
                    }
                  }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={2.5}
                    className="gc-node-circle"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    dy="0.35em"
                    textAnchor="middle"
                    fill={assignedColor ? '#ffffff' : 'var(--text)'}
                    className="gc-node-label"
                  >
                    {v}
                  </text>
                  {assignedColor && (
                    <text
                      x={pos.x}
                      y={pos.y + 36}
                      textAnchor="middle"
                      className="gc-node-colortag"
                      fill="var(--text-muted)"
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
        <div className={`gc-feedback-banner ${feedback.valid ? 'gc-feedback-valid' : 'gc-feedback-error'}`}>
          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
            {feedback.valid
              ? (language === 'es' ? '[Válido]' : '[Valid]')
              : (language === 'es' ? '[Conflicto]' : '[Conflict]')}
          </span>
          <p>{feedback.text}</p>
        </div>
      )}
    </div>
  );
};
