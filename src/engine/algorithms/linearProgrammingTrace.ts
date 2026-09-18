import { TraceEvent, TraceTimeline } from '../../types/trace';
import { LinearConstraint, solveLP2D } from './linearProgrammingValidator';

export interface LPStepData {
  objective: [number, number];
  constraints: LinearConstraint[];
  activeConstraintsCount: number;
  vertices: [number, number][];
  currentVertexIndex?: number;
  currentVertexValue?: number;
  optimalPoint?: [number, number] | null;
  optimalValue?: number;
  phase:
    | 'init'
    | 'add_constraint'
    | 'polytope_formed'
    | 'evaluating_vertex'
    | 'optimal_found'
    | 'integer_points'
    | 'complete';
  integerPoints?: [number, number][];
}

export const DEFAULT_LP_OBJECTIVE: [number, number] = [3, 2];
export const DEFAULT_LP_CONSTRAINTS: LinearConstraint[] = [
  { a: 2, b: 1, c: 18, label: '2x + y <= 18' },
  { a: 2, b: 3, c: 42, label: '2x + 3y <= 42' },
  { a: 3, b: 1, c: 24, label: '3x + y <= 24' }
];

export function generateLinearProgrammingTrace(
  objective: [number, number] = DEFAULT_LP_OBJECTIVE,
  constraints: LinearConstraint[] = DEFAULT_LP_CONSTRAINTS
): TraceTimeline<LPStepData> {
  const events: TraceEvent<LPStepData>[] = [];
  let stepIndex = 0;

  // 1. Initial event: Coordinate plane
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Plano cartesiano inicializado con restricciones de no negatividad (x >= 0, y >= 0). Función objetivo a maximizar: z = ${objective[0]}x + ${objective[1]}y.`,
      en: `Cartesian plane initialized with non-negativity (x >= 0, y >= 0). Objective to maximize: z = ${objective[0]}x + ${objective[1]}y.`
    },
    data: {
      objective,
      constraints,
      activeConstraintsCount: 0,
      vertices: [[0, 0]],
      phase: 'init'
    }
  });

  // 2. Add each constraint sequentially
  for (let i = 0; i < constraints.length; i++) {
    const c = constraints[i];
    events.push({
      step: stepIndex++,
      type: 'add_constraint',
      message: {
        es: `Restricción agregada ${i + 1}/${constraints.length}: "${c.label}". Define el semiespacio ${c.a}x + ${c.b}y <= ${c.c}.`,
        en: `Constraint added ${i + 1}/${constraints.length}: "${c.label}". Defines half-plane ${c.a}x + ${c.b}y <= ${c.c}.`
      },
      data: {
        objective,
        constraints,
        activeConstraintsCount: i + 1,
        vertices: [],
        phase: 'add_constraint'
      }
    });
  }

  // 3. Compute full polytope vertices
  const solution = solveLP2D(objective, constraints);
  const vertices = solution.vertices;

  events.push({
    step: stepIndex++,
    type: 'polytope_formed',
    message: {
      es: `Región factible convexa formada por la intersección de los semiespacios. Se identificaron ${vertices.length} vértices extremos (soluciones básicas factibles).`,
      en: `Convex feasible region formed by the intersection of half-planes. Identified ${vertices.length} extreme vertices (basic feasible solutions).`
    },
    data: {
      objective,
      constraints,
      activeConstraintsCount: constraints.length,
      vertices,
      phase: 'polytope_formed'
    }
  });

  // 4. Evaluate objective function on each extreme vertex
  let bestVal = -Infinity;
  let bestPt: [number, number] | null = null;

  for (let vIdx = 0; vIdx < vertices.length; vIdx++) {
    const [x, y] = vertices[vIdx];
    const val = objective[0] * x + objective[1] * y;
    if (val > bestVal) {
      bestVal = val;
      bestPt = [x, y];
    }

    events.push({
      step: stepIndex++,
      type: 'evaluating_vertex',
      message: {
        es: `Evaluando vértice ${vIdx + 1}/${vertices.length} en (${x}, ${y}): z = ${objective[0]}*(${x}) + ${objective[1]}*(${y}) = ${val}.`,
        en: `Evaluating vertex ${vIdx + 1}/${vertices.length} at (${x}, ${y}): z = ${objective[0]}*(${x}) + ${objective[1]}*(${y}) = ${val}.`
      },
      data: {
        objective,
        constraints,
        activeConstraintsCount: constraints.length,
        vertices,
        currentVertexIndex: vIdx,
        currentVertexValue: val,
        optimalPoint: bestPt,
        optimalValue: bestVal,
        phase: 'evaluating_vertex'
      }
    });
  }

  // 5. Optimal vertex found (Fundamental Theorem of LP)
  events.push({
    step: stepIndex++,
    type: 'optimal_found',
    message: {
      es: `Por el Teorema Fundamental de la Programación Lineal, el óptimo se encuentra en el vértice extremo (${bestPt?.[0]}, ${bestPt?.[1]}) con valor máximo z = ${bestVal}.`,
      en: `By the Fundamental Theorem of Linear Programming, the optimum lies on extreme vertex (${bestPt?.[0]}, ${bestPt?.[1]}) with maximum value z = ${bestVal}.`
    },
    data: {
      objective,
      constraints,
      activeConstraintsCount: constraints.length,
      vertices,
      optimalPoint: bestPt,
      optimalValue: bestVal,
      phase: 'optimal_found'
    }
  });

  // 6. Integer lattice points within polytope (ILP comparison)
  const maxX = Math.max(...vertices.map((v) => v[0]));
  const maxY = Math.max(...vertices.map((v) => v[1]));
  const integerPoints: [number, number][] = [];

  for (let ix = 0; ix <= Math.ceil(maxX); ix++) {
    for (let iy = 0; iy <= Math.ceil(maxY); iy++) {
      let isInside = true;
      for (const c of constraints) {
        if (c.a * ix + c.b * iy > c.c + 1e-7) {
          isInside = false;
          break;
        }
      }
      if (isInside) {
        integerPoints.push([ix, iy]);
      }
    }
  }

  events.push({
    step: stepIndex++,
    type: 'integer_points',
    message: {
      es: `Enfoque discreto (ILP): Hay ${integerPoints.length} puntos enteros (red reticular) dentro del polítopo. La relajación lineal continua sirve como cota superior para la solución entera.`,
      en: `Discrete approach (ILP): There are ${integerPoints.length} integer lattice points within the polytope. Linear relaxation provides an upper bound for the integer optimum.`
    },
    data: {
      objective,
      constraints,
      activeConstraintsCount: constraints.length,
      vertices,
      optimalPoint: bestPt,
      optimalValue: bestVal,
      integerPoints,
      phase: 'integer_points'
    }
  });

  // 7. Complete
  events.push({
    step: stepIndex++,
    type: 'complete',
    message: {
      es: `Análisis completo: Región factible acotada, vértices evaluados y solución óptima z* = ${bestVal} alcanzada en (${bestPt?.[0]}, ${bestPt?.[1]}).`,
      en: `Analysis complete: Bounded feasible region, evaluated vertices, and optimal solution z* = ${bestVal} reached at (${bestPt?.[0]}, ${bestPt?.[1]}).`
    },
    data: {
      objective,
      constraints,
      activeConstraintsCount: constraints.length,
      vertices,
      optimalPoint: bestPt,
      optimalValue: bestVal,
      integerPoints,
      phase: 'complete'
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
