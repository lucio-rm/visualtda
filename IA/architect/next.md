# Hardening Backlog & Next Tasks

Visual TDA is in the **Audit & Production Hardening** phase. Development proceeds according to the strict development order specified in the architectural mandate.

---

## Hardening Work Queue

1. **[ACTIVE] PHASE B: Critical Correctness & Security Hardening**
   - Harden Pyodide worker against `BaseException` (`sys.exit()`, `KeyboardInterrupt`).
   - Implement 64 KB stdout quota to prevent browser tab freezing/OOM DoS on infinite print loops.
   - Add graceful error handling for un-serializable returns (`TypeError`, `OverflowError`).
   - Harden `pythonExecutionService.ts`: reject all pending callbacks on worker termination or crash (`onerror`).
   - Add unit tests in `tests/pythonExecution.test.ts` verifying DoS prevention, timeout cleanup, and BaseException handling.
   - Commit: `fix(security): implement stdout limits, BaseException handling, and worker leak prevention`.

2. **[PENDING] PHASE C: Improve Testing Infrastructure (Independent Oracles & Property Testing)**
   - Build independent combinatorial/brute-force reference oracles for small inputs ($n \le 12$):
     - Knapsack 0/1: $2^n$ exhaustive subset enumeration oracle.
     - Subset Sum: $2^n$ exhaustive subset solver oracle.
     - Coin Change: Recursive/memoized exhaustive coin combination oracle.
     - Weighted Interval Scheduling: $2^n$ compatible interval power-set oracle.
     - Inversion Counting: $O(n^2)$ pair-by-pair count oracle.
     - N-Queens: Independent board attack matrix validator oracle.
   - Implement property-based and adversarial tests comparing canonical algorithms against independent reference oracles with deterministic seeds.
   - Commit: `test(oracles): add independent combinatorial reference solvers and property tests`.

3. **[PENDING] PHASE D: Browser / User Journey Verification**
   - Implement integration test suite covering the 15 core user journeys:
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
   - Commit: `test(e2e): implement user journey verification covering 15 core flows`.

4. **[PENDING] PHASE E: UX & Accessibility Polish**
   - Implement student code session persistence in `sessionStorage` (prevent code loss on navigation).
   - Add keyboard navigation and focus management on interactive SVG visualizers (`tabIndex={0}`, `onKeyDown`).
   - Ensure color is never the sole conveyor of information across visualizers (add shapes, text labels, patterns).
   - Commit: `fix(ux,a11y): add code persistence, keyboard focus on visualizers, and accessible state markers`.

5. **[PENDING] PHASE F: Performance & Code Splitting**
   - Implement dynamic code splitting for exercise visualizers via `React.lazy` and `Suspense`.
   - Configure manual chunking in `vite.config.ts` to keep the main bundle well below 500 KB.
   - Verify zero Pyodide WebAssembly downloading on initial landing page and Discover phase.
   - Commit: `perf(bundle): implement code-splitting for visualizers and optimize chunk sizes`.

6. **[PENDING] PHASE G: Architecture Cleanup Only Where Justified**
   - Data-driven exercise registration to decouple the 4 God Files safely without breaking any tests.
   - Commit: `refactor(engine): establish data-driven exercise registration`.

7. **[PENDING] PHASE H: Curriculum Audit**
   - Verify every exercise's learning objectives, difficulty, invariants, and proofs against Kleinberg & Tardos and FIUBA guides.
   - Commit: `docs(curriculum): complete academic audit of 20 canonical exercises`.

8. **[PENDING] PHASE I: Add Next Fundamental Exercise**
   - Only after all gates pass, implement the next starred fundamental problem (e.g. Backtracking: Graph Coloring or Divide & Conquer: Closest Pair of Points).
