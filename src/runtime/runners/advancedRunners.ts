import { PythonTestStrategy } from './types';
import { TestCaseResult } from '../../engine/exerciseContent';
import { maxFlowValidator, FlowNetworkInput } from '../../engine/algorithms/maxFlowValidator';
import { linearProgrammingValidator } from '../../engine/algorithms/linearProgrammingValidator';
import { vertexCoverApproxValidator } from '../../engine/algorithms/vertexCoverApproxValidator';
import { randomizedFairCoinValidator } from '../../engine/algorithms/randomizedFairCoinValidator';

export const advancedRunners: Record<string, PythonTestStrategy> = {
  'max-flow': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'linear-programming-formulation': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'vertex-cover-reduction': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'vertex-cover-approx': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'randomized-fair-coin': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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
