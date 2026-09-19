import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';
import { solveCoinChangeGreedy } from './coinChangeValidator';

export type CoinChangeAction =
  | 'INIT'
  | 'EVALUATE_CELL'
  | 'UPDATE_DP'
  | 'START_RECONSTRUCTION'
  | 'RECONSTRUCT_COIN'
  | 'COMPLETE';

export interface CoinChangeStepData {
  coins: number[];
  target: number;
  dp: number[];
  choice: number[];
  currentV: number | null;
  currentCoin: number | null;
  evaluatingTransitionFrom: number | null;
  reconstructedCoins: number[];
  greedyCoins: number[] | null;
  action: CoinChangeAction;
  description: LocalizedString;
}

const INF = 999999;

export function generateCoinChangeTrace(
  rawCoins: number[],
  target: number
): TraceTimeline<CoinChangeStepData> {
  const events: TraceEvent<CoinChangeStepData>[] = [];
  let stepIndex = 0;

  const coins = [...rawCoins].filter((c) => c > 0).sort((a, b) => a - b);
  const greedyCoins = solveCoinChangeGreedy(coins, target);

  const dp = new Array(target + 1).fill(INF);
  const choice = new Array(target + 1).fill(-1);

  dp[0] = 0;

  // Step 0: INIT
  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicialización: Denominaciones disponibles [${coins.join(', ')}], objetivo V = ${target}. Caso base: dp[0] = 0 monedas.`,
      en: `Initialization: Denominations [${coins.join(', ')}], target V = ${target}. Base case: dp[0] = 0 coins.`
    },
    data: {
      coins,
      target,
      dp: [...dp],
      choice: [...choice],
      currentV: 0,
      currentCoin: null,
      evaluatingTransitionFrom: null,
      reconstructedCoins: [],
      greedyCoins,
      action: 'INIT',
      description: {
        es: `Tabla 1D inicializada. dp[0] = 0 (cero monedas para dar cambio de $0). Todos los montos v >= 1 se inicializan en infinito.`,
        en: `1D DP table initialized. dp[0] = 0 (zero coins for $0 change). All amounts v >= 1 start as infinity.`
      }
    }
  });

  // Iterative filling
  for (let v = 1; v <= target; v++) {
    for (const c of coins) {
      if (c <= v) {
        const fromIdx = v - c;
        const candidateCost = dp[fromIdx] + 1;

        // EVALUATE_CELL
        events.push({
          step: stepIndex++,
          type: 'EVALUATE_CELL',
          message: {
            es: `Evaluando v = ${v} con moneda ${c}: dp[${v} - ${c}] + 1 = dp[${fromIdx}] + 1 = ${dp[fromIdx] === INF ? '∞' : candidateCost}.`,
            en: `Evaluating v = ${v} with coin ${c}: dp[${v} - ${c}] + 1 = dp[${fromIdx}] + 1 = ${dp[fromIdx] === INF ? '∞' : candidateCost}.`
          },
          data: {
            coins,
            target,
            dp: [...dp],
            choice: [...choice],
            currentV: v,
            currentCoin: c,
            evaluatingTransitionFrom: fromIdx,
            reconstructedCoins: [],
            greedyCoins,
            action: 'EVALUATE_CELL',
            description: {
              es: `Probamos dar una moneda de $${c} para el monto $${v}. Requiere sumar 1 a la solución óptima del remanente $${fromIdx} (dp[${fromIdx}] = ${dp[fromIdx] === INF ? '∞' : dp[fromIdx]}).`,
              en: `Testing using coin $${c} for amount $${v}. Requires 1 + optimal subproblem for remaining $${fromIdx} (dp[${fromIdx}] = ${dp[fromIdx] === INF ? '∞' : dp[fromIdx]}).`
            }
          }
        });

        if (candidateCost < dp[v]) {
          dp[v] = candidateCost;
          choice[v] = c;

          // UPDATE_DP
          events.push({
            step: stepIndex++,
            type: 'UPDATE_DP',
            message: {
              es: `¡Nuevo mínimo para v = ${v}! dp[${v}] = ${candidateCost} usando moneda ${c}.`,
              en: `New minimum for v = ${v}! dp[${v}] = ${candidateCost} using coin ${c}.`
            },
            data: {
              coins,
              target,
              dp: [...dp],
              choice: [...choice],
              currentV: v,
              currentCoin: c,
              evaluatingTransitionFrom: fromIdx,
              reconstructedCoins: [],
              greedyCoins,
              action: 'UPDATE_DP',
              description: {
                es: `Actualizamos dp[${v}] = ${candidateCost} y guardamos eleccion[${v}] = ${c}.`,
                en: `Updated dp[${v}] = ${candidateCost} and recorded choice[${v}] = ${c}.`
              }
            }
          });
        }
      }
    }
  }

  // Reconstruction
  const reconstructed: number[] = [];
  let curr = target;

  events.push({
    step: stepIndex++,
    type: 'START_RECONSTRUCTION',
    message: {
      es: `Comienza la reconstrucción: El monto objetivo $${target} requiere como mínimo ${dp[target]} moneda(s).`,
      en: `Reconstruction begins: Target amount $${target} requires at least ${dp[target]} coin(s).`
    },
    data: {
      coins,
      target,
      dp: [...dp],
      choice: [...choice],
      currentV: curr,
      currentCoin: null,
      evaluatingTransitionFrom: null,
      reconstructedCoins: [],
      greedyCoins,
      action: 'START_RECONSTRUCTION',
      description: {
        es: `Iniciamos la reconstrucción en v = ${target}. Seguiremos el puntero eleccion[v] para recuperar las monedas una a una.`,
        en: `Starting reconstruction at v = ${target}. Following choice[v] pointers to recover the coins one by one.`
      }
    }
  });

  while (curr > 0 && dp[target] !== INF) {
    const c = choice[curr];
    if (c <= 0) break;
    reconstructed.push(c);
    const prev = curr;
    curr -= c;

    events.push({
      step: stepIndex++,
      type: 'RECONSTRUCT_COIN',
      message: {
        es: `Reconstrucción: En v = ${prev}, la moneda elegida fue $${c}. Retrocedemos a v = ${curr}.`,
        en: `Reconstruction: At v = ${prev}, chosen coin was $${c}. Backtracking to v = ${curr}.`
      },
      data: {
        coins,
        target,
        dp: [...dp],
        choice: [...choice],
        currentV: curr,
        currentCoin: c,
        evaluatingTransitionFrom: prev,
        reconstructedCoins: [...reconstructed],
        greedyCoins,
        action: 'RECONSTRUCT_COIN',
        description: {
          es: `Recuperamos moneda de $${c}. Próximo subproblema: v = ${curr}.`,
          en: `Recovered coin $${c}. Next subproblem: v = ${curr}.`
        }
      }
    });
  }

  // COMPLETE
  events.push({
    step: stepIndex++,
    type: 'COMPLETE',
    message: {
      es: `¡Solución óptima completada! Se requieren ${reconstructed.length} moneda(s): [${reconstructed.join(', ')}].`,
      en: `Optimal solution completed! Requires ${reconstructed.length} coin(s): [${reconstructed.join(', ')}].`
    },
    data: {
      coins,
      target,
      dp: [...dp],
      choice: [...choice],
      currentV: 0,
      currentCoin: null,
      evaluatingTransitionFrom: null,
      reconstructedCoins: [...reconstructed],
      greedyCoins,
      action: 'COMPLETE',
      description: {
        es: `Solución óptima obtenida por Programación Dinámica: ${reconstructed.length} monedas [${reconstructed.join(', ')}]. ${
          greedyCoins
            ? greedyCoins.length > reconstructed.length
              ? `(Greedy hubiera usado ${greedyCoins.length} monedas: [${greedyCoins.join(', ')}])`
              : `(Greedy en este caso también halló ${greedyCoins.length} monedas)`
            : '(Greedy hubiera fallado en este caso)'
        }`,
        en: `Optimal DP solution: ${reconstructed.length} coins [${reconstructed.join(', ')}]. ${
          greedyCoins
            ? greedyCoins.length > reconstructed.length
              ? `(Greedy would have used ${greedyCoins.length} coins: [${greedyCoins.join(', ')}])`
              : `(Greedy also found ${greedyCoins.length} coins in this case)`
            : '(Greedy would have failed completely in this case)'
        }`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
