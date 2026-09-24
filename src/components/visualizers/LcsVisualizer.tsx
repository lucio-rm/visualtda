import React, { useMemo } from 'react';
import {
  generateLcsTrace,
  LcsStepData,
  DEFAULT_LCS_S1,
  DEFAULT_LCS_S2
} from '../../engine/algorithms/lcsTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './LcsVisualizer.css';

export const LcsVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(() => generateLcsTrace(DEFAULT_LCS_S1, DEFAULT_LCS_S2), []);

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
  } = useTraceTimeline<LcsStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const s1 = data?.s1 || DEFAULT_LCS_S1;
  const s2 = data?.s2 || DEFAULT_LCS_S2;
  const dp = data?.dp || [];
  const currentI = data?.currentI ?? null;
  const currentJ = data?.currentJ ?? null;
  const reconstructed = data?.reconstructed || '';
  const path = data?.reconstructionPath || [];
  const action = data?.action || 'INIT';

  const isPathCell = (i: number, j: number) => {
    return path.some(([pi, pj]) => pi === i && pj === j);
  };

  return (
    <div className="lcs-visualizer">
      {/* Top Header */}
      <div className="visualizer-header">
        <div className="phase-indicator">
          <span className="phase-badge-label">
            {language === 'es' ? 'Fase DP:' : 'DP Phase:'}
          </span>
          <span className="phase-badge-name">{action.replace(/_/g, ' ')}</span>
        </div>
        <div className="status-counter">
          {language === 'es' ? 'LCS Reconstruido:' : 'Reconstructed LCS:'}{' '}
          <strong className="lcs-highlight">"{reconstructed}"</strong>{' '}
          <span className="length-tag">({reconstructed.length} chars)</span>
        </div>
      </div>

      {/* Strings Comparison Banner */}
      <div className="strings-banner">
        <div className="string-pill">
          <span className="pill-name">s1 (filas):</span>
          <div className="chars-row">
            {s1.split('').map((char, idx) => {
              const isActive = currentI !== null && idx === currentI - 1;
              return (
                <span
                  key={idx}
                  className={`char-box ${isActive ? 'char-active' : ''}`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>

        <div className="string-pill">
          <span className="pill-name">s2 (columnas):</span>
          <div className="chars-row">
            {s2.split('').map((char, idx) => {
              const isActive = currentJ !== null && idx === currentJ - 1;
              return (
                <span
                  key={idx}
                  className={`char-box ${isActive ? 'char-active' : ''}`}
                >
                  {char}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2D DP Matrix Table */}
      <div className="table-wrapper">
        <div className="table-title">
          {language === 'es'
            ? 'Tabla de Estados 2D: dp[i][j] = Longitud LCS(s1[0..i-1], s2[0..j-1])'
            : '2D State Table: dp[i][j] = Length of LCS(s1[0..i-1], s2[0..j-1])'}
        </div>
        <div className="lcs-grid-container">
          <table className="lcs-matrix">
            <thead>
              <tr>
                <th className="th-corner">i \ j</th>
                <th className="th-char">ε</th>
                {s2.split('').map((c, j) => (
                  <th
                    key={j}
                    className={`th-char ${currentJ === j + 1 ? 'th-active' : ''}`}
                  >
                    {c}
                    <span className="col-idx">{j + 1}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dp.map((row, i) => {
                const rowChar = i === 0 ? 'ε' : s1[i - 1];
                const isCurrentRow = currentI === i;
                return (
                  <tr key={i}>
                    <th className={`th-row-char ${isCurrentRow ? 'th-active' : ''}`}>
                      {rowChar}
                      <span className="row-idx">{i}</span>
                    </th>
                    {row.map((val, j) => {
                      const isCurrent = currentI === i && currentJ === j;
                      const inPath = isPathCell(i, j);
                      const isMatch =
                        action === 'MATCH_DIAGONAL' &&
                        currentI === i &&
                        currentJ === j;
                      const isAntecedent =
                        (action === 'MATCH_DIAGONAL' && currentI === i + 1 && currentJ === j + 1) ||
                        (action === 'MAX_MISMATCH' && ((currentI === i + 1 && currentJ === j) || (currentI === i && currentJ === j + 1)));

                      let cellClass = 'lcs-cell';
                      if (isCurrent) cellClass += ' current-cell';
                      if (isAntecedent) cellClass += ' antecedent-cell';
                      if (inPath) cellClass += ' path-cell';
                      if (isMatch) cellClass += ' match-cell';

                      return (
                        <td key={j} className={cellClass}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Recurrence Subproblem Box */}
      {currentI !== null && currentJ !== null && (action === 'MATCH_DIAGONAL' || action === 'MAX_MISMATCH') && (
        <div
          className="lcs-formula-callout"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '0.65rem 1rem',
            fontSize: '0.88rem',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem'
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {language === 'es' ? 'Recurrencia de Subproblemas en evaluación:' : 'Subproblem Recurrence under evaluation:'}
          </div>
          {action === 'MATCH_DIAGONAL' ? (
            <div>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>dp[{currentI}][{currentJ}]</span>
              {' = '}
              <span>dp[{currentI - 1}][{currentJ - 1}] + 1</span>
              {' = '}
              <span style={{ color: '#10b981', fontWeight: 600 }}>{(dp[currentI - 1]?.[currentJ - 1] ?? 0) + 1}</span>
              {' '}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                ({language === 'es' ? `coincidencia '${s1[currentI - 1]}'` : `match '${s1[currentI - 1]}'`})
              </span>
            </div>
          ) : (
            <div>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>dp[{currentI}][{currentJ}]</span>
              {' = '}
              <span>max(dp[{currentI - 1}][{currentJ}], dp[{currentI}][{currentJ - 1}])</span>
              {' = '}
              <span>max({dp[currentI - 1]?.[currentJ] ?? 0}, {dp[currentI]?.[currentJ - 1] ?? 0})</span>
              {' = '}
              <span style={{ color: '#10b981', fontWeight: 600 }}>{Math.max(dp[currentI - 1]?.[currentJ] ?? 0, dp[currentI]?.[currentJ - 1] ?? 0)}</span>
            </div>
          )}
        </div>
      )}

      {/* Narrative Event Box */}
      <div className="narrative-box">
        <p className="narrative-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es}
        </p>
      </div>

      {/* Playback Controls */}
      <div className="controls-bar">
        <button
          className="btn-control"
          onClick={reset}
          title={language === 'es' ? 'Reiniciar' : 'Reset'}
        >
          ↺
        </button>
        <button
          className="btn-control"
          onClick={stepBackward}
          disabled={currentStepIndex === 0}
          title={language === 'es' ? 'Paso Anterior' : 'Step Backward'}
        >
          ◀
        </button>
        <button
          className="btn-control btn-play"
          onClick={togglePlay}
          title={isPlaying ? 'Pausa' : 'Reproducir'}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          className="btn-control"
          onClick={stepForward}
          disabled={currentStepIndex === totalSteps - 1}
          title={language === 'es' ? 'Paso Siguiente' : 'Step Forward'}
        >
          ▶
        </button>

        <div className="timeline-slider-wrapper">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-slider"
          />
          <span className="step-counter">
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="speed-selector">
          <label>{language === 'es' ? 'Vel:' : 'Speed:'}</label>
          <select
            value={playbackSpeed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1.0x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2.0x</option>
          </select>
        </div>
      </div>
    </div>
  );
};
