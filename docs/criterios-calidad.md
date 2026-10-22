# Visual TDA — Quality Gates Specification & Status Matrix

**Document Version**: 2.0  
**Scope**: Especificación y compuertas de calidad técnica y pedagógica de Visual TDA  
**Standard**: Multi-dimensional verification status distinguishing:
- `AUTOMATED`: Verified via deterministic script/test in CI or test runner.
- `EMPIRICAL`: Verified via live browser/runtime observation.
- `DOCUMENTARY`: Verified via academic/theoretical cross-reference.
- `LIMITATION`: Explicitly stated boundaries of verification.

---

## 1. Quality Gate Matrix

| Gate | ID | Domain | Status | Verification Protocol & Command | Limitations & Evidence |
|---|---|---|---|---|---|
| **G1** | `GATE-BUILD` | Static Build | **PASS** | **AUTOMATED**: `npm run build`<br>**EMPIRICAL**: Static serving of `dist/` | Pure static client output in 1.1s. Zero server runtime, zero database. |
| **G2** | `GATE-TYPES` | Type Safety | **PASS** | **AUTOMATED**: `npm run typecheck` (`tsc --noEmit`) | Strict mode: `noImplicitAny: true`, `strictNullChecks: true`. 0 errors. 3 `any` in `pyodideWorker.ts` justified and documented. |
| **G3** | `GATE-LINT` | Code Quality | **PASS** | **AUTOMATED**: `npm run lint` (`eslint .`) | Flat ESLint 9 configuration. 0 warnings, 0 errors across all JS/TS/TSX. |
| **G4** | `GATE-UNIT-TESTS` | Unit Tests | **PASS** | **AUTOMATED**: `npm run test` (`vitest run`) | 34 test files, 220/220 tests pass in 1.8s. Covers algorithms, validators, traces, registry, i18n. |
| **G5** | `GATE-INTEG-TESTS` | Integration Tests | **PASS** | **AUTOMATED**: `phases.test.ts`, `useTraceTimeline.test.ts`, `exerciseContent.test.ts` | Cross-component flow tests pass: phase transitions, scrubber hook, localized content. |
| **G6** | `GATE-BROWSER-E2E` | Real Browser QA | **PASS** | **AUTOMATED**: `npm run test:browser` (`scripts/browserQA.mjs`)<br>**EMPIRICAL**: Headless Chromium via CDP | 22/22 real Chromium scenarios pass across 5 viewports (1920x1080, 1440x900, 1280x720, 768x1024, 390x844). 0 console errors. 10 screenshots captured in `dist-qa-screenshots/`. |
| **G7** | `GATE-A11Y` | Accessibility | **PARTIAL** | **AUTOMATED**: Keyboard tests in `userJourneys.test.tsx` and `browserQA.mjs`<br>**EMPIRICAL**: Skip link, `:focus-visible` outlines, `prefers-reduced-motion` | Core keyboard paths and reduced-motion work. Full automated axe-core/screen-reader audit not yet integrated; some complex SVG graphs rely heavily on color differentiation. |
| **G8** | `GATE-SECURITY` | Security & Sandbox | **PASS** | **AUTOMATED**: AST scan + CSP check in `index.html`<br>**EMPIRICAL**: Pyodide worker isolation | Strict CSP (`default-src 'self'`, `object-src 'none'`, `worker-src 'self' blob:`, `connect-src 'self' https://cdn.jsdelivr.net`). Zero unsafe DOM sinks (`dangerouslySetInnerHTML`, `eval`, `document.write`). Zero hardcoded secrets. |
| **G9** | `GATE-PERF` | Performance | **PASS** | **AUTOMATED**: Vite `manualChunks` inspection | Split chunks: all chunks < 230 KB raw (< 70 KB gzip). Pyodide lazy-loaded on demand. |
| **G10** | `GATE-PY-RELIABILITY` | Python Reliability | **PASS** | **AUTOMATED**: `tests/pythonExecution.test.ts`<br>**EMPIRICAL**: Worker watchdog test | 5,000ms watchdog halts infinite loops; 64 KB stdout limit truncates; BaseException (`sys.exit`) safely caught. |
| **G11** | `GATE-CORRECTNESS` | Correctness | **PASS** | **AUTOMATED**: 8 combinatorial reference solvers in `tests/oracles/referenceSolvers.ts`<br>**DOCUMENTARY**: `docs/curriculum-audit.md` | Independent brute-force solvers verify DP/Greedy outputs. Validators verified with edge cases and invariants. |
| **G12** | `GATE-DEPLOY-REPRO` | CI / Reproducibility | **PASS** | **AUTOMATED**: `.github/workflows/ci.yml` | Clean container verification with Node 24 running lint, typecheck, test, and build. |

---

## 2. Detailed Protocols and Verification Evidence

### G1: Static Build (`GATE-BUILD`)
- **Automated**: `npm run build` generates `dist/index.html`, `dist/assets/vendor-react-*.js`, `dist/assets/visualizers-*.js`, `dist/assets/algorithm-engines-*.js`, `dist/assets/index-*.js`, and CSS assets.
- **Static Integrity**: Fully servable via any static host (Cloudflare Pages, GitHub Pages, AWS S3) with zero server-side rendering or backend dependencies.

### G2: Type Safety (`GATE-TYPES`)
- **Automated**: `tsc --noEmit` runs under TypeScript 5.7 with `strict: true`, `noImplicitAny: true`, `noUnusedLocals: true`, `noUnusedParameters: true`.
- **Exceptions**: Exactly 3 `any` types in `src/runtime/pyodideWorker.ts`, documented and silenced with ESLint directives because the external Pyodide CDN bundle does not ship official TypeScript declaration types.

### G3: Linting (`GATE-LINT`)
- **Automated**: ESLint 9 using flat config (`eslint.config.js`).
- **Rule Enforcement**: Zero warnings, zero errors across all 286 source files. Build/test tool scripts isolated in `scripts/`.

### G4: Unit Testing (`GATE-UNIT-TESTS`)
- **Automated**: Vitest 3.0 runs 34 test files, 220 unit tests in ~1.8 seconds.
- **Coverage**: Every algorithmic paradigm (Backtracking, Divide & Conquer, Dynamic Programming, Greedy, Network Flow, Linear Programming, Reductions, Approximations, Randomized) has dedicated tests.

### G5: Integration Testing (`GATE-INTEG-TESTS`)
- **Automated**: Component state integration tests in `tests/phases.test.ts`, `tests/useTraceTimeline.test.ts`, and `tests/exerciseContent.test.ts`.
- **Verification**: Verifies that state transitions (e.g. stepping through timeline events, phase progression, student code resets) produce deterministic outcomes.

### G6: Real Browser / E2E Testing (`GATE-BROWSER-E2E`)
- **Automated**: `npm run test:browser` runs `scripts/browserQA.mjs`.
- **Infrastructure**: Drives real headless Chromium (`/snap/bin/chromium`) via Chrome DevTools Protocol (CDP) over native Node.js WebSocket and HTTP server with zero third-party dependencies.
- **Scenarios Verified (22/22 PASS)**:
  1. Landing page loads & renders 21 exercises across 9 categories.
  2. Category navigation filtering (Backtracking, Todos).
  3. Exercise selection & mounting (N-Queens).
  4. Discover phase interactive playground (places queen on SVG board, updates state).
  5. Solve phase & Python 3 editor rendering.
  6. Progressive hints accordion expansion.
  7. Code editing in controlled `<textarea>`.
  8. Local test execution with failing solution (produces failure card).
  9. Reset template button (restores canonical starter code).
  10. Skip-to-understand confirmation modal flow (cancel, re-open, confirm).
  11. Successful validation unlocking Understand phase (unlocked badge ✓ appears).
  12. Understand phase canonical code & pseudocode toggle.
  13. Theory card invariants & asymptotic complexity formatting ($O$, $\Theta$).
  14. Visualizer & timeline playback step controls (Step 1 -> Step 2).
  15. Language switching (ES <-> EN).
  16. Theme switching (`data-theme="dark"`, `data-theme="light"`).
  17. Accessibility skip-to-content anchor (`#main-content`).
  18. Keyboard focusability of interactive elements.
  19. Return to catalog and exercise switching (Interval Scheduling).
  20. Student code `sessionStorage` persistence across phase switches.
  21. Error resilience with empty/malformed code input.
  22. Responsive layout across 5 viewports:
      - 1920x1080 (Desktop FHD) — Layout OK
      - 1440x900 (Laptop) — Layout OK
      - 1280x720 (Desktop Standard) — Layout OK
      - 768x1024 (Tablet Portrait) — Layout OK
      - 390x844 (Mobile) — Layout OK
- **Console Log**: Zero console errors during entire 22-scenario real browser run.
- **Visual Artifacts**: 10 screenshots generated in `dist-qa-screenshots/`.

### G7: Accessibility (`GATE-A11Y`)
- **Status**: **PARTIAL**.
- **Automated**: Keyboard navigation handlers verified in Vitest and Chromium QA suite.
- **Features Implemented**:
  - Semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`, `<button>`, `<select>`).
  - Skip-to-content link targeting `#main-content`.
  - `:focus-visible` styling on interactive elements.
  - `prefers-reduced-motion` disables animations in CSS.
- **Limitations**:
  - Screen reader announcements for SVG graph interactions not yet fully audited with NVDA/VoiceOver.
  - Certain complex graphs (Max Flow, Graph Coloring) rely primarily on color badges and require further secondary pattern/text indicators.

### G8: Security & Sandboxing (`GATE-SECURITY`)
- **Automated**:
  - Static AST scan: 0 occurrences of `dangerouslySetInnerHTML`, `innerHTML`, `eval()`, `new Function()`, `document.write`.
  - Content Security Policy (CSP) meta tag configured in `index.html`:
    `default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; connect-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self' data:; object-src 'none'; base-uri 'self';`
- **Pyodide Worker Sandboxing**:
  - Untrusted code runs off-thread in a dedicated Web Worker.
  - No access to DOM, cookies, session credentials, or local storage.
  - 5s watchdog termination timer prevents infinite loops.
  - 64 KB stdout limit prevents memory exhaustion DoS.
- **Privacy**: Zero remote tracking, zero analytics, zero external user data transmission.

### G9: Performance (`GATE-PERF`)
- **Automated**: Vite build chunk analysis.
- **Metrics**:
  - `vendor-react`: 223 KB raw (69 KB gzip)
  - `visualizers`: 225 KB raw (57 KB gzip)
  - `algorithm-engines`: 117 KB raw (35 KB gzip)
  - `index`: 160 KB raw (49 KB gzip)
  - Total initial JS transfer: ~170 KB gzipped.
  - Pyodide runtime (20 MB WebAssembly) is strictly lazy-loaded on first Python test execution in Solve phase.

### G10: Python Execution Reliability (`GATE-PY-RELIABILITY`)
- **Automated**: `tests/pythonExecution.test.ts` verifies watchdog termination, stdout truncation, and error containment.
- **Error Handling**: Catches `BaseException` (`sys.exit()`, `KeyboardInterrupt`), syntax errors, and non-serializable outputs without crashing the parent application.

### G11: Educational Correctness (`GATE-CORRECTNESS`)
- **Automated**:
  - 8 independent combinatorial reference solvers in `tests/oracles/referenceSolvers.ts`:
    - Knapsack 0/1 (exhaustive power-set)
    - Subset Sum (exhaustive subset generator)
    - Coin Change (recursive memoized minimum solver)
    - Weighted Interval Scheduling (exhaustive compatible subset solver)
    - Inversion Counting (pairwise $O(n^2)$ comparator)
    - N-Queens (independent attack matrix validator)
    - Huffman Coding (prefix-free codebook validator)
    - Vertex Cover (exact minimum vertex cover brute-force solver)
  - 13 property and adversarial tests in `tests/adversarialAndOracles.test.ts`.
- **Academic Review**: Documented in `docs/curriculum-audit.md` with formal mathematical invariants, induction arguments, and asymptotic bounds aligned with Kleinberg & Tardos (*Algorithm Design*) and CLRS.

### G12: Deployment Reproducibility (`GATE-DEPLOY-REPRO`)
- **Automated**: GitHub Actions workflow (`.github/workflows/ci.yml`) runs on Node 24 ubuntu-latest.
- **Pipeline**: Runs `npm ci`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
