# VISUAL TDA — MASTER ENGINEERING MISSION V11 (Design System Overhaul)

**Version note.** `IA/architect/state.md` shows the repository is already past Mission V9, at `MISSION_V10_HIGH_DEFINITION_GEOMETRY_AND_TYPOGRAPHY_PERFECTION`. This document is V11, continuing from that actual state — not from V6. Everything in V4/V5/V6 that isn't contradicted here still applies. Keep this document short and let the state files, not this file, be what survives a context compaction: `docs/known-issues.md`, `IA/architect/state.md`, `IA/architect/next.md`.

**Before anything else**: `current-audit.md` (dated 2026-09-24) and `questions.md` (still describing 20 exercises at `exercises/n_queens`, `exercises/knapsack_dp` — snake_case, pre-migration) are now stale relative to the real repository. Regenerate both from the actual current state (exercise count, directory names, chunk sizes, gate statuses) before relying on either. Documentation that describes a repository that no longer exists is worse than no documentation — it's actively misleading the next session.

---

## Part 1 — Verify first (short)

Do these four checks before touching design work. Each is either a concrete number already admitted in your own docs, or a specific, different surface than what V10 already fixed — don't assume V10's board-square work covers them.

1. **The admitted 2.36:1 contrast is a real failure, not an acceptable limitation.** `state.md` states the light/dark board square pairing achieves "2.36:1 contrast against light squares." WCAG's floor for non-text UI differentiation is 3:1. Recalculate it for real (don't trust the figure in the doc either) and fix it as part of Part 2 below — not as a one-off patch to that one pair of hex values.

2. **The catalog/exercise-selector squares are a *different* surface than the in-exercise boards.** The human's latest report is specifically: *"no puedo diferenciar los cuadrados de selección de ejercicio con el fondo"* — the category/exercise picker in the catalog view, not N-Queens/Sudoku/Knight's Tour (which V10 already worked on). Audit the catalog/selector components specifically; do not assume the board-geometry work from V10 already covers this.

3. **Button and interactive-control legibility, as its own sweep.** Report: *"voy a 'x' ejercicio y el color se tapa con el fondo, entonces no puedo leer que dice que botón es."* Go through every button/pill/badge/toggle across all 38 exercises in both themes and confirm label text has sufficient contrast against its own background — specifically, not just cards and boards, which is what's been checked so far.

4. **Re-sync the docs named above**, and update `IA/architect/state.md` and `docs/known-issues.md` with what you actually find in checks 1–3 before starting Part 2.

---

## Part 2 — The actual fix: stop hand-picking colors, adopt a real color system

Four rounds of manually tuning individual hex values (22/09, 24/09, V6, V10) have each fixed some things and left others wrong, because hand-picked colors can't guarantee contrast relationships — they can only be checked one pair at a time, which is exactly how a 2.36:1 pairing ships labeled "high-definition." The human has explicitly authorized restructuring, resizing, and recoloring anything, including colors that have been in place since the beginning, in order to actually solve this. Use that authorization. Do not do a fifth round of hand-tuning; change the method.

### 2.1 Adopt a systematic, contrast-guaranteed color scale

Use **Radix Colors** (`npm install @radix-ui/colors`, MIT-licensed, framework-agnostic — plain CSS custom properties, zero React/UI-kit lock-in, so it fits the project's zero-dependency posture). It is a 12-step scale per color, with light and dark versions of every scale, where step 11/12 are *guaranteed* to meet strong contrast against step 2 of the *same* scale. Each step has a fixed, named purpose:

| Step | Role |
|---|---|
| 1 | App background |
| 2 | Subtle/recessed background (cards sit on this, or vice versa — pick one direction and keep it consistent) |
| 3 | Component background, resting |
| 4 | Component background, hover |
| 5 | Component background, pressed/selected |
| 6 | Subtle borders (cards, dividers) |
| 7–8 | Borders on interactive components (7 resting, 8 hover/focus) |
| 9 | Solid/vivid — the main "this is clickable/active" fill, designed for white text on top |
| 10 | Hover state of 9 |
| 11 | Low-contrast text (secondary) |
| 12 | High-contrast text (primary) |

Adopt:
- **Slate** as the neutral/gray scale (the project has already been informally approximating Slate hex values by hand — including at least one value, `#829ab1`, that doesn't correspond to any real Slate step, which is itself a symptom of hand-picking instead of using the real scale). Replace every hand-picked neutral hex with the actual Radix Slate step it's closest to, both light and dark.
- **One accent scale** for primary interactive elements (links, primary buttons, the active/selected state) — Blue or Indigo. Both read as serious and technical (the same family GitHub, Linear, Stripe and Vercel use for exactly that reason), which fits a 3rd/4th-year engineering tool better than anything warmer or more playful.
- **Semantic scales for algorithm state**, each a real Radix scale, not a hand-mixed hex:
  - **Green/Grass** — success, optimal, completed, accepted.
  - **Red/Tomato** — conflict, invalid, rejected, failed test.
  - **Amber** — active/current/under consideration (the "the algorithm is looking at this right now" state).
  - **Slate (neutral)** — default/unvisited/inactive.

Every one of these ships with both a light and a dark version with the same step numbers, so the light/dark bug class this project keeps re-encountering stops being possible by construction — the next person adding an exercise picks "Green step 9" and gets a value that's already contrast-correct in both themes, instead of inventing a new hex pair that has to be independently checked.

### 2.2 Non-color reinforcement, unchanged principle

Every semantic state above still needs a second cue beyond color (border style, icon, position, text label) for colorblind/low-vision users — this was already a stated project principle; the recurring color-only bugs mean it hasn't been consistently applied. Re-audit all visualizers for this once the new tokens are in place, not before — fixing the actual colors first means you're not re-auditing something you're about to replace anyway.

### 2.3 Typography

The Inter (UI) + JetBrains Mono/Fira Code (code) pairing already adopted in V10 is a good, well-regarded choice for a technical product — keep it. Verify it's actually applied consistently everywhere now that the color system is being redone at the same time (a parallel pass across all components is the right moment to catch drift in both at once).

### 2.4 Scope of the restructure

Explicit from the human: resizing cells/boards, changing spacing, and replacing colors that have existed since the start are all in scope if that's what it takes to look right. Don't preserve a visual decision for continuity's sake if the new system calls for something different — consistency with the new token system matters more than consistency with what was there before.

---

## 3. Verification, so this doesn't need a round 5

1. Rebuild the contrast-check script (or extend the one from `tests/contrastAndDesignSystem.test.ts`) to assert against the actual Radix step values now in use, for every semantic pairing, in both themes — not a sample.
2. Real-Chromium screenshots of all 38 exercises in **both** themes — light mode specifically, since that's the theme every round so far has under-verified. Look at them; don't just confirm the script produced them.
3. Update `docs/visual-design-system.md` to name the actual adopted scales (Slate / Blue-or-Indigo / Green / Red / Amber) and which step is used for which semantic role, so the mapping in section 2.1 is the enforceable standard, not just this document's suggestion.
4. Record the before/after contrast numbers for the board-square pairing and the catalog-selector pairing specifically, since those are the two the human named directly.

---

## 4. Order of work

Part 1 (all four checks) → 2.1 (adopt the scales, migrate neutrals, migrate semantics) → 2.2 (non-color re-audit) → 2.3 (typography consistency pass) → Part 3 (verification). Autonomous operation per V4 §63 still applies — don't stop for approval between these steps.

Begin now. Only the literal word `STOP` ends the mission; follow the established STOP protocol (V4 §112) when it arrives.

