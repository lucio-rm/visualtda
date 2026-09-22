# Visual TDA — Known Issues & Resolution Log

This document tracks ground-truth defect reports, architectural audits, and visual inspection findings across all Visual TDA exercises, visualizers, and playgrounds.

---

## 1. Resolved Defects (Ground-Truth User Reports)

### Issue 3.1 — N-Queens: False attack conflict error on non-attacking partial queen placement

- **Reported Behavior**: In the Discover phase playground for N-Queens, placing two queens in non-attacking cells (for example, a knight's move / L-shape like `(0, 1)` and `(1, 3)`) immediately showed a red warning banner: `"⚠️ Conflicto detectado: Posición inválida en la fila 2: columna -1 fuera de rango [0, 3]"`.
- **Severity**: High (Blocks learner intuition and exploration during the Discover phase).
- **Status**: **RESOLVED** (`3b0042c`).
- **Root Cause Analysis**:
  - `NQueensPlayground.tsx` initialized `board` as an array filled with `-1` representing empty rows.
  - On every user click, `nQueensValidator.validate({ n }, board)` was invoked.
  - `validate()` was designed for final student solutions in the Solve phase (`board.length === n`, all queens placed). It checked `if (c < 0 || c >= n)` for each row. Empty rows (`c = -1`) generated out-of-bounds errors.
  - The UI check `validationResult.errors.length > 0 && placedQueensCount > 1` erroneously treated the unplaced row error as an attack conflict when $\ge 2$ queens were placed.
- **Resolution**:
  1. Implemented `validatePartial({ n }, board): NQueensPartialValidationResult` in `src/engine/algorithms/nQueensValidator.ts`.
  2. Filters out unplaced rows (`c === -1`) and validates pairwise non-attack solely between placed queens.
  3. Added `areQueensAttacking(r1, c1, r2, c2)` reference function.
  4. Updated `NQueensPlayground.tsx` to use `validatePartial`. When a genuine conflict occurs, both attacking queens are visually highlighted in red and connected with a red conflict ray line on `NQueensBoard`.
  5. Added exhaustive pairwise regression tests in `tests/nQueensValidator.test.ts` testing every pair of distinct cells for $N \in [4, 5, 6, 7, 8]$ against the attack condition `r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2)`.

---

### Issue 3.2 — Huffman Coding: Visualizer renders no tree at all

- **Reported Behavior**: In the Understand phase visualizer for Huffman Coding, only the Min-Heap priority queue cards and the final codebook table were rendered. No prefix tree was displayed despite Huffman coding being fundamentally a tree construction algorithm.
- **Severity**: High (Pedagogical failure: students could not visualize tree structure, branching bits, or merging steps).
- **Status**: **RESOLVED** (`bd0605d`).
- **Root Cause Analysis**:
  - `src/components/visualizers/HuffmanVisualizer.tsx` lacked any SVG tree rendering code.
  - `src/engine/algorithms/huffmanTrace.ts` only kept the flattened queue in `HuffmanStepData`, without exposing the full parent/child hierarchy across historical merges to the visualizer.
- **Resolution**:
  1. Updated `HuffmanStepData` to include `allNodes: Record<string, HuffmanTraceItem>` and `forestRoots: string[]`.
  2. Populated `allNodes` and `forestRoots` on all steps (`INIT`, `SELECT_TWO_MIN`, `MERGE_NODES`, `GENERATE_CODES`, `COMPLETE`).
  3. Created `src/components/visualizers/HuffmanTreeSvg.tsx` with dynamic forest layout supporting both multi-tree forests during intermediate construction and the final unified prefix tree.
  4. Rendered branch edges with bit labels (`'0'` for left child, `'1'` for right child), internal nodes with sum frequencies, leaf cards with characters and codeword badges, and selection glow filters.
  5. Added automated regression tests in `tests/huffman.test.ts` verifying tree structure integrity and full character leaf reachability.

---

## 2. Visual & Architectural Audit of All 21 Visualizers

| # | Exercise ID | View / Playground | Verified Status | Notes |
|---|-------------|-------------------|-----------------|-------|
| 1 | `n_queens` | Board + Growth Panel | Verified | Partial validation active; conflict ray functional; complexity growth panel active. |
| 2 | `road_antennas` | SVG Highway Playground | Verified | Houses, antenna ranges, greedy selection, keyboard navigable. |
| 3 | `interval_scheduling` | SVG Timeline Intervals | Verified | Non-overlapping interval selection, compatible/incompatible badges. |
| 4 | `weighted_interval_scheduling` | Dynamic Programming Schedule | Verified | Weighted intervals, memoization table, backtracking arrows. |
| 5 | `knapsack_01_greedy` | Greedy Density Visualizer | Verified | Value-to-weight ratio ordering, capacity meter. |
| 6 | `knapsack_01_dp` | DP Table Visualizer | Verified | 2D $(i, w)$ matrix, cell lookup highlights. |
| 7 | `merge_sort` | Recursion Tree + Array | Verified | Split, recurse, merge buffers. |
| 8 | `inversion_counting` | Divide & Conquer Inversions | Verified | Inversion pair counter, merge step split. |
| 9 | `closest_pair` | 2D Geometry Plane | Verified | Point plane, divide line, boundary strip. |
| 10 | `quicksort` | Pivot Partition Array | Verified | Pivot element, left/right pointers, swap trace. |
| 11 | `peak_finding` | 1D / 2D Array Grid | Verified | Binary search midpoint, slope indicators. |
| 12 | `huffman_coding_greedy` | Min-Heap + Prefix Tree | Verified | SVG binary tree forest + heap cards + codebook. |
| 13 | `graph_coloring` | Graph Backtracking Visualizer | Verified | Graph nodes, chromatic color palette, conflict checks. |
| 14 | `subset_sum` | DP Matrix | Verified | Boolean reachable sum table. |
| 15 | `longest_common_subsequence` | 2D DP Grid | Verified | Matching character arrows, reconstructed string. |
| 16 | `coin_change` | DP Table + Trace | Verified | Minimum coin counts, chosen denominations. |
| 17 | `juan_el_vago` | 1D DP Visualizer | Verified | Activity choice recurrence without consecutive days. |
| 18 | `max_subarray` | Kadane + Divide & Conquer | Verified | Cumulative sum bars, current max range indicator. |
| 19 | `ford_fulkerson` | Flow Network Graph | Verified | Source/sink capacities, augmenting paths, residual graph. |
| 20 | `vertex_cover_approx` | Graph Approximation | Verified | Maximal matching edge picks, vertex highlight. |
| 21 | `reduction_is_vc` | Reduction Visualizer | Verified | Independent set to vertex cover dual complement transform. |

---

## 3. Maintenance Guidelines

- When any new defect is found in manual exploration or reported by users, create a new entry with reproduction steps, root cause, and fix commit.
- Every defect fix MUST be accompanied by an automated regression test.
