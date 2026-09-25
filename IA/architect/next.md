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

---

## 2. Próximas Prioridades Operativas

1. **Revisión Continua de los 10 Ejercicios Flagship (§203)**:
   - `n-queens`: Refinar la experiencia de contraejemplos interactivos de ataque en diagonal.
   - `knapsack-greedy` vs `knapsack-dp`: Ampliar el análisis comparativo del quiebre de la heurística voraz en mochila entera.
   - `huffman-coding-greedy`: Mantener sincronizados los pasos del Min-Heap con las ramas del árbol SVG y el prefijo de código libre.
   - `dijkstra-greedy`: Verificar el contraejemplo con aristas de peso negativo y la cola de prioridad.
   - `merge-sort` & `inversion-counting-dyc`: Consolidar la visualización del árbol de recursión y el búfer auxiliar.
   - `tsp-branch-and-bound`: ✅ Implementado lienzo SVG 2D interactivo con mapa de ciudades argentinas y cálculo en vivo de cota inferior ($C + LB$) con poda estricta por incumbent.
   - `knapsack-branch-and-bound`: Verificar el indicador de cota optimista (relajación continua) y podas por incumbent.
   - `max-flow`: Profundizar la visualización del corte mínimo ($S, T$) y capacidades residuales.
   - `linear-programming-formulation`: Afinar el poliedro 2D y el vector gradiente.
2. **Propagación del Estándar Flagship a los 27 Ejercicios Restantes (§204)**:
   - Elevar los ejercicios clasificados como `Sólido` en la matriz de calidad mediante la incorporación de microinteracciones específicas y mejores explicaciones del "por qué".
3. **Mantenimiento del Quality Gate Completo**:
   - `npm run lint`: 0 errores.
   - `npm run typecheck`: 0 errores.
   - `npm test`: 291/291 pruebas vitest.
   - `npm run build`: compilación estática a `dist/`.
   - `node scripts/browserQA.mjs`: 22/22 escenarios Chromium en 5 resoluciones con 0 errores de consola.
