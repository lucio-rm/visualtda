# Visual TDA — Current Repository State

- **CURRENT_PHASE**: P15 (Curriculum Depth & Iconic Course Problems)
- **CURRENT_TASK**: Prioritizing Core Fundamental Course Problems (Starred/Guía FIUBA & RW)
- **COMPLETED**:
  - Initial repository audit
  - Multi-agent specifications in `.agents/agents/`
  - Architect communication system in `IA/architect/`
  - Authoritative `AGENTS.md` rules
  - Gitignore and hygiene configuration
  - P0: Full toolchain bootstrap (Vite, React 19, TypeScript, Vitest, ESLint)
  - P1: Domain models (`src/types/`), Exercise Registry (`src/engine/registry.ts`), and App navigation shell
  - P2: 3-Phase exercise flow (`PhaseSwitcher`, `DiscoverView`, `SolveView`, `UnderstandView`, `ExerciseView`)
  - P3 & P4: N-Queens complete vertical slice, trace engine, timeline controller, and visualizers
  - P5: GitHub Actions CI workflow (`.github/workflows/ci.yml`), README.md, docs/architecture.md, docs/roadmap.md
  - P6: Interval Scheduling (Greedy) vertical slice with earliest finish time proof and timeline visualizer
  - Accessibility & Interaction Polish: Global keyboard shortcuts (ArrowLeft/ArrowRight, Space/k, r) for all timeline visualizers
  - P7: Knapsack Dual Slice (0/1 DP 2D Table visualizer vs Fractional Greedy ratio sorting and 0/1 counterexample comparison card)
  - P8: Internationalization (ES / EN) toggle, `LanguageProvider`, `useLanguage` hook, and bilingual UI components
  - P9: Merge Sort (Divide & Conquer) vertical slice, bar chart visualizer, recursion tree depth, and subproblem range inspector
  - P10: Exercise-specific Solve phase content, 3-level progressive hints, and per-test feedback cards
  - P11: Max Flow / Min Cut (Network Flow with Edmonds-Karp BFS, residual graph, augmenting paths, and min-cut cut-set partition)
  - P12: Pyodide Web Worker Execution Infrastructure (`workerProtocol.ts`, `pyodideWorker.ts`, `pythonExecutionService.ts` with 5s watchdog)
  - Interactive Discover Phase Playgrounds across all exercises (`NQueensPlayground`, `IntervalSchedulingPlayground`, `KnapsackPlayground`, `ReductionIsVcPlayground`, `VertexCoverApproxPlayground`, `MaxSubarrayPlayground`, `JuanElVagoPlayground`, `LinearProgrammingPlayground`, `RandomizedFairCoinPlayground`)
  - Real Python execution in browser via Pyodide Web Worker (`pythonTestRunner.ts` and `SolveView.tsx`) with stdout capture and execution benchmarking
  - P13: Problem Reductions (`vertex-cover-reduction`: Independent Set $\le_P$ Vertex Cover, K&T 8.1 duality theorem, bidirectional proof, SVG graph, and interactive Discover playground)
  - P14: Approximation Algorithms (`vertex-cover-approx`: 2-Approximation via Maximal Matching, K&T 11.1 lower-bound proof $|C^*| \ge |M|$, ratio metric, and interactive Discover playground)
  - Divide and Conquer Core: `max-subarray-dyc` (Guía DyC Ejercicio Resuelto ★, $O(n \log n)$ Master Theorem vs Kadane $O(n)$)
  - Dynamic Programming 1D Core: `juan-el-vago` (Guía PD Ejercicio 4 ★, non-consecutive days recurrence $\text{OPT}(i) = \max(\text{OPT}(i-1), \text{OPT}(i-2) + g_i)$ with full reconstruction)
  - Linear Programming Core: `linear-programming-formulation` (Guía PL Ejercicios 1, 2, 3 ★, 2D polytope, convex polygon vertices, simplex level curves, ILP modeling)
  - Randomized Algorithms Core: `randomized-fair-coin` (Guía Algoritmos Randomizados Ejercicio 3 ★, Von Neumann 1951 Las Vegas Bernoulli pair extraction, equiprobability proof, expected time $O(1)$)
  - Greedy Interval Covering Core: `road-antennas-greedy` (Guía Greedy Ejercicio 13 ★★, Antenas en una Ruta, Greedy Stays Ahead exchange argument, interactive highway sandbox and challenge mode)
  - Backtracking Pruning Core: `subset-sum-backtracking` (Guía Backtracking Ejercicio 11 ★, Subconjuntos que suman S con podas duales por exceso y déficit remanente, interactive builder, and search space reduction comparator)
  - Dynamic Programming Core: `coin-change-dp` (Guía PD Ejercicio 8 ★★, Cambio de Monedas con cantidad mínima, principio de Bellman $O(V \cdot |C|)$, reconstrucción por punteros, contraejemplo canónico Greedy $[1, 3, 4]$ target $6$, y caja registradora interactiva)
  - Divide & Conquer Core: `peak-finding-dyc` (Guía DyC Ejercicio 1 ★, Búsqueda de Pico en arreglo 1D con gradiente ascendente $O(\log n)$, Teorema Maestro $T(n) = T(n/2) + O(1)$, perfil de elevación montañoso interactivo y explorador de cumbres)
  - Dynamic Programming 2D Core: `lcs-dp` (Guía PD Ejercicio 9 ★★★, Subsecuencia Común Más Larga, subestructura óptima de Bellman $O(m \cdot n)$, tabla 2D con animaciones diagonales/ortogonales, reconstrucción de camino y simulador git diff)
  - Dynamic Programming Core: `weighted-interval-scheduling` (Guía PD Ejercicio 2 ★★★ / Kleinberg & Tardos 6.1, Intervalos Ponderados con precomputación de $p(j)$ vía búsqueda binaria en $O(n \log n)$, recurrencia de Bellman $\text{OPT}(j) = \max(\text{OPT}(j-1), v_j + \text{OPT}(p(j)))$, contraejemplo canónico contra Greedy que duplica el beneficio, y cronograma interactivo)
  - Divide & Conquer Core: `inversion-counting-dyc` (Guía DyC Ejercicio 6 ★★★ / CLRS 2-4 / Kleinberg & Tardos 5.3, Contar Inversiones en $O(n \log n)$ adaptando Merge Sort con conteo acumulativo de inversiones cruzadas $+(\text{len} - i)$ en $O(1)$, visualizador de intercalación y laboratorio interactivo con índice de Kendall Tau)
  - Greedy Core: `huffman-coding-greedy` (Guía Greedy Ejercicio 10 ★★★ / CLRS 16.3 / Kleinberg & Tardos 4.8, Codificación de Huffman con Min-Heap en $O(k \log k)$, códigos libres de prefijo de longitud variable con costo ponderado mínimo, demostración por argumento de intercambio, simulador interactivo de compresión en tiempo real y decodificador de bitstream)
  - 184 unit tests passing 100% across 31 test files
- **IN_PROGRESS**: Expanding next fundamental starred problem from curriculum
- **BLOCKED**: None
- **NEXT_TASK**: Backtracking: Knight's Tour / Graph Coloring (Coloreo de Grafos) or Divide & Conquer: Closest Pair of Points
- **OPEN_QUESTIONS**: Q-001, Q-002, Q-003, Q-004 (recorded in `IA/architect/questions.md`)
- **LAST_VERIFIED**: `npm run lint && npm run typecheck && npm run test && npm run build` (All PASS, 184 tests)
- **LAST_COMMIT**: `ce7bd76`





