import { PythonTestStrategy } from './types';
import { TestCaseResult } from '../../engine/exerciseContent';
import { knapsackDpValidator, KnapsackItem } from '../../engine/algorithms/knapsackDpValidator';
import { juanElVagoValidator } from '../../engine/algorithms/juanElVagoValidator';
import { coinChangeValidator } from '../../engine/algorithms/coinChangeValidator';
import { lcsValidator } from '../../engine/algorithms/lcsValidator';
import { weightedIntervalValidator, WeightedInterval } from '../../engine/algorithms/weightedIntervalValidator';
import { segmentedLeastSquaresValidator } from '../../engine/algorithms/segmentedLeastSquaresValidator';
import { rnaSecondaryStructureValidator } from '../../engine/algorithms/rnaSecondaryStructureValidator';
import { bellmanFordValidator } from '../../engine/algorithms/bellmanFordValidator';

export const dpRunners: Record<string, PythonTestStrategy> = {
  'knapsack-dp': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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
            const domainItems: KnapsackItem[] = chosenItems.map((rawIt: unknown) => {
              if (Array.isArray(rawIt)) {
                return {
                  id: String(rawIt[0]),
                  name: String(rawIt[0]),
                  weight: Number(rawIt[1]),
                  value: Number(rawIt[2])
                };
              }
              const it = (typeof rawIt === 'object' && rawIt !== null ? rawIt : {}) as Record<string, unknown>;
              const id = String(it.id || it.name || it.nombre || '');
              return {
                id,
                name: id,
                weight: Number(it.peso ?? it.weight ?? 0),
                value: Number(it.valor ?? it.value ?? 0)
              };
            });

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'juan-el-vago': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'coin-change-dp': async (code, service) => {
    const results: TestCaseResult[] = [];
    const capturedStdout = '';

    // Test 1: Classic counterexample [1, 3, 4], target 6 -> [3, 3] (length 2)
            const t1Coins = [1, 3, 4];
            const res1 = await service.executePython(code, 'cambio_monedas_minimo', [t1Coins, 6]);
            const out1 = (Array.isArray(res1.result) ? res1.result : []) as number[];
            const val1 = coinChangeValidator.validate({ coins: t1Coins, target: 6 }, out1);
            results.push({
              testId: 'py-coin-counterexample',
              description: {
                es: 'Contraejemplo clásico [1, 3, 4] con target 6: Óptimo = 2 monedas [3, 3] (rechaza Greedy [4, 1, 1]).',
                en: 'Classic counterexample [1, 3, 4] target 6: Optimal = 2 coins [3, 3] (rejects Greedy [4, 1, 1]).'
              },
              passed: val1.valid && out1.length === 2,
              expected: '2 monedas ([3, 3])',
              actual: val1.valid ? `${out1.length} monedas (${JSON.stringify(out1)})` : val1.errors.join('; ')
            });

            // Test 2: Greedy trap II [1, 5, 6, 9], target 11 -> [6, 5] (length 2)
            const t2Coins = [1, 5, 6, 9];
            const res2 = await service.executePython(code, 'cambio_monedas_minimo', [t2Coins, 11]);
            const out2 = (Array.isArray(res2.result) ? res2.result : []) as number[];
            const val2 = coinChangeValidator.validate({ coins: t2Coins, target: 11 }, out2);
            results.push({
              testId: 'py-coin-greedy-trap',
              description: {
                es: 'Trampa Greedy [1, 5, 6, 9] con target 11: Óptimo = 2 monedas [6, 5] (Greedy daría 3 monedas [9, 1, 1]).',
                en: 'Greedy trap [1, 5, 6, 9] target 11: Optimal = 2 coins [6, 5] (Greedy would give 3 coins [9, 1, 1]).'
              },
              passed: val2.valid && out2.length === 2,
              expected: '2 monedas ([6, 5])',
              actual: val2.valid ? `${out2.length} monedas (${JSON.stringify(out2)})` : val2.errors.join('; ')
            });

            // Test 3: Impossible target [2, 4], target 5 -> []
            const t3Coins = [2, 4];
            const res3 = await service.executePython(code, 'cambio_monedas_minimo', [t3Coins, 5]);
            const out3 = (Array.isArray(res3.result) ? res3.result : []) as number[];
            const val3 = coinChangeValidator.validate({ coins: t3Coins, target: 5 }, out3);
            results.push({
              testId: 'py-coin-impossible',
              description: {
                es: 'Cambio imposible [2, 4] con target 5: Retorna lista vacía [].',
                en: 'Impossible change [2, 4] target 5: Returns empty list [].'
              },
              passed: val3.valid && out3.length === 0,
              expected: '[]',
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
  'lcs-dp': async (code, service) => {
    const results: TestCaseResult[] = [];
    const capturedStdout = '';

    // Test 1: Classic CLRS "ABCBDAB" and "BDCABA" -> length 4
            const res1 = await service.executePython(code, 'subsecuencia_comun_mas_larga', ['ABCBDAB', 'BDCABA']);
            const out1 = String(res1.result ?? '');
            const val1 = lcsValidator.validate({ s1: 'ABCBDAB', s2: 'BDCABA' }, out1);
            results.push({
              testId: 'py-lcs-clrs',
              description: {
                es: 'Caso clásico CLRS "ABCBDAB" y "BDCABA": Longitud óptima 4.',
                en: 'Classic CLRS case "ABCBDAB" and "BDCABA": Optimal length 4.'
              },
              passed: val1.valid && out1.length === 4,
              expected: 'Longitud 4 (ej. "BCBA")',
              actual: val1.valid ? `"${out1}"` : val1.errors.join('; ')
            });

            // Test 2: Identical strings
            const res2 = await service.executePython(code, 'subsecuencia_comun_mas_larga', ['ALGORITMO', 'ALGORITMO']);
            const out2 = String(res2.result ?? '');
            const val2 = lcsValidator.validate({ s1: 'ALGORITMO', s2: 'ALGORITMO' }, out2);
            results.push({
              testId: 'py-lcs-identical',
              description: {
                es: 'Cadenas idénticas "ALGORITMO": Retorna "ALGORITMO".',
                en: 'Identical strings "ALGORITMO": Returns "ALGORITMO".'
              },
              passed: val2.valid && out2 === 'ALGORITMO',
              expected: '"ALGORITMO"',
              actual: val2.valid ? `"${out2}"` : val2.errors.join('; ')
            });

            // Test 3: Disjoint strings
            const res3 = await service.executePython(code, 'subsecuencia_comun_mas_larga', ['HOLA', 'TREN']);
            const out3 = String(res3.result ?? '');
            const val3 = lcsValidator.validate({ s1: 'HOLA', s2: 'TREN' }, out3);
            results.push({
              testId: 'py-lcs-disjoint',
              description: {
                es: 'Cadenas disjuntas "HOLA" y "TREN": Retorna cadena vacía "".',
                en: 'Disjoint strings "HOLA" and "TREN": Returns empty string "".'
              },
              passed: val3.valid && out3 === '',
              expected: '""',
              actual: `"${out3}"`
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
  'weighted-interval-scheduling': async (code, service) => {
    const results: TestCaseResult[] = [];
    const capturedStdout = '';

    // Test 1: Greedy trap counterexample
            const raw1 = [
              [0, 3, 2],
              [1, 6, 10],
              [4, 8, 3],
              [7, 11, 8],
              [9, 12, 4]
            ];
            const intervals1: WeightedInterval[] = raw1.map(([s, e, w], idx) => ({
              id: `T${idx + 1}`,
              start: s,
              end: e,
              weight: w
            }));
            const res1 = await service.executePython(code, 'planificar_intervalos_ponderados', [raw1]);
            const out1 = (Array.isArray(res1.result) ? res1.result : []) as number[][];
            const outInt1: WeightedInterval[] = out1.map(([s, e, w], idx) => {
              const matched = intervals1.find((item) => item.start === s && item.end === e && item.weight === w);
              return matched ?? { id: `out-${idx}`, start: s, end: e, weight: w };
            });
            const val1 = weightedIntervalValidator.validate({ intervals: intervals1 }, outInt1);
            const totalW1 = outInt1.reduce((sum, item) => sum + item.weight, 0);

            results.push({
              testId: 'py-weighted-greedy-trap',
              description: {
                es: 'Instancia con trampa greedy: debe elegir tareas compatibles con peso óptimo 18.',
                en: 'Greedy trap instance: must choose compatible tasks with optimal weight 18.'
              },
              passed: val1.valid && totalW1 === 18,
              expected: 'Peso 18 (tareas [1,6,10] y [7,11,8])',
              actual: val1.valid ? `Peso ${totalW1} (${outInt1.map((i) => `[${i.start},${i.end},w=${i.weight}]`).join(', ')})` : val1.errors.join('; ')
            });

            // Test 2: Disjoint intervals (all can be selected)
            const raw2 = [
              [1, 3, 5],
              [4, 6, 7],
              [7, 9, 10]
            ];
            const intervals2: WeightedInterval[] = raw2.map(([s, e, w], idx) => ({
              id: `T${idx + 1}`,
              start: s,
              end: e,
              weight: w
            }));
            const res2 = await service.executePython(code, 'planificar_intervalos_ponderados', [raw2]);
            const out2 = (Array.isArray(res2.result) ? res2.result : []) as number[][];
            const outInt2: WeightedInterval[] = out2.map(([s, e, w], idx) => {
              const matched = intervals2.find((item) => item.start === s && item.end === e && item.weight === w);
              return matched ?? { id: `out-${idx}`, start: s, end: e, weight: w };
            });
            const val2 = weightedIntervalValidator.validate({ intervals: intervals2 }, outInt2);
            const totalW2 = outInt2.reduce((sum, item) => sum + item.weight, 0);

            results.push({
              testId: 'py-weighted-disjoint',
              description: {
                es: 'Intervalos disjuntos: debe seleccionar todos los intervalos con peso total 22.',
                en: 'Disjoint intervals: must select all intervals with total weight 22.'
              },
              passed: val2.valid && totalW2 === 22 && outInt2.length === 3,
              expected: 'Peso 22 (3 intervalos)',
              actual: val2.valid ? `Peso ${totalW2} (${outInt2.length} intervalos)` : val2.errors.join('; ')
            });

            // Test 3: Completely overlapping intervals (choose single max weight)
            const raw3 = [
              [1, 10, 4],
              [2, 8, 15],
              [3, 9, 8]
            ];
            const intervals3: WeightedInterval[] = raw3.map(([s, e, w], idx) => ({
              id: `T${idx + 1}`,
              start: s,
              end: e,
              weight: w
            }));
            const res3 = await service.executePython(code, 'planificar_intervalos_ponderados', [raw3]);
            const out3 = (Array.isArray(res3.result) ? res3.result : []) as number[][];
            const outInt3: WeightedInterval[] = out3.map(([s, e, w], idx) => {
              const matched = intervals3.find((item) => item.start === s && item.end === e && item.weight === w);
              return matched ?? { id: `out-${idx}`, start: s, end: e, weight: w };
            });
            const val3 = weightedIntervalValidator.validate({ intervals: intervals3 }, outInt3);
            const totalW3 = outInt3.reduce((sum, item) => sum + item.weight, 0);

            results.push({
              testId: 'py-weighted-overlapping',
              description: {
                es: 'Todos los intervalos se superponen: debe elegir el único de mayor peso (15).',
                en: 'All intervals overlap: must choose the single heaviest one (weight 15).'
              },
              passed: val3.valid && totalW3 === 15 && outInt3.length === 1,
              expected: 'Peso 15 ([2, 8, 15])',
              actual: val3.valid ? `Peso ${totalW3} (${outInt3.map((i) => `[${i.start},${i.end},w=${i.weight}]`).join(', ')})` : val3.errors.join('; ')
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
  'segmented-least-squares-dp': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: Collinear points with C=5.0
    const pts1: [number, number][] = [[1, 1], [2, 2], [3, 3]];
    const res1 = await service.executePython(code, 'minimos_cuadrados_segmentados', [pts1, 5.0]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-sls-exec-fail',
          description: { es: 'Ejecución en Python de minimos_cuadrados_segmentados', en: 'Python execution of minimos_cuadrados_segmentados' },
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

    const tupleRes1 = res1.result as [number, number[]];
    const cost1 = Array.isArray(tupleRes1) ? tupleRes1[0] : Number(tupleRes1);
    const val1 = segmentedLeastSquaresValidator.validate({ points: pts1, penaltyC: 5.0 }, tupleRes1);

    results.push({
      testId: 'py-sls-collinear',
      description: {
        es: 'Puntos colineales [(1,1), (2,2), (3,3)] con C=5.0: Costo óptimo = 5.0 (1 recta sin error).',
        en: 'Collinear points with C=5.0: Optimal cost = 5.0.'
      },
      passed: val1.valid,
      expected: '5.0',
      actual: val1.valid ? String(cost1) : val1.errors.join('; ')
    });

    // Test 2: Two horizontal step levels with C=1.0 -> 2 lines, error=0 -> cost = 2.0
    const pts2: [number, number][] = [[0, 0], [1, 0], [2, 10], [3, 10]];
    const res2 = await service.executePython(code, 'minimos_cuadrados_segmentados', [pts2, 1.0]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const tupleRes2 = res2.result as [number, number[]];
    const cost2 = Array.isArray(tupleRes2) ? tupleRes2[0] : Number(tupleRes2);
    const val2 = segmentedLeastSquaresValidator.validate({ points: pts2, penaltyC: 1.0 }, tupleRes2);

    results.push({
      testId: 'py-sls-two-steps',
      description: {
        es: 'Dos escalones horizontales [(0,0),(1,0),(2,10),(3,10)] con C=1.0: Costo = 2.0.',
        en: 'Two horizontal steps with C=1.0: Cost = 2.0.'
      },
      passed: val2.valid,
      expected: '2.0',
      actual: val2.valid ? String(cost2) : val2.errors.join('; ')
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
  'rna-secondary-structure-dp': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: Hairpin "ACCCCU" (gap = 5 > 4) -> 1 pair
    const res1 = await service.executePython(code, 'estructura_secundaria_arn', ['ACCCCU']);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-rna-exec-fail',
          description: { es: 'Ejecución en Python de estructura_secundaria_arn', en: 'Python execution of estructura_secundaria_arn' },
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

    const pairs1 = Number(res1.result);
    const val1 = rnaSecondaryStructureValidator.validate('ACCCCU', pairs1);

    results.push({
      testId: 'py-rna-hairpin',
      description: {
        es: 'Horquilla "ACCCCU": Par A(0)-U(5) con separación 5 > 4: 1 par óptimo.',
        en: 'Hairpin "ACCCCU": Pair A(0)-U(5) with gap 5 > 4: 1 optimal pair.'
      },
      passed: val1.valid,
      expected: '1',
      actual: val1.valid ? String(pairs1) : val1.errors.join('; ')
    });

    // Test 2: Sequence too short "ACGU" (< 5) -> 0 pairs
    const res2 = await service.executePython(code, 'estructura_secundaria_arn', ['ACGU']);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const pairs2 = Number(res2.result);
    const val2 = rnaSecondaryStructureValidator.validate('ACGU', pairs2);

    results.push({
      testId: 'py-rna-short',
      description: {
        es: 'Secuencia corta "ACGU": Separación insuficiente para formar horquillas (0 pares).',
        en: 'Short sequence "ACGU": Insufficient separation for hairpins (0 pairs).'
      },
      passed: val2.valid,
      expected: '0',
      actual: val2.valid ? String(pairs2) : val2.errors.join('; ')
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
  'bellman-ford-dp': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    // Test 1: Graph with negative weight but no negative cycle: 0 -> 1 (w=-1), 1 -> 2 (w=3), 0 -> 2 (w=4)
    // Shortest paths from 0: 0->0=0, 0->1=-1, 0->2=2
    const edges1: [number, number, number][] = [
      [0, 1, -1],
      [1, 2, 3],
      [0, 2, 4]
    ];
    const res1 = await service.executePython(code, 'bellman_ford', [3, edges1, 0]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-bf-exec-fail',
          description: { es: 'Ejecución en Python de bellman_ford', en: 'Python execution of bellman_ford' },
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

    const tupleRes1 = res1.result as [Record<string, number>, boolean];
    const dists1 = Array.isArray(tupleRes1) ? tupleRes1[0] : null;
    const hasNegCycle1 = Array.isArray(tupleRes1) ? tupleRes1[1] : false;
    const val1 = bellmanFordValidator.validate({ numVertices: 3, edges: edges1, source: 0 }, tupleRes1);

    results.push({
      testId: 'py-bf-negative-edge-correct',
      description: {
        es: 'Grafo con arista negativa sin ciclo: Distancias desde 0: {0: 0, 1: -1, 2: 2}, ciclo=False.',
        en: 'Graph with negative edge and no cycle: Distances from 0: {0: 0, 1: -1, 2: 2}, cycle=False.'
      },
      passed: val1.valid,
      expected: 'dist[2] == 2 y tiene_ciclo == False',
      actual: val1.valid ? `dist: ${JSON.stringify(dists1)}, ciclo_negativo: ${hasNegCycle1}` : val1.errors.join('; ')
    });

    // Test 2: Graph with negative cycle: 0 -> 1 (1), 1 -> 2 (-3), 2 -> 0 (-1) -> sum = -3 < 0
    const edges2: [number, number, number][] = [
      [0, 1, 1],
      [1, 2, -3],
      [2, 0, -1]
    ];
    const res2 = await service.executePython(code, 'bellman_ford', [3, edges2, 0]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const tupleRes2 = res2.result as [Record<string, number>, boolean];
    const hasNegCycle2 = Array.isArray(tupleRes2) ? tupleRes2[1] : false;
    const val2 = bellmanFordValidator.validate({ numVertices: 3, edges: edges2, source: 0 }, tupleRes2);

    results.push({
      testId: 'py-bf-detects-negative-cycle',
      description: {
        es: 'Detección de ciclo de costo negativo: Debe retornar tiene_ciclo_negativo == True.',
        en: 'Negative cycle detection: Must return has_negative_cycle == True.'
      },
      passed: val2.valid && hasNegCycle2 === true,
      expected: 'tiene_ciclo_negativo == True',
      actual: val2.valid ? `tiene_ciclo_negativo == ${hasNegCycle2}` : val2.errors.join('; ')
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
