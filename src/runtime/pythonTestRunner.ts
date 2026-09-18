import { pythonService, PythonExecutionService } from './pythonExecutionService';
import { TestCaseResult } from '../engine/exerciseContent';
import { nQueensValidator } from '../engine/algorithms/nQueensValidator';
import { intervalSchedulingValidator, Interval } from '../engine/algorithms/intervalSchedulingValidator';
import { knapsackDpValidator, KnapsackItem } from '../engine/algorithms/knapsackDpValidator';
import { juanElVagoValidator } from '../engine/algorithms/juanElVagoValidator';
import { knapsackGreedyValidator, FractionalAssignment } from '../engine/algorithms/knapsackGreedyValidator';
import { mergeSortValidator } from '../engine/algorithms/mergeSortValidator';
import { maxSubarrayValidator } from '../engine/algorithms/maxSubarrayValidator';
import { maxFlowValidator, FlowNetworkInput } from '../engine/algorithms/maxFlowValidator';
import { linearProgrammingValidator } from '../engine/algorithms/linearProgrammingValidator';
import { vertexCoverApproxValidator } from '../engine/algorithms/vertexCoverApproxValidator';
import { randomizedFairCoinValidator } from '../engine/algorithms/randomizedFairCoinValidator';
import { roadAntennasValidator } from '../engine/algorithms/roadAntennasValidator';

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

      case 'juan-el-vago': {
        // Test 1: [10, 40, 20, 30, 50] -> (90, [1, 4])
        const g1 = [10, 40, 20, 30, 50];
        const res1 = await service.executePython(code, 'juan_el_vago', [g1]);
        if (res1.stdout) capturedStdout += res1.stdout + '\n';

        if (!res1.success) {
          return {
            passed: false,
            results: [{
              testId: 'juan-exec-fail',
              description: { es: 'Ejecución de juan_el_vago(ganancias)', en: 'Execution of juan_el_vago(ganancias)' },
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

        const out1 = res1.result as [number, number[]];
        const val1 = juanElVagoValidator.validate({ ganancias: g1 }, out1);

        results.push({
          testId: 'py-juan-cátedra-case',
          description: {
            es: 'Caso Cátedra: [10, 40, 20, 30, 50] -> Ganancia $90 (Días [1, 4]).',
            en: 'Course Case: [10, 40, 20, 30, 50] -> Profit $90 (Days [1, 4]).'
          },
          passed: val1.valid,
          expected: 'Monto: $90, Días: [1, 4]',
          actual: `Monto: $${Array.isArray(out1) ? out1[0] : '?'}, Días: [${Array.isArray(out1?.[1]) ? out1[1].join(', ') : ''}]`
        });

        // Test 2: [100, 10, 10, 100] -> (200, [0, 3])
        const g2 = [100, 10, 10, 100];
        const res2 = await service.executePython(code, 'juan_el_vago', [g2]);
        const out2 = res2.result as [number, number[]];
        const val2 = juanElVagoValidator.validate({ ganancias: g2 }, out2);

        results.push({
          testId: 'py-juan-greedy-trap',
          description: {
            es: 'Trampa Greedy: [100, 10, 10, 100] -> Ganancia $200 (Días [0, 3]).',
            en: 'Greedy Trap: [100, 10, 10, 100] -> Profit $200 (Days [0, 3]).'
          },
          passed: val2.valid,
          expected: 'Monto: $200, Días: [0, 3]',
          actual: `Monto: $${Array.isArray(out2) ? out2[0] : '?'}, Días: [${Array.isArray(out2?.[1]) ? out2[1].join(', ') : ''}]`
        });

        // Test 3: [2, 7, 9, 3, 1] -> (12, [0, 2, 4])
        const g3 = [2, 7, 9, 3, 1];
        const res3 = await service.executePython(code, 'juan_el_vago', [g3]);
        const out3 = res3.result as [number, number[]];
        const val3 = juanElVagoValidator.validate({ ganancias: g3 }, out3);

        results.push({
          testId: 'py-juan-multi-days',
          description: {
            es: 'Múltiples días alternados: [2, 7, 9, 3, 1] -> Ganancia $12 (Días [0, 2, 4]).',
            en: 'Multiple alternated days: [2, 7, 9, 3, 1] -> Profit $12 (Days [0, 2, 4]).'
          },
          passed: val3.valid,
          expected: 'Monto: $12, Días: [0, 2, 4]',
          actual: `Monto: $${Array.isArray(out3) ? out3[0] : '?'}, Días: [${Array.isArray(out3?.[1]) ? out3[1].join(', ') : ''}]`
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

      case 'max-subarray-dyc': {
        // Test 1: [5, 3, 2, 4, -1] -> [5, 3, 2, 4]
        const arr1 = [5, 3, 2, 4, -1];
        const res1 = await service.executePython(code, 'subarreglo_maxima_suma', [arr1]);
        if (res1.stdout) capturedStdout += res1.stdout + '\n';

        if (!res1.success) {
          return {
            passed: false,
            results: [{
              testId: 'maxsub-exec-fail',
              description: { es: 'Ejecución de subarreglo_maxima_suma(arr)', en: 'Execution of subarreglo_maxima_suma(arr)' },
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

        const out1 = res1.result as number[];
        const val1 = maxSubarrayValidator.validate({ array: arr1 }, out1);
        results.push({
          testId: 'py-maxsub-case1',
          description: {
            es: 'Caso Cátedra 1: [5, 3, 2, 4, -1] -> subarreglo óptimo con suma 14.',
            en: 'Course Case 1: [5, 3, 2, 4, -1] -> optimal subarray with sum 14.'
          },
          passed: val1.valid,
          expected: '[5, 3, 2, 4] (Suma: 14)',
          actual: `${JSON.stringify(out1)} (Suma: ${Array.isArray(out1) ? out1.reduce((a, b) => a + b, 0) : 'N/A'})`
        });

        // Test 2: [5, -4, 2, 4, -1] -> [5, -4, 2, 4] (sum 7)
        const arr2 = [5, -4, 2, 4, -1];
        const res2 = await service.executePython(code, 'subarreglo_maxima_suma', [arr2]);
        const out2 = res2.result as number[];
        const val2 = maxSubarrayValidator.validate({ array: arr2 }, out2);
        results.push({
          testId: 'py-maxsub-case2',
          description: {
            es: 'Caso Cátedra 2 (Cruzado supera ramas): [5, -4, 2, 4, -1] -> suma 7.',
            en: 'Course Case 2 (Crossing beats branches): [5, -4, 2, 4, -1] -> sum 7.'
          },
          passed: val2.valid,
          expected: '[5, -4, 2, 4] (Suma: 7)',
          actual: `${JSON.stringify(out2)} (Suma: ${Array.isArray(out2) ? out2.reduce((a, b) => a + b, 0) : 'N/A'})`
        });

        // Test 3: All negative [-5, -2, -8] -> [-2] (sum -2)
        const arr3 = [-5, -2, -8];
        const res3 = await service.executePython(code, 'subarreglo_maxima_suma', [arr3]);
        const out3 = res3.result as number[];
        const val3 = maxSubarrayValidator.validate({ array: arr3 }, out3);
        results.push({
          testId: 'py-maxsub-case3-all-negative',
          description: {
            es: 'Caso con números negativos: [-5, -2, -8] -> subarreglo [-2] con suma -2.',
            en: 'All negative array: [-5, -2, -8] -> subarray [-2] with sum -2.'
          },
          passed: val3.valid,
          expected: '[-2] (Suma: -2)',
          actual: `${JSON.stringify(out3)} (Suma: ${Array.isArray(out3) ? out3.reduce((a, b) => a + b, 0) : 'N/A'})`
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

      case 'linear-programming-formulation': {
        const c: [number, number] = [3, 2];
        const restricciones = [
          [2, 1, 18],
          [2, 3, 42],
          [3, 1, 24]
        ];

        const res = await service.executePython(code, 'resolver_lp_2d', [c, restricciones]);
        if (res.stdout) capturedStdout += res.stdout + '\n';

        if (!res.success) {
          return {
            passed: false,
            results: [{
              testId: 'lp-exec-fail',
              description: { es: 'Ejecución de resolver_lp_2d(c, restricciones)', en: 'Execution of resolver_lp_2d(c, restricciones)' },
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

        const out = res.result as { optimo?: [number, number]; valor_maximo?: number };
        const optPoint = out?.optimo || [0, 0];
        const validation = linearProgrammingValidator.validate(
          {
            objective: [3, 2],
            constraints: [
              { a: 2, b: 1, c: 18, label: '2x + y <= 18' },
              { a: 2, b: 3, c: 42, label: '2x + 3y <= 42' },
              { a: 3, b: 1, c: 24, label: '3x + y <= 24' }
            ]
          },
          optPoint
        );

        results.push({
          testId: 'py-lp-optimal-point',
          description: {
            es: 'Vértice óptimo: max 3x + 2y alcanza su máximo en (3, 12).',
            en: 'Optimal vertex: max 3x + 2y reaches maximum at (3, 12).'
          },
          passed: validation.valid,
          expected: '(3, 12)',
          actual: `(${optPoint[0]}, ${optPoint[1]})`
        });

        results.push({
          testId: 'py-lp-max-value',
          description: {
            es: 'Valor óptimo z*: El valor máximo alcanzado es z* = 33.',
            en: 'Optimal value z*: Maximum value reached is z* = 33.'
          },
          passed: Math.abs((out?.valor_maximo ?? 0) - 33) < 1e-3 || validation.valid,
          expected: 'z* = 33',
          actual: `z* = ${out?.valor_maximo ?? 'N/A'}`
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

      case 'randomized-fair-coin': {
        const testHarness = `
def __evaluar_secuencia__(secuencia):
    idx = [0]
    def fuente():
        val = secuencia[idx[0] % len(secuencia)]
        idx[0] += 1
        return val
    return moneda_equilibrada(fuente)

def __evaluar_monte_carlo__(p, n):
    import random
    def fuente():
        return 1 if random.random() < p else 0
    ceros = 0
    unos = 0
    for _ in range(n):
        b = moneda_equilibrada(fuente)
        if b == 0:
            ceros += 1
        else:
            unos += 1
    return [ceros, unos]
`;
        const fullCode = code + '\n' + testHarness;

        // Test 1: Sequence [0, 0, 1, 1, 0, 1] -> tie (0,0), tie (1,1), (0,1) -> returns 0
        const res1 = await service.executePython(fullCode, '__evaluar_secuencia__', [[0, 0, 1, 1, 0, 1]]);
        if (res1.stdout) capturedStdout += res1.stdout + '\n';
        if (!res1.success) {
          return {
            passed: false,
            results: [{
              testId: 'coin-exec-fail',
              description: { es: 'Ejecución de moneda_equilibrada(fuente)', en: 'Execution of moneda_equilibrada(fuente)' },
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

        const bit1 = res1.result as number;
        results.push({
          testId: 'py-coin-seq-zero',
          description: {
            es: 'Extracción de 0: Par (0, 1) tras descartar empates (0, 0) y (1, 1).',
            en: 'Extraction of 0: Pair (0, 1) after discarding ties (0, 0) and (1, 1).'
          },
          passed: bit1 === 0,
          expected: '0',
          actual: `${bit1}`
        });

        // Test 2: Sequence [1, 0] -> immediate (1, 0) -> returns 1
        const res2 = await service.executePython(fullCode, '__evaluar_secuencia__', [[1, 0]]);
        const bit2 = res2.result as number;
        results.push({
          testId: 'py-coin-seq-one',
          description: {
            es: 'Extracción de 1: Par (1, 0) retorna 1.',
            en: 'Extraction of 1: Pair (1, 0) returns 1.'
          },
          passed: bit2 === 1,
          expected: '1',
          actual: `${bit2}`
        });

        // Test 3: Monte Carlo simulation with biased coin (p = 0.35, N = 400)
        const res3 = await service.executePython(fullCode, '__evaluar_monte_carlo__', [0.35, 400]);
        const mcRes = Array.isArray(res3.result) ? res3.result as [number, number] : [0, 0];
        const [ceros, unos] = mcRes;
        const totalTrials = ceros + unos;
        const ratio0 = totalTrials > 0 ? (ceros / totalTrials) * 100 : 0;
        const ratio1 = totalTrials > 0 ? (unos / totalTrials) * 100 : 0;
        const validation = randomizedFairCoinValidator.validate(
          { bias: 0.35, trials: 400 },
          { empiricalRatio0: ratio0, empiricalRatio1: ratio1, avgFlips: 1 / (0.35 * 0.65) }
        );
        const mcPassed = validation.valid || (Math.abs(ratio0 - 50.0) < 12.0 && totalTrials === 400);

        results.push({
          testId: 'py-coin-monte-carlo',
          description: {
            es: 'Simulación de Monte Carlo (p=0.35, N=400): distribución convergente a 50% / 50%.',
            en: 'Monte Carlo simulation (p=0.35, N=400): distribution converges to 50% / 50%.'
          },
          passed: mcPassed,
          expected: '~50% ceros, ~50% unos',
          actual: `${ratio0.toFixed(1)}% ceros (${ceros}), ${ratio1.toFixed(1)}% unos (${unos})`
        });
        break;
      }

      case 'road-antennas-greedy': {
        // Test 1: 9 houses with R = 10 -> [14, 36, 70]
        const t1Houses = [4, 12, 18, 26, 32, 45, 60, 68, 75];
        const res1 = await service.executePython(code, 'construir_antenas', [t1Houses, 10]);
        if (res1.stdout) capturedStdout += res1.stdout + '\n';
        if (!res1.success) {
          return {
            passed: false,
            results: [{
              testId: 'antennas-exec-fail',
              description: { es: 'Ejecución de construir_antenas(casas, radio)', en: 'Execution of construir_antenas(casas, radio)' },
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

        const out1 = (Array.isArray(res1.result) ? res1.result : []) as number[];
        const val1 = roadAntennasValidator.validate({ houses: t1Houses, radius: 10 }, out1);
        results.push({
          testId: 'py-road-typical',
          description: {
            es: 'Caso típico (9 casas, R = 10 km): Cobertura completa y mínima con 3 antenas.',
            en: 'Typical case (9 houses, R = 10 km): Complete and minimal coverage with 3 antennas.'
          },
          passed: val1.valid,
          expected: '3 antenas ([14, 36, 70])',
          actual: val1.valid ? `${out1.length} antenas: [${out1.join(', ')}]` : val1.errors.join('; ')
        });

        // Test 2: Dense cluster (R = 10 km) -> single antenna
        const t2Houses = [10, 15, 20, 25, 30];
        const res2 = await service.executePython(code, 'construir_antenas', [t2Houses, 10]);
        const out2 = (Array.isArray(res2.result) ? res2.result : []) as number[];
        const val2 = roadAntennasValidator.validate({ houses: t2Houses, radius: 10 }, out2);
        results.push({
          testId: 'py-road-dense',
          description: {
            es: 'Cluster denso (5 casas dentro de 2R): 1 sola antena óptima.',
            en: 'Dense cluster (5 houses within 2R): 1 single optimal antenna.'
          },
          passed: val2.valid,
          expected: '1 antena en km 20',
          actual: val2.valid ? `${out2.length} antena(s): [${out2.join(', ')}]` : val2.errors.join('; ')
        });

        // Test 3: Unsorted input (Pueblos Ruta 2 desordenados, R = 50 km)
        const t3Houses = [270, 156, 194, 242, 185];
        const res3 = await service.executePython(code, 'construir_antenas', [t3Houses, 50]);
        const out3 = (Array.isArray(res3.result) ? res3.result : []) as number[];
        const val3 = roadAntennasValidator.validate({ houses: t3Houses, radius: 50 }, out3);
        results.push({
          testId: 'py-road-unsorted',
          description: {
            es: 'Casas desordenadas (Pueblos Ruta 2, R = 50 km): ordenamiento correcto y cobertura óptima.',
            en: 'Unsorted houses (Highway 2 towns, R = 50 km): correct sorting and optimal coverage.'
          },
          passed: val3.valid,
          expected: 'Cobertura óptima válida',
          actual: val3.valid ? `${out3.length} antenas: [${out3.join(', ')}]` : val3.errors.join('; ')
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
