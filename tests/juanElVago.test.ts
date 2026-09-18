import { describe, it, expect } from 'vitest';
import {
  juanElVagoValidator,
  solveJuanElVago,
  JuanElVagoInput
} from '../src/engine/algorithms/juanElVagoValidator';
import {
  generateJuanElVagoTrace,
  DEFAULT_GANANCIAS
} from '../src/engine/algorithms/juanElVagoTrace';

describe('JuanElVagoValidator', () => {
  it('correctly solves ground truth for classic course examples', () => {
    // Case 1
    const res1 = solveJuanElVago([10, 40, 20, 30, 50]);
    expect(res1.monto).toBe(90);
    expect(res1.dias).toEqual([1, 4]);

    // Case 2
    const res2 = solveJuanElVago([100, 10, 10, 100]);
    expect(res2.monto).toBe(200);
    expect(res2.dias).toEqual([0, 3]);

    // Case 3
    const res3 = solveJuanElVago([2, 7, 9, 3, 1]);
    expect(res3.monto).toBe(12);
    expect(res3.dias).toEqual([0, 2, 4]);
  });

  it('validates a correct solution', () => {
    const input: JuanElVagoInput = { ganancias: [10, 40, 20, 30, 50] };
    const validation = juanElVagoValidator.validate(input, [90, [1, 4]]);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects working two consecutive days', () => {
    const input: JuanElVagoInput = { ganancias: [10, 40, 20, 30, 50] };
    const validation = juanElVagoValidator.validate(input, [60, [1, 2]]); // consecutive days 1 and 2!
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('dos días consecutivos'))).toBe(true);
  });

  it('rejects suboptimal solutions', () => {
    const input: JuanElVagoInput = { ganancias: [10, 40, 20, 30, 50] };
    const validation = juanElVagoValidator.validate(input, [60, [0, 4]]); // 10 + 50 = 60 < 90
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Solución subóptima'))).toBe(true);
  });

  it('rejects inconsistent sum reporting', () => {
    const input: JuanElVagoInput = { ganancias: [10, 40, 20, 30, 50] };
    const validation = juanElVagoValidator.validate(input, [999, [1, 4]]);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Inconsistencia'))).toBe(true);
  });
});

describe('JuanElVagoTrace', () => {
  it('generates a complete timeline from base cases to backward reconstruction', () => {
    const timeline = generateJuanElVagoTrace(DEFAULT_GANANCIAS);

    expect(timeline.totalSteps).toBeGreaterThan(8);
    expect(timeline.events[0].type).toBe('init');

    const baseCaseEvents = timeline.events.filter((e) => e.type.startsWith('base_case'));
    expect(baseCaseEvents.length).toBe(2);

    const cellFilledEvents = timeline.events.filter((e) => e.type === 'cell_filled');
    expect(cellFilledEvents.length).toBe(3); // days 2, 3, 4

    const reconstructEvents = timeline.events.filter((e) => e.type === 'reconstruct_step');
    expect(reconstructEvents.length).toBeGreaterThan(0);

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect(lastEvent.data.currentTotal).toBe(90);
    expect(lastEvent.data.selectedDays).toEqual([1, 4]);
  });
});
