import { TraceEvent, TraceTimeline } from '../../types/trace';

export interface MergeSortStepData {
  array: number[];
  activeRange?: [number, number];
  leftRange?: [number, number];
  rightRange?: [number, number];
  midIndex?: number;
  leftPointer?: number;
  rightPointer?: number;
  destPointer?: number;
  phase: 'init' | 'divide' | 'base_case' | 'merge_compare' | 'merge_place' | 'segment_merged' | 'complete';
  comparison?: {
    leftVal: number;
    rightVal: number;
    winner: 'left' | 'right';
  };
  depth: number;
  comparisonsCount: number;
}

export const DEFAULT_MERGE_SORT_ARRAY: number[] = [38, 27, 43, 3, 9, 82, 10, 19];

export function generateMergeSortTrace(
  initialArray: number[] = DEFAULT_MERGE_SORT_ARRAY
): TraceTimeline<MergeSortStepData> {
  const events: TraceEvent<MergeSortStepData>[] = [];
  const currentArray = [...initialArray];
  let stepIndex = 0;
  let comparisonsCount = 0;

  // 1. Initial event
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Cargando arreglo de ${initialArray.length} elementos para ordenar mediante División y Conquista.`,
      en: `Loading array of ${initialArray.length} elements to sort via Divide and Conquer.`
    },
    data: {
      array: [...currentArray],
      phase: 'init',
      depth: 0,
      comparisonsCount: 0
    }
  });

  // Recursive helper
  function sortHelper(p: number, r: number, depth: number): void {
    if (p >= r) {
      events.push({
        step: stepIndex++,
        type: 'base_case',
        message: {
          es: `Caso base: subarreglo [${p}..${r}] contiene 1 elemento (${currentArray[p]}), ya ordenado.`,
          en: `Base case: subarray [${p}..${r}] has 1 element (${currentArray[p]}), already sorted.`
        },
        data: {
          array: [...currentArray],
          activeRange: [p, r],
          phase: 'base_case',
          depth,
          comparisonsCount
        }
      });
      return;
    }

    const q = Math.floor((p + r) / 2);

    // Event: Divide
    events.push({
      step: stepIndex++,
      type: 'divide',
      message: {
        es: `Dividir: Subarreglo [${p}..${r}] partido en [${p}..${q}] y [${q + 1}..${r}] (punto medio = índice ${q}).`,
        en: `Divide: Subarray [${p}..${r}] split into [${p}..${q}] and [${q + 1}..${r}] (midpoint = index ${q}).`
      },
      data: {
        array: [...currentArray],
        activeRange: [p, r],
        midIndex: q,
        leftRange: [p, q],
        rightRange: [q + 1, r],
        phase: 'divide',
        depth,
        comparisonsCount
      }
    });

    // Conquering left and right
    sortHelper(p, q, depth + 1);
    sortHelper(q + 1, r, depth + 1);

    // Merge step
    mergeHelper(p, q, r, depth);
  }

  function mergeHelper(p: number, q: number, r: number, depth: number): void {
    const left = currentArray.slice(p, q + 1);
    const right = currentArray.slice(q + 1, r + 1);

    let i = 0;
    let j = 0;
    let k = p;

    while (i < left.length && j < right.length) {
      comparisonsCount++;
      const leftVal = left[i];
      const rightVal = right[j];
      const winner = leftVal <= rightVal ? 'left' : 'right';

      // Event: Compare
      events.push({
        step: stepIndex++,
        type: 'merge_compare',
        message: {
          es: `Combinar: Comparando ${leftVal} (mitad izquierda) con ${rightVal} (mitad derecha). Menor: ${winner === 'left' ? leftVal : rightVal}.`,
          en: `Merge: Comparing ${leftVal} (left) with ${rightVal} (right). Smaller: ${winner === 'left' ? leftVal : rightVal}.`
        },
        data: {
          array: [...currentArray],
          activeRange: [p, r],
          leftRange: [p, q],
          rightRange: [q + 1, r],
          leftPointer: p + i,
          rightPointer: q + 1 + j,
          destPointer: k,
          phase: 'merge_compare',
          comparison: {
            leftVal,
            rightVal,
            winner
          },
          depth,
          comparisonsCount
        }
      });

      if (winner === 'left') {
        currentArray[k] = left[i];
        i++;
      } else {
        currentArray[k] = right[j];
        j++;
      }

      // Event: Place
      events.push({
        step: stepIndex++,
        type: 'merge_place',
        message: {
          es: `Colocado ${currentArray[k]} en la posición ${k}.`,
          en: `Placed ${currentArray[k]} at position ${k}.`
        },
        data: {
          array: [...currentArray],
          activeRange: [p, r],
          destPointer: k,
          phase: 'merge_place',
          depth,
          comparisonsCount
        }
      });

      k++;
    }

    // Flush remaining elements
    while (i < left.length) {
      currentArray[k] = left[i];
      events.push({
        step: stepIndex++,
        type: 'merge_place',
        message: {
          es: `Copiando elemento restante ${left[i]} de la mitad izquierda a posición ${k}.`,
          en: `Flushing remaining left element ${left[i]} to position ${k}.`
        },
        data: {
          array: [...currentArray],
          activeRange: [p, r],
          destPointer: k,
          phase: 'merge_place',
          depth,
          comparisonsCount
        }
      });
      i++;
      k++;
    }

    while (j < right.length) {
      currentArray[k] = right[j];
      events.push({
        step: stepIndex++,
        type: 'merge_place',
        message: {
          es: `Copiando elemento restante ${right[j]} de la mitad derecha a posición ${k}.`,
          en: `Flushing remaining right element ${right[j]} to position ${k}.`
        },
        data: {
          array: [...currentArray],
          activeRange: [p, r],
          destPointer: k,
          phase: 'merge_place',
          depth,
          comparisonsCount
        }
      });
      j++;
      k++;
    }

    // Segment merged event
    events.push({
      step: stepIndex++,
      type: 'segment_merged',
      message: {
        es: `Subarreglo [${p}..${r}] completamente combinado y ordenado: [${currentArray.slice(p, r + 1).join(', ')}].`,
        en: `Subarray [${p}..${r}] fully merged and sorted: [${currentArray.slice(p, r + 1).join(', ')}].`
      },
      data: {
        array: [...currentArray],
        activeRange: [p, r],
        phase: 'segment_merged',
        depth,
        comparisonsCount
      }
    });
  }

  // Execute
  sortHelper(0, currentArray.length - 1, 0);

  // Final Complete event
  events.push({
    step: stepIndex,
    type: 'complete',
    message: {
      es: `¡Ordenamiento completado con éxito! Total de comparaciones: ${comparisonsCount}.`,
      en: `Sorting successfully completed! Total comparisons: ${comparisonsCount}.`
    },
    data: {
      array: [...currentArray],
      phase: 'complete',
      depth: 0,
      comparisonsCount
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
