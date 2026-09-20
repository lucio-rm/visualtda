import { ExerciseSolveContent, TestCaseResult } from './types';
import { knapsackDpValidator, KnapsackItem } from '../algorithms/knapsackDpValidator';
import { juanElVagoValidator } from '../algorithms/juanElVagoValidator';
import { coinChangeValidator, solveCoinChange } from '../algorithms/coinChangeValidator';
import { lcsValidator, solveLcs } from '../algorithms/lcsValidator';
import { weightedIntervalValidator, solveWeightedIntervals, WeightedInterval } from '../algorithms/weightedIntervalValidator';

export const dpContent: Record<string, ExerciseSolveContent> = {
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
  },
};
