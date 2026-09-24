import fs from 'fs';

const insightsCode = `export interface ExerciseInsight {
  formalInput: { es: string; en: string };
  formalOutput: { es: string; en: string };
  historicalContext: { es: string; en: string };
  algorithmicPerspective: { es: string; en: string };
  naiveTrapWarning: { es: string; en: string };
}

export const EXERCISE_INSIGHTS: Record<string, ExerciseInsight> = {
  'n-queens': {
    formalInput: {
      es: 'Un entero N ≥ 1 que especifica la dimensión del tablero N × N.',
      en: 'An integer N ≥ 1 specifying the N × N chessboard dimension.'
    },
    formalOutput: {
      es: 'Conjunto de todas las configuraciones válidas de N reinas tales que ninguna comparta fila, columna ni diagonal.',
      en: 'Set of all valid configurations of N queens such that no two share row, column, or diagonal.'
    },
    historicalContext: {
      es: 'Propuesto en 1848 por el ajedrecista Max Bezzel y estudiado por Carl Friedrich Gauss en 1850. Es el problema canónico para ilustrar la exploración exhaustiva del árbol de estados y la efectividad de la poda temprana.',
      en: 'Proposed in 1848 by chess player Max Bezzel and studied by Carl Friedrich Gauss in 1850. It serves as the canonical benchmark for state-space search and early branch pruning.'
    },
    algorithmicPerspective: {
      es: 'Mientras que la fuerza bruta pura evalúa C(N², N) combinaciones (más de 4.400 millones para N=8), el paradigma de Backtracking poda ramas enteras apenas detecta un conflicto diagonal o de columna, explorando solo 2.057 estados.',
      en: 'While brute force evaluates C(N², N) states (over 4.4 billion for N=8), Backtracking prunes entire subtrees upon the first diagonal or column collision, visiting only 2,057 states.'
    },
    naiveTrapWarning: {
      es: 'Una estrategia puramente greedy o miope suele quedar atrapada en callejones sin salida en los niveles intermedios, demostrando la necesidad imperiosa del retroceso sistemático (backtrack).',
      en: 'A purely greedy choice gets trapped in dead ends at intermediate rows, demonstrating the necessity of systematic backtracking.'
    }
  },

  'knapsack-dp': {
    formalInput: {
      es: 'N elementos con pesos w_i > 0 y valores v_i > 0, junto con una capacidad entera W > 0.',
      en: 'N items with weights w_i > 0 and values v_i > 0, along with an integer capacity W > 0.'
    },
    formalOutput: {
      es: 'Subconjunto de elementos S ⊆ {1, ..., N} que maximiza la suma de valores con peso total ≤ W.',
      en: 'Subset of items S ⊆ {1, ..., N} maximizing total value with sum of weights ≤ W.'
    },
    historicalContext: {
      es: 'Estudiado formalmente por George Dantzig en 1957. Es uno de los 21 problemas NP-completos originales de Richard Karp (1972), fundamental en criptografía y asignación presupuestaria.',
      en: 'Formally studied by George Dantzig in 1957. One of Karp’s 21 NP-complete problems (1972), essential in cryptography and budget allocation.'
    },
    algorithmicPerspective: {
      es: 'Posee subestructura óptima en dos dimensiones: la decisión de incluir o no el ítem i depende del valor óptimo alcanzable con los primeros i-1 ítems para una capacidad residual exacta w - w_i.',
      en: 'Exhibits 2D optimal substructure: the decision to include item i depends on the optimal value achievable using the first i-1 items with residual capacity w - w_i.'
    },
    naiveTrapWarning: {
      es: 'Ordenar por densidad (valor/peso) funciona para la versión fraccionaria, pero en la versión 0/1 entera falla rotundamente (contraejemplo: capacidad 50 con ítems de alta densidad pero pesos incompatibles).',
      en: 'Sorting by density works for fractional knapsack, but catastrophically fails for 0/1 knapsack due to indivisibility.'
    }
  },

  'interval-scheduling': {
    formalInput: {
      es: 'Conjunto de N intervalos [s_i, f_i) con tiempos de inicio y fin dados.',
      en: 'Set of N intervals [s_i, f_i) with start and finish times.'
    },
    formalOutput: {
      es: 'Subconjunto mutuamente compatible de tamaño cardinal máximo.',
      en: 'Mutually compatible subset of maximum cardinality.'
    },
    historicalContext: {
      es: 'Caso fundacional del libro Algorithm Design (Kleinberg & Tardos, Cap. 4.1). Modela planificación de tiempo de telescopios orbitales y procesadores en clusters.',
      en: 'Foundational problem of Algorithm Design (Kleinberg & Tardos, Ch. 4.1). Models satellite telescope scheduling and CPU job management.'
    },
    algorithmicPerspective: {
      es: 'La demostración de optimalidad se basa en el método de argumento de intercambio: la tarea con fin más temprano se adelanta a cualquier solución óptima competidora, dejando el máximo tiempo libre residual.',
      en: 'Correctness is proven via an exchange argument: earliest finish time stays ahead of any competing optimal schedule, leaving maximum remaining time.'
    },
    naiveTrapWarning: {
      es: 'Elegir la tarea de inicio más temprano, de menor duración o con menor cantidad de solapamientos parece intuitivo, pero todas admiten contraejemplos donde la heurística produce soluciones subóptimas.',
      en: 'Selecting by earliest start time, shortest duration, or fewest overlaps seems intuitive, but all admit simple counterexamples.'
    }
  },

  'subset-sum-backtracking': {
    formalInput: {
      es: 'Conjunto de enteros positivos A = {a_1, ..., a_n} y un objetivo S > 0.',
      en: 'Set of positive integers A = {a_1, ..., a_n} and a target sum S > 0.'
    },
    formalOutput: {
      es: 'Todos los subconjuntos cuya suma sea exactamente igual a S.',
      en: 'All subsets whose elements sum to exactly S.'
    },
    historicalContext: {
      es: 'Problema NP-completo clásico de decisión. Fundamental en reconciliación contable bancaria y auditoría forense para localizar transacciones que totalizan un monto exacto.',
      en: 'Classic NP-complete decision problem. Crucial in financial transaction reconciliation and forensic accounting.'
    },
    algorithmicPerspective: {
      es: 'Al ordenar previamente el conjunto de forma descendente, podemos aplicar poda por exceso (si suma actual > S) y poda por déficit (si la suma actual más la cota superior del resto no alcanza S), reduciendo drásticamente el árbol.',
      en: 'By sorting descending, we prune branches exceeding target or falling short of required remainder, dramatically reducing tree search.'
    },
    naiveTrapWarning: {
      es: 'Una búsqueda ingenua explora 2^N combinaciones. Sin podas matemáticas tempranas de cota superior, instancias con N ≥ 30 resultan intratables en tiempo razonable.',
      en: 'Naive search explores 2^N combinations. Without early upper-bound pruning, instances with N ≥ 30 are computationally intractable.'
    }
  },

  'merge-sort': {
    formalInput: {
      es: 'Arreglo A de N elementos con relación de orden total.',
      en: 'Array A of N elements with a total order relation.'
    },
    formalOutput: {
      es: 'Permutación ordenada de A en tiempo O(N log N).',
      en: 'Sorted permutation of A in O(N log N) time.'
    },
    historicalContext: {
      es: 'Diseñado por John von Neumann en 1945. Es el epítome del paradigma División y Conquista y la base teórica del Teorema Maestro en ciencias de la computación.',
      en: 'Designed by John von Neumann in 1945. Epitome of Divide and Conquer and foundational model for the Master Theorem.'
    },
    algorithmicPerspective: {
      es: 'La recurrencia T(N) = 2T(N/2) + O(N) produce un árbol de recursión de log₂(N) niveles, donde el costo de combinación por nivel es exactamente lineal O(N), garantizando cota asintótica O(N log N) en peor caso.',
      en: 'Recurrence T(N) = 2T(N/2) + O(N) yields log₂(N) levels of recursion with linear merge cost per level, establishing optimal O(N log N).'
    },
    naiveTrapWarning: {
      es: 'Algoritmos cuadráticos elementales (Bubble, Insertion) realizan comparaciones redundantes en tiempo O(N²); Merge Sort demuestra la cota inferior teórica de ordenamiento por comparación Ω(N log N).',
      en: 'Quadratic sorts perform redundant comparisons in O(N²); Merge Sort matches the theoretical comparison sorting lower bound Ω(N log N).'
    }
  },

  'huffman-coding-greedy': {
    formalInput: {
      es: 'Un alfabeto Σ junto con las frecuencias observadas {f_c} para cada símbolo c ∈ Σ.',
      en: 'An alphabet Σ along with observed frequencies {f_c} for each symbol c ∈ Σ.'
    },
    formalOutput: {
      es: 'Código binario libre de prefijo que minimiza la longitud media ponderada del mensaje codificado.',
      en: 'Prefix-free binary code minimizing the weighted average length of the encoded message.'
    },
    historicalContext: {
      es: 'Desarrollado por David A. Huffman en 1952 en el MIT. Base histórica de la compresión sin pérdida (DEFLATE, GZIP, JPEG y MP3).',
      en: 'Developed by David A. Huffman in 1952 at MIT. Cornerstone of lossless compression (DEFLATE, GZIP, JPEG, and MP3).'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §4.8. Construye el árbol de abajo hacia arriba combinando sucesivamente los dos árboles con menores pesos en un Min-Heap en tiempo O(n log n).',
      en: 'Kleinberg & Tardos §4.8. Bottom-up binary tree construction iteratively merging the two lowest-frequency trees via a Min-Heap in O(n log n).'
    },
    naiveTrapWarning: {
      es: 'Asignar códigos de longitud fija o intentar dividir las frecuencias de arriba hacia abajo (Shannon-Fano), lo cual produce códigos subóptimos con mayor longitud media.',
      en: 'Fixed-length codes or top-down frequency halving (Shannon-Fano) produce suboptimal codes with excess average length.'
    }
  },

  'dijkstra-greedy': {
    formalInput: {
      es: 'Grafo dirigido ponderado G = (V, E) con pesos no negativos w(u, v) ≥ 0 y origen s ∈ V.',
      en: 'Directed weighted graph G = (V, E) with non-negative edge weights w(u, v) ≥ 0 and source s ∈ V.'
    },
    formalOutput: {
      es: 'Distancias mínimas dist[v] = δ(s, v) desde s a todo v ∈ V y el árbol de caminos mínimos.',
      en: 'Shortest path distances dist[v] = δ(s, v) from s to all v ∈ V and the shortest-path tree.'
    },
    historicalContext: {
      es: 'Concebido en 1956 por Edsger W. Dijkstra y publicado en 1959. Protocolo fundamental de enrutamiento OSPF e IS-IS en Internet.',
      en: 'Conceived in 1956 by Edsger W. Dijkstra and published in 1959. Core algorithm for OSPF and IS-IS Internet routing protocols.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §4.4. Invariante Greedy Stays Ahead: al extraer un nodo de la cola de prioridad, su distancia tentativa ya es el camino más corto definitivo hacia él.',
      en: 'Kleinberg & Tardos §4.4. Greedy Stays Ahead invariant: upon priority queue extraction, the tentative distance is proven minimal and finalized.'
    },
    naiveTrapWarning: {
      es: 'Dijkstra falla catastróficamente con aristas de peso negativo: al declarar definitivo un nodo nunca retrocede para actualizarlo tras descubrir un atajo negativo posterior.',
      en: 'Dijkstra fails with negative edge weights: finalized nodes are never re-evaluated when a negative-edge shortcut is discovered later.'
    }
  },

  'kruskal-mst-greedy': {
    formalInput: {
      es: 'Grafo no dirigido conexo G = (V, E) con pesos reales w(e) en las aristas.',
      en: 'Connected undirected graph G = (V, E) with real edge weights w(e).'
    },
    formalOutput: {
      es: 'Árbol de recubrimiento mínimo T ⊆ E que conecta todos los vértices con peso total mínimo sin ciclos.',
      en: 'Minimum spanning tree T ⊆ E connecting all vertices with minimal total weight and zero cycles.'
    },
    historicalContext: {
      es: 'Propuesto por Joseph Kruskal en 1956. Esencial en infraestructura de redes de distribución eléctrica y clustering jerárquico.',
      en: 'Proposed by Joseph Kruskal in 1956. Essential in power grid distribution networks and single-linkage hierarchical clustering.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §4.5. Aplica la Cut Property seleccionando la arista más liviana global que no forme ciclo, gestionando componentes conexas mediante Union-Find en O(m log n).',
      en: 'Kleinberg & Tardos §4.5. Exploits the Cut Property by picking the globally lightest edge avoiding cycles, managing components with Union-Find in O(m log n).'
    },
    naiveTrapWarning: {
      es: 'Confundir el MST con un árbol de caminos mínimos: el MST minimiza el costo total de la red, no la distancia individual desde un origen a cada nodo.',
      en: 'Confusing an MST with a shortest-path tree: an MST minimizes overall network cabling cost, not origin-to-node path distances.'
    }
  },

  'coin-change-dp': {
    formalInput: {
      es: 'Denominaciones C = {c_1, ..., c_k} y un monto objetivo V ≥ 0.',
      en: 'Coin denominations C = {c_1, ..., c_k} and target amount V ≥ 0.'
    },
    formalOutput: {
      es: 'Cantidad mínima de monedas y combinación exacta que suma V.',
      en: 'Minimum coin count and exact combination summing to V.'
    },
    historicalContext: {
      es: 'Problema clásico de cambio analizado en Kleinberg & Tardos §6.4. Modela optimización de reservas en cajas automáticas y despacho de divisas.',
      en: 'Classic change-making problem analyzed in Kleinberg & Tardos §6.4. Models ATM cash reserve dispensing.'
    },
    algorithmicPerspective: {
      es: 'Ecuación de Bellman dp[v] = 1 + min_{c ≤ v} dp[v - c]. Evalúa todas las transiciones posibles en tiempo O(V · k) garantizando el mínimo global.',
      en: 'Bellman recurrence dp[v] = 1 + min_{c ≤ v} dp[v - c]. Evaluates all transitions in O(V · k) time, guaranteeing global minimality.'
    },
    naiveTrapWarning: {
      es: 'La heurística Greedy (tomar la moneda más grande) falla para sistemas no canónicos: con monedas {1, 3, 4} y valor 6, produce 4+1+1 (3 monedas) vs. 3+3 (2 monedas).',
      en: 'Greedy choice fails for non-canonical systems: given {1, 3, 4} and target 6, greedy picks 4+1+1 (3 coins) while optimal is 3+3 (2 coins).'
    }
  },

  'juan-el-vago': {
    formalInput: {
      es: 'Ganancias diarias G = [g_0, ..., g_{n-1}] para n días consecutivos.',
      en: 'Daily earnings G = [g_0, ..., g_{n-1}] across n consecutive days.'
    },
    formalOutput: {
      es: 'Ganancia máxima acumulada sin trabajar dos días seguidos.',
      en: 'Maximum cumulative earnings without working two consecutive days.'
    },
    historicalContext: {
      es: 'Problema insignia de la cátedra de Algoritmos (FIUBA / Guía PD, Ej. 4). Equivalente al Maximum Weight Independent Set sobre grafos camino.',
      en: 'Flagship problem of the Algorithms course (FIUBA / DP Guide, Ex. 4). Formally equivalent to MWIS on path graphs.'
    },
    algorithmicPerspective: {
      es: 'Recurrencia lineal OPT(i) = max(OPT(i-1), g_i + OPT(i-2)). Disyuntiva binaria de descansar o trabajar con memoización en O(n).',
      en: 'Linear recurrence OPT(i) = max(OPT(i-1), g_i + OPT(i-2)). Binary rest/work dichotomy with O(n) memoization.'
    },
    naiveTrapWarning: {
      es: 'Elegir vorazmente los días de mayor ganancia puede bloquear dos días contiguos cuya suma combinada superaría al día central (ej. [10, 100, 10] vs [80, 100, 80]).',
      en: 'Greedily picking peak days can lock out adjacent days whose combined sum exceeds the isolated peak (e.g. [80, 100, 80]).'
    }
  },

  'lcs-dp': {
    formalInput: {
      es: 'Dos cadenas de caracteres s_1 y s_2 de longitudes m y n.',
      en: 'Two character strings s_1 and s_2 of lengths m and n.'
    },
    formalOutput: {
      es: 'Longitud y caracteres de la subsecuencia común más larga (LCS).',
      en: 'Length and characters of the Longest Common Subsequence (LCS).'
    },
    historicalContext: {
      es: 'Estudiado por Sankoff y Paterson en la década de 1970 para bioinformática y base de la herramienta diff de Unix.',
      en: 'Studied by Sankoff and Paterson in the 1970s for bioinformatics and underlying Unix diff utility.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §6.7. Matriz 2D de subproblemas: si s1[i-1] == s2[j-1], dp[i][j] = 1 + dp[i-1][j-1]; sino max(arriba, izquierda). Reconstrucción en O(m+n).',
      en: 'Kleinberg & Tardos §6.7. 2D DP matrix: diagonal match emission vs. max(up, left) propagation. Backtracking path in O(m+n).'
    },
    naiveTrapWarning: {
      es: 'Confundir subcadena contigua con subsecuencia, o realizar saltos greedy que omiten caracteres iniciales bloqueando subsecuencias posteriores más largas.',
      en: 'Confusing contiguous substrings with subsequences, or greedy matching early characters that preclude longer subsequent sequences.'
    }
  },

  'weighted-interval-scheduling': {
    formalInput: {
      es: 'Conjunto de n intervalos con tiempos [s_j, f_j) y valores v_j > 0.',
      en: 'Set of n intervals with intervals [s_j, f_j) and values v_j > 0.'
    },
    formalOutput: {
      es: 'Subconjunto de tareas compatibles que maximiza el valor total acumulado.',
      en: 'Subset of compatible jobs maximizing total cumulative value.'
    },
    historicalContext: {
      es: 'Problema introductorio de Programación Dinámica en Kleinberg & Tardos (Cap. 6.1). Modela subastas de cómputo en la nube con tarifas variables.',
      en: 'Introductory DP problem in Kleinberg & Tardos (Ch. 6.1). Models cloud computing slot auctions with variable pricing.'
    },
    algorithmicPerspective: {
      es: 'Ordenar por fin y calcular p(j) con búsqueda binaria en O(log n). Recurrencia: OPT(j) = max(OPT(j-1), v_j + OPT(p(j))) en O(n log n).',
      en: 'Sort by finish time and precalculate p(j) via binary search in O(log n). Recurrence: OPT(j) = max(OPT(j-1), v_j + OPT(p(j))) in O(n log n).'
    },
    naiveTrapWarning: {
      es: 'Ninguna regla Greedy funciona: ordenar por fin, por densidad valor/duración o por valor absoluto admite contraejemplos con pérdidas arbitrarias.',
      en: 'No Greedy rule works: sorting by finish, value/duration density, or absolute value admits counterexamples with arbitrary suboptimality.'
    }
  },

  'closest-pair-dyc': {
    formalInput: {
      es: 'Conjunto de n puntos en el plano bidimensional ℝ².',
      en: 'Set of n points in the two-dimensional Euclidean plane ℝ².'
    },
    formalOutput: {
      es: 'Par de puntos más cercano y su distancia euclidiana mínima δ.',
      en: 'Closest pair of points and their minimum Euclidean distance δ.'
    },
    historicalContext: {
      es: 'Formulado por Shamos y Hoey en 1975. Problema fundamental en geometría computacional y sistemas de radar anticolisión aérea.',
      en: 'Formulated by Shamos and Hoey in 1975. Foundational in computational geometry and collision-avoidance radar systems.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §5.4. Divide por la mediana x_mid y combina en la franja central δ. Por el lema de empaquetamiento, cada punto solo compite con a lo sumo 7 vecinos, logrando O(n log n).',
      en: 'Kleinberg & Tardos §5.4. Bisect by median x_mid and merge across strip δ. By packing lemma, each point tests at most 7 neighbors, yielding O(n log n).'
    },
    naiveTrapWarning: {
      es: 'Comparar todos los pares de la franja central degrada la combinación a O(n²), anulando toda ganancia de la división recursiva.',
      en: 'Testing all strip pairs degrades merge time to O(n²), erasing the divide-and-conquer speedup.'
    }
  },

  'karatsuba-dyc': {
    formalInput: {
      es: 'Dos enteros grandes X e Y de n dígitos.',
      en: 'Two large integers X and Y of n digits.'
    },
    formalOutput: {
      es: 'Producto exacto X × Y en tiempo subcuadrático O(n^1.585).',
      en: 'Exact product X × Y in subquadratic O(n^1.585) time.'
    },
    historicalContext: {
      es: 'Descubierto en 1960 por Anatoly Karatsuba a los 23 años, refutando la conjetura de Andréi Kolmogorov de que multiplicar requería Ω(n²).',
      en: 'Discovered in 1960 by Anatoly Karatsuba at age 23, refuting Andrei Kolmogorov’s conjecture of an Ω(n²) multiplication lower bound.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §5.5. Calcula el término cruzado con 3 multiplicaciones en vez de 4: (x1 + x0)(y1 + y0) - z2 - z0, logrando T(n) = 3T(n/2) + O(n).',
      en: 'Kleinberg & Tardos §5.5. Computes the cross term with 3 multiplications instead of 4, yielding T(n) = 3T(n/2) + O(n) ⇒ O(n^1.585).'
    },
    naiveTrapWarning: {
      es: 'La división en mitades sin la reformulación algebraica de Gauss realiza 4 llamadas recursivas de tamaño n/2, lo que resulta en T(n) = 4T(n/2) + O(n) = O(n²).',
      en: 'Halving without algebraic recombination performs 4 recursive multiplications, collapsing back to O(n²).'
    }
  },

  'inversion-counting-dyc': {
    formalInput: {
      es: 'Arreglo A de n elementos con relación de orden.',
      en: 'Array A of n elements with an order relation.'
    },
    formalOutput: {
      es: 'Número total de inversiones (pares i < j con A[i] > A[j]) y arreglo ordenado.',
      en: 'Total number of inversions (pairs i < j with A[i] > A[j]) and sorted array.'
    },
    historicalContext: {
      es: 'Métrica de correlación de rangos de Kendall (1938). Utilizada en sistemas de recomendación colaborativa para medir disparidad entre rankings.',
      en: 'Kendall tau rank correlation metric (1938). Used in collaborative filtering recommendation engines to quantify preference divergence.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §5.3. Merge Sort modificado: al mezclar dos mitades ordenadas, un elemento de la derecha menor que uno de la izquierda cuenta múltiples inversiones cruzadas en O(1).',
      en: 'Kleinberg & Tardos §5.3. Modified Merge Sort: when merging sorted halves, an inverted right element counts remaining left elements in O(1).'
    },
    naiveTrapWarning: {
      es: 'Un doble bucle anidado evalúa todas las parejas en O(n²), impracticable para rankings masivos en sistemas web reales.',
      en: 'A naive nested loop tests all pairs in O(n²), intractable for large-scale web ranking engines.'
    }
  },

  'median-of-medians-dyc': {
    formalInput: {
      es: 'Arreglo desordenado de n elementos y un índice de orden k (0 ≤ k < n).',
      en: 'Unsorted array of n elements and order statistic index k (0 ≤ k < n).'
    },
    formalOutput: {
      es: 'El k-ésimo menor elemento en tiempo estrictamente lineal O(n) determinístico en el peor caso.',
      en: 'The k-th smallest element in strictly deterministic worst-case linear O(n) time.'
    },
    historicalContext: {
      es: 'Diseñado en 1973 por Blum, Floyd, Pratt, Rivest y Tarjan (BFPRT). Resultado fundacional de la teoría de algoritmos de selección.',
      en: 'Designed in 1973 by Blum, Floyd, Pratt, Rivest, and Tarjan (BFPRT). Foundational milestone in selection algorithm theory.'
    },
    algorithmicPerspective: {
      es: 'Particiona en grupos de 5 y busca recursivamente la mediana de las medianas p. Garantiza descartar al menos el 30% del arreglo en cada paso: T(n) ≤ T(n/5) + T(7n/10) + O(n) ⇒ O(n).',
      en: 'Partitions into groups of 5 and recursively selects the median of medians p, guaranteeing ≥30% elimination per stage: T(n) ≤ T(n/5) + T(7n/10) + O(n) ⇒ O(n).'
    },
    naiveTrapWarning: {
      es: 'QuickSelect con pivote aleatorio tiene peor caso O(n²); solo la mediana de medianas garantiza tiempo lineal determinístico en el peor caso absoluto.',
      en: 'Randomized QuickSelect has worst-case O(n²); only median of medians guarantees deterministic worst-case linear time.'
    }
  },

  'majority-element-dyc': {
    formalInput: {
      es: 'Arreglo A de n elementos.',
      en: 'Array A of n elements.'
    },
    formalOutput: {
      es: 'Elemento mayoritario con frecuencia > n/2 o None si no existe.',
      en: 'Majority element with frequency > n/2 or None if absent.'
    },
    historicalContext: {
      es: 'Problema introducido por Boyer y Moore en 1981 para procesamiento en tiempo real con memoria constante.',
      en: 'Introduced by Boyer and Moore in 1981 for real-time stream processing with constant auxiliary space.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §5.2. Si un elemento es mayoritario global, debe serlo en al menos una de las dos mitades. Evalúa a lo sumo 2 candidatos y verifica sus frecuencias en O(n log n).',
      en: 'Kleinberg & Tardos §5.2. A global majority must be majority in at least one half. Tests at most 2 candidates in O(n log n).'
    },
    naiveTrapWarning: {
      es: 'Confundir el elemento más frecuente (moda) con el mayoritario estricto (> n/2), o usar hash maps que consumen memoria O(n).',
      en: 'Confusing plurality (mode) with strict majority (> n/2), or relying on hash tables that consume O(n) space.'
    }
  },

  'peak-finding-dyc': {
    formalInput: {
      es: 'Arreglo 1D A de n números.',
      en: '1D array A of n numbers.'
    },
    formalOutput: {
      es: 'Un índice p tal que A[p] ≥ A[p-1] y A[p] ≥ A[p+1].',
      en: 'An index p such that A[p] ≥ A[p-1] and A[p] ≥ A[p+1].'
    },
    historicalContext: {
      es: 'Problema clásico del MIT 6.006 para introducir búsqueda binaria sobre gradientes ascendentes.',
      en: 'Classic MIT 6.006 problem introducing generalized binary search over ascending gradients.'
    },
    algorithmicPerspective: {
      es: 'Evalúa la pendiente en mid: si A[mid] < A[mid+1], por el principio del gradiente ascendente existe al menos un pico en la mitad derecha. Resuelve en O(log n).',
      en: 'Tests slope at mid: if A[mid] < A[mid+1], an ascending gradient guarantees a peak on the right half, solving in O(log n).'
    },
    naiveTrapWarning: {
      es: 'Recorrer linealmente el arreglo encuentra un pico en O(n), pero desaprovecha la cota logarítmica O(log n) que ofrece la división recursiva.',
      en: 'Linear scan finds a peak in O(n), forfeiting the optimal logarithmic O(log n) bound.'
    }
  },

  'max-subarray-dyc': {
    formalInput: {
      es: 'Arreglo A de números enteros positivos y negativos.',
      en: 'Array A of positive and negative integers.'
    },
    formalOutput: {
      es: 'Subarreglo continuo no vacío cuya suma sea máxima posible.',
      en: 'Contiguous non-empty subarray with maximum possible sum.'
    },
    historicalContext: {
      es: 'Planteado por Grenander en 1977 para imágenes médicas; resuelto en O(n log n) por Bentley (DyC) y en O(n) por Kadane (DP).',
      en: 'Posed by Grenander in 1977 for medical imaging; solved in O(n log n) by Bentley (D&C) and O(n) by Kadane (DP).'
    },
    algorithmicPerspective: {
      es: 'El subarreglo óptimo está en la mitad izquierda, en la derecha, o cruza el centro. El caso cruzado se calcula linealmente acumulando desde el medio hacia los extremos en O(n).',
      en: 'Optimal subarray is entirely on the left, right, or crosses the midpoint. Crossing max is computed linearly outward in O(n).'
    },
    naiveTrapWarning: {
      es: 'Evaluar todos los pares (i, j) cuesta O(n²) o O(n³); la descomposición divide y conquista lo reduce a O(n log n).',
      en: 'Testing all pairs (i, j) costs O(n²) or O(n³); divide-and-conquer reduces this to O(n log n).'
    }
  },

  'interval-partitioning-greedy': {
    formalInput: {
      es: 'Conjunto de n intervalos de clases [s_i, f_i).',
      en: 'Set of n lecture intervals [s_i, f_i).'
    },
    formalOutput: {
      es: 'Mínimo número de aulas necesarias y asignación sin solapamientos.',
      en: 'Minimum number of classrooms needed and conflict-free schedule.'
    },
    historicalContext: {
      es: 'Kleinberg & Tardos §4.1. Modela asignación de registros de hardware en compiladores y coloración de grafos de intervalos.',
      en: 'Kleinberg & Tardos §4.1. Models hardware register allocation in compilers and interval graph coloring.'
    },
    algorithmicPerspective: {
      es: 'La profundidad d (máximo número de intervalos solapados en un instante) es una cota inferior absoluta. Procesar por tiempo de inicio con Min-Heap garantiza usar exactamente d aulas en O(n log n).',
      en: 'Depth d is an absolute structural lower bound. Sorting by start time with a Min-Heap guarantees using exactly d rooms in O(n log n).'
    },
    naiveTrapWarning: {
      es: 'Ordenar por tiempo de fin (correcto para Interval Scheduling) falla aquí: el algoritmo abriría aulas de forma prematura e innecesaria.',
      en: 'Sorting by finish time (optimal for scheduling) fails for partitioning, prematurely opening excess classrooms.'
    }
  },

  'minimize-lateness-greedy': {
    formalInput: {
      es: 'n tareas con duraciones t_i y plazos límite d_i.',
      en: 'n jobs with processing times t_i and deadlines d_i.'
    },
    formalOutput: {
      es: 'Cronograma continuo que minimiza el retraso máximo L = max_i max(0, c_i - d_i).',
      en: 'Contiguous schedule minimizing maximum lateness L = max_i max(0, c_i - d_i).'
    },
    historicalContext: {
      es: 'Kleinberg & Tardos §4.2. Conocido como Earliest Deadline First (EDF) o regla de Jackson (1955) en teoría de scheduling.',
      en: 'Kleinberg & Tardos §4.2. Known as Earliest Deadline First (EDF) or Jackson’s rule (1955) in real-time scheduling.'
    },
    algorithmicPerspective: {
      es: 'Demostración por intercambio de inversiones adyacentes: ordenar por deadline creciente d_1 ≤ d_2 ≤ ... elimina todas las inversiones sin incrementar la latencia máxima en O(n log n).',
      en: 'Proof by adjacent inversion exchange: sorting by increasing deadline d_1 ≤ d_2 ≤ ... eliminates inversions without increasing maximum lateness in O(n log n).'
    },
    naiveTrapWarning: {
      es: 'Ordenar por duración más corta (Shortest Processing Time) parece intuitivo, pero posterga tareas largas con deadlines urgentes, disparando el retraso.',
      en: 'Shortest Processing Time seems intuitive but delays long jobs with urgent deadlines, spiking max lateness.'
    }
  },

  'knapsack-greedy': {
    formalInput: {
      es: 'n ítems divisibles con pesos w_i > 0 y valores v_i > 0, y capacidad W.',
      en: 'n divisible items with weights w_i > 0 and values v_i > 0, and capacity W.'
    },
    formalOutput: {
      es: 'Fracción x_i ∈ [0, 1] de cada ítem que maximiza el valor total con ∑ x_i w_i ≤ W.',
      en: 'Fraction x_i ∈ [0, 1] of each item maximizing total value with ∑ x_i w_i ≤ W.'
    },
    historicalContext: {
      es: 'Versión continua analizada en Dantzig (1957) y Cormen et al. §16.2. Modela asignación de materias primas divisibles.',
      en: 'Continuous version analyzed in Dantzig (1957) and Cormen et al. §16.2. Models continuous commodity allocation.'
    },
    algorithmicPerspective: {
      es: 'Ordenar por densidad decreciente v_i / w_i y tomar los ítems completos hasta saturar la capacidad, fraccionando a lo sumo el último ítem en O(n log n).',
      en: 'Sort by density v_i / w_i descending and pack items fully until capacity is reached, taking a fraction of at most one item in O(n log n).'
    },
    naiveTrapWarning: {
      es: 'Aplicar esta heurística a la versión 0/1 donde los ítems son indivisibles: la indivisibilidad destruye la propiedad greedy y exige programación dinámica.',
      en: 'Applying greedy density to 0/1 indivisible items fails because indivisibility requires dynamic programming.'
    }
  },

  'road-antennas-greedy': {
    formalInput: {
      es: 'Posiciones de n casas sobre una ruta lineal y radio de cobertura R > 0.',
      en: 'Positions of n houses along a linear road and coverage radius R > 0.'
    },
    formalOutput: {
      es: 'Conjunto mínimo de antenas que cubre todas las casas.',
      en: 'Minimal set of antennas covering all houses.'
    },
    historicalContext: {
      es: 'Problema canónico de cobertura lineal (Guía de Algoritmos FIUBA, Ej. 10). Modela diseño de radiobases celulares y paradas de transporte.',
      en: 'Canonical linear coverage problem (FIUBA Algorithms Guide, Ex. 10). Models cellular basestations and transit stops.'
    },
    algorithmicPerspective: {
      es: 'Invariante Greedy Stays Ahead: ordenar casas; la primera casa no cubierta en x exige colocar una antena en x + R para extender la cobertura hacia la derecha lo máximo posible.',
      en: 'Greedy Stays Ahead invariant: sort houses; the leftmost uncovered house at x forces an antenna at x + R to maximize rightward reach.'
    },
    naiveTrapWarning: {
      es: 'Colocar la antena sobre la casa x desperdicia la mitad del radio hacia la izquierda donde ya no quedan casas sin cubrir.',
      en: 'Placing the antenna directly on house x wastes half the radius covering empty space to the left.'
    }
  },

  'segmented-least-squares-dp': {
    formalInput: {
      es: 'n puntos en el plano ordenados por x y penalización de segmento C > 0.',
      en: 'n points in the plane sorted by x and per-segment penalty C > 0.'
    },
    formalOutput: {
      es: 'Partición de puntos en segmentos que minimiza error cuadrático más C × (número de segmentos).',
      en: 'Point partition into segments minimizing squared error plus C × (number of segments).'
    },
    historicalContext: {
      es: 'Kleinberg & Tardos §6.3. Problema central en compresión de series temporales y equilibrio de complejidad de modelos estadísticos.',
      en: 'Kleinberg & Tardos §6.3. Foundational in time series compression and statistical model parsimony.'
    },
    algorithmicPerspective: {
      es: 'Recurrencia OPT(j) = min_{1 ≤ i ≤ j} (e_{i, j} + C + OPT(i-1)). Precalcula errores e_{i, j} en O(n²) y resuelve la tabla en O(n²).',
      en: 'Recurrence OPT(j) = min_{1 ≤ i ≤ j} (e_{i, j} + C + OPT(i-1)). Precomputes e_{i, j} in O(n²) and fills DP table in O(n²).'
    },
    naiveTrapWarning: {
      es: 'Ajustar una sola recta subajusta los datos con alto error; unir cada par sobreajusta. El parámetro C equilibra ambos extremos.',
      en: 'A single line underfits; interpolating all points overfits. Parameter C strictly balances both extremes.'
    }
  },

  'rna-secondary-structure-dp': {
    formalInput: {
      es: 'Secuencia de bases nitrogenadas de ARN b_1 ... b_n ∈ {A, U, C, G}*.',
      en: 'RNA nitrogenous base sequence b_1 ... b_n ∈ {A, U, C, G}*.'
    },
    formalOutput: {
      es: 'Conjunto máximo de apareamientos válidos sin cruces y con horquillas de longitud ≥ 4.',
      en: 'Maximum valid Watson-Crick base pairs without crossings and hairpin length ≥ 4.'
    },
    historicalContext: {
      es: 'Algoritmo de Nussinov (1978). Fundamental en bioinformática molecular para predecir el plegamiento de ARN.',
      en: 'Nussinov’s algorithm (1978). Foundational in molecular bioinformatics for predicting RNA secondary folding.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §6.5. DP por intervalos sobre la longitud de subcadena: disyuntiva entre base j no apareada vs. apareamiento con t que divide en subproblemas disjuntos.',
      en: 'Kleinberg & Tardos §6.5. Interval DP: disjunction between base j unpaired vs. pairing with t splitting into independent subproblems.'
    },
    naiveTrapWarning: {
      es: 'Aparear bases de forma miope genera cruces que violan la física molecular y bloquea estructuras globales con más enlaces de hidrógeno.',
      en: 'Greedy base pairing creates crossings that violate molecular physics and blocks globally denser structures.'
    }
  },

  'bellman-ford-dp': {
    formalInput: {
      es: 'Grafo dirigido ponderado G = (V, E) con aristas de peso arbitrario y origen s ∈ V.',
      en: 'Directed weighted graph G = (V, E) with arbitrary edge weights and source s ∈ V.'
    },
    formalOutput: {
      es: 'Distancias mínimas desde s o detección formal de un ciclo negativo alcanzable.',
      en: 'Shortest distances from s or formal detection of a reachable negative cycle.'
    },
    historicalContext: {
      es: 'Propuesto por Shimbel (1955), Bellman (1958) y Ford (1956). Base del protocolo de vector de distancias RIP en redes de computadoras.',
      en: 'Proposed by Shimbel (1955), Bellman (1958), and Ford (1956). Basis for the RIP distance-vector routing protocol.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §6.8. DP sobre longitud de caminos: tras |V|-1 iteraciones, una reducción adicional en la iteración |V| prueba un ciclo negativo.',
      en: 'Kleinberg & Tardos §6.8. DP over path edge count: after |V|-1 relaxation passes, further improvement on pass |V| proves a negative cycle.'
    },
    naiveTrapWarning: {
      es: 'Sumar una constante a todas las aristas para usar Dijkstra altera los caminos mínimos relativos penalizando rutas con más aristas.',
      en: 'Adding a constant to eliminate negative weights invalidates shortest paths by penalizing multi-hop routes.'
    }
  },

  'sudoku-backtracking': {
    formalInput: {
      es: 'Tablero 9 × 9 parcialmente completo con dígitos del 1 al 9.',
      en: 'Partially filled 9 × 9 grid with digits 1 through 9.'
    },
    formalOutput: {
      es: 'Tablero 9 × 9 completo sin colisiones en filas, columnas ni cuadrantes 3 × 3.',
      en: 'Completed 9 × 9 board with zero collisions across rows, columns, and 3 × 3 boxes.'
    },
    historicalContext: {
      es: 'Problema NP-completo de satisfacción de restricciones (CSP) popularizado por Nikoli en 1986.',
      en: 'NP-complete constraint satisfaction problem (CSP) popularized worldwide by Nikoli in 1986.'
    },
    algorithmicPerspective: {
      es: 'Backtracking optimizado con heurística MRV (Minimum Remaining Values): seleccionar la celda con menos candidatos provoca fallas tempranas en ramas inviables.',
      en: 'Backtracking optimized with MRV heuristic: choosing the cell with minimum remaining domain triggers early failures on dead ends.'
    },
    naiveTrapWarning: {
      es: 'Llenar celdas en orden secuencial sin MRV multiplica los retrocesos de decenas a millones en instancias complejas.',
      en: 'Filling sequentially without MRV multiplies backtracks from dozens to millions on hard instances.'
    }
  },

  'graph-coloring-backtracking': {
    formalInput: {
      es: 'Grafo no dirigido G = (V, E) y un número de colores k ≥ 1.',
      en: 'Undirected graph G = (V, E) and color count k ≥ 1.'
    },
    formalOutput: {
      es: 'Asignación de colores a vértices sin aristas monocromáticas o certificado de imposibilidad.',
      en: 'Vertex color assignment with zero monochromatic edges or impossibility certificate.'
    },
    historicalContext: {
      es: 'Problema NP-completo de Karp (1972). Modela asignación de frecuencias de radio y registros de compilador.',
      en: 'Karp’s NP-complete problem (1972). Models wireless frequency allocation and compiler register usage.'
    },
    algorithmicPerspective: {
      es: 'Backtracking con poda vecinal: descarta inmediatamente colores que coincidan con vecinos ya pintados, podando ramas enteras del árbol de k^|V| estados.',
      en: 'Backtracking with neighbor pruning: rejects colors matching colored neighbors, pruning subtrees of the k^|V| state space.'
    },
    naiveTrapWarning: {
      es: 'La coloración Greedy de vértices es incompleta: según el orden de procesamiento puede requerir significativamente más de χ(G) colores.',
      en: 'Greedy vertex coloring is incomplete: order-dependent coloring can require far more than the chromatic number χ(G).'
    }
  },

  'knights-tour-backtracking': {
    formalInput: {
      es: 'Tablero N × N y casilla de inicio del caballo.',
      en: 'N × N board and initial knight square.'
    },
    historicalContext: {
      es: 'Problema de ajedrez estudiado por Euler (1759) y resuelto eficientemente por Warnsdorff (1823).',
      en: 'Chess problem analyzed by Euler (1759) and solved efficiently by Warnsdorff (1823).'
    },
    formalOutput: {
      es: 'Secuencia de N² movimientos de caballo que visita cada casilla exactamente una vez.',
      en: 'Sequence of N² knight moves visiting each square exactly once.'
    },
    algorithmicPerspective: {
      es: 'Regla de Warnsdorff: priorizar casillas candidatas con menor grado de salida libre, reduciendo retrocesos a prácticamente cero.',
      en: 'Warnsdorff heuristic: prioritize candidate squares with lowest forward degree, reducing backtracks to near zero.'
    },
    naiveTrapWarning: {
      es: 'Un backtracking sin ordenamiento colapsa en un espacio astronómico (8^{N²}) y no termina en tiempo razonable para N ≥ 8.',
      en: 'Unguided search tree explodes exponentially (8^{N²}) and fails to terminate for N ≥ 8.'
    }
  },

  'hamiltonian-cycle-backtracking': {
    formalInput: {
      es: 'Grafo G = (V, E) con |V| vértices.',
      en: 'Graph G = (V, E) with |V| vertices.'
    },
    formalOutput: {
      es: 'Ciclo simple que visita cada vértice exactamente una vez y retorna al inicio, o None.',
      en: 'Simple cycle visiting each vertex exactly once and returning to source, or None.'
    },
    historicalContext: {
      es: 'Formulado por Sir William Rowan Hamilton en 1857. Problema NP-completo fundacional de Richard Karp (1972).',
      en: 'Formulated by Sir William Rowan Hamilton in 1857. Foundational NP-complete problem in Karp’s 1972 list.'
    },
    algorithmicPerspective: {
      es: 'Backtracking incremental validando aristas consecutivas y exclusión de vértices visitados. Comprueba arista de retorno al origen al alcanzar longitud |V|.',
      en: 'Incremental backtracking checking edge adjacency and visited exclusions, testing source return edge at depth |V|.'
    },
    naiveTrapWarning: {
      es: 'Evaluar todas las permutaciones (|V|!) es factorialmente prohibitivo; el backtracking poda de inmediato ramas sin aristas adyacentes.',
      en: 'Testing all |V|! permutations is computationally prohibitive; backtracking prunes non-adjacent branches early.'
    }
  },

  'knapsack-branch-and-bound': {
    formalInput: {
      es: 'n ítems con pesos w_i, valores v_i y capacidad entera W.',
      en: 'n items with weights w_i, values v_i, and integer capacity W.'
    },
    formalOutput: {
      es: 'Selección óptima de ítems encontrada con exploración sistemática podada por cotas continuas.',
      en: 'Optimal item selection found via branch-and-bound continuous relaxation pruning.'
    },
    historicalContext: {
      es: 'Branch & Bound introducido por Land y Doig (1960). Estándar industrial de optimización entera (CPLEX, Gurobi).',
      en: 'Branch & Bound introduced by Land and Doig (1960). Industry standard for integer programming solvers.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §8.9. En cada nodo calcula una cota superior optimista (UB) con Greedy fraccionario. Si UB ≤ incumbent, poda el subárbol completo.',
      en: 'Kleinberg & Tardos §8.9. Computes an optimistic upper bound (UB) via fractional greedy. If UB ≤ incumbent, prunes the subtree.'
    },
    naiveTrapWarning: {
      es: 'Podar únicamente por desborde de peso es backtracking ingenuo; la cota matemática continua es la que evita recorrer ramas enteras inviables.',
      en: 'Pruning only on weight overflow is naive backtracking; continuous relaxation bound is what prunes subtrees before overflow.'
    }
  },

  'tsp-branch-and-bound': {
    formalInput: {
      es: 'Grafo completo ponderado con n ciudades y matriz de distancias.',
      en: 'Complete weighted graph with n cities and distance matrix.'
    },
    formalOutput: {
      es: 'Tour cerrado que visita todas las ciudades con distancia total mínima.',
      en: 'Closed tour visiting all cities with minimum total distance.'
    },
    historicalContext: {
      es: 'Problema del Viajante formulado por Karl Menger en la década de 1930. Arquetipo de problema NP-duro de optimización.',
      en: 'Traveling Salesperson Problem posed by Karl Menger in the 1930s. Benchmark NP-hard combinatorial problem.'
    },
    algorithmicPerspective: {
      es: 'Calcula cotas inferiores (LB) con aristas mínimas salientes. Si costo acumulado + LB ≥ incumbent, se descarta el subárbol evitando (n-1)!/2 evaluaciones.',
      en: 'Computes lower bounds (LB) using minimum outgoing edges. If current cost + LB ≥ incumbent, prunes the branch.'
    },
    naiveTrapWarning: {
      es: 'La heurística del vecino más cercano es miope: acumula aristas cortas al inicio pero se ve obligada a cerrar con aristas larguísimas al final.',
      en: 'Nearest-neighbor greedy heuristic is short-sighted, forced into expensive closing edges at the end.'
    }
  },

  'max-flow': {
    formalInput: {
      es: 'Red de flujo G = (V, E) con capacidades c(u, v) ≥ 0, fuente s y sumidero t.',
      en: 'Flow network G = (V, E) with capacities c(u, v) ≥ 0, source s, and sink t.'
    },
    formalOutput: {
      es: 'Flujo máximo admisible de s a t y corte mínimo (S, T).',
      en: 'Maximum admissible s-t flow and minimum capacity cut (S, T).'
    },
    historicalContext: {
      es: 'Ford y Fulkerson (1956) y Edmonds-Karp (1972). Teorema Max-Flow Min-Cut: valor del flujo máximo = capacidad del corte mínimo.',
      en: 'Ford and Fulkerson (1956) and Edmonds-Karp (1972). Max-Flow Min-Cut theorem: max flow value equals min cut capacity.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos Cap. 7. Grafo residual con aristas hacia atrás que permiten corregir flujos previos. BFS garantiza O(V · E²).',
      en: 'Kleinberg & Tardos Ch. 7. Residual graph with backward edges allowing flow correction. BFS guarantees O(V · E²).'
    },
    naiveTrapWarning: {
      es: 'Sin aristas residuales hacia atrás, un algoritmo miope satura caminos impidiendo descubrir combinaciones que alcanzan el flujo global máximo.',
      en: 'Without backward residual edges, greedy augmentation saturates bottleneck edges preventing global maximum flow.'
    }
  },

  'linear-programming-formulation': {
    formalInput: {
      es: 'Problema de optimización con variables continuas o enteras, función lineal y restricciones lineales.',
      en: 'Optimization problem with continuous or integer variables, linear objective, and linear constraints.'
    },
    formalOutput: {
      es: 'Modelo formal estándar (variables, función objetivo y restricciones) y vértice óptimo.',
      en: 'Standard formal model (variables, objective, constraints) and optimal extreme point.'
    },
    historicalContext: {
      es: 'Kantorovich (1939) y Dantzig (1947, Simplex). Teorema Fundamental de PL: el óptimo reside siempre en un vértice extremo del poliedro.',
      en: 'Kantorovich (1939) and Dantzig (1947, Simplex). Fundamental Theorem of LP: optimum always lies at an extreme polyhedron vertex.'
    },
    algorithmicPerspective: {
      es: 'La relajación continua se resuelve en tiempo polinomial (Kachiyan, Karmarkar), proveyendo cotas duales fundamentales para optimización entera.',
      en: 'Continuous relaxation solves in polynomial time (Kachiyan, Karmarkar), providing dual bounds for integer optimization.'
    },
    naiveTrapWarning: {
      es: 'Redondear la solución continua no garantiza factibilidad ni optimalidad entera: puede violar restricciones o quedar lejos del óptimo.',
      en: 'Rounding continuous relaxation results can violate constraints or yield severely suboptimal integer solutions.'
    }
  },

  'linear-programming': {
    formalInput: {
      es: 'Problema de optimización con variables continuas o enteras, función lineal y restricciones lineales.',
      en: 'Optimization problem with continuous or integer variables, linear objective, and linear constraints.'
    },
    formalOutput: {
      es: 'Modelo formal estándar (variables, función objetivo y restricciones) y vértice óptimo.',
      en: 'Standard formal model (variables, objective, constraints) and optimal extreme point.'
    },
    historicalContext: {
      es: 'Kantorovich (1939) y Dantzig (1947, Simplex). Teorema Fundamental de PL: el óptimo reside siempre en un vértice extremo del poliedro.',
      en: 'Kantorovich (1939) and Dantzig (1947, Simplex). Fundamental Theorem of LP: optimum always lies at an extreme polyhedron vertex.'
    },
    algorithmicPerspective: {
      es: 'La relajación continua se resuelve en tiempo polinomial (Kachiyan, Karmarkar), proveyendo cotas duales fundamentales para optimización entera.',
      en: 'Continuous relaxation solves in polynomial time (Kachiyan, Karmarkar), providing dual bounds for integer optimization.'
    },
    naiveTrapWarning: {
      es: 'Redondear la solución continua no garantiza factibilidad ni optimalidad entera: puede violar restricciones o quedar lejos del óptimo.',
      en: 'Rounding continuous relaxation results can violate constraints or yield severely suboptimal integer solutions.'
    }
  },

  'vertex-cover-reduction': {
    formalInput: {
      es: 'Grafo no dirigido G = (V, E) y un entero k.',
      en: 'Undirected graph G = (V, E) and integer k.'
    },
    formalOutput: {
      es: 'Reducción polinomial demostrando que S es Conjunto Independiente si y solo si V \\ S es Vertex Cover.',
      en: 'Polynomial reduction proving S is an Independent Set iff V \\ S is a Vertex Cover.'
    },
    historicalContext: {
      es: 'Reducción de Karp (1972) entre dos problemas NP-completos fundacionales.',
      en: 'Karp’s 1972 reduction between two foundational NP-complete problems.'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §8.2. Cada arista (u, v) debe tener al menos un extremo en V \\ S para que no haya aristas internas en S, demostrando complementariedad exacta.',
      en: 'Kleinberg & Tardos §8.2. Every edge (u, v) must have an endpoint in V \\ S so S has no internal edges, proving exact complementarity.'
    },
    naiveTrapWarning: {
      es: 'Intentar buscar un algoritmo exacto polinomial para resolverlos: la reducción prueba que ambos pertenecen a la clase NP-completo.',
      en: 'Attempting to find an exact polynomial algorithm: the reduction proves both are NP-complete.'
    }
  },

  'vertex-cover-approx': {
    formalInput: {
      es: 'Grafo no dirigido G = (V, E).',
      en: 'Undirected graph G = (V, E).'
    },
    formalOutput: {
      es: 'Cobertura de vértices C ⊆ V de tamaño a lo sumo el doble del óptimo: |C| ≤ 2 · |C*|.',
      en: 'Vertex cover C ⊆ V of size at most twice the optimal: |C| ≤ 2 · |C*|.'
    },
    historicalContext: {
      es: 'Algoritmo de 2-aproximación por matching maximal diseñado por Gavril y Yannakakis (1974).',
      en: '2-approximation algorithm via maximal matching designed by Gavril and Yannakakis (1974).'
    },
    algorithmicPerspective: {
      es: 'Kleinberg & Tardos §11.1. Selecciona aristas disjuntas M y toma ambos extremos. Como todo VC óptimo debe tomar al menos un vértice de cada arista de M, |C| = 2|M| ≤ 2|C*|.',
      en: 'Kleinberg & Tardos §11.1. Selects disjoint edges M and takes both endpoints. Since any optimal VC takes ≥1 vertex per edge in M, |C| = 2|M| ≤ 2|C*|.'
    },
    naiveTrapWarning: {
      es: 'Tomar el vértice de mayor grado parece más intuitivo, pero solo logra cota logarítmica O(log n); el matching simple garantiza factor 2 constante.',
      en: 'Taking max-degree vertices seems intuitive but achieves only an O(log n) factor; matching guarantees constant factor 2.'
    }
  },

  'randomized-fair-coin': {
    formalInput: {
      es: 'Generador de moneda sesgada con probabilidad p ∈ (0, 1) desconocida.',
      en: 'Biased coin generator with unknown probability p ∈ (0, 1).'
    },
    formalOutput: {
      es: 'Simulación de tiros perfectamente justos (50% / 50%) en tiempo esperado finito O(1).',
      en: 'Simulation of perfectly fair coin flips (50% / 50%) in finite expected O(1) time.'
    },
    historicalContext: {
      es: 'Propuesto por John von Neumann en 1951. Principio fundacional de simulación estocástica y reducción de sesgo.',
      en: 'Proposed by John von Neumann in 1951. Foundational principle of bias reduction in stochastic simulation.'
    },
    algorithmicPerspective: {
      es: 'Lanza en pares: P(H, T) = p(1-p) y P(T, H) = (1-p)p. Por simetría condicional son idénticos; los empates (H, H) y (T, T) se descartan. Tiempo esperado: 1 / [2p(1-p)].',
      en: 'Flips in pairs: P(H, T) = p(1-p) and P(T, H) = (1-p)p. Conditional symmetry guarantees equality; ties discard and repeat. E[T] = 1 / [2p(1-p)].'
    },
    naiveTrapWarning: {
      es: 'Alternar resultados determinísticamente no genera aleatoriedad; solo la simetría probabilística condicional produce una distribución uniforme verdadera.',
      en: 'Deterministic alternation lacks randomness; only conditional probabilistic symmetry produces a true uniform distribution.'
    }
  }
};

export function getExerciseInsight(exerciseId: string, categoryId: string): ExerciseInsight {
  if (EXERCISE_INSIGHTS[exerciseId]) {
    return EXERCISE_INSIGHTS[exerciseId];
  }

  // Paradigm fallback
  const PARADIGM_INSIGHTS: Record<string, ExerciseInsight> = {
    'divide-and-conquer': {
      formalInput: {
        es: 'Instancia de tamaño N descomponible en k subproblemas disjuntos de tamaño N/b.',
        en: 'Instance of size N decomposable into k disjoint subproblems of size N/b.'
      },
      formalOutput: {
        es: 'Solución combinada en tiempo polinomial o log-lineal según el Teorema Maestro.',
        en: 'Combined solution in polynomial or log-linear time per the Master Theorem.'
      },
      historicalContext: {
        es: 'Formalizado en la década de 1950. Base de los algoritmos más eficientes de la computación clásica (FFT de Cooley-Tukey, Karatsuba, Strassen).',
        en: 'Formalized in the 1950s. Foundation of major classical algorithms (Cooley-Tukey FFT, Karatsuba, Strassen).'
      },
      algorithmicPerspective: {
        es: 'La clave radica en que el costo de combinar las soluciones recursivas no supere el ahorro obtenido al reducir el tamaño de las llamadas descendentes.',
        en: 'The core efficiency lies in keeping the combination step cost strictly bounded below the recursive reduction gain.'
      },
      naiveTrapWarning: {
        es: 'Resolver subproblemas recursivos que se superponen en lugar de ser disjuntos provoca explosión exponencial: en tales casos se debe recurrir a Programación Dinámica.',
        en: 'Solving overlapping rather than disjoint subproblems causes exponential explosion; such structures require Dynamic Programming.'
      }
    },
    'greedy': {
      formalInput: {
        es: 'Estructura combinatorial con función objetivo a optimizar (maximizar o minimizar).',
        en: 'Combinatorial structure with an objective function to optimize.'
      },
      formalOutput: {
        es: 'Subconjunto de decisiones locales miopes que garantiza el óptimo global.',
        en: 'Sequence of locally optimal choices guaranteeing global optimality.'
      },
      historicalContext: {
        es: 'Formalizado mediante la teoría de matroides por Jack Edmonds en 1971. Central en los cursos de algoritmos para entrenar demostraciones de correctitud rigurosas.',
        en: 'Formalized via matroid theory by Jack Edmonds in 1971. Central in algorithmic coursework for rigorous correctness proofs.'
      },
      algorithmicPerspective: {
        es: 'Un algoritmo Greedy debe satisfacer dos propiedades formales demostrables: la propiedad de elección Greedy y la subestructura óptima.',
        en: 'A Greedy algorithm must satisfy two provable properties: the greedy choice property and optimal substructure.'
      },
      naiveTrapWarning: {
        es: 'La trampa más frecuente es asumir que una regla intuitiva es óptima sin un argumento de intercambio formal; la mayoría de las heurísticas intuitivas admiten contraejemplos inmediatos.',
        en: 'The most common pitfall is assuming intuitive heuristics are optimal without a formal exchange argument.'
      }
    },
    'dynamic-programming': {
      formalInput: {
        es: 'Problema de optimización secuencial con subproblemas superpuestos y decisiones encadenadas.',
        en: 'Sequential optimization problem with overlapping subproblems and chained decisions.'
      },
      formalOutput: {
        es: 'Valor y configuración óptima calculados mediante la ecuación de recurrencia de Bellman.',
        en: 'Optimal value and configuration computed via Bellman recurrence relation.'
      },
      historicalContext: {
        es: 'Desarrollado por Richard Bellman en 1953 en RAND Corporation. Nombre acuñado para describir la toma de decisiones óptima en múltiples etapas.',
        en: 'Developed by Richard Bellman in 1953 at RAND Corporation to model multi-stage optimal decision processes.'
      },
      algorithmicPerspective: {
        es: 'Almacena resultados de subproblemas en una tabla o matriz memoizada, transformando algoritmos recursivos de tiempo exponencial en tiempo polinomial.',
        en: 'Memoizes subproblem results in a table, transforming exponential recursive searches into polynomial runtime.'
      },
      naiveTrapWarning: {
        es: 'Omitir la reconstrucción de la solución óptima y devolver únicamente el valor numérico, o definir estados con parámetros superfluos que multiplican innecesariamente la memoria.',
        en: 'Failing to reconstruct the argmax solution or introducing superfluous state parameters that blow up table dimensions.'
      }
    },
    'backtracking': {
      formalInput: {
        es: 'Espacio de búsqueda combinatorial de candidatos discretos con restricciones duras.',
        en: 'Combinatorial discrete candidate search space with hard constraints.'
      },
      formalOutput: {
        es: 'Exploración exhaustiva podada que encuentra todas las soluciones factibles u óptimas.',
        en: 'Exhaustive pruned exploration locating all feasible or optimal solutions.'
      },
      historicalContext: {
        es: 'Término introducido por D. H. Lehmer en la década de 1950 para problemas de teoría de números y satisfacción de restricciones.',
        en: 'Term coined by D. H. Lehmer in the 1950s for number-theoretic and constraint satisfaction problems.'
      },
      algorithmicPerspective: {
        es: 'Recorrido en profundidad (DFS) del árbol de juego/estados que evalúa predicados de factibilidad antes de descender, podando ramas inviables tan pronto como se violan restricciones.',
        en: 'Depth-first search (DFS) over a state-space tree evaluating feasibility predicates to prune dead branches immediately.'
      },
      naiveTrapWarning: {
        es: 'Verificar restricciones al llegar a las hojas en vez de hacerlo en cada nivel intermedio: esto degenera el algoritmo a fuerza bruta pura.',
        en: 'Testing constraints only at leaf nodes rather than at intermediate levels, degenerating the search to brute force.'
      }
    }
  };

  return (
    PARADIGM_INSIGHTS[categoryId] || {
      formalInput: {
        es: 'Instancia bien formulada del problema algorítmico.',
        en: 'Well-formed instance of the algorithmic problem.'
      },
      formalOutput: {
        es: 'Certificado de validez o valor óptimo sujeto a restricciones.',
        en: 'Validity certificate or optimal value subject to constraints.'
      },
      historicalContext: {
        es: 'Problema canónico de las ciencias de la computación analizado en los textos de Kleinberg & Tardos y Cormen et al.',
        en: 'Canonical computer science problem analyzed in Kleinberg & Tardos and Cormen et al.'
      },
      algorithmicPerspective: {
        es: 'Requiere caracterizar la subestructura del problema y clasificar su complejidad temporal y espacial.',
        en: 'Requires characterizing problem substructure and classifying asymptotic bounds.'
      },
      naiveTrapWarning: {
        es: 'Comprobar siempre casos de borde (instancias vacías, unitarias o con valores extremos) antes de validar la solución.',
        en: 'Always verify edge cases (empty, singleton, or extreme values) before declaring solution correctness.'
      }
    }
  );
}
`;

fs.writeFileSync('./src/engine/exerciseContextInsights.ts', insightsCode, 'utf8');
console.log('Successfully updated src/engine/exerciseContextInsights.ts with all dedicated exercise insights!');
