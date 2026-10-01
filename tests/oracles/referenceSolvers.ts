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

// ─── 19. Sudoku Backtracking Oracle ──────────────────────────────────────────
export function bruteForceSudoku(board: number[][]): boolean {
  const grid = board.map((r) => [...r]);

  function isSafe(r: number, c: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === num || grid[i][c] === num) return false;
    }
    const startRow = Math.floor(r / 3) * 3;
    const startCol = Math.floor(c / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[startRow + i][startCol + j] === num) return false;
      }
    }
    return true;
  }

  function solve(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isSafe(r, c, num)) {
              grid[r][c] = num;
              if (solve()) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  return solve();
}

// ─── 20. Knight's Tour Validator Oracle ───────────────────────────────────────
export function verifyKnightsTour(
  boardSize: number,
  path: [number, number][]
): { valid: boolean; error?: string } {
  const totalCells = boardSize * boardSize;
  if (path.length !== totalCells) {
    return { valid: false, error: `Recorrido incompleto: ${path.length}/${totalCells} casillas` };
  }

  const visited = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    const [r, c] = path[i];
    if (r < 0 || r >= boardSize || c < 0 || c >= boardSize) {
      return { valid: false, error: `Casilla fuera de límites en paso ${i}: (${r}, ${c})` };
    }
    const key = `${r},${c}`;
    if (visited.has(key)) {
      return { valid: false, error: `Casilla repetida en paso ${i}: (${r}, ${c})` };
    }
    visited.add(key);

    if (i > 0) {
      const [pr, pc] = path[i - 1];
      const dr = Math.abs(r - pr);
      const dc = Math.abs(c - pc);
      const isKnightMove = (dr === 1 && dc === 2) || (dr === 2 && dc === 1);
      if (!isKnightMove) {
        return { valid: false, error: `Movimiento de caballo inválido de (${pr},${pc}) a (${r},${c}) en paso ${i}` };
      }
    }
  }

  return { valid: true };
}

// ─── 21. Dijkstra Shortest Paths Oracle ───────────────────────────────────────
export function bruteForceDijkstra(
  numVertices: number,
  edges: [number, number, number][],
  source: number
): Record<number, number> {
  const dist: Record<number, number> = {};
  for (let i = 0; i < numVertices; i++) dist[i] = Infinity;
  dist[source] = 0;

  // Build adjacency list
  const adj = new Map<number, [number, number][]>();
  for (const [u, v, w] of edges) {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push([v, w]);
  }

  // Exhaustive simple path search
  function dfs(curr: number, currDist: number, visited: Set<number>) {
    if (currDist < dist[curr]) {
      dist[curr] = currDist;
    }
    const neighbors = adj.get(curr) || [];
    for (const [nxt, w] of neighbors) {
      if (!visited.has(nxt)) {
        visited.add(nxt);
        dfs(nxt, currDist + w, visited);
        visited.delete(nxt);
      }
    }
  }

  const vSet = new Set<number>([source]);
  dfs(source, 0, vSet);
  return dist;
}

// ─── 22. Kruskal MST Exhaustive Oracle ────────────────────────────────────────
export function bruteForceMst(
  numVertices: number,
  edges: [number, number, number][]
): { minWeight: number; edges: [number, number, number][] } {
  const m = edges.length;
  const k = numVertices - 1;
  let minWeight = Infinity;
  let bestTree: [number, number, number][] = [];

  function checkConnected(chosen: [number, number, number][]): boolean {
    const parent = Array.from({ length: numVertices }, (_, i) => i);
    function find(i: number): number {
      if (parent[i] === i) return i;
      return (parent[i] = find(parent[i]));
    }
    function union(i: number, j: number): boolean {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI === rootJ) return false;
      parent[rootI] = rootJ;
      return true;
    }
    let edgesCount = 0;
    for (const [u, v] of chosen) {
      if (!union(u, v)) return false; // Cycle detected
      edgesCount++;
    }
    return edgesCount === k;
  }

  function combine(start: number, chosen: [number, number, number][], currentWeight: number) {
    if (chosen.length === k) {
      if (currentWeight < minWeight && checkConnected(chosen)) {
        minWeight = currentWeight;
        bestTree = [...chosen];
      }
      return;
    }
    for (let i = start; i < m; i++) {
      chosen.push(edges[i]);
      combine(i + 1, chosen, currentWeight + edges[i][2]);
      chosen.pop();
    }
  }

  combine(0, [], 0);
  return { minWeight, edges: bestTree };
}

// ─── 23. Bellman-Ford Negative-Cycle Shortest Paths Oracle ───────────────────
export function bruteForceBellmanFord(
  numVertices: number,
  edges: [number, number, number][],
  source: number
): { dist: Record<number, number>; hasNegativeCycle: boolean } {
  const dist: Record<number, number> = {};
  for (let i = 0; i < numVertices; i++) dist[i] = Infinity;
  dist[source] = 0;

  for (let i = 1; i <= numVertices - 1; i++) {
    for (const [u, v, w] of edges) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
      }
    }
  }

  let hasNegativeCycle = false;
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
      hasNegativeCycle = true;
      break;
    }
  }

  return { dist, hasNegativeCycle };
}

// ─── 24. Closest Pair of Points O(N^2) Oracle ────────────────────────────────
export function bruteForceClosestPair(
  points: [number, number][]
): { p1: [number, number]; p2: [number, number]; dist: number } {
  if (points.length < 2) {
    return { p1: [0, 0], p2: [0, 0], dist: Infinity };
  }
  let minDist = Infinity;
  let bestP1 = points[0];
  let bestP2 = points[1];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) {
        minDist = d;
        bestP1 = points[i];
        bestP2 = points[j];
      }
    }
  }

  return { p1: bestP1, p2: bestP2, dist: minDist };
}

// ─── 25. Knapsack Branch and Bound Exhaustive Oracle ──────────────────────────
export function bruteForceKnapsackBranchAndBound(
  capacity: number,
  weights: number[],
  values: number[]
): { maxValue: number; subset: number[] } {
  const n = weights.length;
  let maxVal = 0;
  let bestSubset: number[] = [];

  for (let mask = 0; mask < (1 << n); mask++) {
    let curW = 0;
    let curV = 0;
    const subset: number[] = [];
    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        curW += weights[i];
        curV += values[i];
        subset.push(i);
      }
    }
    if (curW <= capacity && curV > maxVal) {
      maxVal = curV;
      bestSubset = subset;
    }
  }

  return { maxValue: maxVal, subset: bestSubset };
}

// ─── 26. Interval Partitioning Max-Overlap Oracle ─────────────────────────────
export function bruteForceIntervalPartitioning(intervals: [number, number][]): number {
  if (intervals.length === 0) return 0;
  const events: { time: number; type: number }[] = [];
  for (const [start, end] of intervals) {
    events.push({ time: start, type: 1 });
    events.push({ time: end, type: -1 });
  }

  // Sort events: end times before start times if identical time
  events.sort((a, b) => a.time - b.time || a.type - b.type);

  let currentRooms = 0;
  let maxRooms = 0;
  for (const ev of events) {
    currentRooms += ev.type;
    if (currentRooms > maxRooms) maxRooms = currentRooms;
  }
  return maxRooms;
}

// ─── 27. Minimize Maximum Lateness Exhaustive Oracle ──────────────────────────
export function bruteForceMinimizeLateness(
  tasks: { length: number; deadline: number }[]
): { maxLateness: number; schedule: number[] } {
  const n = tasks.length;
  let minMaxLateness = Infinity;
  let bestSchedule: number[] = [];

  const indices = Array.from({ length: n }, (_, i) => i);

  function permute(arr: number[], m = [] as number[]) {
    if (arr.length === 0) {
      let t = 0;
      let lateness = 0;
      for (const idx of m) {
        t += tasks[idx].length;
        const taskLateness = Math.max(0, t - tasks[idx].deadline);
        if (taskLateness > lateness) lateness = taskLateness;
      }
      if (lateness < minMaxLateness) {
        minMaxLateness = lateness;
        bestSchedule = [...m];
      }
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      const curr = arr.slice();
      const next = curr.splice(i, 1);
      permute(curr, m.concat(next));
    }
  }

  permute(indices);
  return { maxLateness: minMaxLateness, schedule: bestSchedule };
}

// ─── 28. BigInt Multiplicative Oracle (Karatsuba) ─────────────────────────────
export function oracleBigIntMultiply(x: number | string | bigint, y: number | string | bigint): bigint {
  return BigInt(x) * BigInt(y);
}

// ─── 29. Majority Element Count Oracle ────────────────────────────────────────
export function bruteForceMajorityElement(arr: number[]): number | null {
  const counts = new Map<number, number>();
  const threshold = Math.floor(arr.length / 2);
  for (const num of arr) {
    const c = (counts.get(num) || 0) + 1;
    counts.set(num, c);
    if (c > threshold) return num;
  }
  return null;
}

// ─── 30. K-th Element Sorting Oracle (Median of Medians) ──────────────────────
export function oracleKthElement(arr: number[], k: number): number {
  return [...arr].sort((a, b) => a - b)[k];
}

// ─── 31. Segmented Least Squares Combinatorial Partition Oracle ───────────────
export function bruteForceSegmentedLeastSquares(
  points: [number, number][],
  costC: number
): number {
  const n = points.length;
  if (n <= 1) return 0;
  const pts = [...points].sort((a, b) => a[0] - b[0]);

  // Precompute single-segment SSE error e(i, j)
  function calcError(i: number, j: number): number {
    const m = j - i + 1;
    if (m <= 2) return 0;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let k = i; k <= j; k++) {
      const [x, y] = pts[k];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }
    const denom = m * sumX2 - sumX * sumX;
    const a = denom === 0 ? 0 : (m * sumXY - sumX * sumY) / denom;
    const b = (sumY - a * sumX) / m;

    let error = 0;
    for (let k = i; k <= j; k++) {
      const [x, y] = pts[k];
      const diff = y - (a * x + b);
      error += diff * diff;
    }
    return error;
  }

  // Recurse over partitions
  function minCost(start: number): number {
    if (start >= n) return 0;
    let best = Infinity;
    for (let end = start; end < n; end++) {
      const err = calcError(start, end);
      const total = err + costC + minCost(end + 1);
      if (total < best) best = total;
    }
    return best;
  }

  return minCost(0);
}

// ─── 32. RNA Secondary Structure Exhaustive Oracle ───────────────────────────
export function bruteForceRnaSecondaryStructure(sequence: string): number {
  const n = sequence.length;

  function canPair(a: string, b: string): boolean {
    return (
      (a === 'A' && b === 'U') ||
      (a === 'U' && b === 'A') ||
      (a === 'C' && b === 'G') ||
      (a === 'G' && b === 'C') ||
      (a === 'G' && b === 'U') ||
      (a === 'U' && b === 'G')
    );
  }

  function opt(i: number, j: number): number {
    if (j - i <= 4) return 0; // Separation distance rule >= 4
    let best = opt(i, j - 1); // j unpaired
    for (let t = i; t < j - 4; t++) {
      if (canPair(sequence[t], sequence[j])) {
        const paired = 1 + (t > i ? opt(i, t - 1) : 0) + opt(t + 1, j - 1);
        if (paired > best) best = paired;
      }
    }
    return best;
  }

  return opt(0, n - 1);
}

// ─── 33. Hamiltonian Cycle Exhaustive Permutation Oracle ─────────────────────
export function bruteForceHamiltonianCycle(
  numVertices: number,
  edges: [number, number][]
): number[] | null {
  const adj = new Set<string>();
  for (const [u, v] of edges) {
    adj.add(`${u},${v}`);
    adj.add(`${v},${u}`);
  }

  const vertices = Array.from({ length: numVertices - 1 }, (_, i) => i + 1);

  function permute(arr: number[], path: number[]): number[] | null {
    if (arr.length === 0) {
      // Check return edge from last vertex to 0
      const last = path[path.length - 1];
      if (adj.has(`${last},0`)) {
        return [...path, 0];
      }
      return null;
    }
    for (let i = 0; i < arr.length; i++) {
      const nextVert = arr[i];
      const prevVert = path[path.length - 1];
      if (adj.has(`${prevVert},${nextVert}`)) {
        const remaining = arr.slice();
        remaining.splice(i, 1);
        const res = permute(remaining, [...path, nextVert]);
        if (res) return res;
      }
    }
    return null;
  }

  return permute(vertices, [0]);
}

// ─── 34. TSP Exhaustive Tour Cost Oracle ──────────────────────────────────────
export function bruteForceTsp(
  matrix: number[][]
): { minCost: number; tour: number[] } {
  const n = matrix.length;
  if (n <= 1) return { minCost: 0, tour: [0] };

  const vertices = Array.from({ length: n - 1 }, (_, i) => i + 1);
  let minCost = Infinity;
  let bestTour: number[] = [];

  function permute(arr: number[], path: number[]) {
    if (arr.length === 0) {
      let cost = 0;
      for (let i = 0; i < path.length; i++) {
        const u = path[i];
        const v = path[(i + 1) % path.length];
        cost += matrix[u][v];
      }
      if (cost < minCost) {
        minCost = cost;
        bestTour = [...path, 0];
      }
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      const remaining = arr.slice();
      const next = remaining.splice(i, 1)[0];
      permute(remaining, [...path, next]);
    }
  }

  permute(vertices, [0]);
  return { minCost, tour: bestTour };
}



