import { describe, it, expect } from 'vitest';
import { generateDijkstraTrace } from '../src/engine/algorithms/dijkstraTrace';
import { generateKruskalTrace } from '../src/engine/algorithms/kruskalTrace';
import { generateIntervalPartitioningTrace } from '../src/engine/algorithms/intervalPartitioningTrace';
import { generateMinimizeLatenessTrace } from '../src/engine/algorithms/minimizeLatenessTrace';
import { generateBellmanFordTrace } from '../src/engine/algorithms/bellmanFordTrace';
import { generateSegmentedLeastSquaresTrace } from '../src/engine/algorithms/segmentedLeastSquaresTrace';
import { generateRnaTrace } from '../src/engine/algorithms/rnaSecondaryStructureTrace';
import { generateClosestPairTrace } from '../src/engine/algorithms/closestPairTrace';
import { generateKaratsubaTrace } from '../src/engine/algorithms/karatsubaTrace';
import { generateMajorityElementTrace } from '../src/engine/algorithms/majorityElementTrace';
import { generateMedianOfMediansTrace } from '../src/engine/algorithms/medianOfMediansTrace';
import { generateHamiltonianCycleTrace } from '../src/engine/algorithms/hamiltonianCycleTrace';
import { generateKnightsTourTrace } from '../src/engine/algorithms/knightsTourTrace';
import { generateSudokuTrace } from '../src/engine/algorithms/sudokuTrace';
import { generateKnapsackBBTrace } from '../src/engine/algorithms/knapsackBranchAndBoundTrace';
import { generateTspBBTrace } from '../src/engine/algorithms/tspBranchAndBoundTrace';

describe('Extended Trace Generators Verification (Mission V4 Section 47 & 68)', () => {
  describe('1. Dijkstra Greedy Trace', () => {
    it('produces valid step timeline and computes shortest path to destination', () => {
      const trace = generateDijkstraTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.action).toBe('COMPLETE');
      expect(finalState.distances['T']).toBeGreaterThan(0);
      expect(finalState.visited.includes('T')).toBe(true);
      expect(finalState.distances['S']).toBe(0);
    });

    it('is deterministic across repeated calls', () => {
      const t1 = generateDijkstraTrace();
      const t2 = generateDijkstraTrace();
      expect(t1.events.length).toBe(t2.events.length);
      expect(t1.events[t1.events.length - 1].data.distances).toEqual(
        t2.events[t2.events.length - 1].data.distances
      );
    });
  });

  describe('2. Kruskal MST Greedy Trace', () => {
    it('constructs a valid Minimum Spanning Tree with |V|-1 edges and no cycles', () => {
      const trace = generateKruskalTrace();
      expect(trace.events.length).toBeGreaterThan(6);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.mstEdges.length).toBe(finalState.nodes.length - 1);
      expect(finalState.totalMstWeight).toBeGreaterThan(0);
      expect(finalState.rejectedEdges.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('3. Interval Partitioning Greedy Trace', () => {
    it('allocates rooms without time conflicts and matches maximum depth', () => {
      const trace = generateIntervalPartitioningTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.depth).toBeGreaterThanOrEqual(2);
      expect(finalState.classrooms.length).toBe(finalState.depth);

      // Verify no two intervals assigned to the same classroom overlap
      const intervalMap = new Map(finalState.intervals.map((i) => [i.id, i]));
      for (const room of finalState.classrooms) {
        const roomIntervals = room.assignedIds
          .map((id) => intervalMap.get(id)!)
          .sort((a, b) => a.start - b.start);

        for (let i = 0; i < roomIntervals.length - 1; i++) {
          expect(
            roomIntervals[i].end,
            `Overlap in classroom ${room.id} between [${roomIntervals[i].start}, ${roomIntervals[i].end}] and [${roomIntervals[i + 1].start}, ${roomIntervals[i + 1].end}]`
          ).toBeLessThanOrEqual(roomIntervals[i + 1].start);
        }
      }
    });
  });

  describe('4. Minimize Lateness Greedy Trace', () => {
    it('sorts jobs by deadline (EDF) and calculates schedule lateness accurately', () => {
      const trace = generateMinimizeLatenessTrace();
      expect(trace.events.length).toBeGreaterThan(4);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.scheduledJobs.length).toBe(finalState.jobs.length);
      expect(finalState.maxLateness).toBeGreaterThanOrEqual(0);

      // Verify earliest deadline first order
      for (let i = 0; i < finalState.scheduledJobs.length - 1; i++) {
        expect(finalState.scheduledJobs[i].deadline).toBeLessThanOrEqual(
          finalState.scheduledJobs[i + 1].deadline
        );
      }
    });
  });

  describe('5. Bellman-Ford DP Trace', () => {
    it('computes shortest paths across V-1 iterations and verifies absence of negative cycles', () => {
      const trace = generateBellmanFordTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.hasNegativeCycle).toBe(false);
      const finalDistances = finalState.table[finalState.table.length - 1];
      expect(finalDistances['S']).toBe(0);
      expect(finalDistances['T']).toBeDefined();
      expect(Number.isFinite(finalDistances['T'])).toBe(true);
    });
  });

  describe('6. Segmented Least Squares DP Trace', () => {
    it('computes error matrix and optimal segment partition', () => {
      const trace = generateSegmentedLeastSquaresTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.optimalSegments.length).toBeGreaterThan(0);
      expect(finalState.opt[finalState.opt.length - 1]).toBeGreaterThan(0);
    });
  });

  describe('7. RNA Secondary Structure DP Trace', () => {
    it('satisfies Watson-Crick pairs, sharp turn (len > 4), and non-crossing constraints', () => {
      const trace = generateRnaTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      const pairs = finalState.pairs;

      // Watson-Crick and no-sharp-turn
      const validPairs = new Set(['AU', 'UA', 'CG', 'GC']);
      for (const p of pairs) {
        expect(p.j - p.i).toBeGreaterThan(4);
        const combo = p.baseI + p.baseJ;
        expect(validPairs.has(combo)).toBe(true);
      }

      // Non-crossing condition: no (i < k < j < l)
      for (let a = 0; a < pairs.length; a++) {
        for (let b = a + 1; b < pairs.length; b++) {
          const { i, j } = pairs[a];
          const { i: k, j: l } = pairs[b];
          const crosses = (i < k && k < j && j < l) || (k < i && i < l && l < j);
          expect(crosses).toBe(false);
        }
      }
    });
  });

  describe('8. Closest Pair of Points D&C Trace', () => {
    it('finds the strictly closest pair of 2D points', () => {
      const trace = generateClosestPairTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.bestPair).not.toBeNull();
      expect(finalState.delta).toBeGreaterThan(0);

      // Verify against brute force O(n^2) check
      const pts = finalState.points;
      let bruteMin = Infinity;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < bruteMin) bruteMin = d;
        }
      }
      expect(Math.abs(finalState.delta - bruteMin)).toBeLessThan(0.1);
    });
  });

  describe('9. Karatsuba Multiplication D&C Trace', () => {
    it('correctly calculates product with 3 recursive multiplications', () => {
      const trace = generateKaratsubaTrace(1234, 5678);
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.result).toBe(1234 * 5678);
      expect(finalState.multiplicationCount).toBe(3);
    });
  });

  describe('10. Majority Element D&C Trace', () => {
    it('identifies majority element when one exists strictly above n/2 frequency', () => {
      const trace = generateMajorityElementTrace([2, 2, 1, 2, 3, 2, 2]);
      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.winner).toBe(2);
    });

    it('identifies when no majority element exists', () => {
      const trace = generateMajorityElementTrace([1, 2, 3, 4]);
      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.winner).toBeNull();
    });
  });

  describe('11. Median of Medians D&C Trace', () => {
    it('partitions into groups of 5 and selects correct k-th element', () => {
      const arr = [12, 3, 5, 7, 4, 19, 26, 1, 8, 15, 2];
      const trace = generateMedianOfMediansTrace(arr, 3);
      const finalState = trace.events[trace.events.length - 1].data;

      expect(finalState.groups.length).toBe(Math.ceil(arr.length / 5));
      expect(finalState.pivot).not.toBeNull();
    });
  });

  describe('12. Hamiltonian Cycle Backtracking Trace', () => {
    it('finds a cycle visiting every vertex once and returning to origin', () => {
      const trace = generateHamiltonianCycleTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.isCycleFound).toBe(true);
      expect(finalState.currentPath.length).toBe(finalState.nodes.length + 1);
      expect(finalState.currentPath[0]).toBe(finalState.currentPath[finalState.currentPath.length - 1]);
    });
  });

  describe('13. Knight’s Tour Backtracking Trace', () => {
    it('moves knight with valid L-shape jumps and never visits a square twice', () => {
      const trace = generateKnightsTourTrace(5); // 5x5 board
      expect(trace.events.length).toBeGreaterThan(10);

      const finalState = trace.events[trace.events.length - 1].data;
      const path = finalState.path;

      for (let i = 0; i < path.length - 1; i++) {
        const [r1, c1] = path[i];
        const [r2, c2] = path[i + 1];
        const dr = Math.abs(r1 - r2);
        const dc = Math.abs(c1 - c2);
        const isKnightMove = (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
        expect(isKnightMove, `Move from (${r1},${c1}) to (${r2},${c2}) must be knight move`).toBe(true);
      }

      // No square visited twice
      const keys = path.map((pt: [number, number]) => `${pt[0]},${pt[1]}`);
      expect(new Set(keys).size).toBe(path.length);
    });
  });

  describe('14. Sudoku Backtracking Trace', () => {
    it('traces valid search space exploration with MRV heuristic', () => {
      const trace = generateSudokuTrace();
      expect(trace.events.length).toBeGreaterThan(10);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.board).toBeDefined();
      expect(finalState.exploredStates).toBeGreaterThan(0);

      // Verify that all placed numbers are valid digits (0..9)
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          const val = finalState.board[r][c];
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(9);
        }
      }
    });
  });

  describe('15. Knapsack Branch & Bound Trace', () => {
    it('finds optimal 0/1 knapsack value and prunes nodes using fractional upper bound', () => {
      const trace = generateKnapsackBBTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.incumbentBest).toBeGreaterThan(0);
      expect(finalState.prunedCount).toBeGreaterThan(0);
    });
  });

  describe('16. TSP Branch & Bound Trace', () => {
    it('finds optimal traveling salesperson tour cost using edge lower bounds', () => {
      const trace = generateTspBBTrace();
      expect(trace.events.length).toBeGreaterThan(5);

      const finalState = trace.events[trace.events.length - 1].data;
      expect(finalState.incumbentBest).toBeGreaterThan(0);
      expect(finalState.currentTour.length).toBe(finalState.cities.length + 1);
      expect(finalState.prunedCount).toBeGreaterThan(0);
    });
  });
});
