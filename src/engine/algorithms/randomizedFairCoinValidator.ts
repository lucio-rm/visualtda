import { ValidationResult, Validator } from '../../types/validation';

export interface FairCoinInput {
  bias: number; // probability of getting 1 from the biased coin (e.g. 0.4)
  trials?: number;
}

export interface FairCoinOutput {
  empiricalRatio0: number; // percentage of 0s generated (e.g. ~50%)
  empiricalRatio1: number; // percentage of 1s generated (e.g. ~50%)
  avgFlips: number;
}

export function simulateVonNeumann(
  bias: number = 0.4,
  trials: number = 5000
): FairCoinOutput {
  let count0 = 0;
  let count1 = 0;
  let totalFlips = 0;

  for (let i = 0; i < trials; i++) {
    let roundFlips = 0;
    while (true) {
      const t1 = Math.random() < bias ? 1 : 0;
      const t2 = Math.random() < bias ? 1 : 0;
      roundFlips += 2;

      if (t1 === 0 && t2 === 1) {
        count0++;
        break;
      } else if (t1 === 1 && t2 === 0) {
        count1++;
        break;
      }
    }
    totalFlips += roundFlips;
  }

  return {
    empiricalRatio0: (count0 / trials) * 100,
    empiricalRatio1: (count1 / trials) * 100,
    avgFlips: totalFlips / trials
  };
}

export class RandomizedFairCoinValidator implements Validator<FairCoinInput, number | FairCoinOutput> {
  validate(
    input: FairCoinInput,
    result: number | FairCoinOutput
  ): ValidationResult {
    const { bias } = input;
    const errors: string[] = [];

    // If single result bit
    if (typeof result === 'number') {
      if (result !== 0 && result !== 1) {
        return {
          valid: false,
          errors: [`El resultado devuelto debe ser un bit binario (0 o 1), pero se obtuvo ${result}.`]
        };
      }
      return { valid: true, errors: [] };
    }

    // If statistical evaluation output
    if (result && typeof result === 'object' && 'empiricalRatio0' in result) {
      const diff = Math.abs(result.empiricalRatio0 - 50.0);
      // Statistical tolerance: with N=5000, 3 standard deviations is ~2.1%
      if (diff > 4.5) {
        errors.push(
          `Distribución sesgada: Se obtuvo ${result.empiricalRatio0.toFixed(2)}% de ceros y ${result.empiricalRatio1.toFixed(2)}% de unos. Debe aproximarse al 50.0% dentro del margen de error de Monte Carlo.`
        );
      }

      const theoreticalFlips = 1 / (bias * (1 - bias));
      const flipDiff = Math.abs(result.avgFlips - theoreticalFlips);
      if (flipDiff > 2.0) {
        errors.push(
          `Promedio de lanzamientos anómalo: Se registraron ${result.avgFlips.toFixed(2)} lanzamientos por bit, pero la esperanza teórica 1/(p*(1-p)) es ${theoreticalFlips.toFixed(2)}.`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const randomizedFairCoinValidator = new RandomizedFairCoinValidator();
