# Visual TDA — Master Engineering Mission V11 Roadmap & Next Steps

This document defines the operational roadmap for **Mission V11: Systematic Design System Overhaul**.

---

## 1. Execution Order & Status (Mission V11)

1. ✅ **Part 1 — Verification Sweep**:
   - Board square contrast recalculation: legacy 2.364:1 documented and eliminated.
   - Catalog exercise selector squares vs background: 1.096:1 contrast fixed via card surface elevation, 1.5px borders, and shadows.
   - Button and interactive control legibility sweep: resolved button fills, contrast ratios, and pill badges.
   - Documentation re-sync: `questions.md`, `current-audit.md`, `known-issues.md`, `state.md`.
2. ✅ **Part 2 — Systematic Color System Migration (@radix-ui/colors)**:
   - **2.1 Adopt Radix Scales**:
     - Installed `@radix-ui/colors`.
     - Slate: steps 1–12 (Light & Dark) for neutrals, backgrounds, surfaces, borders, text, and board cells.
     - Indigo: steps 1–12 (Light & Dark) for accent, primary interactive, focus rings.
     - Grass: steps 1–12 (Light & Dark) for success, optimal, completed, accepted.
     - Tomato: steps 1–12 (Light & Dark) for error, conflict, invalid, rejected.
     - Amber: steps 1–12 (Light & Dark) for active, current, evaluating, candidate rays.
   - **2.2 Non-Color Reinforcement Re-Audit**:
     - Candidate trajectory rays with high-contrast backing halos for Knight's Tour.
     - Bold 3.5px grid demarcations for Sudoku 3x3 blocks.
     - Visible edge strokes (2.5px solid) for graph algorithms.
     - Pill badges with borders for cell values and sequence indices.
   - **2.3 Typography Consistency Pass**:
     - Inter for UI, JetBrains Mono / Fira Code with `tabular-nums` for code and numbers across all components.
   - **2.4 Board & Card Geometry Adjustments**:
     - Card elevation, outer bezels, and enhanced cell differentiation.
3. ✅ **Part 3 — Verification**:
   - Automated contrast test suite assertions against real Radix steps (`tests/contrastAndDesignSystem.test.ts` - 9/9 passing).
   - Real-Chromium screenshot verification across all 38 exercises in both Light and Dark themes (`dist-qa-screenshots/v11/`).
   - Updated `docs/visual-design-system.md` with enforceable step mappings and empirical contrast metrics.
   - Recorded before/after contrast measurements in `docs/visual-design-system.md` and `docs/known-issues.md`.
4. ✅ **Part 4 — Full Curriculum Pedagogical Completeness & Theory Foundations**:
   - Audited and standardized all 37 exercise `theory.md` files (38 registered exercises).
   - Upgraded 16 exercises from legacy markdown to canonical numbered sections `## 1.`, `## 2.`, etc., activating `TheoryMarkdown.tsx` badges (`01`, `02`) and callout boxes.
   - Verified that 100% of exercises feature formal problem definitions, mathematical proofs/invariants, asymptotic complexity analysis, and naive intuition traps with concrete counterexamples.
   - Added automated regression suite in `tests/exerciseContent.test.ts` enforcing these academic standards continuously.
5. ✅ **Part 5 — Light Mode Contrast Separation, Card Stars & Interactive Bug Sweep**:
   - Light mode depth hierarchy: `--bg` set to `#d8dce6` (cool slate desk canvas, lightness 86%), providing a distinct 1.37:1 ratio against pure white cards (`--surface: #ffffff`) with 11.9:1 text contrast and zero card blending. Recessed workbench canvas inside exercises set to `--canvas-bg: #eaedf4`.
   - Card header realignment: single-row header with `#num` and category left, zero overflow; footer bar with `Dificultad ★★★★☆` on the left directly adjacent, and status badge (`[Explorando]`, `[Completado]`, etc.) on the right side of the footer bar.
   - Knight's Tour unsolvable 4x4 options removed.
   - Weighted Interval hover thrashing bug fixed via locked 56px predecessor container and styled inline code.
   - Universal bilingual coverage: all aria-labels, buttons, chart labels, and playground legends verified in both Spanish and English.
6. ✅ **Part 6 — Road Antennas Label Staggering & Universal Selection Controls Polish**:
   - Road Antennas yellow cursor number superposition eliminated during pointer drag with active halo ring.
   - 1D greedy interval coloring for nearby house km labels within 38px, eliminating all text collisions with dashed leader lines.
   - Header language/theme selectors and board size selectors migrated to high-definition `.segmented-control` pills.
   - Typography inheritance and custom SVG chevrons for all native `<select>` fallbacks.
7. ✅ **Part 7 — Universal Speed Controls Migration to Segmented Pills & Header Stars Harmonization**:
   - Replaced legacy `<select>` playback speed dropdowns across 13 visualizers (`road-antennas`, `coin-change`, `juan-el-vago`, `lcs`, `linear-programming`, `max-subarray`, `peak-finding`, `randomized-fair-coin`, `reduction-is-vc`, `subset-sum`, `vertex-cover-approx`, `weighted-interval-scheduling`, and `graph-coloring`) with modern, accessible `.segmented-control` button pills.
   - Polished `.speed-btn` and `.btn-speed` in `App.css` with solid `var(--surface)` resting background and smooth hover/active states, eliminating native browser white rectangles.
   - Harmonized difficulty display in `ExerciseView.tsx` by replacing raw text tags with the exact unified SVG 5-star rating system from `ExerciseCard.tsx`.



---

## 2. Quality Gates Baseline

- `npm run lint`: 0 errors, 0 warnings.
- `npm run typecheck`: 0 errors.
- `npm test`: 47 test files, 368 tests (100% PASS).
- `npm run build`: static production build in `dist/` cleanly generated in ~1.65s.

