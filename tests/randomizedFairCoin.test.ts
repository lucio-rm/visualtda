import { describe, it, expect } from 'vitest';
import {
  randomizedFairCoinValidator,
  simulateVonNeumann,
  FairCoinInput
} from '../src/engine/algorithms/randomizedFairCoinValidator';
import {
  generateRandomizedFairCoinTrace,
  DEFAULT_COIN_BIAS
} from '../src/engine/algorithms/randomizedFairCoinTrace';

describe('RandomizedFairCoinValidator', () => {
  const input: FairCoinInput = { bias: 0.4, trials: 5000 };

  it('validates single binary bit', () => {
    expect(randomizedFairCoinValidator.validate(input, 0).valid).toBe(true);
    expect(randomizedFairCoinValidator.validate(input, 1).valid).toBe(true);
    expect(randomizedFairCoinValidator.validate(input, 2).valid).toBe(false);
  });

  it('validates Monte Carlo empirical distribution within statistical bounds', () => {
    const sim = simulateVonNeumann(0.4, 4000);
    const validation = randomizedFairCoinValidator.validate(input, sim);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    // Empirical proportion of 0s should be ~50%
    expect(sim.empiricalRatio0).toBeGreaterThan(45);
    expect(sim.empiricalRatio0).toBeLessThan(55);
    // Expected flips ~ 4.17
    expect(sim.avgFlips).toBeGreaterThan(3.5);
    expect(sim.avgFlips).toBeLessThan(5.0);
  });

  it('rejects a biased outcome distribution', () => {
    const biasedSimulation = {
      empiricalRatio0: 70.0,
      empiricalRatio1: 30.0,
      avgFlips: 4.16
    };
    const validation = randomizedFairCoinValidator.validate(input, biasedSimulation);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('Distribución sesgada'))).toBe(true);
  });
});

describe('RandomizedFairCoinTrace', () => {
  it('generates a full trace from initialization through discard to success and completion', () => {
    const timeline = generateRandomizedFairCoinTrace(DEFAULT_COIN_BIAS);

    expect(timeline.totalSteps).toBeGreaterThan(6);
    expect(timeline.events[0].type).toBe('init');

    const discardEvents = timeline.events.filter((e) => e.type === 'discard_pair');
    expect(discardEvents.length).toBe(2);

    const successEvents = timeline.events.filter((e) => e.type === 'success');
    expect(successEvents.length).toBe(1);
    expect(successEvents[0].data.outputBit).toBe(0);

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect(lastEvent.data.outputBit).toBe(0);
    expect(lastEvent.data.totalTosses).toBe(6);
  });
});
