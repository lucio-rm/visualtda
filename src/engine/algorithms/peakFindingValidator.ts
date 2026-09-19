import { ValidationResult, Validator } from '../../types/validation';

export interface PeakFindingInput {
  array: number[];
}

export function solvePeakFinding(arr: number[]): number {
  if (!arr.length) return -1;
  let inicio = 0;
  let fin = arr.length - 1;

  while (inicio <= fin) {
    const medio = Math.floor((inicio + fin) / 2);

    if (medio > 0 && arr[medio] < arr[medio - 1]) {
      fin = medio - 1;
    } else if (medio < arr.length - 1 && arr[medio] < arr[medio + 1]) {
      inicio = medio + 1;
    } else {
      return medio;
    }
  }

  return inicio;
}

export class PeakFindingValidator implements Validator<PeakFindingInput, number> {
  validate(input: PeakFindingInput, result: number): ValidationResult {
    const { array } = input;
    const errors: string[] = [];

    if (array.length === 0) {
      if (result !== -1) {
        errors.push('Para un arreglo vacío el índice de pico retornado debe ser -1.');
      }
      return { valid: errors.length === 0, errors };
    }

    if (!Number.isInteger(result) || result < 0 || result >= array.length) {
      return {
        valid: false,
        errors: [
          `El índice retornado (${result}) está fuera de los límites válidos del arreglo [0, ${array.length - 1}].`
        ]
      };
    }

    const val = array[result];

    // Check left neighbor
    if (result > 0) {
      const leftVal = array[result - 1];
      if (val < leftVal) {
        errors.push(
          `El elemento en el índice ${result} (${val}) no es un pico porque es estrictamente menor que su vecino izquierdo en el índice ${result - 1} (${leftVal}).`
        );
      }
    }

    // Check right neighbor
    if (result < array.length - 1) {
      const rightVal = array[result + 1];
      if (val < rightVal) {
        errors.push(
          `El elemento en el índice ${result} (${val}) no es un pico porque es estrictamente menor que su vecino derecho en el índice ${result + 1} (${rightVal}).`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const peakFindingValidator = new PeakFindingValidator();
