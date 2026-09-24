import { LocalizedString } from '../types/category';

export interface CrossExerciseRelation {
  targetExerciseId: string;
  comparisonTitle: LocalizedString;
  comparisonInsight: LocalizedString;
  paradigmBadge: LocalizedString;
}

export const CROSS_EXERCISE_RELATIONS: Record<string, CrossExerciseRelation[]> = {
  'knapsack-dp': [
    {
      targetExerciseId: 'knapsack-greedy',
      comparisonTitle: {
        es: 'Mochila Fraccionaria (Greedy)',
        en: 'Fractional Knapsack (Greedy)'
      },
      comparisonInsight: {
        es: 'En la versión continua es factible tomar fracciones de objetos, haciendo óptima la regla Greedy por densidad vᵢ/wᵢ en O(n log n). En la versión 0/1 discreta, la indivisibilidad rompe el intercambio y exige Programación Dinámica O(n·W).',
        en: 'In the continuous version fractional items are permitted, making the Greedy density rule vᵢ/wᵢ optimal in O(n log n). In 0/1 discrete knapsack, indivisibility breaks the exchange property, requiring Dynamic Programming O(n·W).'
      },
      paradigmBadge: { es: 'Greedy vs. DP', en: 'Greedy vs. DP' }
    },
    {
      targetExerciseId: 'knapsack-branch-and-bound',
      comparisonTitle: {
        es: 'Mochila 0/1 con Branch & Bound',
        en: '0/1 Knapsack with Branch & Bound'
      },
      comparisonInsight: {
        es: 'Resuelve la misma mochila 0/1 entera pero en un árbol de decisión podado por cotas superiores de relajación fraccionaria. Resulta ideal cuando la capacidad W es astronómica (donde la pseudopolinomial de DP colapsa).',
        en: 'Solves the same discrete 0/1 knapsack on a decision tree pruned by fractional relaxation upper bounds. Ideal when capacity W is massive (where pseudopolynomial DP collapses).'
      },
      paradigmBadge: { es: 'DP vs. B&B', en: 'DP vs. B&B' }
    }
  ],

  'knapsack-greedy': [
    {
      targetExerciseId: 'knapsack-dp',
      comparisonTitle: {
        es: 'Mochila 0/1 (Programación Dinámica)',
        en: '0/1 Knapsack (Dynamic Programming)'
      },
      comparisonInsight: {
        es: 'Cuando los objetos no pueden fraccionarse, la densidad no garantiza el óptimo porque puede dejar holgura ociosa inservible. DP evalúa la recurrencia exacta OPT(i, w).',
        en: 'When items cannot be divided, density does not guarantee optimality because it may leave unusable slack capacity. DP computes the exact recurrence OPT(i, w).'
      },
      paradigmBadge: { es: 'Greedy vs. DP', en: 'Greedy vs. DP' }
    },
    {
      targetExerciseId: 'knapsack-branch-and-bound',
      comparisonTitle: {
        es: 'Mochila 0/1 con Branch & Bound',
        en: '0/1 Knapsack with Branch & Bound'
      },
      comparisonInsight: {
        es: 'Branch & Bound utiliza la solución greedy fraccionaria calculada en cada nodo como cota superior para descartar subárboles completos sin perder el óptimo entero.',
        en: 'Branch & Bound uses the fractional greedy solution at each subproblem node as an upper bound to prune entire subtrees without sacrificing discrete optimality.'
      },
      paradigmBadge: { es: 'Greedy en B&B', en: 'Greedy in B&B' }
    }
  ],

  'knapsack-branch-and-bound': [
    {
      targetExerciseId: 'knapsack-dp',
      comparisonTitle: {
        es: 'Mochila 0/1 (Programación Dinámica)',
        en: '0/1 Knapsack (Dynamic Programming)'
      },
      comparisonInsight: {
        es: 'DP construye una tabla exhaustiva de estados de tamaño (n+1)×(W+1). Branch & Bound explora selectivamente el espacio 2ⁿ priorizando los nodos con mayor cota superior promiscua.',
        en: 'DP constructs an exhaustive state table of size (n+1)×(W+1). Branch & Bound selectively searches the 2ⁿ space, prioritizing nodes with the highest upper bound.'
      },
      paradigmBadge: { es: 'B&B vs. DP', en: 'B&B vs. DP' }
    },
    {
      targetExerciseId: 'knapsack-greedy',
      comparisonTitle: {
        es: 'Mochila Fraccionaria (Greedy)',
        en: 'Fractional Knapsack (Greedy)'
      },
      comparisonInsight: {
        es: 'La relajación continua resuelta por Greedy provee la función de cota superior (upper bound) más rápida y ajustada para las podas de Branch & Bound.',
        en: 'The continuous relaxation solved by Greedy provides the fastest and tightest upper bounding function for Branch & Bound pruning.'
      },
      paradigmBadge: { es: 'B&B y Greedy', en: 'B&B and Greedy' }
    }
  ],

  'interval-scheduling': [
    {
      targetExerciseId: 'weighted-interval-scheduling',
      comparisonTitle: {
        es: 'Intervalos Ponderados (Programación Dinámica)',
        en: 'Weighted Interval Scheduling (DP)'
      },
      comparisonInsight: {
        es: 'Cuando las tareas tienen pesos/beneficios arbitrarios vᵢ, elegir por tiempo de fin más temprano ya no es óptimo. Se requiere ordenar por finalización y aplicar la recurrencia DP con compatibilidad p(j).',
        en: 'When intervals carry arbitrary values/weights vᵢ, earliest finish time is no longer optimal. One must sort by finish time and apply the DP recurrence using compatibility p(j).'
      },
      paradigmBadge: { es: 'Greedy vs. DP', en: 'Greedy vs. DP' }
    },
    {
      targetExerciseId: 'interval-partitioning-greedy',
      comparisonTitle: {
        es: 'Partición de Intervalos (Greedy)',
        en: 'Interval Partitioning (Greedy)'
      },
      comparisonInsight: {
        es: 'En Scheduling se busca el subconjunto máximo de tareas en un solo recurso. En Partitioning no se rechaza ninguna tarea: se calcula el mínimo número de recursos (aulas) necesarios para alojarlas a todas sin conflicto (igual a la profundidad d).',
        en: 'In Scheduling we seek the maximum subset for a single resource. In Partitioning no tasks are rejected: we compute the minimum number of resources (classrooms) needed to accommodate all tasks (equal to depth d).'
      },
      paradigmBadge: { es: 'Variación de Recursos', en: 'Resource Variation' }
    }
  ],

  'weighted-interval-scheduling': [
    {
      targetExerciseId: 'interval-scheduling',
      comparisonTitle: {
        es: 'Intervalos no Ponderados (Greedy)',
        en: 'Unweighted Interval Scheduling (Greedy)'
      },
      comparisonInsight: {
        es: 'Si todos los pesos son idénticos (vᵢ = 1), la formulación DP se simplifica drásticamente y la regla Greedy Earliest-Finish-Time alcanza la solución óptima en tiempo O(n log n).',
        en: 'If all weights are identical (vᵢ = 1), the DP formulation collapses to the earliest-finish-time greedy rule, achieving optimality in O(n log n).'
      },
      paradigmBadge: { es: 'DP vs. Greedy', en: 'DP vs. Greedy' }
    }
  ],

  'interval-partitioning-greedy': [
    {
      targetExerciseId: 'interval-scheduling',
      comparisonTitle: {
        es: 'Selección de Intervalos en Recurso Único (Greedy)',
        en: 'Single-Resource Interval Scheduling (Greedy)'
      },
      comparisonInsight: {
        es: 'Partición ordena por tiempo de inicio sᵢ para saturar recursos concurrentes; Selección de Intervalos ordena por tiempo de fin fᵢ para liberar el recurso lo antes posible.',
        en: 'Partitioning sorts by start time sᵢ to satisfy concurrent demand; Interval Scheduling sorts by finish time fᵢ to free the single resource as soon as possible.'
      },
      paradigmBadge: { es: 'Criterio Greedy', en: 'Greedy Rule' }
    }
  ],

  'dijkstra-greedy': [
    {
      targetExerciseId: 'bellman-ford-dp',
      comparisonTitle: {
        es: 'Bellman-Ford (Programación Dinámica)',
        en: 'Bellman-Ford (Dynamic Programming)'
      },
      comparisonInsight: {
        es: 'Dijkstra requiere estrictamente pesos no negativos w(u, v) ≥ 0 para garantizar que la distancia mínima a un nodo no disminuirá posteriormente. Bellman-Ford admite pesos negativos y detecta ciclos de peso negativo en O(V·E).',
        en: 'Dijkstra strictly requires non-negative edge weights w(u, v) ≥ 0 to guarantee finalized distances never decrease. Bellman-Ford supports negative weights and detects negative cycles in O(V·E).'
      },
      paradigmBadge: { es: 'Greedy vs. DP', en: 'Greedy vs. DP' }
    }
  ],

  'bellman-ford-dp': [
    {
      targetExerciseId: 'dijkstra-greedy',
      comparisonTitle: {
        es: 'Dijkstra (Greedy)',
        en: 'Dijkstra (Greedy)'
      },
      comparisonInsight: {
        es: 'Cuando el grafo posee únicamente aristas de costo no negativo, Dijkstra es sustancialmente más rápido (O((V+E) log V) con min-heap frente a O(V·E) de Bellman-Ford).',
        en: 'When the graph only contains non-negative edges, Dijkstra is significantly faster (O((V+E) log V) with min-heap vs O(V·E) for Bellman-Ford).'
      },
      paradigmBadge: { es: 'DP vs. Greedy', en: 'DP vs. Greedy' }
    }
  ],

  'merge-sort': [
    {
      targetExerciseId: 'inversion-counting-dyc',
      comparisonTitle: {
        es: 'Conteo de Inversiones (División y Conquista)',
        en: 'Inversion Counting (Divide & Conquer)'
      },
      comparisonInsight: {
        es: 'El conteo de inversiones aprovecha la misma estructura de división de Merge Sort. En el paso de mezcla, cuando se toma un elemento de la mitad derecha, se acumulan en O(1) todas las inversiones con los elementos restantes de la mitad izquierda.',
        en: 'Inversion counting piggybacks on Merge Sort’s divide-and-conquer recursion. During the merge step, picking an element from the right half counts cross-inversions with all remaining left-half elements in O(1).'
      },
      paradigmBadge: { es: 'Algoritmo Derivado', en: 'Derived Algorithm' }
    },
    {
      targetExerciseId: 'closest-pair-dyc',
      comparisonTitle: {
        es: 'Par Más Cercano (División y Conquista)',
        en: 'Closest Pair of Points (D&C)'
      },
      comparisonInsight: {
        es: 'Utiliza el ordenamiento por coordenadas X e Y como paso previo fundamental, y mantiene la cota O(n log n) asegurando que la franja central (strip) se verifique en tiempo lineal.',
        en: 'Uses sorting by X and Y coordinates as a crucial prerequisite, maintaining O(n log n) by scanning the boundary strip in linear time.'
      },
      paradigmBadge: { es: 'D&C Geométrico', en: 'Geometric D&C' }
    }
  ],

  'inversion-counting-dyc': [
    {
      targetExerciseId: 'merge-sort',
      comparisonTitle: {
        es: 'Merge Sort (División y Conquista)',
        en: 'Merge Sort (Divide & Conquer)'
      },
      comparisonInsight: {
        es: 'La cota asintótica O(n log n) de conteo de inversiones se fundamenta en la recurrencia T(n) = 2T(n/2) + O(n) idéntica a Merge Sort, demostrando cómo reutilizar una rutina de ordenamiento para calcular métricas de desorden (distancia Kendall tau).',
        en: 'The O(n log n) bound for inversion counting relies on the recurrence T(n) = 2T(n/2) + O(n) identical to Merge Sort, showing how sorting can compute permutation distance (Kendall tau).'
      },
      paradigmBadge: { es: 'Fundamento Base', en: 'Foundational Base' }
    }
  ],

  'vertex-cover-reduction': [
    {
      targetExerciseId: 'vertex-cover-approx',
      comparisonTitle: {
        es: 'Aproximación de Vertex Cover (Matching Maximal)',
        en: 'Vertex Cover Approximation (Maximal Matching)'
      },
      comparisonInsight: {
        es: 'La reducción demuestra que encontrar el Vertex Cover mínimo es un problema NP-difícil. Ante la inviabilidad polinomial exacta, el algoritmo de aproximación encuentra una solución que dista a lo sumo un factor 2 del óptimo en tiempo polinomial O(V + E).',
        en: 'The reduction proves that minimum Vertex Cover is NP-hard. Facing exponential exact runtime, the approximation algorithm guarantees a solution within a factor of 2 of optimal in polynomial time O(V + E).'
      },
      paradigmBadge: { es: 'Exacto vs. Aproximado', en: 'Exact vs. Approx' }
    }
  ],

  'vertex-cover-approx': [
    {
      targetExerciseId: 'vertex-cover-reduction',
      comparisonTitle: {
        es: 'Reducción Independent Set → Vertex Cover',
        en: 'Independent Set → Vertex Cover Reduction'
      },
      comparisonInsight: {
        es: 'Establece la prueba teórica formal de NP-completitud: un conjunto S es independiente si y solo si V \\ S es un Vertex Cover. Esto justifica formalmente la necesidad de recurrir a algoritmos de aproximación en la práctica.',
        en: 'Provides the formal NP-completeness proof: set S is independent if and only if V \\ S is a vertex cover. This formally justifies resorting to polynomial approximation algorithms.'
      },
      paradigmBadge: { es: 'Complejidad Teórica', en: 'Theoretical Complexity' }
    }
  ],

  'n-queens': [
    {
      targetExerciseId: 'sudoku-backtracking',
      comparisonTitle: {
        es: 'Sudoku (Backtracking)',
        en: 'Sudoku (Backtracking)'
      },
      comparisonInsight: {
        es: 'Ambos son problemas clásicos de Satisfacción de Restricciones (CSP). N-Reinas ilustra podas continuas por diagonales y filas; Sudoku combina podas en cuadrantes 3×3, filas y columnas.',
        en: 'Both are classic Constraint Satisfaction Problems (CSP). N-Queens illustrates row/col/diagonal pruning; Sudoku applies 3×3 box, row, and column constraints.'
      },
      paradigmBadge: { es: 'CSP y Podas', en: 'CSP & Pruning' }
    },
    {
      targetExerciseId: 'knights-tour-backtracking',
      comparisonTitle: {
        es: 'Recorrido del Caballo (Backtracking)',
        en: "Knight's Tour (Backtracking)"
      },
      comparisonInsight: {
        es: 'Mientras N-Reinas busca ubicar n piezas independientes sin ataque, el Recorrido del Caballo es un camino hamiltoniano en un grafo de tablero donde cada casilla debe visitarse exactamente una vez.',
        en: 'While N-Queens places n non-attacking pieces, the Knight’s Tour is a Hamiltonian path on the board graph visiting each square exactly once.'
      },
      paradigmBadge: { es: 'Grafos en Tablero', en: 'Board Graphs' }
    }
  ],

  'coin-change-dp': [
    {
      targetExerciseId: 'knapsack-dp',
      comparisonTitle: {
        es: 'Mochila 0/1 (Programación Dinámica)',
        en: '0/1 Knapsack (Dynamic Programming)'
      },
      comparisonInsight: {
        es: 'Ambos problemas optimizan una función objetivo aditiva sujeta a capacidad. Cambio de Monedas corresponde a una mochila ilimitada (unbounded) donde cada denominación puede reutilizarse infinitas veces.',
        en: 'Both problems optimize an additive objective subject to capacity. Coin Change is an unbounded knapsack variant where each coin denomination can be reused arbitrarily.'
      },
      paradigmBadge: { es: 'DP Ilimitada vs. 0/1', en: 'Unbounded vs 0/1 DP' }
    },
    {
      targetExerciseId: 'knapsack-greedy',
      comparisonTitle: {
        es: 'Mochila Fraccionaria (Greedy)',
        en: 'Fractional Knapsack (Greedy)'
      },
      comparisonInsight: {
        es: 'Demuestra el peligro del heurístico Greedy: mientras que en monedas estándar o mochila continua Greedy triunfa, en sistemas arbitrarios como [1, 3, 4] con V=6 Greedy toma 4+1+1 (3 monedas) perdiendo el óptimo 3+3 (2 monedas).',
        en: 'Illustrates the danger of Greedy heuristics: while Greedy succeeds on canonical coin systems or continuous knapsacks, on arbitrary denominations like [1, 3, 4] with V=6 Greedy yields 4+1+1 (3 coins), missing the optimum 3+3 (2 coins).'
      },
      paradigmBadge: { es: 'Greedy vs. DP', en: 'Greedy vs. DP' }
    }
  ],

  'kruskal-mst-greedy': [
    {
      targetExerciseId: 'dijkstra-greedy',
      comparisonTitle: {
        es: 'Dijkstra (Caminos Mínimos)',
        en: 'Dijkstra (Shortest Paths)'
      },
      comparisonInsight: {
        es: 'Ambos son algoritmos Greedy sobre grafos ponderados, pero con objetivos distintos: Kruskal minimiza la suma global de aristas conectando todos los vértices (MST con propiedad del corte), mientras Dijkstra minimiza la distancia desde una única fuente (SPT).',
        en: 'Both are Greedy graph algorithms with distinct goals: Kruskal minimizes total edge weight to span all vertices (MST via Cut Property), while Dijkstra minimizes path distance from a single source (SPT).'
      },
      paradigmBadge: { es: 'MST vs. SPT', en: 'MST vs. SPT' }
    }
  ],

  'max-flow': [
    {
      targetExerciseId: 'linear-programming-formulation',
      comparisonTitle: {
        es: 'Programación Lineal (Formulación)',
        en: 'Linear Programming (Formulation)'
      },
      comparisonInsight: {
        es: 'El Flujo Máximo puede formularse como un problema de Programación Lineal con función objetivo max ∑ f(s, v), restricciones de capacidad 0 ≤ f(e) ≤ c(e) y leyes de conservación de flujo ∑ f_in = ∑ f_out en cada nodo intermedio.',
        en: 'Max Flow can be formulated as a Linear Program maximizing ∑ f(s, v) subject to capacity constraints 0 ≤ f(e) ≤ c(e) and node flow conservation ∑ f_in = ∑ f_out.'
      },
      paradigmBadge: { es: 'Reducción a PL', en: 'Reduction to LP' }
    }
  ],

  'linear-programming-formulation': [
    {
      targetExerciseId: 'max-flow',
      comparisonTitle: {
        es: 'Flujo Máximo (Ford-Fulkerson)',
        en: 'Max Flow (Ford-Fulkerson)'
      },
      comparisonInsight: {
        es: 'Muestra cómo problemas combinatorios específicos que encajan en Programación Lineal general admiten algoritmos combinatorialmente especializados (redes residuales, caminos aumentantes) mucho más veloces que el método Símplex general.',
        en: 'Exemplifies how specific combinatorial problems within general Linear Programming admit specialized algorithms (residual networks, augmenting paths) far faster than general Simplex.'
      },
      paradigmBadge: { es: 'PL Especializada', en: 'Specialized LP' }
    }
  ],

  'subset-sum-backtracking': [
    {
      targetExerciseId: 'knapsack-dp',
      comparisonTitle: {
        es: 'Mochila 0/1 (Programación Dinámica)',
        en: '0/1 Knapsack (Dynamic Programming)'
      },
      comparisonInsight: {
        es: 'Subset Sum es la versión de decisión de la Mochila 0/1 donde el valor de cada objeto coincide con su peso (vᵢ = wᵢ) y la meta es verificar si existe un subconjunto con suma exacta igual a W.',
        en: 'Subset Sum is the decision version of 0/1 Knapsack where item value equals its weight (vᵢ = wᵢ) and the goal is to decide if a subset sums exactly to W.'
      },
      paradigmBadge: { es: 'Variación de Decisión', en: 'Decision Variant' }
    },
    {
      targetExerciseId: 'knapsack-branch-and-bound',
      comparisonTitle: {
        es: 'Mochila 0/1 con Branch & Bound',
        en: '0/1 Knapsack with Branch & Bound'
      },
      comparisonInsight: {
        es: 'Ambos exploran el retículo booleano {0, 1}ⁿ. Backtracking poda por exceso (suma actual > T) y déficit (suma actual + remanente < T); Branch & Bound utiliza además cotas superiores continuas de relajación.',
        en: 'Both explore the boolean lattice {0, 1}ⁿ. Backtracking prunes by excess and deficit; Branch & Bound additionally leverages continuous relaxation upper bounds.'
      },
      paradigmBadge: { es: 'Podas de Retículo', en: 'Lattice Pruning' }
    }
  ],

  'graph-coloring-backtracking': [
    {
      targetExerciseId: 'sudoku-backtracking',
      comparisonTitle: {
        es: 'Sudoku (Backtracking)',
        en: 'Sudoku (Backtracking)'
      },
      comparisonInsight: {
        es: 'Sudoku es matemáticamente una instancia de 9-Coloreo de un grafo de 81 vértices con aristas entre celdas que comparten fila, columna o cuadrante 3×3, con vértices pre-coloreados fijos.',
        en: 'Sudoku is mathematically an instance of 9-Coloring on an 81-vertex graph with edges connecting cells in the same row, column, or 3×3 box, with fixed pre-colored vertices.'
      },
      paradigmBadge: { es: 'Coloreo Estructurado', en: 'Structured Coloring' }
    }
  ],

  'sudoku-backtracking': [
    {
      targetExerciseId: 'graph-coloring-backtracking',
      comparisonTitle: {
        es: 'Coloreo de Grafos (Backtracking)',
        en: 'Graph Coloring (Backtracking)'
      },
      comparisonInsight: {
        es: 'La restricción del Sudoku de que dígitos idénticos no compartan fila, columna o cuadrante equivale exactamente a que ningún par de vértices adyacentes en el grafo de restricciones reciba el mismo color.',
        en: 'The Sudoku rule prohibiting duplicate digits in rows, columns, or boxes is equivalent to no adjacent vertices receiving identical colors in its constraint graph.'
      },
      paradigmBadge: { es: 'Grafo Subyacente', en: 'Underlying Graph' }
    },
    {
      targetExerciseId: 'n-queens',
      comparisonTitle: {
        es: 'N-Reinas (Backtracking)',
        en: 'N-Queens (Backtracking)'
      },
      comparisonInsight: {
        es: 'Ambos representan problemas clásicos de Satisfacción de Restricciones (CSP) resueltos mediante búsqueda sistemática en árbol con propagación de restricciones y poda inmediata al detectar conflictos.',
        en: 'Both represent classic Constraint Satisfaction Problems (CSP) solved via systematic tree search with constraint propagation and immediate pruning upon conflict detection.'
      },
      paradigmBadge: { es: 'CSP Canónico', en: 'Canonical CSP' }
    }
  ],

  'hamiltonian-cycle-backtracking': [
    {
      targetExerciseId: 'tsp-branch-and-bound',
      comparisonTitle: {
        es: 'Viajante de Comercio (Branch & Bound)',
        en: 'Traveling Salesperson (Branch & Bound)'
      },
      comparisonInsight: {
        es: 'Ciclo Hamiltoniano pregunta si existe un ciclo simple que visite todos los vértices (decisión, NP-completo). TSP busca el ciclo hamiltoniano de longitud mínima en un grafo con pesos arbitrarios (optimización, NP-difícil).',
        en: 'Hamiltonian Cycle asks whether a simple cycle visiting all vertices exists (decision, NP-complete). TSP seeks the minimum-weight Hamiltonian cycle in an edge-weighted graph (optimization, NP-hard).'
      },
      paradigmBadge: { es: 'Decisión vs. Optimización', en: 'Decision vs. Opt' }
    },
    {
      targetExerciseId: 'knights-tour-backtracking',
      comparisonTitle: {
        es: 'Recorrido del Caballo (Backtracking)',
        en: "Knight's Tour (Backtracking)"
      },
      comparisonInsight: {
        es: 'El recorrido del caballo cerrado es formalmente un ciclo hamiltoniano en el grafo inducido por los movimientos válidos de un caballo de ajedrez en un tablero de 8×8.',
        en: 'The closed knight’s tour is formally a Hamiltonian cycle in the graph induced by legal chess knight moves on an 8×8 board.'
      },
      paradigmBadge: { es: 'Instancia en Tablero', en: 'Board Instance' }
    }
  ],

  'tsp-branch-and-bound': [
    {
      targetExerciseId: 'hamiltonian-cycle-backtracking',
      comparisonTitle: {
        es: 'Ciclo Hamiltoniano (Backtracking)',
        en: 'Hamiltonian Cycle (Backtracking)'
      },
      comparisonInsight: {
        es: 'Branch & Bound añade una función de cota inferior admisible (como el Árbol Generador Mínimo 1-Tree de Held-Karp) para podar ramas enteras que no puedan superar la mejor solución incumbente.',
        en: 'Branch & Bound adds an admissible lower bounding function (such as the Held-Karp 1-Tree MST relaxation) to prune subtrees that cannot beat the best incumbent tour.'
      },
      paradigmBadge: { es: 'Cotas en B&B', en: 'Bounding in B&B' }
    }
  ],

  'knights-tour-backtracking': [
    {
      targetExerciseId: 'hamiltonian-cycle-backtracking',
      comparisonTitle: {
        es: 'Ciclo Hamiltoniano (Backtracking)',
        en: 'Hamiltonian Cycle (Backtracking)'
      },
      comparisonInsight: {
        es: 'La heurística de Warnsdorff (elegir la casilla con menor grado de salida) actúa como un criterio greedy de ordenamiento de ramas dentro de la exploración de caminos hamiltonianos, evitando cuellos de botella.',
        en: 'Warnsdorff’s heuristic (picking the neighbor with lowest degree) acts as a greedy branch-ordering heuristic inside the Hamiltonian path search, avoiding premature bottlenecks.'
      },
      paradigmBadge: { es: 'Heurística en Búsqueda', en: 'Search Heuristics' }
    },
    {
      targetExerciseId: 'n-queens',
      comparisonTitle: {
        es: 'N-Reinas (Backtracking)',
        en: 'N-Queens (Backtracking)'
      },
      comparisonInsight: {
        es: 'Mientras N-Reinas busca independencia entre piezas en el tablero sin amenazas diagonales o axiales, el Caballo busca conectividad consecutiva para visitar cada celda una única vez.',
        en: 'While N-Queens seeks piece independence with no mutual threats, Knight’s Tour seeks consecutive topological connectivity visiting every board square exactly once.'
      },
      paradigmBadge: { es: 'Problemas de Ajedrez', en: 'Chess Problems' }
    }
  ],

  'peak-finding-dyc': [
    {
      targetExerciseId: 'merge-sort',
      comparisonTitle: {
        es: 'Merge Sort (División y Conquista)',
        en: 'Merge Sort (Divide & Conquer)'
      },
      comparisonInsight: {
        es: 'Mientras Merge Sort debe resolver recursivamente ambas mitades (T(n) = 2T(n/2) + O(n)), Búsqueda de Picos descarta una mitad completa siguiendo la pendiente creciente (T(n) = T(n/2) + O(1)), logrando O(log n).',
        en: 'While Merge Sort must solve both halves recursively (T(n) = 2T(n/2) + O(n)), Peak Finding discards an entire half following the rising slope (T(n) = T(n/2) + O(1)), achieving O(log n).'
      },
      paradigmBadge: { es: 'Poda de Subproblema', en: 'Subproblem Pruning' }
    }
  ],

  'karatsuba-dyc': [
    {
      targetExerciseId: 'merge-sort',
      comparisonTitle: {
        es: 'Merge Sort (División y Conquista)',
        en: 'Merge Sort (Divide & Conquer)'
      },
      comparisonInsight: {
        es: 'Karatsuba demuestra el Teorema Maestro reduciendo el número de llamadas recursivas de 4 a 3 mediante álgebra inteligente: T(n) = 3T(n/2) + O(n) implica O(n^{log₂ 3}) ≈ O(n^{1.585}), superando el O(n²) tradicional.',
        en: 'Karatsuba illustrates the Master Theorem by algebraically reducing recursive calls from 4 to 3: T(n) = 3T(n/2) + O(n) yields O(n^{log₂ 3}) ≈ O(n^{1.585}), defeating classical O(n²).'
      },
      paradigmBadge: { es: 'Teorema Maestro', en: 'Master Theorem' }
    }
  ]
};

export function getRelatedExercisesFor(exerciseId: string): CrossExerciseRelation[] {
  return CROSS_EXERCISE_RELATIONS[exerciseId] || [];
}
