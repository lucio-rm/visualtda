# Hardening Backlog & Next Tasks

Visual TDA has successfully completed **Phases A through H** of the architectural mandate. All 12 Quality Gates (G1–G12) have achieved **PASS** status.

---

## 1. Hardening Phases Completed (Phases A – H)

1. ✅ **PHASE A: Comprehensive Repository Audit & Governance**
   - Completed in commit `0ced0c2`.
   - Comprehensive audit report in `IA/architect/audit-mvp.md`.
   - Quality gates specification in `docs/quality-gates.md` (G1–G12).
   - Security threat model in `docs/security.md`.
   - Architecture Decision Records ADR-001 through ADR-004 in `IA/architect/questions.md`.

2. ✅ **PHASE B: Critical Correctness & Security Hardening**
   - Completed in commit `2b46553`.
   - Hardened `pyodideWorker.ts` against `BaseException` (`sys.exit()`, `KeyboardInterrupt`).
   - Implemented 64 KB stdout limit to prevent browser tab freeze / OOM DoS on infinite print loops.
   - Cleaned up pending callbacks upon worker crash/timeout in `pythonExecutionService.ts`.
   - Automated verification in `tests/pythonExecution.test.ts`.

3. ✅ **PHASE C: Testing Infrastructure (Independent Oracles & Property Testing)**
   - Completed in commit `7a40108`.
   - Built independent combinatorial/brute-force reference solvers in `tests/oracles/referenceSolvers.ts`:
     - Knapsack 0/1 ($2^n$ exhaustive power-set solver)
     - Subset Sum ($2^n$ exhaustive subset solver)
     - Coin Change (recursive memoized minimal-coin solver)
     - Weighted Interval Scheduling ($2^n$ compatible interval power-set solver)
     - Inversion Counting ($O(n^2)$ pairwise counter)
     - N-Queens (independent attack matrix validator)
     - Huffman Coding (prefix-free property validator)
     - Vertex Cover (exact minimum vertex cover brute-force solver)
   - 13 property and adversarial tests in `tests/adversarialAndOracles.test.ts`.

4. ✅ **PHASE D: Browser / User Journey Integration Verification**
   - Completed in commit `695cf4a`.
   - 15 core user journey integration tests in `tests/userJourneys.test.tsx` using `happy-dom`.
   - Verified catalog navigation, exercise selection, 3-phase flow, timeline playback, language/theme toggling, validator feedback, error resilience, and code reset.

5. ✅ **PHASE E: UX & Accessibility Polish**
   - Completed in commit `97b2a97`.
   - Added student code session persistence in `sessionStorage` in `SolveView.tsx`.
   - Added keyboard navigation (`tabIndex={0}`, `role="button"`, `onKeyDown`) and `:focus-visible` styling to visualizers.

6. ✅ **PHASE F: Performance & Code Splitting**
   - Completed in commit `6c6e689`.
   - Configured `vite.config.ts` manualChunks:
     - `vendor-react` (~223 KB)
     - `visualizers` (~213 KB)
     - `algorithm-engines` (~110 KB)
     - `index` (~154 KB)
   - Eliminated single monolithic bundle; all chunks are now $< 230$ KB.

7. ✅ **PHASE G: Architecture Cleanup (God File De-bloating)**
   - Completed in commit `bf1f053`.
   - Created `src/engine/exerciseViewRegistry.tsx` mapping exercises to visualizers and canonical theory without branching.
   - Refactored `src/app/App.tsx` from 1,347 lines down to 87 lines.

8. ✅ **PHASE H: Curriculum Academic Audit**
   - Completed in `docs/curriculum-audit.md`.
   - Deep-dive academic verification for all 20 foundational exercises against Kleinberg & Tardos (*Algorithm Design*), CLRS (*Introduction to Algorithms*), and FIUBA course guides.
   - Documented learning objectives, key invariants, mathematical correctness proofs, and asymptotic complexities.

---

## 2. Next Phase: Phase I (Curriculum Expansion)

Visual TDA is now hardened, secure, testable, accessible, and high-performing. All subsequent feature development must follow the established quality standards:

### Candidates for Phase I:
1. **Backtracking: Coloreo de Grafos (Graph Coloring / $k$-Coloring)**
   - Classic NP-complete problem with rich visual graph coloring and backtracking pruning.
   - Reference: Kleinberg & Tardos 8.4 / FIUBA Guía de Backtracking.
2. **Divide & Conquer: Par de Puntos Más Cercanos (Closest Pair of Points)**
   - Geometric divide-and-conquer in $O(n \log n)$ demonstrating the 7-point strip theorem.
   - Reference: Kleinberg & Tardos 5.4.
3. **Dynamic Programming: Multiplicación Encadenada de Matrices (Matrix Chain Multiplication)**
   - Classic 2D interval DP ($O(n^3)$) with parenthesization tree reconstruction.
   - Reference: CLRS Chapter 15.2.
