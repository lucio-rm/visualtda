import { ValidationResult, Validator } from '../../types/validation';

export interface KaratsubaInputObject {
  x: number | bigint | string;
  y: number | bigint | string;
}

export type KaratsubaInput = KaratsubaInputObject | [number | bigint | string, number | bigint | string];

export type KaratsubaOutput = number | bigint | string;

export function karatsubaMultiply(a: bigint, b: bigint): bigint {
  if (a < 10n || b < 10n) {
    return a * b;
  }
  const sA = a.toString();
  const sB = b.toString();
  const n = Math.max(sA.length, sB.length);
  const m = Math.floor(n / 2);
  const power = 10n ** BigInt(m);

  const x1 = a / power;
  const x0 = a % power;
  const y1 = b / power;
  const y0 = b % power;

  const z2 = karatsubaMultiply(x1, y1);
  const z0 = karatsubaMultiply(x0, y0);
  const z1 = karatsubaMultiply(x1 + x0, y1 + y0) - z2 - z0;

  return (z2 * (10n ** BigInt(2 * m))) + (z1 * power) + z0;
}

export class KaratsubaValidator implements Validator<KaratsubaInput, KaratsubaOutput> {
  validate(input: KaratsubaInput, output: KaratsubaOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let rawX: unknown;
    let rawY: unknown;

    if (Array.isArray(input)) {
      rawX = input[0];
      rawY = input[1];
    } else if (input && typeof input === 'object') {
      rawX = input.x;
      rawY = input.y;
    } else {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada de multiplicación debe ser un objeto { x, y } o una tupla [x, y].'],
        warnings
      };
    }

    let bigX: bigint;
    let bigY: bigint;
    try {
      bigX = BigInt(String(rawX ?? ''));
      bigY = BigInt(String(rawY ?? ''));
    } catch {
      return {
        valid: false,
        isValid: false,
        errors: ['Los operandos x e y deben ser números enteros válidos.'],
        warnings
      };
    }

    let actualProduct: bigint;
    try {
      actualProduct = BigInt(String(output ?? ''));
    } catch {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe ser un valor entero (número, bigint o cadena numérica).'],
        warnings
      };
    }

    const expectedProduct = bigX * bigY;

    if (actualProduct !== expectedProduct) {
      errors.push(
        `Producto incorrecto: Se obtuvo ${actualProduct}, pero el producto algebraico x × y esperado es ${expectedProduct}.`
      );
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        x: bigX.toString(),
        y: bigY.toString(),
        product: expectedProduct.toString()
      }
    };
  }
}

export const karatsubaValidator = new KaratsubaValidator();
