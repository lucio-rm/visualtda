import React, { useState, useMemo, useRef, useCallback } from 'react';
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

  // Dragging state for horizontal reordering
  const [draggingJobId, setDraggingJobId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute timeline for current sequence
  const evaluated = useMemo(() => {
    let time = 0;
    let maxL = 0;
    const list = jobs.map((job) => {
      const s = time;
      const f = s + job.duration;
      const lateness = Math.max(0, f - job.deadline);
      if (lateness > maxL) maxL = lateness;
      time = f;
      return { ...job, startTime: s, finishTime: f, lateness };
    });
    return { list, maxLateness: maxL, totalTime: time };
  }, [jobs]);

  const maxLateness = evaluated.maxLateness;
  const totalProcessingTime = evaluated.totalTime;

  // Calculate inversions count and identify the first adjacent inversion
  const { inversions, firstAdjacentInversion } = useMemo(() => {
    let count = 0;
    let firstAdj: [number, number] | null = null;
    for (let i = 0; i < jobs.length; i++) {
      for (let j = i + 1; j < jobs.length; j++) {
        if (jobs[i].deadline > jobs[j].deadline) {
          count++;
          if (j === i + 1 && firstAdj === null) {
            firstAdj = [i, j];
          }
        }
      }
    }
    return { inversions: count, firstAdjacentInversion: firstAdj };
  }, [jobs]);

  const isOptimal = inversions === 0;

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 160;
  const marginLeft = 35;
  const marginRight = 35;
  const maxAxisTime = Math.max(18, totalProcessingTime + 2);
  const chartWidth = svgWidth - marginLeft - marginRight;

  const timeToX = (t: number) => marginLeft + (t / maxAxisTime) * chartWidth;
  const xToTime = (x: number) => ((x - marginLeft) / chartWidth) * maxAxisTime;

  const handleSwapAdjacent = () => {
    if (!firstAdjacentInversion) return;
    const [i, j] = firstAdjacentInversion;
    const next = [...jobs];
    const temp = next[i];
    next[i] = next[j];
    next[j] = temp;
    setJobs(next);

    // Check if new order is optimal
    let newInversions = 0;
    for (let a = 0; a < next.length; a++) {
      for (let b = a + 1; b < next.length; b++) {
        if (next[a].deadline > next[b].deadline) newInversions++;
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
    const sorted = [...jobs].sort((a, b) => a.duration - b.duration);
    setJobs(sorted);
  };

  const handleResetShuffled = () => {
    setJobs([
      DEFAULT_LATENESS_JOBS[3],
      DEFAULT_LATENESS_JOBS[0],
      DEFAULT_LATENESS_JOBS[4],
      DEFAULT_LATENESS_JOBS[1],
      DEFAULT_LATENESS_JOBS[2],
      DEFAULT_LATENESS_JOBS[5]
    ]);
  };

  // Pointer Dragging Handlers for Reordering
  const handlePointerDown = (jobId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingJobId(jobId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingJobId || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * svgWidth;

      // Determine which job slot the dragged block is currently hovering over
      const hoverTime = xToTime(rawX);
      const draggedIdx = jobs.findIndex((j) => j.id === draggingJobId);
      if (draggedIdx === -1) return;

      // Find target index based on evaluated center times
      let targetIdx = draggedIdx;
      for (let i = 0; i < evaluated.list.length; i++) {
        const item = evaluated.list[i];
        if (hoverTime >= item.startTime && hoverTime <= item.finishTime) {
          targetIdx = i;
          break;
        }
      }

      if (targetIdx !== draggedIdx) {
        const next = [...jobs];
        const [moved] = next.splice(draggedIdx, 1);
        next.splice(targetIdx, 0, moved);
        setJobs(next);
      }
    },
    [draggingJobId, jobs, evaluated.list]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingJobId) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      setDraggingJobId(null);

      // Check if resulting sequence is optimal
      let count = 0;
      for (let i = 0; i < jobs.length; i++) {
        for (let j = i + 1; j < jobs.length; j++) {
          if (jobs[i].deadline > jobs[j].deadline) count++;
        }
      }
      if (count === 0) {
        markAttempted('minimize-lateness-greedy');
      }
    }
  };

  return (
    <div
      className="algorithm-playground lateness-playground"
      role="region"
      aria-label="Laboratorio de Minimización de Retraso"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Playground Controls & Presets */}
      <div className="sdk-pg-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn-preset ${isOptimal ? 'active' : ''}`}
              onClick={handleSortEDF}
            >
              {language === 'es' ? 'Ordenar por Deadline (d_i)' : 'Sort by Deadline (d_i)'}
            </button>
            <button type="button" className="btn-preset" onClick={handleSortSPT}>
              {language === 'es' ? 'Ordenar por Duración (t_i)' : 'Sort by Processing Time (t_i)'}
            </button>
            <button type="button" className="btn-preset" onClick={handleResetShuffled}>
              ↺ {language === 'es' ? 'Desordenar Tareas' : 'Shuffle Jobs'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {firstAdjacentInversion && (
              <button
                type="button"
                className="btn-preset active"
                onClick={handleSwapAdjacent}
                title={language === 'es' ? 'Ejecutar un paso del argumento de intercambio' : 'Perform an exchange step'}
              >
                ⇄ {language === 'es' ? 'Eliminar 1 Inversión (Intercambio)' : 'Eliminate 1 Inversion'}
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--surface)',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            <span>
              {language === 'es' ? 'Inversiones Totales:' : 'Total Inversions:'}{' '}
              <strong style={{ color: inversions === 0 ? '#10b981' : '#ef4444' }}>
                {inversions}
              </strong>
            </span>
            <span>
              {language === 'es' ? 'Retraso Máximo Obtenido:' : 'Max Lateness:'}{' '}
              <strong style={{ color: isOptimal ? '#10b981' : '#f59e0b' }}>
                L = {maxLateness}
              </strong>
            </span>
            <span>
              {language === 'es' ? 'Tiempo Total:' : 'Total Time:'}{' '}
              <strong>{totalProcessingTime}h</strong>
            </span>
          </div>

          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {language === 'es'
              ? 'Inversión = Tarea con deadline lejano programada antes que una urgente.'
              : 'Inversion = Later deadline job scheduled before an earlier one.'}
          </span>
        </div>
      </div>

      {/* Status banner */}
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
            ? '0 inversiones. El argumento de intercambio de Kleinberg & Tardos demuestra que todo ordenamiento con inversiones puede transformarse en EDF sin empeorar el retraso máximo L.'
            : '0 inversions. Kleinberg & Tardos exchange argument proves EDF is strictly optimal.'}
        </div>
      ) : (
        <div
          className="sdk-conflict-banner"
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--radius-sm)',
            color: '#f59e0b'
          }}
        >
          <strong>{language === 'es' ? 'Argumento de Intercambio Activo' : 'Exchange Argument Active'}:</strong>{' '}
          {language === 'es'
            ? `Se detectaron ${inversions} inversiones. Arrastrá los bloques horizontalmente o hacé clic en "Eliminar 1 Inversión" para verificar que intercambiar tareas invertidas contiguas nunca incrementa el retraso máximo.`
            : `Detected ${inversions} inversions. Drag blocks horizontally or click "Eliminate 1 Inversion" to observe that swapping adjacent inverted jobs never increases maximum lateness.`}
        </div>
      )}

      {/* Interactive SVG Gantt Timeline with Drag and Drop */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          padding: '0.5rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            marginBottom: '0.25rem',
            padding: '0 0.5rem'
          }}
        >
          <span>
            {language === 'es'
              ? 'Arrastrá cualquier bloque horizontalmente para reordenar la secuencia en el tiempo.'
              : 'Drag any job block horizontally to reorder the execution sequence.'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {language === 'es' ? 'Banderas rojas = Deadlines (d_i)' : 'Red flags = Deadlines (d_i)'}
          </span>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            maxWidth: '580px',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            touchAction: 'none'
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          aria-label={language === 'es' ? 'Línea de tiempo de tareas y retraso' : 'Job timeline with lateness flags'}
        >
          {/* Time axis */}
          <line x1={marginLeft} y1={85} x2={svgWidth - marginRight} y2={85} stroke="var(--border)" strokeWidth={2} />

          {/* Time ticks */}
          {Array.from({ length: maxAxisTime + 1 }).map((_, t) => {
            const x = timeToX(t);
            return (
              <g key={`time-tick-${t}`}>
                <line x1={x} y1={80} x2={x} y2={90} stroke="var(--border)" strokeWidth={1} />
                {t % 2 === 0 && (
                  <text
                    x={x}
                    y={102}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="9px"
                    fontFamily="var(--font-mono)"
                  >
                    {t}
                  </text>
                )}
              </g>
            );
          })}

          {/* Inversion indicator between adjacent pair if present */}
          {firstAdjacentInversion && (
            (() => {
              const [idxA, idxB] = firstAdjacentInversion;
              const itemA = evaluated.list[idxA];
              const itemB = evaluated.list[idxB];
              const boundaryX = timeToX(itemA.finishTime);
              return (
                <g key="inversion-marker">
                  <line
                    x1={boundaryX}
                    y1={20}
                    x2={boundaryX}
                    y2={80}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={boundaryX - 42}
                    y={5}
                    width={84}
                    height={16}
                    rx={3}
                    fill="#ef4444"
                  />
                  <text
                    x={boundaryX}
                    y={16}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="8px"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {language === 'es' ? 'INVERSIÓN' : 'INVERSION'} ({itemA.deadline} &gt; {itemB.deadline})
                  </text>
                </g>
              );
            })()
          )}

          {/* Job Blocks with Dragging & Lateness Regions */}
          {evaluated.list.map((job) => {
            const startX = timeToX(job.startTime);
            const finishX = timeToX(job.finishTime);
            const deadlineX = timeToX(job.deadline);
            const blockWidth = finishX - startX;
            const isDragging = draggingJobId === job.id;
            const hasLateness = job.lateness > 0;

            return (
              <g
                key={`job-block-${job.id}`}
                onPointerDown={(e) => handlePointerDown(job.id, e)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {/* Drag shadow */}
                {isDragging && (
                  <rect
                    x={startX + 3}
                    y={38}
                    width={blockWidth - 2}
                    height={38}
                    rx={4}
                    fill="rgba(0, 0, 0, 0.25)"
                  />
                )}

                {/* Main Job Block */}
                <rect
                  x={startX + 1}
                  y={35}
                  width={blockWidth - 2}
                  height={38}
                  rx={4}
                  fill={isDragging ? '#38bdf8' : hasLateness ? '#f59e0b' : 'var(--accent)'}
                  fillOpacity={isDragging ? 0.95 : 0.85}
                  stroke={isDragging ? '#ffffff' : hasLateness ? '#f59e0b' : 'var(--accent)'}
                  strokeWidth={isDragging ? 2.5 : 1}
                />

                {/* Job text label */}
                <text
                  x={startX + blockWidth / 2}
                  y={52}
                  textAnchor="middle"
                  fill={isDragging ? '#0f172a' : '#ffffff'}
                  fontSize="11px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  pointerEvents="none"
                >
                  {job.id} (t={job.duration})
                </text>

                <text
                  x={startX + blockWidth / 2}
                  y={66}
                  textAnchor="middle"
                  fill={isDragging ? '#0f172a' : 'rgba(255, 255, 255, 0.85)'}
                  fontSize="8.5px"
                  fontFamily="var(--font-mono)"
                  pointerEvents="none"
                >
                  d={job.deadline}
                </text>

                {/* Deadline marker flag */}
                <line
                  x1={deadlineX}
                  y1={24}
                  x2={deadlineX}
                  y2={85}
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                />
                <circle cx={deadlineX} cy={24} r={3} fill="#ef4444" />
                <text
                  x={deadlineX}
                  y={18}
                  textAnchor="middle"
                  fill="#ef4444"
                  fontSize="8px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  d_{job.id}
                </text>

                {/* Lateness overdue bar if finish > deadline */}
                {hasLateness && (
                  <g pointerEvents="none">
                    <rect
                      x={deadlineX}
                      y={75}
                      width={Math.max(2, finishX - deadlineX)}
                      height={6}
                      fill="#ef4444"
                      rx={2}
                    />
                    <text
                      x={(deadlineX + finishX) / 2}
                      y={122}
                      textAnchor="middle"
                      fill="#ef4444"
                      fontSize="9px"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      +L={job.lateness}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Sequence Chips & Reordering order */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '600' }}>
            {language === 'es' ? 'Orden Actual:' : 'Current Order:'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent)' }}>
            [{jobs.map((j) => j.id).join(' → ')}]
          </span>
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {language === 'es' ? 'Tareas evaluadas:' : 'Evaluated jobs:'} {jobs.length}
        </span>
      </div>
    </div>
  );
};
