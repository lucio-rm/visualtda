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
        es: 'Si todos los pesos son idénticos (vᵢ = 1), la formulación DP se simplifica drásticamente y la regla voraz Earliest-Finish-Time alcanza la solución óptima en tiempo O(n log n).',
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
  ]
};

export function getRelatedExercisesFor(exerciseId: string): CrossExerciseRelation[] {
  return CROSS_EXERCISE_RELATIONS[exerciseId] || [];
}
