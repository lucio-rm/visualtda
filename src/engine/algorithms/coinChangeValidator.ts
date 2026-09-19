import { ValidationResult, Validator } from '../../types/validation';

export interface CoinChangeInput {
  coins: number[];
  target: number;
}

export function solveCoinChange(coins: number[], target: number): number[] {
  if (target <= 0 || !coins.length) return [];
  const validCoins = coins.filter((c) => c > 0).sort((a, b) => a - b);
  if (!validCoins.length) return [];

  const INF = 1e9;
  const dp = new Array(target + 1).fill(INF);
  const choice = new Array(target + 1).fill(-1);

  dp[0] = 0;

  for (let v = 1; v <= target; v++) {
    for (const c of validCoins) {
      if (c <= v) {
        const cost = dp[v - c] + 1;
        if (cost < dp[v]) {
          dp[v] = cost;
          choice[v] = c;
        }
      }
    }
  }

  if (dp[target] === INF) return [];

  const result: number[] = [];
  let curr = target;
  while (curr > 0) {
    const c = choice[curr];
    if (c <= 0) break;
    result.push(c);
    curr -= c;
  }

  return result.sort((a, b) => b - a);
}

export function solveCoinChangeGreedy(coins: number[], target: number): number[] | null {
  if (target <= 0 || !coins.length) return [];
  const sorted = [...coins].filter((c) => c > 0).sort((a, b) => b - a);

  const result: number[] = [];
  let remaining = target;

  for (const c of sorted) {
    while (remaining >= c) {
      result.push(c);
      remaining -= c;
    }
  }

  if (remaining === 0) return result;
  return null; // Greedy failed to make exact change
}

export class CoinChangeValidator implements Validator<CoinChangeInput, number[]> {
  validate(input: CoinChangeInput, result: number[]): ValidationResult {
    const { coins, target } = input;
    const errors: string[] = [];

    if (!Array.isArray(result)) {
      return {
        valid: false,
        errors: ['El resultado devuelto debe ser un arreglo de números (las monedas utilizadas).']
      };
    }

    if (target === 0) {
      if (result.length !== 0) {
        errors.push('Para un objetivo de 0 no debe utilizarse ninguna moneda.');
      }
      return { valid: errors.length === 0, errors };
    }

    const availableSet = new Set(coins);

    // 1. Check all returned coins are valid denominations
    for (const c of result) {
      if (!availableSet.has(c)) {
        errors.push(`La denominación ${c} no pertenece al sistema de monedas disponible [${coins.join(', ')}].`);
      }
    }

    // 2. Check exact sum
    const sum = result.reduce((acc, val) => acc + val, 0);
    if (sum !== target) {
      errors.push(`Las monedas devueltas suman ${sum}, pero el monto objetivo requerido es ${target}.`);
    }

    // 3. Check minimality against optimal DP solver
    const optimal = solveCoinChange(coins, target);
    if (optimal.length > 0) {
      if (result.length > optimal.length) {
        errors.push(
          `La cantidad de monedas (${result.length}) no es óptima. La Programación Dinámica resuelve este caso con solo ${optimal.length} moneda(s): [${optimal.join(', ')}].`
        );
      }
    } else if (result.length > 0) {
      errors.push(`No es posible formar el monto ${target} con las monedas dadas, pero se retornaron monedas.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const coinChangeValidator = new CoinChangeValidator();
