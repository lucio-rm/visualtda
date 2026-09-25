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

### Issue 3.3 — Literal HTML entities and mathematical symbols rendered as broken source code

- **Reported Behavior**: JSX text nodes containing entities such as `&#123;`, `&#125;`, `&gt;`, `&lt;`, and `\text{...}` rendered literally on the screen (e.g. `x_i &#123;0, 1&#125;`).
- **Severity**: Medium (Visual quality defect and user distraction).
- **Status**: **RESOLVED** (`2cb81df`).
- **Root Cause Analysis**:
  - React JSX does not automatically decode numeric HTML entities within raw text children; they are treated as literal string tokens.
- **Resolution**:
  1. Replaced all raw HTML entity strings with JavaScript string literals (`{'x_i ∈ {0, 1}'}`) or proper Unicode mathematical characters (`∈`, `≠`, `≤`, `≥`, `∖`).
  2. Created automated audit script `scripts/audit_quality.mjs` verifying zero raw entity substrings in any `.tsx` or `.ts` file.

---

### Issue 3.4 — Unstyled trace controls and missing timeline stylesheets across views

- **Reported Behavior**: Several visualizer views rendered timeline playback buttons (`.trace-controls`, `.trace-buttons`, `.trace-scrubber`) as unstyled raw elements due to missing CSS classes in their respective component CSS files.
- **Severity**: High (Degraded visual hierarchy and broke N-Queens-level design parity).
- **Status**: **RESOLVED** (`2cb81df`).
- **Root Cause Analysis**:
  - Modular CSS was introduced per visualizer chunk without global aliases for the timeline controller classes in `App.css`.
- **Resolution**:
  1. Consolidated global CSS classes in `src/app/App.css` covering `.trace-controls`, `.trace-buttons`, `.trace-scrubber`, `.trace-speed`, `.btn-speed`, `.step-counter`, `.step-narrative-banner`, and `.trace-step-description`.
  2. Verified consistent layout across all 37 visualizers with `scripts/browserQA.mjs`.

---

### Issue 3.5 — Premature answer leaks in stubs and playgrounds (Mission V4 §18, §26)

- **Reported Behavior**: In starter code comments and test error messages for Dynamic Programming and Divide & Conquer exercises, the explicit recurrence formulas were given away before the student reasoned about the subproblems. Similarly, the Juan el Vago playground printed the exact recommended days array.
- **Severity**: High (Pedagogical leak; invalidated the Solve phase).
- **Status**: **RESOLVED** (`163d60b`, `bb1463b`).
- **Root Cause Analysis**:
  - Test `expected` fields contained explanatory strings with recurrence equations rather than functional output values.
  - Discover playground in Juan el Vago rendered `optimal.dias` unconditionally.
- **Resolution**:
  1. Replaced recurrence formulas in test suites with functional criteria (e.g., maximum profit or subarray sum bounds).
  2. Hid the exact optimal day combination in `JuanElVagoPlayground.tsx`, replacing it with a note explaining the student must deduce the non-adjacency rule in Solve.

---

### Issue 3.6 — Phase switcher tag 20px circle overflow & mobile header control clipping

- **Reported Behavior**:
  - The `DISPONIBLE` tag in the phase navigation bar was placed inside a 20x20px circle with `border-radius: 9999px`, causing the 10-letter word to overflow the circle horizontally.
  - On 390px mobile screens, the header controls (brand + instructor button + language select + theme select) overflowed the right edge by ~80px.
- **Severity**: High (Visual QA defect on both desktop and mobile viewports).
- **Status**: **RESOLVED** (`bb1463b`, current).
- **Root Cause Analysis**:
  - `.phase-unlocked-tag` had `width: 20px; height: 20px` in `App.css`.
  - `.app-header` lacked mobile responsive rules (`@media (max-width: 640px)`) to collapse long labels into icons or compact tokens.
- **Resolution**:
  1. Re-styled `.phase-unlocked-tag` and `.phase-locked-tag` as clean, proportional badges (`padding: 0.15rem 0.5rem; font-size: 0.6875rem`).
  2. Added responsive mobile header rules hiding subtitle/breadcrumbs, condensing instructor button to an icon, and shortening language options to ISO codes (`ES` / `EN`).
  3. Added `flex-wrap: wrap` to `.category-list` to eradicate the horizontal scrollbar on desktop.

---

### Issue 3.7 — Catalog tracks ordering starting with Backtracking rather than fundamental algorithmic paradigms

- **Reported Behavior**: The home catalog presented Backtracking as the very first track, placing NP-hard and exponential search concepts ahead of Divide & Conquer, Greedy, and Dynamic Programming.
- **Severity**: High (Pedagogical dissonance; distorted curriculum progression for university students).
- **Status**: **RESOLVED** (current).
- **Root Cause Analysis**:
  - `PARADIGM_TRACKS` in `ExerciseList.tsx` and `CATEGORIES` in `registry.ts` ordered categories alphabetically or by initial implementation order instead of following the canonical Kleinberg & Tardos curriculum progression.
- **Resolution**:
  1. Realigned `PARADIGM_TRACKS` to follow the university sequence: Track 1: Divide & Conquer (K&T Ch. 5) -> Track 2: Algoritmos Greedy (K&T Ch. 4) -> Track 3: Programación Dinámica (K&T Ch. 6) -> Track 4: Backtracking y Ramificación (K&T Ch. 8) -> Track 5: Flujo en Redes y Programación Lineal (K&T Ch. 7 & 11) -> Track 6: Reducciones, Aproximación y Aleatorizados (K&T Ch. 8, 11 & 13).
  2. Changed default recommended introductory exercise from N-Queens to Interval Scheduling (Greedy, K&T Ch. 4) with explicit exchange argument guidance.
  3. Verified automated test suites in `tests/registry.test.ts` and `tests/userJourneys.test.tsx`.

---

### Issue 3.8 — Knapsack problem represented merely as an abstract matrix without an authentic visual backpack

- **Reported Behavior**: Both Knapsack 0/1 (DP) and Fractional Knapsack (Greedy) only showed data tables and progress bars. The student could not visually recognize a physical cargo container, weight-proportional items, slack capacity, or overflow conditions.
- **Severity**: High (Pedagogical failure: mental model of capacity packing was not visually represented).
- **Status**: **RESOLVED** (current).
- **Root Cause Analysis**:
  - Visualizers rendered the numeric table directly without a physical metaphor component.
- **Resolution**:
  1. Built `KnapsackVisualBag.tsx` and `KnapsackVisualBag.css` modeling an authentic backpack container with top handle, capacity boundary badge, weight-proportional item blocks (name, weight, value, density), visual slack capacity block ("Holgura disponible: X kg"), and an overflow warning banner when infeasible.
  2. Integrated `KnapsackVisualBag` into `KnapsackPlayground.tsx` (Discover phase), `KnapsackDpVisualizer.tsx` (Understand phase), and `KnapsackGreedyVisualizer.tsx` (supporting fractional percentage allocation).
  3. Added interactive click-to-unpack behavior in the Discover playground and live synchronization with DP reconstruction and Greedy density ordering.

---

### Issue 3.9 — Above-the-fold vertical space compression on standard laptop/desktop viewports (1366x768 & 1440x900)

- **Reported Behavior**: On standard 1366x768 and 1440x900 screens, oversized vertical paddings, 130px header cards, and excessive card margins pushed the primary visualizer canvas below the fold, forcing students to scroll down on every step.
- **Severity**: Medium (UX friction and split attention between controls and canvas).
- **Status**: **RESOLVED** (current).
- **Root Cause Analysis**:
  - Global `--max-width` was restricted to `1200px` causing vertical stretching, `.phase-view` padding was `2rem`, and `.discover-header-card` was `1.5rem` with a fixed `120px` illustration wrapper.
- **Resolution**:
  1. Expanded `--max-width` in `variables.css` to `1440px`.
  2. Compacted `.phase-view` padding to `1.25rem 1.5rem` and `.discover-header-card` to `0.75rem 1.25rem`.
  3. Reduced illustration wrapper height to `80px` and compacted phase navigation button padding to `0.55rem 0.85rem`.
  4. Verified across 5 viewports (1920x1080, 1440x900, 1280x720, 768x1024, 390x844) via Chromium headless capture in `scripts/browserQA.mjs`.

---

## 2. Complete Visual & Pedagogical Matrix (All 37 Exercises)

| # | Exercise ID | Paradigm | Visualizer & Playground | Verified Status |
|---|-------------|----------|-------------------------|-----------------|
| 1 | `merge-sort` | Divide & Conquer | Split tree, merge buffer, sorted bars | VERIFIED |
| 2 | `max-subarray-dyc` | Divide & Conquer | Prefix/suffix/crossing bars, Kadane compare | VERIFIED |
| 3 | `peak-finding-dyc` | Divide & Conquer | 1D elevation array + binary midpoint slope | VERIFIED |
| 4 | `inversion-counting-dyc` | Divide & Conquer | Disordered pair counter + split merge | VERIFIED |
| 5 | `closest-pair-dyc` | Divide & Conquer | 2D Cartesian plane + delta strip scan | VERIFIED |
| 6 | `karatsuba-dyc` | Divide & Conquer | Multi-digit split tree + Gauss 3-product trace | VERIFIED |
| 7 | `median-of-medians-dyc` | Divide & Conquer | 5-element column grid + pivot partitioning | VERIFIED |
| 8 | `majority-element-dyc` | Divide & Conquer | Boyer-Moore cancellation scale + candidate count | VERIFIED |
| 9 | `interval-scheduling` | Greedy | Timeline interval segments + conflict filter | VERIFIED |
| 10 | `knapsack-greedy` | Greedy | Value-weight density sorting + capacity bar | VERIFIED |
| 11 | `road-antennas-greedy` | Greedy | Kilometer road line + 4km coverage discs | VERIFIED |
| 12 | `huffman-coding-greedy` | Greedy | Min-Heap cards + SVG binary prefix tree | VERIFIED |
| 13 | `interval-partitioning-greedy` | Greedy | Classroom schedule lanes + room allocator | VERIFIED |
| 14 | `minimize-lateness-greedy` | Greedy | Timeline timeline + deadline penalty gauge | VERIFIED |
| 15 | `dijkstra-greedy` | Greedy | Weighted graph + priority queue + distance badges | VERIFIED |
| 16 | `kruskal-mst-greedy` | Greedy | Sorted edge queue + Union-Find cycle detector | VERIFIED |
| 17 | `knapsack-dp` | Dynamic Programming | 2D $(i, w)$ matrix + cell dependency highlights | VERIFIED |
| 18 | `juan-el-vago` | Dynamic Programming | Day cards + skip-day recurrence highlights | VERIFIED |
| 19 | `coin-change-dp` | Dynamic Programming | 1D amount vector + coin denomination choices | VERIFIED |
| 20 | `lcs-dp` | Dynamic Programming | 2D character matching table + backtrack arrows | VERIFIED |
| 21 | `weighted-interval-scheduling` | Dynamic Programming | Interval timeline + $p(j)$ binary search links | VERIFIED |
| 22 | `segmented-least-squares-dp` | Dynamic Programming | Scatter plot + piecewise linear segments | VERIFIED |
| 23 | `rna-secondary-structure-dp` | Dynamic Programming | Sequence arc diagram + Watson-Crick bounds | VERIFIED |
| 24 | `bellman-ford-dp` | Dynamic Programming | Directed graph + negative cycle detector | VERIFIED |
| 25 | `n-queens` | Backtracking | Interactive $N \times N$ chessboard + attack conflict rays | VERIFIED |
| 26 | `subset-sum-backtracking` | Backtracking | Binary decision tree + prefix sum pruner | VERIFIED |
| 27 | `graph-coloring-backtracking` | Backtracking | Chromatic palette + adjacent vertex conflicts | VERIFIED |
| 28 | `sudoku-backtracking` | Backtracking | $9 \times 9$ grid + row/col/box constraint validator | VERIFIED |
| 29 | `hamiltonian-cycle-backtracking` | Backtracking | Vertex traversal path + degree bound pruner | VERIFIED |
| 30 | `tsp-branch-and-bound` | Backtracking / B&B | Search tree + MST/Hungarian lower bound gauge | VERIFIED |
| 31 | `knapsack-branch-and-bound` | Backtracking / B&B | Best-first tree + fractional upper bound pruner | VERIFIED |
| 32 | `knights-tour-backtracking` | Backtracking | Warnsdorff accessibility degree heatmap | VERIFIED |
| 33 | `max-flow` | Advanced Algorithms | Flow network + augmenting paths + min-cut | VERIFIED |
| 34 | `linear-programming-formulation` | Advanced Algorithms | 2D polytope feasible region + objective gradient | VERIFIED |
| 35 | `vertex-cover-reduction` | Reductions & NP | Graph reduction: Independent Set to Vertex Cover | VERIFIED |
| 36 | `vertex-cover-approx` | Approximations | Maximal matching edge selector + 2-approx bound | VERIFIED |
| 37 | `randomized-fair-coin` | Randomized Algorithms | Von Neumann biased coin trials + Bernoulli histogram | VERIFIED |

---

## 3. Maintenance Guidelines

- When any new defect is found in manual exploration or reported by users, create a new entry with reproduction steps, root cause, and fix commit.
- Every defect fix MUST be accompanied by an automated regression test.
