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
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Minimización de Retraso">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button type="button" className="btn-preset active" onClick={handleSortEDF}>
            ⚡ {language === 'es' ? 'Criterio Óptimo EDF (d_i creciente)' : 'Optimal EDF (ascending d_i)'}
          </button>
          <button type="button" className="btn-preset" onClick={handleSortSPT}>
            ⚠️ {language === 'es' ? 'Heurística Ingenua SPT (t_i creciente)' : 'Naive SPT (ascending t_i)'}
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
          ✓ <strong>{language === 'es' ? 'Cronograma Óptimo Confirmado' : 'Optimal Schedule Confirmed'}</strong>:{' '}
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
