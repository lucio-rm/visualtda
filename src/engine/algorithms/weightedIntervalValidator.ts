import { ValidationResult, Validator } from '../../types/validation';

export interface WeightedInterval {
  id: string;
  start: number;
  end: number;
  weight: number;
}

export interface WeightedIntervalInput {
  intervals: WeightedInterval[];
}

export function computePArray(sorted: WeightedInterval[]): number[] {
  const n = sorted.length;
  const p = new Array(n + 1).fill(0);

  for (let j = 1; j <= n; j++) {
    const startJ = sorted[j - 1].start;
    let low = 1;
    let high = j - 1;
    let best = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (sorted[mid - 1].end <= startJ) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    p[j] = best;
  }

  return p;
}

export function solveWeightedIntervals(intervals: WeightedInterval[]): WeightedInterval[] {
  if (!intervals.length) return [];

  // Sort by end time
  const sorted = [...intervals].sort((a, b) => a.end - b.end || a.start - b.start);
  const n = sorted.length;
  const p = computePArray(sorted);

  const opt = new Array(n + 1).fill(0);
  for (let j = 1; j <= n; j++) {
    const includeWeight = sorted[j - 1].weight + opt[p[j]];
    const excludeWeight = opt[j - 1];
    opt[j] = Math.max(excludeWeight, includeWeight);
  }

  // Reconstruction
  const selected: WeightedInterval[] = [];
  let curr = n;
  while (curr > 0) {
    const includeWeight = sorted[curr - 1].weight + opt[p[curr]];
    if (includeWeight >= opt[curr - 1]) {
      selected.push(sorted[curr - 1]);
      curr = p[curr];
    } else {
      curr -= 1;
    }
  }

  return selected.reverse();
}

/**
 * Greedy heuristic (Earliest Finish Time): demonstrates failure when weights vary.
 */
export function solveWeightedIntervalsGreedy(intervals: WeightedInterval[]): WeightedInterval[] {
  if (!intervals.length) return [];
  const sorted = [...intervals].sort((a, b) => a.end - b.end);

  const selected: WeightedInterval[] = [];
  let lastEnd = -Infinity;

  for (const item of sorted) {
    if (item.start >= lastEnd) {
      selected.push(item);
      lastEnd = item.end;
    }
  }

  return selected;
}

export class WeightedIntervalValidator implements Validator<WeightedIntervalInput, WeightedInterval[]> {
  validate(input: WeightedIntervalInput, result: WeightedInterval[]): ValidationResult {
    const { intervals } = input;
    const errors: string[] = [];

    if (!Array.isArray(result)) {
      return {
        valid: false,
        errors: ['El resultado debe ser un arreglo de intervalos compatibles.']
      };
    }

    if (intervals.length === 0) {
      if (result.length !== 0) {
        errors.push('Para una lista vacía de tareas, el resultado debe ser un arreglo vacío ([]).');
      }
      return { valid: errors.length === 0, errors };
    }

    const availableMap = new Map<string, WeightedInterval>();
    for (const item of intervals) {
      availableMap.set(item.id, item);
    }

    // 1. Check all selected belong to original set without duplicates
    const seenIds = new Set<string>();
    for (const item of result) {
      if (!availableMap.has(item.id)) {
        errors.push(`El intervalo con ID "${item.id}" no existe en el conjunto de tareas de entrada.`);
      }
      if (seenIds.has(item.id)) {
        errors.push(`El intervalo con ID "${item.id}" está duplicado en la solución.`);
      }
      seenIds.add(item.id);
    }

    // 2. Check mutual compatibility
    const sortedResult = [...result].sort((a, b) => a.start - b.start);
    for (let i = 0; i < sortedResult.length - 1; i++) {
      if (sortedResult[i].end > sortedResult[i + 1].start) {
        errors.push(
          `Conflicto de superposición: La tarea "${sortedResult[i].id}" [${sortedResult[i].start}, ${sortedResult[i].end}] se superpone con "${sortedResult[i + 1].id}" [${sortedResult[i + 1].start}, ${sortedResult[i + 1].end}].`
        );
      }
    }

    // 3. Check optimality against DP solver
    const optimal = solveWeightedIntervals(intervals);
    const optimalWeight = optimal.reduce((sum, item) => sum + item.weight, 0);
    const candidateWeight = result.reduce((sum, item) => sum + item.weight, 0);

    if (candidateWeight < optimalWeight) {
      errors.push(
        `El peso total obtenido (${candidateWeight}) es subóptimo. La Programación Dinámica alcanza un peso total de ${optimalWeight}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const weightedIntervalValidator = new WeightedIntervalValidator();
