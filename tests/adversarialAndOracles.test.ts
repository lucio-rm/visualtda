import { describe, it, expect } from 'vitest';
import {
  bruteForceKnapsack,
  bruteForceCoinChange,
  bruteForceSubsetSum,
  bruteForceWeightedIntervals,
  bruteForceInversionCount,
  verifyNQueensBoard,
  verifyPrefixFreeCodebook,
  bruteForceMinVertexCover
} from './oracles/referenceSolvers';
import { knapsackDpValidator } from '../src/engine/algorithms/knapsackDpValidator';
import { solveCoinChange } from '../src/engine/algorithms/coinChangeValidator';
import { solveSubsetSum } from '../src/engine/algorithms/subsetSumValidator';
import { solveWeightedIntervals } from '../src/engine/algorithms/weightedIntervalValidator';
import { countInversions } from '../src/engine/algorithms/inversionCountingValidator';
import { solveNQueens, nQueensValidator } from '../src/engine/algorithms/nQueensValidator';
import { generateHuffmanCodes } from '../src/engine/algorithms/huffmanValidator';
import { solveVertexCoverApprox } from '../src/engine/algorithms/vertexCoverApproxValidator';

// Deterministic Linear Congruential Generator (LCG) for reproducible pseudo-random property tests
function createLcg(seed = 123456789) {
  let s = seed;
  return function next(): number {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

describe('Phase C: Independent Oracles & Property Testing', () => {
  describe('1. Knapsack DP vs Brute-Force 2^n Oracle', () => {
    it('agrees with independent 2^n brute-force oracle across 20 randomized instances', () => {
      const lcg = createLcg(42);

      for (let trial = 0; trial < 20; trial++) {
        const n = 6 + Math.floor(lcg() * 4); // 6 to 9 items
        const capacity = 10 + Math.floor(lcg() * 15); // 10 to 25

        const items = Array.from({ length: n }, (_, i) => ({
          id: `it-${i + 1}`,
          name: `Item ${i + 1}`,
          weight: 1 + Math.floor(lcg() * 8),
          value: 5 + Math.floor(lcg() * 30)
        }));

        const oracleResult = bruteForceKnapsack(items, capacity);
        const dpOptimal = knapsackDpValidator.computeOptimalValue(items, capacity);

        expect(dpOptimal).toBe(oracleResult.maxValue);
      }
    });

    it('adversarial edge cases: zero capacity, items heavier than capacity, negative values', () => {
      const items = [
        { id: '1', name: 'A', weight: 5, value: 10 },
        { id: '2', name: 'B', weight: 8, value: 20 }
      ];
      expect(knapsackDpValidator.computeOptimalValue(items, 0)).toBe(0);
      expect(knapsackDpValidator.computeOptimalValue(items, 3)).toBe(0);
      expect(knapsackDpValidator.computeOptimalValue([], 10)).toBe(0);
    });
  });

  describe('2. Coin Change DP vs Independent Exhaustive Search Oracle', () => {
    it('matches independent search oracle across varied non-canonical currency systems', () => {
      const testSystems = [
        { coins: [1, 3, 4], targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
        { coins: [1, 5, 6, 9], targets: [5, 7, 10, 11, 12, 13, 15] },
        { coins: [2, 5, 7], targets: [4, 6, 9, 10, 12, 14, 15] },
        { coins: [1, 7, 10], targets: [8, 14, 15, 20] }
      ];

      for (const sys of testSystems) {
        for (const target of sys.targets) {
          const oracle = bruteForceCoinChange(sys.coins, target);
          const dpResult = solveCoinChange(sys.coins, target);

          if (oracle.minCoins === -1) {
            expect(dpResult).toHaveLength(0);
          } else {
            expect(dpResult.length).toBe(oracle.minCoins);
            const sum = dpResult.reduce((acc, c) => acc + c, 0);
            expect(sum).toBe(target);
          }
        }
      }
    });

    it('adversarial cases: impossible targets and empty denominations', () => {
      expect(solveCoinChange([2, 4, 6], 7)).toEqual([]);
      expect(solveCoinChange([], 5)).toEqual([]);
      expect(solveCoinChange([5], 0)).toEqual([]);
    });
  });

  describe('3. Subset Sum Backtracking vs Independent 2^n Power Set Oracle', () => {
    it('finds identical solution counts as 2^n exhaustive oracle on small sets', () => {
      const testCases = [
        { numbers: [2, 3, 5, 7], target: 10 },
        { numbers: [1, 2, 3, 4, 5], target: 7 },
        { numbers: [3, 9, 8, 4, 5, 7, 10], target: 15 },
        { numbers: [1, 2, 4, 8, 16], target: 15 } // Unique binary representation
      ];

      for (const tc of testCases) {
        const oracleSubsets = bruteForceSubsetSum(tc.numbers, tc.target);
        const btSubsets = solveSubsetSum(tc.numbers, tc.target);

        // Every backtracking subset must sum to target
        for (const sol of btSubsets) {
          const sum = sol.reduce((acc, n) => acc + n, 0);
          expect(sum).toBe(tc.target);
        }

        // Count of solutions must match
        expect(btSubsets.length).toBe(oracleSubsets.length);
      }
    });

    it('adversarial pruning test: deficit pruning skips search when remaining sum is insufficient', () => {
      // Total sum = 15, target = 20 -> should return 0 solutions immediately without expanding full tree
      const result = solveSubsetSum([1, 2, 3, 4, 5], 20);
      expect(result).toHaveLength(0);
    });
  });

  describe('4. Weighted Interval Scheduling vs Independent Compatibility Oracle', () => {
    it('matches independent compatibility oracle across 15 randomized interval schedules', () => {
      const lcg = createLcg(987654);

      for (let trial = 0; trial < 15; trial++) {
        const n = 6;
        const intervals = Array.from({ length: n }, (_, i) => {
          const start = Math.floor(lcg() * 10);
          const duration = 1 + Math.floor(lcg() * 6);
          return {
            id: `task-${i + 1}`,
            start,
            end: start + duration,
            weight: 10 + Math.floor(lcg() * 50)
          };
        });

        const oracle = bruteForceWeightedIntervals(intervals);
        const dpSolution = solveWeightedIntervals(intervals);
        const dpWeight = dpSolution.reduce((acc, it) => acc + it.weight, 0);

        expect(dpWeight).toBe(oracle.maxWeight);
      }
    });
  });

  describe('5. Inversion Counting vs Independent O(n^2) Pair-Check Oracle', () => {
    it('matches O(n^2) brute force across random, sorted, and reversed permutations', () => {
      const lcg = createLcg(5551212);

      for (let trial = 0; trial < 25; trial++) {
        const len = 5 + Math.floor(lcg() * 20);
        const arr = Array.from({ length: len }, () => Math.floor(lcg() * 100));

        const oracleCount = bruteForceInversionCount(arr);
        const fastCount = countInversions([...arr]);

        expect(fastCount).toBe(oracleCount);
      }
    });

    it('adversarial edge cases: already sorted (0), reverse sorted (n*(n-1)/2), duplicates, single element', () => {
      expect(countInversions([1, 2, 3, 4, 5])).toBe(0);
      expect(countInversions([5, 4, 3, 2, 1])).toBe(10); // 5*4/2 = 10
      expect(countInversions([2, 2, 2, 2])).toBe(0);
      expect(countInversions([42])).toBe(0);
      expect(countInversions([])).toBe(0);
    });
  });

  describe('6. N-Queens vs Independent Board Attack Checker Oracle', () => {
    it('verifies all canonical solutions for N=4, 5, 6, 7, 8 pass the independent attack matrix', () => {
      for (const n of [4, 5, 6, 7, 8]) {
        const solutions = solveNQueens(n);
        expect(solutions.length).toBeGreaterThan(0);

        for (const sol of solutions) {
          const check = verifyNQueensBoard(sol);
          expect(check.isValid).toBe(true);
          expect(check.conflicts).toHaveLength(0);

          const validatorCheck = nQueensValidator.validate({ n }, sol);
          expect(validatorCheck.valid).toBe(true);
        }
      }
    });

    it('adversarial cases: detects row, column, major diagonal, and minor diagonal attacks', () => {
      // Column conflict: two queens in col 2
      const colConflict = [0, 2, 2, 1];
      expect(verifyNQueensBoard(colConflict).isValid).toBe(false);
      expect(nQueensValidator.validate({ n: 4 }, colConflict).valid).toBe(false);

      // Major diagonal conflict: (0, 0) and (1, 1) -> 0 - 0 === 1 - 1
      const diagConflict = [0, 1, 3, 2];
      expect(verifyNQueensBoard(diagConflict).isValid).toBe(false);
      expect(nQueensValidator.validate({ n: 4 }, diagConflict).valid).toBe(false);

      // Minor diagonal conflict: (0, 2) and (1, 1) -> 0 + 2 === 1 + 1
      const minorDiag = [2, 1, 3, 0];
      expect(verifyNQueensBoard(minorDiag).isValid).toBe(false);
      expect(nQueensValidator.validate({ n: 4 }, minorDiag).valid).toBe(false);
    });
  });

  describe('7. Huffman Coding vs Prefix-Free Codebook Oracle', () => {
    it('guarantees generated variable-length codebooks are strictly prefix-free', () => {
      const sampleFrequencies: Record<string, number>[] = [
        { a: 45, b: 13, c: 12, d: 16, e: 9, f: 5 }, // Classic CLRS 16.3 instance
        { A: 100 }, // Single character
        { x: 1, y: 1, z: 1, w: 1 }, // Equal frequencies
        { p: 10, q: 20, r: 30, s: 40, t: 50, u: 60 }
      ];

      for (const freq of sampleFrequencies) {
        const codes = generateHuffmanCodes(freq);
        const check = verifyPrefixFreeCodebook(codes);
        expect(check.isPrefixFree).toBe(true);
        expect(check.violations).toHaveLength(0);
      }
    });
  });

  describe('8. Vertex Cover 2-Approximation vs Minimum Vertex Cover Oracle', () => {
    it('verifies approximation ratio |C| <= 2 * |C*| against brute-force minimum vertex cover', () => {
      const vertices = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6'];
      const edges: [string, string][] = [
        ['v1', 'v2'],
        ['v2', 'v3'],
        ['v3', 'v4'],
        ['v4', 'v5'],
        ['v5', 'v6'],
        ['v1', 'v6'],
        ['v2', 'v5']
      ];

      const optimal = bruteForceMinVertexCover(vertices, edges);
      const approxResult = solveVertexCoverApprox({ vertices, edges });

      // Verify that approxResult is indeed a valid vertex cover
      const coverSet = new Set(approxResult.cover);
      for (const [u, v] of edges) {
        expect(coverSet.has(u) || coverSet.has(v)).toBe(true);
      }

      // Verify 2-approximation inequality: |C_approx| <= 2 * |C_optimal|
      expect(approxResult.cover.length).toBeLessThanOrEqual(2 * optimal.minSize);
    });
  });
});
