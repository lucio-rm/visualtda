# VISUAL TDA — MASTER ENGINEERING MISSION V6 (Priority Correction Sprint)

**Format note — read this first.** V3, V4 and V5 already cover architecture, pedagogy, tone and process in real depth, and all of it remains in force. This document does not restate it. It is deliberately short, for a specific reason: across the 22/09–25/09 sessions, V4 and V5 (well over 1000 lines each) repeatedly fell victim to `Conversation compacted` events, after which you had to `grep`/`sed` the prompt file back into context in fragments instead of holding it whole. A short, sharply prioritized list that fits in context without fragmenting will get executed more completely than a longer one. Keep this pattern going forward: shorter missions, more frequent STOPs, and the state files below as the real memory — not an ever-growing prompt file.

## 0. If you lose context mid-session

Read, in this order: `docs/known-issues.md`, `IA/architect/state.md`, `IA/architect/next.md`. That is the source of truth for what's actually done. Do not reconstruct it by re-reading V4/V5 piece by piece.

## 1. Today's ground-truth defects

These came from the human's own testing just now, against a repository that already reports 37/37 visualizers, 293 tests, and all quality gates passing. Treat the size of that gap as the most important signal in this document — it means verification is still missing things a few minutes of real use finds immediately. Work in this order:

### 1.1 Browser autocomplete is surfacing full solutions in the code editor
**Report**: the Solve-phase editor offers an autocomplete suggestion containing a complete solution.
**Near-certain cause**: the Python `<textarea>` in `SolveView.tsx` doesn't disable native browser form autofill. Once any full/correct code has ever been typed into a similarly-shaped field in that browser profile — by you, by the browser-QA script, or by a student — the browser can resurface it as a suggestion on *any* exercise, because autocomplete is keyed by field heuristics, not your app's routing.
**Fix**: set `autoComplete="off"` on the textarea; some browsers still ignore that for freeform text areas, so also ensure the field has no stable `name`/`id` that persists meaningfully across exercises, and keep `spellCheck={false}`. **Verify properly**: type a full correct solution in one exercise, reload, open a *different* exercise's Solve phase, and confirm nothing suggests on the first few keystrokes. This is a browser-chrome behavior, not pure app logic — it's not meaningfully unit-testable, so record the manual check itself as a permanent QA step in `docs/known-issues.md`, not just the fix.

### 1.2 Numbers displayed somewhere are wrong
No specific exercise was named, so this needs a sweep, not a guess. For every exercise, compare every number the UI shows (counts, costs, displayed complexities, matrix values, item totals) against what the trace/validator actually computed, for at least a small and a larger instance. Fix real mismatches and add a regression assertion for each. Where an exercise checks out clean, say so in `docs/known-issues.md` so a future session doesn't start this sweep from zero.

### 1.3 "Understand" phase: badly imbalanced two-column layout
**Report**: one column nearly full, the other about 1/8 full — reads as broken.
Check `UnderstandView.tsx` / the relevant CSS grid against several exercises with *short* theory text specifically (N-Queens likely has enough content to hide this). Don't force visual balance with padding. Either collapse to a single column below a content/width threshold, or — matching the pattern already used for Discover (§17) — fill the shorter column with genuinely useful content (applications, a counterexample, "what changes if…") instead of decoration. Check at least 5 exercises spanning different content lengths, not one.

### 1.4 Light mode: states still aren't distinguishable
This has already been "fixed" twice (22/09, 24/09), and the human is still hitting it — meaning the fixes were partial, not systemic. Most likely they covered the original 21 exercises' shared tokens but not the 16 added later, or the 22 playgrounds rewritten on 25/09. Do it properly, once:
1. Write a small script that finds every `var(--color-*)`/`var(--state-*)` foreground/background pairing actually used in the codebase, computes WCAG contrast against `[data-theme="light"]`, and fails on anything under 4.5:1 (text) / 3:1 (graphical/UI). Fix every failure it finds — not a sample.
2. Then do what that script can't: open all 37 exercises in light mode in the real-Chromium run and actually look at the screenshots for *relative* differentiation — filled vs. empty cell, selected vs. unselected, visited vs. unvisited. Same color on neighboring states is the recurring failure mode here, and contrast-vs-background alone won't catch it.
3. `docs/visual-design-system.md` already names canonical semantic tokens (normal/active/candidate/selected/rejected/conflict/solution/visited/pruned). Audit that every visualizer actually uses them instead of ad hoc hex values — the recurrence of this exact bug points at hardcoded colors somewhere, not a missing design system.

### 1.5 Spanish identifiers in code
Project convention since session 1 is English identifiers, bilingual UI copy. Grep `exercises/*/solution.py` and `src/**/*.ts(x)` for Spanish words used as variable/function names (`reina`, `tablero`, `resolver`, `mochila`, `camino`, `nodo`, `arbol`, `cola`, `pila`, etc. — as identifiers, not as translated UI strings, which are correctly bilingual). Most likely concentrated in exercises added after the original 21, which got less individual scrutiny. Fix identifiers only; leave UI-facing translated strings alone.

### 1.6 Title / heading spacing inconsistency
Some titles/headings have inconsistent spacing around separators or words. Find the actual source (likely a title-construction/formatting helper) rather than patching strings one at a time.

### 1.7 Editor and selection UX
Re-verify the full V4 §19 checklist (indentation, Tab, Enter-preserves-indent, selection, scrolling) against the *current* editor, not against what was true when V4 was written — it has changed since (line-number gutter added 24/09). Confirm each item in a real browser, not by reading the code. Separately: the 25/09 session added pointer-drag interaction to ~22 playgrounds (`onPointerDown`-based). Dragging and clean single-click selection commonly conflict on the same element without a movement threshold — check whether the new drag handlers broke plain clicking/selecting on any of those playgrounds.

### 1.8 Visualizers should be bigger
Increase default SVG canvas size across visualizers. Pair with the above-the-fold work from V5 (§20–21): bigger, but still visible without scrolling at 1366×768/1440×900 where both can be true. Where they conflict, prioritize a legible canvas over fitting everything above the fold.

## 2. The real gap behind "irrompible": data, not just UI state

The human wants the Instructor Mode gate to be unbreakable. Stay honest about what's actually achievable client-side (V4 §86 already says this correctly) — but there is one concrete, specific gap still open here, separate from the authentication work already done and already tested:

The SHA-256/signed-token system protects the *application's UI state* — it stops someone from flipping `isInstructorMode`/`solutionUnlocked` to `true` in DevTools and having the app believe them. It does **not** protect the *data*. Verify whether `canonicalPython` strings are still present as plain readable text in the built JS bundle (very likely yes — they're loaded via `?raw` imports at build time, into what is now a ~348KB chunk). If so, any student can read every solution straight from the Network tab or an unzipped `dist/`, with no password-guessing and no DevTools state manipulation at all — a far lower bar than the one currently defended against.

If confirmed, fix it: encrypt the canonical solution payloads (e.g. AES-GCM via the browser's native `SubtleCrypto`) with a key derived from the instructor password through a real KDF (PBKDF2/scrypt-style, not the raw password), so the bundle only ever contains ciphertext; decrypt in memory only after a correct password or a legitimate test-pass token. This is still not "irrompible" — an offline brute-force of an 8-character password against the ciphertext is always possible once someone has both — but it's a genuine improvement over the status quo, and it's the honest next step rather than redoing the UI gate. Document exactly what this does and doesn't cover in `docs/security.md`, same honest register V4 already established there.

## 3. Verify, don't re-assert, for everything added since the original 21

Catalog growth (21 → 37 exercises) and the 25/09 drag-and-drop rewrite of ~22 playgrounds are exactly the conditions under which earlier verification silently stops covering new work. Re-check and log results — don't just restate "100%":

- **Independent oracles (G11)**: the original 21 exercises have brute-force oracles in `tests/oracles/referenceSolvers.ts`. The 16 added later are covered by `extendedTraces.test.ts`'s trace-invariant tests — that checks internal consistency, not correctness against an independent ground truth. Confirm which of the 16 actually have a true independent oracle and close the gap for any that don't.
- **Keyboard access on the new drag interactions**: the accessibility rollout (role/aria-label/tabIndex across 36 visualizers) happened *before* the 25/09 pointer-drag overhaul. Confirm every new draggable element has a keyboard-operable equivalent (arrow keys on a focused element, or a non-drag input fallback) — don't assume the earlier rollout covers interactions that didn't exist yet.
- **Naming**: confirm the 16 later exercises are kebab-case (they should be, since they came after that migration — verify rather than assume).

## 4. Everything else

Stays governed by V4 and V5 in full: pedagogical philosophy, Discover-phase interactivity, "Caso propio", visualizer-is-not-decoration, 2D-first, tone/terminology, test-description non-leakage, Python purity, Understand-phase structure, complexity explanations, independent-correctness philosophy, trace correctness, architecture principles, git discipline, autonomous operation, and the STOP protocol. Nothing here overrides those — it only reprioritizes what to do right now.

## 5. Order of work

1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → Section 2 → Section 3. Autonomous operation per V4 §63 still applies — don't stop to ask permission between these. Escalate only genuinely irreversible or ambiguous calls to `IA/architect/questions.md` per V4 §110.

Begin now. Only the literal word `STOP` ends the mission; follow the V4 §112 STOP protocol when it arrives.

