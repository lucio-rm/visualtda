import React, { useState, useMemo } from 'react';
import { generateNQueensTrace, NQueensStepData } from '../../engine/algorithms/nQueensTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { NQueensBoard } from './NQueensBoard';
import './NQueensVisualizer.css';

export interface NQueensVisualizerProps {
  initialN?: number;
}

export const NQueensVisualizer: React.FC<NQueensVisualizerProps> = ({ initialN = 4 }) => {
  const [n, setN] = useState<number>(initialN);

  // Memoize generated trace timeline based on N
  const timeline = useMemo(() => {
    return generateNQueensTrace(n);
  }, [n]);

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
  } = useTraceTimeline<NQueensStepData>(timeline, { baseIntervalMs: 600, enableKeyboardShortcuts: true });

  const currentData = currentEvent?.data;
  const board = currentData?.board || new Array(n).fill(-1);

  return (
    <div className="nqueens-visualizer-card">
      {/* Top Configuration Bar */}
      <div className="visualizer-header-bar">
        <div className="board-size-selector">
          <label htmlFor="n-select" className="selector-label">
            Tamaño del Tablero (N):
          </label>
          <select
            id="n-select"
            className="n-select-input"
            value={n}
            onChange={(e) => {
              setN(Number(e.target.value));
              reset();
            }}
          >
            <option value={4}>N = 4 (2 soluciones)</option>
            <option value={5}>N = 5 (10 soluciones)</option>
            <option value={6}>N = 6 (4 soluciones)</option>
            <option value={8}>N = 8 (92 soluciones)</option>
          </select>
        </div>

        {/* Live Metrics Counters */}
        <div className="stats-badges">
          <span className="stat-badge">
            <span className="stat-num">{currentData?.totalStatesVisited ?? 0}</span>
            <span className="stat-label">Estados</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{currentData?.totalBacktracks ?? 0}</span>
            <span className="stat-label">Podas/Retrocesos</span>
          </span>
          <span className="stat-badge stat-solution">
            <span className="stat-num">{currentData?.solutionsFound ?? 0}</span>
            <span className="stat-label">Soluciones</span>
          </span>
        </div>
      </div>

      {/* Educational Step Message Banner */}
      <div className={`step-narrative-banner ${currentEvent?.type || 'init'}`}>
        <span className="step-tag">Paso {currentStepIndex + 1} / {totalSteps}</span>
        <p className="step-message-text">
          {currentEvent?.message?.es || 'Preparando tablero...'}
        </p>
      </div>

      {/* Central Visualizer Area */}
      <div className="visualizer-stage">
        <NQueensBoard
          n={n}
          board={board}
          currentRow={currentData?.currentRow}
          currentCol={currentData?.currentCol}
          conflictWith={currentData?.conflictWith}
          isSolution={currentData?.isSolution}
        />
      </div>

      {/* Playback Controls Toolbar */}
      <div className="timeline-toolbar">
        {/* Scrubber slider */}
        <div className="timeline-scrubber">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="scrubber-slider"
            aria-label="Línea de tiempo de ejecución"
          />
        </div>

        <div className="toolbar-buttons-row">
          <div className="playback-group">
            <button
              type="button"
              className="ctrl-btn"
              onClick={reset}
              title="Reiniciar (Inicio)"
              aria-label="Reiniciar ejecución"
            >
              ⏮
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={stepBackward}
              disabled={currentStepIndex === 0}
              title="Paso anterior"
              aria-label="Paso anterior"
            >
              ◀
            </button>
            <button
              type="button"
              className={`ctrl-btn play-btn ${isPlaying ? 'is-playing' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? 'Pausar' : 'Reproducir'}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={stepForward}
              disabled={currentStepIndex >= totalSteps - 1}
              title="Paso siguiente"
              aria-label="Paso siguiente"
            >
              ▶
            </button>
          </div>

          <div className="speed-group">
            <span className="speed-label">Velocidad:</span>
            {[0.5, 1, 2, 4].map((spd) => (
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
