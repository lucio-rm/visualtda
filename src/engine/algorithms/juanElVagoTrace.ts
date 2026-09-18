import { TraceEvent, TraceTimeline } from '../../types/trace';

export interface JuanElVagoStepData {
  ganancias: number[];
  dp: (number | null)[];
  currentDay: number;
  phase:
    | 'init'
    | 'base_case_0'
    | 'base_case_1'
    | 'evaluating_cell'
    | 'cell_filled'
    | 'table_complete'
    | 'reconstruct_step'
    | 'complete';

  optionSkip?: { antecedentDay: number; value: number };
  optionWork?: { antecedentDay: number; dayGain: number; value: number };
  decision?: 'skip' | 'work';

  reconstructionPointer?: number;
  selectedDays: number[];
  currentTotal: number;
}

export const DEFAULT_GANANCIAS = [10, 40, 20, 30, 50];

export function generateJuanElVagoTrace(
  initialGanancias: number[] = DEFAULT_GANANCIAS
): TraceTimeline<JuanElVagoStepData> {
  const events: TraceEvent<JuanElVagoStepData>[] = [];
  const ganancias = [...initialGanancias];
  const n = ganancias.length;
  let stepIndex = 0;

  const dp: (number | null)[] = new Array(n).fill(null);

  // 1. Initial event
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Iniciando optimización con ${n} ofertas laborales. Juan busca maximizar ganancias sin trabajar dos días seguidos.`,
      en: `Starting optimization with ${n} job offers. Juan seeks to maximize earnings without working consecutive days.`
    },
    data: {
      ganancias: [...ganancias],
      dp: [...dp],
      currentDay: 0,
      phase: 'init',
      selectedDays: [],
      currentTotal: 0
    }
  });

  if (n === 0) {
    events.push({
      step: stepIndex++,
      type: 'complete',
      message: {
        es: 'No hay ofertas laborales. Ganancia total: 0.',
        en: 'No job offers available. Total profit: 0.'
      },
      data: {
        ganancias: [],
        dp: [],
        currentDay: 0,
        phase: 'complete',
        selectedDays: [],
        currentTotal: 0
      }
    });
    return { events, totalSteps: events.length };
  }

  // Base case 0
  dp[0] = ganancias[0];
  events.push({
    step: stepIndex++,
    type: 'base_case_0',
    message: {
      es: `Caso Base 1 (Día 0): Solo hay una oferta laboral. Juan trabaja el día 0 ganando $${ganancias[0]}. dp[0] = ${dp[0]}.`,
      en: `Base Case 1 (Day 0): Only one job offer. Juan works day 0 earning $${ganancias[0]}. dp[0] = ${dp[0]}.`
    },
    data: {
      ganancias: [...ganancias],
      dp: [...dp],
      currentDay: 0,
      phase: 'base_case_0',
      decision: 'work',
      selectedDays: [],
      currentTotal: 0
    }
  });

  if (n === 1) {
    events.push({
      step: stepIndex++,
      type: 'complete',
      message: {
        es: `Solución final: Juan trabaja el día 0 y gana $${dp[0]}.`,
        en: `Final solution: Juan works day 0 earning $${dp[0]}.`
      },
      data: {
        ganancias: [...ganancias],
        dp: [...dp],
        currentDay: 0,
        phase: 'complete',
        selectedDays: [0],
        currentTotal: dp[0]!
      }
    });
    return { events, totalSteps: events.length };
  }

  // Base case 1
  dp[1] = Math.max(ganancias[0], ganancias[1]);
  const bestDay = ganancias[1] > ganancias[0] ? 1 : 0;
  events.push({
    step: stepIndex++,
    type: 'base_case_1',
    message: {
      es: `Caso Base 2 (Día 1): No puede trabajar ambos días (0 y 1). Elige el más conveniente: max($${ganancias[0]}, $${ganancias[1]}) = $${dp[1]} (trabaja día ${bestDay}).`,
      en: `Base Case 2 (Day 1): Cannot work both days (0 and 1). Picks the higher one: max($${ganancias[0]}, $${ganancias[1]}) = $${dp[1]} (works day ${bestDay}).`
    },
    data: {
      ganancias: [...ganancias],
      dp: [...dp],
      currentDay: 1,
      phase: 'base_case_1',
      decision: bestDay === 1 ? 'work' : 'skip',
      selectedDays: [],
      currentTotal: 0
    }
  });

  // Iterative DP fill
  for (let i = 2; i < n; i++) {
    const valSkip = dp[i - 1]!;
    const valWork = dp[i - 2]! + ganancias[i];
    const decision: 'skip' | 'work' = valWork > valSkip ? 'work' : 'skip';

    // Step 1: Evaluating options
    events.push({
      step: stepIndex++,
      type: 'evaluating_cell',
      message: {
        es: `Evaluando Día ${i} (Oferta: $${ganancias[i]}): Opción A (Descansar) = dp[${i - 1}] ($${valSkip}) vs Opción B (Trabajar) = dp[${i - 2}] + $${ganancias[i]} ($${valWork}).`,
        en: `Evaluating Day ${i} (Offer: $${ganancias[i]}): Option A (Rest) = dp[${i - 1}] ($${valSkip}) vs Option B (Work) = dp[${i - 2}] + $${ganancias[i]} ($${valWork}).`
      },
      data: {
        ganancias: [...ganancias],
        dp: [...dp],
        currentDay: i,
        phase: 'evaluating_cell',
        optionSkip: { antecedentDay: i - 1, value: valSkip },
        optionWork: { antecedentDay: i - 2, dayGain: ganancias[i], value: valWork },
        selectedDays: [],
        currentTotal: 0
      }
    });

    // Step 2: Filling cell with max
    dp[i] = Math.max(valSkip, valWork);

    events.push({
      step: stepIndex++,
      type: 'cell_filled',
      message: {
        es: `Día ${i} resuelto: Decisión "${decision === 'work' ? 'TRABAJAR' : 'DESCANSAR'}". dp[${i}] = max(${valSkip}, ${valWork}) = $${dp[i]}.`,
        en: `Day ${i} resolved: Choice "${decision === 'work' ? 'WORK' : 'REST'}". dp[${i}] = max(${valSkip}, ${valWork}) = $${dp[i]}.`
      },
      data: {
        ganancias: [...ganancias],
        dp: [...dp],
        currentDay: i,
        phase: 'cell_filled',
        decision,
        optionSkip: { antecedentDay: i - 1, value: valSkip },
        optionWork: { antecedentDay: i - 2, dayGain: ganancias[i], value: valWork },
        selectedDays: [],
        currentTotal: 0
      }
    });
  }

  // Table complete
  events.push({
    step: stepIndex++,
    type: 'table_complete',
    message: {
      es: `Tabla de Programación Dinámica completada en tiempo lineal O(n). La ganancia máxima óptima es dp[${n - 1}] = $${dp[n - 1]}. Iniciando reconstrucción hacia atrás.`,
      en: `DP table completed in linear time O(n). Optimal maximum profit is dp[${n - 1}] = $${dp[n - 1]}. Starting backward reconstruction.`
    },
    data: {
      ganancias: [...ganancias],
      dp: [...dp],
      currentDay: n - 1,
      phase: 'table_complete',
      selectedDays: [],
      currentTotal: dp[n - 1]!
    }
  });

  // Reconstruction
  const selectedDays: number[] = [];
  let curr = n - 1;

  while (curr >= 0) {
    if (curr === 0) {
      selectedDays.push(0);
      events.push({
        step: stepIndex++,
        type: 'reconstruct_step',
        message: {
          es: `Reconstrucción (Día 0): Caso base alcanzado. Juan trabaja el día 0.`,
          en: `Reconstruction (Day 0): Base case reached. Juan works day 0.`
        },
        data: {
          ganancias: [...ganancias],
          dp: [...dp],
          currentDay: 0,
          reconstructionPointer: 0,
          phase: 'reconstruct_step',
          selectedDays: [...selectedDays].sort((a, b) => a - b),
          currentTotal: dp[n - 1]!
        }
      });
      break;
    } else if (curr === 1) {
      const worked1 = dp[1] === ganancias[1];
      const dayChosen = worked1 ? 1 : 0;
      selectedDays.push(dayChosen);
      events.push({
        step: stepIndex++,
        type: 'reconstruct_step',
        message: {
          es: `Reconstrucción (Día 1): dp[1] = $${dp[1]}. Corresponde a trabajar el día ${dayChosen}.`,
          en: `Reconstruction (Day 1): dp[1] = $${dp[1]}. Corresponds to working day ${dayChosen}.`
        },
        data: {
          ganancias: [...ganancias],
          dp: [...dp],
          currentDay: dayChosen,
          reconstructionPointer: 1,
          phase: 'reconstruct_step',
          selectedDays: [...selectedDays].sort((a, b) => a - b),
          currentTotal: dp[n - 1]!
        }
      });
      break;
    } else {
      if (dp[curr] === dp[curr - 1]) {
        // Juan did not work day curr
        events.push({
          step: stepIndex++,
          type: 'reconstruct_step',
          message: {
            es: `Reconstrucción (Día ${curr}): dp[${curr}] ($${dp[curr]}) == dp[${curr - 1}] ($${dp[curr - 1]}). Juan descansó el día ${curr}. Retrocedemos al día ${curr - 1}.`,
            en: `Reconstruction (Day ${curr}): dp[${curr}] ($${dp[curr]}) == dp[${curr - 1}] ($${dp[curr - 1]}). Juan rested on day ${curr}. Step back to day ${curr - 1}.`
          },
          data: {
            ganancias: [...ganancias],
            dp: [...dp],
            currentDay: curr,
            reconstructionPointer: curr,
            phase: 'reconstruct_step',
            decision: 'skip',
            selectedDays: [...selectedDays].sort((a, b) => a - b),
            currentTotal: dp[n - 1]!
          }
        });
        curr -= 1;
      } else {
        // Juan worked day curr
        selectedDays.push(curr);
        events.push({
          step: stepIndex++,
          type: 'reconstruct_step',
          message: {
            es: `Reconstrucción (Día ${curr}): dp[${curr}] > dp[${curr - 1}]. Juan trabajó el día ${curr} (gana $${ganancias[curr]}). Como no puede trabajar días seguidos, saltamos al día ${curr - 2}.`,
            en: `Reconstruction (Day ${curr}): dp[${curr}] > dp[${curr - 1}]. Juan worked day ${curr} (earned $${ganancias[curr]}). Skipping consecutive day, jump to day ${curr - 2}.`
          },
          data: {
            ganancias: [...ganancias],
            dp: [...dp],
            currentDay: curr,
            reconstructionPointer: curr,
            phase: 'reconstruct_step',
            decision: 'work',
            selectedDays: [...selectedDays].sort((a, b) => a - b),
            currentTotal: dp[n - 1]!
          }
        });
        curr -= 2;
      }
    }
  }

  const finalDays = [...selectedDays].sort((a, b) => a - b);

  events.push({
    step: stepIndex++,
    type: 'complete',
    message: {
      es: `¡Optimización y Reconstrucción completas! Juan debe trabajar los días [${finalDays.join(', ')}], obteniendo la ganancia máxima de $${dp[n - 1]}.`,
      en: `Optimization and Reconstruction complete! Juan should work on days [${finalDays.join(', ')}], securing the maximum earnings of $${dp[n - 1]}.`
    },
    data: {
      ganancias: [...ganancias],
      dp: [...dp],
      currentDay: n - 1,
      phase: 'complete',
      selectedDays: finalDays,
      currentTotal: dp[n - 1]!
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
