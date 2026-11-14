import { PythonTestStrategy } from './types';
import { TestCaseResult } from '../../engine/exerciseContent';
import { mergeSortValidator } from '../../engine/algorithms/mergeSortValidator';
import { maxSubarrayValidator } from '../../engine/algorithms/maxSubarrayValidator';
import { peakFindingValidator } from '../../engine/algorithms/peakFindingValidator';
import { inversionCountingValidator } from '../../engine/algorithms/inversionCountingValidator';
import { closestPairValidator } from '../../engine/algorithms/closestPairValidator';
import { karatsubaValidator } from '../../engine/algorithms/karatsubaValidator';
import { medianOfMediansValidator } from '../../engine/algorithms/medianOfMediansValidator';
import { majorityElementValidator } from '../../engine/algorithms/majorityElementValidator';

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
                es: 'Caso general: Ordenamiento estable de arreglo desordenado [38, 27, 43, 3, 9, 82, 10]',
                en: 'General case: Stable sorting of unsorted array [38, 27, 43, 3, 9, 82, 10]'
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
  'closest-pair-dyc': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    const pts1: [number, number][] = [[0, 0], [3, 4], [1, 1]];
    const res1 = await service.executePython(code, 'par_mas_cercano', [pts1]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-closest-pair-exec-fail',
          description: { es: 'Ejecución en Python de par_mas_cercano(puntos)', en: 'Python execution of par_mas_cercano(puntos)' },
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

    const dist1 = typeof res1.result === 'number' ? res1.result : NaN;
    const val1 = closestPairValidator.validate(pts1, dist1);

    results.push({
      testId: 'py-closest-pair-triangle',
      description: {
        es: 'Triángulo [(0,0), (3,4), (1,1)]: Distancia mínima calculada ≈ 1.4142.',
        en: 'Triangle [(0,0), (3,4), (1,1)]: Minimal distance ≈ 1.4142.'
      },
      passed: val1.valid,
      expected: '1.4142',
      actual: val1.valid ? String(dist1) : val1.errors.join('; ')
    });

    // Test 2: Horizontal strip split
    const pts2: [number, number][] = [[2, 3], [12, 30], [40, 50], [5, 1], [12, 10], [3, 4]];
    const res2 = await service.executePython(code, 'par_mas_cercano', [pts2]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const dist2 = typeof res2.result === 'number' ? res2.result : NaN;
    const val2 = closestPairValidator.validate(pts2, dist2);

    results.push({
      testId: 'py-closest-pair-strip',
      description: {
        es: 'Puntos cruzando la franja: Distancia mínima ≈ 1.4142 entre (2,3) y (3,4).',
        en: 'Points crossing central strip: Minimal distance ≈ 1.4142.'
      },
      passed: val2.valid,
      expected: '1.4142',
      actual: val2.valid ? String(dist2) : val2.errors.join('; ')
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
  'karatsuba-dyc': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    const res1 = await service.executePython(code, 'multiplicar_karatsuba', [1234, 5678]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-karatsuba-exec-fail',
          description: { es: 'Ejecución en Python de multiplicar_karatsuba(x, y)', en: 'Python execution of multiplicar_karatsuba(x, y)' },
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

    const val1 = Number(res1.result);
    const check1 = karatsubaValidator.validate([1234, 5678], val1);

    results.push({
      testId: 'py-karatsuba-4digits',
      description: {
        es: 'Producto 1234 × 5678 = 7006652.',
        en: 'Product 1234 × 5678 = 7006652.'
      },
      passed: check1.valid,
      expected: '7006652',
      actual: check1.valid ? String(val1) : check1.errors.join('; ')
    });

    // Test 2: Base case
    const res2 = await service.executePython(code, 'multiplicar_karatsuba', [6, 7]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const val2 = Number(res2.result);
    const check2 = karatsubaValidator.validate([6, 7], val2);

    results.push({
      testId: 'py-karatsuba-base-case',
      description: {
        es: 'Caso base un dígito: 6 × 7 = 42.',
        en: 'Base case single digit: 6 × 7 = 42.'
      },
      passed: check2.valid,
      expected: '42',
      actual: check2.valid ? String(val2) : check2.errors.join('; ')
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
  'median-of-medians-dyc': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    const arr1 = [12, 3, 5, 7, 4, 19, 26];
    const res1 = await service.executePython(code, 'k_esimo_elemento', [arr1, 0]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-mom-exec-fail',
          description: { es: 'Ejecución en Python de k_esimo_elemento(arr, k)', en: 'Python execution of k_esimo_elemento(arr, k)' },
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

    const val1 = Number(res1.result);
    const check1 = medianOfMediansValidator.validate({ array: arr1, k: 0 }, val1);

    results.push({
      testId: 'py-mom-min',
      description: {
        es: 'Elemento mínimo (k = 0) en [12, 3, 5, 7, 4, 19, 26]: Retorna 3.',
        en: 'Minimum element (k = 0) in [12, 3, 5, 7, 4, 19, 26]: Returns 3.'
      },
      passed: check1.valid,
      expected: '3',
      actual: check1.valid ? String(val1) : check1.errors.join('; ')
    });

    // Test 2: Median (k = 3)
    const res2 = await service.executePython(code, 'k_esimo_elemento', [arr1, 3]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const val2 = Number(res2.result);
    const check2 = medianOfMediansValidator.validate({ array: arr1, k: 3 }, val2);

    results.push({
      testId: 'py-mom-median',
      description: {
        es: 'Mediana (k = 3) en [12, 3, 5, 7, 4, 19, 26]: Retorna 7.',
        en: 'Median (k = 3) in [12, 3, 5, 7, 4, 19, 26]: Returns 7.'
      },
      passed: check2.valid,
      expected: '7',
      actual: check2.valid ? String(val2) : check2.errors.join('; ')
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
  'majority-element-dyc': async (code, service) => {
    const results: TestCaseResult[] = [];
    let capturedStdout = '';

    const arr1 = [3, 3, 4, 2, 4, 4, 2, 4, 4];
    const res1 = await service.executePython(code, 'elemento_mayoritario', [arr1]);
    if (res1.stdout) capturedStdout += res1.stdout + '\n';
    if (!res1.success) {
      return {
        passed: false,
        results: [{
          testId: 'py-majority-exec-fail',
          description: { es: 'Ejecución en Python de elemento_mayoritario(arr)', en: 'Python execution of elemento_mayoritario(arr)' },
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

    const val1 = res1.result as number | null;
    const check1 = majorityElementValidator.validate(arr1, val1);

    results.push({
      testId: 'py-majority-winner',
      description: {
        es: 'Arreglo [3, 3, 4, 2, 4, 4, 2, 4, 4]: Mayoritario absoluto es 4 (5 apariciones de 9).',
        en: 'Array [3, 3, 4, 2, 4, 4, 2, 4, 4]: Absolute majority is 4.'
      },
      passed: check1.valid,
      expected: '4',
      actual: check1.valid ? String(val1) : check1.errors.join('; ')
    });

    // Test 2: No majority
    const arr2 = [1, 2, 3, 4, 5];
    const res2 = await service.executePython(code, 'elemento_mayoritario', [arr2]);
    if (res2.stdout) capturedStdout += res2.stdout + '\n';
    const val2 = res2.result as number | null;
    const check2 = majorityElementValidator.validate(arr2, val2);

    results.push({
      testId: 'py-majority-none',
      description: {
        es: 'Arreglo sin ganador [1, 2, 3, 4, 5]: Debe retornar None.',
        en: 'Array without winner [1, 2, 3, 4, 5]: Must return None.'
      },
      passed: check2.valid,
      expected: 'None',
      actual: check2.valid ? (val2 === null || val2 === undefined ? 'None' : String(val2)) : check2.errors.join('; ')
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
