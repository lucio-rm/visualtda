import { TraceEvent, TraceTimeline } from '../../types/trace';
import { Interval } from './intervalSchedulingValidator';

export interface IntervalItem {
  id: string;
  start: number;
  end: number;
}

export interface IntervalSchedulingStepData {
  allIntervals: IntervalItem[];
  currentIndex: number;
  lastSelectedId: string | null;
  selectedIds: string[];
  rejectedIds: string[];
  currentStatus: 'evaluating' | 'selected' | 'rejected' | 'idle';
  lastEndTime: number;
}

export const DEFAULT_INTERVALS: Interval[] = [
  [0, 3],
  [1, 5],
  [3, 6],
  [4, 8],
  [6, 9],
  [7, 10]
];

export function generateIntervalSchedulingTrace(
  rawIntervals: Interval[] = DEFAULT_INTERVALS
): TraceTimeline<IntervalSchedulingStepData> {
  const events: TraceEvent<IntervalSchedulingStepData>[] = [];

  // Convert to structured items
  const items: IntervalItem[] = rawIntervals.map(([start, end], idx) => ({
    id: `task-${idx + 1}`,
    start,
    end
  }));

  // Initial event
  events.push({
    step: 0,
    type: 'init',
    message: {
      es: `Cargando ${items.length} tareas para programación de intervalos.`,
      en: `Loading ${items.length} tasks for interval scheduling.`
    },
    data: {
      allIntervals: [...items],
      currentIndex: -1,
      lastSelectedId: null,
      selectedIds: [],
      rejectedIds: [],
      currentStatus: 'idle',
      lastEndTime: -Infinity
    }
  });

  // Sort by finish time
  const sorted = [...items].sort((a, b) => a.end - b.end);

  events.push({
    step: 1,
    type: 'sort',
    message: {
      es: 'Regla Greedy: Ordenando tareas en orden creciente por tiempo de fin.',
      en: 'Greedy Choice: Sorting tasks in ascending order by finish time.'
    },
    data: {
      allIntervals: [...sorted],
      currentIndex: -1,
      lastSelectedId: null,
      selectedIds: [],
      rejectedIds: [],
      currentStatus: 'idle',
      lastEndTime: -Infinity
    }
  });

  const selectedIds: string[] = [];
  const rejectedIds: string[] = [];
  let lastEndTime = -Infinity;
  let lastSelectedId: string | null = null;
  let stepIndex = 2;

  for (let i = 0; i < sorted.length; i++) {
    const task = sorted[i];

    // Event: Consider
    events.push({
      step: stepIndex++,
      type: 'consider',
      message: {
        es: `Evaluando tarea ${task.id} [${task.start} → ${task.end}].`,
        en: `Evaluating task ${task.id} [${task.start} → ${task.end}].`
      },
      data: {
        allIntervals: sorted,
        currentIndex: i,
        lastSelectedId,
        selectedIds: [...selectedIds],
        rejectedIds: [...rejectedIds],
        currentStatus: 'evaluating',
        lastEndTime
      }
    });

    if (task.start >= lastEndTime) {
      // Event: Select
      selectedIds.push(task.id);
      lastEndTime = task.end;
      lastSelectedId = task.id;

      events.push({
        step: stepIndex++,
        type: 'select',
        message: {
          es: `Compatible (inicio ${task.start} ≥ último fin ${lastEndTime === task.end ? 'previo' : lastEndTime}). Seleccionada tarea ${task.id}.`,
          en: `Compatible (start ${task.start} ≥ last finish). Selected task ${task.id}.`
        },
        data: {
          allIntervals: sorted,
          currentIndex: i,
          lastSelectedId,
          selectedIds: [...selectedIds],
          rejectedIds: [...rejectedIds],
          currentStatus: 'selected',
          lastEndTime
        }
      });
    } else {
      // Event: Conflict / Reject
      rejectedIds.push(task.id);

      events.push({
        step: stepIndex++,
        type: 'conflict',
        message: {
          es: `Incompatible (inicio ${task.start} < último fin ${lastEndTime}). Descartada tarea ${task.id}.`,
          en: `Incompatible (start ${task.start} < last finish ${lastEndTime}). Discarded task ${task.id}.`
        },
        data: {
          allIntervals: sorted,
          currentIndex: i,
          lastSelectedId,
          selectedIds: [...selectedIds],
          rejectedIds: [...rejectedIds],
          currentStatus: 'rejected',
          lastEndTime
        }
      });
    }
  }

  // Completion event
  events.push({
    step: stepIndex,
    type: 'complete',
    message: {
      es: `Finalizado: Solución óptima encontrada con ${selectedIds.length} tareas compatibles máximas.`,
      en: `Completed: Optimal solution found with ${selectedIds.length} maximum compatible tasks.`
    },
    data: {
      allIntervals: sorted,
      currentIndex: -1,
      lastSelectedId,
      selectedIds: [...selectedIds],
      rejectedIds: [...rejectedIds],
      currentStatus: 'idle',
      lastEndTime
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
