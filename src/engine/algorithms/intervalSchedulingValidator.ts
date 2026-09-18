import { ValidationResult, Validator } from '../../types/validation';

export type Interval = [number, number]; // [start, end] with start < end

export class IntervalSchedulingValidator
  implements Validator<{ intervals: Interval[] }, Interval[]>
{
  validate(input: { intervals: Interval[] }, selected: Interval[]): ValidationResult {
    const { intervals } = input;
    const errors: string[] = [];

    if (!Array.isArray(selected)) {
      return { valid: false, errors: ['La solución debe ser un arreglo de intervalos [inicio, fin].'] };
    }

    // 1. Verify every selected interval exists in the input pool
    const pool = intervals.map(([s, e]) => `${s}-${e}`);
    const counts = new Map<string, number>();
    for (const item of pool) {
      counts.set(item, (counts.get(item) || 0) + 1);
    }

    for (const [start, end] of selected) {
      const key = `${start}-${end}`;
      const available = counts.get(key) || 0;
      if (available <= 0) {
        errors.push(`El intervalo [${start}, ${end}] no pertenece al conjunto original de tareas o fue duplicado.`);
      } else {
        counts.set(key, available - 1);
      }
    }

    // 2. Verify mutual compatibility (no overlaps)
    const sortedSelected = [...selected].sort((a, b) => a[0] - b[0]);
    for (let i = 0; i < sortedSelected.length - 1; i++) {
      const current = sortedSelected[i];
      const next = sortedSelected[i + 1];
      if (current[1] > next[0]) {
        errors.push(
          `Solapamiento detectado entre intervalo [${current[0]}, ${current[1]}] e intervalo [${next[0]}, ${next[1]}].`
        );
      }
    }

    // 3. Verify optimality (maximal size)
    const optimalCount = this.computeOptimalCount(intervals);
    if (errors.length === 0 && selected.length < optimalCount) {
      errors.push(
        `Subóptimo: seleccionaste ${selected.length} intervalos compatibles, pero existe una solución con ${optimalCount}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private computeOptimalCount(intervals: Interval[]): number {
    if (intervals.length === 0) return 0;
    const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
    let count = 0;
    let lastEnd = -Infinity;
    for (const [start, end] of sorted) {
      if (start >= lastEnd) {
        count++;
        lastEnd = end;
      }
    }
    return count;
  }
}

export const intervalSchedulingValidator = new IntervalSchedulingValidator();
