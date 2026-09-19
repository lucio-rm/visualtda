# Architectural Decisions & Questions

This document tracks formal architectural decisions and questions escalated between agents and human architects.

---

## ADR-001 (Q-001): Relationship Model between Problem, Technique, and Exercise

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: Flat exercise directory structure (`exercises/<exercise-id>/`) combined with explicit relational metadata (`id`, `problemId`, `techniqueId`, `category`, `difficulty`, `order`) defined in `src/engine/registry.ts`.
- **Implementation State**: Fully adopted across all 20 existing exercises (`exercises/n_queens`, `exercises/knapsack_dp`, `exercises/knapsack_greedy`, etc.).
- **Rationale**:
  1. A single algorithmic problem (e.g. *Knapsack*) has multiple algorithmic paradigms (Greedy vs. DP). Nesting folders by category causes path breakages and duplication when comparing paradigms.
  2. Eliminates deep physical directory hierarchies and simplifies static imports.
  3. Adheres strictly to Principle P5: *Data Over Branching*.
- **Consequences**:
  - Exercises are uniquely addressed by compound `exercise-id` (e.g. `knapsack-dp`, `knapsack-greedy`).
  - Categories are dynamic groupings over metadata, not physical disk locations.

---

## ADR-002 (Q-002): Student Submission Tracing vs. Output Validation

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: Student Python code only computes and returns the algorithmic result. Only canonical educational solutions emit step-by-step `TraceEvent` streams.
- **Implementation State**: Implemented in `SolveView.tsx`, `pythonExecutionService.ts`, and all visualizers.
- **Rationale**:
  1. Requiring students to write trace-emitting code or import proprietary tracing libraries creates heavy cognitive friction, turning an algorithm course into an API-learning exercise.
  2. Automated AST code instrumentation introduces immense complexity, fragile edge cases, and difficult-to-debug errors (violating Principle P1: KISS and P9: No Hidden Magic).
  3. Output validation via robust, problem-specific `Validator` implementations allows students to write idiomatic, clean Python while receiving instant pedagogical feedback.
- **Consequences**:
  - The "Understand" phase uses deterministic, canonical trace generators to display how the ideal algorithm explores the state space.
  - The "Solve" phase uses fast, deterministic validation of student returns.

---

## ADR-003 (Q-003): Validator Implementation Language and Boundary

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: Validators are written exclusively in **TypeScript** (`src/engine/algorithms/*Validator.ts`). Python execution in Pyodide serializes the return value to JSON, crosses the Web Worker message boundary, and is validated on the main thread by the TypeScript validator.
- **Implementation State**: Fully adopted across all 20 exercise validators.
- **Rationale**:
  1. Prevents code duplication (DRY). Maintaining dual validators in both Python and TypeScript leads to subtle divergence in validation logic and double maintenance overhead.
  2. TypeScript validators execute in sub-millisecond time and can be tested directly in Vitest without requiring WebAssembly or Web Workers.
  3. Python code inside Pyodide cannot manipulate or tamper with the validator rules, as validation occurs strictly on the outer host thread.
- **Consequences**:
  - Test runner serializes return values via JSON. Any data structure returned by Python must be JSON-serializable (or mapped to standard primitives).

---

## ADR-004 (Q-004): Pyodide Lazy Loading Strategy

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: Pyodide and WebAssembly assets are initialized strictly **on-demand** when the student first accesses the "Resolver" (Solve) phase or executes Python code.
- **Implementation State**: Implemented in `pythonExecutionService.ts` (`initWorker` is only called lazily upon first code run).
- **Rationale**:
  1. Pyodide WebAssembly runtime and standard libraries comprise ~15–25 MB of compressed binary assets.
  2. Eager loading on application boot would severely penalize initial page load times and mobile data consumption for students who only wish to browse problems or inspect visualizations in the "Descubrir" or "Comprender" phases.
  3. Complies with Principle P10 (Portable Deployment) and P8 (Accessibility).
- **Consequences**:
  - The first time a student presses "Ejecutar pruebas", an initial loading spinner is displayed while Pyodide finishes initializing in the worker. Subsequent runs are instantaneous.
