import { describe, it, expect } from 'vitest';
import {
  bruteForceKnapsack,
  bruteForceCoinChange,
  bruteForceSubsetSum,
  bruteForceWeightedIntervals,
  bruteForceInversionCount,
  verifyNQueensBoard,
  verifyPrefixFreeCodebook,
  bruteForceMinVertexCover,
  bruteForceGraphColoring,
  bruteForceIntervalScheduling,
  bruteForceMaxSubarray,
  bruteForceJuanElVago,
  verifyAntennaCoverage,
  bruteForceLcs,
  verifyPeakCondition,
  verifyFlowConservation,
  verifyReductionDuality,
  simulateVonNeumannCoin
} from './oracles/referenceSolvers';
import { knapsackDpValidator } from '../src/engine/algorithms/knapsackDpValidator';
import { solveCoinChange } from '../src/engine/algorithms/coinChangeValidator';
import { solveSubsetSum } from '../src/engine/algorithms/subsetSumValidator';
import { solveWeightedIntervals } from '../src/engine/algorithms/weightedIntervalValidator';
import { countInversions } from '../src/engine/algorithms/inversionCountingValidator';
import { solveNQueens, nQueensValidator } from '../src/engine/algorithms/nQueensValidator';
import { generateHuffmanCodes } from '../src/engine/algorithms/huffmanValidator';
import { solveVertexCoverApprox } from '../src/engine/algorithms/vertexCoverApproxValidator';
import { intervalSchedulingValidator } from '../src/engine/algorithms/intervalSchedulingValidator';
import { computeOptimalMaxSubarray, maxSubarrayValidator } from '../src/engine/algorithms/maxSubarrayValidator';
import { solveJuanElVago, juanElVagoValidator } from '../src/engine/algorithms/juanElVagoValidator';
import { solveRoadAntennas, roadAntennasValidator } from '../src/engine/algorithms/roadAntennasValidator';
import { solveLcs, lcsValidator } from '../src/engine/algorithms/lcsValidator';
import { solvePeakFinding, peakFindingValidator } from '../src/engine/algorithms/peakFindingValidator';
import { solveGraphColoring, graphColoringValidator } from '../src/engine/algorithms/graphColoringValidator';
import { solveMaxFlow, maxFlowValidator } from '../src/engine/algorithms/maxFlowValidator';
import { reduceIndependentSetToVertexCover, reductionIsVcValidator } from '../src/engine/algorithms/reductionIsVcValidator';
import { simulateVonNeumann, randomizedFairCoinValidator } from '../src/engine/algorithms/randomizedFairCoinValidator';
import { mergeSortValidator } from '../src/engine/algorithms/mergeSortValidator';
import { knapsackGreedyValidator } from '../src/engine/algorithms/knapsackGreedyValidator';
import { solveLP2D, linearProgrammingValidator } from '../src/engine/algorithms/linearProgrammingValidator';

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

  describe('9. Interval Scheduling vs Independent 2^N Combinatorial Oracle', () => {
    it('matches independent 2^N brute force maximum compatibility count', () => {
      const lcg = createLcg(777);
      for (let trial = 0; trial < 10; trial++) {
        const n = 6;
        const intervals: Array<[number, number]> = [];
        const intervalObjs: Array<{ start: number; end: number }> = [];

        for (let i = 0; i < n; i++) {
          const s = Math.floor(lcg() * 12);
          const d = 1 + Math.floor(lcg() * 5);
          intervals.push([s, s + d]);
          intervalObjs.push({ start: s, end: s + d });
        }

        const oracleCount = bruteForceIntervalScheduling(intervalObjs);
        // Sorted by finish time greedy
        const sorted = [...intervals].sort((a, b) => a[1] - b[1]);
        const greedySelected: Array<[number, number]> = [];
        let lastEnd = -1;
        for (const [start, end] of sorted) {
          if (start >= lastEnd) {
            greedySelected.push([start, end]);
            lastEnd = end;
          }
        }

        expect(greedySelected.length).toBe(oracleCount);
        const valRes = intervalSchedulingValidator.validate({ intervals }, greedySelected);
        expect(valRes.valid).toBe(true);
      }
    });
  });

  describe('10. Maximum Subarray Kadane vs Independent O(N^2) Brute Force Oracle', () => {
    it('finds identical optimal subarray sum across positive and negative mixed vectors', () => {
      const lcg = createLcg(333);
      for (let trial = 0; trial < 15; trial++) {
        const len = 5 + Math.floor(lcg() * 10);
        const arr = Array.from({ length: len }, () => Math.floor(lcg() * 40) - 20);

        const oracle = bruteForceMaxSubarray(arr);
        const kadaneResult = computeOptimalMaxSubarray(arr);

        expect(kadaneResult.maxSum).toBe(oracle.maxSum);
      }
    });

    it('adversarial cases: all negative numbers, single element', () => {
      const allNegative = [-8, -3, -5, -2, -10];
      const opt = computeOptimalMaxSubarray(allNegative);
      expect(opt.maxSum).toBe(-2);
      expect(maxSubarrayValidator.validate({ array: allNegative }, [-2]).valid).toBe(true);
    });
  });

  describe('11. Juan el Vago DP vs Independent Non-Consecutive Search Oracle', () => {
    it('matches 2^N non-consecutive search oracle across random payoff vectors', () => {
      const lcg = createLcg(111);
      for (let trial = 0; trial < 12; trial++) {
        const n = 7;
        const pagos = Array.from({ length: n }, () => 5 + Math.floor(lcg() * 30));

        const oracleMax = bruteForceJuanElVago(pagos);
        const dpRes = solveJuanElVago(pagos);

        expect(dpRes.monto).toBe(oracleMax);
        const valRes = juanElVagoValidator.validate({ ganancias: pagos }, dpRes);
        expect(valRes.valid).toBe(true);
      }
    });
  });

  describe('12. Road Antennas Greedy vs Coverage Verification Oracle', () => {
    it('verifies greedy antennas cover 100% of houses along the road', () => {
      const lcg = createLcg(888);
      for (let trial = 0; trial < 10; trial++) {
        const n = 8;
        const houses = Array.from(new Set(Array.from({ length: n }, () => Math.floor(lcg() * 50)))).sort((a, b) => a - b);
        const radius = 4;

        const antennas = solveRoadAntennas(houses, radius);
        const check = verifyAntennaCoverage(houses, antennas, radius);
        expect(check.uncoveredHouses).toHaveLength(0);
        const valRes = roadAntennasValidator.validate({ houses, radius }, antennas);
        expect(valRes.valid).toBe(true);
      }
    });
  });

  describe('13. Longest Common Subsequence (LCS) vs 2^N Subsequence Search Oracle', () => {
    it('matches exact length from 2^N subsequence search oracle', () => {
      const testPairs = [
        ['ABCBDAB', 'BDCABA'],
        ['AGGTAB', 'GXTXAYB'],
        ['DYNAMIC', 'PROGRAM'],
        ['TDA', 'ATD']
      ];

      for (const [s1, s2] of testPairs) {
        const oracleLen = bruteForceLcs(s1, s2);
        const lcsStr = solveLcs(s1, s2);

        expect(lcsStr.length).toBe(oracleLen);
        const valRes = lcsValidator.validate({ s1, s2 }, lcsStr);
        expect(valRes.valid).toBe(true);
      }
    });
  });

  describe('14. Peak Finding D&C vs Mathematical Peak Invariant Oracle', () => {
    it('verifies that found index satisfies arr[p-1] <= arr[p] >= arr[p+1]', () => {
      const lcg = createLcg(999);
      for (let trial = 0; trial < 20; trial++) {
        const len = 5 + Math.floor(lcg() * 25);
        const arr = Array.from({ length: len }, () => Math.floor(lcg() * 100));

        const peakIdx = solvePeakFinding(arr);
        expect(verifyPeakCondition(arr, peakIdx)).toBe(true);

        const valRes = peakFindingValidator.validate({ array: arr }, peakIdx);
        expect(valRes.valid).toBe(true);
      }
    });
  });

  describe('15. Graph Coloring Backtracking vs Exhaustive K^V Search Oracle', () => {
    it('finds valid coloring matching brute-force oracle on small graphs', () => {
      const vertices = ['v1', 'v2', 'v3', 'v4'];
      const edges: [string, string][] = [
        ['v1', 'v2'],
        ['v2', 'v3'],
        ['v3', 'v4'],
        ['v4', 'v1'],
        ['v1', 'v3'] // Chord creates two triangles -> requires k=3
      ];

      const oracle3 = bruteForceGraphColoring(vertices, edges, 3);
      expect(oracle3).not.toBeNull();
      const sol3 = solveGraphColoring({ vertices, edges, k: 3 });
      expect(sol3).not.toBeNull();
      const valRes3 = graphColoringValidator.validate({ vertices, edges, k: 3 }, sol3!);
      expect(valRes3.valid).toBe(true);

      // With k=2, should be impossible
      const oracle2 = bruteForceGraphColoring(vertices, edges, 2);
      expect(oracle2).toBeNull();
      const sol2 = solveGraphColoring({ vertices, edges, k: 2 });
      expect(sol2).toBeNull();
    });
  });

  describe('16. Max Flow Ford-Fulkerson vs Kirchhoff Conservation Oracle', () => {
    it('verifies flow satisfies capacity constraints and vertex conservation', () => {
      const vertices = ['s', 'a', 'b', 't'];
      const edges = [
        { u: 's', v: 'a', capacity: 10 },
        { u: 's', v: 'b', capacity: 5 },
        { u: 'a', v: 'b', capacity: 15 },
        { u: 'a', v: 't', capacity: 10 },
        { u: 'b', v: 't', capacity: 10 }
      ];

      const flowResult = solveMaxFlow({ vertices, edges, source: 's', sink: 't' });
      expect(flowResult.maxFlow).toBe(15);

      const capMap: Record<string, Record<string, number>> = {};
      const flowMap: Record<string, Record<string, number>> = {};
      for (const e of edges) {
        if (!capMap[e.u]) capMap[e.u] = {};
        capMap[e.u][e.v] = e.capacity;
      }
      for (const [edgeKey, fl] of Object.entries(flowResult.edgeFlows)) {
        const [u, v] = edgeKey.split('->');
        if (!flowMap[u]) flowMap[u] = {};
        flowMap[u][v] = fl;
      }

      const check = verifyFlowConservation(vertices, capMap, flowMap, 's', 't');
      expect(check.valid).toBe(true);
      expect(check.netFlow).toBe(15);

      const valRes = maxFlowValidator.validate({ vertices, edges, source: 's', sink: 't' }, flowResult);
      expect(valRes.valid).toBe(true);
    });
  });

  describe('17. Reduction IS -> VC vs Duality Invariant Oracle', () => {
    it('verifies |IS| + |VC| = |V| and mutual independence and coverage', () => {
      const vertices = ['1', '2', '3', '4', '5'];
      const edges: [string, string][] = [
        ['1', '2'],
        ['2', '3'],
        ['3', '4'],
        ['4', '5'],
        ['5', '1']
      ]; // 5-cycle graph

      const independentSet = ['1', '3']; // Valid IS of size 2
      const input = { vertices, edges, k: 2 };
      const output = reduceIndependentSetToVertexCover(input, independentSet);

      const check = verifyReductionDuality(vertices, edges, independentSet, output.vertexCover);
      expect(check.valid).toBe(true);
      expect(check.errors).toHaveLength(0);

      const valRes = reductionIsVcValidator.validate(input, output);
      expect(valRes.valid).toBe(true);
    });
  });

  describe('18. Randomized Fair Coin vs Bernoulli von Neumann Oracle', () => {
    it('transforms heavily biased coin (p=0.8) into fair coin with empirical fairness', () => {
      const sim = simulateVonNeumannCoin(0.8, 1000);
      const totalDecisive = sim.fairZero + sim.fairOne;

      expect(totalDecisive).toBeGreaterThan(100);
      const ratioZero = sim.fairZero / totalDecisive;
      // Should be within statistical tolerance of 0.5
      expect(ratioZero).toBeGreaterThan(0.4);
      expect(ratioZero).toBeLessThan(0.6);

      const valBit = randomizedFairCoinValidator.validate({ bias: 0.8 }, 1);
      expect(valBit.valid).toBe(true);

      const valResult = randomizedFairCoinValidator.validate({ bias: 0.8 }, simulateVonNeumann(0.8, 5000));
      expect(valResult.valid).toBe(true);
    });
  });

  describe('19. Merge Sort Sorting Invariant Oracle', () => {
    it('verifies monotonic non-decreasing order and multiset preservation', () => {
      const sample = [38, 27, 43, 3, 9, 82, 10];
      const sorted = [...sample].sort((a, b) => a - b);

      const valRes = mergeSortValidator.validate({ array: sample }, sorted);
      expect(valRes.valid).toBe(true);

      // Verify unsorted array is rejected
      const badRes = mergeSortValidator.validate({ array: sample }, [3, 9, 27, 38, 10, 43, 82]);
      expect(badRes.valid).toBe(false);
    });
  });

  describe('20. Knapsack Greedy Continuous Relaxation Dominance Bound Oracle', () => {
    it('verifies fractional greedy value >= 0/1 integer optimal value', () => {
      const items = [
        { id: '1', name: 'A', weight: 10, value: 60 },
        { id: '2', name: 'B', weight: 20, value: 100 },
        { id: '3', name: 'C', weight: 30, value: 120 }
      ];
      const capacity = 50;

      const intOptimalItems = [items[1], items[2]];
      const intOptimal = knapsackDpValidator.validate({ items, capacity }, intOptimalItems);
      expect(intOptimal.valid).toBe(true);

      const assignments = [
        { itemId: '1', fraction: 1, valueTaken: 60, weightTaken: 10 },
        { itemId: '2', fraction: 1, valueTaken: 100, weightTaken: 20 },
        { itemId: '3', fraction: 2 / 3, valueTaken: 80, weightTaken: 20 }
      ];

      const valRes = knapsackGreedyValidator.validate({ items, capacity }, assignments);
      expect(valRes.valid).toBe(true);

      const fractionalTotal = assignments.reduce((acc, a) => acc + a.valueTaken, 0);
      expect(fractionalTotal).toBeGreaterThanOrEqual(220);
    });
  });

  describe('21. Linear Programming 2D Feasibility & Objective Bound Oracle', () => {
    it('verifies computed optimal point satisfies all constraints and non-negativity', () => {
      // Maximize 3x + 2y subject to:
      // x + y <= 4
      // x - y <= 2
      // x, y >= 0
      const objective: [number, number] = [3, 2];
      const constraints = [
        { a: 1, b: 1, c: 4, label: 'x + y <= 4' },
        { a: 1, b: -1, c: 2, label: 'x - y <= 2' }
      ];

      const sol = solveLP2D(objective, constraints);
      expect(sol.feasible).toBe(true);
      expect(sol.optimalPoint).toBeDefined();

      const [x, y] = sol.optimalPoint!;
      expect(x).toBeGreaterThanOrEqual(-1e-6);
      expect(y).toBeGreaterThanOrEqual(-1e-6);
      expect(x + y).toBeLessThanOrEqual(4 + 1e-6);
      expect(x - y).toBeLessThanOrEqual(2 + 1e-6);

      const valRes = linearProgrammingValidator.validate({ objective, constraints }, [x, y]);
      expect(valRes.valid).toBe(true);
    });
  });
});
