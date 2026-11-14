import { ValidationResult, Validator } from '../../types/validation';

export interface MajorityElementInputObject {
  array: number[];
}

export type MajorityElementInput = MajorityElementInputObject | number[];

export type MajorityElementOutput = number | null;

export function findMajorityElement(arr: number[]): number | null {
  if (!Array.isArray(arr) || arr.length === 0) return null;

  const threshold = Math.floor(arr.length / 2);
  const freq = new Map<number, number>();

  for (const x of arr) {
    const next = (freq.get(x) || 0) + 1;
    freq.set(x, next);
    if (next > threshold) {
      return x;
    }
  }

  return null;
}

export class MajorityElementValidator
  implements Validator<MajorityElementInput, MajorityElementOutput>
{
  validate(
    input: MajorityElementInput,
    output: MajorityElementOutput
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const array = Array.isArray(input) ? input : input?.array;

    if (!Array.isArray(array)) {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada debe ser un arreglo de números o un objeto { array: number[] }.'],
        warnings
      };
    }

    for (let i = 0; i < array.length; i++) {
      if (typeof array[i] !== 'number' || Number.isNaN(array[i])) {
        errors.push(`Elemento inválido en el índice ${i}: se esperaba un número.`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    if (output !== null && typeof output !== 'number') {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe ser un número o null.'],
        warnings
      };
    }

    const expected = findMajorityElement(array);

    if (expected === null) {
      if (output !== null && output !== undefined) {
        errors.push(
          `Falso positivo: El arreglo no contiene ningún elemento con más de n/2 apariciones, pero se retornó ${output}.`
        );
      }
    } else {
      if (output === null || output === undefined) {
        errors.push(
          `Falso negativo: El arreglo posee un elemento mayoritario estricto con más de n/2 apariciones, pero se retornó null.`
        );
      } else if (output !== expected) {
        errors.push(
          `Elemento incorrecto: Se retornó ${output}, pero no cumple con tener más de n/2 apariciones estrictas en el arreglo.`
        );
      }
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        arrayLength: array.length,
        hasMajority: expected !== null
      }
    };
  }
}

export const majorityElementValidator = new MajorityElementValidator();
