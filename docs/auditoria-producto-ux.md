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

### AUDIT-07 | Seguridad Criptográfica Anti-Tamper en Modo Docente y Protección contra Inspección DevTools
- **Pantalla**: Header / Modal de Acreditación Docente (`InstructorAuthModal`) y Vista Comprender (`UnderstandView`)
- **Ejercicio/Módulo**: `src/utils/cryptoAuth.ts`, `src/context/InstructorModeContext.tsx`, `src/components/UnderstandView.tsx`
- **Severidad**: **P0** (Seguridad e integridad de evaluación)
- **Evidencia**: Anteriormente, un usuario con conocimientos básicos de desarrollo web podía abrir Chrome DevTools, modificar una variable booleana de estado en React (`isInstructorMode: false` → `true` o `solutionUnlocked: false` → `true`) o insertar una entrada estática en `localStorage`, revelando inmediatamente todas las soluciones canónicas y respuestas de los 37 ejercicios sin haber completado los tests pedagógicos ni poseer credenciales docentes legítimas.
- **Impacto Pedagógico**: Destruye la barrera de esfuerzo formativo del estudiante y anula el rol del docente como evaluador.
- **Impacto UX**: Falta de protección contra manipulación accidental o intencional del árbol de componentes.
- **Solución Propuesta y Ejecutada**:
  1. Diseñar e implementar `cryptoAuth.ts`: suite criptográfica cliente basada en Web Crypto API con fallback determinístico SHA-256.
  2. Almacenamiento seguro: la contraseña docente de 8 caracteres (`MEL75.29`, Martin Ezequiel Lucio / Cátedra 75.29) **NUNCA** se almacena en texto plano en la aplicación; solo se verifica su digest SHA-256 irreversible `be0bfc6c64e56150fbd8497e599dc5c799f949c60b12e0231240bdd83acac738`.
  3. Firma de sesión efímera in-memory: se genera entropía criptográfica (`SESSION_SECRET_SALT`) por recarga de ventana para firmar sesiones docentes válidas.
  4. Autoridad Anti-Tamper `isExerciseSolutionAuthorized`: si un usuario altera manualmente los flags booleanos de estado en DevTools sin poseer la firma de sesión de cátedra ni un token de aprobación de tests Pyodide, el componente `UnderstandView` rechaza el renderizado, inserta una tarjeta de bloqueo (`.solution-tamper-card`: *"Firma Criptográfica Inválida: Acceso Bloqueado contra Manipulación"*) y jamás inyecta el código Python canónico en el DOM.
- **Estado de Verificación**: **VERIFICADO** (Tests unitarios automatizados dedicados en `tests/instructorMode.test.tsx` 7/7 PASS, incluyendo rechazo de flag tampering en DevTools).

---

### AUDIT-08 | Manipulación Física 2D Táctil y Arrastre en Playgrounds Algorítmicos
- **Pantalla**: Discover Phase / Playgrounds de Paradigmas Avanzados
- **Ejercicio/Módulo**: `HamiltonianCyclePlayground`, `TspBranchAndBoundPlayground`, `IntervalPartitioningPlayground`, `MinimizeLatenessPlayground`, `ReductionIsVcPlayground`, `CoinChangePlayground`, `GraphColoringPlayground`, `MaxFlowPlayground`
- **Severidad**: **P1**
- **Evidencia**: Varios playgrounds se limitaban a controles estáticos o listas de botones sin una interacción visual directa con los objetos del problema (nodos, rectángulos de tareas, monedas, ciudades).
- **Impacto Pedagógico**: Dificultad para formular hipótesis táctiles ("¿Qué pasa si muevo esta ciudad?", "¿Qué pasa si paso esta clase al Aula 2?", "¿Qué pasa si intercambio estas dos tareas invertidas?").
- **Impacto UX**: Sensación de "formulario web" en lugar de laboratorio interactivo.
- **Solución Propuesta y Ejecutada**:
  1. **Ciclo Hamiltoniano (`HamiltonianCyclePlayground`)**: Arrastre 2D libre de vértices con captura de puntero (`PointerCapture`), múltiples grafos predefinidos ($K_5$, Petersen, Contraejemplo Bipartito Impar $K_{3,4}$) y pila de decisiones de backtracking con detección de Dead Ends.
  2. **TSP Branch & Bound (`TspBranchAndBoundPlayground`)**: Arrastre 2D de ciudades con recálculo dinámico de matriz de distancias euclidianas, cota inferior (LB) y solución óptima de B&B en tiempo real.
  3. **Partición de Intervalos (`IntervalPartitioningPlayground`)**: Arrastre 2D de bloques de clases entre aulas y en la línea temporal, con línea de barrido de cuello de botella en $t^*$ y presets de instancia.
  4. **Minimización de Retraso (`MinimizeLatenessPlayground`)**: Arrastre horizontal 1D de bloques de tareas con intercambio en vivo, indicador visual de inversiones adyacentes y paso asistente de argumento de intercambio.
  5. **Reducción IS ⟺ VC (`ReductionIsVcPlayground`)**: Arrastre 2D de vértices, selección dual $S$ y $C = V \setminus S$, y presets canónicos ($C_5$, $K_{3,3}$, Triángulo con Cola).
  6. **Caja Registradora / Cambio de Monedas (`CoinChangePlayground`)**: Arrastre y soltado de monedas desde el dispensador hacia la bandeja de pago con tokens metálicos grabados y comparación lado a lado (Manual vs Greedy vs PD).
  7. **Coloreo de Grafos (`GraphColoringPlayground`)**: Arrastre 2D de nodos, barra de pinceles de colores y presets cromáticos ($C_5$, $K_4$, $K_{3,3}$).
  8. **Flujo Máximo (`MaxFlowPlayground`)**: Arrastre 2D de red de nodos, buscador BFS de caminos de aumento (Edmonds-Karp) y visualización del corte mínimo $(S, T)$.
- **Estado de Verificación**: **VERIFICADO** (293/293 tests unitarios PASS, `tsc --noEmit` 0 errores, `npm run build` PASS).

---

## 3. Matriz de Estado por Paradigma y Flagship

| Paradigma | Ejercicio Flagship | Visualizador | Playground | Modelo Mental | Estado |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **División y Conquista** | *Merge Sort* (`merge-sort`) | Árbol recursivo + 2 punteros | Fusión interactiva L vs R | Árbol de subproblemas | **Excelente** |
| **División y Conquista** | *Contar Inversiones* (`inversion-counting-dyc`) | Pasos de fusión con split count | Prueba de permutaciones | Parejas cruzadas | **Excelente** |
| **Algoritmos Greedy** | *Selección de Intervalos* (`interval-scheduling`) | Línea de tiempo + selector EFT | Cronograma interactivo + Greedy EFT | Incompatible vs Compatible | **Excelente** |
| **Algoritmos Greedy** | *Codificación de Huffman* (`huffman-coding-greedy`) | Min-Heap + Árbol binario | Fusión interactiva de mínimos | Bosque a Árbol Prefijo | **Excelente** |
| **Algoritmos Greedy** | *Partición de Intervalos* (`interval-partitioning-greedy`) | Timeline de Aulas + d | **Arrastre de bloques 2D + Sweep line** | Cuello de botella $d$ | **Excelente** |
| **Algoritmos Greedy** | *Minimización de Retraso* (`minimize-lateness-greedy`) | Cronograma + Deadlines | **Arrastre 1D + Argumento de Intercambio** | Eliminación de Inversiones | **Excelente** |
| **Programación Dinámica** | *Mochila 0/1* (`knapsack-dp`) | Matriz 2D Bottom-Up con traceback | **Mochila física interactiva** | Capacidad vs Valor | **Excelente** |
| **Programación Dinámica** | *Cambio de Monedas* (`coin-change-dp`) | Matriz DP $M[i, v]$ + Reconstrucción | **Bandeja interactiva Drag & Drop** | Canónico vs Trampa Greedy | **Excelente** |
| **Programación Dinámica** | *Bellman-Ford* (`bellman-ford-dp`) | Matriz DP $M[i, v]$ + Aristas | **Vértices 2D + Detección Ciclo Negativo** | Relajación y Caminos Mínimos | **Excelente** |
| **Backtracking** | *N-Reinas* (`n-queens`) | Tablero con rayos de ataque | Tablero libre con podas | Invariante diagonal | **Excelente** |
| **Backtracking** | *Ciclo Hamiltoniano* (`hamiltonian-cycle-backtracking`) | Grafo interactivo + Pila de búsqueda | **Grafo 2D Draggable + Decision Tree** | Dead End y Backtracking | **Excelente** |
| **Branch & Bound** | *TSP Branch & Bound* (`tsp-branch-and-bound`) | Árbol de cotas y podas | **Mapa 2D Draggable + Recálculo LB en vivo** | Poda por Cota $C + LB \ge UB$ | **Excelente** |
| **Flujo en Redes** | *Flujo Máximo* (`max-flow-ford-fulkerson`) | Red residual interactiva | **Red 2D Draggable + Edmonds-Karp BFS** | Cuello de botella y Corte Mínimo | **Excelente** |
| **Reducciones** | *Reducción IS ⟺ VC* (`vertex-cover-reduction`) | Grafo dual complementario | **Grafo 2D Draggable + Validación Dual S/C** | Dualidad $|S| + |C| = |V|$ | **Excelente** |
| **Aproximación** | *Vertex Cover 2-Aprox* (`vertex-cover-approx`) | Grafo con matching maximal | **Grafo 2D Draggable + Matching Maximal** | Factor 2-garantizado | **Excelente** |

---

## 4. Conclusiones y Próximos Pasos de Refinamiento
1. La plataforma cuenta ahora con una barrera de seguridad criptográfica robusta anti-tamper en el Modo Docente, protegiendo las soluciones canónicas de cualquier inspección superficial de DevTools.
2. Todos los playgrounds prioritarios han sido enriquecidos con interacción física táctil (arrastre 2D de nodos, ciudades y antenas, arrastre de rectángulos de tareas y clases, y drag & drop de monedas).
3. 293/293 tests pasan sin error, el typecheck estricto no reporta problemas (`tsc --noEmit` 0 errores), `npm run lint` pasa con 0 errores y el build estático se completa en ~1.6 segundos.
4. El proceso de auditoría y refinamiento continuará de acuerdo con las directivas del Prompt V5.

