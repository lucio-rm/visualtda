import { TraceTimeline, TraceEvent } from '../../types';

export interface RnaBasePair {
  i: number;
  j: number;
  baseI: string;
  baseJ: string;
}

export interface RnaStepData {
  sequence: string;
  length: number;
  currentI: number;
  currentJ: number;
  testedT: number | null;
  pairs: RnaBasePair[];
  dpMatrix: number[][];
  action: 'INIT' | 'EVALUATE_SUBSTRING' | 'TEST_PAIR' | 'UPDATE_DP' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_RNA_SEQUENCE = 'ACCGGUAGU'; // n=9

const VALID_PAIRS = new Set([
  'AU', 'UA', 'CG', 'GC'
]);

export function isValidPair(b1: string, b2: string): boolean {
  return VALID_PAIRS.has(b1 + b2);
}

export function generateRnaTrace(
  sequence: string = DEFAULT_RNA_SEQUENCE
): TraceTimeline<RnaStepData> {
  const events: TraceEvent<RnaStepData>[] = [];
  const n = sequence.length;
  let eventCounter = 0;

  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  function pushEvent(
    action: RnaStepData['action'],
    curI: number,
    curJ: number,
    testedT: number | null,
    pairs: RnaBasePair[],
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        sequence,
        length: n,
        currentI: curI,
        currentJ: curJ,
        testedT,
        pairs: [...pairs],
        dpMatrix: dp.map((row) => [...row]),
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // 1. Init
  pushEvent(
    'INIT',
    0,
    0,
    null,
    [],
    `Secuencia de ARN: "${sequence}" (${n} nucleótidos). Reglas biológicas: pares Watson-Crick {A-U, C-G}, sin cruces (anidamiento estricto), sin giros cerrados (distancia t < j - 4).`,
    `RNA sequence: "${sequence}" (${n} nucleotides). Watson-Crick pairs {A-U, C-G}, non-crossing, no sharp turns (distance t < j - 4).`
  );

  // 2. Interval DP: length from 5 to n
  for (let k = 5; k <= n; k++) {
    for (let i = 0; i <= n - k; i++) {
      const j = i + k - 1;

      // Case 1: j is unpaired
      let maxP = dp[i][j - 1];

      pushEvent(
        'EVALUATE_SUBSTRING',
        i,
        j,
        null,
        [],
        `Evaluando subsecuencia [${i}..${j}] ("${sequence.slice(i, j + 1)}", longitud ${k}). Caso base 1: j(${sequence[j]}) no emparejada ⇒ OPT(${i}, ${j-1}) = ${maxP}.`,
        `Evaluating substring [${i}..${j}] ("${sequence.slice(i, j + 1)}", len ${k}). Case 1: j(${sequence[j]}) unpaired ⇒ OPT(${i}, ${j-1}) = ${maxP}.`
      );

      // Case 2: j pairs with t (i <= t < j - 4)
      for (let t = i; t < j - 4; t++) {
        if (isValidPair(sequence[t], sequence[j])) {
          const leftCost = t > i ? dp[i][t - 1] : 0;
          const centerCost = dp[t + 1][j - 1];
          const cand = 1 + leftCost + centerCost;

          pushEvent(
            'TEST_PAIR',
            i,
            j,
            t,
            [{ i: t, j, baseI: sequence[t], baseJ: sequence[j] }],
            `Posible enlace válido (${sequence[t]}_${t}, ${sequence[j]}_${j}). Ganancia: 1 + OPT(${i}, ${t-1})[${leftCost}] + OPT(${t+1}, ${j-1})[${centerCost}] = ${cand}.`,
            `Valid candidate pair (${sequence[t]}_${t}, ${sequence[j]}_${j}). Value: 1 + OPT(${i}, ${t-1})[${leftCost}] + OPT(${t+1}, ${j-1})[${centerCost}] = ${cand}.`
          );

          if (cand > maxP) {
            maxP = cand;
          }
        }
      }

      dp[i][j] = maxP;

      pushEvent(
        'UPDATE_DP',
        i,
        j,
        null,
        [],
        `Celda DP actualizada: OPT[${i}, ${j}] = ${maxP} pares máximos para "${sequence.slice(i, j + 1)}".`,
        `DP cell updated: OPT[${i}, ${j}] = ${maxP} max pairs for "${sequence.slice(i, j + 1)}".`
      );
    }
  }

  // Reconstruct optimal pairs
  const optimalPairs: RnaBasePair[] = [];
  function reconstruct(i: number, j: number) {
    if (j <= i + 4) return;
    if (dp[i][j] === dp[i][j - 1]) {
      reconstruct(i, j - 1);
      return;
    }
    for (let t = i; t < j - 4; t++) {
      if (isValidPair(sequence[t], sequence[j])) {
        const leftCost = t > i ? dp[i][t - 1] : 0;
        const centerCost = dp[t + 1][j - 1];
        if (dp[i][j] === 1 + leftCost + centerCost) {
          optimalPairs.push({ i: t, j, baseI: sequence[t], baseJ: sequence[j] });
          if (t > i) reconstruct(i, t - 1);
          reconstruct(t + 1, j - 1);
          return;
        }
      }
    }
  }
  reconstruct(0, n - 1);

  // 3. Complete
  pushEvent(
    'COMPLETE',
    0,
    n - 1,
    null,
    optimalPairs,
    `Estructura secundaria óptima completada: ${optimalPairs.length} pares no cruzados encontrados: ${optimalPairs.map((p) => `(${p.baseI}${p.i}-${p.baseJ}${p.j})`).join(', ')}. Complejidad: O(n³) tiempo por búsqueda de t, O(n²) espacio.`,
    `Optimal secondary structure complete: ${optimalPairs.length} non-crossing pairs found. Complexity: O(n³) time, O(n²) space.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
