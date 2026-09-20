import { PythonTestStrategy } from './types';
import { TestCaseResult } from '../../engine/exerciseContent';
import { mergeSortValidator } from '../../engine/algorithms/mergeSortValidator';
import { maxSubarrayValidator } from '../../engine/algorithms/maxSubarrayValidator';
import { peakFindingValidator } from '../../engine/algorithms/peakFindingValidator';
import { inversionCountingValidator } from '../../engine/algorithms/inversionCountingValidator';

export const divideAndConquerRunners: Record<string, PythonTestStrategy> = {
  'merge-sort': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'max-subarray-dyc': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

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

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      passed: totalPassed === results.length && results.length > 0,
      results,
      totalPassed,
      totalTests: results.length,
      stdout: capturedStdout.trim() || undefined
    };
  },
  'peak-finding-dyc': async (code, service) => {
    const results: TestCaseResult[] = [];
    const capturedStdout = '';

    // Test 1: Single central mountain [1, 3, 7, 12, 18, 14, 9, 2] -> index 4
            const t1Arr = [1, 3, 7, 12, 18, 14, 9, 2];
            const res1 = await service.executePython(code, 'buscar_pico', [t1Arr]);
            const out1 = Number(res1.result);
            const val1 = peakFindingValidator.validate({ array: t1Arr }, out1);
            results.push({
              testId: 'py-peak-mountain',
              description: {
                es: 'Montaña única [1, 3, 7, 12, 18, 14, 9, 2]: Debe encontrar el pico en índice 4 (valor 18).',
                en: 'Single mountain [1, 3, 7, 12, 18, 14, 9, 2]: Must find peak at index 4 (value 18).'
              },
              passed: val1.valid && out1 === 4,
              expected: 'Índice 4 (valor 18)',
              actual: val1.valid ? `Índice ${out1} (valor ${t1Arr[out1]})` : val1.errors.join('; ')
            });

            // Test 2: Multiple crests [4, 10, 5, 8, 15, 3, 11, 2]
            const t2Arr = [4, 10, 5, 8, 15, 3, 11, 2];
            const res2 = await service.executePython(code, 'buscar_pico', [t2Arr]);
            const out2 = Number(res2.result);
            const val2 = peakFindingValidator.validate({ array: t2Arr }, out2);
            results.push({
              testId: 'py-peak-crests',
              description: {
                es: 'Cordillera [4, 10, 5, 8, 15, 3, 11, 2]: Retorna un pico local válido en O(log n).',
                en: 'Range [4, 10, 5, 8, 15, 3, 11, 2]: Returns a valid local peak in O(log n).'
              },
              passed: val2.valid,
              expected: 'Cualquier pico local válido (1, 4 ó 6)',
              actual: val2.valid ? `Índice ${out2} (valor ${t2Arr[out2]})` : val2.errors.join('; ')
            });

            // Test 3: Monotonically increasing [2, 5, 9, 14, 21, 30] -> index 5
            const t3Arr = [2, 5, 9, 14, 21, 30];
            const res3 = await service.executePython(code, 'buscar_pico', [t3Arr]);
            const out3 = Number(res3.result);
            const val3 = peakFindingValidator.validate({ array: t3Arr }, out3);
            results.push({
              testId: 'py-peak-increasing',
              description: {
                es: 'Monótonamente creciente [2, 5, 9, 14, 21, 30]: Pico en extremo derecho (índice 5).',
                en: 'Monotonically increasing [2, 5, 9, 14, 21, 30]: Peak at right edge (index 5).'
              },
              passed: val3.valid && out3 === 5,
              expected: 'Índice 5 (valor 30)',
              actual: val3.valid ? `Índice ${out3} (valor ${t3Arr[out3]})` : val3.errors.join('; ')
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
  'inversion-counting-dyc': async (code, service) => {
    const results: TestCaseResult[] = [];
    const capturedStdout = '';

    // Test 1: CLRS classic
            const t1Arr = [2, 3, 8, 6, 1];
            const res1 = await service.executePython(code, 'contar_inversiones', [t1Arr]);
            const out1 = typeof res1.result === 'number' ? res1.result : Number(res1.result);
            const val1 = inversionCountingValidator.validate({ array: t1Arr }, out1);
            results.push({
              testId: 'py-inv-clrs-classic',
              description: {
                es: 'Caso clásico CLRS [2, 3, 8, 6, 1]: Exactamente 5 inversiones.',
                en: 'Classic CLRS case [2, 3, 8, 6, 1]: Exactly 5 inversions.'
              },
              passed: val1.valid && out1 === 5,
              expected: '5 inversiones',
              actual: val1.valid ? `${out1} inversiones` : val1.errors.join('; ')
            });

            // Test 2: Decreasing strictly
            const t2Arr = [5, 4, 3, 2, 1];
            const res2 = await service.executePython(code, 'contar_inversiones', [t2Arr]);
            const out2 = typeof res2.result === 'number' ? res2.result : Number(res2.result);
            const val2 = inversionCountingValidator.validate({ array: t2Arr }, out2);
            results.push({
              testId: 'py-inv-strictly-reversed',
              description: {
                es: 'Arreglo decreciente [5, 4, 3, 2, 1]: n*(n-1)/2 = 10 inversiones.',
                en: 'Decreasing array [5, 4, 3, 2, 1]: n*(n-1)/2 = 10 inversions.'
              },
              passed: val2.valid && out2 === 10,
              expected: '10 inversiones',
              actual: val2.valid ? `${out2} inversiones` : val2.errors.join('; ')
            });

            // Test 3: Already sorted
            const t3Arr = [1, 2, 3, 4, 5, 6];
            const res3 = await service.executePython(code, 'contar_inversiones', [t3Arr]);
            const out3 = typeof res3.result === 'number' ? res3.result : Number(res3.result);
            const val3 = inversionCountingValidator.validate({ array: t3Arr }, out3);
            results.push({
              testId: 'py-inv-already-sorted',
              description: {
                es: 'Arreglo ordenado [1, 2, 3, 4, 5, 6]: Exactamente 0 inversiones.',
                en: 'Sorted array [1, 2, 3, 4, 5, 6]: Exactly 0 inversions.'
              },
              passed: val3.valid && out3 === 0,
              expected: '0 inversiones',
              actual: val3.valid ? `${out3} inversiones` : val3.errors.join('; ')
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
