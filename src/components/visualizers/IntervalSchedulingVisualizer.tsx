import React, { useMemo } from 'react';
import {
  generateIntervalSchedulingTrace,
  IntervalSchedulingStepData
} from '../../engine/algorithms/intervalSchedulingTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import './IntervalSchedulingVisualizer.css';

export const IntervalSchedulingVisualizer: React.FC = () => {
  const timeline = useMemo(() => generateIntervalSchedulingTrace(), []);

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
  } = useTraceTimeline<IntervalSchedulingStepData>(timeline, { baseIntervalMs: 800, enableKeyboardShortcuts: true });

  const data = currentEvent?.data;
  const intervals = data?.allIntervals || [];
  const selectedIds = data?.selectedIds || [];
  const rejectedIds = data?.rejectedIds || [];
  const currentIndex = data?.currentIndex ?? -1;

  // Compute time bounds for SVG coordinate mapping
  const maxTime = 10;
  const minTime = 0;
  const timeSpan = maxTime - minTime;

  const svgWidth = 600;
  const svgHeight = intervals.length * 40 + 40;
  const paddingLeft = 60;
  const paddingRight = 40;
  const usableWidth = svgWidth - paddingLeft - paddingRight;

  const getX = (time: number) => paddingLeft + (time / timeSpan) * usableWidth;

  return (
    <div className="interval-visualizer-card">
      <div className="visualizer-header-bar">
        <h4>Programación Greedy por Fin Más Temprano</h4>
        <div className="stats-badges">
          <span className="stat-badge stat-solution">
            <span className="stat-num">{selectedIds.length}</span>
            <span className="stat-label">Seleccionados</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{rejectedIds.length}</span>
            <span className="stat-label">Descartados</span>
          </span>
        </div>
      </div>

      <div className={`step-narrative-banner ${currentEvent?.type || 'init'}`}>
        <span className="step-tag">Paso {currentStepIndex + 1} / {totalSteps}</span>
        <p className="step-message-text">
          {currentEvent?.message?.es || 'Iniciando evaluación...'}
        </p>
      </div>

      {/* SVG Timeline Canvas */}
      <div className="interval-chart-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="interval-chart-svg"
          role="img"
          aria-label="Gráfico de intervalos de tiempo"
        >
          {/* Time axis grid lines */}
          {Array.from({ length: maxTime + 1 }).map((_, t) => (
            <g key={t} className="time-grid-col">
              <line
                x1={getX(t)}
                y1={10}
                x2={getX(t)}
                y2={svgHeight - 20}
                className="grid-line"
              />
              <text x={getX(t)} y={svgHeight - 5} className="axis-label" textAnchor="middle">
                {t}h
              </text>
            </g>
          ))}

          {/* Last end-time marker (barrier for compatibility) */}
          {data && data.lastEndTime > -Infinity && (
            <line
              x1={getX(data.lastEndTime)}
              y1={5}
              x2={getX(data.lastEndTime)}
              y2={svgHeight - 20}
              className="last-end-barrier"
            />
          )}

          {/* Interval Bars */}
          {intervals.map((task, idx) => {
            const y = 20 + idx * 36;
            const x1 = getX(task.start);
            const x2 = getX(task.end);
            const width = Math.max(10, x2 - x1);

            const isSelected = selectedIds.includes(task.id);
            const isRejected = rejectedIds.includes(task.id);
            const isEvaluating = currentIndex === idx;

            let barClass = 'interval-bar';
            if (isSelected) barClass += ' bar-selected';
            else if (isRejected) barClass += ' bar-rejected';
            else if (isEvaluating) barClass += ' bar-evaluating';

            return (
              <g key={task.id} className="interval-row">
                {/* Task identifier label */}
                <text x={10} y={y + 16} className="task-row-label">
                  {task.id}
                </text>

                {/* Interval bar */}
                <rect
                  x={x1}
                  y={y}
                  width={width}
                  height={24}
                  rx={4}
                  className={barClass}
                />

                {/* Text inside bar: [start -> end] */}
                <text x={x1 + width / 2} y={y + 16} className="bar-text" textAnchor="middle">
                  {task.start} – {task.end}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Playback Controls Toolbar */}
      <div className="timeline-toolbar">
        <div className="timeline-scrubber">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="scrubber-slider"
            aria-label="Línea de tiempo"
          />
        </div>

        <div className="toolbar-buttons-row">
          <div className="playback-group">
            <button type="button" className="ctrl-btn" onClick={reset} title="Reiniciar">
              ⏮
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={stepBackward}
              disabled={currentStepIndex === 0}
              title="Paso anterior"
            >
              ◀
            </button>
            <button
              type="button"
              className={`ctrl-btn play-btn ${isPlaying ? 'is-playing' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={stepForward}
              disabled={currentStepIndex >= totalSteps - 1}
              title="Paso siguiente"
            >
              ▶
            </button>
          </div>

          <div className="speed-group">
            <span className="speed-label">Velocidad:</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                className={`speed-btn ${playbackSpeed === spd ? 'active' : ''}`}
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
