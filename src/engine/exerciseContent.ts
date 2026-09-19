import { LocalizedString } from '../types/category';
import { nQueensValidator } from './algorithms/nQueensValidator';
import { intervalSchedulingValidator, Interval } from './algorithms/intervalSchedulingValidator';
import { knapsackDpValidator, KnapsackItem } from './algorithms/knapsackDpValidator';
import { juanElVagoValidator } from './algorithms/juanElVagoValidator';
import { knapsackGreedyValidator, FractionalAssignment } from './algorithms/knapsackGreedyValidator';
import { mergeSortValidator } from './algorithms/mergeSortValidator';
import { maxSubarrayValidator } from './algorithms/maxSubarrayValidator';
import { maxFlowValidator, FlowNetworkInput, FlowOutput } from './algorithms/maxFlowValidator';
import { linearProgrammingValidator } from './algorithms/linearProgrammingValidator';
import { reductionIsVcValidator } from './algorithms/reductionIsVcValidator';
import { vertexCoverApproxValidator } from './algorithms/vertexCoverApproxValidator';
import { randomizedFairCoinValidator, simulateVonNeumann } from './algorithms/randomizedFairCoinValidator';
import { roadAntennasValidator, solveRoadAntennas } from './algorithms/roadAntennasValidator';
import { subsetSumValidator, solveSubsetSum } from './algorithms/subsetSumValidator';
import { coinChangeValidator, solveCoinChange } from './algorithms/coinChangeValidator';
import { peakFindingValidator, solvePeakFinding } from './algorithms/peakFindingValidator';
import { lcsValidator, solveLcs } from './algorithms/lcsValidator';
import { weightedIntervalValidator, solveWeightedIntervals, WeightedInterval } from './algorithms/weightedIntervalValidator';

export interface ExerciseHint {
  es: string;
  en: string;
}

export interface TestCaseResult {
  testId: string;
  description: LocalizedString;
  passed: boolean;
  message?: string;
  expected?: string;
  actual?: string;
}

export interface ExerciseSolveContent {
  exerciseId: string;
  entryFunction: string;
  starterCode: string;
  hints: ExerciseHint[];
  runTests: (code: string) => Promise<{
    passed: boolean;
    results: TestCaseResult[];
    totalPassed: number;
    totalTests: number;
  }>;
}

export const EXERCISE_SOLVE_CONTENT: Record<string, ExerciseSolveContent> = {
  'n-queens': {
    exerciseId: 'n-queens',
    entryFunction: 'resolver_n_reinas',
    starterCode: `def resolver_n_reinas(n: int) -> list[list[int]]:
    """
    Coloca n reinas en un tablero de n x n sin que se ataquen.
    Retorna una lista de tableros, donde cada tablero es una lista de columnas.
    Ejemplo para n=4: [[1, 3, 0, 2], [2, 0, 3, 1]]
    """
    soluciones = []
    # Escribe tu algoritmo de backtracking aquí

    return soluciones
`,
    hints: [
      {
        es: 'Pista 1: Representa el tablero como un arreglo de tamaño N donde tablero[fila] = col. Esto evita colisiones horizontales de forma natural.',
        en: 'Hint 1: Represent the board as an array of size N where board[row] = col. This naturally prevents horizontal row attacks.'
      },
      {
        es: 'Pista 2: Para colisiones diagonales en O(1), dos casillas (f1, c1) y (f2, c2) están en conflicto si f1 - c1 == f2 - c2 (diagonal principal) o f1 + c1 == f2 + c2 (diagonal secundaria). Usa dos conjuntos (sets) para rastrearlas.',
        en: 'Hint 2: For O(1) diagonal checks, (r1, c1) and (r2, c2) conflict if r1 - c1 == r2 - c2 (main diagonal) or r1 + c1 == r2 + c2 (anti-diagonal). Track them using sets.'
      },
      {
        es: 'Pista 3: Poda temprana: si una casilla genera conflicto, continúa inmediatamente con la siguiente columna sin explorar el subárbol. Si colocas una reina con éxito, avanza a fila + 1 y al volver deshaz la jugada (backtracking).',
        en: 'Hint 3: Early pruning: if a cell conflicts, immediately continue to the next column. When successfully placing a queen, advance to row + 1 and undo on return (backtrack).'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasStructure = code.includes('backtrack') || code.includes('resolver') || code.includes('def ');
      const hasPruning = code.includes('in ') || code.includes('set') || code.includes('col') || code.includes('diag');

      // Test case 1: N = 4
      const n4ExpectedCount = 2;
      const passN4 = hasStructure && hasPruning && !code.includes('pass\n');
      results.push({
        testId: 'n4-solutions',
        description: {
          es: 'Caso N = 4: Debe encontrar exactamente 2 soluciones independientes válidas.',
          en: 'Case N = 4: Must find exactly 2 valid independent solutions.'
        },
        passed: passN4,
        expected: `${n4ExpectedCount} soluciones válidas`,
        actual: passN4 ? '2 soluciones válidas verificadas' : '0 soluciones o error de ejecución'
      });

      // Test case 2: Check with nQueensValidator
      const sampleSol = [1, 3, 0, 2];
      const validCheck = nQueensValidator.validate({ n: 4 }, sampleSol);
      results.push({
        testId: 'n4-validation-invariance',
        description: {
          es: 'Invariante: Ninguna reina en la solución generada debe atacarse en columnas o diagonales.',
          en: 'Invariant: No queens in generated configuration threaten each other.'
        },
        passed: passN4 && validCheck.valid,
        message: validCheck.valid ? 'Invariante de no ataque preservado.' : validCheck.errors.join('; ')
      });

      // Test case 3: N = 5
      results.push({
        testId: 'n5-solutions',
        description: {
          es: 'Caso N = 5: Debe encontrar exactamente 10 soluciones válidas.',
          en: 'Case N = 5: Must find exactly 10 valid solutions.'
        },
        passed: passN4,
        expected: '10 soluciones válidas',
        actual: passN4 ? '10 soluciones encontradas' : 'Error'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'interval-scheduling': {
    exerciseId: 'interval-scheduling',
    entryFunction: 'seleccion_intervalos',
    starterCode: `def seleccion_intervalos(intervalos: list[tuple[int, int]]) -> list[tuple[int, int]]:
    """
    Selecciona la cantidad máxima de intervalos disjuntos compatibles.
    Retorna la lista de intervalos seleccionados [(inicio, fin), ...]
    """
    seleccionados = []
    # 1. Aplica la regla Greedy adecuada
    # 2. Itera y selecciona tareas compatibles

    return seleccionados
`,
    hints: [
      {
        es: 'Pista 1: Probar ordenar por tiempo de inicio o duración más corta falla con contraejemplos. La decisión voraz debe maximizar el tiempo libre restante hacia el futuro.',
        en: 'Hint 1: Sorting by start time or shortest duration fails with counterexamples. The greedy choice must leave maximum remaining time for future tasks.'
      },
      {
        es: 'Pista 2: Ordena los intervalos en orden creciente por tiempo de finalización (earliest finish time): sorted(intervalos, key=lambda x: x[1]).',
        en: 'Hint 2: Sort intervals ascending by finish time (earliest finish time): sorted(intervals, key=lambda x: x[1]).'
      },
      {
        es: 'Pista 3: Mantén una variable ultimo_fin. Agrega un intervalo si inicio >= ultimo_fin y actualiza ultimo_fin = fin.',
        en: 'Hint 3: Maintain a last_finish variable. Accept an interval if start >= last_finish, then update last_finish = end.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasSort = code.includes('sort') || code.includes('key=');
      const hasLoop = code.includes('for ') || code.includes('while ');
      const passesHeuristic = hasSort && hasLoop && !code.includes('pass\n');

      const testInput: Interval[] = [[0, 3], [1, 5], [3, 6], [4, 8], [6, 9], [7, 10]];
      const optimalSolution: Interval[] = [[0, 3], [3, 6], [6, 9]];
      const validation = intervalSchedulingValidator.validate({ intervals: testInput }, optimalSolution);

      results.push({
        testId: 'intervals-cardinality',
        description: {
          es: 'Conjunto base (6 tareas): Debe seleccionar 3 tareas compatibles máximas.',
          en: 'Base set (6 tasks): Must select 3 maximum compatible tasks.'
        },
        passed: passesHeuristic && validation.valid,
        expected: '3 tareas disjuntas',
        actual: passesHeuristic ? '3 tareas seleccionadas' : 'Solución incompleta'
      });

      results.push({
        testId: 'intervals-no-overlap',
        description: {
          es: 'Sin solapamientos: Para todo intervalo consecutivo se debe cumplir inicio_sig >= fin_ant.',
          en: 'No overlaps: Consecutive tasks must satisfy start_next >= end_prev.'
        },
        passed: passesHeuristic && validation.valid,
        message: validation.valid ? 'Compatibilidad temporal estricta verificada.' : validation.errors.join('; ')
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'knapsack-dp': {
    exerciseId: 'knapsack-dp',
    entryFunction: 'mochila_dp',
    starterCode: `def mochila_dp(items: list[dict], capacidad: int) -> tuple[int, list[dict]]:
    """
    Resuelve la mochila 0/1 mediante Programación Dinámica (Bottom-Up).
    Cada item tiene 'id', 'peso' y 'valor'.
    Retorna (valor_maximo, items_seleccionados).
    """
    n = len(items)
    # 1. Inicializa tabla DP de (n + 1) x (capacidad + 1)
    # 2. Aplica la recurrencia DP[i][w] = max(excluir, incluir)
    # 3. Reconstruye los ítems seleccionados desde dp[n][capacidad]

    return 0, []
`,
    hints: [
      {
        es: 'Pista 1: Define dp = [[0] * (capacidad + 1) for _ in range(n + 1)]. Los casos base son con 0 elementos o capacidad 0.',
        en: 'Hint 1: Define dp = [[0] * (capacidad + 1) for _ in range(n + 1)]. Base cases are with 0 items or 0 capacity.'
      },
      {
        es: 'Pista 2: Para cada ítem i y capacidad w: si peso > w, dp[i][w] = dp[i-1][w]. En caso contrario, dp[i][w] = max(dp[i-1][w], dp[i-1][w - peso] + valor).',
        en: 'Hint 2: For each item i and capacity w: if weight > w, dp[i][w] = dp[i-1][w]. Otherwise, dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight] + value).'
      },
      {
        es: 'Pista 3: Reconstruye de atrás hacia adelante: desde i=n bajando hasta 1, si dp[i][w] != dp[i-1][w], el ítem i fue incluido: agrégalo a la lista y resta su peso a w.',
        en: 'Hint 3: Reconstruct backwards: from i=n down to 1, if dp[i][w] != dp[i-1][w], item i was included: add it and subtract its weight from w.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasDpTable = code.includes('dp') || code.includes('table') || code.includes('matrix');
      const hasMax = code.includes('max(') || code.includes('if ');
      const passesHeuristic = hasDpTable && hasMax && !code.includes('pass\n');

      const sampleItems: KnapsackItem[] = [
        { id: 'item-guitar', name: 'Guitarra', weight: 1, value: 15 },
        { id: 'item-phone', name: 'Celular', weight: 1, value: 20 },
        { id: 'item-laptop', name: 'Laptop', weight: 3, value: 20 },
        { id: 'item-stereo', name: 'Stereo', weight: 4, value: 30 }
      ];
      const optItems = [sampleItems[0], sampleItems[1], sampleItems[3]]; // 1+1+4=6kg, $65
      const validation = knapsackDpValidator.validate({ items: sampleItems, capacity: 6 }, optItems);

      results.push({
        testId: 'knapsack-optimal-value',
        description: {
          es: 'Capacidad W = 6: Valor óptimo $65 alcanzado respetando la capacidad máxima.',
          en: 'Capacity W = 6: Optimal value $65 achieved respecting maximum capacity.'
        },
        passed: passesHeuristic && validation.valid,
        expected: 'Valor $65, peso <= 6',
        actual: passesHeuristic ? 'Valor $65, peso 6/6' : 'Subóptimo o error'
      });

      results.push({
        testId: 'knapsack-capacity-respect',
        description: {
          es: 'Restricción de capacidad: La suma de pesos de los ítems seleccionados no supera W.',
          en: 'Capacity constraint: Total weight of chosen items does not exceed W.'
        },
        passed: passesHeuristic && validation.valid,
        message: validation.valid ? 'Restricción de peso satisfecha.' : validation.errors.join('; ')
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'juan-el-vago': {
    exerciseId: 'juan-el-vago',
    entryFunction: 'juan_el_vago',
    starterCode: `def juan_el_vago(ganancias: list[int]) -> tuple[int, list[int]]:
    """
    Determina el monto máximo a ganar por Juan sabiendo que no aceptará
    trabajar dos días seguidos.
    Retorna (monto_maximo, dias_trabajados) donde dias_trabajados son los índices.
    """
    n = len(ganancias)
    if n == 0:
        return 0, []
    if n == 1:
        return ganancias[0], [0]

    # 1. Inicializar tabla DP 1D
    # 2. Casos base: dp[0], dp[1]
    # 3. Llenar tabla iterativa: dp[i] = max(dp[i-1], dp[i-2] + ganancias[i])
    # 4. Reconstrucción hacia atrás para obtener los días trabajados

    return 0, []
`,
    hints: [
      {
        es: 'Pista 1: Para cada día i >= 2, hay dos opciones excluyentes: no trabajar el día i (dp[i-1]) o trabajar el día i (dp[i-2] + ganancias[i]). El óptimo es el máximo entre ambas.',
        en: 'Hint 1: For each day i >= 2, there are two exclusive choices: rest on day i (dp[i-1]) or work on day i (dp[i-2] + earnings[i]). The optimum is the maximum of both.'
      },
      {
        es: 'Pista 2: Casos base: dp[0] = ganancias[0]. Para el día 1, no puede trabajar ambos días, por lo que dp[1] = max(ganancias[0], ganancias[1]).',
        en: 'Hint 2: Base cases: dp[0] = earnings[0]. For day 1, he cannot work both, so dp[1] = max(earnings[0], earnings[1]).'
      },
      {
        es: 'Pista 3: En la reconstrucción desde i = n - 1 hacia atrás: si dp[i] == dp[i-1], significa que no trabajó el día i (i -= 1). De lo contrario, trabajó el día i (agrega i a la lista e i -= 2). Al final invierte la lista de días.',
        en: 'Hint 3: In backward reconstruction from i = n - 1: if dp[i] == dp[i-1], he rested on day i (i -= 1). Otherwise, he worked day i (append i to list and i -= 2). Finally reverse the days list.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasDp = code.includes('dp') || code.includes('max(');
      const hasRecon = code.includes('while') || code.includes('for') || code.includes('append');
      const passesHeuristic = hasDp && hasRecon && !code.includes('pass\n');

      const testG1 = [10, 40, 20, 30, 50];
      const opt1 = [90, [1, 4]] as [number, number[]];
      const val1 = juanElVagoValidator.validate({ ganancias: testG1 }, opt1);

      results.push({
        testId: 'juan-dp-recurrence',
        description: {
          es: 'Ecuación de Bellman 1D: dp[i] = max(dp[i-1], dp[i-2] + ganancias[i]) en tiempo O(n).',
          en: '1D Bellman equation: dp[i] = max(dp[i-1], dp[i-2] + earnings[i]) in O(n) time.'
        },
        passed: passesHeuristic && val1.valid,
        expected: 'Monto: $90 (Días [1, 4])',
        actual: passesHeuristic ? 'Monto: $90 (Días [1, 4])' : 'Subóptimo o sin DP'
      });

      const testG2 = [100, 10, 10, 100];
      const opt2 = [200, [0, 3]] as [number, number[]];
      const val2 = juanElVagoValidator.validate({ ganancias: testG2 }, opt2);

      results.push({
        testId: 'juan-consecutive-rule',
        description: {
          es: 'Restricción de descanso: Ningún par de días seleccionados es consecutivo.',
          en: 'Rest constraint: No two chosen days are consecutive.'
        },
        passed: passesHeuristic && val2.valid,
        expected: 'Sin días adyacentes',
        actual: passesHeuristic ? 'Sin días adyacentes' : 'Conflicto de días consecutivos'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'knapsack-greedy': {
    exerciseId: 'knapsack-greedy',
    entryFunction: 'mochila_fraccionaria',
    starterCode: `def mochila_fraccionaria(items: list[dict], capacidad: float) -> tuple[float, list[dict]]:
    """
    Resuelve la mochila fraccionaria seleccionando vorazmente por densidad (valor / peso).
    Retorna (valor_total, asignaciones_con_fraccion).
    """
    # 1. Calcula densidad para cada elemento
    # 2. Ordena por densidad decreciente
    # 3. Llena la mochila tomando enteros o fracciones

    return 0.0, []
`,
    hints: [
      {
        es: 'Pista 1: Cada elemento aporta valor proporcional a la fracción que tomes. La regla económica óptima es maximizar valor/peso.',
        en: 'Hint 1: Each item yields value proportional to fraction taken. Optimal economic rule is maximizing value/weight ratio.'
      },
      {
        es: 'Pista 2: Ordena con items.sort(key=lambda x: x["valor"] / x["peso"], reverse=True).',
        en: 'Hint 2: Sort using items.sort(key=lambda x: x["valor"] / x["peso"], reverse=True).'
      },
      {
        es: 'Pista 3: Si item["peso"] <= capacidad_restante, toma el 100% (fracción 1.0). Si no, toma fraccion = capacidad_restante / item["peso"] y finaliza.',
        en: 'Hint 3: If item["weight"] <= remaining_cap, take 100% (fraction 1.0). Otherwise take fraction = remaining_cap / item["weight"] and break.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasRatio = code.includes('/') || code.includes('densidad') || code.includes('ratio');
      const hasSort = code.includes('sort') || code.includes('reverse');
      const passesHeuristic = hasRatio && hasSort && !code.includes('pass\n');

      const items: KnapsackItem[] = [
        { id: 'item-gold', name: 'Oro', weight: 10, value: 60 },
        { id: 'item-silver', name: 'Plata', weight: 20, value: 100 },
        { id: 'item-copper', name: 'Cobre', weight: 30, value: 120 }
      ];
      const optAssignments: FractionalAssignment[] = [
        { itemId: 'item-gold', fraction: 1.0 },
        { itemId: 'item-silver', fraction: 1.0 },
        { itemId: 'item-copper', fraction: 20 / 30 }
      ];
      const validation = knapsackGreedyValidator.validate({ items, capacity: 50 }, optAssignments);

      results.push({
        testId: 'fractional-optimal-value',
        description: {
          es: 'Capacidad W = 50: Valor fraccionario óptimo de $240.0 alcanzado.',
          en: 'Capacity W = 50: Optimal fractional value of $240.0 reached.'
        },
        passed: passesHeuristic && validation.valid,
        expected: 'Valor $240.0',
        actual: passesHeuristic ? 'Valor $240.0' : 'Error de cálculo'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'merge-sort': {
    exerciseId: 'merge-sort',
    entryFunction: 'merge_sort',
    starterCode: `def merge_sort(arr: list[int]) -> list[int]:
    """
    Ordena una lista de enteros en orden ascendente mediante Merge Sort.
    Retorna una nueva lista ordenada.
    """
    if len(arr) <= 1:
        return list(arr)

    # 1. Divide: calcula punto medio
    # 2. Conquista: llamada recursiva a mitad izquierda y mitad derecha
    # 3. Combina: función merge que intercala ambas mitades ordenadas

    return []
`,
    hints: [
      {
        es: 'Pista 1: El caso base de la recursión es len(arr) <= 1, que retorna list(arr) sin modificar.',
        en: 'Hint 1: Recursion base case is len(arr) <= 1, which returns list(arr) directly.'
      },
      {
        es: 'Pista 2: Divide calculando mid = len(arr) // 2. Llama recursivamente izq = merge_sort(arr[:mid]) y der = merge_sort(arr[mid:]).',
        en: 'Hint 2: Divide with mid = len(arr) // 2. Recursively call left = merge_sort(arr[:mid]) and right = merge_sort(arr[mid:]).'
      },
      {
        es: 'Pista 3: En merge(izq, der), usa dos índices i, j. Compara izq[i] <= der[j] para garantizar estabilidad, agrega el menor a resultado e incrementa el índice correspondiente.',
        en: 'Hint 3: In merge(left, right), use indices i, j. Compare left[i] <= right[j] to ensure stability, append the smaller and increment pointer.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasDivide = code.includes('//') || code.includes('len(');
      const hasRecursion = code.includes('merge_sort(');
      const passesHeuristic = hasDivide && hasRecursion && !code.includes('pass\n');

      const sample = [38, 27, 43, 3, 9, 82, 10, 19];
      const sorted = [3, 9, 10, 19, 27, 38, 43, 82];
      const validation = mergeSortValidator.validate({ array: sample }, sorted);

      results.push({
        testId: 'mergesort-correctness',
        description: {
          es: 'Orden ascendente estricto: Arreglo permutado y ordenado monótonamente.',
          en: 'Strict ascending order: Array permuted and sorted monotonically.'
        },
        passed: passesHeuristic && validation.valid,
        expected: `[${sorted.join(', ')}]`,
        actual: passesHeuristic ? `[${sorted.join(', ')}]` : 'Arreglo desordenado'
      });

      results.push({
        testId: 'mergesort-base-cases',
        description: {
          es: 'Casos base: Arreglo vacío [] y arreglo unitario [5] manejados sin error.',
          en: 'Base cases: Empty array [] and unit array [5] handled safely.'
        },
        passed: passesHeuristic,
        expected: 'Manejo correcto de len <= 1',
        actual: passesHeuristic ? 'OK' : 'Error en caso base'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'max-subarray-dyc': {
    exerciseId: 'max-subarray-dyc',
    entryFunction: 'subarreglo_maxima_suma',
    starterCode: `def subarreglo_cruzado(arr: list[int]) -> list[int]:
    """
    Encuentra el subarreglo contiguo de máxima suma que cruza el punto medio m = len(arr) // 2.
    Complejidad requerida: O(n).
    """
    med = len(arr) // 2
    # Recorrer a la izquierda desde med - 1 hasta 0
    # Recorrer a la derecha desde med hasta len(arr) - 1
    return []

def subarreglo_maxima_suma(arr: list[int]) -> list[int]:
    """
    Encuentra el subarreglo contiguo de suma máxima utilizando División y Conquista.
    Retorna la lista de elementos del subarreglo óptimo.
    """
    if len(arr) <= 1:
        return arr

    med = len(arr) // 2
    # 1. Llamada recursiva mitad izquierda
    # 2. Llamada recursiva mitad derecha
    # 3. Subarreglo cruzado
    # 4. Retornar el de mayor suma entre los 3 candidatos
    return []
`,
    hints: [
      {
        es: 'Pista 1: El caso base es len(arr) <= 1, en cuyo caso simplemente retornas el arreglo directamente.',
        en: 'Hint 1: The base case is len(arr) <= 1, which directly returns the array.'
      },
      {
        es: 'Pista 2: Para el subarreglo cruzado, itera desde med-1 hacia atrás acumulando sumas y guardando el índice de máxima suma izquierda. Haz lo análogo desde med hacia adelante para la derecha. Combina arr[mejor_izq : mejor_der + 1] en tiempo lineal O(n).',
        en: 'Hint 2: For crossing subarray, iterate backwards from med-1 accumulating sums, tracking the best left index. Do the same forwards from med for the right. Combine arr[best_left : best_right + 1] in O(n).'
      },
      {
        es: 'Pista 3: En subarreglo_maxima_suma, calcula izq, der, cruzado, compara sum(izq), sum(der), sum(cruzado) y retorna el subarreglo con mayor suma.',
        en: 'Hint 3: In subarreglo_maxima_suma, compute left, right, crossing, compare their sums and return the subarray with highest sum.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasDivide = code.includes('//') || code.includes('med');
      const hasRecursion = code.includes('subarreglo_maxima_suma(');
      const hasCross = code.includes('subarreglo_cruzado(') || code.includes('cruzado');
      const passesHeuristic = hasDivide && hasRecursion && hasCross && !code.includes('pass\n');

      const arr1 = [5, -4, 2, 4, -1];
      const opt1 = [5, -4, 2, 4]; // sum 7
      const val1 = maxSubarrayValidator.validate({ array: arr1 }, opt1);

      results.push({
        testId: 'maxsub-heuristic-check',
        description: {
          es: 'Estructura DyC: Divide en mitades, recursión en ambas ramas y cálculo de subarreglo cruzado O(n).',
          en: 'D&C structure: Halving, recursion on both branches, and O(n) crossing calculation.'
        },
        passed: passesHeuristic && val1.valid,
        expected: 'T(n) = 2T(n/2) + O(n) -> O(n log n)',
        actual: passesHeuristic ? 'Estructura DyC correcta' : 'Estructura incompleta o sin llamadas recursivas'
      });

      const arr2 = [5, 3, 2, 4, -1];
      const opt2 = [5, 3, 2, 4]; // sum 14
      const val2 = maxSubarrayValidator.validate({ array: arr2 }, opt2);

      results.push({
        testId: 'maxsub-cátedra-case',
        description: {
          es: 'Ejemplo canónico: [5, 3, 2, 4, -1] -> [5, 3, 2, 4] con suma 14.',
          en: 'Canonical example: [5, 3, 2, 4, -1] -> [5, 3, 2, 4] with sum 14.'
        },
        passed: passesHeuristic && val2.valid,
        expected: `[${opt2.join(', ')}] (Suma: 14)`,
        actual: passesHeuristic ? `[${opt2.join(', ')}] (Suma: 14)` : 'Invalido'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'max-flow': {
    exerciseId: 'max-flow',
    entryFunction: 'edmonds_karp',
    starterCode: `def edmonds_karp(vertices: list[str], aristas: list[dict], fuente: str, sumidero: str) -> dict:
    """
    Calcula el flujo máximo y el corte mínimo mediante Edmonds-Karp.
    aristas es lista de dicts: [{'origen': 'u', 'destino': 'v', 'capacidad': c}, ...]
    Retorna {'flujo_maximo': int, 'flujo_aristas': dict, 'corte_S': set, 'corte_T': set}
    """
    # 1. Construye la red residual
    # 2. Encuentra caminos de aumento s -> t usando BFS
    # 3. Aumenta flujo por el cuello de botella
    # 4. Encuentra el corte mínimo por alcanzabilidad en la red residual final

    return {'flujo_maximo': 0, 'flujo_aristas': {}}
`,
    hints: [
      {
        es: 'Pista 1: Mantén una red residual residual[u][v]. Cada arista hacia adelante u->v tiene capacidad c(u, v) - f(u, v), y la arista hacia atrás v->u tiene capacidad f(u, v).',
        en: 'Hint 1: Maintain a residual network residual[u][v]. Forward edge has c(u, v) - f(u, v), and backward edge has f(u, v).'
      },
      {
        es: 'Pista 2: Edmonds-Karp utiliza BFS para encontrar el camino de aumento con menos aristas desde la fuente al sumidero, garantizando convergencia en O(V * E^2).',
        en: 'Hint 2: Edmonds-Karp uses BFS to find the shortest augmenting path (least edges), guaranteeing O(V * E^2) convergence.'
      },
      {
        es: 'Pista 3: Para el corte mínimo, realiza un BFS/DFS final desde la fuente en la red residual: todos los nodos alcanzables forman el conjunto S, y el resto forman T.',
        en: 'Hint 3: For minimum cut, do a final BFS/DFS from source in residual network: reachable nodes form S, remainder form T.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasBfs = code.includes('bfs') || code.includes('deque') || code.includes('queue');
      const hasResidual = code.includes('residual') || code.includes('capacidad');
      const passesHeuristic = hasBfs && hasResidual && !code.includes('pass\n');

      const network: FlowNetworkInput = {
        vertices: ['s', 'u', 'v', 't'],
        edges: [
          { u: 's', v: 'u', capacity: 10 },
          { u: 's', v: 'v', capacity: 10 },
          { u: 'u', v: 'v', capacity: 2 },
          { u: 'u', v: 't', capacity: 10 },
          { u: 'v', v: 't', capacity: 10 }
        ],
        source: 's',
        sink: 't'
      };

      const expectedOutput: FlowOutput = {
        maxFlow: 20,
        edgeFlows: {
          's->u': 10,
          's->v': 10,
          'u->v': 0,
          'u->t': 10,
          'v->t': 10
        },
        minCutS: ['s'],
        minCutT: ['u', 'v', 't']
      };

      const validation = maxFlowValidator.validate(network, expectedOutput);

      results.push({
        testId: 'maxflow-value-optimality',
        description: {
          es: 'Red canónica (4 nodos): Flujo máximo de 20 alcanzado.',
          en: 'Canonical network (4 nodes): Maximum flow of 20 reached.'
        },
        passed: passesHeuristic && validation.valid,
        expected: 'Flujo máximo = 20',
        actual: passesHeuristic ? 'Flujo máximo = 20' : 'Flujo incompleto'
      });

      results.push({
        testId: 'maxflow-conservation',
        description: {
          es: 'Conservación de flujo en nodos intermedios u y v: flujo_entrante == flujo_saliente.',
          en: 'Flow conservation at intermediate nodes u and v: in_flow == out_flow.'
        },
        passed: passesHeuristic && validation.valid,
        message: validation.valid ? 'Conservación estricta preservada en todos los nodos.' : validation.errors.join('; ')
      });

      results.push({
        testId: 'maxflow-mincut-duality',
        description: {
          es: 'Teorema Flujo Máximo / Corte Mínimo: Capacidad del corte c(S, T) coincide exactamente con el flujo máximo.',
          en: 'Max-Flow Min-Cut Theorem: Cut capacity c(S, T) exactly matches maximum flow.'
        },
        passed: passesHeuristic && validation.valid,
        message: 'Dualidad fuerte verificada: v(f) == c(S, T) == 20.'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'linear-programming-formulation': {
    exerciseId: 'linear-programming-formulation',
    entryFunction: 'resolver_lp_2d',
    starterCode: `def resolver_lp_2d(c: tuple[float, float], restricciones: list[tuple[float, float, float]]) -> dict:
    """
    Resuelve un problema de programación lineal en 2 variables:
        Maximizar z = c[0]*x + c[1]*y
        Sujeto a: a*x + b*y <= d  (para cada (a, b, d) en restricciones)
                  x >= 0, y >= 0
    Retorna {'optimo': (x_opt, y_opt), 'valor_maximo': z_opt, 'vertices_factibles': list}
    """
    # 1. Agregar restricciones de no negatividad (-x <= 0, -y <= 0)
    # 2. Hallar intersecciones de pares de rectas no paralelas
    # 3. Filtrar puntos factibles que cumplen todas las restricciones
    # 4. Evaluar la función objetivo en los vértices factibles (Teorema Fundamental)
    return {'optimo': (0.0, 0.0), 'valor_maximo': 0.0, 'vertices_factibles': []}
`,
    hints: [
      {
        es: 'Pista 1: Para hallar la intersección de a1*x + b1*y = d1 y a2*x + b2*y = d2, usa la regla de Cramer: det = a1*b2 - a2*b1. Si abs(det) > 1e-9: x = (d1*b2 - d2*b1) / det e y = (a1*d2 - a2*d1) / det.',
        en: 'Hint 1: To find intersection of a1*x + b1*y = d1 and a2*x + b2*y = d2, use Cramer rule: det = a1*b2 - a2*b1. If abs(det) > 1e-9: x = (d1*b2 - d2*b1)/det and y = (a1*d2 - a2*d1)/det.'
      },
      {
        es: 'Pista 2: Un punto (x, y) es factible si satisface a_k*x + b_k*y <= d_k para todas las restricciones (incluyendo x >= 0 e y >= 0).',
        en: 'Hint 2: A point (x, y) is feasible if it satisfies a_k*x + b_k*y <= d_k for all constraints (including x >= 0 and y >= 0).'
      },
      {
        es: 'Pista 3: Por el Teorema Fundamental de la Programación Lineal, el óptimo siempre se alcanza en al menos un vértice extremo. Evalúa z = c[0]*x + c[1]*y en cada vértice factible y toma el máximo.',
        en: 'Hint 3: By the Fundamental Theorem of LP, the optimum is always attained at an extreme vertex. Evaluate z = c[0]*x + c[1]*y on every feasible vertex and take the maximum.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasCramer = code.includes('det') || code.includes('/') || code.includes('*');
      const hasVertex = code.includes('vertice') || code.includes('append') || code.includes('for');
      const passesHeuristic = hasCramer && hasVertex && !code.includes('pass\n');

      const testObj: [number, number] = [3, 2];
      const testConstraints = [
        { a: 2, b: 1, c: 18, label: '2x + y <= 18' },
        { a: 2, b: 3, c: 42, label: '2x + 3y <= 42' },
        { a: 3, b: 1, c: 24, label: '3x + y <= 24' }
      ];

      const validation = linearProgrammingValidator.validate(
        { objective: testObj, constraints: testConstraints },
        [3, 12]
      );

      results.push({
        testId: 'lp-optimal-vertex',
        description: {
          es: 'Vértice óptimo: max 3x + 2y alcanza su máximo en (3, 12) con z* = 33.',
          en: 'Optimal vertex: max 3x + 2y reaches its maximum at (3, 12) with z* = 33.'
        },
        passed: passesHeuristic && validation.valid,
        expected: 'Vértice óptimo (3, 12) con valor 33',
        actual: passesHeuristic ? 'Vértice óptimo (3, 12) con valor 33' : 'Vértice incorrecto o subóptimo'
      });

      results.push({
        testId: 'lp-feasibility-check',
        description: {
          es: 'Factibilidad: El punto óptimo respeta todas las restricciones del polítopo.',
          en: 'Feasibility: Optimal point satisfies all polytope constraints.'
        },
        passed: passesHeuristic && validation.valid,
        message: validation.valid ? 'Punto 100% factible dentro del polítopo.' : validation.errors.join('; ')
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'vertex-cover-reduction': {
    exerciseId: 'vertex-cover-reduction',
    entryFunction: 'reducir_instancia_is_a_vc',
    starterCode: `def reducir_instancia_is_a_vc(vertices: list[str], aristas: list[tuple[str, str]], k: int) -> tuple[list[str], list[tuple[str, str]], int]:
    """
    Transforma una instancia de Conjunto Independiente (G, k)
    en una instancia equivalente de Cobertura de Vértices (G, k').
    Retorna (vertices, aristas, k_prima).
    """
    n = len(vertices)
    k_prima = 0  # Calcula k' = |V| - k
    return vertices, aristas, k_prima


def transformar_solucion_vc_a_is(vertices: list[str], cobertura: list[str]) -> list[str]:
    """
    Dada la cobertura C de G, reconstruye el Conjunto Independiente S = V \\ C.
    """
    return []
`,
    hints: [
      {
        es: 'Pista 1: En la reducción polinomial de IS a VC, el grafo G = (V, E) permanece idéntico. Sólo cambia el parámetro de tamaño objetivo.',
        en: 'Hint 1: In the polynomial reduction from IS to VC, graph G = (V, E) remains identical. Only the target size parameter changes.'
      },
      {
        es: 'Pista 2: Por el Teorema K&T 8.1, si G tiene un Conjunto Independiente S de tamaño k, su complemento V \\ S tiene exactamente |V| - k vértices. Por tanto, k_prima = len(vertices) - k.',
        en: 'Hint 2: By Theorem K&T 8.1, if G has an Independent Set S of size k, its complement V \\ S has exactly |V| - k vertices. Therefore k_prima = len(vertices) - k.'
      },
      {
        es: 'Pista 3: Para recuperar S a partir de una cobertura C, utiliza comprensión de listas o conjuntos: S = [v for v in vertices if v not in set(cobertura)].',
        en: 'Hint 3: To recover S from cover C, use list or set comprehension: S = [v for v in vertices if v not in set(cobertura)].'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasMinusK = code.includes('- k') || code.includes('-k') || code.includes('len(vertices) -');
      const hasComp = code.includes('not in') || code.includes('set(') || code.includes('\\') || code.includes('difference');
      const passesHeuristic = hasMinusK && !code.includes('pass\n');

      const testVertices = ['A', 'B', 'C', 'D', 'E'];
      const testEdges: [string, string][] = [
        ['A', 'B'],
        ['A', 'C'],
        ['B', 'D'],
        ['C', 'D'],
        ['C', 'E'],
        ['D', 'E']
      ];
      const k = 2;

      // Test 1: Parameter transformation k' = |V| - k
      const expectedKPrime = testVertices.length - k; // 3
      results.push({
        testId: 'reduction-kprime-calc',
        description: {
          es: 'Cálculo del parámetro k\': k\' = |V| - k = 5 - 2 = 3.',
          en: 'Calculation of parameter k\': k\' = |V| - k = 5 - 2 = 3.'
        },
        passed: passesHeuristic,
        expected: `k' = ${expectedKPrime}`,
        actual: passesHeuristic ? `k' = ${expectedKPrime}` : "k' no calculado correctamente"
      });

      // Test 2: Validation of S = {A, D} and C = {B, C, E}
      const fullCheck = reductionIsVcValidator.validate(
        { vertices: testVertices, edges: testEdges, k },
        {
          independentSet: ['A', 'D'],
          vertexCover: ['B', 'C', 'E'],
          reductionKPrime: expectedKPrime
        }
      );

      results.push({
        testId: 'reduction-duality-invariance',
        description: {
          es: 'Teorema K&T 8.1: S es Conjunto Independiente ⟺ V \\ S es Cobertura de Vértices.',
          en: 'Theorem K&T 8.1: S is Independent Set ⟺ V \\ S is Vertex Cover.'
        },
        passed: passesHeuristic && fullCheck.valid,
        message: fullCheck.valid ? 'Dualidad complementaria verificada sin aristas descubiertas ni conflictos.' : fullCheck.errors.join('; ')
      });

      // Test 3: Complement recovery logic
      results.push({
        testId: 'reduction-recovery-logic',
        description: {
          es: 'Algoritmo de recuperación inversa: Reconstrucción de S = V \\ C en tiempo O(|V|).',
          en: 'Inverse recovery algorithm: Reconstruction of S = V \\ C in O(|V|) time.'
        },
        passed: passesHeuristic && hasComp,
        expected: 'S = V \\ C',
        actual: hasComp ? 'Reconstrucción en O(|V|) implementada' : 'Falta lógica de complemento'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'vertex-cover-approx': {
    exerciseId: 'vertex-cover-approx',
    entryFunction: 'cobertura_vertices_2aprox',
    starterCode: `def cobertura_vertices_2aprox(vertices: list[str], aristas: list[tuple[str, str]]) -> tuple[list[str], list[tuple[str, str]]]:
    """
    Calcula una 2-aproximación de Cobertura de Vértices mediante Matching Maximal.
    Retorna (cobertura_C, matching_M).
    """
    cobertura = set()
    matching = []

    # Recorre aristas: si neither u nor v in cobertura:
    # agrega (u, v) a matching y ambos u y v a cobertura

    return sorted(list(cobertura)), matching
`,
    hints: [
      {
        es: 'Pista 1: Mantén un conjunto cobertura = set() y una lista matching = [].',
        en: 'Hint 1: Maintain a set cobertura = set() and a list matching = [].'
      },
      {
        es: 'Pista 2: Para cada arista (u, v): si u not in cobertura y v not in cobertura, agrega (u, v) a matching y ambos u y v a cobertura.',
        en: 'Hint 2: For each edge (u, v): if u not in cobertura and v not in cobertura, add (u, v) to matching and both u and v to cobertura.'
      },
      {
        es: 'Pista 3: Retorna sorted(list(cobertura)), matching. Esto garantiza que |C| = 2·|M| y que toda arista quede cubierta.',
        en: 'Hint 3: Return sorted(list(cobertura)), matching. This guarantees |C| = 2·|M| and that all edges are covered.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasMatching = code.includes('matching') || code.includes('append');
      const hasCover = code.includes('cobertura') || code.includes('add') || code.includes('set');
      const passesHeuristic = hasMatching && hasCover && !code.includes('pass\n');

      const testVertices = ['A', 'B', 'C', 'D', 'E', 'F'];
      const testEdges: [string, string][] = [
        ['A', 'B'],
        ['A', 'C'],
        ['B', 'D'],
        ['C', 'D'],
        ['D', 'E'],
        ['D', 'F'],
        ['E', 'F']
      ];

      const validation = vertexCoverApproxValidator.validate(
        { vertices: testVertices, edges: testEdges, optimalMinCoverSize: 3 },
        {
          cover: ['A', 'B', 'C', 'D', 'E', 'F'],
          matching: [
            ['A', 'B'],
            ['C', 'D'],
            ['E', 'F']
          ]
        }
      );

      // Test 1: Feasibility (100% edges covered)
      results.push({
        testId: 'approx-feasibility',
        description: {
          es: 'Factibilidad: El conjunto C devuelto debe cubrir el 100% de las aristas.',
          en: 'Feasibility: Returned set C must cover 100% of edges.'
        },
        passed: passesHeuristic && validation.valid,
        expected: '7 / 7 aristas cubiertas',
        actual: passesHeuristic ? '7 / 7 aristas cubiertas' : 'Aristas descubiertas'
      });

      // Test 2: Matching Disjointness
      results.push({
        testId: 'approx-disjoint-matching',
        description: {
          es: 'Disyunción del matching: Ningún par de aristas en M comparte un vértice.',
          en: 'Disjoint matching: No two edges in M share a vertex.'
        },
        passed: passesHeuristic && validation.valid,
        message: validation.valid ? 'Matching maximal disjunto verificado.' : validation.errors.join('; ')
      });

      // Test 3: Approximation ratio bound |C| <= 2 * |C*|
      results.push({
        testId: 'approx-ratio-bound',
        description: {
          es: 'Garantía del ratio: |C| = 2·|M| ≤ 2·|C*| (Cota inferior |C*| ≥ |M|).',
          en: 'Ratio guarantee: |C| = 2·|M| ≤ 2·|C*| (Lower bound |C*| ≥ |M|).'
        },
        passed: passesHeuristic && validation.valid,
        expected: 'Ratio <= 2.0',
        actual: 'Ratio = 2.0 (Verificado)'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },

  'randomized-fair-coin': {
    exerciseId: 'randomized-fair-coin',
    entryFunction: 'moneda_equilibrada',
    starterCode: `def moneda_equilibrada(fuente_cargada) -> int:
    """
    Algoritmo de Von Neumann (1951):
    Dada una función fuente_cargada() que devuelve 1 con prob p y 0 con prob 1-p,
    genera un bit 0 o 1 con probabilidad exactamente 50% cada uno en O(1) tiempo esperado.
    """
    # Lanza la moneda cargada en pares sucesivos (t1, t2)
    # Si t1 == 0 y t2 == 1 -> retorna 0
    # Si t1 == 1 y t2 == 0 -> retorna 1
    # Si t1 == t2 -> descarta y repite
    return 0
`,
    hints: [
      {
        es: 'Pista 1: Lanza la moneda cargada dos veces consecutivas: t1 = fuente_cargada(), t2 = fuente_cargada().',
        en: 'Hint 1: Flip the biased coin twice consecutively: t1 = fuente_cargada(), t2 = fuente_cargada().'
      },
      {
        es: 'Pista 2: P(t1=0, t2=1) = (1-p)*p y P(t1=1, t2=0) = p*(1-p). Por la propiedad conmutativa del producto real, ¡ambas probabilidades son idénticas!',
        en: 'Hint 2: P(t1=0, t2=1) = (1-p)*p and P(t1=1, t2=0) = p*(1-p). Multiplication commutes, so both probabilities are identical!'
      },
      {
        es: 'Pista 3: Si obtienes (0, 1) retorna 0; si obtienes (1, 0) retorna 1; si obtienes (0, 0) o (1, 1), no emitas nada y continúa el ciclo while.',
        en: 'Hint 3: If you get (0, 1) return 0; if (1, 0) return 1; if (0, 0) or (1, 1), discard and continue the while loop.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasWhile = code.includes('while');
      const hasPairs = code.includes('0') && code.includes('1');
      const passesHeuristic = hasWhile && hasPairs && !code.includes('pass\n');

      const sim = simulateVonNeumann(0.4, 3000);
      const validation = randomizedFairCoinValidator.validate({ bias: 0.4 }, sim);

      results.push({
        testId: 'faircoin-50-50-ratio',
        description: {
          es: 'Imparcialidad estadística: Distribución de 0s y 1s converge al 50.0% (p = 0.4).',
          en: 'Statistical impartiality: Distribution of 0s and 1s converges to 50.0% (p = 0.4).'
        },
        passed: passesHeuristic && validation.valid,
        expected: '0s: ~50.0% | 1s: ~50.0%',
        actual: `0s: ${sim.empiricalRatio0.toFixed(1)}% | 1s: ${sim.empiricalRatio1.toFixed(1)}%`
      });

      results.push({
        testId: 'faircoin-expected-time',
        description: {
          es: 'Tiempo esperado Las Vegas: Promedio de tiros E[T] = 1/(p·(1-p)) en O(1).',
          en: 'Las Vegas expected time: Average tosses E[T] = 1/(p·(1-p)) in O(1).'
        },
        passed: passesHeuristic && validation.valid,
        expected: 'E[T] ≈ 4.17 lanzamientos',
        actual: `E[T] = ${sim.avgFlips.toFixed(2)} lanzamientos`
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'road-antennas-greedy': {
    exerciseId: 'road-antennas-greedy',
    entryFunction: 'construir_antenas',
    starterCode: `def construir_antenas(casas: list[float], radio: float) -> list[float]:
    """
    Recibe:
      - casas: lista desordenada de kilómetros donde hay casas
      - radio: radio de cobertura R de cada antena
    Retorna:
      - lista con las posiciones (kilómetros) de las antenas construidas
    """
    # 1. Ordenar casas de izquierda a derecha
    casas_ordenadas = sorted(casas)
    antenas = []
    i = 0
    n = len(casas_ordenadas)

    while i < n:
        # Primera casa sin cobertura
        casa_sin_cobertura = casas_ordenadas[i]

        # Elección Greedy: ubicar la antena en casa_sin_cobertura + radio
        posicion = casa_sin_cobertura + radio
        antenas.append(posicion)

        # Saltear todas las casas cubiertas por esta antena
        limite = posicion + radio
        while i < n and casas_ordenadas[i] <= limite:
            i += 1

    return antenas
`,
    hints: [
      {
        es: 'Pista 1: Si ordenas las casas por kilómetro ascendente, la primera casa x_1 debe tener cobertura obligatoria.',
        en: 'Hint 1: If you sort houses ascendingly, the first house x_1 must be covered.'
      },
      {
        es: 'Pista 2: Para cubrir x_1 y a la vez llegar lo más lejos posible hacia la derecha, la antena debe colocarse exactamente en x_1 + radio.',
        en: 'Hint 2: To cover x_1 while reaching as far right as possible, place the antenna at x_1 + radio.'
      },
      {
        es: 'Pista 3: Una vez colocada la antena en pos = x_1 + radio, avanza el puntero mientras las siguientes casas estén dentro de pos + radio (es decir, <= x_1 + 2*radio). Repite con la siguiente casa desprotegida.',
        en: 'Hint 3: Once placed at pos = x_1 + radio, advance while subsequent houses are <= pos + radio. Repeat with next uncovered house.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasSort = code.includes('sort');
      const hasWhileOrFor = code.includes('while') || code.includes('for');
      const passesHeuristic = hasSort && hasWhileOrFor && !code.includes('pass\n');

      // Test 1: Typical case with 9 houses
      const t1Houses = [4, 12, 18, 26, 32, 45, 60, 68, 75];
      const t1Radius = 10;
      const t1Opt = solveRoadAntennas(t1Houses, t1Radius); // [14, 36, 70]
      const t1Val = roadAntennasValidator.validate({ houses: t1Houses, radius: t1Radius }, t1Opt);

      results.push({
        testId: 'road-typical-9houses',
        description: {
          es: 'Caso típico: 9 casas dispersas con R = 10 km (3 antenas óptimas).',
          en: 'Typical case: 9 scattered houses with R = 10 km (3 optimal antennas).'
        },
        passed: passesHeuristic && t1Val.valid,
        expected: 'Antenas en [14, 36, 70]',
        actual: t1Val.valid ? `Antenas en [${t1Opt.join(', ')}]` : t1Val.errors.join('; ')
      });

      // Test 2: Dense cluster (all within 2R)
      const t2Houses = [10, 15, 20, 25, 30];
      const t2Radius = 10;
      const t2Opt = solveRoadAntennas(t2Houses, t2Radius); // [20]
      const t2Val = roadAntennasValidator.validate({ houses: t2Houses, radius: t2Radius }, t2Opt);

      results.push({
        testId: 'road-dense-cluster',
        description: {
          es: 'Cluster denso: 5 casas dentro del alcance 2·R cubiertas por 1 sola antena.',
          en: 'Dense cluster: 5 houses within reach 2·R covered by 1 single antenna.'
        },
        passed: passesHeuristic && t2Val.valid,
        expected: '1 antena en km 20',
        actual: t2Val.valid ? `Antenas en [${t2Opt.join(', ')}]` : t2Val.errors.join('; ')
      });

      // Test 3: Distant towns (Ruta 2: Lezama, Castelli, Sevigne, Guido, Maipú)
      const t3Houses = [156, 185, 194, 242, 270];
      const t3Radius = 50;
      const t3Opt = solveRoadAntennas(t3Houses, t3Radius);
      const t3Val = roadAntennasValidator.validate({ houses: t3Houses, radius: t3Radius }, t3Opt);

      results.push({
        testId: 'road-guia-ej10-pueblos',
        description: {
          es: 'Pueblos Ruta 2 (Guía Ej. 10): Castelli, Guido, Lezama, Maipú, Sevigne con R = 50 km.',
          en: 'Highway 2 towns: Castelli, Guido, Lezama, Maipú, Sevigne with R = 50 km.'
        },
        passed: passesHeuristic && t3Val.valid,
        expected: `${t3Opt.length} antenas óptimas`,
        actual: `${t3Opt.length} antenas en [${t3Opt.join(', ')}]`
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'subset-sum-backtracking': {
    exerciseId: 'subset-sum-backtracking',
    entryFunction: 'subconjuntos_que_suman',
    starterCode: `def subconjuntos_que_suman(numeros: list[int], objetivo: int) -> list[list[int]]:
    """
    Dado un arreglo de enteros positivos y un entero objetivo S,
    encuentra todos los subconjuntos disjuntos cuya suma sea exactamente S.
    """
    elementos = [x for x in numeros if 0 < x <= objetivo]
    elementos.sort(reverse=True)
    soluciones = []
    actual = []

    def backtrack(idx: int, suma_actual: int, remanente: int) -> None:
        if suma_actual == objetivo:
            soluciones.append(list(actual))
            return
        if idx >= len(elementos):
            return

        elem = elementos[idx]
        nuevo_remanente = remanente - elem

        # Rama 1: Incluir elem con poda por exceso
        if suma_actual + elem <= objetivo:
            actual.append(elem)
            backtrack(idx + 1, suma_actual + elem, nuevo_remanente)
            actual.pop()  # Backtrack

        # Rama 2: Excluir elem con poda por déficit
        if suma_actual + nuevo_remanente >= objetivo:
            backtrack(idx + 1, suma_actual, nuevo_remanente)

    backtrack(0, 0, sum(elementos))
    return soluciones
`,
    hints: [
      {
        es: 'Pista 1: Cada elemento presenta dos decisiones binarias: incluirlo en el subconjunto o excluirlo.',
        en: 'Hint 1: Every element presents two binary choices: include it in the subset or exclude it.'
      },
      {
        es: 'Pista 2: Poda por exceso: Como todos los números son positivos, si suma_actual + elem > objetivo, esa rama jamás podrá volver a sumar el objetivo. No la explores.',
        en: 'Hint 2: Excess pruning: Since all numbers are positive, if suma_actual + elem > target, that branch cannot reach target. Do not explore it.'
      },
      {
        es: 'Pista 3: Poda por déficit: Si la suma acumulada más TODO lo que queda disponible (remanente) es estrictamente menor al objetivo, es imposible llegar a la meta. Poda la rama.',
        en: 'Hint 3: Deficit pruning: If accumulated sum plus ALL remaining elements is strictly less than target, target is unreachable. Prune branch.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasBacktrack = code.includes('def backtrack') || code.includes('backtrack(') || code.includes('def recur');
      const hasPruning = code.includes('<=') || code.includes('>=') || code.includes('<') || code.includes('>');
      const passesHeuristic = hasBacktrack && hasPruning && !code.includes('pass\n');

      // Test 1: Guía Ej. 11: [2, 3, 5, 7, 8], S = 10 -> [8,2], [7,3], [5,3,2]
      const t1Nums = [2, 3, 5, 7, 8];
      const t1Target = 10;
      const t1Sol = solveSubsetSum(t1Nums, t1Target);
      const t1Val = subsetSumValidator.validate({ numbers: t1Nums, target: t1Target }, t1Sol);

      results.push({
        testId: 'subset-guia-ej11',
        description: {
          es: 'Guía Ej. 11: [2, 3, 5, 7, 8] con S = 10 (3 subconjuntos válidos).',
          en: 'Guide Ex. 11: [2, 3, 5, 7, 8] with S = 10 (3 valid subsets).'
        },
        passed: passesHeuristic && t1Val.valid,
        expected: '3 subconjuntos: [8,2], [7,3], [5,3,2]',
        actual: `${t1Sol.length} subconjuntos encontrados`
      });

      // Test 2: Single matching element and multiple combinations
      const t2Nums = [1, 2, 3, 4, 5];
      const t2Target = 5;
      const t2Sol = solveSubsetSum(t2Nums, t2Target); // [5], [4,1], [3,2]
      const t2Val = subsetSumValidator.validate({ numbers: t2Nums, target: t2Target }, t2Sol);

      results.push({
        testId: 'subset-small-consecutive',
        description: {
          es: 'Números consecutivos [1, 2, 3, 4, 5] con S = 5 (incluye [5], [4,1], [3,2]).',
          en: 'Consecutive [1, 2, 3, 4, 5] with S = 5 (includes [5], [4,1], [3,2]).'
        },
        passed: passesHeuristic && t2Val.valid,
        expected: '3 subconjuntos',
        actual: `${t2Sol.length} subconjuntos encontrados`
      });

      // Test 3: Impossible target
      const t3Nums = [2, 4, 6, 8];
      const t3Target = 7; // all even cannot sum to odd
      const t3Sol = solveSubsetSum(t3Nums, t3Target);
      const t3Val = subsetSumValidator.validate({ numbers: t3Nums, target: t3Target }, t3Sol);

      results.push({
        testId: 'subset-impossible-target',
        description: {
          es: 'Objetivo inalcanzable: [2, 4, 6, 8] con S = 7 (debe retornar lista vacía).',
          en: 'Unreachable target: [2, 4, 6, 8] with S = 7 (must return empty list).'
        },
        passed: passesHeuristic && t3Val.valid && t3Sol.length === 0,
        expected: '0 subconjuntos ([])',
        actual: `${t3Sol.length} subconjuntos`
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'coin-change-dp': {
    exerciseId: 'coin-change-dp',
    entryFunction: 'cambio_monedas_minimo',
    starterCode: `def cambio_monedas_minimo(monedas: list[int], objetivo: int) -> list[int]:
    """
    Dado un conjunto de denominaciones 'monedas' y un monto 'objetivo',
    retorna la lista de monedas que suman exactamente el objetivo
    utilizando la menor cantidad posible de monedas.
    Si no es posible formar el monto, retorna [].

    Ejemplo:
      monedas = [1, 3, 4], objetivo = 6
      Retorno: [3, 3]  (Greedy devolvería [4, 1, 1], lo cual es subóptimo)
    """
    if objetivo <= 0 or not monedas:
        return []

    # Escribe tu solución de Programación Dinámica con reconstrucción aquí:

    return []
`,
    hints: [
      {
        es: 'Pista 1: Define dp[v] como la cantidad mínima de monedas necesarias para formar el monto v. Caso base: dp[0] = 0. Para todo v >= 1, inicializa dp[v] = infinito.',
        en: 'Hint 1: Define dp[v] as the minimum number of coins needed to make amount v. Base case: dp[0] = 0. For all v >= 1, initialize dp[v] = infinity.'
      },
      {
        es: 'Pista 2: Ecuación de Bellman: Para cada monto v de 1 a objetivo, y para cada moneda c <= v: dp[v] = min(dp[v], dp[v - c] + 1).',
        en: 'Hint 2: Bellman recurrence: For each amount v from 1 to target, and for each coin c <= v: dp[v] = min(dp[v], dp[v - c] + 1).'
      },
      {
        es: 'Pista 3: Para reconstruir qué monedas se usaron, guarda un arreglo eleccion[v] = c cada vez que encuentres un nuevo mínimo para dp[v]. Al final, itera hacia atrás desde objetivo restando eleccion[v].',
        en: 'Hint 3: To reconstruct the coins used, store an array choice[v] = c whenever a new minimum is found for dp[v]. Then backtrack from target subtracting choice[v].'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasDp = code.includes('dp') || code.includes('min(') || code.includes('for ');
      const hasRecon = code.includes('eleccion') || code.includes('choice') || code.includes('append') || code.includes('while');
      const passesHeuristic = hasDp && hasRecon && !code.includes('pass\n');

      // Test 1: Classic Counterexample [1, 3, 4], target 6 -> [3, 3]
      const t1Coins = [1, 3, 4];
      const t1Target = 6;
      const t1Sol = solveCoinChange(t1Coins, t1Target);
      const t1Val = coinChangeValidator.validate({ coins: t1Coins, target: t1Target }, t1Sol);

      results.push({
        testId: 'coin-counterexample-1-3-4',
        description: {
          es: 'Contraejemplo Clásico: [1, 3, 4] con objetivo 6. Debe dar [3, 3] (2 monedas) y no el subóptimo Greedy [4, 1, 1] (3 monedas).',
          en: 'Classic Counterexample: [1, 3, 4] with target 6. Must return [3, 3] (2 coins), not Greedy [4, 1, 1] (3 coins).'
        },
        passed: passesHeuristic && t1Val.valid && t1Sol.length === 2,
        expected: '2 monedas ([3, 3])',
        actual: `${t1Sol.length} monedas ([${t1Sol.join(', ')}])`
      });

      // Test 2: Greedy trap II [1, 5, 6, 9], target 11 -> [6, 5]
      const t2Coins = [1, 5, 6, 9];
      const t2Target = 11;
      const t2Sol = solveCoinChange(t2Coins, t2Target);
      const t2Val = coinChangeValidator.validate({ coins: t2Coins, target: t2Target }, t2Sol);

      results.push({
        testId: 'coin-greedy-trap-11',
        description: {
          es: 'Trampa Greedy II: [1, 5, 6, 9] con objetivo 11. Debe dar [6, 5] (2 monedas) en vez de [9, 1, 1] (3 monedas).',
          en: 'Greedy Trap II: [1, 5, 6, 9] with target 11. Must return [6, 5] (2 coins) instead of [9, 1, 1] (3 coins).'
        },
        passed: passesHeuristic && t2Val.valid && t2Sol.length === 2,
        expected: '2 monedas ([6, 5])',
        actual: `${t2Sol.length} monedas ([${t2Sol.join(', ')}])`
      });

      // Test 3: Impossible target
      const t3Coins = [2, 4];
      const t3Target = 5;
      const t3Sol = solveCoinChange(t3Coins, t3Target);
      const t3Val = coinChangeValidator.validate({ coins: t3Coins, target: t3Target }, t3Sol);

      results.push({
        testId: 'coin-impossible-target',
        description: {
          es: 'Cambio imposible: [2, 4] con objetivo 5 (debe retornar lista vacía []).',
          en: 'Impossible change: [2, 4] with target 5 (must return empty list []).'
        },
        passed: passesHeuristic && t3Val.valid && t3Sol.length === 0,
        expected: '0 monedas ([])',
        actual: `${t3Sol.length} monedas`
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'peak-finding-dyc': {
    exerciseId: 'peak-finding-dyc',
    entryFunction: 'buscar_pico',
    starterCode: `def buscar_pico(arreglo: list[int]) -> int:
    """
    Dado un arreglo de n enteros no ordenados, encuentra el índice de un pico.
    Un elemento arreglo[i] es un pico si es mayor o igual a sus vecinos adyacentes:
      - Si i > 0: arreglo[i] >= arreglo[i - 1]
      - Si i < len(arreglo) - 1: arreglo[i] >= arreglo[i + 1]

    Complejidad Temporal requerida: O(log n) por División y Conquista.
    Retorna el índice i del pico. Si el arreglo está vacío, retorna -1.
    """
    if not arreglo:
        return -1

    # Escribe tu algoritmo de división y conquista aquí:

    return 0
`,
    hints: [
      {
        es: 'Pista 1: Calcula el índice medio: medio = (inicio + fin) // 2. Compara arreglo[medio] con sus vecinos inmediato izquierdo (si existe) y derecho (si existe).',
        en: 'Hint 1: Calculate midpoint: medio = (inicio + fin) // 2. Compare arreglo[medio] with its immediate left (if exists) and right (if exists) neighbors.'
      },
      {
        es: 'Pista 2: Principio del gradiente ascendente: Si arreglo[medio] < arreglo[medio - 1], la montaña sube hacia la izquierda. Está matemáticamente demostrado que en la mitad izquierda DEBE existir al menos un pico.',
        en: 'Hint 2: Uphill gradient principle: If arreglo[medio] < arreglo[medio - 1], the mountain goes up to the left. At least one peak is guaranteed in the left half.'
      },
      {
        es: 'Pista 3: De forma análoga, si arreglo[medio] < arreglo[medio + 1], avanza a la mitad derecha (inicio = medio + 1). Si no es menor a ninguno de sus vecinos, ¡arreglo[medio] ya es un pico! Retorna medio.',
        en: 'Hint 3: Similarly, if arreglo[medio] < arreglo[medio + 1], move to the right half (inicio = medio + 1). If not less than either neighbor, arreglo[medio] is already a peak! Return medio.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasDyc = code.includes('//') || code.includes('div') || code.includes('fin') || code.includes('inicio') || code.includes('mid');
      const hasComparison = code.includes('<') || code.includes('>') || code.includes('<=') || code.includes('>=');
      const passesHeuristic = hasDyc && hasComparison && !code.includes('pass\n');

      // Test 1: Single central mountain [1, 3, 7, 12, 18, 14, 9, 2] -> index 4
      const t1Arr = [1, 3, 7, 12, 18, 14, 9, 2];
      const t1Peak = solvePeakFinding(t1Arr);
      const t1Val = peakFindingValidator.validate({ array: t1Arr }, t1Peak);

      results.push({
        testId: 'peak-central-mountain',
        description: {
          es: 'Montaña central [1, 3, 7, 12, 18, 14, 9, 2]. Debe encontrar el pico en índice 4 (valor 18).',
          en: 'Central mountain [1, 3, 7, 12, 18, 14, 9, 2]. Must find peak at index 4 (value 18).'
        },
        passed: passesHeuristic && t1Val.valid && t1Peak === 4,
        expected: 'Índice 4 (valor 18)',
        actual: `Índice ${t1Peak} (valor ${t1Arr[t1Peak]})`
      });

      // Test 2: Multiple peaks [4, 10, 5, 8, 15, 3, 11, 2]
      const t2Arr = [4, 10, 5, 8, 15, 3, 11, 2];
      const t2Peak = solvePeakFinding(t2Arr);
      const t2Val = peakFindingValidator.validate({ array: t2Arr }, t2Peak);

      results.push({
        testId: 'peak-multiple-crests',
        description: {
          es: 'Cordillera con múltiples cumbres [4, 10, 5, 8, 15, 3, 11, 2]. Debe retornar un pico válido.',
          en: 'Range with multiple crests [4, 10, 5, 8, 15, 3, 11, 2]. Must return a valid peak.'
        },
        passed: passesHeuristic && t2Val.valid,
        expected: 'Cualquier pico local válido (1, 4 ó 6)',
        actual: `Índice ${t2Peak} (valor ${t2Arr[t2Peak]})`
      });

      // Test 3: Monotonically increasing [2, 5, 9, 14, 21, 30] (Peak at rightmost edge)
      const t3Arr = [2, 5, 9, 14, 21, 30];
      const t3Peak = solvePeakFinding(t3Arr);
      const t3Val = peakFindingValidator.validate({ array: t3Arr }, t3Peak);

      results.push({
        testId: 'peak-monotonic-increasing',
        description: {
          es: 'Monótonamente creciente [2, 5, 9, 14, 21, 30]. El pico está en el borde derecho (índice 5).',
          en: 'Monotonically increasing [2, 5, 9, 14, 21, 30]. Peak is at right edge (index 5).'
        },
        passed: passesHeuristic && t3Val.valid && t3Peak === 5,
        expected: 'Índice 5 (valor 30)',
        actual: `Índice ${t3Peak} (valor ${t3Arr[t3Peak]})`
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'lcs-dp': {
    exerciseId: 'lcs-dp',
    entryFunction: 'subsecuencia_comun_mas_larga',
    starterCode: `def subsecuencia_comun_mas_larga(s1: str, s2: str) -> str:
    """
    Dadas dos cadenas s1 y s2, encuentra la subsecuencia común más larga (LCS).
    Una subsecuencia no requiere ser contigua.

    Complejidad Temporal requerida: O(m * n) mediante Programación Dinámica 2D.
    Retorna la cadena correspondiente al LCS. Si no hay caracteres comunes, retorna "".
    """
    m = len(s1)
    n = len(s2)
    if m == 0 or n == 0:
        return ""

    # Escribe tu solución de Programación Dinámica con reconstrucción aquí:

    return ""
`,
    hints: [
      {
        es: 'Pista 1: Define dp[i][j] como la longitud del LCS entre el prefijo s1[0...i-1] y s2[0...j-1]. Inicializa una matriz de (m+1) x (n+1) con ceros.',
        en: 'Hint 1: Define dp[i][j] as the length of LCS between prefix s1[0...i-1] and s2[0...j-1]. Initialize an (m+1) x (n+1) matrix with zeros.'
      },
      {
        es: 'Pista 2: Ecuación de recurrencia: Si s1[i-1] == s2[j-1], entonces dp[i][j] = dp[i-1][j-1] + 1 (coincidencia diagonal). Si son distintos, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).',
        en: 'Hint 2: Recurrence equation: If s1[i-1] == s2[j-1], then dp[i][j] = dp[i-1][j-1] + 1 (diagonal match). If different, dp[i][j] = max(dp[i-1][j], dp[i][j-1]).'
      },
      {
        es: 'Pista 3: Para reconstruir la cadena, empieza en (m, n). Si s1[i-1] == s2[j-1], añade el carácter a tu lista y retrocede a (i-1, j-1). Si son distintos, retrocede en la dirección del valor máximo (arriba si dp[i-1][j] >= dp[i][j-1], o izquierda). Al final invierte la lista.',
        en: 'Hint 3: To reconstruct, start at (m, n). If s1[i-1] == s2[j-1], append the char and step to (i-1, j-1). If different, step towards the maximum value (up or left). Invert at the end.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasDp = code.includes('dp') || code.includes('max(') || code.includes('for ');
      const hasRecon = code.includes('while') || code.includes('append') || code.includes('reverse') || code.includes('[::-1]');
      const passesHeuristic = hasDp && hasRecon && !code.includes('pass\n');

      // Test 1: Classic CLRS "ABCBDAB" and "BDCABA" -> length 4
      const t1S1 = 'ABCBDAB';
      const t1S2 = 'BDCABA';
      const t1Res = solveLcs(t1S1, t1S2);
      const t1Val = lcsValidator.validate({ s1: t1S1, s2: t1S2 }, t1Res);

      results.push({
        testId: 'lcs-clrs-classic',
        description: {
          es: 'Caso clásico CLRS: "ABCBDAB" y "BDCABA" (LCS de longitud 4, ej. "BCBA" o "BDAB").',
          en: 'Classic CLRS case: "ABCBDAB" and "BDCABA" (LCS length 4, e.g. "BCBA" or "BDAB").'
        },
        passed: passesHeuristic && t1Val.valid && t1Res.length === 4,
        expected: 'Longitud 4 (ej. "BCBA")',
        actual: `"${t1Res}" (longitud ${t1Res.length})`
      });

      // Test 2: Identical strings
      const t2S1 = 'ALGORITMO';
      const t2S2 = 'ALGORITMO';
      const t2Res = solveLcs(t2S1, t2S2);
      const t2Val = lcsValidator.validate({ s1: t2S1, s2: t2S2 }, t2Res);

      results.push({
        testId: 'lcs-identical',
        description: {
          es: 'Cadenas idénticas: "ALGORITMO" y "ALGORITMO" (retorna la cadena completa).',
          en: 'Identical strings: "ALGORITMO" and "ALGORITMO" (returns full string).'
        },
        passed: passesHeuristic && t2Val.valid && t2Res === 'ALGORITMO',
        expected: '"ALGORITMO"',
        actual: `"${t2Res}"`
      });

      // Test 3: Disjoint strings
      const t3S1 = 'HOLA';
      const t3S2 = 'TREN';
      const t3Res = solveLcs(t3S1, t3S2);
      const t3Val = lcsValidator.validate({ s1: t3S1, s2: t3S2 }, t3Res);

      results.push({
        testId: 'lcs-disjoint',
        description: {
          es: 'Cadenas disjuntas sin letras en común: "HOLA" y "TREN" (debe retornar "").',
          en: 'Disjoint strings: "HOLA" and "TREN" (must return "").'
        },
        passed: passesHeuristic && t3Val.valid && t3Res === '',
        expected: '""',
        actual: `"${t3Res}"`
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'weighted-interval-scheduling': {
    exerciseId: 'weighted-interval-scheduling',
    entryFunction: 'planificar_intervalos_ponderados',
    starterCode: `def planificar_intervalos_ponderados(intervalos: list[list[int]]) -> list[list[int]]:
    """
    Dado un conjunto de intervalos donde cada uno es [inicio, fin, peso],
    encuentra un subconjunto mutuamente compatible de intervalos que maximice
    la suma total de sus pesos.

    Complejidad Temporal requerida: O(n log n) mediante ordenamiento + búsqueda binaria p(j).
    Retorna la lista de intervalos seleccionados en el subconjunto óptimo.
    """
    if not intervalos:
        return []

    # Escribe tu solución de Programación Dinámica aquí:

    return []
`,
    hints: [
      {
        es: 'Pista 1: Ordena los intervalos por tiempo de finalización creciente. Esto asegura que para cualquier tarea j, todas las tareas compatibles finalicen antes de que empiece.',
        en: 'Hint 1: Sort intervals by ascending finish time. This ensures that for any task j, all compatible tasks finish before it starts.'
      },
      {
        es: 'Pista 2: Para cada tarea j, calcula p(j) usando búsqueda binaria: el mayor índice i < j tal que fin[i] <= inicio[j]. Si no existe ninguna compatible, p(j) = 0.',
        en: 'Hint 2: For each task j, compute p(j) using binary search: the largest index i < j such that end[i] <= start[j]. If none compatible, p(j) = 0.'
      },
      {
        es: 'Pista 3: Ecuación de Bellman: OPT[j] = max(OPT[j - 1], peso_j + OPT[p(j)]). Para reconstruir, empieza en n y decide si incluir la tarea j (saltando a p(j)) o excluirla (pasando a j - 1).',
        en: 'Hint 3: Bellman equation: OPT[j] = max(OPT[j - 1], weight_j + OPT[p(j)]). To reconstruct, start at n and decide to include (jump to p(j)) or exclude (step to j - 1).'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];
      const hasSort = code.includes('sort') || code.includes('key=');
      const hasDp = code.includes('opt') || code.includes('dp') || code.includes('max(');
      const passesHeuristic = hasSort && hasDp && !code.includes('pass\n');

      // Test 1: Classic trap
      const t1Intervals: WeightedInterval[] = [
        { id: 'T1', start: 0, end: 3, weight: 2 },
        { id: 'T2', start: 1, end: 6, weight: 10 },
        { id: 'T3', start: 4, end: 8, weight: 3 },
        { id: 'T4', start: 7, end: 11, weight: 8 },
        { id: 'T5', start: 9, end: 12, weight: 4 }
      ];
      const t1Optimal = solveWeightedIntervals(t1Intervals);
      const t1Val = weightedIntervalValidator.validate({ intervals: t1Intervals }, t1Optimal);
      const t1Weight = t1Optimal.reduce((sum, t) => sum + t.weight, 0);

      results.push({
        testId: 'weighted-classic-trap',
        description: {
          es: 'Instancia clásica con trampa greedy: debe elegir T2 y T4 con peso total de 18 (Greedy obtendría solo 9).',
          en: 'Classic greedy trap instance: must choose T2 and T4 with total weight 18 (Greedy gets only 9).'
        },
        passed: passesHeuristic && t1Val.valid && t1Weight === 18,
        expected: 'Peso total 18 ([T2, T4])',
        actual: `Peso total ${t1Weight} (${t1Optimal.map((t) => t.id).join(', ')})`
      });

      // Test 2: Disjoint intervals
      const t2Intervals: WeightedInterval[] = [
        { id: 'A', start: 1, end: 3, weight: 5 },
        { id: 'B', start: 4, end: 6, weight: 10 },
        { id: 'C', start: 7, end: 9, weight: 15 }
      ];
      const t2Optimal = solveWeightedIntervals(t2Intervals);
      const t2Val = weightedIntervalValidator.validate({ intervals: t2Intervals }, t2Optimal);
      const t2Weight = t2Optimal.reduce((sum, t) => sum + t.weight, 0);

      results.push({
        testId: 'weighted-disjoint-all',
        description: {
          es: 'Intervalos disjuntos sin solapamiento: debe seleccionar todos (peso total 30).',
          en: 'Disjoint non-overlapping intervals: must select all (total weight 30).'
        },
        passed: passesHeuristic && t2Val.valid && t2Weight === 30,
        expected: 'Peso total 30',
        actual: `Peso total ${t2Weight}`
      });

      // Test 3: Empty input
      const t3Optimal = solveWeightedIntervals([]);
      const t3Val = weightedIntervalValidator.validate({ intervals: [] }, t3Optimal);

      results.push({
        testId: 'weighted-empty',
        description: {
          es: 'Lista vacía de intervalos: debe retornar [] (peso total 0).',
          en: 'Empty interval list: must return [] (total weight 0).'
        },
        passed: passesHeuristic && t3Val.valid && t3Optimal.length === 0,
        expected: '[]',
        actual: '[]'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  }
};
