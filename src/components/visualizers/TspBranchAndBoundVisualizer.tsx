import React, { useMemo } from 'react';
import {
  generateTspBBTrace,
  TspBBStepData,
  DEFAULT_TSP_CITIES,
  DEFAULT_TSP_MATRIX
} from '../../engine/algorithms/tspBranchAndBoundTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './TspBranchAndBoundVisualizer.css';

export const TspBranchAndBoundVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateTspBBTrace(DEFAULT_TSP_CITIES, DEFAULT_TSP_MATRIX), []);

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
  } = useTraceTimeline<TspBBStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const cities = data?.cities || DEFAULT_TSP_CITIES;
  const dist = data?.distMatrix || DEFAULT_TSP_MATRIX;
  const currentTour = data?.currentTour || [0];
  const incumbentBest = data?.incumbentBest ?? Infinity;
  const prunedCount = data?.prunedCount ?? 0;
  const exploredCount = data?.exploredCount ?? 0;
  const action = data?.action || 'INIT';
  const description = data?.description;

  const cityMap = useMemo(() => new Map(cities.map((c) => [c.id, c])), [cities]);

  // Check if edge (u, v) is in currentTour
  const isTourEdge = (u: number, v: number): boolean => {
    for (let i = 0; i < currentTour.length - 1; i++) {
      if ((currentTour[i] === u && currentTour[i + 1] === v) || (currentTour[i] === v && currentTour[i + 1] === u)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div
      className="tsp-bb-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de TSP Branch and Bound' : 'TSP Branch and Bound Visualizer'}
    >
      {/* Metrics Row */}
      <div className="tsp-metrics-row">
        <div className="tsp-metric-badge">
          <span>{language === 'es' ? 'Incumbent Óptimo (UB):' : 'Optimal Incumbent (UB):'}</span>
          <strong style={{ color: incumbentBest < Infinity ? 'var(--success)' : 'var(--text-muted)' }}>
            {incumbentBest < Infinity ? incumbentBest : '∞'}
          </strong>
        </div>
        <div className="tsp-metric-badge">
          <span>{language === 'es' ? 'Nodos Podados por Cota:' : 'Pruned by Bound:'}</span>
          <strong style={{ color: 'var(--error)' }}>{prunedCount}</strong>
        </div>
        <div className="tsp-metric-badge">
          <span>{language === 'es' ? 'Nodos Explorados:' : 'Explored Nodes:'}</span>
          <strong>{exploredCount}</strong>
        </div>
        <div className="tsp-metric-badge tsp-action-badge">
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Map Canvas */}
      <div className="tsp-canvas-container">
        <svg
          viewBox="0 0 460 260"
          style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label={language === 'es' ? 'Mapa de ciudades y tour de TSP' : 'Cities map and TSP tour'}
        >
          {/* Background network edges with distance labels */}
          {cities.map((c1, i) =>
            cities.slice(i + 1).map((c2) => {
              const inTour = isTourEdge(c1.id, c2.id);
              const midX = (c1.x + c2.x) / 2;
              const midY = (c1.y + c2.y) / 2;
              const weight = dist[c1.id][c2.id];

              return (
                <g key={`tsp-edge-${c1.id}-${c2.id}`}>
                  <line
                    x1={c1.x}
                    y1={c1.y}
                    x2={c2.x}
                    y2={c2.y}
                    stroke={inTour ? 'var(--success)' : 'var(--graph-edge)'}
                    strokeWidth={inTour ? 4 : 2}
                    opacity={1}
                  />
                  <rect
                    x={midX - 13}
                    y={midY - 9}
                    width={26}
                    height={18}
                    rx={4}
                    fill="var(--surface)"
                    stroke={inTour ? 'var(--success)' : 'var(--border-strong)'}
                    strokeWidth={1.5}
                    opacity={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={inTour ? 'var(--success)' : 'var(--text)'}
                    fontSize="11px"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    {weight}
                  </text>
                </g>
              );
            })
          )}

          {/* City Nodes */}
          {cities.map((city) => {
            const inTour = currentTour.includes(city.id);
            const isStart = city.id === 0;

            return (
              <g key={`city-${city.id}`}>
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isStart ? 18 : 16}
                  fill={isStart ? 'var(--accent)' : inTour ? 'var(--success)' : 'var(--surface)'}
                  stroke={isStart ? '#ffffff' : inTour ? 'var(--success)' : 'var(--border)'}
                  strokeWidth={2}
                />
                <text
                  x={city.x}
                  y={city.y + 4}
                  textAnchor="middle"
                  fill={isStart || inTour ? '#ffffff' : 'var(--text)'}
                  fontSize="13px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {city.id}
                </text>
                <text
                  x={city.x}
                  y={city.y - 20}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontSize="13px"
                  fontWeight="600"
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Tour readout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
        <span>{language === 'es' ? 'Tour evaluado:' : 'Tour evaluated:'}</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--success)' }}>
          [{currentTour.map((cId) => cityMap.get(cId)?.name || cId).join(' → ')}]
        </span>
      </div>

      {/* TSP Branch & Bound Pruning Card (Section 24) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fuerza Bruta vs. Branch & Bound en TSP:' : 'Brute Force vs. Branch & Bound in TSP:'}</strong>{' '}
        {language === 'es'
          ? 'Evaluar todas las rutas posibles entre n ciudades requiere (n-1)!/2 recorridos exhaustivos. Branch & Bound calcula en cada nodo una cota inferior optimista (LB) basada en las aristas mínimas de salida. Si el costo acumulado + LB ≥ mejor tour completo ya hallado (incumbent), se descarta el subárbol completo, evitando evaluar millones de combinaciones inviables.'
          : 'Evaluating all permutations between n cities requires (n-1)!/2 tours. Branch & Bound calculates an optimistic lower bound (LB) using minimum outgoing edges. If current cost + LB ≥ incumbent best, the entire subtree is pruned.'}
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
