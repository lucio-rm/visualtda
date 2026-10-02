import React, { useMemo } from 'react';
import {
  generateHamiltonianCycleTrace,
  HamiltonianStepData,
  DEFAULT_HAM_GRAPH
} from '../../engine/algorithms/hamiltonianCycleTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './HamiltonianCycleVisualizer.css';

export const HamiltonianCycleVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateHamiltonianCycleTrace(DEFAULT_HAM_GRAPH), []);

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
  } = useTraceTimeline<HamiltonianStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const nodes = data?.nodes || DEFAULT_HAM_GRAPH.nodes;
  const edges = data?.edges || DEFAULT_HAM_GRAPH.edges;
  const path = data?.currentPath || [0];
  const visited = data?.visited || [0];
  const currentVertex = data?.currentVertex;
  const backtrackCount = data?.backtrackCount ?? 0;
  const isCycleFound = data?.isCycleFound ?? false;
  const action = data?.action || 'INIT';
  const description = data?.description;

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Check if edge (u, v) is in current path
  const isPathEdge = (u: number, v: number): boolean => {
    for (let i = 0; i < path.length - 1; i++) {
      if ((path[i] === u && path[i + 1] === v) || (path[i] === v && path[i + 1] === u)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div
      className="hamiltonian-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Ciclo Hamiltoniano' : 'Hamiltonian Cycle Visualizer'}
    >
      {/* Metrics Row */}
      <div className="ham-metrics-row">
        <div className="ham-metric-badge">
          <span>{language === 'es' ? 'Vértices Visitados:' : 'Visited Vertices:'}</span>
          <strong>{visited.length} / {nodes.length}</strong>
        </div>
        <div className="ham-metric-badge">
          <span>{language === 'es' ? 'Retrocesos (Backtracks):' : 'Backtracks:'}</span>
          <strong style={{ color: backtrackCount > 0 ? 'var(--warning)' : 'var(--text)' }}>
            {backtrackCount}
          </strong>
        </div>
        <div className="ham-metric-badge">
          <span>{language === 'es' ? 'Estado del Ciclo:' : 'Cycle Status:'}</span>
          <strong style={{ color: isCycleFound ? 'var(--success)' : 'var(--accent)' }}>
            {isCycleFound
              ? (language === 'es' ? 'Ciclo Verificado' : 'Cycle Verified')
              : (language === 'es' ? 'En Búsqueda' : 'Searching')}
          </strong>
        </div>
        <div className={`ham-metric-badge ham-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Canvas */}
      <div className="ham-canvas-container">
        <svg
          viewBox="0 0 500 320"
          style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label={language === 'es' ? 'Grafo y camino explorado para ciclo hamiltoniano' : 'Graph and explored path for Hamiltonian cycle'}
        >
          {/* Edges */}
          {edges.map((e, idx) => {
            const u = nodeMap.get(e.u);
            const v = nodeMap.get(e.v);
            if (!u || !v) return null;
            const inPath = isPathEdge(e.u, e.v);

            return (
              <line
                key={`edge-${e.u}-${e.v}-${idx}`}
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                stroke={inPath ? (isCycleFound ? 'var(--success)' : 'var(--accent)') : 'var(--border-strong)'}
                strokeWidth={inPath ? 3.5 : 1.5}
                strokeDasharray={inPath ? undefined : '2,2'}
                opacity={inPath ? 1 : 0.85}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isVisited = visited.includes(node.id);
            const isCurrent = currentVertex === node.id;
            const pathIndex = path.indexOf(node.id);

            return (
              <g key={`node-${node.id}`}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={18}
                  fill={
                    isCurrent
                      ? 'var(--warning-bg)'
                      : isVisited
                      ? (isCycleFound ? 'var(--success-bg)' : 'var(--accent-subtle)')
                      : 'var(--surface)'
                  }
                  stroke={isCurrent ? 'var(--warning)' : isVisited ? (isCycleFound ? 'var(--success)' : 'var(--accent)') : 'var(--border-strong)'}
                  strokeWidth={isCurrent ? 3 : 2}
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fill={isCurrent || (isVisited && isCycleFound) ? '#0f172a' : 'var(--text)'}
                  fontSize="13px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {node.label}
                </text>
                {/* Step badge if visited */}
                {pathIndex >= 0 && (
                  <text
                    x={node.x + 20}
                    y={node.y - 10}
                    fill="var(--accent)"
                    fontSize="13px"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                  >
                    #{pathIndex + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Path sequence readout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
        <span>{language === 'es' ? 'Camino actual:' : 'Current path:'}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: isCycleFound ? 'var(--success)' : 'var(--accent)' }}>
          [{path.join(' → ')}]
        </span>
      </div>

      {/* Pruning Analysis Card (Section 24) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fuerza Bruta vs. Backtracking en Ciclo Hamiltoniano:' : 'Brute Force vs. Backtracking in Hamiltonian Cycle:'}</strong>{' '}
        {language === 'es'
          ? `Evaluar todas las permutaciones posibles de vértices requeriría |V|! = ${nodes.length}! = 720 ordenamientos completos. El algoritmo con Backtracking valida la existencia de aristas consecutivas paso a paso y poda de inmediato si el candidato ya fue visitado o no tiene arista adyacente, explorando solo caminos válidos hasta verificar el ciclo.`
          : `Testing all vertex permutations requires |V|! = ${nodes.length}! = 720 full orderings. Backtracking checks adjacency step by step and prunes dead branches immediately when no edge connects the vertices or a vertex is revisited.`}
      </div>

      {/* Playback Controls */}
      <div className="trace-controls" role="toolbar" aria-label={language === 'es' ? 'Controles de reproducción' : 'Playback controls'}>
        <div className="trace-buttons">
          <button
            type="button"
            className="btn-control"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar visualización' : 'Reset visualization'}
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-control btn-play"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            aria-label={language === 'es' ? 'Siguiente paso' : 'Next step'}
          >
            →
          </button>
        </div>

        <div className="trace-scrubber">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            aria-label={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
          />
          <span className="step-counter">
            {language === 'es' ? 'Paso' : 'Step'} {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="trace-speed">
          <span>{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => setSpeed(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
