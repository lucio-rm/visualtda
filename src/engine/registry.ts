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
