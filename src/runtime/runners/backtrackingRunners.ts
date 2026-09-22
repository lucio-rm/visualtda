import { PythonTestStrategy } from './types';
import { TestCaseResult } from '../../engine/exerciseContent';
import { nQueensValidator } from '../../engine/algorithms/nQueensValidator';
import { subsetSumValidator } from '../../engine/algorithms/subsetSumValidator';
import { graphColoringValidator } from '../../engine/algorithms/graphColoringValidator';
import { sudokuValidator } from '../../engine/algorithms/sudokuValidator';
import { hamiltonianCycleValidator } from '../../engine/algorithms/hamiltonianCycleValidator';
import { tspBranchAndBoundValidator } from '../../engine/algorithms/tspBranchAndBoundValidator';
import { knapsackBranchAndBoundValidator } from '../../engine/algorithms/knapsackBranchAndBoundValidator';
import { knightsTourValidator } from '../../engine/algorithms/knightsTourValidator';

export const backtrackingRunners: Record<string, PythonTestStrategy> = {
  'n-queens': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: N = 4
            const res4 = await service.executePython(code, 'resolver_n_reinas', [4]);
            if (res4.stdout) capturedStdout += res4.stdout + '\n';

            if (!res4.success) {
              return {
                passed: false,
                results: [{
                  testId: 'n4-exec-fail',
                  description: { es: 'Ejecución en Python de resolver_n_reinas(4)', en: 'Python execution of resolver_n_reinas(4)' },
                  passed: false,
                  message: res4.error || 'Error durante la ejecución'
                }],
                totalPassed: 0,
                totalTests: 1,
                stdout: capturedStdout.trim(),
                runtimeError: res4.error,
                executionTimeMs: res4.executionTimeMs
              };
            }

            const solList = res4.result as number[][];
            const isArray = Array.isArray(solList);
            const countValid = isArray ? solList.filter((s) => nQueensValidator.validate({ n: 4 }, s).valid).length : 0;
            const pass4 = isArray && solList.length === 2 && countValid === 2;

            results.push({
              testId: 'py-n4-solutions',
              description: {
                es: 'Caso N = 4: Retorna exactamente 2 soluciones y ambas son configuraciones válidas.',
                en: 'Case N = 4: Returns exactly 2 solutions and both are valid configurations.'
              },
              passed: pass4,
              expected: '2 soluciones válidas',
              actual: `${isArray ? solList.length : 0} soluciones obtenidas (${countValid} válidas)`
            });

            // Test 2: N = 1
            const res1 = await service.executePython(code, 'resolver_n_reinas', [1]);
            const solList1 = res1.result as number[][];
            const pass1 = res1.success && Array.isArray(solList1) && solList1.length === 1 && solList1[0][0] === 0;

            results.push({
              testId: 'py-n1-base-case',
              description: {
                es: 'Caso base N = 1: Retorna exactamente una solución [[0]].',
                en: 'Base case N = 1: Returns exactly one solution [[0]].'
              },
              passed: pass1,
              expected: '[[0]]',
              actual: JSON.stringify(res1.result)
            });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'subset-sum-backtracking': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: Guía Ej. 11: [2, 3, 5, 7, 8], S = 10
            const t1Nums = [2, 3, 5, 7, 8];
            const res1 = await service.executePython(code, 'subconjuntos_que_suman', [t1Nums, 10]);
            if (res1.stdout) capturedStdout += res1.stdout + '\n';
            if (!res1.success) {
              return {
                passed: false,
                results: [{
                  testId: 'subset-exec-fail',
                  description: { es: 'Ejecución de subconjuntos_que_suman(numeros, objetivo)', en: 'Execution of subconjuntos_que_suman(numeros, objetivo)' },
                  passed: false,
                  message: res1.error || 'Error durante la ejecución'
                }],
                totalPassed: 0,
                totalTests: 1,
                stdout: capturedStdout.trim(),
                runtimeError: res1.error,
                executionTimeMs: res1.executionTimeMs
              };
            }

            const out1 = (Array.isArray(res1.result) ? res1.result : []) as number[][];
            const val1 = subsetSumValidator.validate({ numbers: t1Nums, target: 10 }, out1);
            results.push({
              testId: 'py-subset-guia-ej11',
              description: {
                es: 'Guía Ej. 11: [2, 3, 5, 7, 8] con S = 10 (halla los 3 subconjuntos válidos).',
                en: 'Guide Ex. 11: [2, 3, 5, 7, 8] with S = 10 (finds all 3 valid subsets).'
              },
              passed: val1.valid && out1.length === 3,
              expected: '3 subconjuntos válidos',
              actual: val1.valid ? `${out1.length} subconjunto(s)` : val1.errors.join('; ')
            });

            // Test 2: Unreachable target: [2, 4, 6], S = 7
            const t2Nums = [2, 4, 6];
            const res2 = await service.executePython(code, 'subconjuntos_que_suman', [t2Nums, 7]);
            const out2 = (Array.isArray(res2.result) ? res2.result : []) as number[][];
            const val2 = subsetSumValidator.validate({ numbers: t2Nums, target: 7 }, out2);
            results.push({
              testId: 'py-subset-unreachable',
              description: {
                es: 'Objetivo inalcanzable [2, 4, 6] con S = 7 (retorna lista vacía).',
                en: 'Unreachable target [2, 4, 6] with S = 7 (returns empty list).'
              },
              passed: val2.valid && out2.length === 0,
              expected: '0 subconjuntos ([])',
              actual: `${out2.length} subconjunto(s)`
            });

            // Test 3: Exact single element: [10, 20, 30], S = 10
            const t3Nums = [10, 20, 30];
            const res3 = await service.executePython(code, 'subconjuntos_que_suman', [t3Nums, 10]);
            const out3 = (Array.isArray(res3.result) ? res3.result : []) as number[][];
            const val3 = subsetSumValidator.validate({ numbers: t3Nums, target: 10 }, out3);
            results.push({
              testId: 'py-subset-single-match',
              description: {
                es: 'Coincidencia unitaria: [10, 20, 30] con S = 10 (retorna [[10]]).',
                en: 'Single match: [10, 20, 30] with S = 10 (returns [[10]]).'
              },
              passed: val3.valid && out3.length === 1 && out3[0]?.[0] === 10,
              expected: '[[10]]',
              actual: JSON.stringify(out3)
            });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'graph-coloring-backtracking': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: Bipartite path A - B - C with k=2
            const g1 = {
              vertices: ['A', 'B', 'C'],
              edges: [['A', 'B'], ['B', 'C']] as [string, string][],
              k: 2
            };
            const pyG1: Record<string, string[]> = {
              A: ['B'],
              B: ['A', 'C'],
              C: ['B']
            };
            const res1 = await service.executePython(code, 'colorear_grafo', [pyG1, 2]);
            if (res1.stdout) capturedStdout += res1.stdout + '\n';
            if (!res1.success) {
              return {
                passed: false,
                results: [{
                  testId: 'py-gc-exec-fail',
                  description: { es: 'Ejecución Python de colorear_grafo', en: 'Python execution of colorear_grafo' },
                  passed: false,
                  message: res1.error || 'Error durante la ejecución'
                }],
                totalPassed: 0,
                totalTests: 1,
                stdout: capturedStdout.trim(),
                runtimeError: res1.error,
                executionTimeMs: res1.executionTimeMs
              };
            }

            const out1 = res1.result as Record<string, number> | null;
            const val1 = graphColoringValidator.validate(g1, out1);
            results.push({
              testId: 'py-gc-bipartite',
              description: {
                es: 'Camino A-B-C con k=2: Retorna un 2-coloreo válido sin conflictos en aristas.',
                en: 'Path A-B-C with k=2: Returns a valid 2-coloring with no edge conflicts.'
              },
              passed: val1.valid,
              expected: 'Diccionario con 2 colores válidos',
              actual: val1.valid ? JSON.stringify(out1) : (val1.message.es || 'Inválido')
            });

            // Test 2: Triangle K3 with k=2 (must return None)
            const g2 = {
              vertices: ['1', '2', '3'],
              edges: [['1', '2'], ['2', '3'], ['3', '1']] as [string, string][],
              k: 2
            };
            const pyG2: Record<string, string[]> = {
              '1': ['2', '3'],
              '2': ['1', '3'],
              '3': ['1', '2']
            };
            const res2 = await service.executePython(code, 'colorear_grafo', [pyG2, 2]);
            if (res2.stdout) capturedStdout += res2.stdout + '\n';
            const out2 = res2.result as Record<string, number> | null;
            const val2 = graphColoringValidator.validate(g2, out2);
            results.push({
              testId: 'py-gc-triangle-none',
              description: {
                es: 'Triángulo K3 con k=2: Grafo impar no admite 2-coloreo; debe retornar None.',
                en: 'Triangle K3 with k=2: Odd graph does not admit 2-coloring; must return None.'
              },
              passed: val2.valid && (out2 === null || out2 === undefined),
              expected: 'None',
              actual: out2 === null || out2 === undefined ? 'None' : JSON.stringify(out2)
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
            const pyG3: Record<string, string[]> = {
              A: ['B', 'E', 'C', 'D'],
              B: ['A', 'C'],
              C: ['B', 'D', 'A'],
              D: ['C', 'E', 'A'],
              E: ['D', 'A']
            };
            const res3 = await service.executePython(code, 'colorear_grafo', [pyG3, 3]);
            if (res3.stdout) capturedStdout += res3.stdout + '\n';
            const out3 = res3.result as Record<string, number> | null;
            const val3 = graphColoringValidator.validate(g3, out3);
            results.push({
              testId: 'py-gc-wheel-k3',
              description: {
                es: 'Grafo rueda con cuerdas y k=3: Encuentra una asignación válida de 3 colores.',
                en: 'Wheel graph with chords and k=3: Finds a valid 3-coloring assignment.'
              },
              passed: val3.valid,
              expected: 'Asignación de 3 colores válida',
              actual: val3.valid ? JSON.stringify(out3) : (val3.message.es || 'Inválido')
            });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'sudoku-backtracking': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    const rawBoard = [
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
    const copyBoard = rawBoard.map((r) => [...r]);

    const wrapperCode = code + `\n\ndef __sudoku_eval_wrapper(b):\n    import copy\n    tb = copy.deepcopy(b)\n    res = resolver_sudoku(tb)\n    if isinstance(res, list):\n        return (True, res)\n    return (res, tb)\n`;

    const res = await service.executePython(wrapperCode, '__sudoku_eval_wrapper', [copyBoard]);
    if (res.stdout) capturedStdout += res.stdout + '\n';
    if (!res.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-sudoku-exec-fail',
          description: { es: 'Ejecución en Python de resolver_sudoku(tablero)', en: 'Python execution of resolver_sudoku(board)' },
          passed: false,
          message: res.error || 'Error durante la ejecución'
        }],
        totalPassed: 0,
        totalTests: 1,
        stdout: capturedStdout.trim(),
        runtimeError: res.error,
        executionTimeMs: res.executionTimeMs
      };
    }

    const tupleRes = res.result as [boolean, number[][]];
    const solved = Array.isArray(tupleRes) ? tupleRes[0] : false;
    const finalBoard = Array.isArray(tupleRes) && Array.isArray(tupleRes[1]) ? tupleRes[1] : copyBoard;
    const val = sudokuValidator.validate(rawBoard, finalBoard);

    results.push({
      testId: 'py-sudoku-standard-solution',
      description: {
        es: 'Tablero 9x9 estándar: Debe retornar True y completar todas las casillas respetando restricciones.',
        en: 'Standard 9x9 grid: Must return True and fill all cells satisfying constraints.'
      },
      passed: Boolean(solved) && val.valid,
      expected: 'Tablero 9x9 válido y resuelto (retorna True)',
      actual: Boolean(solved) && val.valid ? 'Tablero completamente resuelto' : val.errors.join('; ')
    });

    results.push({
      testId: 'py-sudoku-invariance',
      description: {
        es: 'Invariante: Ningún dígito debe duplicarse en filas, columnas ni cuadrantes 3x3.',
        en: 'Invariant: No duplicate digits in rows, columns, or 3x3 blocks.'
      },
      passed: val.valid,
      expected: 'Sin duplicados en filas, columnas ni bloques 3x3',
      actual: val.valid ? 'Invariantes respetados' : val.errors[0] || 'Violación de invariante'
    });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'hamiltonian-cycle-backtracking': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: Cycle C5
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
    const res1 = await service.executePython(code, 'ciclo_hamiltoniano', [5, g1.adj]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-hamiltonian-exec-fail',
          description: { es: 'Ejecución en Python de ciclo_hamiltoniano(num_v, grafo)', en: 'Python execution of ciclo_hamiltoniano(num_v, grafo)' },
          passed: false,
          message: res1.error || 'Error durante la ejecución'
        }],
        totalPassed: 0,
        totalTests: 1,
        stdout: capturedStdout.trim(),
        runtimeError: res1.error,
        executionTimeMs: res1.executionTimeMs
      };
    }

    const sol1 = res1.result as number[] | null;
    const val1 = hamiltonianCycleValidator.validate(g1, sol1);

    results.push({
      testId: 'py-hamiltonian-c5',
      description: {
        es: 'Grafo ciclo C5 (5 vértices): Retorna un ciclo cerrado [0, ..., 0] de longitud 6.',
        en: 'Cycle graph C5 (5 vertices): Returns a closed cycle [0, ..., 0] of length 6.'
      },
      passed: val1.valid,
      expected: 'Ciclo simple cerrado de 5 vértices',
      actual: val1.valid ? JSON.stringify(sol1) : val1.errors.join('; ')
    });

    // Test 2: Star K1,4 (Impossible)
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
    const res2 = await service.executePython(code, 'ciclo_hamiltoniano', [5, g2.adj]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const sol2 = res2.result as number[] | null;
    const pass2 = res2.success && (sol2 === null || sol2 === undefined);

    results.push({
      testId: 'py-hamiltonian-impossible',
      description: {
        es: 'Grafo estrella K1,4: Imposible formar ciclo hamiltoniano; debe retornar None.',
        en: 'Star graph K1,4: Impossible to form cycle; must return None.'
      },
      passed: pass2,
      expected: 'None',
      actual: sol2 === null || sol2 === undefined ? 'None' : JSON.stringify(sol2)
    });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'tsp-branch-and-bound': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: 4-city instance
    const dist1 = [
      [0, 10, 15, 20],
      [10, 0, 35, 25],
      [15, 35, 0, 30],
      [20, 25, 30, 0]
    ];
    const res1 = await service.executePython(code, 'tsp_branch_and_bound', [dist1]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-tsp-exec-fail',
          description: { es: 'Ejecución en Python de tsp_branch_and_bound(distancias)', en: 'Python execution of tsp_branch_and_bound(distancias)' },
          passed: false,
          message: res1.error || 'Error durante la ejecución'
        }],
        totalPassed: 0,
        totalTests: 1,
        stdout: capturedStdout.trim(),
        runtimeError: res1.error,
        executionTimeMs: res1.executionTimeMs
      };
    }

    const cost1 = res1.result as number;
    const val1 = tspBranchAndBoundValidator.validate(dist1, cost1);

    results.push({
      testId: 'py-tsp-4cities',
      description: {
        es: 'Instancia simétrica de 4 ciudades: Debe retornar el costo mínimo del tour óptimo (80).',
        en: '4-city symmetric instance: Must return minimal optimal tour cost (80).'
      },
      passed: val1.valid,
      expected: '80',
      actual: String(cost1)
    });

    // Test 2: Triangle (3 cities)
    const dist2 = [
      [0, 5, 8],
      [5, 0, 4],
      [8, 4, 0]
    ];
    const res2 = await service.executePython(code, 'tsp_branch_and_bound', [dist2]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const cost2 = res2.result as number;
    const val2 = tspBranchAndBoundValidator.validate(dist2, cost2);

    results.push({
      testId: 'py-tsp-triangle',
      description: {
        es: 'Triángulo (3 ciudades): Debe retornar el costo del ciclo único (17).',
        en: 'Triangle (3 cities): Must return unique cycle cost (17).'
      },
      passed: val2.valid,
      expected: '17',
      actual: String(cost2)
    });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'knapsack-branch-and-bound': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: Standard instance
    const cap1 = 10;
    const w1 = [2, 4, 6, 7];
    const v1 = [6, 10, 12, 13];
    const res1 = await service.executePython(code, 'mochila_branch_and_bound', [cap1, w1, v1]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-knapsack-bb-exec-fail',
          description: { es: 'Ejecución en Python de mochila_branch_and_bound(...)', en: 'Python execution of mochila_branch_and_bound(...)' },
          passed: false,
          message: res1.error || 'Error durante la ejecución'
        }],
        totalPassed: 0,
        totalTests: 1,
        stdout: capturedStdout.trim(),
        runtimeError: res1.error,
        executionTimeMs: res1.executionTimeMs
      };
    }

    const val1 = res1.result as number;
    const check1 = knapsackBranchAndBoundValidator.validate(cap1, w1, v1, val1);

    results.push({
      testId: 'py-knapsack-bb-std',
      description: {
        es: 'Instancia estándar W=10, pesos=[2,4,6,7], valores=[6,10,12,13]: Retorna valor óptimo 19.',
        en: 'Standard instance W=10, weights=[2,4,6,7], values=[6,10,12,13]: Returns optimal value 19.'
      },
      passed: check1.valid,
      expected: '19',
      actual: String(val1)
    });

    // Test 2: Capacity 0 or items exceed capacity
    const cap2 = 5;
    const w2 = [6, 7, 8];
    const v2 = [10, 20, 30];
    const res2 = await service.executePython(code, 'mochila_branch_and_bound', [cap2, w2, v2]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const val2 = res2.result as number;
    const check2 = knapsackBranchAndBoundValidator.validate(cap2, w2, v2, val2);

    results.push({
      testId: 'py-knapsack-bb-zero',
      description: {
        es: 'Capacidad insuficiente para cualquier elemento: Retorna valor óptimo 0.',
        en: 'Insufficient capacity for all items: Returns optimal value 0.'
      },
      passed: check2.valid,
      expected: '0',
      actual: String(val2)
    });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'knights-tour-backtracking': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: N = 5
    const res1 = await service.executePython(code, 'recorrido_caballo', [5]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-knights-exec-fail',
          description: { es: 'Ejecución en Python de recorrido_caballo(5)', en: 'Python execution of recorrido_caballo(5)' },
          passed: false,
          message: res1.error || 'Error durante la ejecución'
        }],
        totalPassed: 0,
        totalTests: 1,
        stdout: capturedStdout.trim(),
        runtimeError: res1.error,
        executionTimeMs: res1.executionTimeMs
      };
    }

    const board1 = res1.result as number[][] | null;
    const val1 = knightsTourValidator.validate(5, board1);

    results.push({
      testId: 'py-knights-n5',
      description: {
        es: 'Tablero N = 5: Debe recorrer las 25 casillas exactamente una vez comenzando en (0, 0).',
        en: 'N = 5 board: Must visit all 25 squares exactly once starting at (0, 0).'
      },
      passed: val1.valid,
      expected: 'Tablero 5x5 con pasos 0..24 en movimientos válidos de caballo',
      actual: val1.valid ? 'Recorrido completo válido verificado' : val1.errors.join('; ')
    });

    // Test 2: N = 1
    const res2 = await service.executePython(code, 'recorrido_caballo', [1]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const board2 = res2.result as number[][] | null;
    const val2 = knightsTourValidator.validate(1, board2);

    results.push({
      testId: 'py-knights-n1',
      description: {
        es: 'Caso base N = 1: Retorna tablero [[0]].',
        en: 'Base case N = 1: Returns board [[0]].'
      },
      passed: val2.valid,
      expected: '[[0]]',
      actual: JSON.stringify(board2)
    });

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  }
};
