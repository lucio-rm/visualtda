import { ValidationResult, Validator } from '../../types/validation';

export type IntervalPair = [number, number];

export interface IntervalPartitioningInputObject {
  intervals: IntervalPair[];
}

export type IntervalPartitioningInput =
  | IntervalPartitioningInputObject
  | IntervalPair[];

export type IntervalPartitioningOutput = number | IntervalPair[][];

export function computeMinimumClassrooms(intervals: IntervalPair[]): number {
  if (!Array.isArray(intervals) || intervals.length === 0) return 0;

  // An interval ending at t can be reused by an interval starting at t.
  // Therefore, sort events such that ends at t come before starts at t.
  type Event = { time: number; delta: number };
  const events: Event[] = [];

  for (const [start, end] of intervals) {
    events.push({ time: start, delta: 1 });
    events.push({ time: end, delta: -1 });
  }

  // Delta -1 (end) before delta +1 (start) when times are equal
  events.sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return a.delta - b.delta;
  });

  let current = 0;
  let maxRooms = 0;
  for (const ev of events) {
    current += ev.delta;
    if (current > maxRooms) {
      maxRooms = current;
    }
  }

  return maxRooms;
}

export class IntervalPartitioningValidator
  implements Validator<IntervalPartitioningInput, IntervalPartitioningOutput>
{
  validate(
    input: IntervalPartitioningInput,
    output: IntervalPartitioningOutput
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawIntervals = Array.isArray(input)
      ? input
      : input?.intervals;

    if (!Array.isArray(rawIntervals)) {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada de intervalos debe ser un arreglo de pares [inicio, fin].'],
        warnings
      };
    }

    for (let i = 0; i < rawIntervals.length; i++) {
      const it = rawIntervals[i];
      if (!Array.isArray(it) || it.length < 2 || typeof it[0] !== 'number' || typeof it[1] !== 'number' || Number.isNaN(it[0]) || Number.isNaN(it[1])) {
        errors.push(`Intervalo inválido en el índice ${i}: se esperaba [inicio, fin] numérico.`);
        return { valid: false, isValid: false, errors, warnings };
      }
      if (it[0] > it[1]) {
        errors.push(`Intervalo invertido en el índice ${i}: inicio (${it[0]}) > fin (${it[1]}).`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    const optimalRooms = computeMinimumClassrooms(rawIntervals);

    if (typeof output === 'number') {
      if (Number.isNaN(output) || output < 0 || !Number.isInteger(output)) {
        errors.push('La cantidad de aulas debe ser un número entero no negativo.');
      } else if (output < optimalRooms) {
        errors.push(
          `Aulas insuficientes: Se indicaron ${output} aulas, pero la profundidad máxima de solapamiento requiere al menos ${optimalRooms} aulas.`
        );
      } else if (output > optimalRooms) {
        errors.push(
          `Solución subóptima: Se utilizaron ${output} aulas, pero es posible particionar el conjunto con solo ${optimalRooms} aulas.`
        );
      }
    } else if (Array.isArray(output)) {
      // output is a list of classrooms, each containing intervals
      let totalAssigned = 0;
      for (let r = 0; r < output.length; r++) {
        const room = output[r];
        if (!Array.isArray(room)) {
          errors.push(`El aula ${r} no es una lista válida de intervalos.`);
          continue;
        }
        totalAssigned += room.length;
        const sortedRoom = [...room].sort((a, b) => a[0] - b[0]);
        for (let j = 0; j < sortedRoom.length - 1; j++) {
          if (sortedRoom[j][1] > sortedRoom[j + 1][0]) {
            errors.push(
              `Conflicto en el aula ${r}: Los intervalos [${sortedRoom[j][0]}, ${sortedRoom[j][1]}] y [${sortedRoom[j + 1][0]}, ${sortedRoom[j + 1][1]}] se solapan temporalmente.`
            );
            break;
          }
        }
      }

      if (totalAssigned !== rawIntervals.length) {
        errors.push(
          `Cantidad incorrecta de intervalos: Se asignaron ${totalAssigned} intervalos, pero el conjunto original contiene ${rawIntervals.length}.`
        );
      }

      if (output.length > optimalRooms) {
        errors.push(
          `Cantidad subóptima de aulas: Se utilizaron ${output.length} aulas, pero el mínimo óptimo es ${optimalRooms}.`
        );
      }
    } else {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe ser un número entero (cantidad de aulas) o una partición de intervalos (arreglo de aulas).'],
        warnings
      };
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        totalIntervals: rawIntervals.length,
        optimalClassrooms: optimalRooms
      }
    };
  }
}

export const intervalPartitioningValidator = new IntervalPartitioningValidator();
