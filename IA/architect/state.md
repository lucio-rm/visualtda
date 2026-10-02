# Visual TDA — Current Repository State

- **CURRENT_PHASE**: MISSION_V9_DESIGN_SYSTEM_PALETTE_OVERHAUL_AND_GRAPH_EDGES_COMPLETED
- **CURRENT_TASK**: Completed Design System Research & Overhaul, High-Contrast Graph Edges, and Knight's Tour Candidate Paths:
  1. **Light & Dark Mode Color Palette Overhaul**:
     - Researched world-class developer tools & design systems (Linear, Vercel, Stripe, Radix UI, Tailwind Slate scale).
     - Light theme: Pristine Slate-White workspace (`--bg: #f8fafc;`, `--surface: #ffffff;`, `--surface-light: #f1f5f9;`, `--border: #cbd5e1;`, `--border-strong: #475569;`, `--text: #0f172a;`, `--text-muted: #475569;`). Deep text on surface achieves 18.2:1 contrast (WCAG AAA).
     - Dark theme: Deep Obsidian Slate canvas (`--bg: #0b0f17;`, `--canvas-bg: #0f172a;`, `--surface: #1e293b;`, `--border: #334155;`, `--border-strong: #64748b;`, `--text: #f8fafc;`, `--text-muted: #94a3b8;`).
     - Added dedicated semantic token `--graph-edge` (`#334155` Light, 10.35:1 contrast; `#94a3b8` Dark, 6.96:1 contrast) with `--graph-edge-subtle` (`#64748b`).
     - Verified across all themes with automated contrast tests (`tests/contrastAndDesignSystem.test.ts`).
  2. **High-Contrast Graph Edges Across All Visualizers**:
     - Systematically upgraded all 9 graph visualizers & playgrounds from low-opacity borders to solid `--graph-edge` with `strokeWidth >= 2px` and `opacity: 1`: Hamiltonian Cycle, Dijkstra, Kruskal, Bellman-Ford, TSP Branch & Bound, Max Flow, Graph Coloring, Vertex Cover / Independent Set Reduction, and Vertex Cover 2-Approximation.
     - Upgraded tree connectors in `KaratsubaVisualizer.tsx` and road ticks in `RoadAntennasVisualizer.tsx` & `RoadAntennasPlayground.tsx`.
  3. **Knight's Tour Candidate Moves & Ray Trajectories**:
     - Preserved natural chessboard square colors; candidate cells no longer painted with opaque solid fills.
     - Rendered vector dashed rays radiating from knight to candidate destinations with animated visual target rings and dots.
  4. **Exhaustive Bilingual Audit (Spanish / English)**:
     - Eliminated all Spanish leakage when `language === 'en'` across all 38 playgrounds, visualizers, headers, and cards: Karatsuba, Linear Programming, Sudoku, N-Queens, Closest Pair, Dijkstra, Hamiltonian Cycle, Knapsack BB, Kruskal, Knapsack Greedy, Bellman-Ford, Graph Coloring, Interval Partitioning, Median of Medians, Minimize Lateness, RNA, Vertex Cover Approx, and ExerciseHeaderIllustration.
  5. **Karatsuba Rectangles & Algebraic Optimization**:
     - Prevented rectangle text overflow in branch cards; split labels across lines, adjusted card dimensions, and localized algebraic optimization notes.
  6. **Merge Sort Upward Recombination**:
     - Upgraded `MergeSortPlayground` with dual-phase visualization: Recursive Division (top-down ↓) and Conquer & Merge (bottom-up ↑) with comparison calculation and subarray recombination.
  7. **Majority Element ("Fideo" fix)**:
     - Upgraded layout from squished column to `minmax(360px, 1fr) minmax(0, 1.25fr)` with `min-width: 0;`, contrasting + / - buttons, and localized Boyer-Moore counter table.
  8. **Highway Antennas Drag Sensibility**:
     - Calibrated drag interaction using SVG inverse CTM matrix transformation (`getScreenCTM().inverse()`) with pointer offset tracking and 24px transparent hit area on antenna poles.
  9. **Instructor Mode Code Highlighting & Pseudocode**:
     - Zero-dependency syntax highlighting for canonical Python and Pseudocode in Phase 3 Understand view, highlighting keywords, control flow, functions, types, and comments.
  10. **Anti-Gaming Hint Gating**:
      - Upgraded `codeEffortAnalyzer.ts` to reject trivial assignments (e.g. `cualquier = 0`), single-token lines, and duplicate consecutive test attempts.
  11. **Graph Coloring**:
     - Removed white outline artifact on vertex `<g>` elements and increased color badge vertical offset to prevent overlapping vertex circles.
  12. **Traveling Salesperson (TSP)**:
      - High-contrast dashed edges (`stroke: var(--graph-edge)`, `strokeWidth: 2`, `opacity: 1`), with opaque background pill badges behind edge weights.
  13. **Knight's Tour**:
      - Selectable board dimensions (`4×4`, `5×5`, `6×6`, `8×8`).
      - Gated Warnsdorff heuristic hints and star `★` behind instructor mode or exercise mastery.
      - Replaced unicode `♞` with vector SVG `ChessKnightIcon`.
  14. **Coin Change DP Gating**:
      - DP (Optimal) card gated with `? monedas` / `[ ? ]` until user finds optimal combination, activates instructor mode, or clicks "Revelar Solución Óptima". Greedy heuristic card remains permanently visible.
  15. **Vite Manual Chunk Decoupling**:
      - Added dedicated `app-core` chunk for `src/context/`, `src/hooks/`, `src/i18n/`, grouped Knapsack components into `visualizers-dp`, completely eliminating circular chunk warnings.
  16. **Tests & Quality Gates**:
      - `npm run lint`: 0 errors, 0 warnings.
      - `npm run typecheck`: 0 errors.
      - `npm test`: 47 test files, 363 passed (100% PASS).
      - `npm run build`: static production build cleanly generated in `dist/` with zero warnings in ~1.70s.
