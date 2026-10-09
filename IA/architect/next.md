# Visual TDA — Master Engineering Roadmap & Next Steps

This document defines the completed milestones of **Mission V11** and outlines the strategic architectural vision to elevate Visual TDA from an exemplary platform to an internationally benchmarked, "perfect" algorithmic laboratory.

---

## 1. Execution Order & Completed Milestones (Mission V11)

1. ✅ **Part 1 — Verification Sweep**:
   - Board square contrast recalculation: legacy 2.364:1 eliminated.
   - Catalog exercise selector squares vs background: elevated cards with 1.5px borders, shadows, and crisp surface contrast.
   - Button and interactive control legibility sweep: resolved button fills, contrast ratios, and pill badges.
   - Documentation re-sync: `questions.md`, `current-audit.md`, `known-issues.md`, `state.md`.

2. ✅ **Part 2 — Systematic Color System Migration (@radix-ui/colors)**:
   - Mathematical 12-step Radix scales adopted across Slate (neutrals), Indigo (accent), Grass (success/optimal), Tomato (error/conflict), Amber (evaluation).
   - Solid buttons, chessboard squares, pieces, and graph edges calibrated to achieve $\ge 5:1$ to $15:1$ WCAG contrast.

3. ✅ **Part 3 — Verification**:
   - Automated contrast test suite (`tests/contrastAndDesignSystem.test.ts` - 9/9 passing).
   - Real-Chromium screenshot verification across all 38 exercises in both Light and Dark themes.

4. ✅ **Part 4 — Full Curriculum Pedagogical Completeness & Theory Foundations**:
   - 100% of exercises feature formal problem modeling, mathematical proofs (induction, invariants, exchange arguments), step-by-step asymptotic complexity ($O$), and naive intuition traps with concrete counterexamples.
   - Enforced by continuous regression tests in `tests/exerciseContent.test.ts`.

5. ✅ **Part 5 — Light Mode Hierarchy, Card Header Redesign & Interactive Bug Sweep**:
   - Light mode depth hierarchy: desktop canvas `--bg: #ccd3de` establishing a clear physical contrast against pure white cards (`--surface: #ffffff`) with zero card bleeding.
   - Card headers streamlined to `#num` + category; footer bar contains difficulty stars adjacent to difficulty label, and status badge on the right, eliminating text wrap.
   - Knight's Tour unsolvable 4×4 presets purged. Predecessor function layout shift locked in Weighted Intervals.

6. ✅ **Part 6 — Road Antennas Label Staggering & Universal Selection Controls Polish**:
   - Cursor indicator marker suppressed during drag with active ring feedback, eliminating yellow duplicate numbers.
   - 1D greedy interval coloring for nearby house km labels within 48px, eliminating label collisions with dashed leader lines and knockout text halos.
   - Header language/theme selectors and board size selectors migrated to high-definition `.segmented-control` pills.

7. ✅ **Part 7 — Universal Speed Controls Migration to Segmented Pills & Header Stars Harmonization**:
   - Replaced legacy `<select>` playback speed dropdowns across 13 visualizers with modern `.segmented-control` button pills.
   - Harmonized difficulty display in `ExerciseView.tsx` with the unified SVG 5-star rating system from `ExerciseCard.tsx`.

8. ✅ **Part 8 — Interaction Stability, Bilingual Copy Purity, Light Mode Elevation, and Author Footer**:
   - Minimize Lateness Drag Stabilization: Fixed 60Hz boundary swap oscillation and banner flashing by decoupling mouse movement from instant state mutations.
   - Road Antennas Hit-Test Overhaul: Added 32px hit-targets to all houses and a 1-click house chip removal bar with safety timeouts.
   - Bilingual Copy Purity: Localized Huffman merged parent text (`+ New Parent` / `+ Nuevo Padre`) and upgraded `SolveView.tsx` with full English starter code function signatures.
   - Author Footer & Feedback Channel: Added `Author — Lucio Romero Mascaró` and interactive `FeedbackModal`.

9. ✅ **Part 9 — English Starter Codes, Drag Stabilization, Light Mode Card Contrast & Badge Overflow Resolution**:
   - Complete English Starter Codes (`src/engine/content/englishStarterCodes.ts`) across all 37 exercise definitions.
   - Fixed deadline flags ($d_i$) decoupled from dragged block in `MinimizeLatenessPlayground.tsx`.
   - Scaled stars to 11×11px and streamlined `difficulty-label` font size to 0.72rem, providing >50px of breathing room inside `.card-difficulty-bar`.
   - Replaced invisible yellow text tokens with accessible theme variables in Inversion Counting and Huffman.

10. ✅ **Part 10 — Privacy Protection, Silent Async Feedback, Subtle Visualizer Baseline, and Editor Vertical Expansion**:
    - **Email Privacy & Anti-Spam**: Completely stripped any plaintext references to `lromerom@fi.uba.ar` from UI, labels, and placeholders. Obfuscated FormSubmit endpoint (`atob(...)`).
    - **Silent In-Page Delivery**: Eliminated OS `mailto:` redirects (`window.location.href`). Feedback is sent via client `fetch` POST with progress state (`Enviando...`) and in-modal confirmation card.
    - **Anonymous Submission Option**: Added `[ ] Enviar de forma anónima` checkbox that clears and disables the email field.
    - **Square GitHub Button**: Redesigned `.footer-gh-link` as an accessible 32×32px square button containing strictly the GitHub SVG icon.
    - **Subtle Road Antennas Optimal Baseline**: Replaced the 60px-tall green overlay rectangle with an elegant canonical baseline beneath the highway (`roadY + 51`) with discrete brackets `[ ——— • ——— ]` and vertical alignment guides. User antennas and houses remain 100% visible, clearly highlighting the gap ("la brecha / distancia / km") from the optimal placement.
    - **Solve Editor Vertical Expansion**: Raised editor wrapper and stage min-height from 420px to 560px (`.solve-editor-column .editor-input-wrapper`, `.solve-editor-column .code-editor-stage`), and increased textarea rows to 24, eliminating empty whitespace below the attempts history.

11. ✅ **Part 11 — Filter Headroom, Mathematical Typography Engine, Bilingual Academic Foundations & P=NP Emblem**:
    - Filter headroom clipping resolved; math equations upgraded with native Unicode formatting and left-aligned centered blocks; bilingual academic theoretical overrides; P=NP header emblem.

12. ✅ **Part 12 — Human Feedback Defects & Interaction Parity (Mission V12)**:
    - **Dual Feedback Delivery (1.1)**: Dual email targets (`lucioromeromascaro@gmail.com` + `lromerom@fi.uba.ar`), FormSubmit activation requested, manual delivery invariant documented.
    - **Whitespace & Blank Lines Gating (1.2)**: `isUnimplementedStub` checks `analyzeStudentCodeEffort` requiring $\ge 2$ meaningful lines and real algorithmic logic.
    - **Kruskal / MST Direction Fix & Invariant (1.3)**: Corrected minimization check (`weight <= optimalWeight`) and added standing `tests/minMaxDirectionInvariants.test.ts` suite.
    - **Majority Element Layout (1.4)**: Overhauled tile flex-basis, wrap, and vote button grid (`repeat(3, 24px)`) in default problem view.
    - **Dark Mode Solid Buttons (1.5)**: Systematically replaced pale `var(--accent)` with `var(--accent-solid)` on solid controls across all stylesheets.
    - **Minimize Lateness Staggering (1.6)**: 1D label vertical staggering for deadline pins and high-contrast, unoccluded inversion pill badge.
    - **Knapsack Spacing & Drag-and-Drop (1.7)**: Drag items into/out of backpack, dynamic backpack filling stack, spacious metric chips and tree node offsets.
    - **Sudoku MRV Heuristic Gating (1.8)**: Gated MRV hints behind instructor mode / mastery.
    - **Hamiltonian Cycle Contrast (1.9)**: Replaced hardcoded slate color on vertex "0" with `var(--text)`.
    - **Road Antennas Quilmes Example (1.10)**: Rebuilt Highway 2 into Quilmes corridor with compact km ($2, 6, 11, 16, 22$) and town labels.
    - **Logo Redesign & Favicon (1.11)**: Enlarged 38×38px $P \stackrel{?}{=} NP$ emblem with complexity orbits, hover transitions, and embedded SVG favicon.
    - **DP Recurrence Input & Spoilers Purge (1.12)**: Mounted `DpRecurrenceSelfCheck` in Solve view and purged recurrence formulas from Discover insights and code comments.

---

## 2. Quality Baseline

- `npm run lint`: 0 errors, 0 warnings.
- `npm run typecheck`: 0 errors.
- `npm test`: 50 test files, 392 passed (100% PASS).
- `npm run build`: static production build in `dist/` cleanly generated in ~1.7s.

---

## 3. The Path to "Perfection": Strategic Architectural Vision & Roadmap

To elevate Visual TDA into the definitive, world-class reference platform for computer science algorithms (comparable to or surpassing VisuAlgo, NeetCode, and LeetCode while maintaining Kleinberg & Tardos academic depth), here is the concrete analysis of what is needed, organized into high-impact pillars:

### Pillar 1: Visual Debugging Bridge ("Solve" to "Understand" Failure Inspector)
- **The Problem**: When a student's Python algorithm fails test case 3 out of 5, they currently receive a text assertion diff (e.g. `Obtenido: [14, 26, 36] | Esperado: [14, 36]`). The student must mentally reconstruct where their greedy choice went astray.
- **The "Perfect" Solution**:
  - Add a 1-click action on failed test cases: **`[Inspeccionar en Visualizador]` / `[Inspect in Visualizer]`**.
  - Clicking this loads the student's actual output directly into the visualizer canvas side-by-side or overlaid against the canonical solution.
  - For example, in *Road Antennas*, the visualizer immediately highlights in red the house at km 26 that was redundantly covered or missed, showing visually why their greedy rule produced a suboptimal set.
  - This turns an opaque unit test failure into an instantaneous "Aha!" pedagogical moment.

### Pillar 2: Dynamic Custom Input Sandbox across all 38 Visualizers
- **The Problem**: Most visualizers provide 3–5 curated presets. While presets demonstrate canonical edge cases, active learning peaks when students can test their own counterexamples or classroom homework problems.
- **The "Perfect" Solution**:
  - Implement a standardized, collapsible **"Entrada Personalizada" / "Custom Input"** bar across all visualizers.
  - Allows students to paste their own array (`[8, 3, 2, 9, 7, 1]`), string pair (`s1="ALGORITHM", s2="ALGEBRA"`), or graph adjacency list.
  - Visual TDA validates the format, generates the trace on the fly, and visualizes the custom instance with zero backend dependencies.

### Pillar 3: Interactive Knowledge Graph (The Curriculum "Skill Tree")
- **The Problem**: The catalog is a linear grid of cards categorized by paradigm. While clean, it does not visually demonstrate *how* algorithmic paradigms evolve.
- **The "Perfect" Solution**:
  - Introduce an interactive **"Grafo de Reducciones y Técnicas" / "Curriculum Knowledge Graph"** view (toggleable alongside the grid catalog).
  - Graph nodes represent problems; directed edges represent pedagogical transitions:
    - *Interval Scheduling* (Greedy succeeds) $\longrightarrow$ *Weighted Interval Scheduling* (Greedy fails $\implies$ Dynamic Programming required).
    - *Bipartite Matching* $\longrightarrow$ *Max Flow (Ford-Fulkerson)* $\longrightarrow$ *Min-Cut Duality*.
    - *Independent Set* $\longrightarrow$ *Vertex Cover* $\longrightarrow$ *Set Cover* (Karp's 21 NP-complete reductions).
  - Gives university students the "big picture" of theoretical computer science (Kleinberg & Tardos Chapters 1 through 8).

### Pillar 4: Timeline Scrubber with State Keyframes
- **The Problem**: Trace playback currently relies on play/pause and step forward/backward buttons. For traces with 80+ steps (e.g., Merge Sort, Huffman tree building, or Knapsack DP table fill), clicking "Next" 40 times is tedious.
- **The "Perfect" Solution**:
  - Upgrade the playback bar with a continuous **draggable scrubber slider** with hoverable step keyframe ticks.
  - Hovering over a tick previews the event name (e.g. `[Paso 24: Particionar subarreglo [4..7]]`).
  - Dragging the handle jumps directly to that step instantaneously, facilitating seamless exploration of long traces.

### Pillar 5: Keyboard Shortcuts & Power-User Workflow
- **The Problem**: Navigating between code editor, running tests, and stepping traces currently requires repeated mouse clicks.
- **The "Perfect" Solution**:
  - Standard hotkeys:
    - `Ctrl + Enter` / `Cmd + Enter`: Run Tests (Fast TS or Pyodide).
    - `Space`: Play / Pause Trace playback.
    - `ArrowLeft` / `ArrowRight` (in visualizer): Step Back / Step Forward.
    - `1`, `2`, `3`: Jump to Discover, Solve, or Understand phase.
  - Add a small `[?]` modal displaying keyboard navigation shortcuts.

### Pillar 6: Offline Academic Portfolio & Solution Export
- **The Problem**: Student progress is stored in browser `localStorage`. If a student clears browser data or changes laptops, their solved exercises and code attempts are lost.
- **The "Perfect" Solution**:
  - **Export Portfolio (`JSON` & `Markdown`)**: 1-click button allowing students to download a zipped archive or single document containing all their passing solutions, timestamps, and difficulty badges.
  - **Import Progress**: 1-click upload to restore their portfolio on any machine with 100% privacy and zero server accounts.
