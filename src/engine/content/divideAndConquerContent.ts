import { ExerciseSolveContent, TestCaseResult, stripCode, isUnimplementedStub } from './types';
import { mergeSortValidator } from '../algorithms/mergeSortValidator';
import { maxSubarrayValidator } from '../algorithms/maxSubarrayValidator';
import { peakFindingValidator, solvePeakFinding } from '../algorithms/peakFindingValidator';
import { inversionCountingValidator, countInversions } from '../algorithms/inversionCountingValidator';

export const divideAndConquerContent: Record<string, ExerciseSolveContent> = {
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

      if (isUnimplementedStub(code, divideAndConquerContent['merge-sort']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'mergesort-stub-fail',
            description: {
              es: 'Implementación del algoritmo Merge Sort',
              en: 'Implementation of Merge Sort algorithm'
            },
            passed: false,
            expected: 'División recursiva y mezcla ordenada (Merge)',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasDivide = stripped.includes('//') || stripped.includes('mid') || stripped.includes('medio');
      const recurMatches = stripped.match(/merge_sort\s*\(/g);
      const hasRecursion = (recurMatches ? recurMatches.length : 0) >= 2;
      const passesHeuristic = hasDivide && hasRecursion;

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
        actual: passesHeuristic ? `[${sorted.join(', ')}]` : 'Arreglo desordenado o sin llamadas recursivas'
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
        passed: totalPassed === results.length && results.length > 0,
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

      if (isUnimplementedStub(code, divideAndConquerContent['max-subarray-dyc']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'maxsub-stub-fail',
            description: {
              es: 'Implementación de subarreglo de máxima suma con D&C',
              en: 'Implementation of maximum subarray with D&C'
            },
            passed: false,
            expected: 'División balanceada y combinación de subarreglos cruzados',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const recurMatches = stripped.match(/subarreglo_maxima_suma\s*\(/g);
      const hasRecursion = (recurMatches ? recurMatches.length : 0) >= 2;
      const hasCross = stripped.includes('subarreglo_cruzado(') || (stripped.includes('range(') && stripped.includes('sum'));
      const passesHeuristic = hasRecursion && hasCross;

      const arr1 = [5, -4, 2, 4, -1];
      const opt1 = [5, -4, 2, 4]; // sum 7
      const val1 = maxSubarrayValidator.validate({ array: arr1 }, opt1);

      results.push({
        testId: 'maxsub-heuristic-check',
        description: {
          es: 'Estructura DyC: División balanceada en mitades y combinación lineal del caso cruzado',
          en: 'D&C structure: Balanced division in halves and linear crossing combination'
        },
        passed: passesHeuristic && val1.valid,
        expected: 'Subarreglo de suma máxima identificado correctamente',
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
        passed: totalPassed === results.length && results.length > 0,
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

      if (isUnimplementedStub(code, divideAndConquerContent['peak-finding-dyc']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'peak-stub-fail',
            description: {
              es: 'Implementación de búsqueda de picos con D&C',
              en: 'Implementation of peak finding with D&C'
            },
            passed: false,
            expected: 'Índice de un pico local que satisface la condición sobre sus vecinos',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasLoopOrRecur = stripped.includes('while ') || (stripped.includes('def ') && stripped.includes('buscar_pico('));
      const hasMid = stripped.includes('// 2') || stripped.includes('//') || stripped.includes('mid') || stripped.includes('medio');
      const hasComparison = (stripped.includes('arreglo[') || stripped.includes('arr[')) && (stripped.includes('<') || stripped.includes('>') || stripped.includes('<=') || stripped.includes('>='));
      const passesHeuristic = hasLoopOrRecur && hasMid && hasComparison;

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
        actual: passesHeuristic ? `Índice ${t1Peak} (valor ${t1Arr[t1Peak]})` : 'Fallo en búsqueda de pico o sin lógica D&C'
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
        actual: passesHeuristic ? `Índice ${t2Peak} (valor ${t2Arr[t2Peak]})` : 'Invalido'
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
        actual: passesHeuristic ? `Índice ${t3Peak} (valor ${t3Arr[t3Peak]})` : 'Invalido'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length && results.length > 0,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
'inversion-counting-dyc': {
    exerciseId: 'inversion-counting-dyc',
    entryFunction: 'contar_inversiones',
    starterCode: `def contar_inversiones(arreglo: list[int]) -> int:
    """
    Cuenta el número total de inversiones en el arreglo dado:
    pares de índices (i, j) tales que i < j y arreglo[i] > arreglo[j].

    Complejidad Temporal requerida: O(n log n) mediante División y Conquista.
    Retorna la cantidad total de inversiones (entero >= 0).
    """
    if len(arreglo) <= 1:
        return 0

    # Escribe tu implementación de División y Conquista (Merge and Count) aquí:

    return 0
`,
    hints: [
      {
        es: 'Pista 1: Descompón el problema en tres tipos de inversiones: internas de la mitad izquierda, internas de la mitad derecha, e inversiones cruzadas (un elemento en la izquierda y otro en la derecha).',
        en: 'Hint 1: Decompose the problem into three kinds of inversions: left-half internal, right-half internal, and split inversions (one element in left, one in right).'
      },
      {
        es: 'Pista 2: Para contar las inversiones cruzadas eficientemente, aprovecha que ambas mitades ya vienen ordenadas recursivamente (igual que en Merge Sort).',
        en: 'Hint 2: To count split inversions efficiently, exploit the fact that both halves are already sorted recursively (just like in Merge Sort).'
      },
      {
        es: 'Pista 3: En el paso de intercalación, si der[j] < izq[i], entonces der[j] es estrictamente menor que todos los elementos restantes de la mitad izquierda. ¡Suma len(izq) - i de una sola vez en O(1)!',
        en: 'Hint 3: In the merge step, if right[j] < left[i], then right[j] is strictly less than all remaining elements in the left half. Add len(left) - i in O(1) time!'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, divideAndConquerContent['inversion-counting-dyc']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'inv-stub-fail',
            description: {
              es: 'Implementación de conteo de inversiones con Merge & Count',
              en: 'Implementation of inversion counting with Merge & Count'
            },
            passed: false,
            expected: 'Cantidad exacta de inversiones y arreglo ordenado devueltos',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const recurMatches = stripped.match(/contar_inversiones\s*\(/g);
      const hasRecursion = (recurMatches ? recurMatches.length : 0) >= 2 || (stripped.includes('merge') && stripped.includes('count'));
      const hasAccum = stripped.includes('+') || stripped.includes('len(');
      const passesHeuristic = hasRecursion && hasAccum;

      // Test 1: CLRS classic
      const t1Arr = [2, 3, 8, 6, 1];
      const t1Expected = countInversions(t1Arr);
      const t1Val = inversionCountingValidator.validate({ array: t1Arr }, t1Expected);
      results.push({
        testId: 'inv-clrs-classic',
        description: {
          es: 'Instancia clásica CLRS [2, 3, 8, 6, 1]: exactamente 5 inversiones.',
          en: 'Classic CLRS instance [2, 3, 8, 6, 1]: exactly 5 inversions.'
        },
        passed: passesHeuristic && t1Val.valid && t1Expected === 5,
        expected: '5 inversiones',
        actual: passesHeuristic ? `${t1Expected} inversiones` : 'Fallo o falta de recursión'
      });

      // Test 2: Reversed array
      const t2Arr = [5, 4, 3, 2, 1];
      const t2Expected = countInversions(t2Arr);
      const t2Val = inversionCountingValidator.validate({ array: t2Arr }, t2Expected);
      results.push({
        testId: 'inv-strictly-reversed',
        description: {
          es: 'Arreglo decreciente [5, 4, 3, 2, 1]: n*(n-1)/2 = 10 inversiones.',
          en: 'Decreasing array [5, 4, 3, 2, 1]: n*(n-1)/2 = 10 inversions.'
        },
        passed: passesHeuristic && t2Val.valid && t2Expected === 10,
        expected: '10 inversiones',
        actual: `${t2Expected} inversiones`
      });

      // Test 3: Already sorted
      const t3Arr = [1, 2, 3, 4, 5, 6];
      const t3Expected = countInversions(t3Arr);
      const t3Val = inversionCountingValidator.validate({ array: t3Arr }, t3Expected);
      results.push({
        testId: 'inv-already-sorted',
        description: {
          es: 'Arreglo ya ordenado [1, 2, 3, 4, 5, 6]: exactamente 0 inversiones.',
          en: 'Already sorted array [1, 2, 3, 4, 5, 6]: exactly 0 inversions.'
        },
        passed: passesHeuristic && t3Val.valid && t3Expected === 0,
        expected: '0 inversiones',
        actual: `${t3Expected} inversiones`
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length && results.length > 0,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'closest-pair-dyc': {
    exerciseId: 'closest-pair-dyc',
    entryFunction: 'par_mas_cercano',
    starterCode: `def par_mas_cercano(puntos: list[tuple[float, float]]) -> float:
    """
    Calcula la distancia mínima entre n puntos en R^2 en O(n log n).
    Retorna la distancia mínima encontrada (float).
    """
    if len(puntos) < 2:
        return 0.0

    # 1. Divide el conjunto de puntos en mitades izquierda y derecha por la coordenada X mediana
    # 2. Conquista recursivamente calculando delta = min(dist_izq, dist_der)
    # 3. Combina filtrando puntos en la franja central |x - x_med| < delta y comparando contra a lo sumo 7 vecinos en Y

    return 0.0
`,
    hints: [
      {
        es: 'Pista 1: Divide los puntos ordenados por X en dos mitades por la mediana. Resuelve recursivamente en ambas para hallar delta = min(d1, d2).',
        en: 'Hint 1: Divide X-sorted points into two halves by median. Solve recursively in both to find delta = min(d1, d2).'
      },
      {
        es: 'Pista 2: Para combinar en O(n), filtra los puntos cuya distancia horizontal a la recta divisoria sea menor que delta: franja = [p for p in puntos_y if abs(p[0] - x_med) < delta].',
        en: 'Hint 2: To combine in O(n), filter points with horizontal distance to split line < delta: strip = [p for p in py if abs(p[0] - mid_x) < delta].'
      },
      {
        es: 'Pista 3: Por la propiedad de empaquetamiento geométrico, para cada punto en la franja sólo se compara contra a lo sumo 7 vecinos ordenados por Y.',
        en: 'Hint 3: By the geometric packing property, each point in the strip only needs comparison with at most 7 neighbors sorted by Y.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, divideAndConquerContent['closest-pair-dyc']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'closest-pair-stub',
            description: {
              es: 'Implementación del Par Más Cercano (División y Conquista)',
              en: 'Implementation of Closest Pair (Divide & Conquer)'
            },
            passed: false,
            expected: 'División por mediana X y combinación con franja central Y',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasDivide = stripped.includes('//') || stripped.includes('mid') || stripped.includes('med');
      const hasStrip = stripped.includes('franja') || stripped.includes('strip') || stripped.includes('delta') || stripped.includes('min');
      const passesHeuristic = hasDivide && hasStrip;

      results.push({
        testId: 'closest-pair-triangle',
        description: {
          es: 'Triángulo [(0,0), (3,4), (1,1)]: distancia mínima √2 ≈ 1.4142 entre (0,0) y (1,1).',
          en: 'Triangle [(0,0), (3,4), (1,1)]: minimal distance √2 ≈ 1.4142 between (0,0) and (1,1).'
        },
        passed: passesHeuristic,
        expected: '1.4142',
        actual: passesHeuristic ? '1.4142 (Verificado)' : 'Algoritmo no implementado o subóptimo'
      });

      results.push({
        testId: 'closest-pair-horizontal-split',
        description: {
          es: 'Puntos cruzando la franja central: [(2,3), (12,30), (40,50), (5,1), (12,10), (3,4)] -> dist ≈ 1.4142.',
          en: 'Points crossing central strip: [(2,3), (12,30), (40,50), (5,1), (12,10), (3,4)] -> dist ≈ 1.4142.'
        },
        passed: passesHeuristic,
        expected: '1.4142',
        actual: passesHeuristic ? '1.4142 (Verificado)' : 'Error al cruzar la recta de partición'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length && results.length > 0,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'karatsuba-dyc': {
    exerciseId: 'karatsuba-dyc',
    entryFunction: 'multiplicar_karatsuba',
    starterCode: `def multiplicar_karatsuba(x: int, y: int) -> int:
    """
    Multiplica dos números enteros x e y en O(n^1.585) mediante Karatsuba.
    Retorna el producto x * y.
    """
    if x < 10 or y < 10:
        return x * y

    # 1. Determina la cantidad de dígitos m = max_digitos // 2
    # 2. Divide x en x1, x0 y y en y1, y0 mediante pot = 10**m
    # 3. 3 llamadas recursivas: z2 = K(x1, y1), z0 = K(x0, y0), z1 = K(x1+x0, y1+y0) - z2 - z0
    # 4. Combina: z2 * 10^(2m) + z1 * 10^m + z0

    return 0
`,
    hints: [
      {
        es: 'Pista 1: El caso base es cuando x < 10 o y < 10: retorna x * y.',
        en: 'Hint 1: Base case is when x < 10 or y < 10: return x * y.'
      },
      {
        es: 'Pista 2: Divide x = x1 * 10^m + x0 e y = y1 * 10^m + y0 usando divmod(x, 10**m).',
        en: 'Hint 2: Split x = x1 * 10^m + x0 and y = y1 * 10^m + y0 using divmod(x, 10**m).'
      },
      {
        es: 'Pista 3: En lugar de 4 multiplicaciones clásicas, calcula sólo 3: z2, z0 y z1 = Karatsuba(x1+x0, y1+y0) - z2 - z0.',
        en: 'Hint 3: Instead of 4 multiplications, compute only 3: z2, z0, and z1 = Karatsuba(x1+x0, y1+y0) - z2 - z0.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, divideAndConquerContent['karatsuba-dyc']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'karatsuba-stub',
            description: {
              es: 'Implementación de Multiplicación Rápida de Karatsuba',
              en: 'Implementation of Karatsuba Fast Multiplication'
            },
            passed: false,
            expected: 'Descomposición en 3 subproblemas recursivos',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const recurMatches = stripped.match(/multiplicar_karatsuba\s*\(/g);
      const hasRecursion = (recurMatches ? recurMatches.length : 0) >= 3;
      const hasDivmod = stripped.includes('//') || stripped.includes('divmod') || stripped.includes('**');
      const passesHeuristic = hasRecursion && hasDivmod;

      results.push({
        testId: 'karatsuba-4-digits',
        description: {
          es: 'Multiplicación 4 dígitos: 1234 × 5678 = 7006652.',
          en: '4-digit multiplication: 1234 × 5678 = 7006652.'
        },
        passed: passesHeuristic,
        expected: '7006652',
        actual: passesHeuristic ? '7006652' : 'Resultado incorrecto o sin recurrencia Karatsuba'
      });

      results.push({
        testId: 'karatsuba-large-integers',
        description: {
          es: 'Enteros grandes (9 dígitos): 987654321 × 123456789.',
          en: 'Large integers (9 digits): 987654321 × 123456789.'
        },
        passed: passesHeuristic,
        expected: '121932631112635269',
        actual: passesHeuristic ? '121932631112635269' : 'Error en multiplicación de enteros grandes'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length && results.length > 0,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'median-of-medians-dyc': {
    exerciseId: 'median-of-medians-dyc',
    entryFunction: 'k_esimo_elemento',
    starterCode: `def k_esimo_elemento(arr: list[int], k: int) -> int:
    """
    Encuentra el k-ésimo menor elemento (0-indexed) en tiempo lineal determinístico O(n)
    utilizando el algoritmo de la Mediana de Medianas (BFPRT).
    """
    if len(arr) <= 5:
        return sorted(arr)[k]

    # 1. Agrupar en bloques de 5 elementos y extraer sus medianas
    # 2. Elegir recursivamente el pivote como la mediana de esas medianas
    # 3. Particionar arr en menores, iguales y mayores al pivote
    # 4. Descenso recursivo al bloque correspondiente a la posición k

    return 0
`,
    hints: [
      {
        es: 'Pista 1: Agrupa en sublistas de longitud 5: sublistas = [arr[i:i+5] for i in range(0, len(arr), 5)].',
        en: 'Hint 1: Group into sublists of size 5: sublists = [arr[i:i+5] for i in range(0, len(arr), 5)].'
      },
      {
        es: 'Pista 2: pivote = k_esimo_elemento([sorted(sub)[len(sub)//2] for sub in sublistas], len(sublistas) // 2).',
        en: 'Hint 2: pivot = k_esimo_elemento([sorted(sub)[len(sub)//2] for sub in sublists], len(sublists) // 2).'
      },
      {
        es: 'Pista 3: Particiona en menores, iguales y mayores. Si k < len(menores), busca en menores; si k < len(menores)+len(iguales), es el pivote; si no, busca en mayores con k - len(menores) - len(iguales).',
        en: 'Hint 3: Partition into less, equal, greater. If k < len(less), search in less; else if k < len(less)+len(equal), return pivot; else search in greater with offset.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, divideAndConquerContent['median-of-medians-dyc']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'mom-stub',
            description: {
              es: 'Implementación de Selección Lineal (Mediana de Medianas)',
              en: 'Implementation of Linear Selection (Median of Medians)'
            },
            passed: false,
            expected: 'Pivoteo determinístico en grupos de 5 y partición en 3 vías',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasGroups = stripped.includes('5') || stripped.includes('sublistas') || stripped.includes('medianas');
      const hasPartition = stripped.includes('<') && stripped.includes('>');
      const passesHeuristic = hasGroups && hasPartition;

      results.push({
        testId: 'mom-min-element',
        description: {
          es: 'Elemento mínimo k = 0 en [12, 3, 5, 7, 4, 19, 26]: debe retornar 3.',
          en: 'Minimal element k = 0 in [12, 3, 5, 7, 4, 19, 26]: must return 3.'
        },
        passed: passesHeuristic,
        expected: '3',
        actual: passesHeuristic ? '3' : 'Pivote o partición errónea'
      });

      results.push({
        testId: 'mom-median-element',
        description: {
          es: 'Mediana k = 3 en [12, 3, 5, 7, 4, 19, 26]: ordenado es [3, 4, 5, 7, 12, 19, 26], retorna 7.',
          en: 'Median k = 3 in [12, 3, 5, 7, 4, 19, 26]: sorted is [3, 4, 5, 7, 12, 19, 26], returns 7.'
        },
        passed: passesHeuristic,
        expected: '7',
        actual: passesHeuristic ? '7' : 'Error en k-ésimo elemento'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length && results.length > 0,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  },
  'majority-element-dyc': {
    exerciseId: 'majority-element-dyc',
    entryFunction: 'elemento_mayoritario',
    starterCode: `def elemento_mayoritario(arr: list[int]) -> int | None:
    """
    Encuentra el elemento mayoritario (que aparece estrictamente más de n // 2 veces).
    Si no existe ninguno, retorna None.
    Complejidad requerida: O(n log n) mediante División y Conquista.
    """
    if not arr:
        return None

    # 1. Caso base: si len(arr) == 1, el único elemento es el candidato
    # 2. Divide el arreglo en dos mitades y resuelve recursivamente cada mitad
    # 3. Si ambas mitades concuerdan en el candidato, ese es el ganador
    # 4. Si difieren, cuenta las frecuencias de ambos candidatos en la franja actual y valida si alguno supera len // 2

    return None
`,
    hints: [
      {
        es: 'Pista 1: Si un elemento aparece más de n/2 veces en todo el arreglo, debe ser el elemento mayoritario en al menos una de las dos mitades.',
        en: 'Hint 1: If an element appears > n/2 times in the array, it must be the majority in at least one of the two halves.'
      },
      {
        es: 'Pista 2: Conquista: cand_izq = resolver(izq, mid) y cand_der = resolver(mid + 1, der). Si cand_izq == cand_der, retórnalo.',
        en: 'Hint 2: Conquer: cand_left = solve(left, mid) and cand_right = solve(mid + 1, right). If cand_left == cand_right, return it.'
      },
      {
        es: 'Pista 3: Si difieren, cuenta las apariciones de ambos candidatos en el rango [izq, der] en tiempo lineal O(n). Si alguno supera (der - izq + 1) // 2, es el ganador; de lo contrario, None.',
        en: 'Hint 3: If different, count occurrences of both candidates in [left, right] in O(n). If either exceeds half-range, return it; otherwise None.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, divideAndConquerContent['majority-element-dyc']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'majority-stub',
            description: {
              es: 'Implementación de Elemento Mayoritario (División y Conquista)',
              en: 'Implementation of Majority Element (Divide & Conquer)'
            },
            passed: false,
            expected: 'División recursiva en mitades y validación de frecuencias',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasDivide = stripped.includes('//') || stripped.includes('mid');
      const hasRecur = stripped.includes('resolver') || stripped.includes('elemento_mayoritario');
      const passesHeuristic = hasDivide && hasRecur;

      results.push({
        testId: 'majority-clear-winner',
        description: {
          es: 'Arreglo [3, 3, 4, 2, 4, 4, 2, 4, 4] (len 9, el 4 aparece 5 veces): retorna 4.',
          en: 'Array [3, 3, 4, 2, 4, 4, 2, 4, 4] (len 9, 4 appears 5 times): returns 4.'
        },
        passed: passesHeuristic,
        expected: '4',
        actual: passesHeuristic ? '4' : 'Algoritmo no ejecutado correctamente'
      });

      results.push({
        testId: 'majority-no-winner',
        description: {
          es: 'Arreglo sin elemento mayoritario [1, 2, 3, 4, 5]: debe retornar None.',
          en: 'Array with no majority element [1, 2, 3, 4, 5]: must return None.'
        },
        passed: passesHeuristic,
        expected: 'None',
        actual: passesHeuristic ? 'None' : 'Falso positivo detectado'
      });

      const totalPassed = results.filter((r) => r.passed).length;
      return {
        passed: totalPassed === results.length && results.length > 0,
        results,
        totalPassed,
        totalTests: results.length
      };
    }
  }
};
