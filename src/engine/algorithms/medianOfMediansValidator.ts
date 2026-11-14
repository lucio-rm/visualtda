import { ValidationResult, Validator } from '../../types/validation';

export interface MedianOfMediansInputObject {
  array: number[];
  k: number;
}

export type MedianOfMediansInput =
  | MedianOfMediansInputObject
  | [number[], number];

export function selectKthElement(arr: number[], k: number): number {
  if (!arr.length) return NaN;
  const copy = [...arr].sort((a, b) => a - b);
  return copy[k];
}

export class MedianOfMediansValidator
  implements Validator<MedianOfMediansInput, number>
{
  validate(input: MedianOfMediansInput, output: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let array: number[] | undefined;
    let k: number | undefined;

    if (Array.isArray(input)) {
      if (Array.isArray(input[0])) {
        array = input[0];
        k = typeof input[1] === 'number' ? input[1] : undefined;
      }
    } else if (input && typeof input === 'object') {
      array = input.array;
      k = input.k;
    }

    if (!Array.isArray(array)) {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada debe contener un arreglo de números.'],
        warnings
      };
    }

    if (array.length === 0) {
      return {
        valid: false,
        isValid: false,
        errors: ['El arreglo no puede ser vacío.'],
        warnings
      };
    }

    if (typeof k !== 'number' || !Number.isInteger(k)) {
      return {
        valid: false,
        isValid: false,
        errors: ['El índice k debe ser un número entero.'],
        warnings
      };
    }

    if (k < 0 || k >= array.length) {
      return {
        valid: false,
        isValid: false,
        errors: [`El índice k (${k}) está fuera de rango para un arreglo de longitud ${array.length} (rango válido: 0 a ${array.length - 1}).`],
        warnings
      };
    }

    for (let i = 0; i < array.length; i++) {
      if (typeof array[i] !== 'number' || Number.isNaN(array[i])) {
        errors.push(`Elemento inválido en el índice ${i}: se esperaba un número.`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    if (typeof output !== 'number' || Number.isNaN(output)) {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe ser un valor numérico.'],
        warnings
      };
    }

    const expected = selectKthElement(array, k);

    if (output !== expected) {
      errors.push(
        `Selección incorrecta: Se retornó ${output}, pero el elemento en la posición de orden k = ${k} es ${expected}.`
      );
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        arrayLength: array.length,
        k,
        expectedValue: expected
      }
    };
  }
}

export const medianOfMediansValidator = new MedianOfMediansValidator();
