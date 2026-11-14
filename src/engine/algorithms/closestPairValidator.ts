import { ValidationResult, Validator } from '../../types/validation';

export type Point2DInput = [number, number];

export interface ClosestPairInput {
  points: Point2DInput[];
}

export type ClosestPairOutput = number | { distance: number; pair?: [Point2DInput, Point2DInput] };

export function computeClosestPairDistance(points: Point2DInput[]): number {
  if (!Array.isArray(points) || points.length < 2) return Infinity;

  let minDist = Infinity;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    for (let j = i + 1; j < n; j++) {
      const p2 = points[j];
      const d = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
      if (d < minDist) {
        minDist = d;
      }
    }
  }
  return minDist;
}

export class ClosestPairValidator
  implements Validator<ClosestPairInput | Point2DInput[], ClosestPairOutput>
{
  validate(
    input: ClosestPairInput | Point2DInput[],
    output: ClosestPairOutput
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawPoints = Array.isArray(input) ? input : input?.points;

    if (!Array.isArray(rawPoints)) {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada de puntos debe ser un arreglo de coordenadas [x, y].'],
        warnings
      };
    }

    if (rawPoints.length < 2) {
      return {
        valid: false,
        isValid: false,
        errors: ['El conjunto de entrada debe contener al menos 2 puntos para calcular el par más cercano.'],
        warnings
      };
    }

    for (let i = 0; i < rawPoints.length; i++) {
      const pt = rawPoints[i];
      if (!Array.isArray(pt) || pt.length < 2 || typeof pt[0] !== 'number' || typeof pt[1] !== 'number' || Number.isNaN(pt[0]) || Number.isNaN(pt[1])) {
        errors.push(`Punto inválido en el índice ${i}: se esperaba [x, y] numérico.`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    let candDist: number;
    if (typeof output === 'number') {
      candDist = output;
    } else if (output && typeof output === 'object' && typeof output.distance === 'number') {
      candDist = output.distance;
    } else {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado devuelto debe ser un número con la distancia mínima o un objeto { distance: number }.'],
        warnings
      };
    }

    if (Number.isNaN(candDist) || !Number.isFinite(candDist) || candDist < 0) {
      errors.push(`La distancia calculada (${candDist}) debe ser un número finito no negativo.`);
      return { valid: false, isValid: false, errors, warnings };
    }

    const optimalDist = computeClosestPairDistance(rawPoints);
    const EPS = 1e-4;

    if (Math.abs(candDist - optimalDist) > EPS) {
      errors.push(
        `Distancia incorrecta: Se obtuvo ${candDist}, pero la distancia euclidiana mínima calculada es ${optimalDist.toFixed(4)}.`
      );
    }

    // Optional witness check without leaking
    if (typeof output === 'object' && output !== null && Array.isArray(output.pair)) {
      const [p1, p2] = output.pair;
      if (!Array.isArray(p1) || !Array.isArray(p2)) {
        errors.push('El par de puntos de testigo debe contener dos coordenadas [x, y].');
      } else {
        const pairDist = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
        if (Math.abs(pairDist - candDist) > EPS) {
          errors.push('La distancia entre los dos puntos del par testigo no coincide con la distancia reportada.');
        }
      }
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        pointsCount: rawPoints.length,
        optimalDistance: optimalDist
      }
    };
  }
}

export const closestPairValidator = new ClosestPairValidator();
