import { pythonService, PythonExecutionService } from './pythonExecutionService';
import { TestCaseResult } from '../engine/exerciseContent';
import { nQueensValidator } from '../engine/algorithms/nQueensValidator';
import { intervalSchedulingValidator, Interval } from '../engine/algorithms/intervalSchedulingValidator';
import { knapsackDpValidator, KnapsackItem } from '../engine/algorithms/knapsackDpValidator';
import { knapsackGreedyValidator, FractionalAssignment } from '../engine/algorithms/knapsackGreedyValidator';
import { mergeSortValidator } from '../engine/algorithms/mergeSortValidator';
import { maxFlowValidator, FlowNetworkInput } from '../engine/algorithms/maxFlowValidator';
import { vertexCoverApproxValidator } from '../engine/algorithms/vertexCoverApproxValidator';

export interface PythonEvaluationResult {
  passed: boolean;
  results: TestCaseResult[];
  totalPassed: number;
  totalTests: number;
  stdout?: string;
  runtimeError?: string;
  executionTimeMs: number;
}

export async function runPythonTests(
  exerciseId: string,
  code: string,
  service: PythonExecutionService = pythonService
): Promise<PythonEvaluationResult> {
  const startTime = performance.now();

  if (!service.isSupported) {
    return {
      passed: false,
      results: [],
      totalPassed: 0,
      totalTests: 0,
      runtimeError: 'El entorno actual no soporta Web Workers para ejecución de Python en navegador.',
      executionTimeMs: 0
    };
  }

  const isReady = await service.initWorker();
  if (!isReady) {
    return {
      passed: false,
      results: [],
      totalPassed: 0,
      totalTests: 0,
      runtimeError: 'No se pudo inicializar el entorno Pyodide (requiere conexión inicial a CDN para descargar WebAssembly).',
      executionTimeMs: performance.now() - startTime
    };
  }

  const results: TestCaseResult[] = [];
  let capturedStdout = '';

  try {
    switch (exerciseId) {
      case 'n-queens': {
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
        break;
      }

      case 'interval-scheduling': {
        const inputIntervals: [number, number][] = [[0, 3], [1, 5], [3, 6], [4, 8], [6, 9], [7, 10]];
        const res = await service.executePython(code, 'seleccion_intervalos', [inputIntervals]);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'intervals-exec-fail',
              description: { es: 'Ejecución de seleccion_intervalos(I)', en: 'Execution of seleccion_intervalos(I)' },
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

        const selected = res.result as Interval[];
        const validation = Array.isArray(selected)
          ? intervalSchedulingValidator.validate({ intervals: inputIntervals }, selected)
          : { valid: false, errors: ['El resultado no es una lista'] };

        results.push({
          testId: 'py-intervals-cardinality',
          description: {
            es: 'Conjunto base (6 tareas): Selecciona 3 tareas óptimas compatibles.',
            en: 'Base set (6 tasks): Selects 3 optimal compatible tasks.'
          },
          passed: validation.valid && Array.isArray(selected) && selected.length === 3,
          expected: '3 tareas disjuntas',
          actual: `${Array.isArray(selected) ? selected.length : 0} tareas seleccionadas`
        });

        results.push({
          testId: 'py-intervals-no-overlap',
          description: {
            es: 'Invariante: Ningún par de intervalos seleccionados se superpone temporalmente.',
            en: 'Invariant: No pair of selected intervals overlap in time.'
          },
          passed: validation.valid,
          message: validation.valid ? 'Compatibilidad temporal estricta satisfecha.' : validation.errors.join('; ')
        });
        break;
      }

      case 'knapsack-dp': {
        const items = [
          { id: 'item-guitar', peso: 1, valor: 15 },
          { id: 'item-phone', peso: 1, valor: 20 },
          { id: 'item-laptop', peso: 3, valor: 20 },
          { id: 'item-stereo', peso: 4, valor: 30 }
        ];
        const res = await service.executePython(code, 'mochila_dp', [items, 6]);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'knapsack-dp-exec-fail',
              description: { es: 'Ejecución de mochila_dp(items, capacidad)', en: 'Execution of mochila_dp(items, capacidad)' },
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

        const tupleRes = res.result as [number, { id: string; peso: number; valor: number }[]];
        const valMax = Array.isArray(tupleRes) ? tupleRes[0] : null;
        const chosenItems = Array.isArray(tupleRes) && Array.isArray(tupleRes[1]) ? tupleRes[1] : [];
        const domainItems: KnapsackItem[] = chosenItems.map((it) => ({
          id: it.id,
          name: it.id,
          weight: it.peso,
          value: it.valor
        }));

        const originalKnapsackItems: KnapsackItem[] = items.map((it) => ({
          id: it.id,
          name: it.id,
          weight: it.peso,
          value: it.valor
        }));

        const validation = knapsackDpValidator.validate(
          { items: originalKnapsackItems, capacity: 6 },
          domainItems
        );

        results.push({
          testId: 'py-knapsack-optimal-value',
          description: {
            es: 'Capacidad W = 6: Valor óptimo $65 alcanzado con programación dinámica.',
            en: 'Capacity W = 6: Optimal value $65 achieved with dynamic programming.'
          },
          passed: valMax === 65 && validation.valid,
          expected: 'Valor $65',
          actual: `Valor $${valMax}`
        });

        results.push({
          testId: 'py-knapsack-capacity',
          description: {
            es: 'Restricción de capacidad: Peso total acumulado <= 6.',
            en: 'Capacity constraint: Total accumulated weight <= 6.'
          },
          passed: validation.valid,
          message: validation.valid ? 'Restricción de capacidad satisfecha.' : validation.errors.join('; ')
        });
        break;
      }

      case 'knapsack-greedy': {
        const items = [
          { id: 'item-gold', peso: 10, valor: 60 },
          { id: 'item-silver', peso: 20, valor: 100 },
          { id: 'item-copper', peso: 30, valor: 120 }
        ];
        const res = await service.executePython(code, 'mochila_fraccionaria', [items, 50]);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'knapsack-greedy-exec-fail',
              description: { es: 'Ejecución de mochila_fraccionaria(items, capacidad)', en: 'Execution of mochila_fraccionaria(items, capacidad)' },
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

        const tupleRes = res.result as [number, { id?: string; itemId?: string; fraccion?: number; fraction?: number }[]];
        const totalVal = Array.isArray(tupleRes) ? tupleRes[0] : null;
        const rawAssignments = Array.isArray(tupleRes) && Array.isArray(tupleRes[1]) ? tupleRes[1] : [];
        const assignments: FractionalAssignment[] = rawAssignments.map((a) => ({
          itemId: a.itemId || a.id || '',
          fraction: a.fraction ?? a.fraccion ?? 1.0
        }));

        const originalItems: KnapsackItem[] = items.map((it) => ({
          id: it.id,
          name: it.id,
          weight: it.peso,
          value: it.valor
        }));

        const validation = knapsackGreedyValidator.validate(
          { items: originalItems, capacity: 50 },
          assignments
        );

        results.push({
          testId: 'py-fractional-optimal',
          description: {
            es: 'Mochila fraccionaria: Valor óptimo $240.0 alcanzado.',
            en: 'Fractional knapsack: Optimal value $240.0 reached.'
          },
          passed: Math.abs((totalVal || 0) - 240) < 0.01 && validation.valid,
          expected: 'Valor $240.0',
          actual: `Valor $${totalVal}`
        });
        break;
      }

      case 'merge-sort': {
        const inputArr = [38, 27, 43, 3, 9, 82, 10];
        const res = await service.executePython(code, 'merge_sort', [inputArr]);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'mergesort-exec-fail',
              description: { es: 'Ejecución de merge_sort(arr)', en: 'Execution of merge_sort(arr)' },
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

        const sorted = res.result as number[];
        const validation = Array.isArray(sorted)
          ? mergeSortValidator.validate({ array: inputArr }, sorted)
          : { valid: false, errors: ['El resultado no es una lista'] };

        results.push({
          testId: 'py-mergesort-sorted',
          description: {
            es: 'Arreglo desordenado: Se ordena correctamente en tiempo O(n log n).',
            en: 'Unsorted array: Correctly sorted in O(n log n) time.'
          },
          passed: validation.valid,
          expected: '[3, 9, 10, 27, 38, 43, 82]',
          actual: JSON.stringify(sorted)
        });
        break;
      }

      case 'max-flow': {
        const vertices = ['s', 'u', 'v', 't'];
        const edges = [
          { origen: 's', destino: 'u', capacidad: 10 },
          { origen: 's', destino: 'v', capacidad: 5 },
          { origen: 'u', destino: 'v', capacidad: 15 },
          { origen: 'u', destino: 't', capacidad: 10 },
          { origen: 'v', destino: 't', capacidad: 10 }
        ];

        const res = await service.executePython(code, 'edmonds_karp', [vertices, edges, 's', 't']);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'maxflow-exec-fail',
              description: { es: 'Ejecución de edmonds_karp(...)', en: 'Execution of edmonds_karp(...)' },
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

        const maxFlowVal = typeof res.result === 'number'
          ? res.result
          : Array.isArray(res.result) ? res.result[0] : 0;

        const networkInput: FlowNetworkInput = {
          vertices,
          edges: edges.map((e) => ({ u: e.origen, v: e.destino, capacity: e.capacidad })),
          source: 's',
          sink: 't'
        };

        const validation = maxFlowValidator.validate(networkInput, {
          maxFlow: Number(maxFlowVal),
          edgeFlows: {}
        });

        results.push({
          testId: 'py-maxflow-optimal',
          description: {
            es: 'Red clásica: Flujo máximo de 15 alcanzado.',
            en: 'Classic network: Maximum flow of 15 achieved.'
          },
          passed: maxFlowVal === 15 || validation.valid,
          expected: 'Flujo = 15',
          actual: `Flujo = ${maxFlowVal}`
        });
        break;
      }

      case 'vertex-cover-reduction': {
        const vertices = ['A', 'B', 'C', 'D', 'E'];
        const edges: [string, string][] = [
          ['A', 'B'],
          ['A', 'C'],
          ['B', 'D'],
          ['C', 'D'],
          ['C', 'E'],
          ['D', 'E']
        ];
        const k = 2;

        const res = await service.executePython(code, 'reducir_instancia_is_a_vc', [vertices, edges, k]);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'reduction-exec-fail',
              description: { es: 'Ejecución de reducir_instancia_is_a_vc(...)', en: 'Execution of reducir_instancia_is_a_vc(...)' },
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

        const tupleRes = res.result as [string[], [string, string][], number];
        const retVertices = Array.isArray(tupleRes) ? tupleRes[0] : [];
        const retEdges = Array.isArray(tupleRes) ? tupleRes[1] : [];
        const retKPrime = Array.isArray(tupleRes) ? tupleRes[2] : null;

        const kPrimeExpected = vertices.length - k; // 3
        const passKPrime = retKPrime === kPrimeExpected && retVertices.length === vertices.length && retEdges.length === edges.length;

        results.push({
          testId: 'py-reduction-kprime',
          description: {
            es: 'Reducción polinomial: Retorna G intacto con k\' = |V| - k = 3.',
            en: 'Polynomial reduction: Returns identical G with k\' = |V| - k = 3.'
          },
          passed: passKPrime,
          expected: `k' = ${kPrimeExpected}`,
          actual: `k' = ${retKPrime}`
        });

        const resRecovery = await service.executePython(code, 'transformar_solucion_vc_a_is', [vertices, ['B', 'C', 'E']]);
        const recoveredS = Array.isArray(resRecovery.result) ? resRecovery.result as string[] : [];
        const isSet = new Set(recoveredS);
        const passRecovery = resRecovery.success && isSet.size === 2 && isSet.has('A') && isSet.has('D');

        results.push({
          testId: 'py-reduction-recovery',
          description: {
            es: 'Recuperación de solución: Reconstruye S = {A, D} a partir de C = {B, C, E}.',
            en: 'Solution recovery: Reconstructs S = {A, D} from C = {B, C, E}.'
          },
          passed: passRecovery,
          expected: 'S = {A, D}',
          actual: JSON.stringify(recoveredS)
        });
        break;
      }

      case 'vertex-cover-approx': {
        const vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
        const edges: [string, string][] = [
          ['A', 'B'],
          ['A', 'C'],
          ['B', 'D'],
          ['C', 'D'],
          ['D', 'E'],
          ['D', 'F'],
          ['E', 'F']
        ];

        const res = await service.executePython(code, 'cobertura_vertices_2aprox', [vertices, edges]);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'approx-exec-fail',
              description: { es: 'Ejecución de cobertura_vertices_2aprox(...)', en: 'Execution of cobertura_vertices_2aprox(...)' },
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

        const tupleRes = res.result as [string[], [string, string][]];
        const cover = Array.isArray(tupleRes) && Array.isArray(tupleRes[0]) ? tupleRes[0] : [];
        const matching = Array.isArray(tupleRes) && Array.isArray(tupleRes[1]) ? tupleRes[1] : [];

        const validation = vertexCoverApproxValidator.validate(
          { vertices, edges, optimalMinCoverSize: 3 },
          { cover, matching }
        );

        results.push({
          testId: 'py-approx-feasibility',
          description: {
            es: 'Factibilidad y ratio 2-aprox: C cubre todas las aristas y |C| <= 2·|C*|.',
            en: 'Feasibility and 2-approx ratio: C covers all edges and |C| <= 2·|C*|.'
          },
          passed: validation.valid,
          expected: 'Cobertura válida con ratio <= 2',
          actual: validation.valid ? `|C| = ${cover.length}, |M| = ${matching.length}` : validation.errors.join('; ')
        });
        break;
      }

      default:
        return {
          passed: false,
          results: [],
          totalPassed: 0,
          totalTests: 0,
          runtimeError: `Ejercicio ${exerciseId} no posee runner de Python configurado.`,
          executionTimeMs: performance.now() - startTime
        };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      results,
      totalPassed: results.filter((r) => r.passed).length,
      totalTests: results.length,
      runtimeError: msg,
      stdout: capturedStdout.trim(),
      executionTimeMs: performance.now() - startTime
    };
  }

  const totalPassed = results.filter((r) => r.passed).length;
  return {
    passed: totalPassed === results.length && results.length > 0,
    results,
    totalPassed,
    totalTests: results.length,
    stdout: capturedStdout.trim() || undefined,
    executionTimeMs: performance.now() - startTime
  };
}
