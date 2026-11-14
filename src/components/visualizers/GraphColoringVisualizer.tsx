import React, { useMemo } from 'react';
import { TraceScrubber } from '../TraceScrubber';
import {
  generateGraphColoringTrace,
  GraphColoringStepData,
  DEFAULT_COLORING_GRAPH,
  DEFAULT_COLORING_LAYOUT,
  COLOR_PALETTE
} from '../../engine/algorithms/graphColoringTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './GraphColoringVisualizer.css';

export const GraphColoringVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateGraphColoringTrace(DEFAULT_COLORING_GRAPH), []);

  const {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed
  } = useTraceTimeline<GraphColoringStepData>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const vertices = data?.vertices || DEFAULT_COLORING_GRAPH.vertices;
  const edges = data?.edges || DEFAULT_COLORING_GRAPH.edges;
  const k = data?.k ?? 3;
  const coloring = data?.coloring || {};
  const currentVertex = data?.currentVertex;
  const attemptedColor = data?.attemptedColor;
  const conflictEdge = data?.conflictEdge;
  const action = data?.action || 'INIT';
  const exploredStates = data?.exploredStates ?? 0;
  const backtrackCount = data?.backtrackCount ?? 0;
  const description = data?.description;

  const isEdgeConflict = (u: string, v: string) => {
    if (!conflictEdge) return false;
    return (conflictEdge[0] === u && conflictEdge[1] === v) || (conflictEdge[0] === v && conflictEdge[1] === u);
  };

  const coloredCount = Object.keys(coloring).length;

  return (
    <div className="graph-coloring-visualizer" role="region" aria-label={language === 'es' ? 'Visualizador de Coloreo de Grafos' : 'Graph Coloring Visualizer'}>
      {/* Metrics Row */}
      <div className="gc-metrics-row">
        <div className="gc-metric-badge">
          <span>{language === 'es' ? 'Vértices coloreados:' : 'Colored vertices:'}</span>
          <strong>{coloredCount} / {vertices.length}</strong>
        </div>
        <div className="gc-metric-badge">
          <span>{language === 'es' ? 'Colores disponibles (k):' : 'Available colors (k):'}</span>
          <strong>{k}</strong>
        </div>
        <div className="gc-metric-badge">
          <span>{language === 'es' ? 'Estados explorados:' : 'Explored states:'}</span>
          <strong>{exploredStates}</strong>
        </div>
        <div className="gc-metric-badge">
          <span>{language === 'es' ? 'Podas / Backtracks:' : 'Backtracks / Prunes:'}</span>
          <strong>{backtrackCount}</strong>
        </div>
        <div className={`gc-metric-badge gc-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Acción actual:' : 'Current action:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="gc-canvas-container">
        <svg
          viewBox="0 0 500 370"
          className="gc-svg-canvas"
          role="img"
          aria-label={language === 'es' ? 'Grafo y coloreo de vértices' : 'Graph and vertex coloring'}
        >
          {/* Edges */}
          <g className="gc-edges-layer">
            {edges.map(([u, v]) => {
              const posU = DEFAULT_COLORING_LAYOUT[u] || { x: 50, y: 50 };
              const posV = DEFAULT_COLORING_LAYOUT[v] || { x: 100, y: 100 };
              const isConflict = isEdgeConflict(u, v);
              const colorU = coloring[u];
              const colorV = coloring[v];
              const bothColored = colorU !== undefined && colorV !== undefined;

              return (
                <g key={`edge-${u}-${v}`}>
                  <line
                    x1={posU.x}
                    y1={posU.y}
                    x2={posV.x}
                    y2={posV.y}
                    className={`gc-edge ${isConflict ? 'gc-edge-conflict' : ''} ${bothColored ? 'gc-edge-colored' : ''}`}
                  />
                  {isConflict && (
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
              const isActive = v === currentVertex;
              const colorObj = assignedColor ? COLOR_PALETTE[assignedColor] : (isActive && attemptedColor ? COLOR_PALETTE[attemptedColor] : null);

              const fillColor = colorObj ? colorObj.fill : 'var(--surface)';
              const strokeColor = colorObj ? colorObj.stroke : 'var(--border-strong)';
              const isYellow = assignedColor === 4 || (isActive && attemptedColor === 4);
              const labelFill = (assignedColor || (isActive && attemptedColor)) ? (isYellow ? '#0f172a' : '#ffffff') : 'var(--text)';

              return (
                <g key={`vertex-${v}`} className={`gc-node-group ${isActive ? 'gc-node-active' : ''}`}>
                  {isActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={28}
                      className="gc-node-pulse"
                    />
                  )}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={22}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={isActive ? 3 : 2}
                    className="gc-node-circle"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    dy="0.35em"
                    textAnchor="middle"
                    fill={labelFill}
                    className="gc-node-label"
                  >
                    {v}
                  </text>
                  {assignedColor && (
                    <text
                      x={pos.x}
                      y={pos.y + 40}
                      textAnchor="middle"
                      className="gc-node-colortag"
                      fill="var(--text-muted)"
                    >
                      {language === 'es' ? COLOR_PALETTE[assignedColor]?.name.es : COLOR_PALETTE[assignedColor]?.name.en} (c={assignedColor})
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Step Explanation */}
      {description && (
        <div className="gc-step-card">
          <p className="gc-step-desc">
            {language === 'es' ? description.es : description.en}
          </p>
        </div>
      )}

      {/* Pruning Analysis Card (Section 24) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fuerza Bruta vs. Backtracking con Restricción Vecinal:' : 'Brute Force vs. Backtracking with Neighbor Constraints:'}</strong>{' '}
        {language === 'es'
          ? `Para un grafo de |V| = ${vertices.length} vértices y k = ${k} colores, la fuerza bruta exhaustiva evalúa k^|V| = ${Math.pow(k, vertices.length)} asignaciones totales. Backtracking descarta de inmediato cualquier color asignado que coincida con un vecino adyacente ya pintado, podando el subárbol completo de decisiones posteriores y reduciendo drásticamente el espacio explorado.`
          : `For a graph with |V| = ${vertices.length} vertices and k = ${k} colors, brute force evaluates k^|V| = ${Math.pow(k, vertices.length)} total assignments. Backtracking immediately rejects any color matching an already-colored adjacent neighbor, pruning entire subsequent subtrees and dramatically reducing explored states.`}
      </div>

      {/* Timeline Controls */}
      <div className="gc-controls-card">
        <div className="gc-playback-buttons">
          <button
            className="ctrl-btn"
            onClick={reset}
            title={language === 'es' ? 'Reiniciar traza (r)' : 'Reset trace (r)'}
            aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
          >
            ↺
          </button>
          <button
            className="ctrl-btn"
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            title={language === 'es' ? 'Paso anterior (←)' : 'Step back (←)'}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ←
          </button>
          <button
            className="ctrl-btn ctrl-play-btn"
            onClick={togglePlay}
            title={language === 'es' ? 'Reproducir / Pausar (Espacio)' : 'Play / Pause (Space)'}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            className="ctrl-btn"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            title={language === 'es' ? 'Paso siguiente (→)' : 'Step forward (→)'}
            aria-label={language === 'es' ? 'Paso siguiente' : 'Next step'}
          >
            →
          </button>
        </div>

        {/* Scrubber */}
        <div className="gc-scrubber">
          <TraceScrubber
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSeek={goToStep}
            language={language}
            showCounter={false}
            ariaLabel={language === 'es' ? 'Paso de la traza' : 'Trace step scrubber'}
          />
          <span className="gc-step-counter">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        {/* Speed Selector */}
        <div className="speed-selector">
          <span className="speed-label">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
          <div className="segmented-control speed-segmented-control" role="group" aria-label={language === 'es' ? 'Velocidad' : 'Speed'}>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                className={`segmented-btn ${playbackSpeed === spd ? 'active' : ''}`}
                onClick={() => setSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
