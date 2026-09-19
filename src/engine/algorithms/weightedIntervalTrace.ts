import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';
import {
  WeightedInterval,
  computePArray,
  solveWeightedIntervalsGreedy
} from './weightedIntervalValidator';

export type WeightedIntervalAction =
  | 'INIT'
  | 'SORTED'
  | 'COMPUTE_P'
  | 'EVALUATE_INTERVAL'
  | 'START_RECONSTRUCTION'
  | 'RECONSTRUCT_INCLUDE'
  | 'RECONSTRUCT_EXCLUDE'
  | 'COMPLETE';

export interface WeightedIntervalStepData {
  sortedIntervals: WeightedInterval[];
  pArray: number[];
  optArray: number[];
  currentJ: number | null;
  evalExcludeVal: number | null;
  evalIncludeVal: number | null;
  reconstructedIds: string[];
  greedyIds: string[];
  action: WeightedIntervalAction;
  description: LocalizedString;
}

export const DEFAULT_WEIGHTED_INTERVALS: WeightedInterval[] = [
  { id: 'T1', start: 0, end: 3, weight: 2 },
  { id: 'T2', start: 1, end: 6, weight: 10 },
  { id: 'T3', start: 4, end: 8, weight: 3 },
  { id: 'T4', start: 7, end: 11, weight: 8 },
  { id: 'T5', start: 9, end: 12, weight: 4 }
];

export function generateWeightedIntervalTrace(
  rawIntervals: WeightedInterval[] = DEFAULT_WEIGHTED_INTERVALS
): TraceTimeline<WeightedIntervalStepData> {
  const events: TraceEvent<WeightedIntervalStepData>[] = [];
  let stepIndex = 0;

  const sorted = [...rawIntervals].sort((a, b) => a.end - b.end || a.start - b.start);
  const n = sorted.length;
  const pArray = computePArray(sorted);
  const opt = new Array(n + 1).fill(0);

  const greedySelection = solveWeightedIntervalsGreedy(rawIntervals);
  const greedyIds = greedySelection.map((item) => item.id);

  // Step 0: INIT
  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicialización: ${n} tareas recibidas. Caso base: OPT[0] = 0 (cero ganancia sin tareas).`,
      en: `Initialization: ${n} tasks received. Base case: OPT[0] = 0 (zero profit with no tasks).`
    },
    data: {
      sortedIntervals: sorted,
      pArray: new Array(n + 1).fill(0),
      optArray: [...opt],
      currentJ: null,
      evalExcludeVal: null,
      evalIncludeVal: null,
      reconstructedIds: [],
      greedyIds,
      action: 'INIT',
      description: {
        es: `Comenzamos con la lista de tareas. El primer paso consiste en ordenar por tiempo de fin para habilitar la subestructura óptima.`,
        en: `Starting with task list. First step sorts by finish time to enable optimal substructure.`
      }
    }
  });

  // Step 1: SORTED & COMPUTE_P
  events.push({
    step: stepIndex++,
    type: 'COMPUTE_P',
    message: {
      es: `Tareas ordenadas por tiempo de finalización. Función predecesora p(j) precalculada con búsqueda binaria en O(n log n).`,
      en: `Tasks sorted by finish time. Predecessor function p(j) precomputed via binary search in O(n log n).`
    },
    data: {
      sortedIntervals: sorted,
      pArray: [...pArray],
      optArray: [...opt],
      currentJ: null,
      evalExcludeVal: null,
      evalIncludeVal: null,
      reconstructedIds: [],
      greedyIds,
      action: 'COMPUTE_P',
      description: {
        es: `Para cada tarea j, p(j) identifica la última tarea compatible que finaliza antes o en su inicio.`,
        en: `For each task j, p(j) identifies the last compatible task finishing on or before its start.`
      }
    }
  });

  // Steps: DP Fill
  for (let j = 1; j <= n; j++) {
    const task = sorted[j - 1];
    const excludeVal = opt[j - 1];
    const includeVal = task.weight + opt[pArray[j]];

    events.push({
      step: stepIndex++,
      type: 'EVALUATE_INTERVAL',
      message: {
        es: `Evaluando tarea ${j} (${task.id}: [${task.start}, ${task.end}], peso ${task.weight}). Excluir: OPT[${j - 1}]=${excludeVal} vs Incluir: ${task.weight} + OPT[p(${j})=${pArray[j]}]=${includeVal}.`,
        en: `Evaluating task ${j} (${task.id}: [${task.start}, ${task.end}], weight ${task.weight}). Exclude: OPT[${j - 1}]=${excludeVal} vs Include: ${task.weight} + OPT[p(${j})=${pArray[j]}]=${includeVal}.`
      },
      data: {
        sortedIntervals: sorted,
        pArray: [...pArray],
        optArray: [...opt],
        currentJ: j,
        evalExcludeVal: excludeVal,
        evalIncludeVal: includeVal,
        reconstructedIds: [],
        greedyIds,
        action: 'EVALUATE_INTERVAL',
        description: {
          es: `Ecuación de Bellman: OPT[${j}] = max(OPT[${j - 1}], v_${j} + OPT[${pArray[j]}]) = max(${excludeVal}, ${includeVal}).`,
          en: `Bellman recurrence: OPT[${j}] = max(OPT[${j - 1}], v_${j} + OPT[${pArray[j]}]) = max(${excludeVal}, ${includeVal}).`
        }
      }
    });

    opt[j] = Math.max(excludeVal, includeVal);
  }

  // Step: START_RECONSTRUCTION
  events.push({
    step: stepIndex++,
    type: 'START_RECONSTRUCTION',
    message: {
      es: `Tabla DP completa. Valor óptimo total alcanzable: OPT[${n}] = ${opt[n]}. Iniciando reconstrucción hacia atrás.`,
      en: `DP table complete. Optimal total value reachable: OPT[${n}] = ${opt[n]}. Starting backwards reconstruction.`
    },
    data: {
      sortedIntervals: sorted,
      pArray: [...pArray],
      optArray: [...opt],
      currentJ: n,
      evalExcludeVal: null,
      evalIncludeVal: null,
      reconstructedIds: [],
      greedyIds,
      action: 'START_RECONSTRUCTION',
      description: {
        es: `Iniciamos en j = ${n} y rastreamos qué tareas generaron el valor máximo.`,
        en: `Starting at j = ${n} tracing which tasks contributed to the maximum value.`
      }
    }
  });

  // Reconstruction steps
  const reconstructed: WeightedInterval[] = [];
  let curr = n;

  while (curr > 0) {
    const task = sorted[curr - 1];
    const includeVal = task.weight + opt[pArray[curr]];

    if (includeVal >= opt[curr - 1]) {
      reconstructed.unshift(task);
      const prev = curr;
      curr = pArray[curr];

      events.push({
        step: stepIndex++,
        type: 'RECONSTRUCT_INCLUDE',
        message: {
          es: `Reconstrucción: Tarea ${task.id} (peso ${task.weight}) FUE SELECCIONADA. Saltamos al predecesor p(${prev}) = ${curr}.`,
          en: `Reconstruction: Task ${task.id} (weight ${task.weight}) WAS SELECTED. Jumping to predecessor p(${prev}) = ${curr}.`
        },
        data: {
          sortedIntervals: sorted,
          pArray: [...pArray],
          optArray: [...opt],
          currentJ: curr,
          evalExcludeVal: null,
          evalIncludeVal: null,
          reconstructedIds: reconstructed.map((t) => t.id),
          greedyIds,
          action: 'RECONSTRUCT_INCLUDE',
          description: {
            es: `Incluimos ${task.id}. Ninguna tarea entre ${curr + 1} y ${prev - 1} puede usarse por superposición. Siguiente subproblema: ${curr}.`,
            en: `Included ${task.id}. Tasks between ${curr + 1} and ${prev - 1} excluded due to overlap. Next subproblem: ${curr}.`
          }
        }
      });
    } else {
      curr -= 1;
      events.push({
        step: stepIndex++,
        type: 'RECONSTRUCT_EXCLUDE',
        message: {
          es: `Reconstrucción: Tarea ${task.id} NO fue seleccionada (su peso no mejoró la solución previa). Pasamos a ${curr}.`,
          en: `Reconstruction: Task ${task.id} was NOT selected (weight did not beat previous solution). Stepping to ${curr}.`
        },
        data: {
          sortedIntervals: sorted,
          pArray: [...pArray],
          optArray: [...opt],
          currentJ: curr,
          evalExcludeVal: null,
          evalIncludeVal: null,
          reconstructedIds: reconstructed.map((t) => t.id),
          greedyIds,
          action: 'RECONSTRUCT_EXCLUDE',
          description: {
            es: `La tarea ${task.id} se descarta. Continuamos evaluando subproblema j = ${curr}.`,
            en: `Task ${task.id} is skipped. Continuing evaluation on subproblem j = ${curr}.`
          }
        }
      });
    }
  }

  // Step: COMPLETE
  const dpTotalWeight = reconstructed.reduce((sum, t) => sum + t.weight, 0);
  const greedyTotalWeight = greedySelection.reduce((sum, t) => sum + t.weight, 0);

  events.push({
    step: stepIndex++,
    type: 'COMPLETE',
    message: {
      es: `¡Planificación óptima completada! Tareas seleccionadas: [${reconstructed.map((t) => t.id).join(', ')}] con valor total de ${dpTotalWeight}.`,
      en: `Optimal scheduling complete! Selected tasks: [${reconstructed.map((t) => t.id).join(', ')}] with total weight ${dpTotalWeight}.`
    },
    data: {
      sortedIntervals: sorted,
      pArray: [...pArray],
      optArray: [...opt],
      currentJ: 0,
      evalExcludeVal: null,
      evalIncludeVal: null,
      reconstructedIds: reconstructed.map((t) => t.id),
      greedyIds,
      action: 'COMPLETE',
      description: {
        es: `Programación Dinámica obtuvo peso ${dpTotalWeight}. En contraste, la heurística Greedy (fin más temprano) obtuvo solo peso ${greedyTotalWeight} con [${greedyIds.join(', ')}].`,
        en: `Dynamic Programming obtained weight ${dpTotalWeight}. In contrast, Greedy (earliest finish time) only obtained weight ${greedyTotalWeight} with [${greedyIds.join(', ')}].`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
