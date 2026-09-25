import React, { useState } from 'react';
import { LatenessJob, DEFAULT_LATENESS_JOBS } from '../../engine/algorithms/minimizeLatenessTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const MinimizeLatenessPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  // Initial order is deliberately shuffled to demonstrate inversions
  const [jobs, setJobs] = useState<LatenessJob[]>([
    DEFAULT_LATENESS_JOBS[3], // t=4, d=9
    DEFAULT_LATENESS_JOBS[0], // t=3, d=6 (inversion!)
    DEFAULT_LATENESS_JOBS[4], // t=3, d=14
    DEFAULT_LATENESS_JOBS[1], // t=2, d=8 (inversion!)
    DEFAULT_LATENESS_JOBS[2], // t=1, d=9
    DEFAULT_LATENESS_JOBS[5]  // t=2, d=15
  ]);

  // Compute timeline for current sequence
  let time = 0;
  let maxLateness = 0;
  const evaluated = jobs.map((job) => {
    const s = time;
    const f = s + job.duration;
    const lateness = Math.max(0, f - job.deadline);
    if (lateness > maxLateness) maxLateness = lateness;
    time = f;
    return { ...job, startTime: s, finishTime: f, lateness };
  });

  // Calculate inversions count
  let inversions = 0;
  for (let i = 0; i < jobs.length; i++) {
    for (let j = i + 1; j < jobs.length; j++) {
      if (jobs[i].deadline > jobs[j].deadline) {
        inversions++;
      }
    }
  }

  // Optimal EDF max lateness is 1
  const isOptimal = inversions === 0;

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= jobs.length) return;
    const next = [...jobs];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setJobs(next);

    // Check if new order is optimal
    let newInversions = 0;
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        if (next[i].deadline > next[j].deadline) newInversions++;
      }
    }
    if (newInversions === 0) {
      markAttempted('minimize-lateness-greedy');
    }
  };

  const handleSortEDF = () => {
    const sorted = [...jobs].sort((a, b) => a.deadline - b.deadline || a.duration - b.duration);
    setJobs(sorted);
    markAttempted('minimize-lateness-greedy');
  };

  const handleSortSPT = () => {
    // Shortest processing time heuristic (naive, sub-optimal)
    const sorted = [...jobs].sort((a, b) => a.duration - b.duration);
    setJobs(sorted);
  };

  return (
    <div className="lateness-playground" role="region" aria-label="Laboratorio de Minimización de Retraso">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button type="button" className="btn-preset active" onClick={handleSortEDF}>
            {language === 'es' ? 'Criterio Óptimo EDF (d_i creciente)' : 'Optimal EDF (ascending d_i)'}
          </button>
          <button type="button" className="btn-preset" onClick={handleSortSPT}>
            {language === 'es' ? 'Heurística Ingenua SPT (t_i creciente)' : 'Naive SPT (ascending t_i)'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Inversiones:' : 'Inversions:'}{' '}
            <strong style={{ color: inversions === 0 ? '#10b981' : '#ef4444' }}>{inversions}</strong>
          </span>
          <span>
            {language === 'es' ? 'Retraso Máximo:' : 'Max Lateness:'}{' '}
            <strong style={{ color: isOptimal ? '#10b981' : '#f59e0b' }}>L = {maxLateness}</strong>
          </span>
        </div>
      </div>

      {isOptimal ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            color: '#10b981',
            fontSize: '0.9rem'
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Cronograma Óptimo Confirmado' : 'Optimal Schedule Confirmed'}</strong>:{' '}
          {language === 'es'
            ? '0 inversiones. El argumento de intercambio de Kleinberg & Tardos garantiza que ningún reordenamiento puede reducir el retraso máximo.'
            : '0 inversions. The Kleinberg & Tardos exchange argument proves no rearrangement can reduce maximum lateness.'}
        </div>
      ) : (
        <div className="sdk-conflict-banner" role="alert">
          <strong>{language === 'es' ? 'Argumento de Intercambio' : 'Exchange Argument'}:</strong>{' '}
          {language === 'es'
            ? `Se detectaron ${inversions} inversiones (tareas con fecha límite lejana programadas antes que tareas urgentes). Usá los botones ↑ / ↓ para intercambiar tareas invertidas adyacentes hasta eliminarlas.`
            : `Detected ${inversions} inversions. Use the ↑ / ↓ buttons to swap adjacent inverted jobs until eliminated.`}
        </div>
      )}

      {/* Interactive SVG Gantt Timeline */}
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)', padding: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.35rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>
            {language === 'es'
              ? 'Línea de tiempo de procesamiento (haz clic en una tarea para intercambiarla):'
              : 'Processing timeline (click a job to swap with adjacent):'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {language === 'es' ? 'Banderas rojas = Deadlines (d_i)' : 'Red markers = Deadlines (d_i)'}
          </span>
        </div>

        <svg
          viewBox="0 0 560 140"
          style={{ width: '100%', maxWidth: '560px', height: 'auto', display: 'block', margin: '0 auto' }}
          role="img"
          aria-label={language === 'es' ? 'Cronograma de tareas y fechas límite' : 'Job schedule and deadline timeline'}
        >
          {/* Axis line */}
          <line x1={30} y1={70} x2={530} y2={70} stroke="var(--border)" strokeWidth={2} />

          {/* Time ticks (0 to 18) */}
          {Array.from({ length: 19 }).map((_, t) => {
            const x = 30 + (t / 18) * 500;
            return (
              <g key={`time-tick-${t}`}>
                <line x1={x} y1={65} x2={x} y2={75} stroke="var(--text-muted)" strokeWidth={1} />
                {t % 2 === 0 && (
                  <text x={x} y={88} textAnchor="middle" fill="var(--text-muted)" fontSize="9px" fontFamily="var(--font-mono)">
                    {t}
                  </text>
                )}
              </g>
            );
          })}

          {/* Scheduled Job Blocks */}
          {evaluated.map((job, idx) => {
            const x1 = 30 + (job.startTime / 18) * 500;
            const x2 = 30 + (job.finishTime / 18) * 500;
            const w = x2 - x1;
            const isLate = (job.lateness ?? 0) > 0;
            const dX = 30 + (job.deadline / 18) * 500;

            return (
              <g
                key={`svg-job-${job.id}`}
                onClick={() => {
                  if (idx < jobs.length - 1) handleMove(idx, 1);
                  else if (idx > 0) handleMove(idx, -1);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Job block */}
                <rect
                  x={x1 + 1}
                  y={28}
                  width={w - 2}
                  height={32}
                  rx={4}
                  fill={job.color}
                  fillOpacity={0.85}
                  stroke={isLate ? '#ef4444' : 'var(--border)'}
                  strokeWidth={isLate ? 2 : 1}
                />
                <text
                  x={x1 + w / 2}
                  y={48}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  style={{ pointerEvents: 'none' }}
                >
                  {job.name}
                </text>

                {/* Deadline marker flag */}
                <line
                  x1={dX}
                  y1={12}
                  x2={dX}
                  y2={65}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray={isLate ? 'none' : '3 2'}
                />
                <circle cx={dX} cy={12} r={3} fill="#ef4444" />
                <text
                  x={dX}
                  y={8}
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize="8px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  d={job.deadline}
                </text>

                {/* Lateness band if late */}
                {isLate && (
                  <rect
                    x={dX}
                    y={28}
                    width={x2 - dX}
                    height={32}
                    fill="rgba(239, 68, 68, 0.4)"
                    stroke="#ef4444"
                    strokeWidth={1}
                    rx={2}
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Job List with swap buttons */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>#</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>{language === 'es' ? 'Tarea' : 'Job'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Duración (t)' : 'Duration (t)'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Deadline (d)' : 'Deadline (d)'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Intervalo [s, f]' : 'Span [s, f]'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Retraso (L)' : 'Lateness (L)'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Reordenar' : 'Reorder'}</th>
            </tr>
          </thead>
          <tbody>
            {evaluated.map((job, idx) => {
              const isLate = (job.lateness ?? 0) > 0;
              const hasInversionWithNext = idx < jobs.length - 1 && job.deadline > jobs[idx + 1].deadline;

              return (
                <tr
                  key={job.id}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: hasInversionWithNext ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{idx + 1}</td>
                  <td style={{ padding: '0.5rem 0.75rem', fontWeight: '600', color: job.color }}>{job.name}</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{job.duration}</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{job.deadline}</td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    [{job.startTime}, {job.finishTime}]
                  </td>
                  <td
                    style={{
                      padding: '0.5rem 0.75rem',
                      textAlign: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: '700',
                      color: isLate ? '#ef4444' : '#10b981'
                    }}
                  >
                    {job.lateness ?? 0}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, -1)}
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--text)',
                          cursor: idx === 0 ? 'not-allowed' : 'pointer',
                          opacity: idx === 0 ? 0.4 : 1
                        }}
                        aria-label="Subir tarea"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={idx === jobs.length - 1}
                        onClick={() => handleMove(idx, 1)}
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg)',
                          color: 'var(--text)',
                          cursor: idx === jobs.length - 1 ? 'not-allowed' : 'pointer',
                          opacity: idx === jobs.length - 1 ? 0.4 : 1
                        }}
                        aria-label="Bajar tarea"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
