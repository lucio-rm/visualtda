import React, { useMemo } from 'react';
import { TraceScrubber } from '../TraceScrubber';
import {
  generateMinimizeLatenessTrace,
  MinimizeLatenessStepData,
  DEFAULT_LATENESS_JOBS
} from '../../engine/algorithms/minimizeLatenessTrace';
import { compute1DLabelLevels } from '../../utils/staggerLayout';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './MinimizeLatenessVisualizer.css';

export const MinimizeLatenessVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateMinimizeLatenessTrace(DEFAULT_LATENESS_JOBS), []);

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
  } = useTraceTimeline<MinimizeLatenessStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const scheduledJobs = data?.scheduledJobs || [];
  const currentJob = data?.currentJob;
  const maxLateness = data?.maxLateness ?? 0;
  const currentTime = data?.currentTime ?? 0;
  const action = data?.action || 'INIT';
  const description = data?.description;

  // Timeline coordinate scale
  const maxAxisTime = 18;
  const svgWidth = 600;
  const svgHeight = 220;
  const marginLeft = 40;
  const marginRight = 30;
  const marginTop = 50;
  const chartWidth = svgWidth - marginLeft - marginRight;

  const timeToX = (t: number) => marginLeft + (t / maxAxisTime) * chartWidth;

  const deadlineLabelLevels = useMemo(() => {
    const items = scheduledJobs.map((job) => ({
      id: job.id,
      x: timeToX(job.deadline)
    }));
    return compute1DLabelLevels(items, 36);
  }, [scheduledJobs, timeToX]);

  return (
    <div
      className="minimize-lateness-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Minimización de Retraso Máximo' : 'Minimize Lateness Visualizer'}
    >
      {/* Metrics Row */}
      <div className="ml-metrics-row">
        <div className="ml-metric-badge">
          <span>{language === 'es' ? 'Tiempo actual (t):' : 'Current Time (t):'}</span>
          <strong>{currentTime}</strong>
        </div>
        <div className="ml-metric-badge">
          <span>{language === 'es' ? 'Retraso Máximo (L_max):' : 'Max Lateness (L_max):'}</span>
          <strong style={{ color: maxLateness > 0 ? 'var(--error)' : 'var(--success)' }}>{maxLateness}</strong>
        </div>
        <div className={`ml-metric-badge ml-action-badge action-${action.toLowerCase()}`}>
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Canvas */}
      <div className="ml-canvas-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            maxWidth: 'min(100%, 720px)',
            maxHeight: 'min(360px, calc(100vh - 340px))',
            height: 'auto',
            display: 'block',
            margin: '0 auto'
          }}
          role="img"
          aria-label={language === 'es' ? 'Cronograma de tareas y deadlines' : 'Jobs schedule and deadlines chart'}
        >
          {/* Timeline background track */}
          <line
            x1={marginLeft}
            y1={marginTop + 50}
            x2={marginLeft + chartWidth}
            y2={marginTop + 50}
            stroke="var(--border)"
            strokeWidth={4}
            strokeLinecap="round"
          />

          {/* Time ticks */}
          {Array.from({ length: maxAxisTime + 1 }).map((_, t) => {
            const x = timeToX(t);
            return (
              <g key={`tick-${t}`}>
                <line
                  x1={x}
                  y1={marginTop + 45}
                  x2={x}
                  y2={marginTop + 55}
                  stroke="var(--border)"
                  strokeWidth={t % 2 === 0 ? 1.5 : 1}
                />
                {t % 2 === 0 && (
                  <text
                    x={x}
                    y={marginTop + 72}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="13px"
                    fontFamily="var(--font-mono)"
                  >
                    {t}
                  </text>
                )}
              </g>
            );
          })}

          {/* Scheduled Job Blocks */}
          {scheduledJobs.map((job) => {
            if (job.startTime === undefined || job.finishTime === undefined) return null;
            const x1 = timeToX(job.startTime);
            const x2 = timeToX(job.finishTime);
            const w = Math.max(4, x2 - x1);
            const isLate = (job.lateness ?? 0) > 0;
            const isSelected = currentJob?.id === job.id;

            return (
              <g key={`block-${job.id}`}>
                {/* Job rectangle */}
                <rect
                  x={x1}
                  y={marginTop}
                  width={w}
                  height={42}
                  rx={4}
                  fill={job.color}
                  fillOpacity={0.85}
                  stroke={isSelected ? '#ffffff' : 'none'}
                  strokeWidth={isSelected ? 2.5 : 0}
                />
                <text
                  x={x1 + w / 2}
                  y={marginTop + 24}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13px"
                  fontWeight="700"
                  fontFamily="var(--font-sans)"
                >
                  {language === 'es' ? job.name : job.name.replace(/Tarea/g, 'Job')} (t={job.duration})
                </text>

                {/* Deadline indicator pin with 1D collision-staggering */}
                <line
                  x1={timeToX(job.deadline)}
                  y1={marginTop - 20}
                  x2={timeToX(job.deadline)}
                  y2={marginTop + 42}
                  stroke={isLate ? 'var(--error)' : 'var(--success)'}
                  strokeWidth={2}
                  strokeDasharray="3,2"
                />
                <circle
                  cx={timeToX(job.deadline)}
                  cy={marginTop - 20}
                  r={5}
                  fill={isLate ? 'var(--error)' : 'var(--success)'}
                />
                {(() => {
                  const lvl = deadlineLabelLevels[job.id] || 0;
                  const labelY = marginTop - 28 - lvl * 18;
                  return (
                    <g key={`d-label-${job.id}`}>
                      {lvl > 0 && (
                        <line
                          x1={timeToX(job.deadline)}
                          y1={marginTop - 20}
                          x2={timeToX(job.deadline)}
                          y2={labelY + 4}
                          stroke={isLate ? 'var(--error)' : 'var(--success)'}
                          strokeWidth={1.5}
                          strokeDasharray="2,2"
                        />
                      )}
                      <text
                        x={timeToX(job.deadline)}
                        y={labelY}
                        textAnchor="middle"
                        fill={isLate ? 'var(--error)' : 'var(--success)'}
                        fontSize="13px"
                        fontWeight="700"
                        fontFamily="var(--font-mono)"
                      >
                        d={job.deadline}
                      </text>
                    </g>
                  );
                })()}

                {/* Lateness bracket if job is late */}
                {isLate && (
                  <rect
                    x={timeToX(job.deadline)}
                    y={marginTop + 38}
                    width={x2 - timeToX(job.deadline)}
                    height={4}
                    fill="var(--error)"
                    rx={2}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Job schedule details table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="ml-job-table">
          <thead>
            <tr>
              <th>{language === 'es' ? 'Tarea' : 'Job'}</th>
              <th>{language === 'es' ? 'Duración (t_i)' : 'Duration (t_i)'}</th>
              <th>{language === 'es' ? 'Deadline (d_i)' : 'Deadline (d_i)'}</th>
              <th>{language === 'es' ? 'Inicio (s_i)' : 'Start (s_i)'}</th>
              <th>{language === 'es' ? 'Fin (f_i)' : 'Finish (f_i)'}</th>
              <th>{language === 'es' ? 'Retraso (L_i)' : 'Lateness (L_i)'}</th>
            </tr>
          </thead>
          <tbody>
            {scheduledJobs.map((j) => (
              <tr key={`row-${j.id}`}>
                <td style={{ fontWeight: '600', color: j.color }}>{j.name}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{j.duration}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{j.deadline}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{j.startTime ?? '-'}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{j.finishTime ?? '-'}</td>
                <td
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: '700',
                    color: (j.lateness ?? 0) > 0 ? 'var(--error)' : 'var(--success)'
                  }}
                >
                  {j.lateness ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Exchange Argument & Inversion Reduction Card (Section 12, 23 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Argumento de Intercambio y Reducción de Inversiones:' : 'Exchange Argument & Inversion Reduction:'}</strong>{' '}
        {language === 'es'
          ? 'Una inversión es un par ordenado (i, j) donde i precede a j pero d_i > d_j. Todo cronograma con inversiones posee al menos un par adyacente invertido. Intercambiar dicho par reduce las inversiones en 1 y no incrementa el retraso máximo de ninguna tarea. Por inducción finita, cualquier solución óptima puede transformarse en la solución Greedy Earliest Deadline First (EDF) con 0 inversiones, demostrando su optimalidad en O(n log n).'
          : 'An inversion is a pair (i, j) where i precedes j but d_i > d_j. Any schedule with inversions contains an adjacent inverted pair. Swapping this adjacent pair strictly decrements total inversions by 1 without increasing maximum lateness. By finite induction, any optimal schedule can be transformed into the greedy Earliest Deadline First (EDF) order with zero inversions, proving optimality in O(n log n).'}
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
          <TraceScrubber
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSeek={goToStep}
            language={language}
            showCounter={false}
            ariaLabel={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
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
