import { describe, it, expect } from 'vitest';
import {
  solveCoinChange,
  solveCoinChangeGreedy,
  coinChangeValidator
} from '../src/engine/algorithms/coinChangeValidator';
import { generateCoinChangeTrace } from '../src/engine/algorithms/coinChangeTrace';

describe('Coin Change DP Solver', () => {
  it('solves the classic counterexample [1, 3, 4] with target 6 in 2 coins', () => {
    const result = solveCoinChange([1, 3, 4], 6);
    expect(result).toHaveLength(2);
    expect(result).toEqual([3, 3]);
  });

  it('proves greedy heuristic is suboptimal for [1, 3, 4] with target 6', () => {
    const greedy = solveCoinChangeGreedy([1, 3, 4], 6);
    expect(greedy).not.toBeNull();
    expect(greedy).toEqual([4, 1, 1]);
    expect(greedy?.length).toBe(3);

    const optimal = solveCoinChange([1, 3, 4], 6);
    expect(optimal.length).toBeLessThan(greedy!.length);
  });

  it('solves another greedy trap [1, 5, 6, 9] with target 11 in 2 coins [6, 5]', () => {
    const optimal = solveCoinChange([1, 5, 6, 9], 11);
    expect(optimal).toEqual([6, 5]);

    const greedy = solveCoinChangeGreedy([1, 5, 6, 9], 11);
    expect(greedy).toEqual([9, 1, 1]); // 3 coins vs 2 coins
  });

  it('returns empty array when change is impossible', () => {
    const result = solveCoinChange([2, 4], 5);
    expect(result).toEqual([]);

    const greedy = solveCoinChangeGreedy([2, 4], 5);
    expect(greedy).toBeNull();
  });

  it('handles edge cases: target 0 and empty coin array', () => {
    expect(solveCoinChange([1, 2, 5], 0)).toEqual([]);
    expect(solveCoinChange([], 10)).toEqual([]);
  });

  it('handles canonical Argentine currency correctly', () => {
    const coins = [1, 2, 5, 10, 20, 50];
    const target = 87; // 50 + 20 + 10 + 5 + 2
    const optimal = solveCoinChange(coins, target);
    expect(optimal).toEqual([50, 20, 10, 5, 2]);
  });
});

describe('Coin Change Validator', () => {
  it('accepts optimal coin combination', () => {
    const validation = coinChangeValidator.validate({ coins: [1, 3, 4], target: 6 }, [3, 3]);
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('rejects greedy suboptimal coin combination', () => {
    const validation = coinChangeValidator.validate({ coins: [1, 3, 4], target: 6 }, [4, 1, 1]);
    expect(validation.valid).toBe(false);
    expect(validation.errors[0]).toContain('no es óptima');
  });

  it('rejects denominations not in available coins', () => {
    const validation = coinChangeValidator.validate({ coins: [1, 3, 4], target: 6 }, [2, 2, 2]);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('denominación 2'))).toBe(true);
  });

  it('rejects coin combinations that do not sum to target', () => {
    const validation = coinChangeValidator.validate({ coins: [1, 3, 4], target: 6 }, [3, 4]);
    expect(validation.valid).toBe(false);
    expect(validation.errors.some((e) => e.includes('suman 7'))).toBe(true);
  });

  it('validates target 0 requires empty array', () => {
    const valid = coinChangeValidator.validate({ coins: [1, 2, 5], target: 0 }, []);
    expect(valid.valid).toBe(true);

    const invalid = coinChangeValidator.validate({ coins: [1, 2, 5], target: 0 }, [1]);
    expect(invalid.valid).toBe(false);
  });
});

describe('Coin Change Trace Generator', () => {
  it('generates a complete timeline with table filling and reconstruction', () => {
    const timeline = generateCoinChangeTrace([1, 3, 4], 6);
    expect(timeline.totalSteps).toBeGreaterThan(5);

    const initEvent = timeline.events[0];
    expect(initEvent.type).toBe('INIT');
    expect(initEvent.data.dp[0]).toBe(0);

    const completeEvent = timeline.events[timeline.events.length - 1];
    expect(completeEvent.type).toBe('COMPLETE');
    expect(completeEvent.data.reconstructedCoins).toEqual([3, 3]);
    expect(completeEvent.data.greedyCoins).toEqual([4, 1, 1]);
  });
});
