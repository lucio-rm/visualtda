# Visual TDA — Current Repository State

- **CURRENT_PHASE**: MISSION_V10_HIGH_DEFINITION_GEOMETRY_AND_TYPOGRAPHY_PERFECTION
- **CURRENT_TASK**: Completed Deep Research & Engineering for Light Mode Surface Hierarchy, Board Squares Geometry, and Typography:
  1. **Typography & Font Stack Architecture**:
     - Researched developer platforms and coding tools (JetBrains Mono, Fira Code, Inter, Apple SF Pro, Monospace stacks).
     - UI font stack: `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`.
     - Code/Matrix font stack: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`.
     - Enabled OpenType legibility features and `tabular-nums` in `base.css` for numeric alignment in tables and step scrubbers.
  2. **Page vs. Card vs. Workbench Surface Hierarchy**:
     - Light mode global background set to `--bg: #f1f5f9` (Slate-100), providing clear visual separation for pure white (`#ffffff`) cards.
     - Workbench canvas set to `--canvas-bg: #f8fafc` (recessed drafting area with 1.5px border) inside `.algorithm-playground` and `.visualizer-stage`.
  3. **High-Definition Board & Grid Squares ("Cuadraditos")**:
     - Resolved light squares blending into the card background: `--board-cell-light` set to `#e2e8f0` (Slate-200, distinct tile tone, never transparent).
     - Upgraded dark squares: `--board-cell-dark` set to `#829ab1` (Steel-slate, achieving 2.36:1 contrast against light squares and 6.13:1 against text).
     - Cell borders between every square set to 1.5px solid `--board-border: #475569`.
     - Board outer framing bezel: 2.5px-3.5px solid `--board-border-strong: #1e293b` (Light) / `#64748b` (Dark) with drop shadow and coordinate markings across Knight's Tour, N-Queens, and Sudoku.
     - Dynamic programming tables (Knapsack, Bellman-Ford, LCS, Segmented Least Squares) upgraded with 2px outer table borders and 1.5px cell grids.
  4. **High-Contrast Graph Edges Across All Visualizers**:
     - Systematically upgraded all 9 graph visualizers & playgrounds from low-opacity borders to solid `--graph-edge` with `strokeWidth >= 2px` and `opacity: 1`: Hamiltonian Cycle, Dijkstra, Kruskal, Bellman-Ford, TSP Branch & Bound, Max Flow, Graph Coloring, Vertex Cover / Independent Set Reduction, and Vertex Cover 2-Approximation.
  5. **Knight's Tour Candidate Moves & Ray Trajectories**:
     - Preserved natural chessboard square colors; candidate cells no longer painted with opaque solid fills.
     - Rendered vector dashed rays radiating from knight to candidate destinations with animated visual target rings and dots.
     - Contrast-adapted step numbers (`#f8fafc` on dark squares, `#0f172a` on light squares).
  6. **Exhaustive Bilingual Audit (Spanish / English)**:
     - Eliminated all Spanish leakage when `language === 'en'` across all 38 playgrounds, visualizers, headers, and cards: Karatsuba, Linear Programming, Sudoku, N-Queens, Closest Pair, Dijkstra, Hamiltonian Cycle, Knapsack BB, Kruskal, Knapsack Greedy, Bellman-Ford, Graph Coloring, Interval Partitioning, Median of Medians, Minimize Lateness, RNA, Vertex Cover Approx, and ExerciseHeaderIllustration.
  7. **Karatsuba Rectangles & Algebraic Optimization**:
     - Prevented rectangle text overflow in branch cards; split labels across lines, adjusted card dimensions, and localized algebraic optimization notes.
  8. **Merge Sort Upward Recombination**:
     - Upgraded `MergeSortPlayground` with dual-phase visualization: Recursive Division (top-down ↓) and Conquer & Merge (bottom-up ↑) with comparison calculation and subarray recombination.
  9. **Majority Element ("Fideo" fix)**:
     - Upgraded layout from squished column to `minmax(460px, 1.15fr) minmax(0, 1.35fr)` with responsive single-column breakpoint at 1200px and user-toggleable Split/Stacked view (`[↕ Vista Apilada | ↔ Vista Dividida]`).
  10. **Highway Antennas Drag Sensibility & Smoothness**:
     - Calibrated drag interaction with frozen coordinate scaling (`activeMaxKmRef`) and pointer collision prevention (`lastInteractionTime`), ensuring perfectly responsive dragging without erratic coordinate jumps or accidental antenna deletions.
  11. **Instructor Mode Code Highlighting & Pseudocode**:
     - Zero-dependency syntax highlighting for canonical Python and Pseudocode in Phase 3 Understand view, with language badge, filename, copy status feedback, and gutter line numbers.
  12. **Anti-Gaming Hint Gating**:
      - Upgraded `codeEffortAnalyzer.ts` to reject trivial literal arithmetic assignments (e.g. `cualquier = 0 + 1`), single-token lines, and empty stub test runs (`getGenuineStudentAttemptCount`).
  13. **Graph Coloring**:
     - Removed white outline artifact on vertex `<g>` elements and increased color badge vertical offset to prevent overlapping vertex circles.
  14. **Traveling Salesperson (TSP)**:
      - High-contrast dashed edges (`stroke: var(--graph-edge)`, `strokeWidth: 2`, `opacity: 1`), with opaque background pill badges behind edge weights.
  15. **Knight's Tour**:
      - Selectable board dimensions (`4×4`, `5×5`, `6×6`, `8×8`).
      - Gated Warnsdorff heuristic hints and star `★` behind instructor mode or exercise mastery.
      - Replaced unicode `♞` with vector SVG `ChessKnightIcon`.
  16. **Coin Change DP Gating**:
      - DP (Optimal) card gated with `? monedas` / `[ ? ]` until user finds optimal combination, activates instructor mode, or clicks "Revelar Solución Óptima". Greedy heuristic card remains permanently visible.
  17. **Vite Manual Chunk Decoupling**:
      - Added dedicated `app-core` chunk for `src/context/`, `src/hooks/`, `src/i18n/`, grouped Knapsack components into `visualizers-dp`, completely eliminating circular chunk warnings.
  18. **Tests & Quality Gates**:
      - `npm run lint`: 0 errors, 0 warnings.
      - `npm run typecheck`: 0 errors.
      - `npm test`: 47 test files, 365 passed (100% PASS).
      - `npm run build`: static production build cleanly generated in `dist/` with zero warnings in ~1.75s.
