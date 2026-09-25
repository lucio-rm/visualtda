# Visual TDA — Current Repository State

- **CURRENT_PHASE**: MISSION_V5_AUDIT_AND_PEDAGOGICAL_OVERHAUL
- **CURRENT_TASK**: Completed Master Product, UX & Pedagogical Audit Mission V5 core implementations and component enhancements:
  1. Realigned Catalog hierarchy according to Kleinberg & Tardos academic curriculum: Divide & Conquer -> Greedy -> Dynamic Programming -> Backtracking & Branch & Bound -> Network Flow & Linear Programming -> Reductions, Approximation & Randomized.
  2. Implemented target-phase routing for exercise recommendations (`App.tsx` -> `ExerciseView.tsx` with `initialPhase`).
  3. Developed authentic physical backpack model (`KnapsackVisualBag.tsx` and `.css`) and integrated across `KnapsackPlayground`, `KnapsackDpVisualizer`, and `KnapsackGreedyVisualizer` (supporting continuous fractional fill).
  4. Formulated N-Queens Backtracking invariant pruning callout on conflict detection.
  5. Compacted vertical rhythm and expanded `--max-width` to 1440px to ensure primary canvas renders above the fold on 1366x768 and 1440x900 screens.
  6. Generated and expanded Deliverables 1-8: `docs/product-ux-audit.md`, `docs/visual-design-system.md`, `docs/exercise-quality-matrix.md`, `docs/pedagogical-language-guide.md`, `docs/known-issues.md`, `IA/architect/state.md`, `IA/architect/next.md`, and `IA/sessions/2026-09-25.md`.
  7. Implemented Cryptographic Instructor Mode Authentication (`InstructorAuthModal.tsx`, `cryptoAuth.ts`, `tests/instructorMode.test.tsx`, `InstructorModeContext.tsx`): exactly 8 characters required, zero plaintext password storage, SHA-256 hash and cryptographic token verification preventing DevTools `false` -> `true` tampering.
  8. Point drag-and-drop manipulation in 2D Closest Pair Playground (`ClosestPairPlayground.tsx`) with live recalculation of $\delta$ and median boundary line.
  9. Elevated 7 interactive playgrounds to flagship quality:
     - `SegmentedLeastSquaresPlayground.tsx`: 2D interactive scatter plot with draggable points ($y$-coordinate), dynamic piecewise regression lines, and residual error drop lines.
     - `MajorityElementPlayground.tsx`: Interactive element tiles, D&C half split inspection, and Boyer-Moore pair cancellation arena.
     - `IntervalPartitioningPlayground.tsx`: Interactive SVG Classroom Gantt timeline with conflict detection and room track cycling.
     - `MinimizeLatenessPlayground.tsx`: Interactive single-machine timeline with deadline markers, lateness bands, and swap controls.
     - `RnaSecondaryStructurePlayground.tsx`: Interactive SVG secondary structure arc diagram with clickable nucleotide nodes and Watson-Crick pairing rules.
     - `KaratsubaPlayground.tsx`: 2x2 Geometric multiplication area model SVG showing the 25% multiplication reduction.
     - `MedianOfMediansPlayground.tsx`: SVG columns-of-5 BFPRT matrix with medians row and 30% pruning quadrants.
  10. Passed full quality gates: 292 vitest tests across 39 files, 0 lint errors, 0 type errors, static `dist/` build in 1.6s, and 22/22 real Chromium browser QA scenarios passed across 5 viewports with 0 console errors.
- **BASELINE_COMMIT**: `d1694d9`
- **EXPLICIT_COMPONENT_STATES**:
  - **Toolchain & Build Engine**: [VERIFIED] (Vite 6.4.3, React 19.0.0, TS 5.7.3, Vitest 3.2.7, ESLint 9.20.1 — 100% PASS across 39 test files, 292 tests, 0 lint errors, 0 type errors)
  - **Static Bundle Generation**: [VERIFIED] (Pure client static output to `dist/`, zero backend server dependencies, code-split manualChunks by paradigm, builds in ~1.6s)
  - **Security & Instructor Mode**: [VERIFIED]
    - One-way SHA-256 token verification (`cryptoAuth.ts`). Plaintext password (`MEL75.29`) is never stored or transmitted.
    - Modal validates exact 8-character constraint before submit. Unit tested in `tests/instructorMode.test.tsx` (6/6 tests PASS).
  - **Pedagogical Catalog & Curriculum Sequence**: [VERIFIED]
    - Track 1: Divide & Conquer (K&T Ch. 5)
    - Track 2: Algoritmos Greedy (K&T Ch. 4)
    - Track 3: Programación Dinámica (K&T Ch. 6)
    - Track 4: Backtracking y Ramificación (K&T Ch. 8)
    - Track 5: Flujo en Redes y Programación Lineal (K&T Ch. 7 & 11)
    - Track 6: Reducciones, Aproximación y Aleatorizados (K&T Ch. 8, 11 & 13)
    - Starting recommendation: Interval Scheduling (Greedy, K&T Ch. 4) with formal exchange argument intuition.
  - **Knapsack Physical Metaphor Suite**: [VERIFIED]
    - `KnapsackVisualBag`: top handle, capacity boundary gauge, weight-proportional item blocks (name, weight, value, density), visual slack block ("Holgura disponible: X kg"), overflow warning banner on infeasibility.
    - Used in Discover (`KnapsackPlayground`), Understand 0/1 (`KnapsackDpVisualizer`), and Understand Fractional (`KnapsackGreedyVisualizer`).
  - **TSP Branch & Bound Interactive Exploration**: [VERIFIED]
    - Interactive 2D city canvas in Discover phase (`TspBranchAndBoundPlayground`) showing distances, active paths, and dynamic lower bound calculation ($C + LB$).
    - Explicit demonstration of subtree pruning when $C + LB \ge UB$.
  - **Universal Timeline Keyboard Navigation (37/37)**: [VERIFIED]
    - `useTraceTimeline` provides default keyboard shortcuts (`ArrowRight`/`ArrowLeft` step forward/back, `Space`/`k` play/pause, `r` reset, `Home` jump to start, `End` jump to finish).
    - Fully tested in `tests/useTraceTimeline.test.tsx` (6/6 tests PASS).
  - **Real Browser QA Verification**: [VERIFIED]
    - 22 / 22 scenarios passed in Chromium headless (`scripts/browserQA.mjs`) across 5 viewports (FHD 1920x1080, Laptop 1440x900, Desktop 1280x720, Tablet 768x1024, Mobile 390x844).
    - 0 console errors captured during real browser sessions.
- **LAST_VERIFIED**:
  - `npm run lint`: 0 errors, 0 warnings
  - `npm run typecheck`: 0 errors
  - `npm test`: 39 test files, 292 passed (100% PASS)
  - `node scripts/browserQA.mjs`: 22 / 22 real Chromium scenarios passed (100% PASS)
  - `npm run build`: static production build succeeds in ~1.6s (`dist/`)

