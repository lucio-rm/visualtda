import { describe, it, expect } from 'vitest';
import {
  bruteForceSudoku,
  verifyKnightsTour,
  bruteForceDijkstra,
  bruteForceMst,
  bruteForceBellmanFord,
  bruteForceClosestPair,
  bruteForceKnapsackBranchAndBound,
  bruteForceIntervalPartitioning,
  bruteForceMinimizeLateness,
  oracleBigIntMultiply,
  bruteForceMajorityElement,
  oracleKthElement,
  bruteForceSegmentedLeastSquares,
  bruteForceRnaSecondaryStructure,
  bruteForceHamiltonianCycle,
  bruteForceTsp
} from './oracles/referenceSolvers';

describe('Independent Reference Solvers & Oracles for Newer 16 Exercises (G11)', () => {
  // 1. Sudoku Backtracking
  it('Sudoku oracle solves valid 9x9 board and rejects invalid', () => {
    const validBoard = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
    expect(bruteForceSudoku(validBoard)).toBe(true);

    const impossibleBoard = [
      [5, 5, 0, 0, 7, 0, 0, 0, 0], // Conflict in first row
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
    expect(bruteForceSudoku(impossibleBoard)).toBe(false);
  });

  // 2. Knight's Tour
  it('Knight\'s Tour oracle verifies legitimate tour on 5x5 and flags illegal jumps', () => {
    // Valid 5x5 knight's tour
    const valid5x5: [number, number][] = [
      [0, 0], [1, 2], [2, 4], [4, 3], [3, 1],
      [1, 0], [2, 2], [0, 3], [1, 1], [3, 0],
      [4, 2], [3, 4], [1, 3], [0, 1], [2, 0],
      [4, 1], [3, 3], [1, 4], [0, 2], [2, 1],
      [4, 0], [3, 2], [4, 4], [2, 3], [0, 4]
    ];
    const checkValid = verifyKnightsTour(5, valid5x5);
    expect(checkValid.error).toBeUndefined();
    expect(checkValid.valid).toBe(true);

    // Invalid jump (not L-shape)
    const invalidJump = [...valid5x5];
    invalidJump[1] = [0, 2]; // straight move
    expect(verifyKnightsTour(5, invalidJump).valid).toBe(false);
  });

  // 3. Dijkstra Shortest Paths
  it('Dijkstra oracle finds exact min distances', () => {
    // Triangle graph: 0 -> 1 (w=4), 0 -> 2 (w=1), 2 -> 1 (w=2)
    const edges: [number, number, number][] = [
      [0, 1, 4],
      [0, 2, 1],
      [2, 1, 2]
    ];
    const dist = bruteForceDijkstra(3, edges, 0);
    expect(dist[0]).toBe(0);
    expect(dist[2]).toBe(1);
    expect(dist[1]).toBe(3); // via 2
  });

  // 4. Kruskal MST
  it('Kruskal MST oracle finds exact minimum spanning tree weight', () => {
    // Diamond with diagonal:
    // 0-1 (w=1), 1-2 (w=2), 2-3 (w=3), 3-0 (w=4), 0-2 (w=5)
    const edges: [number, number, number][] = [
      [0, 1, 1],
      [1, 2, 2],
      [2, 3, 3],
      [3, 0, 4],
      [0, 2, 5]
    ];
    const mst = bruteForceMst(4, edges);
    // Tree must use weights 1, 2, 3 -> sum = 6
    expect(mst.minWeight).toBe(6);
    expect(mst.edges.length).toBe(3);
  });

  // 5. Bellman-Ford
  it('Bellman-Ford oracle correctly detects negative edges and negative cycles', () => {
    const edgesNoCycle: [number, number, number][] = [
      [0, 1, 5],
      [1, 2, 2],
      [0, 2, 10],
      [2, 3, -4]
    ];
    const res1 = bruteForceBellmanFord(4, edgesNoCycle, 0);
    expect(res1.hasNegativeCycle).toBe(false);
    expect(res1.dist[3]).toBe(3); // 0->1(5) + 1->2(2) + 2->3(-4) = 3

    const edgesWithCycle: [number, number, number][] = [
      [0, 1, 1],
      [1, 2, -2],
      [2, 1, -1] // cycle 1-2 has weight -3
    ];
    const res2 = bruteForceBellmanFord(3, edgesWithCycle, 0);
    expect(res2.hasNegativeCycle).toBe(true);
  });

  // 6. Closest Pair of Points
  it('Closest Pair oracle computes true minimum Euclidean distance', () => {
    const points: [number, number][] = [
      [0, 0],
      [10, 10],
      [3, 4],
      [3, 5], // distance = 1
      [100, 100]
    ];
    const res = bruteForceClosestPair(points);
    expect(res.dist).toBeCloseTo(1.0);
  });

  // 7. Knapsack Branch and Bound
  it('Knapsack Branch and Bound oracle matches exact 2^n optimum', () => {
    const weights = [2, 3, 4, 5];
    const values = [3, 4, 5, 6];
    const capacity = 5;
    const res = bruteForceKnapsackBranchAndBound(capacity, weights, values);
    expect(res.maxValue).toBe(7); // items 0 (w=2, v=3) and 1 (w=3, v=4)
  });

  // 8. Interval Partitioning
  it('Interval Partitioning oracle determines exact room requirement via max overlap', () => {
    const intervals: [number, number][] = [
      [30, 75],
      [0, 50],
      [60, 150]
    ];
    // At t=40, [30, 75] and [0, 50] overlap (2 rooms)
    // At t=65, [30, 75] and [60, 150] overlap (2 rooms)
    expect(bruteForceIntervalPartitioning(intervals)).toBe(2);
  });

  // 9. Minimize Maximum Lateness
  it('Minimize Lateness oracle finds optimal ordering minimizing maximum overdue', () => {
    const tasks = [
      { length: 3, deadline: 6 },
      { length: 2, deadline: 8 },
      { length: 1, deadline: 9 },
      { length: 4, deadline: 9 },
      { length: 3, deadline: 14 },
      { length: 2, deadline: 15 }
    ];
    const res = bruteForceMinimizeLateness(tasks);
    expect(res.maxLateness).toBe(1);
  });

  // 10. Karatsuba BigInt Oracle
  it('Karatsuba multiplicative oracle matches arbitrary-precision BigInt arithmetic', () => {
    const a = '12345678901234567890';
    const b = '98765432109876543210';
    const expected = BigInt(a) * BigInt(b);
    expect(oracleBigIntMultiply(a, b)).toBe(expected);
  });

  // 11. Majority Element
  it('Majority Element oracle finds element occurring > n/2 times or returns null', () => {
    expect(bruteForceMajorityElement([3, 2, 3])).toBe(3);
    expect(bruteForceMajorityElement([2, 2, 1, 1, 1, 2, 2])).toBe(2);
    expect(bruteForceMajorityElement([1, 2, 3, 4])).toBeNull();
  });

  // 12. Median of Medians (K-th order statistic)
  it('K-th order statistic oracle matches exact sorted rank', () => {
    const arr = [12, 3, 5, 7, 4, 19, 26];
    // sorted: [3, 4, 5, 7, 12, 19, 26]
    expect(oracleKthElement(arr, 0)).toBe(3);
    expect(oracleKthElement(arr, 3)).toBe(7); // median
    expect(oracleKthElement(arr, 6)).toBe(26);
  });

  // 13. Segmented Least Squares
  it('Segmented Least Squares oracle evaluates partition tradeoffs correctly', () => {
    // 4 collinear points on line y = 2x, followed by 4 collinear points on line y = -x + 10
    const points: [number, number][] = [
      [1, 2], [2, 4], [3, 6], [4, 8],
      [5, 5], [6, 4], [7, 3], [8, 2]
    ];
    // With 2 perfect lines (error=0), cost is 2 * costC
    const costC = 5.0;
    const totalCost = bruteForceSegmentedLeastSquares(points, costC);
    expect(totalCost).toBeCloseTo(10.0, 1);
  });

  // 14. RNA Secondary Structure
  it('RNA Secondary Structure oracle enforces non-crossing and distance >= 4 pairing', () => {
    // Sequence 'ACGUUUGCAU'
    // A (0) pairs with U (5 or 9), C (1) pairs with G (6), etc.
    const seq = 'ACGUUUGCAU';
    const pairs = bruteForceRnaSecondaryStructure(seq);
    expect(pairs).toBeGreaterThanOrEqual(1);
  });

  // 15. Hamiltonian Cycle
  it('Hamiltonian Cycle oracle finds closed tour visiting every vertex once or returns null', () => {
    // 4-cycle 0-1-2-3-0
    const cycleEdges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0]
    ];
    const cycle = bruteForceHamiltonianCycle(4, cycleEdges);
    expect(cycle).not.toBeNull();
    expect(cycle?.length).toBe(5); // 0, 1, 2, 3, 0

    // Tree (no cycles)
    const treeEdges: [number, number][] = [
      [0, 1], [0, 2], [0, 3]
    ];
    expect(bruteForceHamiltonianCycle(4, treeEdges)).toBeNull();
  });

  // 16. TSP Branch and Bound
  it('TSP oracle finds exact minimum Hamiltonian cycle weight', () => {
    const distMatrix = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0]
    ];
    // 0-1 (10), 1-3 (25), 3-2 (30), 2-0 (15) -> 10 + 25 + 30 + 15 = 80
    const tsp = bruteForceTsp(distMatrix);
    expect(tsp.minCost).toBe(80);
    expect(tsp.tour.length).toBe(5);
  });
});
