# Visual TDA — Current Repository State

- **CURRENT_PHASE**: MISSION_V16_DEPLOYMENT_READINESS
- **CURRENT_TASK**: Completed deployment readiness preparation for custom domain visualtda.ar and static hosting:
  1. **Vite Build Configuration for Root-Domain Deploy (Step 1)**:
     - Configured `base: '/'` explicitly in `vite.config.ts` (matching root domain deploy at `visualtda.ar`).
     - Verified `dist/index.html` asset tags generate absolute root-relative paths (`/assets/*`).
  2. **SPA Routing Architecture Analysis (Step 2)**:
     - The application is strictly single-route (`/` is the only browser URL; all screen transitions, categories, exercises, and pedagogical phases are managed via pure in-page React state).
     - No path-based client-side routing library (e.g. React Router) or `pushState`/`replaceState` is used.
     - Deep-linking or path rewriting is not required for client-side navigation.
  3. **FormSubmit Endpoint & CSP Security Header Audit (Step 3)**:
     - Decoded both obfuscated FormSubmit endpoints in `FeedbackModal.tsx`:
       - Primary: `https://formsubmit.co/ajax/lucioromeromascaro@gmail.com`
       - Secondary: `https://formsubmit.co/ajax/lromerom@fi.uba.ar`
     - Verified no hardcoded `localhost` or origin overrides exist in the submission logic.
     - Identified and resolved critical CSP barrier: `index.html` `<meta http-equiv="Content-Security-Policy">` lacked `https://formsubmit.co` in `connect-src`, causing browser-level network blocking on form submission. Added `https://formsubmit.co` to `connect-src`.
  4. **Codebase Grep for Localhost / Dev-Only Assumptions (Step 4)**:
     - Zero occurrences of `localhost`, `127.0.0.1`, or unencrypted `http://` found in production code (`src/`, `public/`, `index.html`, `vite.config.ts`, `package.json`).
     - Pyodide Web Worker runtime loads from HTTPS CDN `https://cdn.jsdelivr.net` with matching CSP directives.
  5. **Verification & Quality Gates**:
     - All 62 test files and 436 tests passing (100% PASS).
     - `npm run lint` clean (0 errors).
     - `npm run typecheck` clean (0 errors).
     - `npm run build` clean (dist/ built in 1.75s).
     - Ready for Step 5 (live verification) once human deploys to Vercel and activates `visualtda.ar`.

  1. **Audit & Forensics of Mission V12 (1.1–1.12)**:
     - 1.1 Feedback dual-delivery verified via live curl tests to `lucioromeromascaro@gmail.com` and `lromerom@fi.uba.ar` with HTTP 200 / success.
     - 1.2 Blank line / whitespace submission gating systematically verified across all 38 exercises. Fallback Python and Pyodide runner fortified with `isLegitEffort` checks.
     - 1.3 Kruskal / MST direction invariant verified (`tests/minMaxDirectionInvariants.test.ts`).
     - 1.4 Majority Element default view grid layout and flex-wrap verified.
     - 1.5 Dark mode button resting state calibrated to `var(--accent-solid)`.
     - 1.6 Minimize Lateness 1D vertical label staggering and unoccluded inversion pill badge verified.
     - 1.7 Knapsack visual drag-and-drop packing and spacious metric cards verified.
     - 1.8 Sudoku MRV heuristic gating locked until completion or instructor mode verified.
     - 1.9 Hamiltonian Cycle vertex "0" contrast verified.
     - 1.10 Road Antennas Quilmes corridor preset verified.
     - 1.11 P=NP Complexity Emblem and SVG favicon verified.
     - 1.12 DP Recurrence relation self-check mounted and Discover spoilers purged.
  2. **5 Strategic Architectural Pillars**:
     - Pillar 1: Visual Debugging Bridge (`VisualTestFailureInspector.tsx`, pedagogical diagnostics).
     - Pillar 2: Dynamic Custom Input Sandbox (`IntervalSchedulingPlayground.tsx`, bulk JSON/regex parser).
     - Pillar 3: Curriculum Skill Tree / Reduction Graph View (`CurriculumKnowledgeGraph.tsx`, interactive SVG).
     - Pillar 4: Timeline Scrubber with State Keyframes (`TraceScrubber.tsx`, smooth drag seeking).
     - Pillar 5: Offline Academic Portfolio & Solution Export/Import (`portfolioExportImport.ts`, `PortfolioModal.tsx`, global `?` modal).
  3. **10 Platform Perfections**:
     - Perfection 1: Web Audio Acoustic Feedback Engine (`audioFeedback.ts`, pentatonic steps & chimes).
     - Perfection 2: Code Editor Snippet Inserter & Reset Safety with Undo (`SolveView.tsx`).
     - Perfection 3: Mathematical Typography Engine (`mathTypography.ts`, superscripts, subscripts, Unicode math).
     - Perfection 4: Algorithmic Invariant Callout Inspector (`InvariantInspectorCallout.tsx`).
     - Perfection 5: Global Fuzzy Search & Quick Switcher (`QuickSwitcherModal.tsx`, `Cmd+K` / `Ctrl+K`).
     - Perfection 6: Smart Quote & Unicode Normalizer (`codeFormatter.ts`, sanitizes PDF/Word quotes on paste/type).
     - Perfection 7: 1-Click Python Code Beautifier & Indentation Auto-Fixer (`codeFormatter.ts`, `SolveView.tsx`).
     - Perfection 8: Universal Trace Keyboard Playback Hook (`useTraceHotkeys.ts`, `tests/traceHotkeys.test.tsx`).
     - Perfection 9: Invariant Callout Extensions to Knapsack DP (`KnapsackDpVisualizer.tsx`).
     - Perfection 10: Interactive Asymptotic Complexity Sandbox & Growth Rate Comparator (`ComplexityComparatorModal.tsx`, `Header.tsx`, `tests/complexityComparator.test.tsx`).
  4. **Verification**: 62 test files, 436 tests passing (100% PASS), `npm run lint` clean (0 errors), `npm run typecheck` clean (0 errors), `npm run build` static production output clean (1.85s).
  1. **Part 1 Audits & Contrast Verification**:
     - Recalculated chessboard contrast: legacy values yielded 2.364:1 (failing WCAG 3:1 non-text UI minimum).
     - Catalog exercise cards: legacy `#ffffff` on `#f1f5f9` yielded 1.096:1 contrast with invisible borders.
     - Button and interactive control legibility sweep identified low-contrast labels and missing boundaries.
     - Documentation re-synced: `questions.md`, `current-audit.md`, `known-issues.md` (Issue 3.23).
  2. **Part 2 Systematic Color System Migration (@radix-ui/colors)**:
     - Replaced all hand-picked hexes with mathematically calibrated 12-step Radix scales:
       - Slate: steps 1–12 (Light & Dark) for app canvas, surfaces, borders, text, and chessboard cells.
       - Indigo: steps 1–12 (Light & Dark) for primary actions, focus rings, interactive accents.
       - Grass: steps 1–12 (Light & Dark) for success, completed states, optimal solutions.
       - Tomato: steps 1–12 (Light & Dark) for errors, conflicts, invalid moves, rejected candidates.
       - Amber: steps 1–12 (Light & Dark) for current evaluation, candidate paths, warnings.
     - Fixed Light mode solid buttons: `--success-solid: var(--grass-11)` (5.07:1 on white text), `--error-solid: var(--tomato-11)` (4.98:1 on white text).
     - Fixed Dark mode solid buttons: `--success-contrast: #000000` (6.93:1 on `grass-9`), `--error-contrast: #000000` (5.43:1 on `tomato-9`).
     - Fixed Chessboard Squares: Light mode achieves 5.65:1 (`slate-11` vs `slate-2`), Dark mode achieves 3.01:1 (`slate-8` vs `slate-1`).
     - Fixed Chessboard Pieces: Light square piece contrast is 15.58:1; dark square piece contrast is 5.94:1.
     - Fixed Catalog Cards: Elevated crisp surfaces with 1.5px `--slate-7` borders and card shadows on elevated backgrounds.
     - Fixed Sudoku Visualizer: Replaced confusing dark slate block backgrounds with uniform crisp surfaces and bold 3.5px grid demarcations. All numbers achieve $\ge 12:1$ contrast.
     - Fixed Knight's Tour Visualizer: Added prominent dashed Amber trajectory rays with backing halos from the knight to legal candidate cells; numbers wrapped in dedicated surface pills with strong borders ($\ge 15:1$ contrast).
     - Fixed Graph Edges: Replaced faint dashes and low-opacity strokes with solid 2.5px `var(--graph-edge)` across Hamiltonian Cycle, Knapsack B&B, Huffman, LP, etc.
  3. **Part 3 Verification**:
     - Automated test suite `tests/contrastAndDesignSystem.test.ts`: 9/9 passing tests validating WCAG compliance and Radix scale integrity.
     - Test baseline: 47 test files, 367 passed (100% PASS).
     - Full Real-Chromium screenshot sweep across all 38 exercises in both Light and Dark themes (`dist-qa-screenshots/v11/`).
  4. **Part 4 Curriculum Pedagogical Completeness & Theoretical Rigor**:
     - Audited and standardized all 37 exercise `theory.md` files (covering 38 registered exercises).
     - Standardized all exercises to canonical numbered sections `## 1.`, `## 2.`, etc., triggering `TheoryMarkdown.tsx` badges (`01`, `02`) and callout boxes.
     - 100% of exercises now contain:
       1. Formal Problem Definition & Mathematical Modeling ($G=(V, E)$, constraints, objective functions).
       2. Formal Correctness Proofs (Strong induction, loop invariants, greedy exchange arguments, duality).
       3. Step-by-step Asymptotic Complexity Analysis (Time and Space, Master Theorem where applicable).
       4. Naive Heuristic Traps & Concrete Counterexamples (explaining why myopic greedy, depth-first search, or naive rounding fail).
     - Added automated regression tests in `tests/exerciseContent.test.ts` verifying that all 37 exercises contain all 4 files (`pseudocode.md`, `solution.py`, `exercise.json`, `theory.md`) and meet all 4 academic criteria.
   5. **Part 5 Light Mode Hierarchy, Card Header Redesign & Interactive Bug Fixes**:
      - Light mode depth hierarchy: changed app background `--bg` to `#d8dce6` (cool slate desk canvas, lightness 86%), establishing a bold 1.37:1 luminance ratio against pure white cards (`--surface: #ffffff`) with 11.9:1 text contrast and zero card blending. Recessed workbench canvas inside exercises set to `--canvas-bg: #eaedf4`.
      - Card header & difficulty stars: streamlined `.card-top-row` to strictly `#num` + `category` on the left. In the footer, placed `Dificultad` directly adjacent to the 5 stars (`.card-difficulty-group`) and placed the status badge (`[Explorando]`, `[Completado]`, etc.) on the right side of the footer bar, completely eliminating badge wrap and overflow.
      - Knight's Tour preset cleanup: removed mathematically impossible 4×4 board preset (per Schwenk 1991 theorem), preserving 5×5, 6×6, and 8×8 solvable options.
      - Weighted Interval hover fix: locked predecessor function callout to immutable `height: 56px` with `box-sizing: border-box` and inline styled Bellman recurrence `<code>`, completely eliminating the 1-2px expansion on t3, t4, t5.
      - Universal bilingual consistency: localized all remaining `aria-label` attributes, SVG chart labels, and playground legends across all 38 exercises.
   6. **Part 6 Road Antennas Label Staggering & Universal Selection Controls Polish**:
      - Wireless Road Antennas: Conditionally suppressed cursor indicator marker (`<g className="road-cursor-marker">`) whenever dragging a house or antenna (`draggingHouseIdx !== null || draggingAntennaIdx !== null`), completely eliminating the yellow duplicate number under the house label. Added active dashed ring feedback around dragged house.
      - Proximity Staggering: Implemented 1D greedy interval coloring in both `RoadAntennasPlayground.tsx` and `RoadAntennasVisualizer.tsx`. Nearby houses within $38\text{px}$ stagger vertically (left house stays at $y = \text{roadY} - 26$, right house elevates to $y = \text{roadY} - 42$ with a dashed connector leader line to roof), eliminating text collisions.
      - Universal High-Definition Segmented Controls: Replaced raw `<select>` dropdowns in `Header.tsx` (Language: `[ES | EN]`, Theme: `[Auto | Claro | Oscuro]`) and `NQueensPlayground.tsx`/`NQueensVisualizer.tsx` (Board size: `[4×4] [5×5] [6×6] [8×8]`) with accessible, polished `.segmented-control` pills.
      - Form Element Typography: Set `button, select, input, textarea { font-family: inherit; }` in `base.css` and `App.css`. Styled all `<select>` elements with custom SVG chevrons, Radix tokens, and zero white box hover artifacts.
      - Preset Hover States: Decoupled `.btn-preset:hover` from `.btn-preset.active`, ensuring non-active hover uses subtle `--surface-hover` and `--border-hover` without turning stark white or prematurely active.
   7. **Part 7 Universal Speed Controls & Difficulty Stars Harmonization**:
      - Replaced legacy `<select>` playback speed dropdowns across 13 visualizers (`road-antennas`, `coin-change`, `juan-el-vago`, `lcs`, `linear-programming`, `max-subarray`, `peak-finding`, `randomized-fair-coin`, `reduction-is-vc`, `subset-sum`, `vertex-cover-approx`, `weighted-interval-scheduling`, and `graph-coloring`) with modern, accessible `.segmented-control` button pills.
      - Upgraded `.speed-btn` and `.btn-speed` in `App.css` to use solid `var(--surface)` resting background, `var(--surface-hover)` and `var(--border-hover)` on hover, and active accent pills (`var(--accent-solid)`, `var(--accent-contrast)`), completely eliminating browser-native white popover rectangles.
      - Harmonized difficulty display in `ExerciseView.tsx` by replacing raw text tags with the exact unified SVG 5-star rating system from `ExerciseCard.tsx`.
   8. **Part 8 Interaction Stability, Bilingual Copy Purity, Light Mode Elevation, and Author Footer**:
      - Minimize Lateness Drag Stabilization: Fixed 60Hz boundary swap oscillation and banner flashing by decoupling mouse movement from instant state mutations. Implemented stable slot preview and release-commit pointer semantics. Added 1-click arrow buttons (`◀` / `▶`) on sequence chips and ensured high-contrast white text on all job blocks.
      - Road Antennas Cursor & Hit-Test Overhaul: Completely removed the orange cursor marker (`.road-cursor-marker`). Added 32px hit-targets to all houses and added a 1-click house chip removal bar with safety timeouts, preventing accidental additions or deletions.
      - Bilingual Copy Purity: Localized Huffman merged parent text (`+ New Parent` / `+ Nuevo Padre`) and upgraded `SolveView.tsx` with full English starter code function signatures and parameter names across all 38 exercises, backed by backward-compatible aliases and `pyodideWorker` runtime alias resolution.
      - Light Mode Elevation & Text Contrast: Elevated light mode canvas contrast (`--bg: #dbe0ea`) with crisp `#ffffff` cards, distinct borders, embedded difficulty pills, and replaced dark text with high-contrast white text on colored blocks in `IntervalPartitioningVisualizer` and `MinimizeLatenessVisualizer`.
      - Platform Author Footer & Feedback Channel: Replaced legacy license text in footer with `Author — Lucio Romero Mascaró`, link to GitHub profile (`https://github.com/lucio-rm`), and interactive `FeedbackModal` enabling students to submit bug reports and suggestions directly to `lromerom@fi.uba.ar`.
   9. **Part 9 English Starter Codes, Drag Stabilization, Light Mode Card Contrast & Badge Overflow Resolution**:
      - Complete English Starter Codes (`src/engine/content/englishStarterCodes.ts`): Implemented 100% pristine English starter templates across all 37 exercise definitions with academic English docstrings, English parameter names, English comments, and backward-compatible Python aliases. Wired into `SolveView.tsx` with dynamic `useEffect` language switching.
      - Minimize Lateness Drag Stabilization: Decoupled fixed deadline flags ($d_i$) and lateness overdue bars ($+L=...$) from the dragged block group in `MinimizeLatenessPlayground.tsx`. Added `grabOffsetXPx` tracking, `hasDraggedRef` 4px hysteresis, and suppressed the adjacent inversion indicator during dragging, completely eliminating jitter, banner flashing, and subpixel shifts.
      - Road Antennas Label Staggering & Text Knockout: Increased horizontal proximity check to 48px and vertical level offset to 22px (`labelY = roadY - 26 - lvl * 22`). Added SVG knockout halo (`paintOrder: stroke fill, stroke: var(--surface), strokeWidth: 3.5px`) so house labels never collide or blend into leader lines.
      - Card Difficulty Bar & Badge Overflow Resolution: Scaled stars to 11×11px and streamlined `difficulty-label` font size to 0.72rem, providing >50px of breathing room inside `.card-difficulty-bar`. Guaranteed that status badges (`[Explorando]`, `[Completado]`, `[En Pruebas]`, etc.) never overflow or clip against the card boundary.
      - Light Mode Desktop Canvas & Card Distinction: Set desk canvas `--bg: #ccd3de` (78% lightness) vs `#ffffff` cards with 1.5px `#a8b4c6` borders, elevated shadows, and an authoritative top accent band (`border-top: 4px solid var(--accent)`), creating unmistakable visual hierarchy and physical depth.
      - Eliminated Invisible Text: Replaced hardcoded pale yellow (`#fbbf24`, `#fef08a`) in `InversionCountingVisualizer.css` with `var(--warning)`, and fixed pale text tokens in `HuffmanVisualizer.css`.
   10. **Part 10 Privacy Protection, Seamless Feedback, Subtle Optimal Visualizer Baseline, and Editor Vertical Expansion**:
      - Email Privacy & Zero Public Leaks: Fully removed any plaintext references to `lromerom@fi.uba.ar` from all user-facing modal UI, placeholders, and descriptions. Obfuscated FormSubmit delivery endpoint (`atob('aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgvbHJvbWVyb21AZmkudWJhLmFy')`).
      - Seamless In-Page Asynchronous Delivery: Replaced page-exiting `window.location.href = mailto:...` with silent client-side `fetch` POST request with progress indicator (`Enviando...` / `Sending...`) and in-modal confirmation card, keeping the student engaged on the page.
      - Anonymous Feedback Toggle: Added `[ ] Enviar de forma anónima` checkbox that clears and disables the email field, enabling users to submit suggestions anonymously without leaking their email.
      - Footer Attribution Square Button: Removed raw username string `"GitHub: lucio-rm"` from footer link. Redesigned `.footer-gh-link` as a clean 32×32px square button with centered SVG mark linking to `https://github.com/lucio-rm`.
      - Road Antennas Non-Intrusive Optimal Solution: Replaced intrusive 60px-tall green overlay rectangle with an elegant canonical baseline beneath the highway (`roadY + 51`). Renders discrete green brackets `[spanLeft ——— • gKm ——— spanRight]` and vertical alignment guidelines. Houses and user-placed antennas remain 100% visible, clearly highlighting the gap ("la brecha / distancia / km") from the optimal placement.
      - Phase 2 (Solve) Code Editor Vertical Height Expansion: Raised editor wrapper and stage min-height from 420px to 560px (`.solve-editor-column .editor-input-wrapper`, `.solve-editor-column .code-editor-stage`), and increased textarea rows to 24. Eliminates empty whitespace below attempts history on desktop displays.
      - Dedicated Automated Test Suite: Added `tests/feedbackAndFooter.test.tsx` verifying email privacy, anonymous mode toggling, async form submission, and non-intrusive playground baseline.
   11. **Part 11 Filter Headroom, Mathematical Typography Engine, Bilingual Academic Foundations & P=NP Emblem**:
      - Category & Technique Filter Clipping: Adjusted `.section-header` margin and added `padding: 6px 4px;` to `.category-nav`, completely eliminating the 1px ceiling clipping on filter pills across all views.
      - Theoretical Foundations Mathematical Typography Overhaul:
        - Replaced the muddy gray block (`var(--surface-hover)`) in `.theory-block-equation` and `.theory-callout` with clean elevated card surface `var(--surface)`, accent border demarcations, and generous padding (`1.25rem 2rem`).
        - Expanded `.theory-body` container to `max-width: 1080px; width: 100%;` allowing wide multiline equations to breathe without cramped wrapping.
        - Aligned `.theory-section-badge` precisely with the cap-height of `.theory-h2` using `align-items: flex-start` and accent color, preventing baseline drift on multiline headings.
        - Upgraded `formatMathText` in `TheoryMarkdown.tsx` with native Unicode typography: exponential superscripts ($2^j \to 2ʲ, 2^n \to 2ⁿ, 2^{j+1} \to 2ʲ⁺¹$), variable indices ($c_1 \to c₁, c_2 \to c₂, x_j \to xⱼ, w_i \to wᵢ, g_i \to gᵢ$), bounded summations ($\sum_{j=1}^n \to ∑ⱼ₌₁ⁿ, \sum_{i=0}^{n-1} \to ∑ᵢ₌₀ⁿ⁻¹$), piecewise case formatting, and unnesting of `\text`, `\mathbf`, and `\mathbb`.
        - Wrapped equation contents in `.theory-block-equation-inner` (`display: inline-block; text-align: left`) to guarantee that multiline equations, piecewise cases, and aligned systems remain centered on the page while their internal lines and columns align to the left.
      - Bilingual Theoretical Foundations Engine:
        - Created `src/engine/content/englishTheoryContent.ts` providing 100% fluent, rigorous English theory overrides for core exercises (`merge-sort`, `knapsack-dp`, `coin-change-dp`, `juan-el-vago`, `huffman-coding-greedy`, `n-queens`, `interval-scheduling`, `road-antennas-greedy`, `linear-programming`).
        - Wired `TheoryMarkdown` to route between English overrides and automated academic translation with mathematical keyword localization (`Maximize`, `Subject to`, `if`, `or`).
      - Header Complexity Emblem:
        - Replaced the legacy 3-vertex triangle icon in `Header.tsx` with a tailored $P \stackrel{?}{=} NP$ complexity emblem SVG.
   12. **Quality Baseline & Full Codebase Verification**:
      - Complete systematic verification of Parts 1–12 against live implementation files, verifying contract compliance across all 38 exercises.
      - `npm run lint`: 0 errors, 0 warnings.
      - `npm run typecheck`: 0 errors.
      - `npm test`: 48 test files, 375 passed (100% PASS).
      - `npm run build`: static production build cleanly generated in `dist/` with zero warnings.
