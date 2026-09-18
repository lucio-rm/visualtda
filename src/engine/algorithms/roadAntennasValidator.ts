import { ValidationResult, Validator } from '../../types/validation';

export interface RoadAntennasInput {
  houses: number[];
  radius: number;
}

export function solveRoadAntennas(houses: number[], radius: number): number[] {
  if (!houses.length || radius <= 0) return [];
  const sorted = [...houses].sort((a, b) => a - b);
  const antennas: number[] = [];
  let i = 0;
  const n = sorted.length;

  while (i < n) {
    const firstUncovered = sorted[i];
    const pos = firstUncovered + radius;
    antennas.push(pos);
    const maxReach = pos + radius;

    while (i < n && sorted[i] <= maxReach) {
      i++;
    }
  }

  return antennas;
}

export class RoadAntennasValidator implements Validator<RoadAntennasInput, number[]> {
  validate(input: RoadAntennasInput, result: number[]): ValidationResult {
    const { houses, radius } = input;
    const errors: string[] = [];

    if (!Array.isArray(result)) {
      return {
        valid: false,
        errors: ['El resultado devuelto debe ser una lista de coordenadas de antenas.']
      };
    }

    if (houses.length === 0) {
      if (result.length !== 0) {
        errors.push('Para una lista vacía de casas no deben construirse antenas.');
      }
      return { valid: errors.length === 0, errors };
    }

    // 1. Verify that all houses are covered
    const uncoveredHouses: number[] = [];
    const EPSILON = 1e-5;

    for (const h of houses) {
      const isCovered = result.some((a) => Math.abs(h - a) <= radius + EPSILON);
      if (!isCovered) {
        uncoveredHouses.push(h);
      }
    }

    if (uncoveredHouses.length > 0) {
      errors.push(
        `Hay ${uncoveredHouses.length} casa(s) sin cobertura: [${uncoveredHouses.slice(0, 5).join(', ')}${uncoveredHouses.length > 5 ? '...' : ''}].`
      );
    }

    // 2. Verify minimality against canonical greedy minimum
    const optimal = solveRoadAntennas(houses, radius);
    if (result.length > optimal.length) {
      errors.push(
        `La cantidad de antenas utilizadas (${result.length}) no es mínima. La solución óptima requiere únicamente ${optimal.length} antena(s).`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const roadAntennasValidator = new RoadAntennasValidator();
