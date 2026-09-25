# Visual TDA — Master Product, UX & Pedagogical Mission V5 Roadmap

Este documento define la hoja de ruta y prioridades operativas de Visual TDA para la **Misión V5**, enfocada en la excelencia pedagógica universitaria (estándar FIUBA / Kleinberg & Tardos) y calidad visual real.

---

## 1. Hitos Completados en Misión V5

1. ✅ **Reorganización Curricular del Catálogo (P1, Prompt V5 §§8-10)**:
   - Orden pedagógico Kleinberg & Tardos en pistas y filtros: Divide & Conquer -> Greedy -> DP -> Backtracking & Ramificación -> Flujo & LP -> Reducciones & Avanzados.
   - Recomendación inicial redirigida a *Interval Scheduling* (Greedy, K&T Cap. 4) con foco en *Greedy Stays Ahead*.
2. ✅ **Navegación con Fase Objetivo en Recomendaciones (P1, Prompt V5 §11)**:
   - CTAs de recomendación conducen a la fase pedagógicamente prevista (`initialPhase: 'discover' | 'solve' | 'understand'`).
3. ✅ **Modelo Visual de Mochila de Carga (P1, Prompt V5 §22, §28)**:
   - Componente `KnapsackVisualBag.tsx` con manija, bloques proporcionales al peso, holgura libre, alerta de desborde y soporte fraccional.
   - Integrado en `KnapsackPlayground`, `KnapsackDpVisualizer` y `KnapsackGreedyVisualizer`.
4. ✅ **Optimización de Espacio Vertical y "Above-the-Fold" (P1, Prompt V5 §§20-21)**:
   - `--max-width: 1440px` en `variables.css`.
   - Compactación de paddings en `.phase-view`, `.discover-header-card` e ilustraciones para visualización de lienzos sin scroll en pantallas 1366x768 y 1440x900.
5. ✅ **Entregables de Documentación V5 Generados (§§317–324)**:
   - `docs/product-ux-audit.md` (Entregable 1)
   - `docs/visual-design-system.md` (Entregable 2)
   - `docs/exercise-quality-matrix.md` (Entregable 3)
   - `docs/pedagogical-language-guide.md` (Entregable 4)
   - `docs/known-issues.md` (Entregable 5)
   - `IA/architect/state.md` (Entregable 6)
   - `IA/architect/next.md` (Entregable 7)
   - `IA/sessions/2026-09-25.md` (Entregable 8)
6. ✅ **Seguridad Criptográfica y Modo Docente ("Ser Docente")**:
   - Modal de autenticación de 8 caracteres exactos (`InstructorAuthModal.tsx`).
   - Token SHA-256 criptográfico (`cryptoAuth.ts`) sin filtración de contraseñas en texto plano ni vulnerabilidad a inspección de DevTools (`false` -> `true`).
7. ✅ **Overhaul de Playgrounds a Estándar Flagship (§350)**:
   - Arrastre interactivo de puntos 2D en `ClosestPairPlayground.tsx` y `SegmentedLeastSquaresPlayground.tsx`.
   - Cronograma Gantt interactivo de aulas en `IntervalPartitioningPlayground.tsx`.
   - Cronograma interactivo de máquina única y deadlines en `MinimizeLatenessPlayground.tsx`.
   - Modelo geométrico de áreas 2x2 en `KaratsubaPlayground.tsx`.
   - Matriz de columnas de 5 BFPRT con cuadrantes de poda en `MedianOfMediansPlayground.tsx`.
   - Diagrama de arcos de estructura secundaria en `RnaSecondaryStructurePlayground.tsx`.
   - Arena de cancelación de Boyer-Moore e inspección D&C en `MajorityElementPlayground.tsx`.

---

## 2. Próximas Prioridades Operativas

1. **Revisión Continua de los Ejercicios Restantes**:
   - `road-antennas-greedy`: Incorporar arrastre de estaciones a lo largo de la ruta y ajuste dinámico de radio $R$.
   - `knights-tour-backtracking`: Agregar interacción de selección manual de casillas guiada por la heurística de Warnsdorff.
   - `coin-change-dp`: Agregar comparación visual en vivo entre la solución voraz (subóptima en monedas arbitrarias) y la tabla DP.
   - `vertex-cover-approx`: Interacción para seleccionar aristas maximales independientes y ver la cota 2-aproximada.
2. **Monitoreo de Calidad**:
   - `npm run lint`: 0 errores.
   - `npm run typecheck`: 0 errores.
   - `npm test`: 292/292 pruebas vitest (100% PASS).
   - `npm run build`: compilación estática a `dist/`.
   - `node scripts/browserQA.mjs`: 22/22 escenarios Chromium en 5 resoluciones con 0 errores de consola.

