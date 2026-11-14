import { ValidationResult, Validator } from '../../types/validation';

export type JobPair = [number, number]; // [duration t_i, deadline d_i]

export interface MinimizeLatenessInputObject {
  jobs: JobPair[];
}

export type MinimizeLatenessInput =
  | MinimizeLatenessInputObject
  | JobPair[];

export type MinimizeLatenessOutput =
  | number
  | { maxLateness: number; schedule?: JobPair[] };

export function computeMinimalLateness(jobs: JobPair[]): number {
  if (!Array.isArray(jobs) || jobs.length === 0) return 0;

  // Earliest Deadline First (EDF) is provably optimal via exchange arguments
  const sorted = [...jobs].sort((a, b) => a[1] - b[1]);
  let currentTime = 0;
  let maxLateness = 0;

  for (const [duration, deadline] of sorted) {
    currentTime += duration;
    const lateness = Math.max(0, currentTime - deadline);
    if (lateness > maxLateness) {
      maxLateness = lateness;
    }
  }

  return maxLateness;
}

export class MinimizeLatenessValidator
  implements Validator<MinimizeLatenessInput, MinimizeLatenessOutput>
{
  validate(
    input: MinimizeLatenessInput,
    output: MinimizeLatenessOutput
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawJobs = Array.isArray(input) ? input : input?.jobs;

    if (!Array.isArray(rawJobs)) {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada de tareas debe ser un arreglo de pares [duracion, plazo_limite].'],
        warnings
      };
    }

    for (let i = 0; i < rawJobs.length; i++) {
      const job = rawJobs[i];
      if (!Array.isArray(job) || job.length < 2 || typeof job[0] !== 'number' || typeof job[1] !== 'number' || Number.isNaN(job[0]) || Number.isNaN(job[1])) {
        errors.push(`Tarea inválida en el índice ${i}: se esperaba [duracion, deadline] numérico.`);
        return { valid: false, isValid: false, errors, warnings };
      }
      if (job[0] < 0 || job[1] < 0) {
        errors.push(`Valores negativos no permitidos en la tarea ${i}: duracion=${job[0]}, deadline=${job[1]}.`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    let candLateness: number;
    if (typeof output === 'number') {
      candLateness = output;
    } else if (output && typeof output === 'object' && typeof output.maxLateness === 'number') {
      candLateness = output.maxLateness;
    } else {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe ser un número (retraso máximo) o un objeto { maxLateness: number }.'],
        warnings
      };
    }

    if (Number.isNaN(candLateness) || candLateness < 0) {
      errors.push('El retraso máximo no puede ser negativo ni NaN.');
      return { valid: false, isValid: false, errors, warnings };
    }

    const optimalLateness = computeMinimalLateness(rawJobs);

    if (candLateness < optimalLateness) {
      errors.push(
        `Retraso reportado (${candLateness}) es menor que el retraso óptimo realizable (${optimalLateness}).`
      );
    } else if (candLateness > optimalLateness) {
      errors.push(
        `Solución subóptima: El retraso máximo obtenido (${candLateness}) supera el retraso óptimo EDF (${optimalLateness}).`
      );
    }

    // Optional schedule verification if present
    if (typeof output === 'object' && output !== null && Array.isArray(output.schedule)) {
      if (output.schedule.length !== rawJobs.length) {
        errors.push(`El cronograma retornado contiene ${output.schedule.length} tareas, pero se esperaban ${rawJobs.length}.`);
      }
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        jobCount: rawJobs.length,
        optimalLateness
      }
    };
  }
}

export const minimizeLatenessValidator = new MinimizeLatenessValidator();
