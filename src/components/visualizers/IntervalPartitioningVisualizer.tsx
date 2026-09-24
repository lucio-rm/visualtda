import React, { useMemo } from 'react';
import {
  generateIntervalPartitioningTrace,
  IntervalPartitioningStepData,
  DEFAULT_LECTURES
} from '../../engine/algorithms/intervalPartitioningTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './IntervalPartitioningVisualizer.css';

export const IntervalPartitioningVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateIntervalPartitioningTrace(DEFAULT_LECTURES), []);

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
  } = useTraceTimeline<IntervalPartitioningStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const depth = data?.depth ?? 3;
  const classrooms = data?.classrooms || [];
  const currentInterval = data?.currentInterval;
  const currentTimeMarker = data?.currentTimeMarker;
  const action = data?.action || 'INIT';
  const description = data?.description;

  // Coordinate scales for SVG timeline
  const minTime = 8.5;
  const maxTime = 16.5;
  const svgWidth = 600;
  const svgHeight = 260;
  const marginLeft = 80;
  const marginRight = 30;
  const marginTop = 40;
  const chartWidth = svgWidth - marginLeft - marginRight;

  const timeToX = (t: number) => marginLeft + ((t - minTime) / (maxTime - minTime)) * chartWidth;

  const rowHeight = 44;
  const numRows = Math.max(3, depth + 1);

  return (
    <div
      className="interval-partitioning-visualizer"
      role="region"
      aria-label="Visualizador de Partición de Intervalos"
    >
      {/* Metrics Row */}
      <div className="ip-metrics-row">
        <div className="ip-metric-badge">
          <span>{language === 'es' ? 'Profundidad (d):' : 'Max Depth (d):'}</span>
          <strong>{depth}</strong>
        </div>
        <div className="ip-metric-badge">
          <span>{language === 'es' ? 'Aulas Abiertas:' : 'Classrooms Opened:'}</span>
          <strong>{classrooms.length} / {depth}</strong>
        </div>
        <div className={`ip-metric-badge ip-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Timeline Canvas */}
      <div className="ip-canvas-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', maxWidth: '600px', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Diagrama temporal de asignación de aulas"
        >
          {/* Time axis ticks & vertical gridlines */}
          {[9, 10, 11, 12, 13, 14, 15, 16].map((hour) => {
            const x = timeToX(hour);
            return (
              <g key={`tick-${hour}`}>
                <line
                  x1={x}
                  y1={marginTop - 10}
                  x2={x}
                  y2={marginTop + numRows * rowHeight}
                  stroke="var(--border)"
                  strokeDasharray="2,3"
                  opacity={0.6}
                />
                <text
                  x={x}
                  y={marginTop - 16}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="11px"
                  fontFamily="var(--font-mono)"
                >
                  {hour}:00
                </text>
              </g>
            );
          })}

          {/* Classroom lanes */}
          {Array.from({ length: numRows }).map((_, rIdx) => {
            const y = marginTop + rIdx * rowHeight;
            const roomId = rIdx + 1;
            const room = classrooms.find((c) => c.id === roomId);

            return (
              <g key={`lane-${roomId}`}>
                <rect
                  x={marginLeft}
                  y={y}
                  width={chartWidth}
                  height={rowHeight - 6}
                  fill={room ? 'var(--surface-active, rgba(56, 189, 248, 0.04))' : 'transparent'}
                  stroke="var(--border)"
                  strokeWidth={1}
                  rx={4}
                />
                <text
                  x={marginLeft - 12}
                  y={y + (rowHeight - 6) / 2 + 4}
                  textAnchor="end"
                  fill={room ? 'var(--text)' : 'var(--text-muted)'}
                  fontSize="12px"
                  fontWeight={room ? '600' : '400'}
                  fontFamily="var(--font-mono)"
                >
                  {language === 'es' ? `Aula ${roomId}` : `Room ${roomId}`}
                </text>
              </g>
            );
          })}

          {/* Placed Intervals */}
          {classrooms.map((room) => {
            const y = marginTop + (room.id - 1) * rowHeight + 4;
            const h = rowHeight - 14;

            return room.assignedIds.map((lectureId) => {
              const lecture = data?.intervals.find((iv) => iv.id === lectureId);
              if (!lecture) return null;

              const x1 = timeToX(lecture.start);
              const x2 = timeToX(lecture.end);
              const w = Math.max(8, x2 - x1);
              const isSelected = currentInterval?.id === lecture.id;

              return (
                <g key={`placed-${room.id}-${lecture.id}`}>
                  <rect
                    x={x1}
                    y={y}
                    width={w}
                    height={h}
                    rx={4}
                    fill={lecture.color}
                    fillOpacity={0.85}
                    stroke={isSelected ? '#ffffff' : 'none'}
                    strokeWidth={isSelected ? 2.5 : 0}
                  />
                  <text
                    x={x1 + 6}
                    y={y + h / 2 + 4}
                    fill="#0f172a"
                    fontSize="11px"
                    fontWeight="700"
                    fontFamily="sans-serif"
                    clipPath={`url(#clip-${lecture.id})`}
                  >
                    {lecture.name} [{lecture.start}-{lecture.end}]
                  </text>
                </g>
              );
            });
          })}

          {/* Current time marker if inspecting */}
          {typeof currentTimeMarker === 'number' && (
            <line
              x1={timeToX(currentTimeMarker)}
              y1={marginTop - 15}
              x2={timeToX(currentTimeMarker)}
              y2={marginTop + numRows * rowHeight}
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="4,2"
            />
          )}
        </svg>
      </div>

      {/* Classroom Legend */}
      <div className="ip-classrooms-legend" aria-label="Aulas activas">
        {classrooms.map((cr) => (
          <span key={`legend-${cr.id}`} className="ip-room-pill">
            <span className="ip-room-dot" style={{ backgroundColor: cr.color }} />
            <span>
              <strong>{cr.label}</strong>: {cr.assignedIds.length}{' '}
              {language === 'es' ? 'clases' : 'lectures'}
            </span>
          </span>
        ))}
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
