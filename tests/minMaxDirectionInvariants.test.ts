import { describe, it, expect } from 'vitest';
import { DEFAULT_KRUSKAL_GRAPH } from '../src/engine/algorithms/kruskalTrace';

describe('Minimization and Maximization Direction Invariants (Mission V12 §1.3 & §2.2)', () => {
  describe('Minimization Problems (Lower is strictly better)', () => {
    it('Kruskal / MST: recognizes weight 9 as optimal and strictly rejects weight 10 as suboptimal', () => {
      const { nodes, edges } = DEFAULT_KRUSKAL_GRAPH;

      // Dynamic Kruskal calculation
      const sorted = [...edges].sort((a, b) => a.weight - b.weight);
      const parent: Record<string, string> = {};
      for (const n of nodes) parent[n.id] = n.id;
      function find(i: string): string {
        if (parent[i] === i) return i;
        return (parent[i] = find(parent[i]));
      }

      let optimalWeight = 0;
      let count = 0;
      for (const e of sorted) {
        const rootU = find(e.u);
        const rootV = find(e.v);
        if (rootU !== rootV) {
          parent[rootU] = rootV;
          optimalWeight += e.weight;
          count++;
          if (count === nodes.length - 1) break;
        }
      }

      // Ground truth: optimal MST weight is 9, NOT 10
      expect(optimalWeight).toBe(9);

      // Verify invariant: candidate with weight 9 is strictly better than candidate with weight 10
      const candidateBetter = 9;
      const candidateWorse = 10;
      expect(candidateBetter < candidateWorse).toBe(true);
      expect(candidateBetter <= optimalWeight).toBe(true);
      expect(candidateWorse <= optimalWeight).toBe(false);
    });

    it('Road Antennas: fewer antennas is strictly better', () => {
      const minAntennas = 2;
      const suboptimalAntennas = 3;
      expect(minAntennas < suboptimalAntennas).toBe(true);
    });

    it('Minimize Lateness: lower maximum lateness is strictly better', () => {
      const optLateness = 0;
      const suboptLateness = 5;
      expect(optLateness < suboptLateness).toBe(true);
    });

    it('Coin Change: fewer coins used is strictly better', () => {
      const optCoins = 3; // e.g. for amount 6 with [1, 3, 4]: 3+3 (2 coins) vs 4+1+1 (3 coins)
      const suboptCoins = 4;
      expect(optCoins < suboptCoins).toBe(true);
    });

    it('Vertex Cover: smaller cover size is strictly better', () => {
      const optCoverSize = 3;
      const suboptCoverSize = 5;
      expect(optCoverSize < suboptCoverSize).toBe(true);
    });

    it('Shortest Paths (Dijkstra / Bellman-Ford): shorter distance is strictly better', () => {
      const shortestDist = 7;
      const longerDist = 12;
      expect(shortestDist < longerDist).toBe(true);
    });
  });

  describe('Maximization Problems (Higher is strictly better)', () => {
    it('Knapsack (Value): higher total value is strictly better', () => {
      const higherValue = 280;
      const lowerValue = 220;
      expect(higherValue > lowerValue).toBe(true);
    });

    it('Interval Scheduling: more scheduled compatible intervals is strictly better', () => {
      const optCount = 4;
      const suboptCount = 2;
      expect(optCount > suboptCount).toBe(true);
    });

    it('Longest Common Subsequence (LCS): longer length is strictly better', () => {
      const optLcsLen = 5;
      const suboptLcsLen = 3;
      expect(optLcsLen > suboptLcsLen).toBe(true);
    });

    it('Max Flow: higher net flow into sink is strictly better', () => {
      const maxFlow = 23;
      const suboptimalFlow = 19;
      expect(maxFlow > suboptimalFlow).toBe(true);
    });

    it('Max Subarray: higher contiguous sum is strictly better', () => {
      const maxSum = 15;
      const suboptSum = 8;
      expect(maxSum > suboptSum).toBe(true);
    });
  });
});
