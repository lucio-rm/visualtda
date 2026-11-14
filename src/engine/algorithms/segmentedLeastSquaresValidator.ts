import { ValidationResult, Validator } from '../../types/validation';

export type PointCoord = [number, number];

export interface SegmentedLeastSquaresInputObject {
  points: PointCoord[];
  penaltyC: number;
}

export type SegmentedLeastSquaresInput =
  | SegmentedLeastSquaresInputObject
  | [PointCoord[], number];

export type SegmentedLeastSquaresOutput =
  | number
  | [number, number[]]
  | { optimalCost: number; partitions?: number[] };

export function solveSegmentedLeastSquares(
  points: PointCoord[],
  penaltyC: number
): { optimalCost: number; partitions: number[] } {
  const n = points.length;
  if (n === 0) return { optimalCost: 0, partitions: [] };

  // Sort points by x coordinate
  const pts = [...points].sort((a, b) => a[0] - b[0]);

  // Precompute squared errors e[i][j]
  const e: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const seg = pts.slice(i, j + 1);
      const k = seg.length;
      if (k <= 2) {
        e[i][j] = 0;
      } else {
        const sumX = seg.reduce((acc, p) => acc + p[0], 0);
        const sumY = seg.reduce((acc, p) => acc + p[1], 0);
        const sumXY = seg.reduce((acc, p) => acc + p[0] * p[1], 0);
        const sumX2 = seg.reduce((acc, p) => acc + p[0] * p[0], 0);
        const den = k * sumX2 - sumX * sumX;

        let a = 0;
        let b = sumY / k;
        if (Math.abs(den) > 1e-9) {
          a = (k * sumXY - sumX * sumY) / den;
          b = (sumY - a * sumX) / k;
        }

        const err = seg.reduce((acc, p) => acc + (p[1] - (a * p[0] + b)) ** 2, 0);
        e[i][j] = err;
      }
    }
  }

  const opt = new Array(n + 1).fill(0);
  const segmentStart = new Array(n + 1).fill(1);

  for (let j = 1; j <= n; j++) {
    let minCost = Infinity;
    let bestI = 1;
    for (let i = 1; i <= j; i++) {
      const cost = e[i - 1][j - 1] + penaltyC + opt[i - 1];
      if (cost < minCost) {
        minCost = cost;
        bestI = i;
      }
    }
    opt[j] = minCost;
    segmentStart[j] = bestI;
  }

  const partitions: number[] = [];
  let curr = n;
  while (curr > 0) {
    partitions.push(curr);
    curr = segmentStart[curr] - 1;
  }
  partitions.reverse();

  return { optimalCost: opt[n], partitions };
}

export class SegmentedLeastSquaresValidator
  implements Validator<SegmentedLeastSquaresInput, SegmentedLeastSquaresOutput>
{
  validate(
    input: SegmentedLeastSquaresInput,
    output: SegmentedLeastSquaresOutput
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let points: PointCoord[] | undefined;
    let penaltyC: number | undefined;

    if (Array.isArray(input)) {
      if (Array.isArray(input[0])) {
        points = input[0] as PointCoord[];
        penaltyC = typeof input[1] === 'number' ? input[1] : undefined;
      }
    } else if (input && typeof input === 'object') {
      points = input.points;
      penaltyC = input.penaltyC;
    }

    if (!Array.isArray(points)) {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada de puntos debe ser un arreglo de coordenadas [x, y].'],
        warnings
      };
    }

    if (typeof penaltyC !== 'number' || Number.isNaN(penaltyC) || penaltyC < 0) {
      return {
        valid: false,
        isValid: false,
        errors: ['El parámetro de penalidad C debe ser un número no negativo.'],
        warnings
      };
    }

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      if (!Array.isArray(p) || p.length < 2 || typeof p[0] !== 'number' || typeof p[1] !== 'number') {
        errors.push(`Punto inválido en el índice ${i}: se esperaba [x, y] numérico.`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    let candCost: number | null = null;
    let candPartitions: number[] | null = null;

    if (typeof output === 'number') {
      candCost = output;
    } else if (Array.isArray(output)) {
      candCost = typeof output[0] === 'number' ? output[0] : null;
      if (Array.isArray(output[1])) {
        candPartitions = output[1];
      }
    } else if (output && typeof output === 'object') {
      candCost = typeof output.optimalCost === 'number' ? output.optimalCost : null;
      if (Array.isArray(output.partitions)) {
        candPartitions = output.partitions;
      }
    }

    if (candCost === null || Number.isNaN(candCost)) {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe ser un costo numérico o una tupla [costo, particiones].'],
        warnings
      };
    }

    const { optimalCost, partitions: canonicalPartitions } = solveSegmentedLeastSquares(points, penaltyC);
    const EPS = 0.05;

    if (Math.abs(candCost - optimalCost) > EPS) {
      errors.push(
        `Costo subóptimo: Se reportó costo ${candCost}, pero la programación dinámica alcanza un costo óptimo de ${optimalCost.toFixed(2)}.`
      );
    }

    if (candPartitions !== null) {
      if (points.length > 0) {
        if (candPartitions.length === 0 || candPartitions[candPartitions.length - 1] !== points.length) {
          errors.push(
            `Partición incompleta: El último segmento debe finalizar en el índice total de puntos (${points.length}).`
          );
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
        pointsCount: points.length,
        penaltyC,
        optimalCost,
        segmentCount: canonicalPartitions.length
      }
    };
  }
}

export const segmentedLeastSquaresValidator = new SegmentedLeastSquaresValidator();
