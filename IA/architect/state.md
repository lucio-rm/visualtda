# Visual TDA — Current Repository State

- **CURRENT_PHASE**: MISSION_V8_COLOR_PALETTE_GATING_AND_BILINGUAL_PERFECTION_COMPLETED
- **CURRENT_TASK**: Completed Universal Platform-Wide Systematic Visual Audit, Light/Dark Palette Overhaul, and Pedagogical Gating:
  1. **Light & Dark Mode Color Palette Overhaul**:
     - Light theme redesigned with a warm salmon-stone canvas (`--bg: #f8f2ec;`, `--surface: #ffffff;`, `--surface-hover: #f3eae1;`, `--border: #ded2c6;`, `--border-strong: #594c42;`, `--text: #1c140e;`, `--text-muted: #574a40;`).
     - Deep espresso text on salmon-stone canvas achieves 18.17:1 contrast ratio (exceeding WCAG AAA 7.0:1 requirement).
     - Dark theme calibrated (`--bg: #0c121e;`, `--canvas-bg: #151d2d;`, `--surface: #1e293b;`) with WCAG AA compliance across all design tokens.
  2. **Exhaustive Bilingual Audit (Spanish / English)**:
     - Eliminated all Spanish leakage when `language === 'en'` across all 38 playgrounds, visualizers, headers, and cards: Karatsuba, Linear Programming, Sudoku, N-Queens, Closest Pair, Dijkstra, Hamiltonian Cycle, Knapsack BB, Kruskal, Knapsack Greedy, Bellman-Ford, Graph Coloring, Interval Partitioning, Median of Medians, Minimize Lateness, RNA, Vertex Cover Approx, and ExerciseHeaderIllustration.
  3. **Karatsuba Rectangles & Algebraic Optimization**:
     - Prevented rectangle text overflow in branch cards; split labels across lines, adjusted card dimensions, and localized algebraic optimization notes.
  4. **Merge Sort Upward Recombination**:
     - Upgraded `MergeSortPlayground` with dual-phase visualization: Recursive Division (top-down ↓) and Conquer & Merge (bottom-up ↑) with comparison calculation and subarray recombination.
  5. **Majority Element ("Fideo" fix)**:
     - Upgraded layout from squished column to `minmax(360px, 1fr) minmax(0, 1.25fr)` with `min-width: 0;`, contrasting + / - buttons, and localized Boyer-Moore counter table.
  6. **Highway Antennas Drag Sensibility**:
     - Calibrated drag interaction using SVG inverse CTM matrix transformation (`getScreenCTM().inverse()`) with pointer offset tracking and 24px transparent hit area on antenna poles.
  7. **Instructor Mode Code Highlighting & Pseudocode**:
     - Zero-dependency syntax highlighting for canonical Python and Pseudocode in Phase 3 Understand view, highlighting keywords, control flow, functions, types, and comments.
  8. **Anti-Gaming Hint Gating**:
     - Upgraded `codeEffortAnalyzer.ts` to reject trivial assignments (e.g. `cualquier = 0`), single-token lines, and duplicate consecutive test attempts.
  9. **Graph Coloring**:
     - Removed white outline artifact on vertex `<g>` elements and increased color badge vertical offset to prevent overlapping vertex circles.
  10. **Traveling Salesperson (TSP)**:
      - High-contrast dashed edges (`stroke: var(--border-strong)`, `strokeWidth: 2`, `opacity: 0.85`), with opaque background pill badges behind edge weights.
  11. **Knight's Tour**:
      - Selectable board dimensions (`4×4`, `5×5`, `6×6`, `8×8`).
      - Gated Warnsdorff heuristic hints and star `★` behind instructor mode or exercise mastery.
      - Replaced unicode `♞` with vector SVG `ChessKnightIcon`.
  12. **Coin Change DP Gating**:
      - DP (Optimal) card gated with `? monedas` / `[ ? ]` until user finds optimal combination, activates instructor mode, or clicks "Revelar Solución Óptima". Greedy heuristic card remains permanently visible.
  13. **Vite Manual Chunk Decoupling**:
      - Added dedicated `app-core` chunk for `src/context/`, `src/hooks/`, `src/i18n/`, grouped Knapsack components into `visualizers-dp`, completely eliminating circular chunk warnings.
  14. **Tests & Quality Gates**:
      - `npm run lint`: 0 errors, 0 warnings.
      - `npm run typecheck`: 0 errors.
      - `npm test`: 47 test files, 363 passed (100% PASS).
      - `npm run build`: static production build cleanly generated in `dist/` with zero warnings in ~1.70s.
