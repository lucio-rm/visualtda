import { PythonTestStrategy } from './types';
import { TestCaseResult } from '../../engine/exerciseContent';
import { intervalSchedulingValidator, Interval } from '../../engine/algorithms/intervalSchedulingValidator';
import { knapsackGreedyValidator, FractionalAssignment } from '../../engine/algorithms/knapsackGreedyValidator';
import { KnapsackItem } from '../../engine/algorithms/knapsackDpValidator';
import { roadAntennasValidator } from '../../engine/algorithms/roadAntennasValidator';
import { huffmanValidator } from '../../engine/algorithms/huffmanValidator';

export const greedyRunners: Record<string, PythonTestStrategy> = {
  'interval-scheduling': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'knapsack-greedy': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'road-antennas-greedy': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'huffman-coding-greedy': async (code, service) => {
    const results: TestCaseResult[] = [];
    const capturedStdout = '';

    // Test 1: CLRS classic
            const t1Freqs: Record<string, number> = { A: 45, B: 13, C: 12, D: 16, E: 9, F: 5 };
            const res1 = await service.executePython(code, 'codificar_huffman', [t1Freqs]);
            const out1 = (typeof res1.result === 'object' && res1.result !== null ? res1.result : {}) as Record<string, string>;
            const val1 = huffmanValidator.validate({ frequencies: t1Freqs }, out1);
            results.push({
              testId: 'py-huffman-clrs',
              description: {
                es: 'Frecuencias clásicas CLRS: Códigos libres de prefijo con costo óptimo de 224 bits.',
                en: 'Classic CLRS frequencies: Prefix-free codes with optimal cost of 224 bits.'
              },
              passed: val1.valid,
              expected: 'Costo 224 bits (prefijo libre)',
              actual: val1.valid ? 'Costo 224 bits (válido)' : val1.errors.join('; ')
            });

            // Test 2: Single character
            const t2Freqs: Record<string, number> = { Z: 100 };
            const res2 = await service.executePython(code, 'codificar_huffman', [t2Freqs]);
            const out2 = (typeof res2.result === 'object' && res2.result !== null ? res2.result : {}) as Record<string, string>;
            const val2 = huffmanValidator.validate({ frequencies: t2Freqs }, out2);
            results.push({
              testId: 'py-huffman-single-char',
              description: {
                es: 'Un único símbolo { Z: 100 }: Asigna código {"Z": "0"}.',
                en: 'Single symbol { Z: 100 }: Assigns code {"Z": "0"}.'
              },
              passed: val2.valid && out2.Z === '0',
              expected: '{"Z": "0"}',
              actual: JSON.stringify(out2)
            });

            // Test 3: Binary source
            const t3Freqs: Record<string, number> = { '0': 70, '1': 30 };
            const res3 = await service.executePython(code, 'codificar_huffman', [t3Freqs]);
            const out3 = (typeof res3.result === 'object' && res3.result !== null ? res3.result : {}) as Record<string, string>;
            const val3 = huffmanValidator.validate({ frequencies: t3Freqs }, out3);
            results.push({
              testId: 'py-huffman-binary',
              description: {
                es: 'Fuente binaria {"0": 70, "1": 30}: Códigos de 1 bit para ambos símbolos.',
                en: 'Binary source {"0": 70, "1": 30}: 1-bit codes for both symbols.'
              },
              passed: val3.valid,
              expected: 'Códigos de 1 bit {"0": "0", "1": "1"} o inverso',
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
};
