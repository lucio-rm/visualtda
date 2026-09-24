import React, { useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { generateRoadAntennasTrace, RoadAntennasTraceStep } from '../../engine/algorithms/roadAntennasTrace';
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

  const coveredSet = useMemo(() => new Set(coveredHouseIndices), [coveredHouseIndices]);
  const justCoveredSet = useMemo(() => new Set(justCoveredIndices), [justCoveredIndices]);

  return (
    <div className="road-antennas-visualizer">
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
          <span className="road-metric-value" style={{ color: '#6366f1' }}>
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
          aria-label="Visualización de carretera con antenas y casas"
        >
          <defs>
            {/* Antenna range gradient */}
            <linearGradient id="antennaGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.08" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Sky / Landscape tint */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

          {/* Kilometer tick marks along road */}
          {Array.from({ length: Math.floor(maxKm / 10) + 1 }).map((_, idx) => {
            const km = idx * 10;
            const x = kmToX(km);
            return (
              <g key={`tick-${km}`}>
                <line x1={x} y1={roadY - 6} x2={x} y2={roadY + 20} stroke="var(--color-border)" strokeWidth="1" />
                <text
                  x={x}
                  y={roadY + 34}
                  textAnchor="middle"
                  fill="var(--color-text-muted)"
                  fontSize="10"
                  fontFamily="sans-serif"
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
                  stroke="#6366f1"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />

                {/* Coverage Span bracket marker */}
                <line
                  x1={spanLeft}
                  y1={roadY - 47}
                  x2={spanRight}
                  y2={roadY - 47}
                  stroke="#6366f1"
                  strokeWidth="2"
                />
                <circle cx={spanLeft} cy={roadY - 47} r="3" fill="#6366f1" />
                <circle cx={spanRight} cy={roadY - 47} r="3" fill="#6366f1" />

                {/* Antenna Tower Pole */}
                <line x1={antX} y1={roadY} x2={antX} y2={roadY - 75} stroke="#6366f1" strokeWidth="3" />
                {/* Antenna Tower Base */}
                <polygon
                  points={`${antX - 10},${roadY} ${antX + 10},${roadY} ${antX},${roadY - 75}`}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="1.5"
                />
                {/* Antenna Transmitter Tip */}
                <circle cx={antX} cy={roadY - 75} r="5" fill="#ef4444" filter="url(#glow)" />
                {/* Antenna Radio Waves */}
                <path
                  d={`M ${antX - 8} ${roadY - 82} A 10 10 0 0 1 ${antX + 8} ${roadY - 82}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <path
                  d={`M ${antX - 14} ${roadY - 88} A 16 16 0 0 1 ${antX + 14} ${roadY - 88}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />

                {/* Antenna Position Label */}
                <text
                  x={antX}
                  y={roadY - 96}
                  textAnchor="middle"
                  fill="#6366f1"
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="sans-serif"
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

            let houseColor = '#f59e0b'; // pending / uncovered
            if (isJustCovered) houseColor = '#22c55e'; // freshly covered
            else if (isCovered) houseColor = '#10b981'; // covered

            return (
              <g key={`house-${hIdx}`}>
                {/* Indicator arrow if current target */}
                {isCurrentUncovered && (
                  <g>
                    <path
                      d={`M ${hX} ${roadY - 32} L ${hX - 5} ${roadY - 40} L ${hX + 5} ${roadY - 40} Z`}
                      fill="#ef4444"
                    />
                    <circle cx={hX} cy={roadY - 12} r="14" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5" />
                  </g>
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
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                {/* Door */}
                <rect x={hX - 2.5} y={roadY - 7} width="5" height="5" fill="#1e293b" />

                {/* Coordinate label below tick */}
                <text
                  x={hX}
                  y={roadY - 27}
                  textAnchor="middle"
                  fill={isCurrentUncovered ? '#ef4444' : 'var(--color-text)'}
                  fontSize="10"
                  fontWeight={isCurrentUncovered ? 'bold' : 'normal'}
                  fontFamily="sans-serif"
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

      {/* Timeline Controls */}
      <div className="timeline-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={stepBackward}
          disabled={isAtStart}
          title={language === 'es' ? 'Paso anterior (←)' : 'Previous step (←)'}
        >
          {language === 'es' ? '← Anterior' : '← Previous'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={isPlaying ? pause : play}
          title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
        >
          {isPlaying ? (language === 'es' ? '❚❚ Pausa' : '❚❚ Pause') : (language === 'es' ? '▶ Reproducir' : '▶ Play')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={stepForward}
          disabled={isAtEnd}
          title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
        >
          {language === 'es' ? 'Siguiente →' : 'Next →'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={reset}
          title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
        >
          {language === 'es' ? '↺ Reiniciar' : '↺ Reset'}
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="road-timeline-slider" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Paso:' : 'Step:'}
          </label>
          <input
            id="road-timeline-slider"
            type="range"
            min="0"
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            style={{ width: '130px' }}
          />
          <select
            value={playbackSpeed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="form-control"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
          >
            <option value={0.6}>0.6x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
};
