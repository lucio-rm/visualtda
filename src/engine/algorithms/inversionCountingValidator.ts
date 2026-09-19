import { ValidationResult, Validator } from '../../types/validation';

export interface InversionCountingInput {
  array: number[];
}

/**
 * Naive O(n^2) inversion counter: used for verification and small-instance testing.
 */
export function countInversionsNaive(arr: number[]): number {
  let count = 0;
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (arr[i] > arr[j]) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Returns the exact list of inverted index pairs [i, j] where i < j and arr[i] > arr[j].
 */
export function getInversionPairs(arr: number[]): [number, number][] {
  const pairs: [number, number][] = [];
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (arr[i] > arr[j]) {
        pairs.push([i, j]);
      }
    }
  }
  return pairs;
}

/**
 * Fast O(n log n) Divide and Conquer inversion counter.
 */
export function countInversions(arr: number[]): number {
  if (arr.length <= 1) return 0;

  function mergeAndCount(left: number[], right: number[]): [number, number[]] {
    let i = 0;
    let j = 0;
    let splitCount = 0;
    const merged: number[] = [];

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        merged.push(left[i]);
        i++;
      } else {
        merged.push(right[j]);
        splitCount += left.length - i;
        j++;
      }
    }

    while (i < left.length) {
      merged.push(left[i]);
      i++;
    }

    while (j < right.length) {
      merged.push(right[j]);
      j++;
    }

    return [splitCount, merged];
  }

  function sortAndCount(sub: number[]): [number, number[]] {
    if (sub.length <= 1) return [0, [...sub]];

    const mid = Math.floor(sub.length / 2);
    const [leftCount, leftSorted] = sortAndCount(sub.slice(0, mid));
    const [rightCount, rightSorted] = sortAndCount(sub.slice(mid));
    const [splitCount, merged] = mergeAndCount(leftSorted, rightSorted);

    return [leftCount + rightCount + splitCount, merged];
  }

  const [total] = sortAndCount(arr);
  return total;
}

export class InversionCountingValidator implements Validator<InversionCountingInput, number> {
  validate(input: InversionCountingInput, result: number): ValidationResult {
    const { array } = input;
    const errors: string[] = [];

    if (typeof result !== 'number' || isNaN(result) || result < 0 || !Number.isInteger(result)) {
      return {
        valid: false,
        errors: ['El resultado debe ser un número entero no negativo que represente el conteo de inversiones.']
      };
    }

    const expected = countInversions(array);

    if (result !== expected) {
      const pairs = getInversionPairs(array);
      const sample = pairs.slice(0, 3).map(([i, j]) => `(${i}, ${j}) [${array[i]} > ${array[j]}]`).join(', ');
      errors.push(
        `Conteo incorrecto: se obtuvieron ${result} inversiones, pero el arreglo posee exactamente ${expected} inversiones.${sample ? ` Ejemplos: ${sample}...` : ''}`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const inversionCountingValidator = new InversionCountingValidator();
