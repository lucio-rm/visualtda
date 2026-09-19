import { ValidationResult, Validator } from '../../types/validation';

export interface LcsInput {
  s1: string;
  s2: string;
}

export function isSubsequence(sub: string, full: string): boolean {
  let subIdx = 0;
  for (let i = 0; i < full.length && subIdx < sub.length; i++) {
    if (full[i] === sub[subIdx]) {
      subIdx++;
    }
  }
  return subIdx === sub.length;
}

export function computeLcsTable(s1: string, s2: string): number[][] {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
}

export function solveLcs(s1: string, s2: string): string {
  const m = s1.length;
  const n = s2.length;
  if (m === 0 || n === 0) return '';

  const dp = computeLcsTable(s1, s2);

  const res: string[] = [];
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (s1[i - 1] === s2[j - 1]) {
      res.push(s1[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return res.reverse().join('');
}

export class LcsValidator implements Validator<LcsInput, string> {
  validate(input: LcsInput, result: string): ValidationResult {
    const { s1, s2 } = input;
    const errors: string[] = [];

    if (typeof result !== 'string') {
      return {
        valid: false,
        errors: ['El resultado devuelto debe ser un string correspondiente a la subsecuencia.']
      };
    }

    const optimalLength = computeLcsTable(s1, s2)[s1.length][s2.length];

    if (s1.length === 0 || s2.length === 0) {
      if (result !== '') {
        errors.push('Si alguna de las cadenas es vacía, la subsecuencia común debe ser una cadena vacía ("").');
      }
      return { valid: errors.length === 0, errors };
    }

    // Check 1: Is result a subsequence of s1?
    if (!isSubsequence(result, s1)) {
      errors.push(`"${result}" no es una subsecuencia válida de la primera cadena "${s1}".`);
    }

    // Check 2: Is result a subsequence of s2?
    if (!isSubsequence(result, s2)) {
      errors.push(`"${result}" no es una subsecuencia válida de la segunda cadena "${s2}".`);
    }

    // Check 3: Is result's length optimal?
    if (result.length < optimalLength) {
      errors.push(
        `La longitud de la subsecuencia devuelta (${result.length}) es subóptima. La longitud máxima alcanzable es ${optimalLength}.`
      );
    } else if (result.length > optimalLength) {
      errors.push(`La longitud de la subsecuencia devuelta excede el óptimo teórico (${optimalLength}).`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const lcsValidator = new LcsValidator();
