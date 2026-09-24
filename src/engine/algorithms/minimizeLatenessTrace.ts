import { TraceTimeline, TraceEvent } from '../../types';

export interface LatenessJob {
  id: string;
  name: string;
  duration: number; // t_i
  deadline: number; // d_i
  startTime?: number; // s_i
  finishTime?: number; // f_i
  lateness?: number; // L_i = max(0, f_i - d_i)
  color: string;
}

export interface MinimizeLatenessStepData {
  jobs: LatenessJob[];
  scheduledJobs: LatenessJob[];
  currentIndex: number;
  currentJob: LatenessJob | null;
  currentTime: number;
  maxLateness: number;
  action: 'INIT' | 'SORT_DEADLINES' | 'SCHEDULE_JOB' | 'EVALUATE_LATENESS' | 'COMPLETE';
  description: { es: string; en: string };
}

const PALETTE = [
  '#38bdf8', // sky
  '#f59e0b', // amber
  '#10b981', // emerald
  '#a855f7', // purple
  '#ec4899', // pink
  '#f97316'  // orange
];

export const DEFAULT_LATENESS_JOBS: LatenessJob[] = [
  { id: 'j1', name: 'Tarea 1', duration: 3, deadline: 6, color: PALETTE[0] },
  { id: 'j2', name: 'Tarea 2', duration: 2, deadline: 8, color: PALETTE[1] },
  { id: 'j3', name: 'Tarea 3', duration: 1, deadline: 9, color: PALETTE[2] },
  { id: 'j4', name: 'Tarea 4', duration: 4, deadline: 9, color: PALETTE[3] },
  { id: 'j5', name: 'Tarea 5', duration: 3, deadline: 14, color: PALETTE[4] },
  { id: 'j6', name: 'Tarea 6', duration: 2, deadline: 15, color: PALETTE[5] }
];

export function generateMinimizeLatenessTrace(
  inputJobs: LatenessJob[] = DEFAULT_LATENESS_JOBS
): TraceTimeline<MinimizeLatenessStepData> {
  const events: TraceEvent<MinimizeLatenessStepData>[] = [];
  const jobs = inputJobs.map((j) => ({ ...j }));

  let eventCounter = 0;
  const scheduled: LatenessJob[] = [];
  let currentTime = 0;
  let maxLateness = 0;

  function pushEvent(
    action: MinimizeLatenessStepData['action'],
    idx: number,
    job: LatenessJob | null,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        jobs: jobs.map((j) => ({ ...j })),
        scheduledJobs: scheduled.map((j) => ({ ...j })),
        currentIndex: idx,
        currentJob: job ? { ...job } : null,
        currentTime,
        maxLateness,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // 1. Init
  pushEvent(
    'INIT',
    -1,
    null,
    `Instancia inicial: ${jobs.length} tareas con duración t_i y fecha límite d_i. Objetivo: minimizar el retraso máximo L = max(0, f_i - d_i).`,
    `Initial instance: ${jobs.length} jobs with duration t_i and deadline d_i. Goal: minimize max lateness L = max(0, f_i - d_i).`
  );

  // 2. Sort by deadline (EDF)
  const sorted = [...jobs].sort((a, b) => a.deadline - b.deadline || a.duration - b.duration);
  pushEvent(
    'SORT_DEADLINES',
    -1,
    null,
    `Criterio Greedy: Earliest Deadline First (EDF). Las tareas se ordenan ascendentemente por deadline d_i. Demostración por argumento de intercambio (exchange argument).`,
    `Greedy criterion: Earliest Deadline First (EDF). Jobs sorted ascending by deadline d_i. Proven optimal by exchange argument.`
  );

  // 3. Schedule sequentially
  for (let i = 0; i < sorted.length; i++) {
    const job = sorted[i];
    const s_i = currentTime;
    const f_i = s_i + job.duration;
    const lateness = Math.max(0, f_i - job.deadline);

    currentTime = f_i;
    if (lateness > maxLateness) maxLateness = lateness;

    const scheduledJob: LatenessJob = {
      ...job,
      startTime: s_i,
      finishTime: f_i,
      lateness
    };
    scheduled.push(scheduledJob);

    pushEvent(
      'SCHEDULE_JOB',
      i,
      scheduledJob,
      `Programando "${job.name}" de t=${s_i} a t=${f_i} (duración ${job.duration}). Deadline: d=${job.deadline}.`,
      `Scheduling "${job.name}" from t=${s_i} to t=${f_i} (duration ${job.duration}). Deadline: d=${job.deadline}.`
    );

    pushEvent(
      'EVALUATE_LATENESS',
      i,
      scheduledJob,
      lateness > 0
        ? `Retraso en "${job.name}": L = f_i - d_i = ${f_i} - ${job.deadline} = ${lateness}. Retraso máximo global actual: ${maxLateness}.`
        : `"${job.name}" concluye a tiempo (f_i = ${f_i} ≤ d_i = ${job.deadline}). Retraso = 0. Retraso máximo global: ${maxLateness}.`,
      lateness > 0
        ? `Lateness for "${job.name}": L = f_i - d_i = ${f_i} - ${job.deadline} = ${lateness}. Global max lateness: ${maxLateness}.`
        : `"${job.name}" finishes on time (f_i = ${f_i} ≤ d_i = ${job.deadline}). Lateness = 0. Global max lateness: ${maxLateness}.`
    );
  }

  // 4. Complete
  pushEvent(
    'COMPLETE',
    sorted.length,
    null,
    `Cronograma EDF óptimo finalizado. Tiempo total de procesamiento = ${currentTime}. Retraso máximo mínimo alcanzado = ${maxLateness}. Ningún cronograma alternativo puede tener menor retraso máximo.`,
    `Optimal EDF schedule complete. Total processing time = ${currentTime}. Minimal max lateness achieved = ${maxLateness}. No alternative schedule can have lower max lateness.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
