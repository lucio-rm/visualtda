import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { generateNQueensTrace, NQueensStepData } from '../../engine/algorithms/nQueensTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { NQueensBoard } from './NQueensBoard';
import './NQueensVisualizer.css';

export interface NQueensVisualizerProps {
  initialN?: number;
}

export const NQueensVisualizer: React.FC<NQueensVisualizerProps> = ({ initialN = 4 }) => {
  const { language } = useLanguage();
  const [n, setN] = useState<number>(initialN);
  const [showGrowthAnalysis, setShowGrowthAnalysis] = useState<boolean>(false);

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
    <div
      className="nqueens-visualizer-card"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de N-Reinas' : 'N-Queens Visualizer'}
    >
      {/* Top Configuration Bar */}
      <div className="visualizer-header-bar">
        <div className="board-size-selector">
          <label htmlFor="n-select" className="selector-label">
            {language === 'es' ? 'Tamaño del Tablero (N):' : 'Board Size (N):'}
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
            <option value={4}>N = 4 ({language === 'es' ? '2 soluciones' : '2 solutions'})</option>
            <option value={5}>N = 5 ({language === 'es' ? '10 soluciones' : '10 solutions'})</option>
            <option value={6}>N = 6 ({language === 'es' ? '4 soluciones' : '4 solutions'})</option>
            <option value={8}>N = 8 ({language === 'es' ? '92 soluciones' : '92 solutions'})</option>
          </select>
        </div>

        {/* Live Metrics Counters */}
        <div className="stats-badges">
          <span className="stat-badge">
            <span className="stat-num">{currentData?.totalStatesVisited ?? 0}</span>
            <span className="stat-label">{language === 'es' ? 'Estados' : 'States'}</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{currentData?.totalBacktracks ?? 0}</span>
            <span className="stat-label">{language === 'es' ? 'Podas/Retrocesos' : 'Prunes/Backtracks'}</span>
          </span>
          <span className="stat-badge stat-solution">
            <span className="stat-num">{currentData?.solutionsFound ?? 0}</span>
            <span className="stat-label">{language === 'es' ? 'Soluciones' : 'Solutions'}</span>
          </span>
        </div>
      </div>

      {/* Educational Step Message Banner */}
      <div className={`step-narrative-banner ${currentEvent?.type || 'init'}`}>
        <span className="step-tag">
          {language === 'es' ? `Paso ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <p className="step-message-text">
          {language === 'es'
            ? currentEvent?.message?.es || 'Preparando tablero...'
            : currentEvent?.message?.en || 'Preparing board...'}
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
            aria-label={language === 'es' ? 'Línea de tiempo de ejecución' : 'Execution timeline'}
          />
        </div>

        <div className="toolbar-buttons-row">
          <div className="playback-group">
            <button
              type="button"
              className="ctrl-btn"
              onClick={reset}
              title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
              aria-label={language === 'es' ? 'Reiniciar ejecución' : 'Reset execution'}
            >
              ↺
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={stepBackward}
              disabled={currentStepIndex === 0}
              title={language === 'es' ? 'Paso anterior (←)' : 'Step backward (←)'}
              aria-label={language === 'es' ? 'Paso anterior' : 'Step backward'}
            >
              ←
            </button>
            <button
              type="button"
              className={`ctrl-btn play-btn ${isPlaying ? 'is-playing' : ''}`}
              onClick={togglePlay}
              title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
              aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={stepForward}
              disabled={currentStepIndex >= totalSteps - 1}
              title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
              aria-label={language === 'es' ? 'Paso siguiente' : 'Next step'}
            >
              →
            </button>
          </div>

          <div className="speed-group">
            <span className="speed-label">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
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

      {/* "What happens when N increases?" Growth Comparison Panel */}
      <div className="nqueens-growth-section">
        <button
          type="button"
          className="btn-growth-toggle"
          onClick={() => setShowGrowthAnalysis((v) => !v)}
          aria-expanded={showGrowthAnalysis}
        >
          {showGrowthAnalysis ? '▲ ' : '▼ '}
          {language === 'es'
            ? '¿Qué pasa al crecer N? (Análisis de Crecimiento y Poda)'
            : 'What happens when N increases? (Growth & Pruning Analysis)'}
        </button>

        {showGrowthAnalysis && (
          <div className="nqueens-growth-card">
            <p className="growth-card-intro">
              {language === 'es'
                ? 'El espacio de búsqueda de fuerza bruta ingenua explora Nᴺ estados, y la búsqueda sobre permutaciones explora N! estados. Observa cómo la poda temprana (Backtracking) reduce drásticamente el espacio a una fracción minúscula:'
                : 'Naive brute-force search explores Nᴺ configurations, and permutation testing explores N! states. Observe how early constraint pruning (Backtracking) drastically reduces the search tree to a tiny fraction:'}
            </p>
            <div className="growth-table-wrap">
              <table className="growth-table">
                <thead>
                  <tr>
                    <th>N</th>
                    <th>{language === 'es' ? 'Fuerza Bruta (Nᴺ)' : 'Brute Force (Nᴺ)'}</th>
                    <th>{language === 'es' ? 'Permutaciones (N!)' : 'Permutations (N!)'}</th>
                    <th>{language === 'es' ? 'Estados con Poda' : 'Pruned States'}</th>
                    <th>{language === 'es' ? 'Soluciones' : 'Solutions'}</th>
                    <th>{language === 'es' ? 'Poda / Reducción' : 'Pruning Efficiency'}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { nVal: 4, brute: '256', perm: '24', states: '17', sols: '2', reduction: '> 93%' },
                    { nVal: 5, brute: '3,125', perm: '120', states: '54', sols: '10', reduction: '> 98%' },
                    { nVal: 6, brute: '46,656', perm: '720', states: '153', sols: '4', reduction: '> 99.6%' },
                    { nVal: 7, brute: '823,543', perm: '5,040', states: '552', sols: '40', reduction: '> 99.9%' },
                    { nVal: 8, brute: '16,777,216', perm: '40,320', states: '2,057', sols: '92', reduction: '> 99.98%' }
                  ].map((row) => (
                    <tr key={row.nVal} className={row.nVal === n ? 'active-n-row' : ''}>
                      <td><strong>{row.nVal} × {row.nVal}</strong></td>
                      <td>{row.brute}</td>
                      <td>{row.perm}</td>
                      <td><strong style={{ color: 'var(--color-primary, #6366f1)' }}>{row.states}</strong></td>
                      <td><span className="badge-solutions">{row.sols}</span></td>
                      <td><span className="badge-reduction">{row.reduction}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="growth-card-footer">
              {language === 'es'
                ? 'Nota de complejidad: Para N = 8, una búsqueda exhaustiva necesitaría evaluar más de 16 millones de casillas. El algoritmo con poda por columnas y diagonales resuelve el problema explorando solo 2.057 estados.'
                : 'Complexity note: For N = 8, naive brute force would test over 16 million grids. Early column and diagonal pruning resolves the problem exploring just 2,057 states.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
