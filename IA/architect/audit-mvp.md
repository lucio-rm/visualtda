# Visual TDA — MVP Audit Report (Comprehensive Independent Audit)

**Date**: 2026-09-19  
**Auditor**: Antigravity Orchestrator (Phase A Full Audit)  
**Target Worktree**: `/home/lucio_romero_m/Documents/romerom_tardos_kleinberg/vs_tda/visual_tda-antigravity` (`agent/antigravity`)  
**Baseline Commit**: `f58a453`  
**Toolchain Status**: Lint: PASS (0 errors) | Typecheck: PASS (0 errors) | Vitest: 31/31 files, 184/184 tests PASS | Build: PASS (dist generated)

---

## 1. Current Architecture

Visual TDA is designed as a **purely static, client-side educational Single Page Application (SPA)** built with:
- **Framework & Language**: React 19 + TypeScript 5.7 + Vite 6.1.
- **Styling**: Pure CSS with CSS variables and design tokens (`src/styles/variables.css`, `src/styles/base.css`), zero UI framework dependencies.
- **Client-Side Algorithm Execution**: Pyodide (Python 3.12 WebAssembly) running inside a dedicated Web Worker (`src/runtime/pyodideWorker.ts`) via message passing (`workerProtocol.ts`), controlled by `pythonExecutionService.ts` with a 5-second execution watchdog.
- **Domain Decoupling Layer**:
  $$\text{Algorithm Model} \longrightarrow \text{Trace Events (JSON)} \longrightarrow \text{Visualizer (React)} \longrightarrow \text{3-Phase UX}$$
- **Exercise Delivery**:
  - `Discover` (*Descubrir*): Narrative intuition + interactive visual sandbox (playground).
  - `Solve` (*Resolver*): Problem definition, 3-level progressive hints, in-browser Python editor, Pyodide test runner.
  - `Understand` (*Comprender*): Canonical solution, step-by-step trace timeline (`useTraceTimeline`), asymptotic time/space analysis, and formal correctness proofs (invariants, exchange arguments).

---

## 2. What Actually Works (Empirically Verified)

1. **Static Build & Packaging**: `npm run build` succeeds deterministically, emitting purely static assets (`dist/index.html`, JS chunks, CSS) deployable to Cloudflare Pages or GitHub Pages without server dependencies.
2. **Deterministic Trace Playback**: 20 algorithmic visualizers render step-by-step state transitions deterministically from TypeScript trace engines without React or DOM coupling.
3. **Trace Timeline Controller**: `useTraceTimeline` provides working play/pause, step forward/backward, scrubber slider, speed multiplier (0.5x, 1x, 2x), and keyboard shortcuts (`ArrowLeft`, `ArrowRight`, `Space`/`k`, `r`).
4. **Bilingual Internationalization**: `LanguageProvider` and `useLanguage` support real-time toggling between Spanish (`es`) and English (`en`) for headers, catalog, phases, and navigation.
5. **Theme Switching**: Dark / Light / System theme toggling works via `data-theme` on `<html>` with CSS variables.
6. **Student Code Execution Sandboxing**: Pyodide runs inside a Web Worker thread, meaning Python code has zero direct access to the DOM or parent `window`.
7. **Timeout Watchdog**: 5000ms watchdog forcibly terminates and recreates stuck workers on infinite loops.
8. **TypeScript Validators**: 20 pure TypeScript validators verify student outputs independently from visualizers, with descriptive feedback messages.
9. **Interactive Playgrounds**: 18 Discover playgrounds provide interactive manipulation (e.g. placing queens, selecting intervals, building trees, dragging sliders, running custom trials).
10. **Zero External CSS/Component Dependencies**: Zero Tailwind, Redux, Zustand, React Router, or Monaco bloat; lightweight, fast initial paint.

---

## 3. What is Only Partially Implemented

1. **Pyodide Worker Error & DoS Hardening**:
   - String interpolation was hardened in `f58a453`, but unhandled `BaseException` (e.g. `sys.exit()`) and excessive stdout memory allocation (>64KB) are not yet constrained.
   - Worker termination on timeout does not cleanly reject other queued callbacks in `pythonExecutionService.pendingCallbacks`.
2. **Code Splitting & Bundle Modularity**:
   - `vite.config.ts` has zero manual chunking or dynamic imports.
   - All 20 visualizers and playgrounds are imported synchronously in `App.tsx`, producing a single **717 KB** JS bundle (exceeding Vite's 500 KB advisory).
3. **Reduced-Motion Integration in Visualizers**:
   - Global `@media (prefers-reduced-motion: reduce)` was added to `base.css`, but individual SVG animations and canvas transitions in components have not all been tested for reduced-motion compliance.
4. **Keyboard Accessibility on Visual Elements**:
   - Only 3 visualizer components currently expose explicit `tabIndex={0}` and ARIA keyboard interaction. Most rely solely on mouse clicks.
5. **Phase Unlock Flow**:
   - Student can skip directly to "Understand" via skip modal, but progress is not persisted across browser refreshes (`localStorage` is only used for theme).

---

## 4. What is Claimed but Unverified

1. **"Usable under 100+ Concurrent Students"**:
   - Claimed because the site is static, but Pyodide CDN download (~15-25MB on first execution) could saturate school/university lab networks if 100 machines pull simultaneously from JSDelivr without local caching.
2. **"Strict Separation of Exercise Modules"**:
   - Claimed in architectural docs, but in reality, adding any exercise requires modifying **4 giant God Files** (`App.tsx`, `exerciseContent.ts`, `pythonTestRunner.ts`, `registry.ts`).
3. **"Algorithm Correctness Tested"**:
   - 184 tests pass, but the validators currently compare against hardcoded expected values or the algorithm's own DP formulation. There are **zero independent brute-force oracles** or property-based adversarial fuzz tests to verify optimality independently.
4. **"Full Multi-Device Responsive UI"**:
   - Claimed in CSS, but mobile viewports (390px) on complex 2D DP matrices (LCS, Knapsack) and large graphs have not been verified via automated viewport/screenshot QA.

---

## 5. Architecture Risks

1. **The Four God Files (Violation of Open/Closed Principle)**:
   - `src/app/App.tsx` (1,344 lines): Contains inline Python constants, pseudocode constants, correctness strings, and a 20-branch `if (selectedExercise.id === '...')` ladder.
   - `src/engine/exerciseContent.ts` (1,874 lines): Giant mapping of starter code, hints, and test runners.
   - `src/runtime/pythonTestRunner.ts` (1,357 lines): Giant 20-branch `switch(exerciseId)`.
   - `src/engine/registry.ts` (441 lines): Central registry array.
   *Risk*: High friction and merge conflict probability when multiple developers/agents add exercises.
2. **Duplication Between `exercises/<id>/` and `App.tsx`**:
   - Standalone files (`solution.py`, `pseudocode.md`, `theory.md`) exist in `exercises/`, but `App.tsx` duplicates them as inline TypeScript string literals. If an algorithm is updated in one place, the other goes out of sync.
3. **Monolithic Bundle Risk**:
   - As exercises grow from 20 to 50+, the synchronous single bundle will swell past 2 MB, hurting mobile students on cellular connections.

---

## 6. Security Risks

1. **Pyodide Worker Denial of Service (DoS)**:
   - Infinite print loop (`while True: print("x")`) can allocate hundreds of megabytes in `StringIO` before the 5000ms watchdog fires, potentially crashing the worker process or browser tab.
2. **BaseException Handling**:
   - Python `sys.exit()` raises `SystemExit` (inherits from `BaseException`, not `Exception`), bypassing standard `try...except Exception:` blocks.
3. **JSON Serialization Failures**:
   - If student code returns circular references, generator objects, or functions, `json.dumps()` in Python throws `TypeError` which can cause ungraceful crash reporting.
4. **Network Access from Worker**:
   - Pyodide in Web Worker can technically invoke `fetch()` or `pyodide.http.open_url()`. No Content Security Policy (CSP) header is currently declared in `index.html`.
5. **Supply Chain Vulnerability**:
   - `vitest@3.0.6` pulls `@vitest/mocker` with moderate CVE (Path Traversal via mock redirect). Dev-only, does not affect production bundle, but must be managed.

---

## 7. Performance Risks

1. **Initial Bundle Size**: 717.66 KB uncompressed JS / 207.50 KB gzip. Vite warns on chunks > 500 KB.
2. **Pyodide Download Spike**: 15–25 MB WebAssembly runtime downloaded over CDN when first entering the Solve phase. If a classroom with 100 students clicks "Resolver" simultaneously, local bandwidth may choke.
3. **Re-rendering in Large Visualizers**:
   - DP tables with $100 \times 100$ cells re-render completely on each trace step if cells are not memoized (`React.memo` or SVG virtualisation).

---

## 8. Accessibility Risks

1. **Missing Keyboard Controls on Visualizers**:
   - Graph nodes (Vertex Cover, Max Flow) and interactive road antennas only respond to `onClick`, with no `onKeyDown` (Enter/Space) handlers or `tabIndex={0}`.
2. **Color-Only State Indication**:
   - Several visualizers rely on green/red/orange background highlights to signal valid/invalid/conflict states without accompanying icons, distinct patterns, or ARIA text for color-blind users (violating WCAG 1.4.1).
3. **Missing Skip-to-Content Link**: (Fixed in `f58a453`).
4. **Missing Reduced Motion Support**: (Fixed in `f58a453`).

---

## 9. UX Risks

1. **Loss of Student Code on Accidental Navigation**:
   - If a student writes code in `SolveView` and clicks "Volver al catálogo" or switches exercises, their code is not persisted to `sessionStorage` or `localStorage`. Work is lost.
2. **No Visual Test Progress Indicator**:
   - When running 5 test cases, the UI displays "Ejecutando..." with a spinner, but does not display incremental per-test completion until all tests finish or timeout.
3. **Mathematical Formula Rendering**:
   - Theory sections contain raw LaTeX strings (e.g. `$\text{OPT}(j) = \max(...)`) rendered as plain text because no math renderer (KaTeX) is loaded. While fast, complex formulas can look cluttered.

---

## 10. Testing Gaps

1. **Zero Browser / E2E Tests**:
   - No Playwright, Cypress, or happy-dom integration tests verify real browser rendering, button clicks, tab transitions, or DOM updates.
2. **Zero Independent Oracles**:
   - Validators assume their own algorithm logic is correct. No independent brute-force solver or independent mathematical library checks that the solutions are truly optimal.
3. **No Adversarial / Property-Based Tests**:
   - Tests only run 4–10 fixed fixtures per exercise. No fuzzing with randomized inputs, negative edge cases, empty structures, or extreme inputs.
4. **Pyodide Tests Run with Mocks Only**:
   - `pythonExecution.test.ts` mocks the worker; actual in-worker Pyodide execution is never tested in CI because Node.js does not run Vite module web workers natively without extra polyfills.

---

## 11. Deployment Risks

1. **Zero CI Deployment Verification**:
   - GitHub Actions workflow runs `build`, but does not test serving `dist/` or deploying to a preview environment.
2. **Missing Content Security Policy (CSP)**:
   - `index.html` has no CSP meta tag restricting scripts, connect-src, or worker-src.
3. **CDN Dependency on jsDelivr**:
   - If `cdn.jsdelivr.net` is blocked by university firewall or experiences downtime, Pyodide execution fails completely.

---

## 12. Dependency Risks

| Package | Status | Role | Risk Level |
|---------|--------|------|------------|
| `react` / `react-dom` (19.0.0) | Production | Core UI framework | Minimal (Standard) |
| `vite` (6.1.1) | Dev | Build toolchain | Minimal |
| `typescript` (5.7.3) | Dev | Typechecker | Minimal |
| `eslint` (9.20.1) | Dev | Linter | Minimal |
| `vitest` (3.0.6) | Dev | Test runner | Low (moderate CVE in dev mocker) |

*Assessment*: Exemplary dependency minimalism. Zero third-party runtime dependencies beyond React 19.

---

## 13. Content-Quality Risks

1. **Curriculum Balance**:
   - Dynamic Programming (5 exercises) and Greedy (4 exercises) are well-covered.
   - Divide and Conquer has 4 exercises.
   - Approximation, Linear Programming, and Randomized algorithms only have 1 introductory exercise each.
2. **Pedagogical Explanation Depth**:
   - Correctness explanations are high quality (CLRS / Kleinberg-Tardos standard), but some hint levels are too abrupt (jumping from high-level clue to direct formula).

---

## 14. Technical Debt

1. **God Files**: `App.tsx` (1344 lines), `exerciseContent.ts` (1874 lines), `pythonTestRunner.ts` (1357 lines).
2. **Synchronous Visualizer Imports**: All visualizer CSS and TSX bundled into root chunk.
3. **Duplicated Python Code**: `exercises/<id>/solution.py` duplicated inside `App.tsx` string constants.
4. **Architectural Questions Unresolved**: Q-001 through Q-004 marked "OPEN" in `questions.md` despite being implemented in code.

---

## 15. Recommended Priorities & Action Plan

| Phase | Focus | Key Actions |
|-------|-------|-------------|
| **Phase A** (Current) | Audit & Governance | Complete `audit-mvp.md`, create `docs/security.md`, `docs/quality-gates.md`, resolve Q-001..Q-004 with ADRs. |
| **Phase B** | Critical Security & DoS Hardening | Harden Pyodide worker (`BaseException`, 64KB stdout limit, JSON error guards, worker callback cleanup). |
| **Phase C** | Testing Infrastructure | Build independent brute-force reference oracles for optimization problems; add property/adversarial test suites. |
| **Phase D** | Browser & User Journey Verification | Implement 15-flow user journey integration test suite testing all phases, navigation, and feedback. |
| **Phase E** | Accessibility & UX Polish | Add student code session persistence, keyboard focus on interactive visualizers, WCAG color contrast checks. |
| **Phase F** | Performance & Code Splitting | Configure lazy loading for visualizers and optimize chunking to bring main bundle under 500 KB. |
| **Phase G** | Architecture Cleanup | Data-driven exercise registration to eliminate God File branching safely without breaking tests. |
| **Phase H** | Curriculum Quality Gate | Verify all 20 exercises against FIUBA / Kleinberg-Tardos academic rigor. |
| **Phase I** | Next Fundamental Exercise | Implement next high-value starred exercise (e.g. Backtracking Graph Coloring / Knight's Tour). |
