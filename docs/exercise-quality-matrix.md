# Visual TDA — Exercise Quality & Pedagogical Verification Matrix

Este documento constituye la auditoría exhaustiva fila por fila de los **37 ejercicios** que componen la currícula completa de Técnicas de Diseño de Algoritmos (FIUBA / Kleinberg & Tardos).

Cada ejercicio es evaluado bajo el estándar de **Laboratorio Académico Universitario**:
- **Descubrir (Discover)**: Playground visual interactivo que permite ingresar datos arbitrarios, explorar contraejemplos, verificar invariantes y construir intuición *antes* de programar.
- **Resolver (Solve)**: Entorno de programación en Python ejecutado en el navegador vía Web Worker con Pyodide, pruebas automatizadas locales, pistas progresivas y retroalimentación pedagógica gradual.
- **Comprender (Understand)**: Solución canónica oficial bloqueada pedagógicamente hasta superar las pruebas (o modo docente), sincronizada con reproducción determinística de traza paso a paso, pseudocódigo formal y análisis asintótico de tiempo y espacio ($O$).

---

## Matriz de Calidad (37/37 Ejercicios)

| # | ID del Ejercicio | Paradigma / Track | Descubrir (Playground) | Resolver (Pyodide QA) | Comprender (Visualizador SVG + Traza) | Teoría Formal & Invariantes | Estado de Auditoría |
|---|---|---|---|---|---|---|---|
| 1 | `n-queens` | Backtracking | Interactivo N×N, detección amenazas fila/col/diagonales | Pruebas exhaustivas N=4..8 | Tablero SVG interactivo + árbol de búsqueda | Poda por filas, columnas y diagonales ($O(N!)$) | **VERIFIED** |
| 2 | `subset-sum-backtracking` | Backtracking | Generador de sumas, selector de elementos | Pruebas con podas por exceso y cota superior | Árbol binario de inclusión/exclusión SVG | Podas $S > \text{target}$ y $S + \text{restante} < \text{target}$ | **VERIFIED** |
| 3 | `graph-coloring-backtracking` | Backtracking | Asignación interactiva de $k$ colores, detección vecinos | Pruebas con $k$-colorabilidad en grafos cíclicos | Grafo SVG coloreado dinámicamente | Restricción de color vecinal | **VERIFIED** |
| 4 | `sudoku-backtracking` | Backtracking | Tablero 9x9 interactivo, inspector MRV | Pruebas con sudokus canónicos | Tablero 9x9 SVG con conteo de dominios | Heurística MRV (Minimum Remaining Values) | **VERIFIED** |
| 5 | `knights-tour-backtracking` | Backtracking | Tablero de ajedrez, guía de movimientos en L | Pruebas para tableros 5x5 y 8x8 | Tablero SVG con trayectoria de polilínea | Regla de Warnsdorff (grado mínimo saliente) | **VERIFIED** |
| 6 | `hamiltonian-cycle-backtracking` | Backtracking | Exploración manual de caminos, botón backtrack | Pruebas con ciclos y grafos no hamiltonianos | Grafo SVG con camino resaltado y retorno | Ciclo simple que visita cada vértice una vez | **VERIFIED** |
| 7 | `knapsack-branch-and-bound` | Branch & Bound | Ajuste de capacidad e ítems, cota fraccionaria | Pruebas de maximización con mochila | Árbol SVG 2D con podas $UB < \text{incumbent}$ | Relajación fraccionaria Greedy como cota superior | **VERIFIED** |
| 8 | `tsp-branch-and-bound` | Branch & Bound | Constructor de tour entre 5 ciudades | Pruebas con matriz simétrica | Mapa SVG + árbol con podas $LB \ge \text{incumbent}$ | Cota inferior de aristas mínimas salientes | **VERIFIED** |
| 9 | `merge-sort` | Divide & Conquer | Permutaciones interactivas | Pruebas de ordenamiento estable | Árbol de división y fusión SVG paso a paso | $T(n) = 2T(n/2) + O(n) \implies O(n \log n)$ | **VERIFIED** |
| 10 | `max-subarray-dyc` | Divide & Conquer | Ajuste de números positivos y negativos | Pruebas con arreglos mixtos y negativos | División mitad izq/der y banda de cruce central | Subproblema cruzado $O(n)$ en tiempo lineal | **VERIFIED** |
| 11 | `peak-finding-dyc` | Divide & Conquer | Búsqueda binaria 1D y 2D | Pruebas con múltiples picos locales | Gráfico de barras / cuadrícula con pendiente | Invariante de gradiente ascendente ($O(\log n)$) | **VERIFIED** |
| 12 | `inversion-counting-dyc` | Divide & Conquer | Contador de inversiones en línea | Pruebas idénticas a ranking de preferencias | Arreglo dividido con conteo acumulado | Fusión modificada con salto de índices ($O(n \log n)$) | **VERIFIED** |
| 13 | `closest-pair-dyc` | Divide & Conquer | Plano 2D interactivo, clic para agregar puntos | Pruebas con pares cercanos en franja $\delta$ | Eje de corte $x_{mid}$ y banda vertical $\delta$ | Propiedad de empaquetamiento: max 8 puntos en rectángulo | **VERIFIED** |
| 14 | `karatsuba-dyc` | Divide & Conquer | Multiplicador de enteros arbitrarios $X \times Y$ | Pruebas de multiplicación de enteros grandes | Descomposición en árbol de 3 productos | $T(n) = 3T(n/2) + O(n) \implies O(n^{1.585})$ | **VERIFIED** |
| 15 | `majority-element-dyc` | Divide & Conquer | Editor de arreglos, tabla de frecuencias | Pruebas con elementos mayoritarios y empates | División en mitades y conteo de candidatos | Condición estricta $> n/2$ apariciones | **VERIFIED** |
| 16 | `median-of-medians-dyc` | Divide & Conquer | Selector de k-ésimo elemento | Pruebas de ordenamiento lineal determinístico | Matriz de grupos de 5 y fila de medianas | $T(n) \le T(n/5) + T(7n/10) + O(n) \implies O(n)$ | **VERIFIED** |
| 17 | `interval-scheduling` | Greedy | Intervalos de clases, selector manual de charlas | Pruebas de maximización de tareas | Línea de tiempo con intervalos compatibles | Greedy Stays Ahead (Earliest Finish Time) | **VERIFIED** |
| 18 | `interval-partitioning-greedy` | Greedy | Asignador de aulas con detección de conflictos | Pruebas de mínima cantidad de aulas | Carriles horizontales por aula y marcador temporal | Invariante de profundidad $d$ (número cromático de intervalos) | **VERIFIED** |
| 19 | `minimize-lateness-greedy` | Greedy | Intercambio de tareas, contador de inversiones | Pruebas de minimización de retraso máximo | Línea de tiempo con pines de deadlines $d_i$ | Exchange Argument en Earliest Deadline First | **VERIFIED** |
| 20 | `knapsack-greedy` | Greedy | Selección de ítems continuos (mochila fraccional) | Pruebas de densidad valor/peso | Barras de peso y valor con llenado proporcional | Propiedad Greedy en ítems fraccionales ($O(n \log n)$) | **VERIFIED** |
| 21 | `road-antennas-greedy` | Greedy | Colocación de antenas con radio $R$ sobre ruta | Pruebas de cobertura total de casas | Ruta lineal con círculos de cobertura de antenas | Antena colocada en $x_{primera} + R$ | **VERIFIED** |
| 22 | `huffman-coding-greedy` | Greedy | Texto libre personalizado, frecuencias de caracteres | Pruebas de codificación de prefijo libre | Árbol binario SVG con nodos y frecuencias | Desigualdad de Kraft, optimalidad de prefijo | **VERIFIED** |
| 23 | `dijkstra-greedy` | Greedy | Origen interactivo, contraejemplo arista negativa | Pruebas de caminos mínimos en grafos no negativos | Grafo SVG + cola de prioridad de distancias | Greedy Stays Ahead / no aplicabilidad con negativos | **VERIFIED** |
| 24 | `kruskal-mst-greedy` | Greedy | Selección de aristas, verificación de cortes y ciclos | Pruebas de árbol de recubrimiento mínimo | Grafo SVG con componentes de color (Union-Find) | Propiedad del Corte (Cut Property) y del Ciclo | **VERIFIED** |
| 25 | `knapsack-dp` | Dynamic Programming | Matriz de peso vs valor, llenado celda a celda | Pruebas 0/1 mochila exacta | Tabla 2D DP interactiva con ruta de backtracking | Recurrencia $OPT(i, w) = \max(OPT(i-1, w), v_i + OPT(i-1, w-w_i))$ | **VERIFIED** |
| 26 | `juan-el-vago` | Dynamic Programming | Selección de días de descanso consecutivos | Pruebas de valor máximo sin días contiguos | Arreglo unidimensional de memoización | Recurrencia lineal $OPT(i) = \max(OPT(i-1), g_i + OPT(i-2))$ | **VERIFIED** |
| 27 | `coin-change-dp` | Dynamic Programming | Cambio de monedas con denominaciones arbitrarias | Pruebas con monedas canónicas y no canónicas | Gráfico de decisiones de cambio mínimo | Subestructura óptima unidimensional | **VERIFIED** |
| 28 | `lcs-dp` | Dynamic Programming | Comparación de dos cadenas de texto | Pruebas de subsecuencia común más larga | Matriz 2D con flechas de reconstrucción de caracteres | Coincidencia $s_1[i] == s_2[j]$ vs saltos | **VERIFIED** |
| 29 | `weighted-interval-scheduling` | Dynamic Programming | Intervalos ponderados con cálculo de $p(j)$ | Pruebas con búsqueda binaria de $p(j)$ | Línea de tiempo con flechas de compatibilidad $p(j)$ | Recurrencia $OPT(j) = \max(OPT(j-1), v_j + OPT(p(j)))$ | **VERIFIED** |
| 30 | `segmented-least-squares-dp` | Dynamic Programming | Deslizador de penalización de segmentos $C$ | Pruebas de ajuste óptimo de líneas | Gráfico de dispersión 2D + tabla DP $OPT[j]$ | Balance error residual vs penalización $e_{i,j} + C$ | **VERIFIED** |
| 31 | `rna-secondary-structure-dp` | Dynamic Programming | Secuencia interactiva de bases {A, U, C, G} | Pruebas con bucles de horquilla | Diagrama circular/lineal de arcos no cruzados | Recurrencia en intervalos con regla $t < j - 4$ | **VERIFIED** |
| 32 | `bellman-ford-dp` | Dynamic Programming | Grafo dirigido con aristas negativas y ciclos | Pruebas de detección de ciclo negativo en iteración \|V\| | Tabla 2D DP $M[i, v]$ y grafo sincronizado | Programación Dinámica para caminos mínimos | **VERIFIED** |
| 33 | `max-flow` | Redes de Flujo | Aumento de caminos residuales | Pruebas Ford-Fulkerson y Edmonds-Karp | Red residual SVG con capacidades y flujo actual | Teorema Max-Flow Min-Cut | **VERIFIED** |
| 34 | `linear-programming-formulation` | Programación Lineal | Poliedro de restricciones y vector gradiente | Pruebas con formulaciones estándar | Espacio 2D de soluciones factibles y vértices | Teorema fundamental de la programación lineal | **VERIFIED** |
| 35 | `vertex-cover-reduction` | Reducciones | Transformación entre Independent Set y Vertex Cover | Pruebas de equivalencia de conjuntos complementarios | Grafo bipartito/general con nodos complementarios | $S$ es Conjunto Independiente $\iff V \setminus S$ es Vertex Cover | **VERIFIED** |
| 36 | `vertex-cover-approx` | Algoritmos Aproximación | Selección maximal de aristas disjuntas | Pruebas de factor 2-aproximación | Grafo SVG con aristas de matching y vértices | Cota de calidad: $|C| \le 2 \cdot |C^*|$ | **VERIFIED** |
| 37 | `randomized-fair-coin` | Algoritmos Randomizados | Simulación de moneda sesgada de von Neumann | Pruebas estadísticas con semilla fija | Distribución de pares de tiros (HT vs TH) | Distribución geométrica de tiempo esperado $O(1)$ | **VERIFIED** |

---

## Conclusión de la Auditoría

- **Cobertura de Visualizadores**: **100% (37 / 37)**. Cero ejercicios huérfanos o con pantallas vacías.
- **Cobertura de Playgrounds Interactivos**: **100% (37 / 37)**. Cero ejercicios sin capacidad de experimentación directa del estudiante.
- **Separación de Responsabilidades**: Arquitectura estricta $\text{Algoritmo} \to \text{Traza} \to \text{Visualizador} \to \text{UI React}$.
- **Seguridad**: Ejecución de código del estudiante contenida en Web Worker aislado con Pyodide, sin llamadas de red ni acceso al DOM.
- **Accesibilidad**: Etiquetas ARIA, navegación por teclado y soporte para modos claro y oscuro.
