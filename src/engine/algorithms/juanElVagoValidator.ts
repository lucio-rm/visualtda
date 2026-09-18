import { ValidationResult, Validator } from '../../types/validation';

export interface JuanElVagoInput {
  ganancias: number[];
}

export interface JuanElVagoOutput {
  monto: number;
  dias: number[];
}

export function solveJuanElVago(ganancias: number[]): {
  monto: number;
  dias: number[];
  dp: number[];
} {
  const n = ganancias.length;
  if (n === 0) {
    return { monto: 0, dias: [], dp: [] };
  }
  if (n === 1) {
    return { monto: ganancias[0], dias: [0], dp: [ganancias[0]] };
  }

  const dp = new Array<number>(n).fill(0);
  dp[0] = ganancias[0];
  dp[1] = Math.max(ganancias[0], ganancias[1]);

  for (let i = 2; i < n; i++) {
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + ganancias[i]);
  }

  // Reconstrucción
  const dias: number[] = [];
  let i = n - 1;
  while (i >= 0) {
    if (i === 0) {
      dias.push(0);
      break;
    } else if (i === 1) {
      if (dp[1] === ganancias[1]) {
        dias.push(1);
      } else {
        dias.push(0);
      }
      break;
    } else {
      if (dp[i] === dp[i - 1]) {
        i -= 1;
      } else {
        dias.push(i);
        i -= 2;
      }
    }
  }

  dias.reverse();
  return { monto: dp[n - 1], dias, dp };
}

export class JuanElVagoValidator implements Validator<JuanElVagoInput, JuanElVagoOutput | [number, number[]]> {
  validate(
    input: JuanElVagoInput,
    result: JuanElVagoOutput | [number, number[]]
  ): ValidationResult {
    const { ganancias } = input;
    const errors: string[] = [];

    let monto: number;
    let dias: number[];

    // Support both tuple [monto, dias] and object { monto, dias }
    if (Array.isArray(result) && result.length === 2) {
      monto = result[0];
      dias = result[1];
    } else if (result && typeof result === 'object' && 'monto' in result && 'dias' in result) {
      monto = result.monto;
      dias = result.dias;
    } else {
      return {
        valid: false,
        errors: ['El resultado debe ser una tupla (monto, dias) o un objeto { monto, dias }.']
      };
    }

    if (!Array.isArray(dias)) {
      return {
        valid: false,
        errors: ['La lista de días trabajados debe ser un arreglo de enteros (índices).']
      };
    }

    const optimal = solveJuanElVago(ganancias);

    if (ganancias.length === 0) {
      if (monto !== 0 || dias.length !== 0) {
        return { valid: false, errors: ['Para un arreglo vacío, el monto debe ser 0 y la lista de días vacía.'] };
      }
      return { valid: true, errors: [] };
    }

    // 1. Check no two consecutive days worked
    const sortedDays = [...dias].sort((a, b) => a - b);
    for (let k = 0; k < sortedDays.length; k++) {
      const d = sortedDays[k];
      if (d < 0 || d >= ganancias.length) {
        errors.push(`Índice de día inválido: ${d} (rango válido: 0 a ${ganancias.length - 1}).`);
      }
      if (k > 0 && sortedDays[k] === sortedDays[k - 1]) {
        errors.push(`Día repetido en la selección: ${d}.`);
      }
      if (k > 0 && sortedDays[k] === sortedDays[k - 1] + 1) {
        errors.push(
          `Infracción de descanso: Juan no puede trabajar dos días consecutivos (${sortedDays[k - 1]} y ${sortedDays[k]}).`
        );
      }
    }

    // 2. Check sum of chosen days
    const computedSum = dias.reduce((sum, d) => {
      if (d >= 0 && d < ganancias.length) {
        return sum + ganancias[d];
      }
      return sum;
    }, 0);

    if (computedSum !== monto) {
      errors.push(
        `Inconsistencia: El monto reportado (${monto}) no coincide con la suma real de las ganancias de los días seleccionados (${computedSum}).`
      );
    }

    // 3. Check optimality
    if (computedSum < optimal.monto) {
      errors.push(
        `Solución subóptima: La ganancia obtenida (${computedSum}) es menor que la ganancia óptima global (${optimal.monto}).`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const juanElVagoValidator = new JuanElVagoValidator();
