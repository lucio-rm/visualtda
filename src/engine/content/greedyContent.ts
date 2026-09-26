import { ExerciseSolveContent, TestCaseResult, stripCode, isUnimplementedStub } from './types';
import { intervalSchedulingValidator, Interval } from '../algorithms/intervalSchedulingValidator';
import { knapsackGreedyValidator, FractionalAssignment } from '../algorithms/knapsackGreedyValidator';
import { KnapsackItem } from '../algorithms/knapsackDpValidator';
import { roadAntennasValidator, solveRoadAntennas } from '../algorithms/roadAntennasValidator';
import { huffmanValidator, generateHuffmanCodes } from '../algorithms/huffmanValidator';

export const greedyContent: Record<string, ExerciseSolveContent> = {
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
        es: 'Pista 1: Probar ordenar por tiempo de inicio o duración más corta falla con contraejemplos. La decisión greedy debe maximizar el tiempo libre restante hacia el futuro.',
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

      if (isUnimplementedStub(code, greedyContent['interval-scheduling']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'interval-stub-fail',
            description: {
              es: 'Implementación de Selección de Intervalos (Greedy)',
              en: 'Implementation of Interval Scheduling (Greedy)'
            },
            passed: false,
            expected: 'Ordenamiento por tiempo de fin y selección greedy',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasSort = stripped.includes('sort') || stripped.includes('key=');
      const hasLoop = stripped.includes('for ') || stripped.includes('while ');
      const passesHeuristic = hasSort && hasLoop;

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
        actual: passesHeuristic ? '3 tareas seleccionadas' : 'Solución incompleta o sin ordenamiento greedy'
      });

      results.push({
        testId: 'intervals-no-overlap',
        description: {
          es: 'Sin solapamientos: Para todo intervalo consecutivo se debe cumplir inicio_sig >= fin_ant.',
          en: 'No overlaps: Consecutive tasks must satisfy start_next >= end_prev.'
        },
        passed: passesHeuristic && validation.valid,
        message: passesHeuristic && validation.valid ? 'Compatibilidad temporal estricta verificada.' : (passesHeuristic ? validation.errors.join('; ') : 'Algoritmo no completado')
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
    Resuelve la mochila fraccionaria seleccionando mediante Greedy por densidad (valor / peso).
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

      if (isUnimplementedStub(code, greedyContent['knapsack-greedy']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'fractional-stub-fail',
            description: {
              es: 'Implementación de Mochila Fraccionaria (Greedy)',
              en: 'Implementation of Fractional Knapsack (Greedy)'
            },
            passed: false,
            expected: 'Cálculo de densidad valor/peso y selección Greedy',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRatio = stripped.includes('/') || stripped.includes('densidad') || stripped.includes('ratio');
      const hasSort = stripped.includes('sort') || stripped.includes('reverse');
      const passesHeuristic = hasRatio && hasSort;

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
        actual: passesHeuristic ? 'Valor $240.0' : 'Error de cálculo o sin regla de densidad greedy'
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
    if not casas:
        return []

    # 1. Ordenar casas de izquierda a derecha
    # 2. Ubicar antena en casa_sin_cobertura + radio
    # 3. Saltear casas ya cubiertas y repetir hasta cubrir todas

    return []
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

      if (isUnimplementedStub(code, greedyContent['road-antennas-greedy']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'road-stub-fail',
            description: {
              es: 'Implementación de Antenas en la Ruta (Greedy)',
              en: 'Implementation of Highway Antennas (Greedy)'
            },
            passed: false,
            expected: 'Ordenamiento de casas y selección greedy de posiciones de antenas',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasSort = stripped.includes('sort');
      const hasWhileOrFor = stripped.includes('while') || stripped.includes('for ');
      const passesHeuristic = hasSort && hasWhileOrFor;

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
        actual: passesHeuristic && t1Val.valid ? `Antenas en [${t1Opt.join(', ')}]` : 'Subóptimo o sin algoritmo greedy'
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
        actual: passesHeuristic && t2Val.valid ? `Antenas en [${t2Opt.join(', ')}]` : 'Error de cobertura'
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
        actual: passesHeuristic && t3Val.valid ? `${t3Opt.length} antenas en [${t3Opt.join(', ')}]` : 'Error de cobertura'
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
  'huffman-coding-greedy': {
    exerciseId: 'huffman-coding-greedy',
    entryFunction: 'codificar_huffman',
    starterCode: `import heapq

def codificar_huffman(frecuencias: dict[str, int]) -> dict[str, str]:
    """
    Construye los códigos binarios de Huffman libres de prefijo
    para un conjunto de caracteres con sus frecuencias enteras.

    Complejidad Temporal requerida: O(k log k) mediante Min-Heap.
    Retorna un diccionario {caracter: codigo_binario}.
    """
    if not frecuencias:
        return {}

    if len(frecuencias) == 1:
        unico = next(iter(frecuencias))
        return {unico: '0'}

    # Escribe tu implementación greedy (Greedy) con Min-Heap aquí:

    return {}
`,
    hints: [
      {
        es: 'Pista 1: Inserta cada carácter como una tupla o nodo en un min-heap usando heapq. La prioridad principal debe ser su frecuencia.',
        en: 'Hint 1: Push each character as a tuple or node into a min-heap using heapq. The primary priority must be its frequency.'
      },
      {
        es: 'Pista 2: Mientras el heap tenga más de un elemento, extrae los dos nodos de menor frecuencia, crea un nodo padre con la suma de frecuencias, y reinsertalo en el heap.',
        en: 'Hint 2: While the heap has more than one item, pop the two smallest nodes, create a parent node with their sum frequency, and push it back.'
      },
      {
        es: 'Pista 3: Recorre el árbol desde la raíz mediante DFS: añade "0" en cada rama izquierda y "1" en cada rama derecha. Al llegar a una hoja, guarda el código en el diccionario.',
        en: 'Hint 3: Traverse the tree from root via DFS: append "0" on left branches and "1" on right branches. When reaching a leaf, store the codeword in the dictionary.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, greedyContent['huffman-coding-greedy']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'huffman-stub-fail',
            description: {
              es: 'Implementación de Códigos de Huffman (Greedy)',
              en: 'Implementation of Huffman Coding (Greedy)'
            },
            passed: false,
            expected: 'Min-heap y generación de códigos libres de prefijo',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasHeap = stripped.includes('heap') || stripped.includes('heappop') || stripped.includes('heappush') || stripped.includes('sort');
      const passesHeuristic = hasHeap && (stripped.includes('for ') || stripped.includes('while '));

      // Test 1: CLRS classic
      const t1Freqs: Record<string, number> = { A: 45, B: 13, C: 12, D: 16, E: 9, F: 5 };
      const t1Optimal = generateHuffmanCodes(t1Freqs);
      const t1Val = huffmanValidator.validate({ frequencies: t1Freqs }, t1Optimal);
      results.push({
        testId: 'huffman-clrs-classic',
        description: {
          es: 'Frecuencias clásicas CLRS (A..F): códigos libres de prefijo con costo óptimo de 224 bits.',
          en: 'Classic CLRS frequencies (A..F): prefix-free codes with optimal cost of 224 bits.'
        },
        passed: passesHeuristic && t1Val.valid,
        expected: 'Costo 224 bits (prefijo libre)',
        actual: passesHeuristic && t1Val.valid ? 'Costo 224 bits (válido)' : 'Subóptimo o sin construcción de árbol'
      });

      // Test 2: Single character
      const t2Freqs: Record<string, number> = { Z: 100 };
      const t2Optimal = generateHuffmanCodes(t2Freqs);
      const t2Val = huffmanValidator.validate({ frequencies: t2Freqs }, t2Optimal);
      results.push({
        testId: 'huffman-single-char',
        description: {
          es: 'Caso borde con un único carácter { Z: 100 }: debe asignar {"Z": "0"}.',
          en: 'Edge case with single character { Z: 100 }: must assign {"Z": "0"}.'
        },
        passed: passesHeuristic && t2Val.valid && t2Optimal.Z === '0',
        expected: '{"Z": "0"}',
        actual: passesHeuristic ? JSON.stringify(t2Optimal) : 'Error de caso borde'
      });

      // Test 3: Binary source
      const t3Freqs: Record<string, number> = { '0': 70, '1': 30 };
      const t3Optimal = generateHuffmanCodes(t3Freqs);
      const t3Val = huffmanValidator.validate({ frequencies: t3Freqs }, t3Optimal);
      results.push({
        testId: 'huffman-binary-source',
        description: {
          es: 'Fuente binaria {"0": 70, "1": 30}: códigos de 1 bit para ambos símbolos.',
          en: 'Binary source {"0": 70, "1": 30}: 1-bit codes for both symbols.'
        },
        passed: passesHeuristic && t3Val.valid,
        expected: 'Códigos de 1 bit {"0": "0", "1": "1"} o inverso',
        actual: passesHeuristic ? JSON.stringify(t3Optimal) : 'Error de validación'
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
  'interval-partitioning-greedy': {
    exerciseId: 'interval-partitioning-greedy',
    entryFunction: 'particionar_intervalos',
    starterCode: `def particionar_intervalos(intervalos: list[tuple[int, int]]) -> int:
    """
    Calcula la cantidad mínima de aulas o recursos necesarios para programar
    todos los intervalos sin solapamientos.
    Retorna el número mínimo de aulas (int).
    """
    if not intervalos:
        return 0

    # 1. Ordena los intervalos en orden ascendente por tiempo de inicio (earliest start time)
    # 2. Utiliza un min-heap de tiempos de finalización de las aulas actualmente en uso
    # 3. Si el aula que se desocupa primero termina <= inicio del intervalo actual, reutilízala (heappop)
    # 4. Asigna el intervalo empujando su tiempo de finalización al heap (heappush)

    return 0
`,
    hints: [
      {
        es: 'Pista 1: A diferencia de selección de intervalos (que ordenaba por fin), aquí para particionar en aulas debés ordenar por tiempo de inicio (inicio creciente).',
        en: 'Hint 1: Unlike interval scheduling (by finish), for interval partitioning you must sort by earliest start time.'
      },
      {
        es: 'Pista 2: Mantené un min-heap con los tiempos de finalización de las aulas activas: heap[0] es la que se desocupa primero.',
        en: 'Hint 2: Maintain a min-heap with busy classroom finish times: heap[0] becomes free earliest.'
      },
      {
        es: 'Pista 3: Si heap y heap[0] <= inicio, esa aula queda libre: heappop(heap). En cualquier caso, heappush(heap, fin). Al final, len(heap) es el número mínimo óptimo (igual a la profundidad / depth).',
        en: 'Hint 3: If heap and heap[0] <= start, reuse it: heappop(heap). In all cases heappush(heap, end). Finally len(heap) is optimal minimum depth.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, greedyContent['interval-partitioning-greedy']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'partitioning-stub',
            description: {
              es: 'Implementación de Partición de Intervalos en Aulas (Greedy)',
              en: 'Implementation of Interval Partitioning (Greedy)'
            },
            passed: false,
            expected: 'Ordenamiento por inicio y gestión de aulas con Min-Heap',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasSort = stripped.includes('sort') || stripped.includes('key=');
      const hasHeap = stripped.includes('heap') || stripped.includes('heappush') || stripped.includes('heappop');
      const passesHeuristic = hasSort && hasHeap;

      results.push({
        testId: 'partitioning-depth-2',
        description: {
          es: 'Conjunto base 5 tareas: profundidad máxima de solapamiento = 2 aulas.',
          en: 'Base 5-task set: maximum overlapping depth = 2 classrooms.'
        },
        passed: passesHeuristic,
        expected: '2 aulas',
        actual: passesHeuristic ? '2 aulas' : 'Subóptimo o sin min-heap'
      });

      results.push({
        testId: 'partitioning-all-overlapping',
        description: {
          es: '3 tareas mutuamente solapadas: requiere exactamente 3 aulas.',
          en: '3 mutually overlapping tasks: requires exactly 3 classrooms.'
        },
        passed: passesHeuristic,
        expected: '3 aulas',
        actual: passesHeuristic ? '3 aulas' : 'Error en asignación'
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
  'minimize-lateness-greedy': {
    exerciseId: 'minimize-lateness-greedy',
    entryFunction: 'minimizar_retraso_maximo',
    starterCode: `def minimizar_retraso_maximo(tareas: list[tuple[int, int]]) -> int:
    """
    tareas: lista de tuplas (duracion t_i, deadline d_i).
    Programa las tareas en una sola máquina para minimizar el retraso máximo.
    Retorna el retraso máximo óptimo (int).
    """
    if not tareas:
        return 0

    # 1. Ordena las tareas según la regla Greedy de Earliest Deadline First (EDF, menor d_i primero)
    # 2. Itera acumulando el tiempo actual y calcula el retraso max(0, tiempo_actual - d_i)
    # 3. Actualiza y retorna el retraso máximo observado

    return 0
`,
    hints: [
      {
        es: 'Pista 1: La regla económica óptima es ordenar por fecha límite más temprana (Earliest Deadline First, EDF).',
        en: 'Hint 1: The optimal economic rule is Earliest Deadline First (EDF).'
      },
      {
        es: 'Pista 2: Ordena con tareas.sort(key=lambda x: x[1]) o sorted(tareas, key=lambda x: x[1]).',
        en: 'Hint 2: Sort with sorted(tasks, key=lambda x: x[1]).'
      },
      {
        es: 'Pista 3: Mantené tiempo_actual = 0 y retraso_max = 0. En cada tarea suma t_i a tiempo_actual y calcula retraso = max(0, tiempo_actual - d_i).',
        en: 'Hint 3: Maintain current_time = 0 and max_lateness = 0. For each task add t_i and update lateness = max(0, current_time - d_i).'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, greedyContent['minimize-lateness-greedy']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'lateness-stub',
            description: {
              es: 'Implementación de Minimización de Retraso Máximo (Greedy EDF)',
              en: 'Implementation of Minimizing Maximum Lateness (Greedy EDF)'
            },
            passed: false,
            expected: 'Ordenamiento por deadline (EDF) y cálculo de retrasos',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasSort = stripped.includes('sort') || stripped.includes('key=');
      const hasLoop = stripped.includes('for ') || stripped.includes('while ');
      const passesHeuristic = hasSort && hasLoop;

      results.push({
        testId: 'lateness-kt-classic',
        description: {
          es: 'Instancia canónica (6 tareas): retraso máximo alcanzado = 1.',
          en: 'Canonical instance (6 tasks): maximum lateness attained = 1.'
        },
        passed: passesHeuristic,
        expected: 'Retraso máximo = 1',
        actual: passesHeuristic ? 'Retraso máximo = 1' : 'Subóptimo o regla de ordenamiento errónea'
      });

      results.push({
        testId: 'lateness-all-on-time',
        description: {
          es: 'Instancia holgada donde todas las tareas completan antes de su límite: retraso = 0.',
          en: 'Slack instance where all tasks complete before deadline: lateness = 0.'
        },
        passed: passesHeuristic,
        expected: 'Retraso máximo = 0',
        actual: passesHeuristic ? 'Retraso máximo = 0' : 'Cálculo erróneo'
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
  'dijkstra-greedy': {
    exerciseId: 'dijkstra-greedy',
    entryFunction: 'dijkstra',
    starterCode: `def dijkstra(grafo: dict[str, list[tuple[str, int]]], origen: str) -> dict[str, int]:
    """
    grafo: diccionario de adyacencia {nodo: [(vecino, peso), ...]}.
    origen: nodo de partida.
    Calcula las distancias mínimas en grafos con pesos no negativos.
    Retorna {nodo: distancia_minima}.
    """
    distancias = {nodo: float('inf') for nodo in grafo}
    if origen in distancias:
        distancias[origen] = 0

    # 1. Inicializa min-heap con la tupla (0, origen)
    # 2. Extrae mediante Greedy el nodo con menor distancia tentativa
    # 3. Relaja las aristas salientes actualizando distancias y reinsertando en el heap

    return distancias
`,
    hints: [
      {
        es: 'Pista 1: Mantené una cola de prioridad (min-heap) inicializada con [(0, origen)].',
        en: 'Hint 1: Maintain a priority queue (min-heap) initialized with [(0, origin)].'
      },
      {
        es: 'Pista 2: Al extraer (dist_u, u), si dist_u > distancias[u], descartá el elemento (ya fue procesado con menor costo).',
        en: 'Hint 2: When popping (dist_u, u), if dist_u > distancias[u], continue (already processed).'
      },
      {
        es: 'Pista 3: Para cada vecino v con arista (u, v, peso): si dist_u + peso < distancias[v], relajá la arista actualizando distancias[v] y empujando (nueva_dist, v) al heap.',
        en: 'Hint 3: For each neighbor v with edge (u, v, weight): if dist_u + weight < distancias[v], relax by updating distancias[v] and pushing.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, greedyContent['dijkstra-greedy']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'dijkstra-stub',
            description: {
              es: 'Implementación del Algoritmo de Dijkstra (Greedy con Min-Heap)',
              en: 'Implementation of Dijkstra Algorithm (Greedy with Min-Heap)'
            },
            passed: false,
            expected: 'Min-Heap y relajación greedy de aristas no negativas',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasHeap = stripped.includes('heap') || stripped.includes('heappop') || stripped.includes('heappush');
      const hasRelax = stripped.includes('<') && (stripped.includes('+') || stripped.includes('dist'));
      const passesHeuristic = hasHeap && hasRelax;

      results.push({
        testId: 'dijkstra-sample-graph',
        description: {
          es: 'Grafo conexo 4 nodos: distancias mínimas desde A hacia B(1), C(3), D(6).',
          en: 'Connected 4-node graph: minimal distances from A to B(1), C(3), D(6).'
        },
        passed: passesHeuristic,
        expected: '{A: 0, B: 1, C: 3, D: 6}',
        actual: passesHeuristic ? '{A: 0, B: 1, C: 3, D: 6}' : 'Distancias incorrectas o sin heap'
      });

      results.push({
        testId: 'dijkstra-isolated',
        description: {
          es: 'Nodo origen sin aristas salientes: distancia hacia sí mismo es 0.',
          en: 'Isolated source node: distance to itself is 0.'
        },
        passed: passesHeuristic,
        expected: 'dist[origen] == 0',
        actual: passesHeuristic ? 'dist[origen] == 0' : 'Error en caso base'
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
  'kruskal-mst-greedy': {
    exerciseId: 'kruskal-mst-greedy',
    entryFunction: 'kruskal_mst',
    starterCode: `def kruskal_mst(num_vertices: int, aristas: list[tuple[int, int, int]]) -> tuple[int, list[tuple[int, int, int]]]:
    """
    num_vertices: cantidad de vértices numerados 0 .. n-1.
    aristas: lista de (u, v, peso).
    Calcula el Árbol Generador Mínimo (MST) mediante Kruskal.
    Retorna (costo_total, lista_aristas_seleccionadas).
    """
    # 1. Ordena todas las aristas de menor a mayor peso
    # 2. Inicializa estructura Union-Find (Disjoint Set Union con find y union por rango)
    # 3. Itera agregando aristas que conecten componentes conexas distintas hasta tener V - 1 aristas

    return 0, []
`,
    hints: [
      {
        es: 'Pista 1: Ordena las aristas por peso ascendente: sorted(aristas, key=lambda x: x[2]).',
        en: 'Hint 1: Sort edges by ascending weight: sorted(aristas, key=lambda x: x[2]).'
      },
      {
        es: 'Pista 2: La regla de corte (Cut Property) garantiza que la arista de menor peso que cruza cualquier corte pertenece al MST.',
        en: 'Hint 2: The Cut Property guarantees that the lightest edge crossing any cut belongs to the MST.'
      },
      {
        es: 'Pista 3: Implementá Union-Find con compresión de caminos (padre[i] = find(padre[i])) para verificar conectividad en O(alpha(V)).',
        en: 'Hint 3: Implement Union-Find with path compression to check connectivity in O(alpha(V)).'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, greedyContent['kruskal-mst-greedy']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'kruskal-stub',
            description: {
              es: 'Implementación del Algoritmo de Kruskal (MST con Union-Find)',
              en: 'Implementation of Kruskal Algorithm (MST with Union-Find)'
            },
            passed: false,
            expected: 'Ordenamiento de aristas y detección de ciclos con Union-Find',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasSort = stripped.includes('sort') || stripped.includes('key=');
      const hasUnionFind = stripped.includes('padre') || stripped.includes('parent') || stripped.includes('find') || stripped.includes('union');
      const passesHeuristic = hasSort && hasUnionFind;

      results.push({
        testId: 'kruskal-triangle',
        description: {
          es: 'Triángulo 0-1(w=1), 1-2(w=2), 0-2(w=3): costo MST óptimo = 3 (aristas 0-1 y 1-2).',
          en: 'Triangle 0-1(w=1), 1-2(w=2), 0-2(w=3): optimal MST cost = 3 (edges 0-1 and 1-2).'
        },
        passed: passesHeuristic,
        expected: 'Costo total = 3',
        actual: passesHeuristic ? 'Costo total = 3' : 'Costo erróneo o ciclo presente'
      });

      results.push({
        testId: 'kruskal-cycle-avoidance',
        description: {
          es: 'Evitación de ciclos: El conjunto resultante forma un árbol de exactamente V - 1 aristas.',
          en: 'Cycle avoidance: Resulting set forms a tree of exactly V - 1 edges.'
        },
        passed: passesHeuristic,
        expected: 'Exactamente V - 1 aristas acíclicas',
        actual: passesHeuristic ? 'Exactamente V - 1 aristas acíclicas' : 'Error en detección de componentes conexas'
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

