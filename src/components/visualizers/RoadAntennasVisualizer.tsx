import React, { useMemo } from 'react';
import { TraceScrubber } from '../TraceScrubber';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { generateRoadAntennasTrace, RoadAntennasTraceStep } from '../../engine/algorithms/roadAntennasTrace';
import { compute1DLabelLevels } from '../../utils/staggerLayout';
import './RoadAntennasVisualizer.css';

interface RoadAntennasVisualizerProps {
  initialHouses?: number[];
  initialRadius?: number;
}

const DEFAULT_HOUSES = [4, 12, 18, 26, 32, 45, 60, 68, 75];
const DEFAULT_RADIUS = 10;

export const RoadAntennasVisualizer: React.FC<RoadAntennasVisualizerProps> = ({
  initialHouses = DEFAULT_HOUSES,
  initialRadius = DEFAULT_RADIUS
}) => {
  const { language, t } = useLanguage();

  const timeline = useMemo(() => {
    return generateRoadAntennasTrace(initialHouses, initialRadius);
  }, [initialHouses, initialRadius]);

  const {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    isAtStart,
    isAtEnd,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    goToStep
  } = useTraceTimeline<RoadAntennasTraceStep>(timeline);

  const stepData = currentEvent?.data || timeline.events[0]?.data;
  const { houses, radius, antennas, currentHouseIndex, coveredHouseIndices, justCoveredIndices } = stepData;

  // Compute SVG scale
  const svgWidth = 840;
  const svgHeight = 220;
  const padX = 50;
  const roadY = 135;

  const maxKm = useMemo(() => {
    const all = [...houses, ...antennas];
    const m = all.length > 0 ? Math.max(...all) + radius + 10 : 100;
    return Math.ceil(m / 10) * 10;
  }, [houses, antennas, radius]);

  const kmToX = (km: number) => {
    return padX + (km / maxKm) * (svgWidth - 2 * padX);
  };

  const houseLabelLevels = useMemo(() => {
    const toX = (k: number) => padX + (k / maxKm) * (svgWidth - 2 * padX);
    const items = houses.map((km, idx) => ({ id: String(idx), x: toX(km) }));
    const levelsMap = compute1DLabelLevels(items, 38);
    const levels = new Array(houses.length).fill(0);
    for (let i = 0; i < houses.length; i++) {
      levels[i] = levelsMap[String(i)] || 0;
    }
    return levels;
  }, [houses, maxKm, padX, svgWidth]);

  const coveredSet = useMemo(() => new Set(coveredHouseIndices), [coveredHouseIndices]);
  const justCoveredSet = useMemo(() => new Set(justCoveredIndices), [justCoveredIndices]);

  return (
    <div
      className="road-antennas-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Antenas en Carretera' : 'Road Antennas Visualizer'}
    >
      {/* Top Metrics Banner */}
      <div className="road-metrics-bar">
        <div className="road-metric-item">
          <span className="road-metric-label">{language === 'es' ? 'Casas Cubiertas' : 'Covered Houses'}</span>
          <span className="road-metric-value">
            {coveredSet.size} / {houses.length}
          </span>
        </div>
        <div className="road-metric-item">
          <span className="road-metric-label">{language === 'es' ? 'Antenas Construidas' : 'Antennas Built'}</span>
          <span className="road-metric-value" style={{ color: 'var(--accent)' }}>
            {antennas.length}
          </span>
        </div>
        <div className="road-metric-item">
          <span className="road-metric-label">{language === 'es' ? 'Radio de Cobertura R' : 'Coverage Radius R'}</span>
          <span className="road-metric-value">{radius} km</span>
        </div>
        <div className="road-metric-item">
          <span className="road-metric-label">{language === 'es' ? 'Fase Algorítmica' : 'Algorithmic Phase'}</span>
          <span className="road-metric-value" style={{ fontSize: '0.95rem' }}>
            {stepData.action}
          </span>
        </div>
      </div>

      {/* SVG Visualization Canvas */}
      <div className="road-svg-container">
        <svg
          className="road-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height={svgHeight}
          aria-label={language === 'es' ? 'Visualización de carretera con antenas y casas' : 'Road visualization with antennas and houses'}
        >
          <defs>
            {/* Antenna range fill */}
            <linearGradient id="antennaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.06" />
            </linearGradient>
          </defs>

          {/* Background Sky / Landscape tint */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

          {/* Kilometer tick marks along road */}
          {Array.from({ length: Math.floor(maxKm / 10) + 1 }).map((_, idx) => {
            const km = idx * 10;
            const x = kmToX(km);
            return (
              <g key={`tick-${km}`}>
                <line x1={x} y1={roadY - 6} x2={x} y2={roadY + 20} stroke="var(--graph-edge-subtle)" strokeWidth="1.5" />
                <text
                  x={x}
                  y={roadY + 34}
                  textAnchor="middle"
                  fill="var(--color-text-muted)"
                  fontSize="13"
                  fontFamily="var(--font-sans)"
                >
                  {km}k
                </text>
              </g>
            );
          })}

          {/* The Road Surface */}
          <rect
            x={padX - 10}
            y={roadY}
            width={svgWidth - 2 * padX + 20}
            height="14"
            rx="3"
            fill="#334155"
          />
          {/* Highway dashed center line */}
          <line
            x1={padX - 5}
            y1={roadY + 7}
            x2={svgWidth - padX + 5}
            y2={roadY + 7}
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="8 6"
          />

          {/* Antennas and Coverage Spans */}
          {antennas.map((antKm, aIdx) => {
            const antX = kmToX(antKm);
            const spanLeft = kmToX(Math.max(0, antKm - radius));
            const spanRight = kmToX(antKm + radius);
            const spanWidth = Math.max(0, spanRight - spanLeft);

            return (
              <g key={`antenna-group-${aIdx}`}>
                {/* Coverage Pill / Glow */}
                <rect
                  x={spanLeft}
                  y={roadY - 45}
                  width={spanWidth}
                  height="55"
                  rx="10"
                  fill="url(#antennaGlow)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />

                {/* Coverage Span bracket marker */}
                <line
                  x1={spanLeft}
                  y1={roadY - 47}
                  x2={spanRight}
                  y2={roadY - 47}
                  stroke="var(--accent)"
                  strokeWidth="2"
                />
                <circle cx={spanLeft} cy={roadY - 47} r="3" fill="var(--accent)" />
                <circle cx={spanRight} cy={roadY - 47} r="3" fill="var(--accent)" />

                {/* Antenna Tower Pole */}
                <line x1={antX} y1={roadY} x2={antX} y2={roadY - 75} stroke="var(--accent)" strokeWidth="3" />
                {/* Antenna Tower Base */}
                <polygon
                  points={`${antX - 10},${roadY} ${antX + 10},${roadY} ${antX},${roadY - 75}`}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                />
                {/* Antenna Transmitter Tip */}
                <circle cx={antX} cy={roadY - 75} r="5" fill="var(--error)" />
                {/* Antenna Radio Waves */}
                <path
                  d={`M ${antX - 8} ${roadY - 82} A 10 10 0 0 1 ${antX + 8} ${roadY - 82}`}
                  fill="none"
                  stroke="var(--error)"
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${antX - 14} ${roadY - 88} A 16 16 0 0 1 ${antX + 14} ${roadY - 88}`}
                  fill="none"
                  stroke="var(--error)"
                  strokeWidth="1.5"
                />

                {/* Antenna Position Label */}
                <text
                  x={antX}
                  y={roadY - 96}
                  textAnchor="middle"
                  fill="var(--accent)"
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="var(--font-sans)"
                >
                  {antKm} km
                </text>
              </g>
            );
          })}

          {/* Houses on the Road */}
          {houses.map((houseKm, hIdx) => {
            const hX = kmToX(houseKm);
            const isCovered = coveredSet.has(hIdx);
            const isJustCovered = justCoveredSet.has(hIdx);
            const isCurrentUncovered = currentHouseIndex === hIdx;
            const lvl = houseLabelLevels[hIdx] || 0;
            const labelY = roadY - 27 - lvl * 16;

            let houseColor = 'var(--warning)'; // pending / uncovered
            if (isJustCovered) houseColor = '#22c55e'; // freshly covered
            else if (isCovered) houseColor = 'var(--success)'; // covered

            return (
              <g key={`house-${hIdx}`}>
                {/* Indicator arrow if current target */}
                {isCurrentUncovered && (
                  <g>
                    <path
                      d={`M ${hX} ${roadY - 32} L ${hX - 5} ${roadY - 40} L ${hX + 5} ${roadY - 40} Z`}
                      fill="var(--error)"
                    />
                    <circle cx={hX} cy={roadY - 12} r="14" fill="var(--state-conflict-bg)" stroke="var(--error)" strokeWidth="1.5" />
                  </g>
                )}

                {/* Staggered Leader line if elevated */}
                {lvl > 0 && (
                  <line
                    x1={hX}
                    y1={roadY - 24}
                    x2={hX}
                    y2={labelY + 4}
                    stroke="var(--border-strong)"
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                  />
                )}

                {/* House Base / Roof */}
                {/* Roof */}
                <polygon
                  points={`${hX - 9},${roadY - 14} ${hX + 9},${roadY - 14} ${hX},${roadY - 24}`}
                  fill={houseColor}
                />
                {/* Body */}
                <rect
                  x={hX - 7}
                  y={roadY - 14}
                  width="14"
                  height="12"
                  fill={houseColor}
                  stroke="var(--border-strong)"
                  strokeWidth="1"
                />
                {/* Door */}
                <rect x={hX - 2.5} y={roadY - 7} width="5" height="5" fill="var(--border-strong)" />

                {/* Coordinate label below tick */}
                <text
                  x={hX}
                  y={labelY}
                  textAnchor="middle"
                  fill={isCurrentUncovered ? 'var(--error)' : 'var(--color-text)'}
                  fontSize="13"
                  fontWeight={isCurrentUncovered ? 'bold' : (lvl > 0 ? '600' : 'normal')}
                  fontFamily="var(--font-sans)"
                >
                  {houseKm}k
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="road-legend">
        <div className="legend-item">
          <span className="legend-dot house-uncovered" />
          <span>{language === 'es' ? 'Casa sin cobertura' : 'Uncovered house'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot house-covered" />
          <span>{language === 'es' ? 'Casa con cobertura' : 'Covered house'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot antenna" />
          <span>{language === 'es' ? 'Antena greedy (km = x_prim + R)' : 'Greedy antenna (km = x_first + R)'}</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot antenna-range" />
          <span>{language === 'es' ? 'Rango de cobertura [a - R, a + R]' : 'Coverage span [a - R, a + R]'}</span>
        </div>
      </div>

      {/* Step Explanation Card */}
      <div className="step-explanation-box">
        <strong>{language === 'es' ? `Paso ${currentStepIndex + 1} de ${totalSteps}: ` : `Step ${currentStepIndex + 1} of ${totalSteps}: `}</strong>
        {t(stepData.description)}
      </div>

      {/* Greedy Stays Ahead Rationale Card */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento Teórico: Invariante Greedy Stays Ahead:' : 'Theoretical Rationale: Greedy Stays Ahead:'}</strong>{' '}
        {language === 'es'
          ? 'Para cubrir la primera casa no cubierta x_i, cualquier solución factible debe colocar una antena en alguna posición p ≤ x_i + R. Situar la antena exactamente en el extremo derecho p = x_i + R cubre obligatoriamente a x_i y extiende el alcance derecho hasta x_i + 2R, el máximo matemáticamente alcanzable. Por argumento de intercambio, cualquier antena de una solución óptima en p < x_i + R puede desplazarse hacia la derecha a x_i + R sin dejar desprotegida a x_i y aumentando o manteniendo la cobertura sobre todas las casas subsiguientes.'
          : 'To cover the leftmost uncovered house x_i, any valid solution must locate a base station at some p ≤ x_i + R. Placing it at the rightmost boundary p = x_i + R covers x_i while maximizing rightward reach up to x_i + 2R. By exchange argument, any antenna in an optimal solution placed at p < x_i + R can be shifted right to x_i + R without exposing x_i, matching or exceeding coverage on all subsequent houses.'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          className="ctrl-btn"
          onClick={stepBackward}
          disabled={isAtStart}
          title={language === 'es' ? 'Paso anterior (←)' : 'Previous step (←)'}
          aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
        >
          ←
        </button>
        <button
          type="button"
          className={`ctrl-btn play-btn ${isPlaying ? 'is-playing' : ''}`}
          onClick={isPlaying ? pause : play}
          title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
          aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          className="ctrl-btn"
          onClick={stepForward}
          disabled={isAtEnd}
          title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
          aria-label={language === 'es' ? 'Paso siguiente' : 'Next step'}
        >
          →
        </button>
        <button
          type="button"
          className="ctrl-btn"
          onClick={reset}
          title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
          aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
        >
          ↺
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="road-timeline-slider" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Paso:' : 'Step:'}
          </label>
          <TraceScrubber
            id="road-timeline-slider"
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSeek={goToStep}
            language={language}
            showCounter={false}
            ariaLabel={language === 'es' ? 'Control de línea de tiempo' : 'Timeline scrubber'}
          />
          <div className="segmented-control speed-segmented-control" role="group" aria-label={language === 'es' ? 'Velocidad de reproducción' : 'Playback speed'}>
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
