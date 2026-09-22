export interface KnapsackBBValidationResult {
  valid: boolean;
  errors: string[];
}

export function solveKnapsackBranchAndBound(
  capacity: number,
  weights: number[],
  values: number[]
): number {
  const n = weights.length;
  if (n === 0 || capacity <= 0) return 0;

  const items = weights
    .map((w, idx) => ({ w, v: values[idx], ratio: values[idx] / w }))
    .sort((a, b) => b.ratio - a.ratio);

  let bestVal = 0;

  function upperBound(idx: number, curW: number, curV: number): number {
    if (curW > capacity) return 0;
    let bound = curV;
    let remCap = capacity - curW;
    for (let i = idx; i < n; i++) {
      const it = items[i];
      if (it.w <= remCap) {
        remCap -= it.w;
        bound += it.v;
      } else {
        bound += it.v * (remCap / it.w);
        break;
      }
    }
    return bound;
  }

  function explore(idx: number, curW: number, curV: number) {
    if (curW <= capacity && curV > bestVal) {
      bestVal = curV;
    }
    if (idx === n || curW > capacity) return;
    if (upperBound(idx, curW, curV) <= bestVal) return;

    const it = items[idx];
    if (curW + it.w <= capacity) {
      explore(idx + 1, curW + it.w, curV + it.v);
    }
    explore(idx + 1, curW, curV);
  }

  explore(0, 0, 0);
  return bestVal;
}

export const knapsackBranchAndBoundValidator = {
  validate(
    capacity: number,
    weights: number[],
    values: number[],
    resultVal: number
  ): KnapsackBBValidationResult {
    const errors: string[] = [];
    const expected = solveKnapsackBranchAndBound(capacity, weights, values);

    if (typeof resultVal !== 'number' || isNaN(resultVal)) {
      return { valid: false, errors: ['El valor óptimo retornado debe ser un número entero.'] };
    }

    if (resultVal !== expected) {
      errors.push(`Valor retornado (${resultVal}) no coincide con el óptimo global (${expected}).`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
