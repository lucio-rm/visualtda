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

// ─── 9. Graph k-Coloring Brute-Force Oracle ─────────────────────────────────
export function bruteForceGraphColoring(
  vertices: string[],
  edges: [string, string][],
  k: number
): Record<string, number> | null {
  const n = vertices.length;
  const total = Math.pow(k, n);

  for (let config = 0; config < total; config++) {
    const coloring: Record<string, number> = {};
    let temp = config;
    for (let i = 0; i < n; i++) {
      coloring[vertices[i]] = (temp % k) + 1;
      temp = Math.floor(temp / k);
    }

    // Check edge conflicts
    let conflict = false;
    for (const [u, v] of edges) {
      if (coloring[u] === coloring[v]) {
        conflict = true;
        break;
      }
    }

    if (!conflict) {
      return coloring;
    }
  }

  return null;
}

// ─── 10. Interval Scheduling Brute-Force 2^N Oracle ──────────────────────────
export function bruteForceIntervalScheduling(
  intervals: Array<{ start: number; end: number }>
): number {
  const n = intervals.length;
  let maxCount = 0;
  const total = 1 << n;

  for (let mask = 0; mask < total; mask++) {
    const subset: Array<{ start: number; end: number }> = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        subset.push(intervals[i]);
      }
    }

    // Check mutual compatibility: for any two intervals i and j, no overlap
    let compatible = true;
    for (let i = 0; i < subset.length; i++) {
      for (let j = i + 1; j < subset.length; j++) {
        const a = subset[i];
        const b = subset[j];
        if (a.start < b.end && b.start < a.end) {
          compatible = false;
          break;
        }
      }
      if (!compatible) break;
    }

    if (compatible && subset.length > maxCount) {
      maxCount = subset.length;
    }
  }

  return maxCount;
}

// ─── 11. Maximum Subarray Brute-Force O(N^2) Oracle ─────────────────────────
export function bruteForceMaxSubarray(arr: number[]): {
  maxSum: number;
  startIndex: number;
  endIndex: number;
} {
  if (arr.length === 0) return { maxSum: 0, startIndex: -1, endIndex: -1 };

  let maxSum = -Infinity;
  let start = 0;
  let end = 0;

  for (let i = 0; i < arr.length; i++) {
    let currentSum = 0;
    for (let j = i; j < arr.length; j++) {
      currentSum += arr[j];
      if (currentSum > maxSum) {
        maxSum = currentSum;
        start = i;
        end = j;
      }
    }
  }

  return { maxSum, startIndex: start, endIndex: end };
}

// ─── 12. Juan el Vago (Non-consecutive Day Selection) Brute-Force Oracle ────
export function bruteForceJuanElVago(pago: number[]): number {
  const n = pago.length;
  let maxPay = 0;
  const total = 1 << n;

  for (let mask = 0; mask < total; mask++) {
    // Check non-consecutive constraint: no two adjacent bits 1
    if ((mask & (mask >> 1)) !== 0) continue;

    let sum = 0;
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        sum += pago[i];
      }
    }
    if (sum > maxPay) {
      maxPay = sum;
    }
  }

  return maxPay;
}

// ─── 13. Road Antennas Coverage Verifier Oracle ─────────────────────────────
export function verifyAntennaCoverage(
  houses: number[],
  antennas: number[],
  radius: number
): { coversAll: boolean; uncoveredHouses: number[] } {
  const uncovered: number[] = [];
  for (const house of houses) {
    const covered = antennas.some((ant) => Math.abs(house - ant) <= radius);
    if (!covered) {
      uncovered.push(house);
    }
  }
  return {
    coversAll: uncovered.length === 0,
    uncoveredHouses: uncovered
  };
}

// ─── 14. Longest Common Subsequence (LCS) Exhaustive Search Oracle ───────────
export function bruteForceLcs(s1: string, s2: string): number {
  function isSubseq(sub: string, full: string): boolean {
    let i = 0;
    let j = 0;
    while (i < sub.length && j < full.length) {
      if (sub[i] === full[j]) i++;
      j++;
    }
    return i === sub.length;
  }

  const n = s1.length;
  let maxLen = 0;
  const total = 1 << n;

  for (let mask = 0; mask < total; mask++) {
    let sub = '';
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        sub += s1[i];
      }
    }
    if (sub.length > maxLen && isSubseq(sub, s2)) {
      maxLen = sub.length;
    }
  }

  return maxLen;
}

// ─── 15. Peak Finding Mathematical Invariant Oracle ──────────────────────────
export function verifyPeakCondition(arr: number[], index: number): boolean {
  if (index < 0 || index >= arr.length) return false;
  const leftValid = index === 0 || arr[index] >= arr[index - 1];
  const rightValid = index === arr.length - 1 || arr[index] >= arr[index + 1];
  return leftValid && rightValid;
}

// ─── 16. Max Flow Conservation & Capacity Constraints Oracle ─────────────────
export function verifyFlowConservation(
  nodes: string[],
  capacities: Record<string, Record<string, number>>,
  flows: Record<string, Record<string, number>>,
  source: string,
  sink: string
): { valid: boolean; netFlow: number; violations: string[] } {
  const violations: string[] = [];

  // Capacity constraints: 0 <= flow(u,v) <= capacity(u,v)
  for (const u of nodes) {
    for (const v of nodes) {
      const cap = capacities[u]?.[v] || 0;
      const fl = flows[u]?.[v] || 0;
      if (fl < 0) {
        violations.push(`Flujo negativo en arista (${u}, ${v}): ${fl}`);
      }
      if (fl > cap) {
        violations.push(`Violación de capacidad en (${u}, ${v}): flujo ${fl} > cap ${cap}`);
      }
    }
  }

  // Conservation: sum_v flow(u,v) - sum_v flow(v,u) == 0 for u not in {s, t}
  for (const u of nodes) {
    if (u === source || u === sink) continue;
    let outflow = 0;
    let inflow = 0;
    for (const v of nodes) {
      outflow += flows[u]?.[v] || 0;
      inflow += flows[v]?.[u] || 0;
    }
    if (outflow !== inflow) {
      violations.push(`Violación de conservación de flujo en nodo ${u}: entrada ${inflow} != salida ${outflow}`);
    }
  }

  // Net flow out of source
  let netSourceFlow = 0;
  for (const v of nodes) {
    netSourceFlow += (flows[source]?.[v] || 0) - (flows[v]?.[source] || 0);
  }

  return {
    valid: violations.length === 0,
    netFlow: netSourceFlow,
    violations
  };
}

// ─── 17. Reduction IS -> VC Duality Invariant Oracle ─────────────────────────
export function verifyReductionDuality(
  vertices: string[],
  edges: [string, string][],
  independentSet: string[],
  vertexCover: string[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const vSet = new Set(vertices);
  const isSet = new Set(independentSet);
  const vcSet = new Set(vertexCover);

  // Invariant 1: Disjoint partition of V
  if (isSet.size + vcSet.size !== vSet.size) {
    errors.push(`Tamaño no complementario: |IS| (${isSet.size}) + |VC| (${vcSet.size}) != |V| (${vSet.size})`);
  }

  for (const v of vertices) {
    const inIS = isSet.has(v);
    const inVC = vcSet.has(v);
    if (inIS === inVC) {
      errors.push(`Vértice ${v} no satisface partición complementaria (inIS=${inIS}, inVC=${inVC})`);
    }
  }

  // Invariant 2: No two vertices in IS share an edge
  for (const [u, v] of edges) {
    if (isSet.has(u) && isSet.has(v)) {
      errors.push(`Arista (${u}, ${v}) contenida en el conjunto independiente IS`);
    }
  }

  // Invariant 3: Every edge is covered by at least one vertex in VC
  for (const [u, v] of edges) {
    if (!vcSet.has(u) && !vcSet.has(v)) {
      errors.push(`Arista (${u}, ${v}) no cubierta por la cubierta de vértices VC`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ─── 18. Randomized Fair Coin von Neumann Oracle ─────────────────────────────
export function simulateVonNeumannCoin(
  biasP: number,
  pairsCount: number
): { fairZero: number; fairOne: number; discarded: number } {
  let fairZero = 0;
  let fairOne = 0;
  let discarded = 0;

  // LCG for reproducible pseudo-random coin tosses
  let seed = 42;
  function toss(): number {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296 < biasP ? 1 : 0;
  }

  for (let i = 0; i < pairsCount; i++) {
    const t1 = toss();
    const t2 = toss();
    if (t1 === 0 && t2 === 1) {
      fairZero++;
    } else if (t1 === 1 && t2 === 0) {
      fairOne++;
    } else {
      discarded++;
    }
  }

  return { fairZero, fairOne, discarded };
}


