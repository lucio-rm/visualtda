import { ValidationResult, Validator } from '../../types/validation';

export interface LinearConstraint {
  a: number; // coef x
  b: number; // coef y
  c: number; // a*x + b*y <= c
  label?: string;
}

export interface LP2DInput {
  objective: [number, number]; // [c1, c2] to maximize c1*x + c2*y
  constraints: LinearConstraint[];
}

export interface LP2DOutput {
  point: [number, number];
  value: number;
}

export function solveLP2D(
  objective: [number, number],
  constraints: LinearConstraint[]
): {
  feasible: boolean;
  optimalPoint: [number, number] | null;
  optimalValue: number;
  vertices: [number, number][];
} {
  const allConstraints = [
    ...constraints,
    { a: -1, b: 0, c: 0, label: 'x >= 0' },
    { a: 0, b: -1, c: 0, label: 'y >= 0' }
  ];

  const m = allConstraints.length;
  const vertices: [number, number][] = [];

  for (let i = 0; i < m; i++) {
    const c1 = allConstraints[i];
    for (let j = i + 1; j < m; j++) {
      const c2 = allConstraints[j];
      const det = c1.a * c2.b - c2.a * c1.b;
      if (Math.abs(det) > 1e-9) {
        const x = (c1.c * c2.b - c2.c * c1.b) / det;
        const y = (c1.a * c2.c - c2.a * c1.c) / det;

        // Check feasibility
        let isFeasible = true;
        for (const ck of allConstraints) {
          if (ck.a * x + ck.b * y > ck.c + 1e-7) {
            isFeasible = false;
            break;
          }
        }

        if (isFeasible) {
          const rx = Math.round(x * 1e5) / 1e5;
          const ry = Math.round(y * 1e5) / 1e5;
          const already = vertices.some((v) => Math.abs(v[0] - rx) < 1e-4 && Math.abs(v[1] - ry) < 1e-4);
          if (!already) {
            vertices.push([rx, ry]);
          }
        }
      }
    }
  }

  if (vertices.length === 0) {
    return { feasible: false, optimalPoint: null, optimalValue: -Infinity, vertices: [] };
  }

  let bestVal = -Infinity;
  let bestPoint: [number, number] | null = null;

  for (const [x, y] of vertices) {
    const val = objective[0] * x + objective[1] * y;
    if (val > bestVal) {
      bestVal = val;
      bestPoint = [x, y];
    }
  }

  return {
    feasible: true,
    optimalPoint: bestPoint,
    optimalValue: bestVal,
    vertices
  };
}

export class LinearProgrammingValidator implements Validator<LP2DInput, LP2DOutput | [number, number]> {
  validate(
    input: LP2DInput,
    result: LP2DOutput | [number, number]
  ): ValidationResult {
    const { objective, constraints } = input;
    const errors: string[] = [];

    let pt: [number, number];
    if (Array.isArray(result) && result.length === 2) {
      pt = result;
    } else if (result && typeof result === 'object' && 'point' in result) {
      pt = result.point;
    } else {
      return {
        valid: false,
        errors: ['El resultado debe ser un punto [x, y] o un objeto { point: [x, y], value: number }.']
      };
    }

    const [x, y] = pt;

    // 1. Non-negativity
    if (x < -1e-6 || y < -1e-6) {
      errors.push(`Violación de no negatividad: x=${x}, y=${y} deben ser >= 0.`);
    }

    // 2. Constraints satisfaction
    for (const c of constraints) {
      const lhs = c.a * x + c.b * y;
      if (lhs > c.c + 1e-5) {
        errors.push(
          `Violación de restricción (${c.label || `${c.a}x + ${c.b}y <= ${c.c}`}): ${c.a}*(${x}) + ${c.b}*(${y}) = ${lhs} > ${c.c}.`
        );
      }
    }

    // 3. Optimality
    const optimal = solveLP2D(objective, constraints);
    const candidateValue = objective[0] * x + objective[1] * y;

    if (optimal.feasible && candidateValue < optimal.optimalValue - 1e-4) {
      errors.push(
        `Solución subóptima: El punto (${x}, ${y}) tiene valor ${candidateValue}, pero el valor óptimo es ${optimal.optimalValue}.`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const linearProgrammingValidator = new LinearProgrammingValidator();
