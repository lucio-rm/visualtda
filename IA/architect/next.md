# Visual TDA — Master Engineering Mission V4 Backlog & Roadmap

Visual TDA has successfully expanded to **37 university-grade exercises** across all fundamental paradigms and advanced topics. All 12 Quality Gates (G1–G12) remain in **PASS** status.

---

## 1. Master Mission V4 Milestones Completed

1. ✅ **Curriculum Expansion to 37 Exercises (100% Coverage)**
   - Divide & Conquer: Merge Sort, Max Subarray, Peak Finding, Inversion Counting, Closest Pair, Karatsuba, Majority Element, Median of Medians (8 exercises).
   - Greedy: Interval Scheduling, Fractional Knapsack, Road Antennas, Huffman Coding, Interval Partitioning, Minimize Lateness, Dijkstra, Kruskal (8 exercises).
   - Dynamic Programming: 0/1 Knapsack, Juan el Vago, Coin Change, LCS, Weighted Interval Scheduling, Segmented Least Squares, RNA Secondary Structure, Bellman-Ford (8 exercises).
   - Backtracking / Branch & Bound: N-Queens, Subset Sum, Graph Coloring, Sudoku, Knight's Tour, Hamiltonian Cycle, Knapsack B&B, TSP B&B (8 exercises).
   - Advanced: Max Flow, Linear Programming, IS $\le_P$ VC Reduction, Vertex Cover 2-Approx, Von Neumann Fair Coin (5 exercises).
   - Every single exercise has a dedicated interactive 2D SVG Visualizer and dedicated interactive Playground.

2. ✅ **Mathematical Typography Engine & LaTeX Unnesting**
   - Implemented recursive unnesting of `\text`, `\mathrm`, `\mathbf`, `\mathcal` in `TheoryMarkdown.tsx`.
   - Full Markdown table support (`| col | col |` with separator detection) rendered in semantic HTML.
   - Comprehensive mathematical symbol mapping (`ℝ`, `ℕ`, `ℤ`, `𝔼`, Greek letters, logic operators, set operators, quantifiers, bounds, and superscripts).
   - 7 unit tests in `tests/theoryMarkdown.test.tsx` (100% PASS).

3. ✅ **Universal Timeline Keyboard Navigation & Scrubbing**
   - Default keyboard shortcuts enabled across all 37 visualizers: `ArrowRight` / `ArrowLeft`, `Space` / `k`, `r` (reset), `Home` (step 0), `End` (last step).
   - Input/textarea focus interception protection.
   - 6 unit and DOM integration tests in `tests/useTraceTimeline.test.tsx` (100% PASS).

4. ✅ **Visual Quality, Theme Contrast & Full Bilingual Parity**
   - High-contrast edge styling (`var(--border-strong)`) applied across all graph-based visualizers (`MaxFlow`, `GraphColoring`, `Dijkstra`, `BellmanFord`, `Kruskal`, `HamiltonianCycle`) ensuring WCAG AAA legibility in both light and dark modes.
   - Eradicated all decorative emojis, cheerleading exclamation marks (`¡`), and informal badges across all visualizers, playgrounds, and cards.
   - Full bilingual (ES/EN) parity across header bars, metric counters, recurrence callouts, table headers, and playback controls in DP and Greedy visualizers.

5. ✅ **Pedagogical Progress Model & Access Control**
   - 7 formal stages: `unseen`, `exploring`, `attempted`, `testing`, `passed`, `completed`, `instructor`.
   - Monotonic rank invariant ensures earlier interactions never degrade higher achievements.
   - Canonical Python solution strictly locked until tests pass or Instructor Mode is explicitly enabled.

---

## 2. Active Priorities & Verification Targets

1. **Section 11 / 96 — Continuous Exercise Quality Auditing**:
   - Keep `docs/exercise-quality-matrix.md` updated with empirical verification evidence.
2. **Section 35 / 36 — Comprehensive Headless Browser QA**:
   - Maintain 22/22 real Chromium headless test passes across 5 responsive viewports with 0 console errors.
3. **Section 43 / 44 — Complexity & Invariant Explanations**:
   - Continuously refine asymptotic cost proofs ($O$) and exchange arguments for FIUBA presentation.
4. **Section 79 — Mobile & Responsive Layout**:
   - Ensure all 37 visualizers render cleanly without horizontal overflow clipping on narrow viewports.

