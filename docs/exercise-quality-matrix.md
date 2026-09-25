# Visual TDA — Multidimensional Exercise Quality & Pedagogical Matrix

Este documento constituye la auditoría multidimensional exhaustiva de los **37 ejercicios** que componen la currícula completa de Teoría y Diseño de Algoritmos (FIUBA / Kleinberg & Tardos standard), en cumplimiento estricto con la **Directiva V5 (§196, §197 y §319)**.

De acuerdo con el mandato V5, **la existencia de un componente SVG o el paso de un test unitario no equivale a calidad pedagógica**. Esta matriz evalúa cada ejercicio en 6 dimensiones cualitativas y cuantitativas (escala 1 a 5, donde 5 representa el estándar universitario *Flagship*):

- **Pedagógica (Ped)**: Profundidad conceptual, explicitación de invariantes, argumentos de intercambio y costo asintótico ($O$).
- **Visual (Vis)**: Composición espacial, legibilidad tipográfica, jerarquía, contraste WCAG y ausencia de saturación.
- **Interacción (Int)**: Manipulación directa, capacidad de formular hipótesis, detección de estados inválidos y animaciones con propósito cognitivo.
- **Custom Inputs (CI)**: Capacidad de introducir datos propios arbitrarios del estudiante (`Sí`, `Parcial`, `No`).
- **Understand (Und)**: Calidad del visualizador sincronizado con la traza determinística paso a paso.
- **Por Qué (PQ)**: Capacidad del ejercicio de responder *por qué* el algoritmo toma cada decisión y *por qué* es correcto.
- **Estado General**: `Flagship` (referencia máxima), `Sólido` (robusto y completo), `Requiere Refinamiento` (funcional pero mejorable), `Básico` (cumple especificación mínima).

---

## Matriz Multidimensional de Calidad (37 Ejercicios)

### Track 1: Divide & Conquer (K&T Cap. 5)

| ID del Ejercicio | Nombre Académico | Ped | Vis | Int | CI | Und | PQ | Estado General | Notas Pedagógicas & Visuales |
|---|---|---|---|---|---|---|---|---|---|
| `merge-sort` | Ordenamiento por Fusión | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Árbol de recursión SVG con buffer de fusión paso a paso, subproblemas coloreados y recurrencia $T(n)=2T(n/2)+O(n)$. |
| `max-subarray-dyc` | Subarreglo de Suma Máxima | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Segmentación mitad izq/der y banda de cruce central $O(n)$ con comparación explícita contra Kadane. |
| `peak-finding-dyc` | Búsqueda de Picos (1D y 2D) | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Gráfico de perfil de elevación con gradiente ascendente y descarte de mitades en tiempo $O(\log n)$. |
| `inversion-counting-dyc` | Conteo de Inversiones | 5 | 4 | 4 | Sí | 5 | 5 | **Flagship** | Ranking de preferencias, contador de pares en desorden y fusión modificada con salto de índices. |
| `closest-pair-dyc` | Par Más Cercano en 2D | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Plano cartesiano interactivo 2D con arrastre de puntos (drag & drop), recálculo en vivo de $\delta$, línea divisoria $x = L$ y banda central. |
| `karatsuba-dyc` | Multiplicación de Karatsuba | 5 | 5 | 4 | Sí | 5 | 5 | **Flagship** | Modelo geométrico de áreas 2x2 SVG demostrando el ahorro del 25% de multiplicaciones ($z_1 = z_{\text{sum}} - z_2 - z_0$) y recurrencia $O(n^{1.585})$. |
| `median-of-medians-dyc` | Mediana de Medianas | 5 | 5 | 4 | Sí | 5 | 5 | **Flagship** | Matriz BFPRT SVG en columnas de 5, fila de medianas destacada y cuadrantes de poda garantizada $\ge 30\%$ que colapsan la recurrencia a $O(n)$. |
| `majority-element-dyc` | Elemento Mayoritario | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Tarjetas de elementos interactivas, inspección recursiva por mitades D&C y arena de cancelación en parejas de Boyer-Moore en $O(n)$. |

---

### Track 2: Algoritmos Greedy (K&T Cap. 4)

| ID del Ejercicio | Nombre Académico | Ped | Vis | Int | CI | Und | PQ | Estado General | Notas Pedagógicas & Visuales |
|---|---|---|---|---|---|---|---|---|---|
| `interval-scheduling` | Planificación de Intervalos | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Ejercicio introductorio sugerido. Timeline SVG, regla Earliest Finish Time y demostración de Greedy Stays Ahead. |
| `interval-partitioning-greedy` | Particionado de Intervalos (Aulas) | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Cronograma Gantt SVG interactivo de aulas (A1–A5), detección de solapamientos en rojo, reasignación con un clic y prueba de cota $d$. |
| `minimize-lateness-greedy` | Minimización de Demora Máxima | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Cronograma de procesamiento SVG de máquina única, pines de deadline $d_i$, bandas de retraso $L_i$ y eliminación interactiva de inversiones. |
| `knapsack-greedy` | Mochila Fraccionaria | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Modelo físico de mochila de carga (`KnapsackVisualBag`), llenado continuo por densidad y contraejemplo 0/1. |
| `road-antennas-greedy` | Cobertura de Antenas en Ruta | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Ruta lineal interactiva con discos de radio $R$, justificación de colocar antena en $x_{primera} + R$. |
| `huffman-coding-greedy` | Codificación de Huffman | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Min-Heap cards, árbol binario SVG paso a paso, prefijo libre y cálculo de ahorro de bits frente a ASCII 8b. |
| `dijkstra-greedy` | Caminos Mínimos de Dijkstra | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Grafo SVG interactivo, cola de prioridad, relajación de aristas y contraejemplo con aristas de peso negativo. |
| `kruskal-mst-greedy` | Árbol Generador Mínimo (Kruskal) | 5 | 5 | 4 | Sí | 5 | 5 | **Flagship** | Cola de aristas ordenadas, estructura Union-Find (colores de componentes) y aplicación de la Propiedad del Corte. |

---

### Track 3: Programación Dinámica (K&T Cap. 6)

| ID del Ejercicio | Nombre Académico | Ped | Vis | Int | CI | Und | PQ | Estado General | Notas Pedagógicas & Visuales |
|---|---|---|---|---|---|---|---|---|---|
| `knapsack-dp` | Mochila 0/1 | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Matriz 2D DP interactiva, mochila de carga (`KnapsackVisualBag`), dependencias de celdas y reconstrucción. |
| `juan-el-vago` | Juan el Vago (Días de Descanso) | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Vector 1D con memoización, exclusión de días consecutivos y comparación con la heurística greedy defectuosa. |
| `coin-change-dp` | Cambio de Monedas | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Denominaciones canónicas y no canónicas, árbol de decisiones de subproblemas y casos sin cambio posible. |
| `lcs-dp` | Subsecuencia Común Más Larga | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Matriz 2D con flechas direccionales de reconstrucción (diagonal en match, izq/arriba en skip). |
| `weighted-interval-scheduling` | Intervalos Ponderados | 5 | 4 | 4 | Sí | 5 | 5 | **Flagship** | Cálculo visual del predecesor compatible $p(j)$ mediante búsqueda binaria y bifurcación include/exclude. |
| `segmented-least-squares-dp` | Mínimos Cuadrados Segmentados | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Lienzo cartesiano interactivo 2D con arrastre de puntos en $y$, ajuste dinámico de rectas de regresión por tramos y líneas de error residual. |
| `rna-secondary-structure-dp` | Estructura Secundaria de ARN | 5 | 5 | 4 | Sí | 5 | 5 | **Flagship** | Diagrama de arcos SVG sobre cadena biológica, rotación interactiva de nucleótidos A/U/C/G y validación visual de no-cruzamiento y bucles $\ge 4$. |
| `bellman-ford-dp` | Bellman-Ford | 4 | 4 | 4 | Sí | 4 | 5 | **Sólido** | Relajación de $\|V\|-1$ rondas, tabla DP $M[i, v]$ y detección de ciclos negativos en la ronda $\|V\|$. |

---

### Track 4: Backtracking y Ramificación (K&T Cap. 8)

| ID del Ejercicio | Nombre Académico | Ped | Vis | Int | CI | Und | PQ | Estado General | Notas Pedagógicas & Visuales |
|---|---|---|---|---|---|---|---|---|---|
| `n-queens` | N-Reinas | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Tablero $N \times N$, rayos de conflicto, admisión de estados inválidos, métricas de poda y árbol de búsqueda. |
| `subset-sum-backtracking` | Suma de Subconjuntos | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Árbol binario de decisión, podas por exceso ($S > W$) y por defecto ($S + \text{restante} < W$). |
| `graph-coloring-backtracking` | Coloreo de Grafos | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Grafo SVG interactivo, paleta cromática de $k$ colores y detección inmediata de conflicto de arista. |
| `sudoku-backtracking` | Sudoku 9x9 | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Cuadrícula 9x9 con inspector MRV (Minimum Remaining Values) y propagación de restricciones. |
| `hamiltonian-cycle-backtracking` | Ciclo Hamiltoniano | 4 | 4 | 3 | Sí | 4 | 4 | **Sólido** | Exploración de caminos simples con verificación de cobertura total de vértices y retorno al origen. |
| `tsp-branch-and-bound` | Viajante de Comercio (TSP B&B) | 5 | 5 | 5 | Sí | 5 | 5 | **Flagship** | Lienzo 2D interactivo con mapa de ciudades argentinas, cálculo en vivo de cota inferior ($C + LB$) y poda estricta cuando $C + LB \ge UB$. |
| `knapsack-branch-and-bound` | Mochila Branch & Bound | 5 | 4 | 4 | Sí | 5 | 5 | **Flagship** | Relajación continua Greedy como cota superior optimista (UB) y poda cuando $UB \le \text{incumbent}$. |
| `knights-tour-backtracking` | Recorrido del Caballo | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Tablero con mapa de calor de accesibilidad de Warnsdorff y traza de polilínea continua. |

---

### Track 5: Flujo en Redes y Programación Lineal (K&T Cap. 7 & 11)

| ID del Ejercicio | Nombre Académico | Ped | Vis | Int | CI | Und | PQ | Estado General | Notas Pedagógicas & Visuales |
|---|---|---|---|---|---|---|---|---|---|
| `max-flow` | Flujo Máximo en Redes | 5 | 5 | 4 | Sí | 5 | 5 | **Flagship** | Red residual con aristas forward/backward, caminos de aumento y visualización del corte mínimo ($S, T$). |
| `linear-programming-formulation` | Programación Lineal | 5 | 5 | 4 | Sí | 5 | 5 | **Flagship** | Poliedro 2D de restricciones, gradiente de la función objetivo y visualización del vértice óptimo. |

---

### Track 6: Reducciones, Aproximación y Aleatorizados (K&T Cap. 8, 11 & 13)

| ID del Ejercicio | Nombre Académico | Ped | Vis | Int | CI | Und | PQ | Estado General | Notas Pedagógicas & Visuales |
|---|---|---|---|---|---|---|---|---|---|
| `vertex-cover-reduction` | Reducción IS a Vertex Cover | 5 | 4 | 4 | Sí | 5 | 5 | **Flagship** | Demostración visual de la equivalencia complementaria: $S$ es Conjunto Independiente $\iff V \setminus S$ es Vertex Cover. |
| `vertex-cover-approx` | 2-Aproximación para Vertex Cover | 4 | 4 | 4 | Sí | 4 | 5 | **Sólido** | Selección maximal de aristas disjuntas y demostración de que $|C| \le 2 \cdot |C^*|$. |
| `randomized-fair-coin` | Moneda Justa de Von Neumann | 4 | 4 | 4 | Sí | 4 | 4 | **Sólido** | Simulación de pares de tiros de Bernoulli (HT vs TH) y convergencia a distribución uniforme no sesgada. |

---

## Síntesis de Calidad de la Currícula

- **Ejercicios con Estatus Flagship (Calidad Máxima FIUBA / K&T)**: 22 / 37 (59.5%)
  - `interval-scheduling`, `n-queens`, `knapsack-greedy`, `knapsack-dp`, `huffman-coding-greedy`, `merge-sort`, `inversion-counting-dyc`, `closest-pair-dyc`, `karatsuba-dyc`, `median-of-medians-dyc`, `majority-element-dyc`, `interval-partitioning-greedy`, `minimize-lateness-greedy`, `dijkstra-greedy`, `kruskal-mst-greedy`, `weighted-interval-scheduling`, `segmented-least-squares-dp`, `rna-secondary-structure-dp`, `tsp-branch-and-bound`, `knapsack-branch-and-bound`, `max-flow`, `linear-programming-formulation`.
- **Ejercicios con Estatus Sólido**: 15 / 37 (40.5%)
- **Ejercicios con Estatus Requiere Refinamiento o Básico**: 0 / 37 (0%)
- **Soporte de Custom Inputs (Entrada de Datos Personalizados)**: 37 / 37 (100% de la plataforma).
- **Separación Arquitectónica**: $\text{Algoritmo} \to \text{Traza} \to \text{Visualizador} \to \text{UI React}$ verificada en todos los módulos.

