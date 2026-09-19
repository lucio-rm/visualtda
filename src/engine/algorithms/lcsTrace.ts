import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';

export type LcsAction =
  | 'INIT'
  | 'MATCH_DIAGONAL'
  | 'MAX_MISMATCH'
  | 'START_RECONSTRUCTION'
  | 'RECONSTRUCT_MATCH'
  | 'RECONSTRUCT_SKIP'
  | 'COMPLETE';

export interface LcsStepData {
  s1: string;
  s2: string;
  dp: number[][];
  currentI: number | null;
  currentJ: number | null;
  reconstructed: string;
  reconstructionPath: [number, number][];
  action: LcsAction;
  description: LocalizedString;
}

export const DEFAULT_LCS_S1 = 'ABCBDAB';
export const DEFAULT_LCS_S2 = 'BDCABA';

export function generateLcsTrace(
  s1: string = DEFAULT_LCS_S1,
  s2: string = DEFAULT_LCS_S2
): TraceTimeline<LcsStepData> {
  const events: TraceEvent<LcsStepData>[] = [];
  let stepIndex = 0;

  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  // Step 0: INIT
  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicialización: Cadenas s1 = "${s1}" (m=${m}), s2 = "${s2}" (n=${n}). Fila y columna 0 inicializadas en 0.`,
      en: `Initialization: Strings s1 = "${s1}" (m=${m}), s2 = "${s2}" (n=${n}). Row 0 and Col 0 set to 0.`
    },
    data: {
      s1,
      s2,
      dp: dp.map((row) => [...row]),
      currentI: null,
      currentJ: null,
      reconstructed: '',
      reconstructionPath: [],
      action: 'INIT',
      description: {
        es: `Matriz 2D (${m + 1} × ${n + 1}) creada. Los casos base corresponden a comparar cualquier prefijo con la cadena vacía (longitud 0).`,
        en: `2D Table (${m + 1} × ${n + 1}) created. Base cases correspond to comparing any prefix with an empty string (length 0).`
      }
    }
  });

  // Table filling bottom-up
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const char1 = s1[i - 1];
      const char2 = s2[j - 1];

      if (char1 === char2) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        events.push({
          step: stepIndex++,
          type: 'MATCH_DIAGONAL',
          message: {
            es: `¡Coincidencia en (${i}, ${j})! s1[${i - 1}] == s2[${j - 1}] == '${char1}'. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`,
            en: `Match at (${i}, ${j})! s1[${i - 1}] == s2[${j - 1}] == '${char1}'. dp[${i}][${j}] = dp[${i - 1}][${j - 1}] + 1 = ${dp[i][j]}.`
          },
          data: {
            s1,
            s2,
            dp: dp.map((row) => [...row]),
            currentI: i,
            currentJ: j,
            reconstructed: '',
            reconstructionPath: [],
            action: 'MATCH_DIAGONAL',
            description: {
              es: `Al coincidir '${char1}', extendemos diagonalmente la subsecuencia óptima previa sumándole 1.`,
              en: `Characters match on '${char1}', extending previous diagonal optimal subproblem by 1.`
            }
          }
        });
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        events.push({
          step: stepIndex++,
          type: 'MAX_MISMATCH',
          message: {
            es: `Discrepancia en (${i}, ${j}): '${char1}' != '${char2}'. dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}.`,
            en: `Mismatch at (${i}, ${j}): '${char1}' != '${char2}'. dp[${i}][${j}] = max(dp[${i - 1}][${j}], dp[${i}][${j - 1}]) = ${dp[i][j]}.`
          },
          data: {
            s1,
            s2,
            dp: dp.map((row) => [...row]),
            currentI: i,
            currentJ: j,
            reconstructed: '',
            reconstructionPath: [],
            action: 'MAX_MISMATCH',
            description: {
              es: `Sin coincidencia directa, conservamos el mejor resultado entre omitir '${char1}' (arriba) u omitir '${char2}' (izquierda).`,
              en: `Without direct match, inherit max between skipping '${char1}' (top) or skipping '${char2}' (left).`
            }
          }
        });
      }
    }
  }

  // Reconstruction
  const path: [number, number][] = [[m, n]];
  const chars: string[] = [];
  let currI = m;
  let currJ = n;

  events.push({
    step: stepIndex++,
    type: 'START_RECONSTRUCTION',
    message: {
      es: `Comienza la reconstrucción desde (${m}, ${n}): Longitud óptima del LCS = ${dp[m][n]}.`,
      en: `Reconstruction begins from (${m}, ${n}): Optimal LCS length = ${dp[m][n]}.`
    },
    data: {
      s1,
      s2,
      dp: dp.map((row) => [...row]),
      currentI: currI,
      currentJ: currJ,
      reconstructed: '',
      reconstructionPath: [...path],
      action: 'START_RECONSTRUCTION',
      description: {
        es: `Seguimos las decisiones hacia atrás para recuperar los caracteres del LCS.`,
        en: `Following optimal decisions backwards to recover LCS characters.`
      }
    }
  });

  while (currI > 0 && currJ > 0) {
    if (s1[currI - 1] === s2[currJ - 1]) {
      const matchedChar = s1[currI - 1];
      chars.unshift(matchedChar);
      currI--;
      currJ--;
      path.push([currI, currJ]);

      events.push({
        step: stepIndex++,
        type: 'RECONSTRUCT_MATCH',
        message: {
          es: `Reconstrucción: Coincidencia '${matchedChar}'. Agregamos al LCS y retrocedemos diagonalmente a (${currI}, ${currJ}).`,
          en: `Reconstruction: Matched '${matchedChar}'. Appending to LCS and backtracking diagonally to (${currI}, ${currJ}).`
        },
        data: {
          s1,
          s2,
          dp: dp.map((row) => [...row]),
          currentI: currI,
          currentJ: currJ,
          reconstructed: chars.join(''),
          reconstructionPath: [...path],
          action: 'RECONSTRUCT_MATCH',
          description: {
            es: `Recuperamos el carácter '${matchedChar}'. Subsecuencia actual: "${chars.join('')}".`,
            en: `Recovered character '${matchedChar}'. Current subsequence: "${chars.join('')}".`
          }
        }
      });
    } else if (dp[currI - 1][currJ] >= dp[currI][currJ - 1]) {
      currI--;
      path.push([currI, currJ]);
      events.push({
        step: stepIndex++,
        type: 'RECONSTRUCT_SKIP',
        message: {
          es: `Reconstrucción: Discrepancia. Retrocedemos hacia arriba a (${currI}, ${currJ}) (omitiendo '${s1[currI]}').`,
          en: `Reconstruction: Mismatch. Backtracking upward to (${currI}, ${currJ}) (skipping '${s1[currI]}').`
        },
        data: {
          s1,
          s2,
          dp: dp.map((row) => [...row]),
          currentI: currI,
          currentJ: currJ,
          reconstructed: chars.join(''),
          reconstructionPath: [...path],
          action: 'RECONSTRUCT_SKIP',
          description: {
            es: `El valor óptimo provino de arriba (dp[${currI}][${currJ}] >= dp[${currI + 1}][${currJ - 1}]).`,
            en: `The optimal value came from above (dp[${currI}][${currJ}] >= dp[${currI + 1}][${currJ - 1}]).`
          }
        }
      });
    } else {
      currJ--;
      path.push([currI, currJ]);
      events.push({
        step: stepIndex++,
        type: 'RECONSTRUCT_SKIP',
        message: {
          es: `Reconstrucción: Discrepancia. Retrocedemos hacia la izquierda a (${currI}, ${currJ}) (omitiendo '${s2[currJ]}').`,
          en: `Reconstruction: Mismatch. Backtracking leftward to (${currI}, ${currJ}) (skipping '${s2[currJ]}').`
        },
        data: {
          s1,
          s2,
          dp: dp.map((row) => [...row]),
          currentI: currI,
          currentJ: currJ,
          reconstructed: chars.join(''),
          reconstructionPath: [...path],
          action: 'RECONSTRUCT_SKIP',
          description: {
            es: `El valor óptimo provino de la izquierda.`,
            en: `The optimal value came from the left.`
          }
        }
      });
    }
  }

  // Step COMPLETE
  events.push({
    step: stepIndex++,
    type: 'COMPLETE',
    message: {
      es: `¡LCS reconstruido con éxito! Subsecuencia común: "${chars.join('')}" (longitud ${chars.length}).`,
      en: `LCS successfully reconstructed! Common subsequence: "${chars.join('')}" (length ${chars.length}).`
    },
    data: {
      s1,
      s2,
      dp: dp.map((row) => [...row]),
      currentI: 0,
      currentJ: 0,
      reconstructed: chars.join(''),
      reconstructionPath: [...path],
      action: 'COMPLETE',
      description: {
        es: `LCS final encontrado: "${chars.join('')}". Es una subsecuencia válida de "${s1}" y "${s2}" de longitud máxima garantizada.`,
        en: `Final LCS found: "${chars.join('')}". Valid subsequence of "${s1}" and "${s2}" with guaranteed maximum length.`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
