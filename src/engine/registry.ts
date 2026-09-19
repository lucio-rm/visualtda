import { Category, ExerciseMetadata } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'divide-and-conquer',
    order: 1,
    title: { es: 'División y Conquista', en: 'Divide & Conquer' },
    description: {
      es: 'Dividir el problema en subproblemas independientes, resolver recursivamente y combinar soluciones.',
      en: 'Break problem into independent subproblems, solve recursively, and combine solutions.'
    }
  },
  {
    id: 'greedy',
    order: 2,
    title: { es: 'Algoritmos Greedy', en: 'Greedy Algorithms' },
    description: {
      es: 'Construir la solución paso a paso tomando la mejor decisión local inmediata sin volver atrás.',
      en: 'Construct solution step by step making locally optimal choices with no backtracking.'
    }
  },
  {
    id: 'backtracking',
    order: 3,
    title: { es: 'Backtracking', en: 'Backtracking' },
    description: {
      es: 'Exploración exhaustiva y sistemática del espacio de soluciones con poda de ramas inviables.',
      en: 'Systematic exhaustive search of solution space with pruning of infeasible branches.'
    }
  },
  {
    id: 'dynamic-programming',
    order: 4,
    title: { es: 'Programación Dinámica', en: 'Dynamic Programming' },
    description: {
      es: 'Resolver subproblemas superpuestos recordando resultados previos para evitar recomputación.',
      en: 'Solve overlapping subproblems by memoizing previous results to avoid recomputation.'
    }
  },
  {
    id: 'network-flow',
    order: 5,
    title: { es: 'Redes de Flujo', en: 'Network Flow' },
    description: {
      es: 'Modelar redes de capacidades y calcular flujos máximos y cortes mínimos.',
      en: 'Model capacity networks and calculate maximum flow and minimum cut.'
    }
  },
  {
    id: 'linear-programming',
    order: 6,
    title: { es: 'Programación Lineal', en: 'Linear Programming' },
    description: {
      es: 'Optimización de una función objetivo lineal sujeta a restricciones de desigualdades lineales.',
      en: 'Optimization of a linear objective function subject to linear inequality constraints.'
    }
  },
  {
    id: 'reductions',
    order: 7,
    title: { es: 'Reducciones de Problemas', en: 'Problem Reductions' },
    description: {
      es: 'Transformar una instancia de un problema en otra para clasificar complejidad computacional.',
      en: 'Transform problem instances into others to classify computational complexity.'
    }
  },
  {
    id: 'approximation',
    order: 8,
    title: { es: 'Algoritmos de Aproximación', en: 'Approximation Algorithms' },
    description: {
      es: 'Algoritmos eficientes para problemas NP-difíciles con garantías formales de calidad de solución.',
      en: 'Efficient algorithms for NP-hard problems with provable solution quality bounds.'
    }
  },
  {
    id: 'randomized',
    order: 9,
    title: { es: 'Algoritmos Randomizados', en: 'Randomized Algorithms' },
    description: {
      es: 'Algoritmos que emplean aleatoriedad para simplificar lógica o acelerar tiempo esperado.',
      en: 'Algorithms that employ randomness to simplify logic or accelerate expected runtime.'
    }
  }
];

export const EXERCISES: ExerciseMetadata[] = [
  {
    id: 'n-queens',
    problemId: 'n-queens',
    techniqueId: 'backtracking',
    categoryId: 'backtracking',
    order: 1,
    difficulty: 2,
    title: { es: 'N-Reinas', en: 'N-Queens' },
    subtitle: {
      es: 'Colocar N reinas en un tablero de N×N sin que se ataquen mutuamente',
      en: 'Place N queens on an N×N chessboard such that no two queens threaten each other'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['backtracking', 'chess', 'recursion', 'pruning']
  },
  {
    id: 'subset-sum-backtracking',
    problemId: 'subset-sum',
    techniqueId: 'backtracking',
    categoryId: 'backtracking',
    order: 2,
    difficulty: 2,
    title: { es: 'Suma de Subconjuntos (Subset Sum)', en: 'Subset Sum' },
    subtitle: {
      es: 'Encontrar todos los subconjuntos que suman exactamente S con podas tempranas por exceso y cota superior',
      en: 'Find all subsets summing to exactly S with early pruning by excess and upper-bound deficit'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['backtracking', 'subset-sum', 'pruning', 'recursion', 'fiuba']
  },
  {
    id: 'merge-sort',
    problemId: 'merge-sort',
    techniqueId: 'divide-and-conquer',
    categoryId: 'divide-and-conquer',
    order: 1,
    difficulty: 1,
    title: { es: 'Ordenamiento por Fusión (Merge Sort)', en: 'Merge Sort' },
    subtitle: {
      es: 'Dividir arreglo a la mitad, ordenar recursivamente y combinar en tiempo lineal',
      en: 'Divide array into halves, sort recursively, and merge in linear time'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['divide-and-conquer', 'sorting', 'recursion']
  },
  {
    id: 'max-subarray-dyc',
    problemId: 'max-subarray',
    techniqueId: 'divide-and-conquer',
    categoryId: 'divide-and-conquer',
    order: 2,
    difficulty: 2,
    title: { es: 'Subarreglo de Máxima Suma', en: 'Maximum Subarray (D&C)' },
    subtitle: {
      es: 'Encontrar el subarreglo contiguo de máxima suma combinando mitades con el subarreglo cruzado O(n)',
      en: 'Find maximum sum contiguous subarray by combining halves with O(n) crossing subarray'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['divide-and-conquer', 'recursion', 'master-theorem', 'arrays', 'optimization']
  },
  {
    id: 'peak-finding-dyc',
    problemId: 'peak-finding',
    techniqueId: 'divide-and-conquer',
    categoryId: 'divide-and-conquer',
    order: 3,
    difficulty: 1,
    title: { es: 'Búsqueda de un Pico (Peak Finding)', en: 'Peak Finding (O(log n))' },
    subtitle: {
      es: 'Hallar un elemento mayor o igual a sus vecinos en tiempo logarítmico O(log n) siguiendo el gradiente ascendente',
      en: 'Find an element greater than or equal to its neighbors in O(log n) logarithmic time following the uphill gradient'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['divide-and-conquer', 'binary-search', 'recursion', 'logarithmic-time', 'master-theorem', 'fiuba', 'rw']
  },
  {
    id: 'inversion-counting-dyc',
    problemId: 'inversion-counting',
    techniqueId: 'divide-and-conquer',
    categoryId: 'divide-and-conquer',
    order: 4,
    difficulty: 2,
    title: { es: 'Contar Inversiones en O(n log n)', en: 'Inversion Counting in O(n log n)' },
    subtitle: {
      es: 'Calcular el número total de pares desordenados i < j con A[i] > A[j] adaptando Merge Sort con conteo acumulado en O(1)',
      en: 'Count total disordered pairs i < j with A[i] > A[j] by adapting Merge Sort with O(1) cumulative split counting'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['divide-and-conquer', 'sorting', 'merge-sort', 'inversions', 'master-theorem', 'ranking', 'fiuba', 'rw']
  },
  {
    id: 'interval-scheduling',
    problemId: 'interval-scheduling',
    techniqueId: 'greedy',
    categoryId: 'greedy',
    order: 1,
    difficulty: 2,
    title: { es: 'Selección de Intervalos', en: 'Interval Scheduling' },
    subtitle: {
      es: 'Maximizar cantidad de tareas compatibles seleccionando por tiempo de fin más temprano',
      en: 'Maximize compatible jobs by greedily selecting earliest finish time'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['greedy', 'intervals', 'exchange-argument']
  },
  {
    id: 'knapsack-greedy',
    problemId: 'knapsack',
    techniqueId: 'greedy',
    categoryId: 'greedy',
    order: 2,
    difficulty: 2,
    title: { es: 'Mochila Fraccionaria (Greedy)', en: 'Fractional Knapsack (Greedy)' },
    subtitle: {
      es: 'Ordenar ítems por valor/peso. Óptimo para versión fraccionaria; contraejemplo para 0/1',
      en: 'Sort by value/weight ratio. Optimal for fractional version; counterexample for 0/1'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['greedy', 'knapsack', 'counterexample']
  },
  {
    id: 'road-antennas-greedy',
    problemId: 'road-antennas-greedy',
    techniqueId: 'greedy',
    categoryId: 'greedy',
    order: 3,
    difficulty: 2,
    title: { es: 'Antenas en una Ruta (Cobertura)', en: 'Highway Antennas (Covering)' },
    subtitle: {
      es: 'Ubicar la mínima cantidad de antenas de radio R para dar cobertura total a todas las casas sobre una ruta',
      en: 'Place the minimum number of radius-R antennas to provide full coverage to all houses along a highway'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['greedy', 'interval-covering', 'sorting', 'exchange-argument', 'fiuba']
  },
  {
    id: 'knapsack-dp',
    problemId: 'knapsack',
    techniqueId: 'dynamic-programming',
    categoryId: 'dynamic-programming',
    order: 1,
    difficulty: 3,
    title: { es: 'Mochila 0/1 (Programación Dinámica)', en: '0/1 Knapsack (Dynamic Programming)' },
    subtitle: {
      es: 'Construir tabla 2D de subproblemas decidiendo incluir o excluir cada elemento',
      en: 'Build 2D table of subproblems deciding whether to include or exclude each item'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['dynamic-programming', 'knapsack', 'memoization']
  },
  {
    id: 'juan-el-vago',
    problemId: 'juan-el-vago',
    techniqueId: 'dynamic-programming',
    categoryId: 'dynamic-programming',
    order: 2,
    difficulty: 2,
    title: { es: 'Juan el Vago (PD 1D)', en: 'Juan the Slacker (1D DP)' },
    subtitle: {
      es: 'Maximizar ganancias de ofertas diarias sin trabajar dos días seguidos con reconstrucción O(n)',
      en: 'Maximize earnings without working consecutive days with linear reconstruction O(n)'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['dynamic-programming', '1d-table', 'reconstruction', 'memoization', 'optimization']
  },
  {
    id: 'coin-change-dp',
    problemId: 'coin-change',
    techniqueId: 'dynamic-programming',
    categoryId: 'dynamic-programming',
    order: 3,
    difficulty: 2,
    title: { es: 'Cambio de Monedas (Coin Change)', en: 'Coin Change (Fewest Coins)' },
    subtitle: {
      es: 'Minimizar cantidad de monedas para dar cambio exacto con reconstrucción O(V·|C|) y contraejemplo Greedy',
      en: 'Minimize number of coins to give exact change with O(V·|C|) reconstruction and greedy counterexample'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['dynamic-programming', '1d-table', 'reconstruction', 'memoization', 'counterexample', 'fiuba']
  },
  {
    id: 'lcs-dp',
    problemId: 'longest-common-subsequence',
    techniqueId: 'dynamic-programming',
    categoryId: 'dynamic-programming',
    order: 4,
    difficulty: 2,
    title: { es: 'Subsecuencia Común Más Larga (LCS)', en: 'Longest Common Subsequence (LCS)' },
    subtitle: {
      es: 'Alineación óptima de secuencias en una tabla 2D con reconstrucción diagonal O(m·n)',
      en: 'Optimal sequence alignment on a 2D table with diagonal reconstruction in O(m·n)'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['dynamic-programming', '2d-table', 'strings', 'reconstruction', 'diff', 'bioinformatics', 'fiuba', 'rw']
  },
  {
    id: 'weighted-interval-scheduling',
    problemId: 'weighted-interval-scheduling',
    techniqueId: 'dynamic-programming',
    categoryId: 'dynamic-programming',
    order: 5,
    difficulty: 3,
    title: {
      es: 'Intervalos Ponderados (Weighted Interval Scheduling)',
      en: 'Weighted Interval Scheduling'
    },
    subtitle: {
      es: 'Maximizar el valor total de tareas compatibles mediante ordenamiento, búsqueda binaria p(j) y PD O(n log n)',
      en: 'Maximize total value of compatible jobs using sorting, binary search p(j), and O(n log n) DP'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['dynamic-programming', 'intervals', 'binary-search', 'kleinberg-tardos', 'memoization', 'fiuba', 'rw']
  },
  {
    id: 'max-flow',
    problemId: 'max-flow',
    techniqueId: 'network-flow',
    categoryId: 'network-flow',
    order: 1,
    difficulty: 4,
    title: {
      es: 'Flujo Máximo y Corte Mínimo',
      en: 'Maximum Flow and Minimum Cut'
    },
    subtitle: {
      es: 'Calcular flujo máximo en redes de capacidad y corte mínimo mediante caminos de aumento BFS',
      en: 'Compute maximum flow in capacity networks and minimum cut via BFS augmenting paths'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['network-flow', 'graphs', 'residual-graph', 'bfs', 'min-cut', 'edmonds-karp']
  },
  {
    id: 'linear-programming-formulation',
    problemId: 'linear-programming',
    techniqueId: 'linear-programming',
    categoryId: 'linear-programming',
    order: 1,
    difficulty: 2,
    title: {
      es: 'Programación Lineal: Región Factible y Modelado',
      en: 'Linear Programming: Feasible Region & Modeling'
    },
    subtitle: {
      es: 'Geometría convexa, vértices extremos en 2D y formulación entera (ILP) de problemas clásicos',
      en: 'Convex geometry, 2D extreme vertices, and integer modeling (ILP) of classic problems'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['linear-programming', 'optimization', 'simplex', 'polytope', 'ilp', 'relaxation']
  },
  {
    id: 'vertex-cover-reduction',
    problemId: 'independent-set-vertex-cover',
    techniqueId: 'reductions',
    categoryId: 'reductions',
    order: 1,
    difficulty: 3,
    title: {
      es: 'Reducción: Conjunto Independiente a Cobertura de Vértices',
      en: 'Reduction: Independent Set to Vertex Cover'
    },
    subtitle: {
      es: 'Demostración constructiva de dualidad complementaria: S es IS ⟺ V \\ S es VC',
      en: 'Constructive proof of complementary duality: S is IS ⟺ V \\ S is VC'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['reductions', 'np-completeness', 'graphs', 'independent-set', 'vertex-cover', 'duality']
  },
  {
    id: 'vertex-cover-approx',
    problemId: 'minimum-vertex-cover',
    techniqueId: 'approximation',
    categoryId: 'approximation',
    order: 1,
    difficulty: 3,
    title: {
      es: '2-Aproximación de Cobertura de Vértices',
      en: '2-Approximation for Vertex Cover'
    },
    subtitle: {
      es: 'Algoritmo lineal voraz por matching maximal con garantía demostrable |C| <= 2 * |C*|',
      en: 'Linear greedy algorithm via maximal matching with provable bound |C| <= 2 * |C*|'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['approximation', 'graphs', 'vertex-cover', 'maximal-matching', 'np-hard', 'lower-bound']
  },
  {
    id: 'randomized-fair-coin',
    problemId: 'randomized-fair-coin',
    techniqueId: 'randomized',
    categoryId: 'randomized',
    order: 1,
    difficulty: 2,
    title: {
      es: 'Moneda Equilibrada con Moneda Cargada',
      en: 'Fair Coin from Biased Coin'
    },
    subtitle: {
      es: 'Algoritmo de Von Neumann: extracción de aleatoriedad pura 50/50 en tiempo esperado O(1)',
      en: 'Von Neumann algorithm: pure 50/50 randomness extraction in O(1) expected time'
    },
    supportedPhases: ['discover', 'solve', 'understand'],
    tags: ['randomized', 'probability', 'las-vegas', 'von-neumann', 'bernoulli', 'expected-time']
  }
];

export class ExerciseRegistry {
  private categories: Category[];
  private exercises: ExerciseMetadata[];

  constructor(categories = CATEGORIES, exercises = EXERCISES) {
    this.categories = [...categories].sort((a, b) => a.order - b.order);
    this.exercises = [...exercises].sort((a, b) => a.order - b.order);
  }

  getCategories(): Category[] {
    return this.categories;
  }

  getCategory(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id);
  }

  getExercises(categoryId?: string): ExerciseMetadata[] {
    if (!categoryId) {
      return this.exercises;
    }
    return this.exercises.filter((e) => e.categoryId === categoryId);
  }

  getExercise(id: string): ExerciseMetadata | undefined {
    return this.exercises.find((e) => e.id === id);
  }

  getExercisesByProblem(problemId: string): ExerciseMetadata[] {
    return this.exercises.filter((e) => e.problemId === problemId);
  }
}

export const registry = new ExerciseRegistry();
