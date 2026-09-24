import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';

export type SubsetSumAction =
  | 'INIT'
  | 'CONSIDER_ELEMENT'
  | 'INCLUDE_ELEMENT'
  | 'EXCLUDE_ELEMENT'
  | 'PRUNE_EXCESS'
  | 'PRUNE_DEFICIT'
  | 'SOLUTION_FOUND'
  | 'BACKTRACK'
  | 'COMPLETE';

export interface SubsetSumStepData {
  elements: number[];
  target: number;
  currentSubset: number[];
  currentSum: number;
  currentIndex: number;
  currentElement: number | null;
  remainingSum: number;
  action: SubsetSumAction;
  solutions: number[][];
  exploredNodes: number;
  prunedNodes: number;
  description: LocalizedString;
}

export function generateSubsetSumTrace(
  rawNumbers: number[],
  target: number
): TraceTimeline<SubsetSumStepData> {
  const events: TraceEvent<SubsetSumStepData>[] = [];
  let stepIndex = 0;

  // 1. Filter and sort elements descending
  const elements = rawNumbers.filter((x) => x > 0 && x <= target).sort((a, b) => b - a);
  const totalRemaining = elements.reduce((acc, v) => acc + v, 0);

  let exploredCount = 1;
  let prunedCount = 0;
  const solutions: number[][] = [];
  const currentSubset: number[] = [];

  // Step 0: INIT
  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicialización: Números ordenados decrecientemente [${elements.join(', ')}], objetivo S = ${target}. Suma remanente total = ${totalRemaining}.`,
      en: `Initialization: Elements sorted descending [${elements.join(', ')}], target S = ${target}. Total remaining sum = ${totalRemaining}.`
    },
    data: {
      elements,
      target,
      currentSubset: [],
      currentSum: 0,
      currentIndex: 0,
      currentElement: null,
      remainingSum: totalRemaining,
      action: 'INIT',
      solutions: [],
      exploredNodes: 1,
      prunedNodes: 0,
      description: {
        es: `Iniciamos en la raíz del árbol de decisiones con suma actual 0. El ordenamiento decreciente permite activar podas por exceso en niveles altos.`,
        en: `Starting at the root of the decision tree with current sum 0. Descending sorting triggers excess pruning at upper levels.`
      }
    }
  });

  function backtrack(idx: number, currentSum: number, remaining: number): void {
    // Check target reached
    if (currentSum === target) {
      solutions.push([...currentSubset]);
      events.push({
        step: stepIndex++,
        type: 'SOLUTION_FOUND',
        message: {
          es: `¡Solución encontrada! Subconjunto [${currentSubset.join(', ')}] suma exactamente S = ${target}.`,
          en: `Solution found! Subset [${currentSubset.join(', ')}] sums to exactly S = ${target}.`
        },
        data: {
          elements,
          target,
          currentSubset: [...currentSubset],
          currentSum,
          currentIndex: idx,
          currentElement: null,
          remainingSum: remaining,
          action: 'SOLUTION_FOUND',
          solutions: solutions.map((s) => [...s]),
          exploredNodes: exploredCount,
          prunedNodes: prunedCount,
          description: {
            es: `¡Meta alcanzada! Guardamos [${currentSubset.join(', ')}] como solución factible #${solutions.length}.`,
            en: `Target reached! Saved [${currentSubset.join(', ')}] as feasible solution #${solutions.length}.`
          }
        }
      });
      return;
    }

    if (idx >= elements.length) return;

    const elem = elements[idx];
    const newRemaining = remaining - elem;

    // Evaluate Option 1: INCLUDE
    exploredCount++;
    if (currentSum + elem <= target) {
      currentSubset.push(elem);
      events.push({
        step: stepIndex++,
        type: 'INCLUDE_ELEMENT',
        message: {
          es: `Decisión: Tomar número ${elem}. Nueva suma parcial: ${currentSum + elem}/${target}.`,
          en: `Decision: Take number ${elem}. New partial sum: ${currentSum + elem}/${target}.`
        },
        data: {
          elements,
          target,
          currentSubset: [...currentSubset],
          currentSum: currentSum + elem,
          currentIndex: idx,
          currentElement: elem,
          remainingSum: newRemaining,
          action: 'INCLUDE_ELEMENT',
          solutions: solutions.map((s) => [...s]),
          exploredNodes: exploredCount,
          prunedNodes: prunedCount,
          description: {
            es: `Incluimos ${elem} en el subconjunto. Suma parcial = ${currentSum + elem}. Es factible porque no excede ${target}.`,
            en: `Included ${elem} in subset. Partial sum = ${currentSum + elem}. Feasible because it does not exceed ${target}.`
          }
        }
      });

      backtrack(idx + 1, currentSum + elem, newRemaining);

      // Backtrack event
      currentSubset.pop();
      events.push({
        step: stepIndex++,
        type: 'BACKTRACK',
        message: {
          es: `Backtracking: Deshacer inclusión de ${elem}. Restaurar suma a ${currentSum}.`,
          en: `Backtracking: Undo inclusion of ${elem}. Restore sum to ${currentSum}.`
        },
        data: {
          elements,
          target,
          currentSubset: [...currentSubset],
          currentSum,
          currentIndex: idx,
          currentElement: elem,
          remainingSum: newRemaining,
          action: 'BACKTRACK',
          solutions: solutions.map((s) => [...s]),
          exploredNodes: exploredCount,
          prunedNodes: prunedCount,
          description: {
            es: `Deshacemos la elección de ${elem} para explorar la rama alternativa (no tomarlo).`,
            en: `Undoing selection of ${elem} to explore alternative branch (exclude it).`
          }
        }
      });
    } else {
      // PODA POR EXCESO
      prunedCount++;
      events.push({
        step: stepIndex++,
        type: 'PRUNE_EXCESS',
        message: {
          es: `Poda por Exceso: ${currentSum} + ${elem} = ${currentSum + elem} > ${target}. Se descarta la rama completa.`,
          en: `Excess Pruning: ${currentSum} + ${elem} = ${currentSum + elem} > ${target}. Subtree discarded.`
        },
        data: {
          elements,
          target,
          currentSubset: [...currentSubset],
          currentSum,
          currentIndex: idx,
          currentElement: elem,
          remainingSum: newRemaining,
          action: 'PRUNE_EXCESS',
          solutions: solutions.map((s) => [...s]),
          exploredNodes: exploredCount,
          prunedNodes: prunedCount,
          description: {
            es: `Poda por Exceso: Tomar ${elem} superaría la meta ${target} (${currentSum + elem} > ${target}). Al ser números positivos, ningún subárbol posterior puede reducir la suma.`,
            en: `Excess Pruning: Taking ${elem} exceeds target ${target} (${currentSum + elem} > ${target}). With positive numbers, no descendant can reduce the sum.`
          }
        }
      });
    }

    // Evaluate Option 2: EXCLUDE
    exploredCount++;
    if (currentSum + newRemaining >= target) {
      events.push({
        step: stepIndex++,
        type: 'EXCLUDE_ELEMENT',
        message: {
          es: `Decisión: Omitir número ${elem}. Suma parcial se mantiene en ${currentSum}. Remanente: ${newRemaining}.`,
          en: `Decision: Exclude number ${elem}. Partial sum stays at ${currentSum}. Remaining: ${newRemaining}.`
        },
        data: {
          elements,
          target,
          currentSubset: [...currentSubset],
          currentSum,
          currentIndex: idx,
          currentElement: elem,
          remainingSum: newRemaining,
          action: 'EXCLUDE_ELEMENT',
          solutions: solutions.map((s) => [...s]),
          exploredNodes: exploredCount,
          prunedNodes: prunedCount,
          description: {
            es: `No tomamos ${elem}. La suma acumulada ${currentSum} más el remanente ${newRemaining} es ${currentSum + newRemaining} >= ${target}, por lo que aún es posible alcanzar la meta.`,
            en: `Excluding ${elem}. Current sum ${currentSum} plus remaining ${newRemaining} is ${currentSum + newRemaining} >= ${target}, keeping the target achievable.`
          }
        }
      });

      backtrack(idx + 1, currentSum, newRemaining);
    } else {
      // PODA POR DÉFICIT
      prunedCount++;
      events.push({
        step: stepIndex++,
        type: 'PRUNE_DEFICIT',
        message: {
          es: `Poda por Déficit: ${currentSum} + remanente ${newRemaining} = ${currentSum + newRemaining} < ${target}. Imposible alcanzar S.`,
          en: `Deficit Pruning: ${currentSum} + remaining ${newRemaining} = ${currentSum + newRemaining} < ${target}. Target unreachable.`
        },
        data: {
          elements,
          target,
          currentSubset: [...currentSubset],
          currentSum,
          currentIndex: idx,
          currentElement: elem,
          remainingSum: newRemaining,
          action: 'PRUNE_DEFICIT',
          solutions: solutions.map((s) => [...s]),
          exploredNodes: exploredCount,
          prunedNodes: prunedCount,
          description: {
            es: `Poda por Déficit: Incluso sumando TODOS los elementos restantes (${newRemaining}), el máximo alcanzable sería ${currentSum + newRemaining} < ${target}. Se poda la rama.`,
            en: `Deficit Pruning: Even adding ALL remaining numbers (${newRemaining}), maximum reachable sum is ${currentSum + newRemaining} < ${target}. Subtree pruned.`
          }
        }
      });
    }
  }

  backtrack(0, 0, totalRemaining);

  // Final step: COMPLETE
  events.push({
    step: stepIndex++,
    type: 'COMPLETE',
    message: {
      es: `Exploración finalizada: ${solutions.length} subconjunto(s) válidos encontrados. Nodos podados: ${prunedCount}.`,
      en: `Search completed: ${solutions.length} valid subset(s) found. Pruned nodes: ${prunedCount}.`
    },
    data: {
      elements,
      target,
      currentSubset: [],
      currentSum: 0,
      currentIndex: elements.length,
      currentElement: null,
      remainingSum: 0,
      action: 'COMPLETE',
      solutions: solutions.map((s) => [...s]),
      exploredNodes: exploredCount,
      prunedNodes: prunedCount,
      description: {
        es: `Búsqueda exhaustiva por Backtracking con podas finalizada. Se hallaron ${solutions.length} combinaciones exactas evitando explorar ramas inviables.`,
        en: `Backtracking with pruning search completed. Found ${solutions.length} exact combinations while pruning infeasible branches.`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
