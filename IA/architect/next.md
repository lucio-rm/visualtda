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

---

## 2. Quality Gates Baseline

- `npm run lint`: 0 errors, 0 warnings.
- `npm run typecheck`: 0 errors.
- `npm test`: 47 test files, 367 tests (100% PASS).
- `npm run build`: static production build in `dist/`.
