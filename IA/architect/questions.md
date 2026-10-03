# Architectural Decisions & Questions

This document tracks formal architectural decisions and questions escalated between agents and human architects.

---

## ADR-001 (Q-001): Relationship Model between Problem, Technique, and Exercise

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: Flat exercise directory structure (`exercises/<kebab-case-exercise-id>/`) combined with explicit relational metadata (`id`, `problemId`, `techniqueId`, `category`, `difficulty`, `order`) defined in `src/engine/registry.ts`.
- **Implementation State**: Fully adopted across all 37 exercise directories (38 view registry entries including aliases): `exercises/n-queens/`, `exercises/knapsack-dp/`, `exercises/knapsack-greedy/`, `exercises/knapsack-branch-and-bound/`, etc.
- **Rationale**:
  1. A single algorithmic problem (e.g. *Knapsack*) has multiple algorithmic paradigms (Greedy vs. DP vs. Branch and Bound). Nesting folders by category causes path breakages and duplication when comparing paradigms.
  2. Eliminates deep physical directory hierarchies and simplifies static imports.
  3. Adheres strictly to Principle P5: *Data Over Branching*.
- **Consequences**:
  - Exercises are uniquely addressed by compound `exercise-id` (e.g. `knapsack-dp`, `knapsack-greedy`, `knapsack-branch-and-bound`).
  - Categories are dynamic groupings over metadata, not physical disk locations.

---

## ADR-002 (Q-002): Student Submission Tracing vs. Output Validation

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: Student Python code only computes and returns the algorithmic result. Only canonical educational solutions emit step-by-step `TraceEvent` streams.
- **Implementation State**: Implemented in `SolveView.tsx`, `pythonExecutionService.ts`, and all 38 exercise visualizers and playgrounds.
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
- **Implementation State**: Fully adopted across all 38 exercise validators in TypeScript.
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

---

## ADR-005 (Q-005): Dual-Slot Solution Encryption (Instructor + Student Pass Tokens)

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: All canonical educational solutions in Python are encrypted ahead-of-time during build with AES-256-GCM and PBKDF2 key derivation (`scripts/encryptSolutions.mjs`), with two distinct decryption slots:
  1. **Slot 1 (Instructor Key)**: Derived from faculty master password (`MEL75.29`) with 100,000 PBKDF2 rounds.
  2. **Slot 2 (Student Key)**: Derived from per-exercise verification token issued only when all test cases pass with genuine effort.
- **Implementation State**: Fully deployed to `src/engine/encryptedSolutions.ts` and `src/utils/solutionCrypto.ts`. Zero plaintext canonical solution code in public JavaScript bundle.
- **Rationale**:
  1. Prevents students from simply inspecting client source files or DOM elements to copy solution code.
  2. Allows faculty/instructors to inspect canonical code instantly across all exercises without solving each one.

---

## ADR-006 (Q-006): Radix Colors 12-Step Contrast-Guaranteed Design System (Mission V11)

- **Status**: **RESOLVED / ADOPTED**
- **Decision**: Replace arbitrary, hand-picked CSS hex color values with the framework-agnostic **Radix Colors** 12-step scale (`@radix-ui/colors`) for both light and dark themes.
- **Implementation State**: Being adopted in Mission V11 across `src/styles/variables.css`, `src/styles/base.css`, and visualizer styles.
- **Palette Mapping**:
  - **Neutral/Surface**: Radix Slate (Light / Dark) for app background (step 1), card/recessed background (step 2), component surfaces (steps 3–5), borders (steps 6–8), text (steps 11–12).
  - **Accent/Brand**: Radix Indigo (steps 9–10 for interactive solids, steps 3–5 for tints).
  - **Success/Optimal**: Radix Grass/Green.
  - **Danger/Conflict/Reject**: Radix Tomato/Red.
  - **Active/Evaluation**: Radix Amber.
- **Rationale**:
  1. Hand-picked colors repeatedly led to subtle WCAG failures (e.g. 2.36:1 on board squares or washed-out catalog selectors).
  2. Radix Colors guarantees mathematical contrast between steps (e.g. step 11/12 on step 1/2/3, white on step 9) across both light and dark themes by design.
