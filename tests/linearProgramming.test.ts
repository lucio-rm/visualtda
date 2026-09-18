import { describe, it, expect } from 'vitest';
import {
  linearProgrammingValidator,
  solveLP2D,
  LP2DInput
} from '../src/engine/algorithms/linearProgrammingValidator';
import {
  generateLinearProgrammingTrace,
  DEFAULT_LP_OBJECTIVE,
  DEFAULT_LP_CONSTRAINTS
} from '../src/engine/algorithms/linearProgrammingTrace';

describe('LinearProgrammingValidator', () => {
  const input: LP2DInput = {
    objective: DEFAULT_LP_OBJECTIVE,
    constraints: DEFAULT_LP_CONSTRAINTS
  };

  it('correctly solves ground truth 2D LP problem', () => {
    const res = solveLP2D(DEFAULT_LP_OBJECTIVE, DEFAULT_LP_CONSTRAINTS);
    expect(res.feasible).toBe(true);
    expect(res.optimalPoint).toEqual([3, 12]);
    expect(res.optimalValue).toBe(33);
    expect(res.vertices.length).toBe(5);
  });

  it('validates an optimal point', () => {
    const validation = linearProgrammingValidator.validate(input, [3, 12]);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects an infeasible point that violates a constraint', () => {
    // [10, 10] violates 2x + y <= 18 (20 + 10 = 30 > 18)
    const validation = linearProgrammingValidator.validate(input, [10, 10]);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Violación de restricción'))).toBe(true);
  });

  it('rejects a feasible but suboptimal point', () => {
    // [0, 0] is feasible (z = 0) but suboptimal (optimal is 33)
    const validation = linearProgrammingValidator.validate(input, [0, 0]);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Solución subóptima'))).toBe(true);
  });
});

describe('LinearProgrammingTrace', () => {
  it('generates a full trace from coordinate plane to optimal vertex and lattice points', () => {
    const timeline = generateLinearProgrammingTrace(DEFAULT_LP_OBJECTIVE, DEFAULT_LP_CONSTRAINTS);

    expect(timeline.totalSteps).toBeGreaterThan(6);
    expect(timeline.events[0].type).toBe('init');

    const addConstraintEvents = timeline.events.filter((e) => e.type === 'add_constraint');
    expect(addConstraintEvents.length).toBe(DEFAULT_LP_CONSTRAINTS.length);

    const evalVertexEvents = timeline.events.filter((e) => e.type === 'evaluating_vertex');
    expect(evalVertexEvents.length).toBe(5);

    const integerEvents = timeline.events.filter((e) => e.type === 'integer_points');
    expect(integerEvents.length).toBe(1);
    expect(integerEvents[0].data.integerPoints?.length).toBeGreaterThan(10);

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect(lastEvent.data.optimalPoint).toEqual([3, 12]);
    expect(lastEvent.data.optimalValue).toBe(33);
  });
});
