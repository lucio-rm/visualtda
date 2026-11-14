import { ValidationResult, Validator } from '../../types/validation';

export interface RnaInputObject {
  sequence: string;
}

export type RnaInput = RnaInputObject | string;

export type RnaPair = [number, number];

export type RnaOutput = number | RnaPair[];

export function isWatsonCrickPair(b1: string, b2: string): boolean {
  const p = `${b1}${b2}`;
  return p === 'AU' || p === 'UA' || p === 'CG' || p === 'GC';
}

export function solveRnaSecondaryStructure(sequence: string): number {
  const clean = sequence.toUpperCase().trim();
  const n = clean.length;
  if (n < 5) return 0;

  // dp[i][j] represents max pairs in substring clean[i..j]
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let len = 5; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      let maxVal = dp[i][j - 1];

      for (let t = i; t <= j - 5; t++) {
        if (isWatsonCrickPair(clean[t], clean[j])) {
          const leftVal = t > i ? dp[i][t - 1] : 0;
          const centerVal = dp[t + 1][j - 1];
          const candidate = 1 + leftVal + centerVal;
          if (candidate > maxVal) {
            maxVal = candidate;
          }
        }
      }
      dp[i][j] = maxVal;
    }
  }

  return dp[0][n - 1];
}

export class RnaSecondaryStructureValidator
  implements Validator<RnaInput, RnaOutput>
{
  validate(input: RnaInput, output: RnaOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const rawSeq = typeof input === 'string' ? input : input?.sequence;

    if (typeof rawSeq !== 'string') {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada de ARN debe ser una cadena de bases nucleotídicas (A, C, G, U).'],
        warnings
      };
    }

    const cleanSeq = rawSeq.toUpperCase().trim();
    for (let i = 0; i < cleanSeq.length; i++) {
      const b = cleanSeq[i];
      if (b !== 'A' && b !== 'C' && b !== 'G' && b !== 'U') {
        errors.push(`Base nucleotídica inválida "${b}" en posición ${i} (solo se permiten A, C, G, U).`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    const optimalPairs = solveRnaSecondaryStructure(cleanSeq);

    if (typeof output === 'number') {
      if (Number.isNaN(output) || output < 0 || !Number.isInteger(output)) {
        errors.push('La cantidad de pares debe ser un entero no negativo.');
      } else if (output < optimalPairs) {
        errors.push(
          `Solución subóptima: Se reportaron ${output} pares, pero la estructura secundaria óptima contiene ${optimalPairs} pares.`
        );
      } else if (output > optimalPairs) {
        errors.push(
          `Cantidad inviable de pares: Se reportaron ${output} pares, superando el máximo físico de ${optimalPairs} pares no cruzados.`
        );
      }
    } else if (Array.isArray(output)) {
      const seenBases = new Set<number>();
      for (let p = 0; p < output.length; p++) {
        const pair = output[p];
        if (!Array.isArray(pair) || pair.length < 2 || typeof pair[0] !== 'number' || typeof pair[1] !== 'number') {
          errors.push(`Par inválido en índice ${p}: se esperaba tupla [i, j].`);
          continue;
        }
        const [i, j] = pair;
        if (i < 0 || j >= cleanSeq.length || i >= j) {
          errors.push(`Índices fuera de rango en par [${i}, ${j}].`);
          continue;
        }
        if (j - i < 5) {
          errors.push(
            `Infracción de separación biológica: El par [${i}, ${j}] tiene separación ${j - i} < 5 (requiere al menos 4 bases intermedias).`
          );
        }
        if (!isWatsonCrickPair(cleanSeq[i], cleanSeq[j])) {
          errors.push(
            `Par de bases incompatible: ${cleanSeq[i]}(${i}) con ${cleanSeq[j]}(${j}) no es un par Watson-Crick (A-U o C-G).`
          );
        }
        if (seenBases.has(i) || seenBases.has(j)) {
          errors.push(`Base reutilizada: Una de las bases del par [${i}, ${j}] ya forma parte de otro par.`);
        }
        seenBases.add(i);
        seenBases.add(j);
      }

      // Check non-crossing (pseudoknots)
      for (let a = 0; a < output.length; a++) {
        for (let b = a + 1; b < output.length; b++) {
          const [i1, j1] = output[a];
          const [i2, j2] = output[b];
          if ((i1 < i2 && i2 < j1 && j1 < j2) || (i2 < i1 && i1 < j2 && j2 < j1)) {
            errors.push(
              `Pseudonudo detectado: El par [${i1}, ${j1}] se cruza espacialmente con el par [${i2}, ${j2}].`
            );
            break;
          }
        }
      }

      if (output.length < optimalPairs) {
        errors.push(
          `Solución subóptima: Se formaron ${output.length} pares, pero la programación dinámica alcanza ${optimalPairs} pares.`
        );
      }
    } else {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe ser un número entero (cantidad de pares) o una lista de pares [[i, j], ...].'],
        warnings
      };
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        sequenceLength: cleanSeq.length,
        optimalPairs
      }
    };
  }
}

export const rnaSecondaryStructureValidator = new RnaSecondaryStructureValidator();
