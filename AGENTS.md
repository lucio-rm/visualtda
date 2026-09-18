# Visual TDA Engineering Rules

This document is the **supreme repository-level authority** for all human and AI agents working on Visual TDA. All other agent role documents, instructions, and discussions are subordinate to the principles and constraints stated here.

---

## 1. Architecture

- **Platform Target**: Pure client-side static web application deployable to static hosts (Cloudflare Pages, GitHub Pages).
- **Core Stack**: React 19 + TypeScript + Vite. Modern CSS with CSS variables (no CSS framework dependencies).
- **Algorithm Runtime**: Python is the canonical educational algorithm language. Execution in browser is handled via Pyodide running inside a dedicated Web Worker when required.
- **Strict Decoupling Boundary**:
  $$\text{Algorithm} \longrightarrow \text{Trace Events} \longrightarrow \text{Visualizer} \longrightarrow \text{React UI}$$
  - Algorithms do not import or know about React or DOM elements.
  - Visualizers render state transitions deterministically from trace events.
  - React UI manages user interactions, controls, layout, and phase switching.
- **Domain Modeling**:
  $$\text{Problem} \neq \text{Technique} \neq \text{Exercise}$$
  - A problem (e.g., *Knapsack*) may be solved using different techniques (e.g., *Greedy* vs. *Dynamic Programming*).
  - Exercises are represented as modular configurations with rich metadata (`id`, `problemId`, `techniqueId`, `category`, `difficulty`, `order`), avoiding deep physical folder nesting.
- **Pedagogical 3-Phase Flow**:
  1. `discover` (*Descubrir*): Problem narrative, intuition, interactive visual exploration without premature code.
  2. `solve` (*Resolver*): Formal problem definition, progressive hints, code editor, test execution.
  3. `understand` (*Comprender*): Canonical solution, synchronized trace playback, formal correctness argument, asymptotic time/space analysis.

---

## 2. Design Principles

- **P1. KISS (Keep It Simple, Stupid)**: The simplest working solution that completely solves the problem is strictly preferred.
- **P2. Single Responsibility**: Each module, component, and file must have a single clear responsibility.
- **P3. No Premature Abstraction**: Do not abstract until real, repeated duplication has been observed across multiple concrete exercises.
- **P4. Algorithm / UI Separation**: Algorithms produce deterministic outputs and trace events; they never depend on React or the browser DOM.
- **P5. Data Over Branching**: Categories, exercises, and metadata are defined as structured data/configuration rather than branching application code (`if/else`).
- **P6. Deterministic Execution**: Traces and visualizers must produce identical, reproducible states for identical inputs and seeds.
- **P7. Test Before Scale**: Fully implement, test, and polish the exemplary vertical slice (N-Queens) before adding multiple exercises.
- **P8. Accessibility by Default**: Keyboard navigability, semantic HTML, WCAG-compliant color contrast, and reduced motion considerations are required.
- **P9. No Hidden Magic**: Critical application behavior, trace transformations, and state updates must be clearly traceable without opaque metaprogramming.
- **P10. Portable Deployment**: Builds must remain strictly static (`dist/` directory produced by `vite build` with zero backend server dependencies).
- **P11. Educational Correctness > Visual Spectacle**: Visualizations must faithfully reflect algorithmic behavior; animations must never distort correctness for visual flair.
- **P12. Explain the Why**: The platform must explain what the algorithm does, why it works (invariants, exchange arguments), why it is correct, and what it costs ($O$).

---

## 3. Code Conventions

- **Directory & File Naming**:
  - Directories, IDs, and route slugs: `kebab-case` (e.g., `exercises/n-queens/`).
  - React Components: `PascalCase.tsx` (e.g., `NQueensVisualizer.tsx`).
  - TypeScript modules, utilities, and hooks: `camelCase.ts` (e.g., `useTraceTimeline.ts`).
  - Python files: `snake_case.py` (e.g., `n_queens.py`).
  - Localized markdown files: `<name>.<lang>.md` (e.g., `problem.es.md`, `problem.en.md`).
- **TypeScript**: Strict mode enabled (`noImplicitAny`, `strictNullChecks`). No `any` without documented, escalated justification.
- **CSS**: CSS variables for design tokens (`--bg`, `--surface`, `--text`, `--accent`, `--border`, etc.). Support `system`, `light`, and `dark` modes.
- **Git Branching & Safety**:
  - Implementation work occurs exclusively on `agent/antigravity` in this worktree.
  - Never switch to, modify, or merge into `main`.
  - Use conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.

---

## 4. Testing & Verification

- Every implementation unit must be accompanied by automated tests before being declared complete.
- **Vitest** for TypeScript domain models, registry, trace engines, and validators.
- **Separation of Validator vs. Tests**:
  - `Validator`: Pure logic verifying whether a given candidate output satisfies problem constraints (essential for problems with multiple valid solutions).
  - `Tests`: Test suite running multiple inputs (edge cases, typical cases, stress cases) against student/canonical code using the Validator.

---

## 5. Do Not

- **Do NOT introduce a backend server, API, database, Docker, or microservices**. Everything runs in the client browser.
- **Do NOT install premature dependencies**: No Tailwind, Redux, Zustand, React Router, D3, Monaco, or heavy component libraries unless a concrete, approved requirement arises.
- **Do NOT use dark patterns**: The student must always have the option to voluntarily skip or reveal the canonical solution without penalty.
- **Do NOT modify canonical algorithmic semantics** merely to fit an animation.
- **Do NOT run destructive Git commands** (`reset --hard`, `push --force`, branch deletion).
- **Do NOT run commands with `sudo`**.

---

## 6. Before Modifying Architecture

If an architectural change, new dependency, or structural refactor is contemplated:
1. Inspect the existing repository structure and history.
2. Formulate the concrete problem being solved.
3. Verify whether the existing architecture can resolve it without adding abstractions.
4. If a genuine architectural question remains, record it in `IA/architect/questions.md` for ChatGPT review, adopt the smallest safe path forward, and continue.

---

## 7. Definition of Done

A task or milestone is done ONLY when:
1. `npm run lint` passes with zero errors.
2. `npm run typecheck` (`tsc --noEmit`) passes with zero errors.
3. `npm run test` passes completely.
4. `npm run build` succeeds, generating a clean static output in `dist/`.
5. Code adheres to separation of concerns and design principles P1–P12.
6. Progress is documented in `IA/architect/state.md` and session logs.
