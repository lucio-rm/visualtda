import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';

export type InversionAction =
  | 'INIT'
  | 'DIVIDE'
  | 'COMPARE'
  | 'COUNT_SPLIT'
  | 'MERGE_DONE'
  | 'COMPLETE';

export interface InversionStepData {
  range: [number, number];
  leftArray: number[];
  rightArray: number[];
  mergedArray: number[];
  activeLeftIdx: number | null;
  activeRightIdx: number | null;
  inversionsAddedThisStep: number;
  splitInversions: number;
  totalInversions: number;
  action: InversionAction;
  description: LocalizedString;
}

export const DEFAULT_INVERSION_ARRAY = [2, 3, 8, 6, 1];

export function generateInversionTrace(
  initialArray: number[] = DEFAULT_INVERSION_ARRAY
): TraceTimeline<InversionStepData> {
  const events: TraceEvent<InversionStepData>[] = [];
  let stepIndex = 0;
  let runningTotalInversions = 0;

  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicio: Arreglo de ${initialArray.length} elementos [${initialArray.join(', ')}]. Iniciamos búsqueda de inversiones con División y Conquista.`,
      en: `Start: Array of ${initialArray.length} items [${initialArray.join(', ')}]. Starting Divide and Conquer inversion search.`
    },
    data: {
      range: [0, Math.max(0, initialArray.length - 1)],
      leftArray: [],
      rightArray: [],
      mergedArray: [...initialArray],
      activeLeftIdx: null,
      activeRightIdx: null,
      inversionsAddedThisStep: 0,
      splitInversions: 0,
      totalInversions: 0,
      action: 'INIT',
      description: {
        es: `Inicio: Arreglo de ${initialArray.length} elementos [${initialArray.join(', ')}].`,
        en: `Start: Array of ${initialArray.length} items [${initialArray.join(', ')}].`
      }
    }
  });

  if (initialArray.length <= 1) {
    events.push({
      step: stepIndex++,
      type: 'COMPLETE',
      message: {
        es: `Arreglo trivial (tamaño <= 1): posee exactamente 0 inversiones.`,
        en: `Trivial array (size <= 1): has exactly 0 inversions.`
      },
      data: {
        range: [0, Math.max(0, initialArray.length - 1)],
        leftArray: [],
        rightArray: [],
        mergedArray: [...initialArray],
        activeLeftIdx: null,
        activeRightIdx: null,
        inversionsAddedThisStep: 0,
        splitInversions: 0,
        totalInversions: 0,
        action: 'COMPLETE',
        description: {
          es: `Arreglo trivial (tamaño <= 1): posee exactamente 0 inversiones.`,
          en: `Trivial array (size <= 1): has exactly 0 inversions.`
        }
      }
    });

    return {
      events,
      totalSteps: events.length
    };
  }

  function mergeAndCount(
    left: number[],
    right: number[],
    startIdx: number
  ): { splitCount: number; merged: number[] } {
    let i = 0;
    let j = 0;
    let splitCount = 0;
    const merged: number[] = [];

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        events.push({
          step: stepIndex++,
          type: 'COMPARE',
          message: {
            es: `Comparación: izq[${i}]=${left[i]} <= der[${j}]=${right[j]}. No hay inversión.`,
            en: `Compare: left[${i}]=${left[i]} <= right[${j}]=${right[j]}. No inversion.`
          },
          data: {
            range: [startIdx, startIdx + left.length + right.length - 1],
            leftArray: [...left],
            rightArray: [...right],
            mergedArray: [...merged],
            activeLeftIdx: i,
            activeRightIdx: j,
            inversionsAddedThisStep: 0,
            splitInversions: splitCount,
            totalInversions: runningTotalInversions + splitCount,
            action: 'COMPARE',
            description: {
              es: `Comparación: izq[${i}]=${left[i]} <= der[${j}]=${right[j]}. No hay inversión. Insertamos ${left[i]} al arreglo ordenado.`,
              en: `Compare: left[${i}]=${left[i]} <= right[${j}]=${right[j]}. No inversion. Append ${left[i]} to merged array.`
            }
          }
        });
        merged.push(left[i]);
        i++;
      } else {
        const added = left.length - i;
        splitCount += added;
        events.push({
          step: stepIndex++,
          type: 'COUNT_SPLIT',
          message: {
            es: `¡Inversión Cruzada! der[${j}]=${right[j]} < izq[${i}]=${left[i]}. +${added} inversiones agregadas en O(1).`,
            en: `Cross Inversion! right[${j}]=${right[j]} < left[${i}]=${left[i]}. +${added} inversions added in O(1).`
          },
          data: {
            range: [startIdx, startIdx + left.length + right.length - 1],
            leftArray: [...left],
            rightArray: [...right],
            mergedArray: [...merged],
            activeLeftIdx: i,
            activeRightIdx: j,
            inversionsAddedThisStep: added,
            splitInversions: splitCount,
            totalInversions: runningTotalInversions + splitCount,
            action: 'COUNT_SPLIT',
            description: {
              es: `¡Inversión Cruzada! der[${j}]=${right[j]} < izq[${i}]=${left[i]}. Como la mitad izquierda está ordenada, der[${j}] es menor que los ${added} elementos restantes [${left.slice(i).join(', ')}]. +${added} inversiones contadas en O(1).`,
              en: `Cross Inversion! right[${j}]=${right[j]} < left[${i}]=${left[i]}. Since left is sorted, right[${j}] is smaller than all ${added} remaining items [${left.slice(i).join(', ')}]. +${added} inversions counted in O(1).`
            }
          }
        });
        merged.push(right[j]);
        j++;
      }
    }

    while (i < left.length) {
      merged.push(left[i]);
      i++;
    }

    while (j < right.length) {
      merged.push(right[j]);
      j++;
    }

    events.push({
      step: stepIndex++,
      type: 'MERGE_DONE',
      message: {
        es: `Subarreglo intercalado y ordenado: [${merged.join(', ')}].`,
        en: `Subarray merged and sorted: [${merged.join(', ')}].`
      },
      data: {
        range: [startIdx, startIdx + left.length + right.length - 1],
        leftArray: [...left],
        rightArray: [...right],
        mergedArray: [...merged],
        activeLeftIdx: null,
        activeRightIdx: null,
        inversionsAddedThisStep: 0,
        splitInversions: splitCount,
        totalInversions: runningTotalInversions + splitCount,
        action: 'MERGE_DONE',
        description: {
          es: `Subarreglo [${startIdx}..${startIdx + merged.length - 1}] intercalado y ordenado: [${merged.join(', ')}]. Aportó ${splitCount} inversiones cruzadas.`,
          en: `Subarray [${startIdx}..${startIdx + merged.length - 1}] merged and sorted: [${merged.join(', ')}]. Contributed ${splitCount} split inversions.`
        }
      }
    });

    return { splitCount, merged };
  }

  function sortAndCount(sub: number[], startIdx: number): { total: number; merged: number[] } {
    if (sub.length <= 1) {
      return { total: 0, merged: [...sub] };
    }

    const mid = Math.floor(sub.length / 2);
    const leftPart = sub.slice(0, mid);
    const rightPart = sub.slice(mid);

    events.push({
      step: stepIndex++,
      type: 'DIVIDE',
      message: {
        es: `Dividir: [${sub.join(', ')}] en izq=[${leftPart.join(', ')}] y der=[${rightPart.join(', ')}]`,
        en: `Divide: [${sub.join(', ')}] into left=[${leftPart.join(', ')}] and right=[${rightPart.join(', ')}]`
      },
      data: {
        range: [startIdx, startIdx + sub.length - 1],
        leftArray: [...leftPart],
        rightArray: [...rightPart],
        mergedArray: [...sub],
        activeLeftIdx: null,
        activeRightIdx: null,
        inversionsAddedThisStep: 0,
        splitInversions: 0,
        totalInversions: runningTotalInversions,
        action: 'DIVIDE',
        description: {
          es: `Dividir: Subarreglo [${sub.join(', ')}] dividido en mitad izquierda [${leftPart.join(', ')}] y mitad derecha [${rightPart.join(', ')}].`,
          en: `Divide: Subarray [${sub.join(', ')}] split into left [${leftPart.join(', ')}] and right [${rightPart.join(', ')}].`
        }
      }
    });

    const leftRes = sortAndCount(leftPart, startIdx);
    runningTotalInversions += leftRes.total;

    const rightRes = sortAndCount(rightPart, startIdx + mid);
    runningTotalInversions += rightRes.total;

    const mergeRes = mergeAndCount(leftRes.merged, rightRes.merged, startIdx);
    runningTotalInversions += mergeRes.splitCount;

    return {
      total: leftRes.total + rightRes.total + mergeRes.splitCount,
      merged: mergeRes.merged
    };
  }

  const finalRes = sortAndCount(initialArray, 0);

  events.push({
    step: stepIndex++,
    type: 'COMPLETE',
    message: {
      es: `¡Conteo Completo! ${finalRes.total} inversiones en total. Arreglo ordenado: [${finalRes.merged.join(', ')}]`,
      en: `Counting Complete! ${finalRes.total} total inversions. Sorted array: [${finalRes.merged.join(', ')}]`
    },
    data: {
      range: [0, initialArray.length - 1],
      leftArray: [],
      rightArray: [],
      mergedArray: [...finalRes.merged],
      activeLeftIdx: null,
      activeRightIdx: null,
      inversionsAddedThisStep: 0,
      splitInversions: 0,
      totalInversions: finalRes.total,
      action: 'COMPLETE',
      description: {
        es: `¡Conteo Completo! El arreglo [${initialArray.join(', ')}] posee exactamente ${finalRes.total} inversiones en total. Arreglo completamente ordenado en O(n log n): [${finalRes.merged.join(', ')}].`,
        en: `Counting Complete! Array [${initialArray.join(', ')}] has exactly ${finalRes.total} total inversions. Fully sorted in O(n log n): [${finalRes.merged.join(', ')}].`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
