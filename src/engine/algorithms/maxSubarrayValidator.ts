import { ValidationResult, Validator } from '../../types/validation';

export interface MaxSubarrayInput {
  array: number[];
}

export function computeOptimalMaxSubarray(array: number[]): {
  maxSum: number;
  startIndex: number;
  endIndex: number;
  subarray: number[];
} {
  if (array.length === 0) {
    return { maxSum: 0, startIndex: 0, endIndex: 0, subarray: [] };
  }

  let maxEndingHere = array[0];
  let maxSoFar = array[0];
  let start = 0;
  let end = 0;
  let tempStart = 0;

  for (let i = 1; i < array.length; i++) {
    if (array[i] > maxEndingHere + array[i]) {
      maxEndingHere = array[i];
      tempStart = i;
    } else {
      maxEndingHere += array[i];
    }

    if (maxEndingHere > maxSoFar) {
      maxSoFar = maxEndingHere;
      start = tempStart;
      end = i;
    }
  }

  return {
    maxSum: maxSoFar,
    startIndex: start,
    endIndex: end,
    subarray: array.slice(start, end + 1)
  };
}

export class MaxSubarrayValidator implements Validator<MaxSubarrayInput, number[]> {
  validate(input: MaxSubarrayInput, result: number[]): ValidationResult {
    const { array } = input;
    const errors: string[] = [];

    if (!Array.isArray(result)) {
      return { valid: false, errors: ['El resultado debe ser un arreglo de números (subarreglo contiguo).'] };
    }

    if (array.length === 0) {
      if (result.length > 0) {
        return { valid: false, errors: ['Para un arreglo vacío, el subarreglo debe ser vacío.'] };
      }
      return { valid: true, errors: [] };
    }

    if (result.length === 0) {
      return { valid: false, errors: ['El subarreglo no puede estar vacío para un arreglo no vacío.'] };
    }

    // 1. Check if result is a contiguous subarray of array
    let matchFound = false;

    for (let i = 0; i <= array.length - result.length; i++) {
      let isMatch = true;
      for (let j = 0; j < result.length; j++) {
        if (array[i + j] !== result[j]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        matchFound = true;
        break;
      }
    }

    if (!matchFound) {
      errors.push('El resultado devuelto no es un subarreglo contiguo del arreglo original.');
      return { valid: false, errors };
    }

    // 2. Compute sum of candidate
    const candidateSum = result.reduce((acc, val) => acc + val, 0);

    // 3. Compute ground truth optimal sum
    const optimal = computeOptimalMaxSubarray(array);

    if (candidateSum < optimal.maxSum) {
      errors.push(
        `Suma subóptima: El subarreglo [${result.join(', ')}] suma ${candidateSum}, pero el subarreglo óptimo tiene suma ${optimal.maxSum}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const maxSubarrayValidator = new MaxSubarrayValidator();
