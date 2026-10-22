# Visual TDA — Accessibility (a11y) Verification Checklist

**Standard**: WCAG 2.1 Level AA Compliance  
**Date**: 2026-09-22  
**Authority**: Master Engineering Mission V3 (Section 8) & Principle P8 (*Accessibility by Default*)

---

## 1. Universal Accessibility Criteria

Every interactive component, visualizer, and playground in Visual TDA must satisfy the following baseline standards:

1. **Keyboard Operability (WCAG 2.1.1)**:
   - All interactive elements must be reachable via `Tab` / `Shift+Tab`.
   - All interactive SVG elements (`<g>`, `<circle>`, `<rect>`) must have `tabIndex={0}` and `role="button"`.
   - All interactive elements must respond to both `Enter` and `Space` (` ' ' `), preventing default scroll behavior where applicable.
2. **Visible Focus Indicators (WCAG 2.4.7)**:
   - Universal `:focus-visible` styles with `2px solid var(--accent)` outline and `2px` offset.
   - High visibility across both light and dark theme modes.
3. **Non-Color State Indicators (WCAG 1.4.1)**:
   - Color is never used as the sole conveyor of information.
   - Status indicators pair colors with text labels, icons, or symbols (e.g. `✓`, `⚠️`, `+`, `w:15`, `[101]`).
4. **Color Contrast (WCAG 1.4.3)**:
   - Text contrast ratio $\ge 4.5:1$ against surface/background.
   - Large text ($\ge 18$pt or $\ge 14$pt bold) contrast $\ge 3:1$.
   - UI components and graphical objects contrast $\ge 3:1$ against adjacent colors.
5. **Name, Role, Value & ARIA Semantics (WCAG 4.1.2)**:
   - Semantic HTML used primarily (`<button>`, `<select>`, `<main>`, `<header>`, `<nav>`, `<aside>`, `<ol>`, `<ul>`).
   - SVG graphs and boards tagged with `role="img"` or `role="region"` and descriptive `aria-label`.
   - Interactive toggle chips use `aria-pressed="true|false"`.
6. **Reduced Motion (WCAG 2.3.3)**:
   - `@media (prefers-reduced-motion: reduce)` in `src/styles/base.css` suppresses or shortens CSS animations to $0.01$ms.

---

## 2. Verification Matrix across all 21 Visualizers & Playgrounds

| # | Exercise | Component | Keyboard Nav (`Tab`/`Enter`/`Space`) | Visible Focus (`:focus-visible`) | Non-Color State Symbols | Screen Reader (`aria-label`/`role`) | Verified Status |
|---|---|---|---|---|---|---|---|
| 1 | N-Queens | `NQueensBoard` + `Playground` | Yes (`tabIndex={0}`, Enter/Space) | Yes (`outline: 2px solid`) | Crown glyph `♛`, ray line | `aria-label="Fila X, Col Y, con reina"` | PASS |
| 2 | Road Antennas | `RoadAntennasPlayground` | Yes (`tabIndex={0}`, Enter/Space) | Yes | Range radius, house icons, antenna badge | `aria-label="Casa en km X, cubierta"` | PASS |
| 3 | Interval Scheduling | `IntervalSchedulingPlayground` | Yes (`tabIndex={0}`, Enter/Space) | Yes | Time labels `[s, f]`, checkmark badges | `aria-pressed`, `role="button"` | PASS |
| 4 | Weighted Interval | `WeightedIntervalVisualizer` | Yes (timeline scrubber + buttons) | Yes | Weight values `$w`, arrow indices | `role="region"`, `aria-label` | PASS |
| 5 | Knapsack (Greedy) | `KnapsackGreedyVisualizer` | Yes (speed + timeline buttons) | Yes | Ratio values `v/w`, capacity meter | `aria-label="Item X"` | PASS |
| 6 | Knapsack (DP) | `KnapsackPlayground` | Yes (`tabIndex={0}`, Enter/Space) | Yes | Weight & Value badges, `🎒 ✓` | `aria-pressed`, `aria-label` | PASS |
| 7 | Merge Sort | `MergeSortVisualizer` | Yes (step controls + keyboard) | Yes | Array indices, partition brackets | `role="region"` | PASS |
| 8 | Inversion Counting | `InversionCountingPlayground` | Yes (number chip buttons) | Yes | Pair count badges, delta badges | `aria-pressed`, `aria-label` | PASS |
| 9 | Peak Finding | `PeakFindingPlayground` | Yes (grid buttons + controls) | Yes | Slope indicators `▲/▼`, peak crown | `role="button"`, `aria-label` | PASS |
| 10 | Huffman Coding | `HuffmanTreeSvg` + `Playground` | Yes (timeline scrubber + controls) | Yes | Branch bits `'0'/'1'`, leaf badges, codeword tags | `role="img"`, `aria-label` | PASS |
| 11 | Graph Coloring | `GraphColoringPlayground` | Yes (`tabIndex={0}`, Enter/Space/Del) | Yes | Conflict pins, color names, vertex IDs | `role="button"`, `aria-label` | PASS |
| 12 | Subset Sum | `SubsetSumPlayground` | Yes (native buttons, Enter/Space) | Yes | Sum target gauge, `chip-sub` text | `aria-pressed`, `aria-label` | PASS |
| 13 | LCS | `LcsPlayground` | Yes (character input fields + buttons) | Yes | Match arrows, common subsequence | `role="region"`, `aria-label` | PASS |
| 14 | Coin Change | `CoinChangePlayground` | Yes (coin selector buttons) | Yes | Coin denomination labels, count tags | `role="button"`, `aria-pressed` | PASS |
| 15 | Juan el Vago | `JuanElVagoPlayground` | Yes (day card buttons) | Yes | Work/Rest tags, cumulative payoff | `role="button"`, `aria-pressed` | PASS |
| 16 | Max Subarray | `MaxSubarrayPlayground` | Yes (slider inputs + buttons) | Yes | Subarray bracket lines, sum indicator | `role="region"`, `aria-label` | PASS |
| 17 | Max Flow | `MaxFlowVisualizer` | Yes (step controls + timeline) | Yes | Flow/Capacity text `f/c`, arrow directions | `role="region"`, `aria-label` | PASS |
| 18 | Linear Programming | `LinearProgrammingPlayground` | Yes (numeric constraints inputs) | Yes | Feasible polygon shade, objective ray | `role="region"`, `aria-label` | PASS |
| 19 | Vertex Cover Approx | `VertexCoverApproxPlayground` | Yes (`tabIndex={0}`, Enter/Space) | Yes | Matching dashed lines, vertex covers | `role="button"`, `aria-pressed` | PASS |
| 20 | Reduction IS -> VC | `ReductionIsVcPlayground` | Yes (`tabIndex={0}`, Enter/Space) | Yes | Dual set tags (IS vs VC), complement pill | `role="button"`, `aria-label` | PASS |
| 21 | Randomized Fair Coin | `RandomizedFairCoinPlayground` | Yes (bias slider + toss button) | Yes | Outcome pairs `(0, 1)`, fair bit tags | `role="region"`, `aria-label` | PASS |

---

## 3. Automated & Manual Test Evidence

1. **CDP Real Browser Verification**: 22 Chromium test cases executed with real user interaction events (`click`, `keydown`, keyboard focus).
2. **Reduced Motion Verification**: Validated in `src/styles/base.css` with zero animation locks under `prefers-reduced-motion`.
3. **Screen Reader Landmarks**: Skip-to-content anchor, `<header>`, `<main id="main-content">`, `<nav>`, `<aside>`, `<footer>`.
