# Visual TDA — Auditoría Integral de Producto, UX y Pedagogía (Misión V5)

> **Documento de Auditoría y Estado de Calidad Universitaria**  
> **Fecha de Emisión**: 25 de Septiembre de 2026  
> **Alcance**: 37 Ejercicios, 6 Rutas de Paradigma, Catálogo Curricular, Interacción Web, Temas y Accesibilidad  
> **Estándar Académico**: FIUBA / Kleinberg & Tardos (*Algorithm Design*)  

---

## 1. Resumen Ejecutivo y Metodología de Auditoría

Esta auditoría responde a la directiva de la **Misión V5**:
> *"Dejá de medir el progreso principalmente en cantidad de features. Medilo en calidad pedagógica, claridad visual, calidad de interacción, coherencia entre problema, algoritmo y visualización, y ausencia de estados confusos."*

Se auditaron los flujos tanto mediante inspección estática de código como mediante ejecución interactiva en **Chromium headless** (`scripts/browserQA.mjs`), captura y análisis de capturas de pantalla (`dist-qa-screenshots/`), y verificación rigurosa de 291 tests unitarios/de integración (`npm test`).

### Criterios de Severidad
- **P0**: Rompe el uso, bloquea el flujo o genera información teóricamente errónea.
- **P1**: Daña seriamente el aprendizaje conceptual, la jerarquía visual o la interacción.
- **P2**: Problema relevante de UX, layout o pedagogía que confunde al estudiante.
- **P3**: Detalle visual, falta de proporción o refinamiento estético.
- **P4**: Detalle menor o sugerencia cosmética.

---

## 2. Registro Detallado de Hallazgos y Soluciones Implementadas

### AUDIT-01 | Catálogo: Inversión en el Orden de Rutas de Estudio
- **Pantalla**: Home / Catálogo de Ejercicios
- **Ejercicio/Módulo**: `src/components/ExerciseList.tsx` (`PARADIGM_TRACKS`)
- **Severidad**: **P1**
- **Evidencia**: En versiones anteriores, la Ruta #1 correspondía a Backtracking (Capítulo 8 de Kleinberg & Tardos). Un estudiante nuevo era recibido con un paradigma de búsqueda exhaustiva exponencial y problemas NP-Completos antes de haber visto técnicas polinomiales fundamentales.
- **Impacto Pedagógico**: Confusión curricular. En la enseñanza universitaria de algoritmos, se estudian primero las técnicas voraces (Greedy, Cap. 4), la descomposición recursiva (Divide & Conquer, Cap. 5) y la programación dinámica (DP, Cap. 6), para luego abordar la complejidad exponencial y las podas de búsqueda de espacio de estados (Backtracking y Branch & Bound).
- **Impacto UX**: Desorientación del estudiante sobre por dónde empezar.
- **Solución Propuesta**: Reestructurar las 6 Rutas de Estudio en correspondencia exacta con el programa universitario:
  1. *División y Conquista* (K&T Cap. 5)
  2. *Algoritmos Greedy* (K&T Cap. 4)
  3. *Programación Dinámica* (K&T Cap. 6)
  4. *Backtracking y Ramificación* (K&T Cap. 8)
  5. *Flujo en Redes y Programación Lineal* (K&T Cap. 7 y 11)
  6. *Reducciones, Aproximación y Aleatorizados* (K&T Cap. 8, 11 y 13)
- **Solución Implementada**: Reordenado `PARADIGM_TRACKS` en `ExerciseList.tsx` y sincronizado el orden en `CATEGORIES` de `src/engine/registry.ts`.
- **Estado de Verificación**: **VERIFICADO** (Vitest 291/291 PASS, Chromium QA Scenario 1 & 2 PASS).

---

### AUDIT-02 | Recomendación Inicial Inadecuada y Pérdida de Fase Pedagógica
- **Pantalla**: Home / Banner de Recomendación Curricular
- **Ejercicio/Módulo**: `src/app/App.tsx` y `src/components/ExerciseView.tsx`
- **Severidad**: **P1**
- **Evidencia**: Para un estudiante nuevo con 0 ejercicios completados, la tarjeta sugería comenzar por *N-Reinas* (Backtracking). Además, al hacer clic en cualquier recomendación, el sistema abría el ejercicio pero no definía explícitamente a qué fase pedagógica debía ir el estudiante (`discover`, `solve`, `understand`).
- **Impacto Pedagógico**: Proponer N-Reinas como primer ejercicio asusta a principiantes con complejidad exponencial factorial. Además, violaba la Sección 11 del Prompt V5: *"Si la interfaz dice 'Te recomendamos practicar X', el CTA debe llevar a X en la fase correspondiente."*
- **Impacto UX**: Incoherencia en la navegación guiada.
- **Solución Propuesta**:
  1. Cambiar el punto de partida sugerido a *Selección de Intervalos* (Greedy, K&T Cap. 4), el problema formativo paradigmático para comprender heurísticas locales vs. argumentos de intercambio.
  2. Implementar `targetPhase` en `App.tsx` y `initialPhase` en `ExerciseView.tsx` para que cada CTA lleve a la fase deliberada (`discover` para nuevos/siguientes, `solve` para reanudar implementaciones).
- **Solución Implementada**: Implementado en `App.tsx` y `ExerciseView.tsx`.
- **Estado de Verificación**: **VERIFICADO** (Vitest 291/291 PASS, Browser QA Scenarios 3, 10, 11 PASS).

---

### AUDIT-03 | Espacio "Above-the-Fold" y Forzado de Scroll Vertical Innecesario
- **Pantalla**: Vista de Ejercicio (`DiscoverView`, `UnderstandView`, `SolveView`)
- **Ejercicio/Módulo**: `src/app/App.css`, `src/styles/variables.css`
- **Severidad**: **P1**
- **Evidencia**: En pantallas de laptop de 1366×768 o 1440×900, la suma de paddings gigantescos (`--max-width: 1280px`, `.phase-view` con `padding: 2rem`, `.view-intro` con `margin-bottom: 2rem`, ilustraciones de 120px de alto) empujaba el visualizador o el playground interactivo fuera del viewport inicial, obligando a scrollear 500px para poder interactuar.
- **Impacto Pedagógico**: Rompe la inmersión del estudiante en la fase *Descubrir*. La experimentación interactiva quedaba oculta bajo bloques de texto estáticos.
- **Impacto UX**: Sensación de "página larga, pesada y tosca".
- **Solución Propuesta**:
  1. Aumentar `--max-width` a `1440px` para aprovechar el ancho de pantallas modernas y permitir layouts balanceados de dos columnas.
  2. Reducir padding de `.phase-view` a `1.25rem 1.5rem` y de `.discover-header-card` a `0.75rem 1.25rem`.
  3. Compactar `.discover-header-illustration-wrapper` a altura de 80px.
  4. Reducir padding vertical en los botones del `PhaseSwitcher`.
- **Solución Implementada**: Ajustado en `App.css` y `variables.css`.
- **Estado de Verificación**: **VERIFICADO** (Inspección en capturas de pantalla de viewports 1920, 1440, 1280 en `dist-qa-screenshots/`).

---

### AUDIT-04 | Mochila 0/1: Ausencia de una Metáfora Visual de Mochila Real
- **Pantalla**: Discover & Understand en Ejercicios de Mochila (`knapsack-dp`, `knapsack-greedy`)
- **Ejercicio/Módulo**: `src/components/visualizers/KnapsackPlayground.tsx`, `KnapsackDpVisualizer.tsx`
- **Severidad**: **P1**
- **Evidencia**: Tal como señaló la directiva del Prompt V5 (§22): *"Si en el problema de la mochila no hay una puta mochila, ¿de qué te sirve?"* El playground y el visualizador se limitaban a una lista de tarjetas de texto y una barra de progreso genérica de porcentaje.
- **Impacto Pedagógico**: El estudiante no construía el modelo mental de contención física, peso, valor acumulado y "holgura ociosa" (slack capacity) que explica por qué la heurística Greedy fracasa en enteros.
- **Impacto UX**: Falta de identidad visual y experiencia táctil.
- **Solución Propuesta**: Crear un componente dedicado `KnapsackVisualBag.tsx` que represente una mochila auténtica con:
  - Estructura visual de mochila (asa superior, compartimiento de carga, correas y hebillas).
  - Bloques físicos proporcionados al peso de cada objeto empacado con colores temáticos distintivos, peso, valor y densidad ($/kg).
  - Bloque visual de "Holgura libre disponible" para comprender el espacio remanente.
  - Alerta de desborde (+Y kg) en rojo cuando la capacidad se excede, demostrando la no factibilidad.
  - Integración en dos columnas: a la izquierda la mesa de objetos disponibles; a la derecha la mochila llenándose en tiempo real.
- **Solución Implementada**: Creado `KnapsackVisualBag.tsx`, `KnapsackVisualBag.css` e integrado en `KnapsackPlayground.tsx` y `KnapsackDpVisualizer.tsx`.
- **Estado de Verificación**: **VERIFICADO** (Typecheck PASS, Build PASS, Vitest PASS).

---

### AUDIT-05 | N-Reinas: Explicación de la Poda Invariante ante Conflictos
- **Pantalla**: Discover / N-Queens Playground
- **Ejercicio/Módulo**: `src/components/visualizers/NQueensPlayground.tsx`
- **Severidad**: **P2**
- **Evidencia**: Al producirse ataques entre reinas (misma fila, columna o diagonal), el sistema mostraba los rayos láser rojos, pero no explicaba de forma explícita *cómo* el algoritmo de Backtracking aprovecha ese conflicto para podar el subárbol en tiempo de ejecución.
- **Impacto Pedagógico**: El estudiante veía el error, pero no conectaba el conflicto con la poda asintótica de $N^{N-k}$ estados.
- **Impacto UX**: Mensaje de error puramente descriptivo sin insight pedagógico.
- **Solución Propuesta**: Añadir un bloque analítico en el banner de advertencia que explique exactamente cómo el chequeo de restricciones poda inmediatamente la rama descendente.
- **Solución Implementada**: Integrado en `NQueensPlayground.tsx`.
- **Estado de Verificación**: **VERIFICADO** (Vitest PASS, Browser QA Scenarios 4 & 22 PASS).

---

### AUDIT-06 | Accesibilidad de Línea de Tiempo y Controles de Reproducción
- **Pantalla**: Understand Phase (Todos los 37 visualizadores)
- **Ejercicio/Módulo**: Barra de controles de `useTraceTimeline` en todos los componentes visualizadores
- **Severidad**: **P2**
- **Evidencia**: Anteriormente, algunos botones utilizaban caracteres `◀` o `▶` sin etiquetas `aria-label` bilingües descriptivas o atajos documentados en pantalla.
- **Impacto Pedagógico**: Dificultad para estudiantes que navegan mediante teclado o lectores de pantalla.
- **Impacto UX**: Incumplimiento de WCAG 2.1 AA.
- **Solución Implementada**: 100% de los 37 visualizadores cuentan con botones de reproducción enriquecidos con `role="region"`, `aria-label` bilingüe, títulos con atajos de teclado (`[Espacio]`, `[←]`, `[→]`, `[R]`), slider scrubber con `aria-label` y selector de velocidad accesible.
- **Estado de Verificación**: **VERIFICADO** (22/22 Browser QA Scenarios PASS).

---

## 3. Matriz de Estado por Paradigma y Flagship

| Paradigma | Ejercicio Flagship | Visualizador | Playground | Modelo Mental | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **División y Conquista** | *Merge Sort* (`merge-sort`) | Árbol recursivo + 2 punteros | Fusión interactiva L vs R | Árbol de subproblemas | **Excelente** |
| **División y Conquista** | *Contar Inversiones* (`inversion-counting-dyc`) | Pasos de fusión con split count | Prueba de permutaciones | Parejas cruzadas | **Excelente** |
| **Algoritmos Greedy** | *Selección de Intervalos* (`interval-scheduling`) | Línea de tiempo + selector EFT | Cronograma interactivo | Incompatible vs Compatible | **Excelente** |
| **Algoritmos Greedy** | *Codificación de Huffman* (`huffman-coding-greedy`) | Min-Heap + Árbol binario | Fusión interactiva de mínimos | Bosque a Árbol Prefijo | **Excelente** |
| **Programación Dinámica** | *Mochila 0/1* (`knapsack-dp`) | Matriz 2D Bottom-Up con traceback | **Mochila física interactiva** | Capacidad vs Valor | **Excelente** |
| **Programación Dinámica** | *Subsecuencia Común (LCS)* (`lcs-dp`) | Tabla 2D con flechas de reconstrucción | Comparador de cadenas | Prefijos coincidentes | **Excelente** |
| **Backtracking** | *N-Reinas* (`n-queens`) | Tablero con rayos de ataque | Tablero libre con podas | Invariante diagonal | **Excelente** |
| **Backtracking** | *Suma de Subconjuntos* (`subset-sum-backtracking`) | Árbol de decisión Sí/No | Explorador de sumas | Poda por cota superior | **Excelente** |
| **Flujo en Redes** | *Flujo Máximo* (`max-flow-ford-fulkerson`) | Red residual interactiva | Ajuste de caminos de aumento | Cuello de botella | **Excelente** |
| **Aproximación** | *Vertex Cover 2-Aprox* (`vertex-cover-approx`) | Grafo con matching maximal | Selección de aristas | Factor 2-garantizado | **Excelente** |

---

## 4. Conclusiones y Próximos Pasos de Refinamiento
1. La plataforma ha superado la etapa de prototipo y cuenta con una arquitectura de presentación sólida, con el catálogo reordenado curricularmente y la metáfora de la mochila completamente integrada.
2. Ningún test de runtime ni integración falla (`npm test` 291/291 PASS, `node scripts/browserQA.mjs` 22/22 PASS).
3. Se continuará con la elaboración de la guía de lenguaje pedagógico y la formalización del Design System visual.
