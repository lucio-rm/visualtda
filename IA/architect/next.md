# Implementation Backlog & Next Tasks

## Current Work Queue

1. **[ACTIVE] P0: Repository Foundation & Tooling**
   - Populate `.gitignore` (node_modules, dist, logs, etc.).
   - Populate `AGENTS.md` with complete, authoritative rules.
   - Configure minimal `package.json` with React 19, TypeScript, Vite, Vitest, and ESLint.
   - Configure `tsconfig.json` and `vite.config.ts`.
   - Run `npm install` and verify `lint`, `typecheck`, `test`, `build` baselines.
   - Commit: `chore: bootstrap repository foundation and tooling`.

2. **[PENDING] P1: Application Shell & Exercise Registry**
   - Define domain contracts in `src/types/`: `exercise.ts`, `trace.ts`, `validation.ts`, `category.ts`.
   - Implement Theme system (`system | light | dark`) via CSS variables in `src/styles/`.
   - Build App header, navigation, and exercise registry (`src/engine/registry.ts`).
   - Write tests for registry.
   - Commit: `feat: implement application shell and exercise registry`.

3. **[PENDING] P2: Exercise Page & 3-Phase Flow**
   - Implement `PhaseSwitcher` (`discover`, `solve`, `understand`).
   - Scaffold views for Discover, Solve, and Understand.
   - Include skip-to-solution confirmation flow.
   - Commit: `feat: implement 3-phase exercise interaction flow`.

4. **[PENDING] P3 & P4: N-Queens Vertical Slice, Trace Engine & Visualizer**
   - Implement pure TypeScript N-Queens trace generator emitting typed `TraceEvent` items.
   - Implement timeline playback hook (`useTraceTimeline` with Play, Pause, Step Next/Prev, Reset, Scrub).
   - Implement SVG Chessboard visualizer (`NQueensVisualizer`).
   - Implement `NQueensValidator` with comprehensive unit tests.
   - Commit: `feat: add n-queens trace engine and visualizer`.
