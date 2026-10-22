# Roadmap de Visual TDA

Estado y planificación de los hitos del proyecto:

---

## Estado Actual de Hitos

| Hito | Descripción | Estado |
| :--- | :--- | :---: |
| **P0: Base y Herramientas** | Vite, React 19, TypeScript strict mode, Vitest, ESLint, `.gitignore` y CI workflow. | **Completado** |
| **P1: Shell y Catálogo** | Modelos de dominio (`src/types/`), Registro (`src/engine/registry.ts`), sistema de diseño CSS, barra de navegación y temas claro/oscuro. | **Completado** |
| **P2: Flujo en 3 Fases** | Componentes pedagógicos: Descubrir, Resolver (con pistas y diálogo de salto a solución) y Comprender (código canónico, invariantes y complejidad). | **Completado** |
| **P3: N-Reinas Slice** | Código canónico en Python (`solution.py`), teoría con demostración de invariantes, pseudocódigo y metadatos. | **Completado** |
| **P4: Motor de Trazas y Visualizador** | Generador determinístico de traza (`nQueensTrace.ts`), validador formal de restricciones, hook de línea de tiempo con velocidad/reproducción, tablero SVG con rayos de conflicto, y sandbox de descubrimiento. | **Completado** |
| **P5: CI y Documentación** | Workflow de GitHub Actions y sincronización de arquitectura/README. | **Completado** |
| **P6: Selección de Intervalos** | Técnica Greedy con lema *Greedy Stays Ahead* y visualizador temporal de tareas. | **Completado** |
| **P7: Mochila Dual (Greedy vs DP)** | Programación Dinámica con tabla 2D y recurrencia vs Greedy Fraccionario por densidad y contraejemplo 0/1. | **Completado** |
| **P8: Internacionalización (i18n)** | Selector de idioma (`es` / `en`), `LanguageContext` y tipado estricto en catálogo y fases. | **Completado** |
| **P9: Merge Sort (División y Conquista)** | Árbol de recursión, partición en mitades y procedimiento Merge lineal con gráfico de barras. | **Completado** |
| **P10: Fase Resolver y Pistas** | Código inicial por ejercicio, pistas progresivas en 3 niveles y ejecución de pruebas con tarjetas PASS/FAIL. | **Completado** |
| **P11: Redes de Flujo (Edmonds-Karp)** | Flujo Máximo y Corte Mínimo con red residual, caminos de aumento BFS y teorema Max-Flow Min-Cut. | **Completado** |
| **P12: Pyodide Web Worker Sandbox** | Ejecución de Python en navegador sin dependencias de backend, con captura de `stdout`, watchdog de bucles infinitos y visualización de trazas de error. | **Completado** |
| **P13: Reducción de Problemas** | Demostración formal de $IS \le_P VC$ (Kleinberg & Tardos 8.1), grafo SVG y laboratorio interactivo de dualidad. | **Completado** |
| **P14: Algoritmos de Aproximación** | 2-Aproximación greedy para Cobertura de Vértices vía Matching Maximal (K&T 11.1) con cota inferior $|C^*| \ge |M|$. | **Completado** |
| **P15: Catálogo Completo (38 Ejercicios)** | Expansión del catálogo académico a 38 ejercicios interactivos cubriendo Algoritmos Randomizados, Programación Lineal, Branch & Bound, y más. | **Completado** |
