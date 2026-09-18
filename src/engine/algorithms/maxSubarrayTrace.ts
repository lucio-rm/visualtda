import { TraceEvent, TraceTimeline } from '../../types/trace';

export interface SubarrayCandidate {
  range: [number, number];
  sum: number;
  source?: 'left' | 'right' | 'cross';
}

export interface MaxSubarrayStepData {
  array: number[];
  activeRange?: [number, number];
  midIndex?: number;
  phase:
    | 'init'
    | 'divide'
    | 'base_case'
    | 'scan_left'
    | 'scan_right'
    | 'combine_cross'
    | 'compare_candidates'
    | 'choose_max'
    | 'complete';
  depth: number;

  leftScanPointer?: number;
  rightScanPointer?: number;
  currentRunningSum?: number;
  bestLeftIndex?: number;
  bestLeftSum?: number;
  bestRightIndex?: number;
  bestRightSum?: number;

  leftCandidate?: SubarrayCandidate;
  rightCandidate?: SubarrayCandidate;
  crossCandidate?: SubarrayCandidate;
  currentWinner?: SubarrayCandidate;

  highlightRange?: [number, number];
}

export const DEFAULT_MAX_SUBARRAY: number[] = [5, -4, 2, 4, -1];

export function generateMaxSubarrayTrace(
  initialArray: number[] = DEFAULT_MAX_SUBARRAY
): TraceTimeline<MaxSubarrayStepData> {
  const events: TraceEvent<MaxSubarrayStepData>[] = [];
  const array = [...initialArray];
  let stepIndex = 0;

  // 1. Initial event
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Iniciando búsqueda del subarreglo de máxima suma en [${array.join(', ')}] mediante División y Conquista.`,
      en: `Starting maximum subarray search on [${array.join(', ')}] via Divide and Conquer.`
    },
    data: {
      array: [...array],
      phase: 'init',
      depth: 0
    }
  });

  if (array.length === 0) {
    events.push({
      step: stepIndex++,
      type: 'complete',
      message: {
        es: 'El arreglo está vacío. La suma máxima es 0.',
        en: 'The array is empty. Maximum sum is 0.'
      },
      data: {
        array: [...array],
        phase: 'complete',
        depth: 0
      }
    });
    return {
      events,
      totalSteps: events.length
    };
  }

  function helper(low: number, high: number, depth: number): SubarrayCandidate {
    // Base Case: 1 element
    if (low === high) {
      const candidate: SubarrayCandidate = {
        range: [low, high],
        sum: array[low],
        source: 'cross'
      };

      events.push({
        step: stepIndex++,
        type: 'base_case',
        message: {
          es: `Caso base en índice ${low}: elemento único (${array[low]}), suma = ${array[low]}.`,
          en: `Base case at index ${low}: single element (${array[low]}), sum = ${array[low]}.`
        },
        data: {
          array: [...array],
          activeRange: [low, high],
          phase: 'base_case',
          depth,
          currentWinner: candidate,
          highlightRange: [low, high]
        }
      });

      return candidate;
    }

    const mid = Math.floor((low + high) / 2);

    events.push({
      step: stepIndex++,
      type: 'divide',
      message: {
        es: `Dividir: Rango [${low}..${high}] partido en izquierda [${low}..${mid}] y derecha [${mid + 1}..${high}]. Punto medio m = ${mid}.`,
        en: `Divide: Range [${low}..${high}] split into left [${low}..${mid}] and right [${mid + 1}..${high}]. Midpoint m = ${mid}.`
      },
      data: {
        array: [...array],
        activeRange: [low, high],
        midIndex: mid,
        phase: 'divide',
        depth
      }
    });

    // 1. Solve left recursively
    const leftCandidate = helper(low, mid, depth + 1);

    // 2. Solve right recursively
    const rightCandidate = helper(mid + 1, high, depth + 1);

    // 3. Find crossing subarray in linear time O(len)
    let leftRunning = 0;
    let bestLeftSum = -Infinity;
    let bestLeftIndex = mid;

    for (let i = mid; i >= low; i--) {
      leftRunning += array[i];
      if (leftRunning > bestLeftSum) {
        bestLeftSum = leftRunning;
        bestLeftIndex = i;
      }

      events.push({
        step: stepIndex++,
        type: 'scan_left',
        message: {
          es: `Escaneo cruzado izquierdo desde m=${mid} hacia atrás: índice ${i} (valor ${array[i]}), acumulado = ${leftRunning}. Mejor hasta ahora = ${bestLeftSum} en [${bestLeftIndex}..${mid}].`,
          en: `Left crossing scan from m=${mid} backwards: index ${i} (val ${array[i]}), running sum = ${leftRunning}. Best so far = ${bestLeftSum} at [${bestLeftIndex}..${mid}].`
        },
        data: {
          array: [...array],
          activeRange: [low, high],
          midIndex: mid,
          phase: 'scan_left',
          depth,
          leftScanPointer: i,
          currentRunningSum: leftRunning,
          bestLeftIndex,
          bestLeftSum,
          leftCandidate,
          rightCandidate
        }
      });
    }

    let rightRunning = 0;
    let bestRightSum = -Infinity;
    let bestRightIndex = mid + 1;

    for (let j = mid + 1; j <= high; j++) {
      rightRunning += array[j];
      if (rightRunning > bestRightSum) {
        bestRightSum = rightRunning;
        bestRightIndex = j;
      }

      events.push({
        step: stepIndex++,
        type: 'scan_right',
        message: {
          es: `Escaneo cruzado derecho desde m+1=${mid + 1} hacia adelante: índice ${j} (valor ${array[j]}), acumulado = ${rightRunning}. Mejor hasta ahora = ${bestRightSum} en [${mid + 1}..${bestRightIndex}].`,
          en: `Right crossing scan from m+1=${mid + 1} forwards: index ${j} (val ${array[j]}), running sum = ${rightRunning}. Best so far = ${bestRightSum} at [${mid + 1}..${bestRightIndex}].`
        },
        data: {
          array: [...array],
          activeRange: [low, high],
          midIndex: mid,
          phase: 'scan_right',
          depth,
          bestLeftIndex,
          bestLeftSum,
          rightScanPointer: j,
          currentRunningSum: rightRunning,
          bestRightIndex,
          bestRightSum,
          leftCandidate,
          rightCandidate
        }
      });
    }

    const crossCandidate: SubarrayCandidate = {
      range: [bestLeftIndex, bestRightIndex],
      sum: bestLeftSum + bestRightSum,
      source: 'cross'
    };

    events.push({
      step: stepIndex++,
      type: 'combine_cross',
      message: {
        es: `Subarreglo cruzado obtenido combinando mejor mitad izquierda [${bestLeftIndex}..${mid}] y derecha [${mid + 1}..${bestRightIndex}]: rango [${bestLeftIndex}..${bestRightIndex}], suma = ${crossCandidate.sum}.`,
        en: `Crossing subarray obtained combining best left [${bestLeftIndex}..${mid}] and right [${mid + 1}..${bestRightIndex}]: range [${bestLeftIndex}..${bestRightIndex}], sum = ${crossCandidate.sum}.`
      },
      data: {
        array: [...array],
        activeRange: [low, high],
        midIndex: mid,
        phase: 'combine_cross',
        depth,
        bestLeftIndex,
        bestLeftSum,
        bestRightIndex,
        bestRightSum,
        leftCandidate,
        rightCandidate,
        crossCandidate,
        highlightRange: crossCandidate.range
      }
    });

    // Compare candidates
    const candidates = [
      { ...leftCandidate, source: 'left' as const },
      { ...rightCandidate, source: 'right' as const },
      { ...crossCandidate, source: 'cross' as const }
    ];

    events.push({
      step: stepIndex++,
      type: 'compare_candidates',
      message: {
        es: `Comparando candidatos para [${low}..${high}]: Izquierda=${leftCandidate.sum}, Derecha=${rightCandidate.sum}, Cruzado=${crossCandidate.sum}.`,
        en: `Comparing candidates for [${low}..${high}]: Left=${leftCandidate.sum}, Right=${rightCandidate.sum}, Crossing=${crossCandidate.sum}.`
      },
      data: {
        array: [...array],
        activeRange: [low, high],
        midIndex: mid,
        phase: 'compare_candidates',
        depth,
        leftCandidate,
        rightCandidate,
        crossCandidate
      }
    });

    let winner = candidates[0];
    if (candidates[1].sum > winner.sum) {
      winner = candidates[1];
    }
    if (candidates[2].sum > winner.sum) {
      winner = candidates[2];
    }

    events.push({
      step: stepIndex++,
      type: 'choose_max',
      message: {
        es: `Ganador para rango [${low}..${high}]: opción "${winner.source}" con rango [${winner.range[0]}..${winner.range[1]}] y suma ${winner.sum}.`,
        en: `Winner for range [${low}..${high}]: option "${winner.source}" with range [${winner.range[0]}..${winner.range[1]}] and sum ${winner.sum}.`
      },
      data: {
        array: [...array],
        activeRange: [low, high],
        midIndex: mid,
        phase: 'choose_max',
        depth,
        leftCandidate,
        rightCandidate,
        crossCandidate,
        currentWinner: winner,
        highlightRange: winner.range
      }
    });

    return winner;
  }

  const finalWinner = helper(0, array.length - 1, 0);

  events.push({
    step: stepIndex++,
    type: 'complete',
    message: {
      es: `Búsqueda finalizada. Subarreglo de máxima suma global: [${array.slice(finalWinner.range[0], finalWinner.range[1] + 1).join(', ')}] en índices [${finalWinner.range[0]}..${finalWinner.range[1]}], suma total = ${finalWinner.sum}.`,
      en: `Search completed. Global maximum sum subarray: [${array.slice(finalWinner.range[0], finalWinner.range[1] + 1).join(', ')}] at indices [${finalWinner.range[0]}..${finalWinner.range[1]}], total sum = ${finalWinner.sum}.`
    },
    data: {
      array: [...array],
      activeRange: [0, array.length - 1],
      phase: 'complete',
      depth: 0,
      currentWinner: finalWinner,
      highlightRange: finalWinner.range
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
