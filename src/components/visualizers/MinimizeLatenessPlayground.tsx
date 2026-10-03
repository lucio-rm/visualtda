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
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragCurrentX, setDragCurrentX] = useState<number>(0);
  const [previewTargetIdx, setPreviewTargetIdx] = useState<number | null>(null);

  const handlePointerDown = (jobId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    const rect = svgRef.current?.getBoundingClientRect();
    const currentX = rect ? ((e.clientX - rect.left) / rect.width) * svgWidth : 0;
    setDraggingJobId(jobId);
    setDragStartX(currentX);
    setDragCurrentX(currentX);
    const currIdx = jobs.findIndex((j) => j.id === jobId);
    setPreviewTargetIdx(currIdx !== -1 ? currIdx : null);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingJobId || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const currentX = ((e.clientX - rect.left) / rect.width) * svgWidth;
      setDragCurrentX(currentX);

      // Stable target slot determination using evaluated baseline centers
      const hoverTime = xToTime(currentX);
      const draggedIdx = jobs.findIndex((j) => j.id === draggingJobId);
      if (draggedIdx === -1) return;

      let targetIdx = draggedIdx;
      for (let i = 0; i < evaluated.list.length; i++) {
        const item = evaluated.list[i];
        // Require moving past 40% into the target interval to trigger swap (hysteresis)
        const midTime = (item.startTime + item.finishTime) / 2;
        if (i < draggedIdx && hoverTime < midTime + 0.5) {
          targetIdx = i;
          break;
        } else if (i > draggedIdx && hoverTime > midTime - 0.5) {
          targetIdx = i;
        }
      }

      setPreviewTargetIdx(targetIdx);
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

      const draggedIdx = jobs.findIndex((j) => j.id === draggingJobId);
      if (draggedIdx !== -1 && previewTargetIdx !== null && previewTargetIdx !== draggedIdx) {
        const next = [...jobs];
        const [moved] = next.splice(draggedIdx, 1);
        next.splice(previewTargetIdx, 0, moved);
        setJobs(next);

        // Check if resulting sequence is optimal
        let count = 0;
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            if (next[i].deadline > next[j].deadline) count++;
          }
        }
        if (count === 0) {
          markAttempted('minimize-lateness-greedy');
        }
      }

      setDraggingJobId(null);
      setPreviewTargetIdx(null);
    }
  };

  const handleMoveJob = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= jobs.length) return;
    const next = [...jobs];
    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;
    setJobs(next);

    let count = 0;
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        if (next[i].deadline > next[j].deadline) count++;
      }
    }
    if (count === 0) {
      markAttempted('minimize-lateness-greedy');
    }
  };

  return (
    <div
      className="algorithm-playground lateness-playground"
      role="region"
      aria-label={language === 'es' ? 'Laboratorio de Minimización de Retraso' : 'Minimize Lateness Playground'}
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
              <strong style={{ color: inversions === 0 ? 'var(--success)' : 'var(--error)' }}>
                {inversions}
              </strong>
            </span>
            <span>
              {language === 'es' ? 'Retraso Máximo Obtenido:' : 'Max Lateness:'}{' '}
              <strong style={{ color: isOptimal ? 'var(--success)' : 'var(--warning)' }}>
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
            backgroundColor: 'var(--state-solution-bg)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--success)',
            fontSize: '0.9rem'
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Cronograma Óptimo Confirmado' : 'Optimal Schedule Confirmed'}</strong>:{' '}
          {language === 'es'
            ? '0 inversiones. El argumento de intercambio demuestra que todo ordenamiento con inversiones puede transformarse en EDF sin empeorar el retraso máximo L.'
            : '0 inversions. The exchange argument proves Earliest Deadline First (EDF) is strictly optimal.'}
        </div>
      ) : (
        <div
          className="sdk-conflict-banner"
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--state-candidate-bg)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--warning)'
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
          backgroundColor: 'var(--canvas-bg)',
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
            fontSize: '0.8125rem',
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
            maxWidth: '100%',
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
                    fontSize="13px"
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
                    stroke="var(--error)"
                    strokeWidth={2}
                    strokeDasharray="2 2"
                  />
                  <rect
                    x={boundaryX - 42}
                    y={5}
                    width={84}
                    height={16}
                    rx={3}
                    fill="var(--error)"
                  />
                  <text
                    x={boundaryX}
                    y={16}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="13px"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                  >
                    {language === 'es' ? 'INVERSIÓN' : 'INVERSION'} ({itemA.deadline} &gt; {itemB.deadline})
                  </text>
                </g>
              );
            })()
          )}

          {/* Drop Target Indicator */}
          {draggingJobId && previewTargetIdx !== null && (
            (() => {
              const targetItem = evaluated.list[previewTargetIdx];
              if (!targetItem) return null;
              const targetX = timeToX(targetItem.startTime);
              return (
                <g key="drop-target-indicator" pointerEvents="none">
                  <line
                    x1={targetX}
                    y1={30}
                    x2={targetX}
                    y2={78}
                    stroke="var(--accent)"
                    strokeWidth={3}
                    strokeDasharray="4 2"
                  />
                  <polygon
                    points={`${targetX},${30} ${targetX - 5},${22} ${targetX + 5},${22}`}
                    fill="var(--accent)"
                  />
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
            const dragOffset = isDragging ? dragCurrentX - dragStartX : 0;

            return (
              <g
                key={`job-block-${job.id}`}
                onPointerDown={(e) => handlePointerDown(job.id, e)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                transform={isDragging ? `translate(${dragOffset}, 0)` : undefined}
              >
                {/* Drag shadow */}
                {isDragging && (
                  <rect
                    x={startX + 3}
                    y={38}
                    width={blockWidth - 2}
                    height={38}
                    rx={4}
                    fill="rgba(0, 0, 0, 0.35)"
                  />
                )}

                {/* Main Job Block */}
                <rect
                  x={startX + 1}
                  y={35}
                  width={blockWidth - 2}
                  height={38}
                  rx={4}
                  fill={isDragging ? 'var(--accent)' : hasLateness ? 'var(--warning)' : 'var(--accent)'}
                  fillOpacity={isDragging ? 0.98 : 0.88}
                  stroke={isDragging ? '#ffffff' : hasLateness ? 'var(--warning)' : 'var(--accent)'}
                  strokeWidth={isDragging ? 2.5 : 1}
                />

                {/* Job text label - Always crisp white for WCAG AA on indigo/amber */}
                <text
                  x={startX + blockWidth / 2}
                  y={52}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13px"
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
                  fill="rgba(255, 255, 255, 0.95)"
                  fontSize="13px"
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
                  stroke="var(--error)"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                />
                <circle cx={deadlineX} cy={24} r={3} fill="var(--error)" />
                <text
                  x={deadlineX}
                  y={18}
                  textAnchor="middle"
                  fill="var(--error)"
                  fontSize="13px"
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
                      fill="var(--error)"
                      rx={2}
                    />
                    <text
                      x={(deadlineX + finishX) / 2}
                      y={122}
                      textAnchor="middle"
                      fill="var(--error)"
                      fontSize="13px"
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

      {/* Sequence Chips & Reordering Controls */}
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
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '600' }}>
            {language === 'es' ? 'Orden Actual:' : 'Current Order:'}
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            {jobs.map((job, idx) => (
              <span
                key={`chip-seq-${job.id}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.2rem 0.45rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--canvas-bg)',
                  border: '1px solid var(--border)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem'
                }}
              >
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveJob(idx, 'left')}
                  style={{
                    padding: '0.05rem 0.25rem',
                    background: 'none',
                    border: 'none',
                    cursor: idx === 0 ? 'default' : 'pointer',
                    color: idx === 0 ? 'var(--border)' : 'var(--text)',
                    fontSize: '0.75rem',
                    lineHeight: 1
                  }}
                  title={language === 'es' ? 'Mover a la izquierda' : 'Move left'}
                >
                  ◀
                </button>
                <strong>{job.id}</strong>
                <button
                  type="button"
                  disabled={idx === jobs.length - 1}
                  onClick={() => handleMoveJob(idx, 'right')}
                  style={{
                    padding: '0.05rem 0.25rem',
                    background: 'none',
                    border: 'none',
                    cursor: idx === jobs.length - 1 ? 'default' : 'pointer',
                    color: idx === jobs.length - 1 ? 'var(--border)' : 'var(--text)',
                    fontSize: '0.75rem',
                    lineHeight: 1
                  }}
                  title={language === 'es' ? 'Mover a la derecha' : 'Move right'}
                >
                  ▶
                </button>
              </span>
            ))}
          </div>
        </div>

        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {language === 'es' ? 'Tareas evaluadas:' : 'Evaluated jobs:'} {jobs.length}
        </span>
      </div>
    </div>
  );
};
