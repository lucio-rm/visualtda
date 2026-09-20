import { PythonTestStrategy } from './types';
import { TestCaseResult } from '../../engine/exerciseContent';
import { nQueensValidator } from '../../engine/algorithms/nQueensValidator';
import { subsetSumValidator } from '../../engine/algorithms/subsetSumValidator';
import { graphColoringValidator } from '../../engine/algorithms/graphColoringValidator';

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
};
