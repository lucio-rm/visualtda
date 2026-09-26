# Visual TDA — Current Repository State

- **CURRENT_PHASE**: MISSION_V5_AUDIT_AND_PEDAGOGICAL_OVERHAUL
- **CURRENT_TASK**: Completed Master Product, UX & Pedagogical Audit Mission V5 core implementations, security anti-tamper gating, and interactive playground overhauls:
  1. Realigned Catalog hierarchy according to Kleinberg & Tardos academic curriculum: Divide & Conquer -> Greedy -> Dynamic Programming -> Backtracking & Branch & Bound -> Network Flow & Linear Programming -> Reductions, Approximation & Randomized.
  2. Implemented target-phase routing for exercise recommendations (`App.tsx` -> `ExerciseView.tsx` with `initialPhase`).
  3. Developed authentic physical backpack model (`KnapsackVisualBag.tsx` and `.css`) and integrated across `KnapsackPlayground`, `KnapsackDpVisualizer`, and `KnapsackGreedyVisualizer`.
  4. Formulated N-Queens Backtracking invariant pruning callout on conflict detection.
  5. Compacted vertical rhythm and expanded `--max-width` to 1440px to ensure primary canvas renders above the fold on 1366x768 and 1440x900 screens.
  6. Generated and expanded Deliverables 1-8: `docs/product-ux-audit.md`, `docs/visual-design-system.md`, `docs/exercise-quality-matrix.md`, `docs/pedagogical-language-guide.md`, `docs/known-issues.md`, `IA/architect/state.md`, `IA/architect/next.md`, and `IA/sessions/2026-09-25.md`.
  7. Implemented Cryptographic Anti-Tamper Instructor Mode Authentication (`InstructorAuthModal.tsx`, `cryptoAuth.ts`, `tests/instructorMode.test.tsx`, `InstructorModeContext.tsx`, `UnderstandView.tsx`):
     - Requires exactly 8-character course password (`MEL75.29`, Martin Ezequiel Lucio / Cátedra 75.29).
     - Plaintext credential is never stored; verified strictly via irreversible SHA-256 digest (`be0bfc6c64e56150fbd8497e599dc5c799f949c60b12e0231240bdd83acac738`).
     - Session entropy salt (`SESSION_SECRET_SALT`) signs valid instructor sessions.
     - Central authority `isExerciseSolutionAuthorized()` blocks DevTools tampering (`isInstructorMode: false` -> `true` or `solutionUnlocked: false` -> `true`), rendering `.solution-tamper-card` ("Firma Criptográfica Inválida: Acceso Bloqueado contra Manipulación") and completely withholding canonical Python source code from the DOM.
  8. Overhauled all 22 interactive playgrounds with genuine tactile interaction (2D pointer dragging, physical manipulation, dynamic recalculation, and multi-instance presets):
     - `HamiltonianCyclePlayground`: 2D draggable vertices, multiple graph presets ($K_5$, Petersen, $K_{3,4}$), live backtrack decision stack with dead-end detection.
     - `TspBranchAndBoundPlayground`: 2D draggable cities, dynamic Euclidean distance matrix recalculation, live Branch & Bound lower bound and optimal incumbent solver.
     - `IntervalPartitioningPlayground`: 2D draggable lecture blocks across classrooms and timeline, bottleneck sweep line at $t^*$, multi-instance presets.
     - `MinimizeLatenessPlayground`: Horizontal draggable job blocks, adjacent inversion indicator, exchange argument step assistant, live lateness bars.
     - `ReductionIsVcPlayground`: 2D draggable vertices, dual $S$ and $C$ theorem verification, multiple graph presets ($C_5$, $K_{3,3}$, Triangle+Tail).
     - `CoinChangePlayground`: Drag-and-drop coins into cash register tray, visual coin tokens, and side-by-side comparison board (Manual vs Greedy vs DP).
     - `GraphColoringPlayground`: 2D draggable vertices, color brush swatch picker, multiple graph presets ($C_5$, $K_4$, $K_{3,3}$).
     - `MaxFlowPlayground`: 2D draggable nodes, Edmonds-Karp BFS augmenting path finder, full Ford-Fulkerson auto solver, and Min-Cut partition visualization.
     - `KnapsackBranchAndBoundPlayground`: Interactive SVG search tree with node inspector, capacity cutoff and bound pruning.
     - `BellmanFordPlayground`: 2D draggable vertices, dynamic programming matrix $M[i, v]$ and negative cycle detection.
     - `KruskalPlayground`: Disjoint-Set Union-Find component colors, sorted edges queue, and cycle detection.
     - `RoadAntennasPlayground`: 1D pointer dragging for antennas and houses directly along highway.
     - `VertexCoverApproxPlayground`: 2D draggable vertices, greedy maximal matching step assistant, animated coverage progress bar.
     - `DijkstraPlayground`: Interactive Min-Heap priority queue $Q$ panel, settled set $S$, and 2D draggable vertices.
     - `ClosestPairPlayground`: 2D point creation and dragging with dynamic $\delta$ strip and median line.
     - `KnightsTourPlayground`: Warnsdorff degree badges, best move highlighting with gold star, custom starting cell selection, correct dynamic copy, and step-through heuristics.
     - `SudokuPlayground`: Minimum Remaining Values (MRV) candidate highlighting, constraint crosshairs (row, col, 3x3 block), digit frequency matching, and step MRV button.
     - `PeakFindingPlayground`: Vertical bar dragging to mold custom elevation relief, interactive D&C binary search step simulation with active interval $[L, R]$ highlighting and midpoint indicator.
     - `RandomizedFairCoinPlayground`: Physical metallic coin toss animation stage, pair outcome extraction, live toss status, and Monte Carlo convergence comparison against 50% line.
     - `SubsetSumPlayground`: Drag-and-drop bucket and pool zones, dynamic gauge fill bar, and excess pruning feedback.
     - `LinearProgrammingPlayground`: Full 2D Cartesian SVG plane, shaded feasible polytope, constraint lines, objective normal vector, and level set sweep line.
     - `LcsPlayground`: Interactive SVG alignment ribbons, non-crossing matching invariant, crossing detection, and auto-align DP button.
     - `WeightedIntervalPlayground`: Predecessor function $p(j)$ calculation, hover highlight, and dynamic programming recurrence callout.
  9. Passed full quality gates: 293 vitest tests across 39 files, 0 lint errors, 0 typecheck errors, 22/22 real Chromium browser QA scenarios passed across 5 viewports, and static `dist/` build in ~1.6s.
  10. Conducted University-Grade Pedagogical & Visual Overhaul (Prompt V4 & V5 Full Compliance):
      - **Cheat / Auto-Solve Removal**: Eradicated all spoiler auto-step / auto-fill buttons across 10 Playgrounds (`CoinChangePlayground`, `KruskalPlayground`, `VertexCoverApproxPlayground`, `HamiltonianCyclePlayground`, `TspBranchAndBoundPlayground`, `WeightedIntervalPlayground`, `HuffmanPlayground`, `SudokuPlayground`, `KnightsTourPlayground`, `MinimizeLatenessPlayground`), requiring students to actively construct, experiment, and discover algorithmic properties.
      - **Design Tokens Restoration**: Restored missing CSS custom properties in `variables.css` (`--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--transition-fast`, `--transition-normal`, `--transition-slow`, `--radius-full`, `--border-hover`, `--border-muted`, `--primary`, `--primary-bg`, `--color-primary-rgb`).
      - **Light Mode High-Contrast Calibration**: Saturated borders and added clear 4px solid top indicator bars to completed cards; added explicit strokes to SVG chessboard cells and interval scheduling bars.
      - **Canvas & Board Sizing**: Enforced prominent university-grade board sizes (Sudoku 560px with 48x48px digit buttons and full keyboard editing, N-Queens 580px, Knight's Tour 580px, Knapsack 580px, LP 580px, Graph Coloring 600px).
      - **Phase 3 Layout & Typography**: Balanced asymmetric two-column layout in Understand phase; scrubbed residual Spanish text and fixed track spacing.
   11. Conducted Full Mission V6 UX, Pedagogical & Contrast Polish:
       - **Canonical CS Terminology**: Preserved untranslated canonical terminology ("Greedy", "Merge", "Backtracking", etc.) across traces, content, and playgrounds to prevent student friction.
       - **English Mode Academic Localization**: Full English translation of "Theoretical Foundation" academic paper sections and Time/Space complexity explanations via `TheoryMarkdown.tsx` and `UnderstandView.tsx`.
       - **Author Reference Hygiene**: Scrubbed over-referencing across all 24 visualizers, theory insights, and algorithm traces. Preserved formal syllabus references strictly in track headers.
       - **Navigation & Phase Reset**: Instant scroll-to-top (`window.scrollTo({ top: 0, behavior: 'instant' })`) and phase 1 (`discover`) reset whenever switching exercises or phases.
       - **Active Verification Flow**: Removed premature celebratory spoilers and added explicit verification buttons (`[Verificar Respuesta]`, `[Verificar Tablero]`, `[✓ Verificar Mochila]`, `[Verificar Coloreo]`, `[✓ Verificar AGM]`) with RTA input and constructive feedback across playgrounds.
       - **Phase 3 Control Standard**: Standardized compact playback and timeline buttons (`.ctrl-btn`, `.btn-control`, `.btn-play`, `.btn-sm`) in `App.css`, eradicating oversized full-width buttons.
       - **Karatsuba Visualizer Overhaul**: Redesigned SVG structure (`660x260`), standard algebraic notation $P=(x_1+x_0)(y_1+y_0)$ and $z_1=P-z_2-z_0$, complete recombination formula, zero number overlapping.
       - **Graph Visualizer & Playground Enhancements**: Curved opposing directed edges in Dijkstra ($A \leftrightarrow B$) to prevent overlapping badges and lines; multi-click color cycling ($1 \dots k \to \text{uncolored}$), user-selectable vertex count ($|V| \in [3, 8]$), and threshold-based 2D dragging in Graph Coloring; 2D node dragging in Kruskal; crisp high-contrast node strokes and badges.
       - **Light & Dark Mode Contrast Calibration**: Added explicit `[data-theme='light']` custom properties, `--shadow-card` tokens, and 1.5px/2px solid borders for clean, clearly delineated section separation cards.
   12. Passed full quality gates: 293 vitest tests across 39 files, 0 lint errors, 0 typecheck errors, and static `dist/` build in ~1.56s.
- **BASELINE_COMMIT**: `897fc6c`
- **EXPLICIT_COMPONENT_STATES**:
  - **Toolchain & Build Engine**: [VERIFIED] (Vite 6.4.3, React 19.0.0, TS 5.7.3, Vitest 3.2.7, ESLint 9.20.1 — 100% PASS across 39 test files, 293 tests, 0 lint errors, 0 type errors)
  - **Static Bundle Generation**: [VERIFIED] (Pure client static output to `dist/`, zero backend server dependencies, code-split manualChunks by paradigm, builds in ~1.56s)
  - **Security & Instructor Mode**: [VERIFIED]
    - One-way SHA-256 token verification (`cryptoAuth.ts`). Plaintext password (`MEL75.29`) is never stored or transmitted.
    - Central anti-tamper gate `isExerciseSolutionAuthorized()` protects against DevTools inspection manipulation.
    - Tested in `tests/instructorMode.test.tsx` (7/7 tests PASS).
  - **Pedagogical Catalog & Curriculum Sequence**: [VERIFIED]
    - Track 1: Divide & Conquer (K&T Ch. 5)
    - Track 2: Algoritmos Greedy (K&T Ch. 4)
    - Track 3: Programación Dinámica (K&T Ch. 6)
    - Track 4: Backtracking y Ramificación (K&T Ch. 8)
    - Track 5: Flujo en Redes y Programación Lineal (K&T Ch. 7 & 11)
    - Track 6: Reducciones, Aproximación y Aleatorizados (K&T Ch. 8, 11 & 13)
    - Starting recommendation: Interval Scheduling (Greedy, K&T Ch. 4).
  - **Knapsack Physical Metaphor Suite**: [VERIFIED]
    - `KnapsackVisualBag`: top handle, capacity boundary gauge, weight-proportional item blocks (name, weight, value, density), visual slack block ("Holgura disponible: X kg"), overflow warning banner on infeasibility.
  - **Universal Timeline Keyboard Navigation (37/37)**: [VERIFIED]
    - `useTraceTimeline` provides default keyboard shortcuts (`ArrowRight`/`ArrowLeft` step forward/back, `Space`/`k` play/pause, `r` reset, `Home` jump to start, `End` jump to finish).
- **LAST_VERIFIED**:
  - `npm run lint`: 0 errors, 0 warnings
  - `npm run typecheck`: 0 errors
  - `npm test`: 39 test files, 293 passed (100% PASS)
  - `npm run build`: static production build succeeds in ~1.56s (`dist/`)
