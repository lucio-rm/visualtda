import { TraceEvent, TraceTimeline } from '../../types/trace';

export interface CoinRound {
  roundNumber: number;
  toss1: number;
  toss2: number;
  outcome: 'discard_00' | 'discard_11' | 'success_01' | 'success_10';
  outputBit?: number;
}

export interface FairCoinStepData {
  bias: number;
  rounds: CoinRound[];
  currentRoundIndex: number;
  currentToss: 1 | 2 | null;
  activeToss1?: number;
  activeToss2?: number;
  phase:
    | 'init'
    | 'flipping_1'
    | 'flipping_2'
    | 'evaluating_pair'
    | 'discard_pair'
    | 'success'
    | 'complete';
  outputBit?: number;
  totalTosses: number;
  theoreticalExpectedTosses: number;
}

export const DEFAULT_COIN_BIAS = 0.4;

// Pedagogical deterministic sequence of rounds to showcase discards and success
export const DEMO_ROUNDS: [number, number][] = [
  [1, 1], // discard (prob p^2)
  [0, 0], // discard (prob (1-p)^2)
  [0, 1]  // success (prob (1-p)*p => emits 0)
];

export function generateRandomizedFairCoinTrace(
  bias: number = DEFAULT_COIN_BIAS,
  predefinedRounds: [number, number][] = DEMO_ROUNDS
): TraceTimeline<FairCoinStepData> {
  const events: TraceEvent<FairCoinStepData>[] = [];
  let stepIndex = 0;
  const theoreticalExpected = 1 / (bias * (1 - bias));

  // 1. Initial event
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Fuente aleatoria cargada: P(1) = ${bias * 100}% y P(0) = ${((1 - bias) * 100).toFixed(0)}%. Objetivo: Extraer un bit equitativo 50/50 mediante el algoritmo de Von Neumann.`,
      en: `Biased coin source: P(1) = ${bias * 100}% and P(0) = ${((1 - bias) * 100).toFixed(0)}%. Goal: Extract pure 50/50 bit via Von Neumann algorithm.`
    },
    data: {
      bias,
      rounds: [],
      currentRoundIndex: 0,
      currentToss: null,
      phase: 'init',
      totalTosses: 0,
      theoreticalExpectedTosses: theoreticalExpected
    }
  });

  const historyRounds: CoinRound[] = [];
  let totalTossesCount = 0;
  let finalBit: number | undefined = undefined;

  for (let r = 0; r < predefinedRounds.length; r++) {
    const [t1, t2] = predefinedRounds[r];

    // Toss 1
    totalTossesCount++;
    events.push({
      step: stepIndex++,
      type: 'flipping_1',
      message: {
        es: `Ronda ${r + 1}, Lanzamiento 1: La moneda cargada cae en ${t1}.`,
        en: `Round ${r + 1}, Toss 1: Biased coin lands on ${t1}.`
      },
      data: {
        bias,
        rounds: [...historyRounds],
        currentRoundIndex: r,
        currentToss: 1,
        activeToss1: t1,
        phase: 'flipping_1',
        totalTosses: totalTossesCount,
        theoreticalExpectedTosses: theoreticalExpected
      }
    });

    // Toss 2
    totalTossesCount++;
    events.push({
      step: stepIndex++,
      type: 'flipping_2',
      message: {
        es: `Ronda ${r + 1}, Lanzamiento 2: La moneda cargada cae en ${t2}. Par obtenido: (${t1}, ${t2}).`,
        en: `Round ${r + 1}, Toss 2: Biased coin lands on ${t2}. Pair obtained: (${t1}, ${t2}).`
      },
      data: {
        bias,
        rounds: [...historyRounds],
        currentRoundIndex: r,
        currentToss: 2,
        activeToss1: t1,
        activeToss2: t2,
        phase: 'flipping_2',
        totalTosses: totalTossesCount,
        theoreticalExpectedTosses: theoreticalExpected
      }
    });

    // Evaluating pair
    if (t1 === t2) {
      const outcome = t1 === 0 ? 'discard_00' : 'discard_11';
      const probFormula = t1 === 0 ? `(1-p)² = ${(1 - bias) ** 2}` : `p² = ${(bias ** 2).toFixed(2)}`;
      const roundObj: CoinRound = { roundNumber: r + 1, toss1: t1, toss2: t2, outcome };
      historyRounds.push(roundObj);

      events.push({
        step: stepIndex++,
        type: 'discard_pair',
        message: {
          es: `Ronda ${r + 1}: Par simétrico repetido (${t1}, ${t1}) con probabilidad ${probFormula}. Para preservar imparcialidad estricta, este resultado se DESCARTA y se repite la ronda.`,
          en: `Round ${r + 1}: Repeated symmetric pair (${t1}, ${t1}) with probability ${probFormula}. To preserve strict fairness, this result is DISCARDED and the round repeats.`
        },
        data: {
          bias,
          rounds: [...historyRounds],
          currentRoundIndex: r,
          currentToss: null,
          activeToss1: t1,
          activeToss2: t2,
          phase: 'discard_pair',
          totalTosses: totalTossesCount,
          theoreticalExpectedTosses: theoreticalExpected
        }
      });
    } else {
      // Disjoint success pair!
      const bit = t1 === 0 && t2 === 1 ? 0 : 1;
      finalBit = bit;
      const outcome = bit === 0 ? 'success_01' : 'success_10';
      const roundObj: CoinRound = { roundNumber: r + 1, toss1: t1, toss2: t2, outcome, outputBit: bit };
      historyRounds.push(roundObj);

      events.push({
        step: stepIndex++,
        type: 'success',
        message: {
          es: `Ronda ${r + 1}: ¡Éxito! Par no idéntico (${t1}, ${t2}). Por simetría P(0,1) = P(1,0) = p·(1-p). Se emite el bit justo ${bit}.`,
          en: `Round ${r + 1}: Success! Non-identical pair (${t1}, ${t2}). By symmetry P(0,1) = P(1,0) = p·(1-p). Emits fair bit ${bit}.`
        },
        data: {
          bias,
          rounds: [...historyRounds],
          currentRoundIndex: r,
          currentToss: null,
          activeToss1: t1,
          activeToss2: t2,
          outputBit: bit,
          phase: 'success',
          totalTosses: totalTossesCount,
          theoreticalExpectedTosses: theoreticalExpected
        }
      });
      break;
    }
  }

  // Complete event
  events.push({
    step: stepIndex++,
    type: 'complete',
    message: {
      es: `Generación completada: Bit justo extraído = ${finalBit}. Se necesitaron ${totalTossesCount} lanzamientos físicos (Esperanza teórica: ${theoreticalExpected.toFixed(2)}).`,
      en: `Generation complete: Fair bit extracted = ${finalBit}. Required ${totalTossesCount} physical tosses (Theoretical expectation: ${theoreticalExpected.toFixed(2)}).`
    },
    data: {
      bias,
      rounds: [...historyRounds],
      currentRoundIndex: historyRounds.length - 1,
      currentToss: null,
      outputBit: finalBit,
      phase: 'complete',
      totalTosses: totalTossesCount,
      theoreticalExpectedTosses: theoreticalExpected
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
