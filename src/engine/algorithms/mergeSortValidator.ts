import { ValidationResult, Validator } from '../../types/validation';

export interface MergeSortInput {
  array: number[];
}

export class MergeSortValidator implements Validator<MergeSortInput, number[]> {
  validate(input: MergeSortInput, result: number[]): ValidationResult {
    const { array } = input;
    const errors: string[] = [];

    if (!Array.isArray(result)) {
      return { valid: false, errors: ['El resultado debe ser un arreglo de números.'] };
    }

    if (result.length !== array.length) {
      errors.push(
        `Longitud incorrecta: Se esperaban ${array.length} elementos pero se obtuvieron ${result.length}.`
      );
      return { valid: false, errors };
    }

    // 1. Verify multiset equivalence (exact frequency of each element)
    const counts = new Map<number, number>();
    for (const val of array) {
      counts.set(val, (counts.get(val) || 0) + 1);
    }

    for (const val of result) {
      const current = counts.get(val) || 0;
      if (current <= 0) {
        errors.push(`El elemento ${val} no pertenece al arreglo original o su frecuencia fue alterada.`);
      } else {
        counts.set(val, current - 1);
      }
    }

    // 2. Verify non-decreasing sorted order
    for (let i = 0; i < result.length - 1; i++) {
      if (result[i] > result[i + 1]) {
        errors.push(
          `Infracción de orden: El elemento ${result[i]} en índice ${i} es mayor que el elemento ${result[i + 1]} en índice ${i + 1}.`
        );
        break; // One violation example is enough
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const mergeSortValidator = new MergeSortValidator();
