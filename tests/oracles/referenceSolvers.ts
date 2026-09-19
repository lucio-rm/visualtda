/**
 * Independent Brute-Force & Reference Solvers (Test Oracles)
 *
 * These solvers are intentionally implemented using completely independent,
 * brute-force, or axiomatic combinatorial definitions rather than dynamic programming
 * or greedy heuristics. They serve as uncorrupted test oracles to verify that
 * platform algorithms and validators produce the true mathematical optimal solutions.
 */

// ─── 1. Knapsack 0/1 Brute-Force Oracle ──────────────────────────────────────
export interface OracleKnapsackItem {
  id: string;
  weight: number;
  value: number;
}

export function bruteForceKnapsack(
  items: OracleKnapsackItem[],
  capacity: number
): { maxValue: number; bestSubset: OracleKnapsackItem[] } {
  const n = items.length;
  let maxValue = 0;
  let bestSubset: OracleKnapsackItem[] = [];

  // Enumerate all 2^n subsets
  const totalCombinations = 1 << n;
  for (let mask = 0; mask < totalCombinations; mask++) {
    let currentWeight = 0;
    let currentValue = 0;
    const currentSubset: OracleKnapsackItem[] = [];

    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        currentWeight += items[i].weight;
        currentValue += items[i].value;
        currentSubset.push(items[i]);
      }
    }

    if (currentWeight <= capacity && currentValue > maxValue) {
      maxValue = currentValue;
      bestSubset = currentSubset;
    }
  }

  return { maxValue, bestSubset };
}

// ─── 2. Coin Change Brute-Force Oracle ───────────────────────────────────────
export function bruteForceCoinChange(
  coins: number[],
  target: number
): { minCoins: number; combination: number[] | null } {
  if (target === 0) return { minCoins: 0, combination: [] };
  if (target < 0 || coins.length === 0) return { minCoins: -1, combination: null };

  const validCoins = coins.filter((c) => c > 0);
  let bestCombo: number[] | null = null;

  function search(remaining: number, currentCombo: number[], startIndex: number) {
    if (remaining === 0) {
      if (bestCombo === null || currentCombo.length < bestCombo.length) {
        bestCombo = [...currentCombo];
      }
      return;
    }
    if (remaining < 0) return;
    if (bestCombo !== null && currentCombo.length >= bestCombo.length) return;

    for (let i = startIndex; i < validCoins.length; i++) {
      const c = validCoins[i];
      if (c <= remaining) {
        currentCombo.push(c);
        search(remaining - c, currentCombo, i);
        currentCombo.pop();
      }
    }
  }

  search(target, [], 0);

  return {
    minCoins: bestCombo ? (bestCombo as number[]).length : -1,
    combination: bestCombo
  };
}

// ─── 3. Subset Sum Brute-Force Oracle ────────────────────────────────────────
export function bruteForceSubsetSum(
  numbers: number[],
  target: number
): number[][] {
  const n = numbers.length;
  const solutions: number[][] = [];

  const total = 1 << n;
  for (let mask = 1; mask < total; mask++) {
    let sum = 0;
    const subset: number[] = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        sum += numbers[i];
        subset.push(numbers[i]);
      }
    }
    if (sum === target) {
      solutions.push(subset);
    }
  }

  return solutions;
}

// ─── 4. Weighted Interval Scheduling Brute-Force Oracle ─────────────────────
export interface OracleInterval {
  id: string;
  start: number;
  end: number;
  weight: number;
}

export function bruteForceWeightedIntervals(
  intervals: OracleInterval[]
): { maxWeight: number; bestSubset: OracleInterval[] } {
  const n = intervals.length;
  let maxWeight = 0;
  let bestSubset: OracleInterval[] = [];

  const total = 1 << n;
  for (let mask = 0; mask < total; mask++) {
    const subset: OracleInterval[] = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        subset.push(intervals[i]);
      }
    }

    // Check pairwise compatibility
    let compatible = true;
    for (let a = 0; a < subset.length; a++) {
      for (let b = a + 1; b < subset.length; b++) {
        const i1 = subset[a];
        const i2 = subset[b];
        // Overlap condition: not (i1.end <= i2.start || i2.end <= i1.start)
        if (!(i1.end <= i2.start || i2.end <= i1.start)) {
          compatible = false;
          break;
        }
      }
      if (!compatible) break;
    }

    if (compatible) {
      const weight = subset.reduce((acc, it) => acc + it.weight, 0);
      if (weight > maxWeight) {
        maxWeight = weight;
        bestSubset = subset;
      }
    }
  }

  return { maxWeight, bestSubset };
}

// ─── 5. Inversion Counting Brute-Force O(n^2) Oracle ────────────────────────
export function bruteForceInversionCount(arr: number[]): number {
  let count = 0;
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (arr[i] > arr[j]) {
        count++;
      }
    }
  }
  return count;
}

// ─── 6. N-Queens Independent Conflict Checker Oracle ────────────────────────
export function verifyNQueensBoard(board: number[]): {
  isValid: boolean;
  conflicts: string[];
} {
  const n = board.length;
  const conflicts: string[] = [];

  if (n === 0) return { isValid: false, conflicts: ['Empty board'] };

  for (let r1 = 0; r1 < n; r1++) {
    const c1 = board[r1];
    if (c1 < 0 || c1 >= n || !Number.isInteger(c1)) {
      conflicts.push(`Reina fuera de rango en fila ${r1}: columna ${c1}`);
      continue;
    }
    for (let r2 = r1 + 1; r2 < n; r2++) {
      const c2 = board[r2];
      // Column conflict
      if (c1 === c2) {
        conflicts.push(`Conflicto de columna entre fila ${r1} y ${r2} (columna ${c1})`);
      }
      // Diagonal conflict: |r1 - r2| === |c1 - c2|
      if (Math.abs(r1 - r2) === Math.abs(c1 - c2)) {
        conflicts.push(`Conflicto diagonal entre (${r1}, ${c1}) y (${r2}, ${c2})`);
      }
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

// ─── 7. Prefix-Free Codebook Verification Oracle ────────────────────────────
export function verifyPrefixFreeCodebook(codes: Record<string, string>): {
  isPrefixFree: boolean;
  violations: string[];
} {
  const entries = Object.entries(codes);
  const violations: string[] = [];

  for (let i = 0; i < entries.length; i++) {
    const [char1, code1] = entries[i];
    for (let j = 0; j < entries.length; j++) {
      if (i === j) continue;
      const [char2, code2] = entries[j];
      if (code2.startsWith(code1)) {
        violations.push(
          `Código de '${char1}' ("${code1}") es prefijo del código de '${char2}' ("${code2}")`
        );
      }
    }
  }

  return {
    isPrefixFree: violations.length === 0,
    violations
  };
}

// ─── 8. Minimum Vertex Cover Brute-Force Oracle ─────────────────────────────
export function bruteForceMinVertexCover(
  vertices: string[],
  edges: [string, string][]
): { minSize: number; cover: string[] } {
  const n = vertices.length;
  let minSize = n;
  let bestCover = [...vertices];

  const total = 1 << n;
  for (let mask = 0; mask < total; mask++) {
    const subset = new Set<string>();
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        subset.add(vertices[i]);
      }
    }

    // Check if subset covers every edge
    let coversAll = true;
    for (const [u, v] of edges) {
      if (!subset.has(u) && !subset.has(v)) {
        coversAll = false;
        break;
      }
    }

    if (coversAll && subset.size < minSize) {
      minSize = subset.size;
      bestCover = Array.from(subset);
    }
  }

  return { minSize, cover: bestCover };
}
