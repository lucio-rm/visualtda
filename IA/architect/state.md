# Visual TDA — Current Repository State

- **CURRENT_PHASE**: MISSION_V6_ACADEMIC_POLISH_AND_DYNAMIC_GATING_COMPLETED
- **CURRENT_TASK**: Completed Academic UI Polish, Dynamic Technique-Specific Hint Gating, Universal Emoji Eradication, and Interactive Graph Editors:
  1. **Dynamic Logic Lines Calibrated by Algorithmic Technique**:
     - Upgraded `src/utils/hintGating.ts` so requirement thresholds scale dynamically with problem complexity:
       - **Dynamic Programming & Network Flow**: 16 lines (Hint 1), 22 lines (Hint 2), 28 lines (Hint 3).
       - **Backtracking, D&C, Linear Programming, Reductions**: 10 lines (Hint 1), 15 lines (Hint 2), 20 lines (Hint 3).
       - **Greedy, Approximation**: 8 lines (Hint 1), 12 lines (Hint 2), 16 lines (Hint 3).
       - **Randomized Algorithms**: 6 lines (Hint 1), 10 lines (Hint 2), 14 lines (Hint 3).
  2. **Strict Pedagogical Category Ordering**:
     - In `src/engine/registry.ts` and `tests/registry.test.ts`, enforced exact canonical sequence:
       1. Divide & Conquer (`divide-and-conquer`)
       2. Greedy (`greedy`)
       3. Backtracking (`backtracking`)
       4. Dynamic Programming (`dynamic-programming`)
       5. Linear Programming (`linear-programming`)
       6. Network Flow (`network-flow`)
       7. Problem Reductions (`reductions`)
       8. Approximation Algorithms (`approximation`)
       9. Randomized Algorithms (`randomized`)
  3. **Light and Dark Mode Design System Calibration**:
     - In `src/styles/variables.css`:
       - Light Mode: Set `--border: #e2e8f0;`, `--border-strong: #475569;`, `--surface-hover: #f8fafc;`, `--text-muted: #475569;`, eliminating harsh wireframe box outlines.
       - Dark Mode: Set `--border: #334155;`, `--border-strong: #64748b;`, `--accent-contrast: #ffffff;`.
       - Harmonized state palettes (eliminated clashing electric blue + bright green combinations; integrated muted, professional tints).
       - Updated `tests/contrastAndDesignSystem.test.ts` to assert WCAG 2.1 SC 1.4.11 interactive UI contrast on `--border-strong`.
  4. **Universal Emoji Eradication**:
     - Replaced all padlock emojis (`🔒`, `🔓`) and decorative icons (`⏱`, `💾`, `⚙️`, `🎯`, `🔍`, `🎲`, `📦`, `🎉`, `⚠️`, `🎒`, `⚖️`, `📍`, `⚡`) across components and visualizers with clean, crisp inline SVGs or standard academic typography.
  5. **Phase 3 (Understand) Layout Overhaul**:
     - Eliminated the two-column height mismatch in `UnderstandView.tsx` and `App.css`.
     - Structured as a full-width sequential academic paper:
       1. Top: Interactive Visualizer & Trace Playback
       2. Code Panel: "Tu Solución", "Intentos", and restricted faculty solutions
       3. Executive Asymptotic Bounds Bar (4-metric horizontal card grid with clean SVGs)
       4. Context & Naive Intuition Traps Banner
       5. Formal Theoretical Foundations (Academic paper with FIUBA seal and centered reading width)
       6. Paradigm Connections & Comparison
  6. **Interactive Graph & Capacity Editors in Graph Playgrounds**:
     - **Dijkstra (`DijkstraPlayground.tsx`)**: Added interactive node addition, edge creation (`u`, `v`, `weight`), weight editing, edge deletion, and graph reset.
     - **Kruskal (`KruskalPlayground.tsx`)**: Made edges fully stateful, computed true MST weight dynamically, and added edge/node addition, editing, and deletion.
     - **Bellman-Ford (`BellmanFordPlayground.tsx`)**: Supported custom directed edges with positive or negative weights, edge deletion, and table recalculation.
     - **Max Flow (`MaxFlowPlayground.tsx`)**: Added capacity and edge editor for simulating custom bottlenecks and cuts.
  7. **Typography Scale Standards**:
     - Standardized all visualizers to minimum $\ge 0.8125\text{rem}$ (13px) for badges and metadata, and $\ge 0.875\text{rem}$ (14px) for body text, eliminating tiny `0.65rem`/`0.7rem` illegible text.
- **BASELINE_COMMIT**: `agent/antigravity`
- **QUALITY_GATES_STATUS**:
  - `npm run lint`: 0 errors, 0 warnings
  - `npm run typecheck`: 0 errors
  - `npm test`: 46 test files, 355 passed (100% PASS)
  - `npm run build`: static production build succeeds cleanly in `dist/` in ~1.81s
