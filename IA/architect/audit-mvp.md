# Visual TDA — MVP Audit Report

**Date**: 2026-09-19
**Auditor**: Antigravity Agent (Audit Phase A)
**Baseline**: commit `3878099` on `agent/antigravity`
**Verification**: lint ✅, typecheck ✅, 184/184 tests ✅, build ✅

---

## 1. Architecture Quality

### 1.1 God Files (CRITICAL)

The platform violates **P2 (Single Responsibility)** and **P5 (Data Over Branching)** with 4 centralized files that must ALL be edited to add any exercise:

| File | Lines | Issue |
|------|-------|-------|
| `src/app/App.tsx` | 1,344 | 21× `if (selectedExercise.id === '...')` chain, 20+ inline Python/pseudocode constants |
| `src/engine/exerciseContent.ts` | 1,874 | Giant `Record` with starter code, hints, and `runTests` per exercise |
| `src/runtime/pythonTestRunner.ts` | 1,357 | 21-branch `switch(exerciseId)` with validation logic |
| `src/engine/registry.ts` | 441 | Central `EXERCISES` array (acceptable, but coupled to imports above) |

**Adding 1 exercise requires editing 4+ central files.** This violates Open/Closed Principle.

### 1.2 No Code Splitting (HIGH)

- Zero `React.lazy()` or dynamic `import()` calls
- All 21 exercise visualizers + playgrounds imported synchronously in `App.tsx`
- Single JS bundle: **717 KB** (exceeds Vite's 500 KB warning)
- No route-based splitting exists

### 1.3 Exercise Data Files Underutilized (MEDIUM)

`exercises/<id>/` folders contain `exercise.json`, `solution.py`, `pseudocode.md`, `theory.md` — but `App.tsx` **duplicates** Python code, pseudocode, and theory inline as constants instead of loading from these files.

---

## 2. XSS / Input Security

### 2.1 Direct Injection Vectors (CLEAN ✅)

| Pattern | Occurrences |
|---------|-------------|
| `dangerouslySetInnerHTML` | 0 |
| `innerHTML` | 0 |
| `eval(` | 0 |
| `new Function(` | 0 |
| `document.write(` | 0 |

### 2.2 User Input Rendering (LOW)

Student code is rendered in `<textarea>` and `<pre>` elements (safe). Results go through JSON serialization boundary. No HTML injection paths found.

---

## 3. Python Execution Security

### 3.1 Timeout Watchdog (PARTIAL ✅)

- `PythonExecutionService.executePython()` has a **5-second timeout** (configurable via `timeoutMs`)
- On timeout: **worker is terminated and recreated** (`this.worker.terminate()`) — this is correct
- **Init timeout**: 15 seconds

### 3.2 Code Injection via String Interpolation (HIGH)

In [`pyodideWorker.ts:82-90`](file:///home/lucio_romero_m/Documents/romerom_tardos_kleinberg/vs_tda/visual_tda-antigravity/src/runtime/pyodideWorker.ts#L82-L90):

```typescript
${msg.code.split('\n').map((line) => '    ' + line).join('\n')}
...
if "${msg.functionName}" in locals():
...
__args_parsed = json.loads('''${JSON.stringify(msg.args)}''')
```

**Risks**:
- `msg.functionName` is interpolated directly into a Python f-string. If `functionName` contains `"` or `\n`, it breaks the Python script syntax. This is not a security vulnerability per se (the student controls their own execution), but it's fragile.
- `msg.code` is indented and inserted — triple-quote strings in student code containing `'''` would break `json.loads('''...''')`.
- **Mitigation**: Since this runs in a Web Worker (separate thread, no DOM access) and Pyodide sandboxes filesystem access, the blast radius is limited to the worker crashing.

### 3.3 Network Access from Pyodide (MEDIUM)

- Pyodide can make `fetch()` calls from within the worker via `pyodide.http.open_url()` or `urllib`
- **No CSP headers** are configured to prevent this
- Student code could theoretically fetch external URLs

### 3.4 Memory Limits (LOW)

- No explicit memory limit on the Web Worker
- Mitigated by browser's per-tab memory management
- Extreme allocations (e.g., `[0]*10**9`) would crash the worker, handled by the timeout watchdog

---

## 4. Dependency Security

### 4.1 Production Dependencies (EXCELLENT ✅)

| Dependency | Version | Status |
|------------|---------|--------|
| `react` | ^19.0.0 | ✅ Minimal |
| `react-dom` | ^19.0.0 | ✅ Minimal |

**Only 2 production dependencies.** Exemplary minimalism.

### 4.2 Dev Dependencies (GOOD)

| Dependency | Version | Status |
|------------|---------|--------|
| `@eslint/js` | ^9.20.0 | ✅ |
| `@types/react` | ^19.0.10 | ✅ |
| `@types/react-dom` | ^19.0.4 | ✅ |
| `@vitejs/plugin-react` | ^4.3.4 | ✅ |
| `eslint` | ^9.20.1 | ✅ |
| `typescript` | ^5.7.3 | ✅ |
| `typescript-eslint` | ^8.24.1 | ✅ |
| `vite` | ^6.1.1 | ✅ |
| `vitest` | ^3.0.6 | ⚠️ Moderate vulnerability |

### 4.3 npm audit Results

```
@vitest/mocker 2.1.0 - 4.1.10: Path Traversal / Arbitrary File Read
Severity: moderate (dev dependency only, not in production bundle)
Fix: npm audit fix --force → vitest@5.0.1 (breaking change)
```

**Impact**: Dev-only. Does not affect production builds or end users.

---

## 5. Secrets / Repository Security

| Pattern | Findings |
|---------|----------|
| API_KEY, SECRET, TOKEN, PASSWORD, Bearer, sk-, pk_, private_key | 0 findings |
| `.env` files | None present |
| Hardcoded credentials | None found |

**Result**: CLEAN ✅

---

## 6. Accessibility

### 6.1 What's Good (PARTIAL ✅)

- `aria-label` used in Header, PhaseSwitcher, ExerciseView, SolveView, NQueensBoard
- `role="tablist"` / `role="tab"` on PhaseSwitcher
- `role="img"` + `aria-label` on SVG visualizers (NQueens, IntervalScheduling)
- `aria-hidden="true"` on decorative icons
- `aria-modal="true"` on skip dialog

### 6.2 Gaps (MEDIUM-HIGH)

- **No `prefers-reduced-motion` support** — Animations play regardless of user preference (violates AGENTS.md P8)
- **Only 3 components** use `tabIndex` — Most visualizers/playgrounds are not keyboard-navigable
- **No skip-to-content link** — Standard a11y pattern missing
- **No `<main>` landmark** — App uses `<div className="app-container">`
- **Visualizer SVGs**: Many lack `aria-label` (only NQueens, IntervalScheduling, ReductionIsVc have them)
- **Color contrast**: Not audited (requires visual testing)

---

## 7. Performance

### 7.1 Bundle Size (HIGH)

| Asset | Size | Gzip |
|-------|------|------|
| `index-DlBm6iY1.js` | 717.66 KB | 207.50 KB |
| `index-79VSJ5fC.css` | 123.81 KB | 18.81 KB |
| `pyodideWorker-CIjX7SSg.js` | 2.20 KB | — |

**JS bundle exceeds 500 KB Vite threshold.** Primary causes:
1. All 21 exercises imported synchronously
2. All inline Python/pseudocode strings (~30 KB of string literals)
3. All visualizer CSS loaded globally

### 7.2 Pyodide Loading (OK)

- Pyodide loads on-demand (when student enters Solve phase and runs code)
- 15-second init timeout is reasonable
- CDN URL: `https://cdn.jsdelivr.net/pyodide/v0.26.4/full/`

### 7.3 100+ Concurrent Users Scenario

- **Static site**: Scales infinitely on CDN (Cloudflare Pages, GitHub Pages)
- **No server state**: Each user has independent browser execution
- **Pyodide**: Each user downloads ~15-25MB once (cached by browser/CDN)
- **Bottleneck**: Only bandwidth for initial Pyodide download; once cached, zero server load
- **Verdict**: Architecture is inherently scalable for 100+ users ✅

---

## 8. Testing

### 8.1 Current Coverage (GOOD)

- 184 tests across 31 test files
- All exercises have validator + trace tests
- Registry consistency tests exist
- I18n coverage tested
- Python execution tested (with mocks)

### 8.2 Gaps (MEDIUM)

- **No browser/E2E tests** — No Playwright, Cypress, or similar
- **No property-based/fuzz testing** — All inputs are hand-crafted
- **No visual regression tests**
- **No accessibility automated tests** (axe, jest-axe)
- **Test environment**: `node` (not `jsdom`) — React component rendering not tested

---

## 9. CI/CD

### 9.1 Current Pipeline (GOOD)

```yaml
Triggers: push to main, agent/**, feature/** + PRs to main
Steps: checkout → Node 24 + npm cache → npm ci → lint → typecheck → test → build
```

### 9.2 Gaps (MEDIUM)

- No deployment step (build artifact not published)
- No bundle size assertion/tracking
- No accessibility checks in CI
- No npm audit check in CI
- No branch protection documented

---

## 10. Documentation Truth

### 10.1 Accurate Docs

| Document | Status |
|----------|--------|
| `AGENTS.md` | ✅ Accurate, comprehensive |
| `docs/architecture.md` | ⚠️ Describes ideal pattern, not actual God File reality |
| `docs/roadmap.md` | ⚠️ P0-P14 marked complete, P15 in progress |
| `IA/architect/state.md` | ✅ Accurate snapshot |
| `IA/architect/questions.md` | ⚠️ Q-001 through Q-004 all marked OPEN but recommendations implemented |

### 10.2 Missing Docs

- `docs/security.md` — Does not exist
- `docs/quality-gates.md` — Does not exist
- `CONTRIBUTING.md` — Exists but not audited yet

---

## 11. CSS Architecture

### 11.1 Design Tokens (PARTIAL)

- `src/styles/variables.css` (79 lines): Defines `--bg`, `--surface`, `--text`, `--accent`, `--border`, etc.
- `src/styles/base.css` (58 lines): Global resets and font setup
- `src/app/App.css` (1,054 lines): God CSS file — mixes global layout, component styles, and theme overrides

### 11.2 Per-Visualizer CSS (GOOD)

- Each visualizer/playground has its own `.css` file
- Consistent naming: `VisualizerName.css`

### 11.3 Gaps

- No CSS custom property usage audit across all visualizer CSS
- Some visualizer CSS files are very large (470 lines for WeightedIntervalVisualizer)
- No `prefers-color-scheme` in individual component CSS (only in variables.css)

---

## 12. Educational Correctness

### 12.1 Exercise Count by Category

| Category | Count | Exercises |
|----------|-------|-----------|
| Backtracking | 2 | n-queens, subset-sum-backtracking |
| Greedy | 4 | interval-scheduling, knapsack-greedy, road-antennas-greedy, huffman-coding-greedy |
| Dynamic Programming | 5 | knapsack-dp, juan-el-vago, coin-change-dp, lcs-dp, weighted-interval-scheduling |
| Divide & Conquer | 4 | merge-sort, max-subarray-dyc, peak-finding-dyc, inversion-counting-dyc |
| Network Flow | 1 | max-flow |
| Linear Programming | 1 | linear-programming-formulation |
| NP/Reductions | 1 | vertex-cover-reduction |
| Approximation | 1 | vertex-cover-approx |
| Randomized | 1 | randomized-fair-coin |
| **Total** | **20** | |

### 12.2 Correctness Verification Status

All 20 exercises have:
- ✅ Validator with edge case tests
- ✅ Trace generator with step-by-step events
- ✅ Canonical Python solution in `exercises/<id>/solution.py`
- ✅ Theory markdown in `exercises/<id>/theory.md`
- ⚠️ Not independently verified by a human

---

## 13. Architectural Questions Resolution

| Question | Recommendation | Implemented? |
|----------|---------------|-------------|
| Q-001: Flat exercise directories | Option 1 (flat) | ✅ `exercises/<id>/` exists |
| Q-002: Student only computes output | Option 1 | ✅ Only canonical traces |
| Q-003: TS validators | Option 1 | ✅ All validators in TS |
| Q-004: Pyodide lazy loading | Option 1 (on-demand) | ✅ Loads on first code execution |

**Recommendation**: Mark Q-001 through Q-004 as RESOLVED.

---

## 14. Privacy

- ✅ No analytics scripts
- ✅ No tracking pixels
- ✅ No cookies
- ✅ No external API calls (except Pyodide CDN)
- ✅ No user data collection
- ✅ No localStorage of personal data

---

## 15. Summary — Priority Fix List

### 🔴 CRITICAL (Must fix before student use)

| # | Issue | Effort |
|---|-------|--------|
| C1 | **Pyodide code injection fragility** — `functionName` and triple-quote collision in worker template | 2h |
| C2 | **God File refactor** — App.tsx 1344 lines, exerciseContent.ts 1874 lines, pythonTestRunner.ts 1357 lines | 8-12h |

### 🟠 HIGH (Should fix for MVP quality)

| # | Issue | Effort |
|---|-------|--------|
| H1 | **No code splitting** — 717 KB bundle, all exercises loaded synchronously | 3h |
| H2 | **No `prefers-reduced-motion`** — Violates AGENTS.md P8 | 1h |
| H3 | **Missing semantic landmarks** — No `<main>`, no skip-to-content | 1h |
| H4 | **Bundle CSS duplication** — App.css is 1054 lines mixing concerns | 2h |

### 🟡 MEDIUM (Should fix for production quality)

| # | Issue | Effort |
|---|-------|--------|
| M1 | **No CSP headers** — Pyodide worker can make fetch requests | 1h |
| M2 | **SVG accessibility gaps** — Many visualizers lack aria-labels | 2h |
| M3 | **Documentation drift** — architecture.md describes ideal, not reality | 1h |
| M4 | **Questions.md not resolved** — Q-001 to Q-004 marked OPEN but implemented | 0.5h |
| M5 | **Vitest moderate vulnerability** — dev-only, but should track/update | 0.5h |
| M6 | **No npm audit in CI** | 0.5h |

### 🟢 LOW (Nice to have)

| # | Issue | Effort |
|---|-------|--------|
| L1 | **No E2E tests** — Requires Playwright setup | 4-6h |
| L2 | **No property-based testing** — fast-check or similar | 3h |
| L3 | **No accessibility CI check** — axe integration | 2h |
| L4 | **Exercise files underutilized** — Inline constants duplicate `exercises/` data | Part of C2 |

---

## Implementation Order

**Phase B**: Security hardening (C1, M1) — 3h
**Phase C**: Architecture refactor — God File decomposition (C2) — 8-12h
**Phase D**: Performance — Code splitting (H1) — 3h
**Phase E**: Accessibility — Landmarks, reduced motion, SVG labels (H2, H3, M2) — 4h
**Phase F**: Documentation — Sync all docs with reality (M3, M4) — 2h
**Phase G**: CI hardening — npm audit, bundle size check (M6) — 1h
**Phase H**: Quality gates — Create `docs/quality-gates.md` and `docs/security.md` — 2h
