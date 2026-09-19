# Visual TDA — Quality Gates Specification

**Document Version**: 1.0  
**Authority**: Subordinate to `AGENTS.md`  
**Purpose**: Defines the mandatory verification criteria that every release, milestone, and vertical slice must satisfy before being declared production-ready.

---

## Quality Gate Matrix

| Gate | ID | Category | Verification Command / Method | Minimum Passing Standard | Current Status |
|------|----|----------|-------------------------------|---------------------------|----------------|
| **G1** | `GATE-BUILD` | Build System | `npm run build` | Zero errors, static assets output to `dist/`, zero backend runtime | **PASS** (Clean static build in 1.1s) |
| **G2** | `GATE-TYPES` | Type Safety | `npm run typecheck` (`tsc --noEmit`) | Zero TypeScript errors with strict mode enabled (`noImplicitAny`, `strictNullChecks`) | **PASS** (0 errors) |
| **G3** | `GATE-LINT` | Code Quality | `npm run lint` (`eslint .`) | Zero ESLint warnings or errors across all files | **PASS** (0 warnings/errors) |
| **G4** | `GATE-UNIT-TESTS` | Unit Testing | `npm run test` (`vitest run`) | 100% of domain, validator, trace, and algorithm unit tests pass | **PASS** (184/184 tests pass) |
| **G5** | `GATE-INTEG-TESTS` | Integration Testing | Automated suite (`tests/*.test.ts`) | Cross-component flow tests pass: phase switching, timeline scrubber, i18n | **PASS** (Phases, registry, timeline verified) |
| **G6** | `GATE-BROWSER-E2E` | User Journey Testing | Integration user flows (`tests/userJourneys.test.ts`) | All 15 core user flows verified against UI state machine | **IN PROGRESS** (Phase D) |
| **G7** | `GATE-A11Y` | Accessibility | Automated + manual audit | WCAG 2.1 AA compliant, reduced-motion supported, skip link present, semantic HTML | **PARTIALLY VERIFIED** (Reduced-motion & skip link added; SVG focus polish ongoing) |
| **G8** | `GATE-SECURITY` | Security & Sandboxing | Code audit + `npm audit` | Zero unsafe DOM APIs (`dangerouslySetInnerHTML`, `eval`), Pyodide worker isolated, zero secrets | **PASS** (Zero XSS vectors, worker globals hardened) |
| **G9** | `GATE-PERF` | Performance | Bundle size & startup audit | Main JS bundle < 500 KB, zero Pyodide loading during initial catalog/discover phases | **IN PROGRESS** (Code splitting in Phase F) |
| **G10** | `GATE-PY-RELIABILITY`| Python Execution | Watchdog & DoS tests | 5000ms timeout terminates stuck worker, 64KB stdout cap, graceful error handling | **IN PROGRESS** (Hardened in Phase B) |
| **G11** | `GATE-CORRECTNESS` | Educational Correctness | Independent solver tests | Solutions verified against independent combinatorial/brute-force oracles and formal invariants | **IN PROGRESS** (Oracles in Phase C) |
| **G12** | `GATE-DEPLOY-REPRO` | Deployment Reproducibility | CI pipeline run | Deterministic static build runs identically in clean Linux container with Node 24 | **PASS** (GitHub Actions CI green) |

---

## Detailed Gate Descriptions & Verification Protocols

### G1: Build (`GATE-BUILD`)
- **Criteria**: Vite must build static HTML, CSS, and JS chunks into `dist/`. No server-side rendering (SSR), Docker, or Node runtime may be required to serve the site.
- **Verification**: `npm run build && test -f dist/index.html`.

### G2: Type Safety (`GATE-TYPES`)
- **Criteria**: Complete type coverage. No unescaped `any` types without explicit, documented rationale. `tsconfig.json` maintains strict mode.
- **Verification**: `npm run typecheck`.

### G3: Lint (`GATE-LINT`)
- **Criteria**: Flat ESLint 9 configuration checks all `.ts`, `.tsx`, and `.js` files.
- **Verification**: `npm run lint`.

### G4: Unit Tests (`GATE-UNIT-TESTS`)
- **Criteria**: Every algorithm, trace generator, and validator must have a corresponding unit test file in `tests/`.
- **Verification**: `npm run test`.

### G5: Integration Tests (`GATE-INTEG-TESTS`)
- **Criteria**: Exercises must be verified through the 3-phase flow: Discover (playground state changes), Solve (validator response), and Understand (timeline step transitions).
- **Verification**: Automated test suite exercising `PhaseSwitcher`, `useTraceTimeline`, and `registry`.

### G6: Browser/E2E Tests (`GATE-BROWSER-E2E`)
- **Criteria**: Test the 15 user journeys specified in project engineering rules:
  1. Application loads
  2. Category navigation
  3. Exercise selection
  4. Discover phase
  5. Solve phase
  6. Understand phase
  7. Language switching
  8. Theme switching
  9. Timeline controls
  10. Validator feedback
  11. Python execution
  12. Runtime error handling
  13. Worker timeout handling
  14. Reset/retry behavior
  15. Navigation between exercises

### G7: Accessibility (`GATE-A11Y`)
- **Criteria**:
  - `prefers-reduced-motion: reduce` disables all transitions and animations.
  - Skip-to-content anchor present and functional for keyboard users.
  - Interactive elements have visible `:focus-visible` outlines.
  - Color is not used as the only visual means of conveying information (WCAG 1.4.1).

### G8: Security (`GATE-SECURITY`)
- **Criteria**:
  - `grep -rn "dangerouslySetInnerHTML\|innerHTML\|eval(\|new Function(" src/` returns zero hits.
  - Untrusted student Python runs in an isolated Web Worker without DOM or cookie access.
  - Zero hardcoded credentials or API keys.

### G9: Performance (`GATE-PERF`)
- **Criteria**:
  - Production static bundle size checked against Vite thresholds (< 500 KB per chunk).
  - Pyodide WebAssembly is only fetched when a student interacts with the Solve phase.

### G10: Python Execution Reliability (`GATE-PY-RELIABILITY`)
- **Criteria**:
  - Infinite loops (`while True: pass`) terminated within 5,000 ms.
  - Excessive stdout (`while True: print("A")`) truncated at 64 KB without browser freezing.
  - Exceptions (`SyntaxError`, `NameError`, `SystemExit`) caught and reported gracefully.

### G11: Educational Correctness (`GATE-CORRECTNESS`)
- **Criteria**:
  - Canonical algorithms verified against independent reference oracles (brute-force combinatorial checkers for small inputs).
  - Theoretical invariants and asymptotic complexities match CLRS / Kleinberg-Tardos textbooks.

### G12: Deployment Reproducibility (`GATE-DEPLOY-REPRO`)
- **Criteria**:
  - Clean `npm ci && npm run build` produces identical static deployment artifacts in GitHub Actions CI.
