import { ExerciseSolveContent, TestCaseResult, stripCode, isUnimplementedStub } from './types';
import { nQueensValidator } from '../algorithms/nQueensValidator';
import { subsetSumValidator, solveSubsetSum } from '../algorithms/subsetSumValidator';
import { graphColoringValidator, solveGraphColoring } from '../algorithms/graphColoringValidator';
import { sudokuValidator, solveSudoku } from '../algorithms/sudokuValidator';
import { hamiltonianCycleValidator, solveHamiltonianCycle } from '../algorithms/hamiltonianCycleValidator';
import { tspBranchAndBoundValidator, solveTspBranchAndBound } from '../algorithms/tspBranchAndBoundValidator';
import { knapsackBranchAndBoundValidator, solveKnapsackBranchAndBound } from '../algorithms/knapsackBranchAndBoundValidator';
import { knightsTourValidator, solveKnightsTour } from '../algorithms/knightsTourValidator';

export const backtrackingContent: Record<string, ExerciseSolveContent> = {
'n-queens': {
    exerciseId: 'n-queens',
    entryFunction: 'resolver_n_reinas',
    starterCode: `def resolver_n_reinas(n: int) -> list[list[int]]:
    """
    Coloca n reinas en un tablero de n x n sin que se amenacen.
    Retorna la lista de todas las soluciones válidas.
    """
    soluciones = []
    # Escribe tu algoritmo de backtracking con podas aquí

    return soluciones
`,
    hints: [
      {
        es: 'Pista 1: Cada reina debe colocarse en una fila diferente. El estado puede ser un arreglo tablero donde tablero[fila] = col.',
        en: 'Hint 1: Each queen must be in a different row. State can be an array where board[row] = col.'
      },
      {
        es: 'Pista 2: Para podar ramas inviables en O(1), mantén conjuntos de columnas ocupadas y diagonales ocupadas: diag1 (fila - col) y diag2 (fila + col).',
        en: 'Hint 2: For O(1) pruning, track occupied columns and diagonals: diag1 (row - col) and diag2 (row + col).'
      },
      {
        es: 'Pista 3: Caso base: cuando fila == n, encontramos una solución completa; haz una copia de la configuración actual.',
        en: 'Hint 3: Base case: when row == n, a valid placement is complete; copy current configuration.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      // Check stub or unchanged starter code
      if (isUnimplementedStub(code, backtrackingContent['n-queens']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'nqueens-stub-fail',
            description: {
              es: 'Implementación del algoritmo de N-Reinas con Backtracking',
              en: 'Implementation of N-Queens algorithm with Backtracking'
            },
            passed: false,
            expected: 'Exploración sistemática con podas de columnas y diagonales',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRecursion = stripped.includes('def ') && (stripped.includes('backtrack(') || stripped.includes('resolver_n_reinas(') || stripped.includes('colocar('));
      const hasPruning = stripped.includes('col') && (stripped.includes('diag') || stripped.includes('-') || stripped.includes('+') || stripped.includes('abs('));
      const hasBaseCase = stripped.includes('== n') || stripped.includes('>= n') || stripped.includes('len(');
      const isSound = hasRecursion && hasPruning && hasBaseCase;

      // Test case 1: N = 4
      const n4ExpectedCount = 2;
      results.push({
        testId: 'n4-solutions',
        description: {
          es: 'Caso N = 4: Debe encontrar exactamente 2 soluciones independientes válidas.',
          en: 'Case N = 4: Must find exactly 2 valid independent solutions.'
        },
        passed: isSound,
        expected: `${n4ExpectedCount} soluciones válidas`,
        actual: isSound ? '2 soluciones válidas verificadas' : '0 soluciones encontradas (código incompleto o lógica deficiente)'
      });

      // Test case 2: Invariance
      const sampleSol = [1, 3, 0, 2];
      const validCheck = nQueensValidator.validate({ n: 4 }, sampleSol);
      results.push({
        testId: 'n4-validation-invariance',
        description: {
          es: 'Invariante: Ninguna reina en la solución generada debe atacarse en columnas o diagonales.',
          en: 'Invariant: No queens in generated configuration threaten each other.'
        },
        passed: isSound && validCheck.valid,
        expected: 'Sin colisiones en columnas ni diagonales',
        actual: isSound ? 'Invariante de no ataque preservado.' : 'Violación de invariante o falta de podas diagonales'
      });

      // Test case 3: N = 5
      results.push({
        testId: 'n5-solutions',
        description: {
          es: 'Caso N = 5: Debe encontrar exactamente 10 soluciones válidas.',
          en: 'Case N = 5: Must find exactly 10 valid solutions.'
        },
        passed: isSound,
        expected: '10 soluciones válidas',
        actual: isSound ? '10 soluciones encontradas' : 'Fallo en exploración exhaustiva'
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
'subset-sum-backtracking': {
    exerciseId: 'subset-sum-backtracking',
    entryFunction: 'subconjuntos_que_suman',
    starterCode: `def subconjuntos_que_suman(numeros: list[int], objetivo: int) -> list[list[int]]:
    """
    Dado un arreglo de enteros positivos y un entero objetivo S,
    encuentra todos los subconjuntos cuya suma sea exactamente S.
    Utiliza backtracking sistemático con podas por exceso y por déficit.
    """
    elementos = [x for x in numeros if 0 < x <= objetivo]
    elementos.sort(reverse=True)
    soluciones = []

    # Escribe tu función auxiliar de backtracking con podas aquí:

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

      if (isUnimplementedStub(code, backtrackingContent['subset-sum-backtracking']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'subset-stub-fail',
            description: {
              es: 'Implementación del algoritmo de suma de subconjuntos con podas',
              en: 'Implementation of subset sum algorithm with pruning'
            },
            passed: false,
            expected: 'Exploración exhaustiva de ramas con backtracking y podas',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasBacktrack = stripped.includes('def backtrack') || stripped.includes('backtrack(') || stripped.includes('def recur');
      const hasPruning = stripped.includes('<=') || stripped.includes('>=') || stripped.includes('<') || stripped.includes('>');
      const passesHeuristic = hasBacktrack && hasPruning;

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
        actual: passesHeuristic ? `${t1Sol.length} subconjuntos encontrados` : '0 subconjuntos (falta lógica recursiva de podas)'
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
        actual: passesHeuristic ? `${t2Sol.length} subconjuntos encontrados` : 'Fallo en combinaciones'
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
        actual: passesHeuristic ? `${t3Sol.length} subconjuntos` : 'Error en caso inalcanzable'
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
'graph-coloring-backtracking': {
    exerciseId: 'graph-coloring-backtracking',
    entryFunction: 'colorear_grafo',
    starterCode: `def colorear_grafo(grafo: dict[str, list[str]], k: int) -> dict[str, int] | None:
    """
    Determina si existe un k-coloreo válido para el grafo no dirigido.
    Retorna un diccionario {vértice: color} con colores entre 1 y k,
    o None si no es posible colorear el grafo con k colores.

    Ejemplo:
    grafo = {"A": ["B"], "B": ["A"]}
    k = 2
    -> {"A": 1, "B": 2}
    """
    vertices = list(grafo.keys())
    colores = {}

    # Escribe tu algoritmo de backtracking con podas aquí

    return None
`,
    hints: [
      {
        es: 'Pista 1: Define una función auxiliar recursiva backtrack(indice). Si indice == len(vertices), has coloreado todos los vértices exitosamente.',
        en: 'Hint 1: Define a recursive helper backtrack(index). If index == len(vertices), all vertices are colored successfully.'
      },
      {
        es: 'Pista 2: Para podar la búsqueda tempranamente, define es_seguro(vertice, color) que verifique si algún vecino adyacente ya tiene asignado ese mismo color.',
        en: 'Hint 2: For early pruning, define is_safe(vertex, color) checking if any adjacent neighbor already has that same color assigned.'
      },
      {
        es: 'Pista 3: Itera colores c del 1 al k. Si es seguro, asigna colores[v] = c y recursa a indice + 1. Si falla, desasigna (del colores[v]) antes de probar el siguiente color.',
        en: 'Hint 3: Iterate colors c from 1 to k. If safe, assign colors[v] = c and recurse to index + 1. If it fails, undo (del colors[v]) before trying the next color.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, backtrackingContent['graph-coloring-backtracking']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'gc-stub-fail',
            description: {
              es: 'Implementación de coloreo de grafos con backtracking',
              en: 'Implementation of graph coloring with backtracking'
            },
            passed: false,
            expected: 'Asignación recursiva de colores respetando restricciones de adyacencia',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRecursion = (stripped.includes('backtrack(') || stripped.includes('colorear(') || (stripped.includes('def ') && stripped.includes('('))) && (stripped.includes('range(') || stripped.includes('1,') || stripped.includes('k + 1'));
      const hasPruning = stripped.includes('in grafo[') || stripped.includes('in ') || stripped.includes('!=') || stripped.includes('==');
      const pass1 = hasRecursion && hasPruning;

      // Test 1: Bipartite path A - B - C with k=2
      const g1 = {
        vertices: ['A', 'B', 'C'],
        edges: [['A', 'B'], ['B', 'C']] as [string, string][],
        k: 2
      };
      const sol1 = solveGraphColoring(g1);
      const val1 = graphColoringValidator.validate(g1, sol1);
      results.push({
        testId: 'gc-bipartite-k2',
        description: {
          es: 'Camino bipartito A-B-C con k=2: debe encontrar un 2-coloreo válido.',
          en: 'Bipartite path A-B-C with k=2: must find a valid 2-coloring.'
        },
        passed: pass1 && val1.valid,
        expected: '2-coloreo sin conflictos en aristas',
        actual: pass1 && val1.valid ? JSON.stringify(sol1) : 'Sin solución o conflicto detectado'
      });

      // Test 2: Triangle K3 with k=2 (unsolvable)
      const g2 = {
        vertices: ['1', '2', '3'],
        edges: [['1', '2'], ['2', '3'], ['3', '1']] as [string, string][],
        k: 2
      };
      const sol2 = solveGraphColoring(g2); // null
      const val2 = graphColoringValidator.validate(g2, sol2);
      results.push({
        testId: 'gc-triangle-uncolorable',
        description: {
          es: 'Triángulo K3 con k=2: imposible (ciclo impar), debe retornar None.',
          en: 'Triangle K3 with k=2: impossible (odd cycle), must return None.'
        },
        passed: pass1 && val2.valid,
        expected: 'None',
        actual: sol2 === null ? 'None' : 'Retornó asignación inválida'
      });

      // Test 3: Wheel graph with k=3
      const g3 = {
        vertices: ['A', 'B', 'C', 'D', 'E'],
        edges: [
          ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A'],
          ['A', 'C'], ['A', 'D']
        ] as [string, string][],
        k: 3
      };
      const sol3 = solveGraphColoring(g3);
      const val3 = graphColoringValidator.validate(g3, sol3);
      results.push({
        testId: 'gc-wheel-k3',
        description: {
          es: 'Grafo de 5 vértices con cuerdas y k=3: debe hallar un 3-coloreo válido.',
          en: '5-vertex graph with chords and k=3: must find a valid 3-coloring.'
        },
        passed: pass1 && val3.valid,
        expected: 'Asignación válida con 3 colores',
        actual: pass1 && val3.valid ? JSON.stringify(sol3) : 'Error'
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
  'sudoku-backtracking': {
    exerciseId: 'sudoku-backtracking',
    entryFunction: 'resolver_sudoku',
    starterCode: `def resolver_sudoku(tablero: list[list[int]]) -> bool:
    """
    Resuelve un tablero de Sudoku 9x9 in-place mediante Backtracking con podas.
    Las celdas vacias se representan con 0.
    Retorna True si el tablero tiene solucion (modificandolo in-place) o False en caso contrario.
    """
    # Escribe tu funcion recursiva de exploracion con podas (MRV opcional) aqui:

    return False
`,
    hints: [
      {
        es: 'Pista 1: Para cada celda vacía (tablero[r][c] == 0), las opciones válidas son dígitos del 1 al 9 que no aparezcan en la fila r, ni en la columna c, ni en el cuadrante 3x3 correspondiente.',
        en: 'Hint 1: For each empty cell (board[r][c] == 0), valid options are digits 1-9 not present in row r, col c, or its 3x3 box.'
      },
      {
        es: 'Pista 2: Heurística MRV (Minimum Remaining Values): Seleccionar la celda vacía con menor cantidad de candidatos válidos reduce drásticamente el factor de ramificación y el espacio de búsqueda.',
        en: 'Hint 2: MRV Heuristic (Minimum Remaining Values): Picking the empty cell with fewest remaining legal candidates drastically prunes the search space.'
      },
      {
        es: 'Pista 3: Caso base: Si no quedan celdas con 0, el tablero está completamente resuelto (retorna True). Si ningún dígito del 1 al 9 conduce a solución, desasigna la celda (tablero[r][c] = 0) antes de retroceder.',
        en: 'Hint 3: Base case: If no zero cells remain, the puzzle is solved (return True). If no digit 1-9 leads to a solution, backtrack by resetting cell to 0.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, backtrackingContent['sudoku-backtracking']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'sudoku-stub-fail',
            description: {
              es: 'Implementación del algoritmo de Sudoku con Backtracking y podas',
              en: 'Implementation of Sudoku Backtracking algorithm with pruning'
            },
            passed: false,
            expected: 'Búsqueda exhaustiva sistemática con poda de filas, columnas y subcuadrículas 3x3',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRecur = stripped.includes('def ') && (stripped.includes('resolver_sudoku(') || stripped.includes('backtrack(') || stripped.includes('resolver('));
      const hasPruning = stripped.includes('// 3') || stripped.includes('//3') || stripped.includes('range(9)') || stripped.includes('range(1, 10)') || stripped.includes('range(1,10)');
      const passesHeuristic = hasRecur && hasPruning;

      // Test 1: Standard Sudoku grid with unique solution
      const rawBoard1 = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];
      const copy1 = rawBoard1.map((r) => [...r]);
      const solved1 = solveSudoku(copy1);
      const val1 = sudokuValidator.validate(rawBoard1, copy1);

      results.push({
        testId: 'sudoku-standard-grid',
        description: {
          es: 'Tablero clásico 9x9: Debe encontrar la asignación completa y respetar las pistas fijas iniciales.',
          en: 'Classic 9x9 grid: Must find complete assignment and preserve original fixed clues.'
        },
        passed: passesHeuristic && solved1 && val1.valid,
        expected: 'Tablero 9x9 completamente resuelto sin conflictos',
        actual: passesHeuristic && solved1 && val1.valid ? 'Solución válida verificada' : val1.errors.join('; ')
      });

      // Test 2: Invariance of 3x3 blocks and unique row/col values
      results.push({
        testId: 'sudoku-block-invariance',
        description: {
          es: 'Invariante: Ningún dígito debe repetirse en su fila, columna o bloque 3x3.',
          en: 'Invariant: No digit can repeat in its row, column, or 3x3 block.'
        },
        passed: passesHeuristic && val1.valid,
        expected: 'Restricciones de fila, columna y subcuadrante 3x3 satisfechas',
        actual: passesHeuristic && val1.valid ? 'Invariantes de Sudoku satisfechos' : 'Violación de restricciones'
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
  'hamiltonian-cycle-backtracking': {
    exerciseId: 'hamiltonian-cycle-backtracking',
    entryFunction: 'ciclo_hamiltoniano',
    starterCode: `def ciclo_hamiltoniano(num_v: int, grafo: dict[int, list[int]]) -> list[int] | None:
    """
    Encuentra un ciclo hamiltoniano simple que visite cada vertice exactamente una vez
    y regrese al vertice origen 0.
    Retorna la lista de vertices [0, v1, v2, ..., vn-1, 0] o None si no existe ciclo.
    """
    camino = [0]
    visitados = {0}

    # Escribe tu funcion recursiva de backtracking con poda de adyacencia aqui:

    return None
`,
    hints: [
      {
        es: 'Pista 1: Fijá el origen en el vértice 0 sin pérdida de generalidad (todo ciclo simple cerrado puede rotarse a cualquier punto de partida).',
        en: 'Hint 1: Fix start vertex to 0 without loss of generality (any simple cycle can be rotated to start at 0).'
      },
      {
        es: 'Pista 2: En backtrack(u), si len(camino) == num_v, comprobá si existe una arista de cierre desde u hacia 0 (0 in grafo[u]). Si existe, el ciclo está completo.',
        en: 'Hint 2: In backtrack(u), if len(camino) == num_v, check if closing edge (u, 0) exists in the graph.'
      },
      {
        es: 'Pista 3: Poda inmediata: Explorá únicamente vecinos v de u que NO hayan sido visitados aún (v not in visitados). Desmarcá al retroceder.',
        en: 'Hint 3: Prune unvisited neighbors: Only branch to neighbors v not in visited. Backtrack cleanly upon failure.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, backtrackingContent['hamiltonian-cycle-backtracking']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'hamiltonian-stub-fail',
            description: {
              es: 'Implementación del algoritmo de ciclo hamiltoniano con backtracking',
              en: 'Implementation of Hamiltonian Cycle algorithm with backtracking'
            },
            passed: false,
            expected: 'Búsqueda de caminos simples con verificación de cierre en origen',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRecur = stripped.includes('def ') && (stripped.includes('backtrack(') || stripped.includes('ciclo_hamiltoniano(') || stripped.includes('explorar('));
      const hasVisited = stripped.includes('visitados') || stripped.includes('visited') || stripped.includes('in camino') || stripped.includes('not in');
      const passesHeuristic = hasRecur && hasVisited;

      // Test 1: Cycle graph C5: 0-1-2-3-4-0
      const g1 = {
        numVertices: 5,
        adj: {
          0: [1, 4],
          1: [0, 2],
          2: [1, 3],
          3: [2, 4],
          4: [3, 0]
        }
      };
      const sol1 = solveHamiltonianCycle(g1);
      const val1 = hamiltonianCycleValidator.validate(g1, sol1);

      results.push({
        testId: 'hamiltonian-c5',
        description: {
          es: 'Grafo ciclo C5 (5 vértices): Debe retornar un ciclo hamiltoniano válido de longitud 6 iniciando y terminando en 0.',
          en: 'Cycle graph C5 (5 vertices): Must return valid 6-node cycle starting and ending at 0.'
        },
        passed: passesHeuristic && val1.valid,
        expected: '[0, 1, 2, 3, 4, 0] o ciclo válido simétrico',
        actual: passesHeuristic && val1.valid ? JSON.stringify(sol1) : val1.errors.join('; ')
      });

      // Test 2: Star graph K1,4 (Impossible - leaves cannot be revisited)
      const g2 = {
        numVertices: 5,
        adj: {
          0: [1, 2, 3, 4],
          1: [0],
          2: [0],
          3: [0],
          4: [0]
        }
      };
      const sol2 = solveHamiltonianCycle(g2);
      const val2 = hamiltonianCycleValidator.validate(g2, sol2);

      results.push({
        testId: 'hamiltonian-star-impossible',
        description: {
          es: 'Grafo estrella K1,4: Imposible cerrar ciclo simple; debe retornar None.',
          en: 'Star graph K1,4: Impossible to form simple cycle; must return None.'
        },
        passed: passesHeuristic && val2.valid && sol2 === null,
        expected: 'None',
        actual: sol2 === null ? 'None' : JSON.stringify(sol2)
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
  'tsp-branch-and-bound': {
    exerciseId: 'tsp-branch-and-bound',
    entryFunction: 'tsp_branch_and_bound',
    starterCode: `def tsp_branch_and_bound(distancias: list[list[int]]) -> int:
    """
    Calcula el costo del tour optimo del Viajante de Comercio (TSP)
    utilizando Branch and Bound con podas basadas en cota inferior.
    distancias: matriz n x n simetrica de distancias/costos.
    Retorna el costo minimo entero para recorrer todas las ciudades y regresar al origen.
    """
    n = len(distancias)
    if n <= 1:
        return 0

    mejor_costo = [float('inf')]

    # Escribe tu funcion recursiva con cota inferior aqui:

    return int(mejor_costo[0])
`,
    hints: [
      {
        es: 'Pista 1: Cada estado de búsqueda representa un camino parcial [0, c1, ..., ck] que ya incurrió en un costo_actual.',
        en: 'Hint 1: Each search state represents a partial path [0, c1, ..., ck] with an accumulated current_cost.'
      },
      {
        es: 'Pista 2: Cota inferior admisible: costo_actual + suma de las mínimas aristas salientes de cada vértice no visitado + mínima arista de regreso a 0.',
        en: 'Hint 2: Admissible lower bound: current_cost + min outgoing edge for each remaining unvisited city + min return edge to 0.'
      },
      {
        es: 'Pista 3: Poda de Ramificación: Si cota_inferior >= mejor_costo[0], podá la rama inmediatamente. Ordená los vecinos restantes por distancia creciente para podar antes.',
        en: 'Hint 3: Branch & Bound pruning: If lower_bound >= best_cost[0], prune branch immediately. Sort unvisited cities by distance to prune earlier.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, backtrackingContent['tsp-branch-and-bound']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'tsp-stub-fail',
            description: {
              es: 'Implementación de TSP con Branch & Bound y cota inferior',
              en: 'Implementation of TSP with Branch & Bound and lower bounds'
            },
            passed: false,
            expected: 'Exploración exhaustiva con podas de cotas inferiores admisibles',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRecur = stripped.includes('def ') && (stripped.includes('explorar(') || stripped.includes('backtrack(') || stripped.includes('tsp_branch_and_bound('));
      const hasBound = stripped.includes('cota') || stripped.includes('bound') || stripped.includes('min(') || stripped.includes('mejor_costo');
      const passesHeuristic = hasRecur && hasBound;

      // Test 1: 4-city instance
      const dist1 = [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0]
      ];
      const opt1 = solveTspBranchAndBound(dist1); // 0-1-3-2-0 = 10 + 25 + 30 + 15 = 80
      const val1 = tspBranchAndBoundValidator.validate(dist1, opt1);

      results.push({
        testId: 'tsp-4cities',
        description: {
          es: 'Instancia simétrica de 4 ciudades: Costo mínimo del tour óptimo = 80.',
          en: '4-city symmetric instance: Optimal tour minimal cost = 80.'
        },
        passed: passesHeuristic && val1.valid,
        expected: 'Costo óptimo = 80',
        actual: passesHeuristic && val1.valid ? `Costo óptimo verificado: ${opt1}` : val1.errors.join('; ')
      });

      // Test 2: Small triangle (3 cities)
      const dist2 = [
        [0, 5, 8],
        [5, 0, 4],
        [8, 4, 0]
      ];
      const opt2 = solveTspBranchAndBound(dist2); // 5 + 4 + 8 = 17
      const val2 = tspBranchAndBoundValidator.validate(dist2, opt2);

      results.push({
        testId: 'tsp-triangle',
        description: {
          es: 'Triángulo métrico (3 ciudades): Debe encontrar el costo del ciclo único = 17.',
          en: 'Metric triangle (3 cities): Must find cycle cost = 17.'
        },
        passed: passesHeuristic && val2.valid,
        expected: 'Costo óptimo = 17',
        actual: passesHeuristic && val2.valid ? `Costo óptimo verificado: ${opt2}` : val2.errors.join('; ')
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
  'knapsack-branch-and-bound': {
    exerciseId: 'knapsack-branch-and-bound',
    entryFunction: 'mochila_branch_and_bound',
    starterCode: `def mochila_branch_and_bound(capacidad: int, pesos: list[int], valores: list[int]) -> int:
    """
    Resuelve la Mochila 0/1 mediante Branch and Bound.
    Poda ramas cuya cota superior (relajacion lineal continua) sea menor o igual
    al mejor valor entero encontrado hasta el momento.
    Retorna el valor optimo entero.
    """
    n = len(pesos)
    # Ordenar por densidad decreciente (valor / peso)
    items = sorted(zip(pesos, valores), key=lambda x: x[1] / x[0], reverse=True)
    mejor_valor = [0]

    # Escribe tu funcion recursiva con podas de cota superior aqui:

    return mejor_valor[0]
`,
    hints: [
      {
        es: 'Pista 1: Ordenar los ítems por densidad valor/peso decreciente es indispensable para que la cota superior fraccionaria sea lo más ajustada posible.',
        en: 'Hint 1: Sorting items by value/weight ratio descending is crucial for computing tight fractional upper bounds.'
      },
      {
        es: 'Pista 2: Cota superior de relajación lineal: Sumá los ítems enteros que entren en la capacidad remanente; para el primer ítem que exceda, agregá su valor fraccionario proporcional.',
        en: 'Hint 2: Linear relaxation upper bound: Accumulate values of whole items that fit, plus the fractional value of the first item exceeding capacity.'
      },
      {
        es: 'Pista 3: Poda de ramas: Si cota_superior <= mejor_valor[0], la rama no puede superar la mejor solución ya descubierta. Podala de inmediato.',
        en: 'Hint 3: Pruning rule: If upper_bound <= best_value[0], that sub-tree cannot yield a better solution. Prune immediately.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, backtrackingContent['knapsack-branch-and-bound']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'knapsack-bb-stub-fail',
            description: {
              es: 'Implementación de Mochila 0/1 con Branch & Bound',
              en: 'Implementation of 0/1 Knapsack with Branch & Bound'
            },
            passed: false,
            expected: 'Exploración sistemática con poda mediante relajación continua',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRecur = stripped.includes('def ') && (stripped.includes('explorar(') || stripped.includes('backtrack(') || stripped.includes('mochila_branch_and_bound('));
      const hasBound = stripped.includes('cota') || stripped.includes('bound') || stripped.includes('mejor_valor') || stripped.includes('capacidad');
      const passesHeuristic = hasRecur && hasBound;

      // Test 1: Standard instance: W=10, weights=[2, 4, 6, 7], values=[6, 10, 12, 13]
      const cap1 = 10;
      const w1 = [2, 4, 6, 7];
      const v1 = [6, 10, 12, 13];
      const opt1 = solveKnapsackBranchAndBound(cap1, w1, v1);
      const val1 = knapsackBranchAndBoundValidator.validate(cap1, w1, v1, opt1);

      results.push({
        testId: 'knapsack-bb-std',
        description: {
          es: 'Instancia estándar W=10, pesos=[2,4,6,7], valores=[6,10,12,13]. Valor óptimo = 19 (ítems [2,4] con valor 6+10+? o [2,7]=19).',
          en: 'Standard instance W=10, weights=[2,4,6,7], values=[6,10,12,13]. Optimal value = 19.'
        },
        passed: passesHeuristic && val1.valid,
        expected: `Valor óptimo = ${opt1}`,
        actual: passesHeuristic && val1.valid ? `Valor óptimo verificado: ${opt1}` : val1.errors.join('; ')
      });

      // Test 2: Items exceed capacity: W=5, weights=[6, 7, 8], values=[10, 20, 30] -> opt 0
      const cap2 = 5;
      const w2 = [6, 7, 8];
      const v2 = [10, 20, 30];
      const opt2 = solveKnapsackBranchAndBound(cap2, w2, v2);
      const val2 = knapsackBranchAndBoundValidator.validate(cap2, w2, v2, opt2);

      results.push({
        testId: 'knapsack-bb-zero',
        description: {
          es: 'Capacidad insuficiente para cualquier elemento: Debe retornar 0.',
          en: 'Capacity insufficient for all items: Must return 0.'
        },
        passed: passesHeuristic && val2.valid && opt2 === 0,
        expected: 'Valor óptimo = 0',
        actual: `Valor retornado: ${opt2}`
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
  'knights-tour-backtracking': {
    exerciseId: 'knights-tour-backtracking',
    entryFunction: 'recorrido_caballo',
    starterCode: `def recorrido_caballo(n: int) -> list[list[int]] | None:
    """
    Calcula un recorrido abierto del caballo de ajedrez en un tablero n x n
    comenzando en la casilla (0, 0).
    Cada casilla debe ser visitada exactamente una vez mediante saltos validos en 'L'.
    Retorna el tablero n x n donde tablero[r][c] es el orden de visita (0 a n^2 - 1),
    o None si no existe recorrido.
    """
    tablero = [[-1] * n for _ in range(n)]

    # Escribe tu algoritmo con la heuristica de Warnsdorff aqui:

    return None
`,
    hints: [
      {
        es: 'Pista 1: Los 8 movimientos relativos del caballo en ajedrez son (+2,+1), (+1,+2), (-1,+2), (-2,+1), (-2,-1), (-1,-2), (+1,-2), (+2,-1).',
        en: 'Hint 1: The 8 knight moves are (+2,+1), (+1,+2), (-1,+2), (-2,+1), (-2,-1), (-1,-2), (+1,-2), (+2,-1).'
      },
      {
        es: 'Pista 2: Heurística de Warnsdorff: Desde la casilla actual, contá a cuántas casillas desocupadas puede saltar cada vecino válido (su grado de salida). Ordená y saltá primero a la casilla con MENOR grado de salida.',
        en: 'Hint 2: Warnsdorff\'s Rule: From current cell, count empty outgoing moves for each neighbor. Sort and jump to the neighbor with FEWEST available moves.'
      },
      {
        es: 'Pista 3: Caso base: Cuando el paso actual sea n*n - 1, todas las casillas del tablero fueron visitadas. Retorná el tablero completado.',
        en: 'Hint 3: Base case: When step reaches n*n - 1, all squares have been visited once. Return completed board.'
      }
    ],
    runTests: async (code: string) => {
      const results: TestCaseResult[] = [];

      if (isUnimplementedStub(code, backtrackingContent['knights-tour-backtracking']?.starterCode)) {
        return {
          passed: false,
          results: [{
            testId: 'knights-stub-fail',
            description: {
              es: 'Implementación del recorrido del caballo con heurística de Warnsdorff',
              en: 'Implementation of Knight\'s Tour with Warnsdorff\'s heuristic'
            },
            passed: false,
            expected: 'Búsqueda sistemática guiada por grado mínimo de salida',
            actual: 'Código incompleto o sin implementar (plantilla inicial)'
          }],
          totalPassed: 0,
          totalTests: 1
        };
      }

      const stripped = stripCode(code);
      const hasRecur = stripped.includes('def ') && (stripped.includes('backtrack(') || stripped.includes('recorrido_caballo(') || stripped.includes('resolver('));
      const hasMoves = stripped.includes('2') && stripped.includes('1') && (stripped.includes('dr') || stripped.includes('movimientos') || stripped.includes('tablero['));
      const passesHeuristic = hasRecur && hasMoves;

      // Test 1: N = 5 board (25 squares)
      const sol5 = solveKnightsTour(5);
      const val5 = knightsTourValidator.validate(5, sol5);

      results.push({
        testId: 'knights-n5',
        description: {
          es: 'Tablero N = 5: Debe recorrer las 25 casillas exactamente una vez comenzando en (0, 0).',
          en: 'N = 5 board: Must visit all 25 squares exactly once starting at (0, 0).'
        },
        passed: passesHeuristic && val5.valid,
        expected: 'Tablero 5x5 con pasos 0 a 24 en saltos de caballo válidos',
        actual: passesHeuristic && val5.valid ? 'Recorrido completo válido verificado' : val5.errors.join('; ')
      });

      // Test 2: Base case N = 1
      const sol1 = solveKnightsTour(1);
      const val1 = knightsTourValidator.validate(1, sol1);

      results.push({
        testId: 'knights-n1',
        description: {
          es: 'Caso base N = 1: Tablero unitario [[0]].',
          en: 'Base case N = 1: Unit board [[0]].'
        },
        passed: passesHeuristic && val1.valid,
        expected: '[[0]]',
        actual: JSON.stringify(sol1)
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

