export interface ExerciseInsight {
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
      es: 'Estudiado formalmente por George Dantzig en 1957. Es uno de los 21 problemas NP-completos originales de Richard Karp (1972), fundamental en criptografía (Merkle-Hellman) y asignación presupuestaria.',
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
      es: 'Caso fundacional del libro Algorithm Design (Kleinberg & Tardos, Cap. 4.1). Modela planificación de tiempo de telescopios orbitales, procesadores en clusters y salas de conferencia.',
      en: 'Foundational problem of Algorithm Design (Kleinberg & Tardos, Ch. 4.1). Models satellite telescope scheduling and CPU job management.'
    },
    algorithmicPerspective: {
      es: 'La demostración de optimalidad se basa en el método de argumento de intercambio (exchange argument): la tarea con fin más temprano "se adelanta" a cualquier solución óptima competidora, dejando el máximo tiempo libre residual.',
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
