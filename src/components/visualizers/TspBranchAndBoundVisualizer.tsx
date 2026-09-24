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
      aria-label="Visualizador de TSP Branch and Bound"
    >
      {/* Metrics Row */}
      <div className="tsp-metrics-row">
        <div className="tsp-metric-badge">
          <span>{language === 'es' ? 'Incumbent Óptimo (UB):' : 'Optimal Incumbent (UB):'}</span>
          <strong style={{ color: incumbentBest < Infinity ? '#10b981' : 'var(--text-muted)' }}>
            {incumbentBest < Infinity ? incumbentBest : '∞'}
          </strong>
        </div>
        <div className="tsp-metric-badge">
          <span>{language === 'es' ? 'Nodos Podados por Cota:' : 'Pruned by Bound:'}</span>
          <strong style={{ color: '#ef4444' }}>{prunedCount}</strong>
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
          style={{ width: '100%', maxWidth: '460px', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Mapa de ciudades y tour de TSP"
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
                    stroke={inTour ? '#10b981' : 'var(--border)'}
                    strokeWidth={inTour ? 3.5 : 1}
                    strokeDasharray={inTour ? undefined : '2,3'}
                    opacity={inTour ? 1 : 0.4}
                  />
                  {!inTour && (
                    <text
                      x={midX}
                      y={midY}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9px"
                      fontFamily="var(--font-mono)"
                    >
                      {weight}
                    </text>
                  )}
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
                  r={isStart ? 16 : 14}
                  fill={isStart ? 'var(--accent)' : inTour ? '#10b981' : 'var(--surface)'}
                  stroke={isStart ? '#ffffff' : inTour ? '#10b981' : 'var(--border)'}
                  strokeWidth={2}
                />
                <text
                  x={city.x}
                  y={city.y + 4}
                  textAnchor="middle"
                  fill={isStart || inTour ? '#0f172a' : 'var(--text)'}
                  fontSize="11px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {city.id}
                </text>
                <text
                  x={city.x}
                  y={city.y - 18}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontSize="11px"
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
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: '#10b981' }}>
          [{currentTour.map((cId) => cityMap.get(cId)?.name || cId).join(' → ')}]
        </span>
      </div>

      {/* Playback Controls */}
      <div className="trace-controls" role="toolbar" aria-label="Controles de reproducción">
        <div className="trace-buttons">
          <button
            type="button"
            className="btn-control"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar visualización' : 'Reset visualization'}
          >
            ⏮
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ⏪
          </button>
          <button
            type="button"
            className="btn-control btn-play"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            aria-label={language === 'es' ? 'Siguiente paso' : 'Next step'}
          >
            ⏩
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
