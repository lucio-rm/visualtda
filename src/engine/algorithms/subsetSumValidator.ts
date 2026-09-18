import { ValidationResult, Validator } from '../../types/validation';

export interface SubsetSumInput {
  numbers: number[];
  target: number;
}

export function solveSubsetSum(numbers: number[], target: number): number[][] {
  if (!numbers.length || target <= 0) return [];
  const elements = numbers.filter((x) => x > 0 && x <= target).sort((a, b) => b - a);
  const solutions: number[][] = [];
  const currentSubset: number[] = [];
  const totalRemaining = elements.reduce((acc, v) => acc + v, 0);

  function backtrack(idx: number, currentSum: number, remaining: number): void {
    if (currentSum === target) {
      solutions.push([...currentSubset]);
      return;
    }
    if (idx >= elements.length) return;

    const elem = elements[idx];
    const newRemaining = remaining - elem;

    // Branch 1: Include elem (Prune excess)
    if (currentSum + elem <= target) {
      currentSubset.push(elem);
      backtrack(idx + 1, currentSum + elem, newRemaining);
      currentSubset.pop();
    }

    // Branch 2: Exclude elem (Prune deficit)
    if (currentSum + newRemaining >= target) {
      backtrack(idx + 1, currentSum, newRemaining);
    }
  }

  backtrack(0, 0, totalRemaining);
  return solutions;
}

export class SubsetSumValidator implements Validator<SubsetSumInput, number[][]> {
  validate(input: SubsetSumInput, result: number[][]): ValidationResult {
    const { numbers, target } = input;
    const errors: string[] = [];

    if (!Array.isArray(result)) {
      return {
        valid: false,
        errors: ['El resultado debe ser una lista de subconjuntos (lista de listas).']
      };
    }

    // Build frequency map of original numbers
    const originalFreq = new Map<number, number>();
    for (const num of numbers) {
      originalFreq.set(num, (originalFreq.get(num) || 0) + 1);
    }

    const seenSubsets = new Set<string>();

    for (let i = 0; i < result.length; i++) {
      const subset = result[i];
      if (!Array.isArray(subset)) {
        errors.push(`El elemento en índice ${i} no es un subconjunto válido.`);
        continue;
      }

      // 1. Verify sum
      const sum = subset.reduce((acc, val) => acc + val, 0);
      if (sum !== target) {
        errors.push(
          `Subconjunto [${subset.join(', ')}] inválido: su suma es ${sum}, pero se esperaba ${target}.`
        );
      }

      // 2. Verify sub-multiset validity (no numbers invented or overused)
      const subsetFreq = new Map<number, number>();
      for (const num of subset) {
        subsetFreq.set(num, (subsetFreq.get(num) || 0) + 1);
      }

      for (const [num, count] of subsetFreq.entries()) {
        const available = originalFreq.get(num) || 0;
        if (count > available) {
          errors.push(
            `Subconjunto [${subset.join(', ')}] utiliza el número ${num} ${count} veces, pero en la lista original solo aparece ${available} vez/veces.`
          );
        }
      }

      // 3. Verify no duplicates in the returned list
      const key = [...subset].sort((a, b) => a - b).join(',');
      if (seenSubsets.has(key)) {
        errors.push(`El subconjunto [${subset.join(', ')}] aparece duplicado en la solución devuelta.`);
      }
      seenSubsets.add(key);
    }

    // 4. Verify completeness against canonical solutions count
    const canonical = solveSubsetSum(numbers, target);
    if (canonical.length > 0 && result.length === 0) {
      errors.push(`Se esperaban ${canonical.length} subconjunto(s) que sumaran ${target}, pero se retornaron 0.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const subsetSumValidator = new SubsetSumValidator();
