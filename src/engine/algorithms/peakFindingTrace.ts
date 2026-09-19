import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';

export type PeakFindingAction =
  | 'INIT'
  | 'EVALUATE_MID'
  | 'GO_LEFT'
  | 'GO_RIGHT'
  | 'PEAK_FOUND';

export interface PeakFindingStepData {
  array: number[];
  start: number;
  end: number;
  mid: number | null;
  leftVal: number | null;
  rightVal: number | null;
  decision: PeakFindingAction;
  foundIndex: number | null;
  discardedRanges: [number, number][];
  description: LocalizedString;
}

export const DEFAULT_PEAK_ARRAY = [4, 7, 12, 9, 3, 8, 15, 6, 2];

export function generatePeakFindingTrace(
  rawArr: number[] = DEFAULT_PEAK_ARRAY
): TraceTimeline<PeakFindingStepData> {
  const events: TraceEvent<PeakFindingStepData>[] = [];
  let stepIndex = 0;
  const array = [...rawArr];
  const n = array.length;

  if (n === 0) {
    events.push({
      step: stepIndex++,
      type: 'INIT',
      message: {
        es: 'Arreglo vacío. No existen elementos para evaluar.',
        en: 'Empty array. No elements to evaluate.'
      },
      data: {
        array,
        start: -1,
        end: -1,
        mid: null,
        leftVal: null,
        rightVal: null,
        decision: 'INIT',
        foundIndex: -1,
        discardedRanges: [],
        description: {
          es: 'El arreglo está vacío. No hay picos.',
          en: 'The array is empty. No peaks exist.'
        }
      }
    });
    return { events, totalSteps: events.length };
  }

  let inicio = 0;
  let fin = n - 1;
  const discardedRanges: [number, number][] = [];

  // Step 0: INIT
  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicialización: Arreglo de tamaño n = ${n}. Ventana de búsqueda inicial [0, ${fin}].`,
      en: `Initialization: Array size n = ${n}. Initial search window [0, ${fin}].`
    },
    data: {
      array,
      start: inicio,
      end: fin,
      mid: null,
      leftVal: null,
      rightVal: null,
      decision: 'INIT',
      foundIndex: null,
      discardedRanges: [...discardedRanges],
      description: {
        es: `Búsqueda binaria de pico en O(log n). El gradiente cuesta arriba garantiza que al menos un pico yace en la dirección ascendente.`,
        en: `Binary search for a peak in O(log n). The uphill gradient guarantees at least one peak lies in the uphill direction.`
      }
    }
  });

  while (inicio <= fin) {
    const medio = Math.floor((inicio + fin) / 2);
    const midVal = array[medio];
    const leftVal = medio > 0 ? array[medio - 1] : null;
    const rightVal = medio < n - 1 ? array[medio + 1] : null;

    // EVALUATE_MID
    events.push({
      step: stepIndex++,
      type: 'EVALUATE_MID',
      message: {
        es: `Punto medio m = ${medio} (valor: ${midVal}). Comparando con vecinos: izq=${leftVal ?? 'borde'}, der=${rightVal ?? 'borde'}.`,
        en: `Midpoint m = ${medio} (value: ${midVal}). Comparing with neighbors: left=${leftVal ?? 'edge'}, right=${rightVal ?? 'edge'}.`
      },
      data: {
        array,
        start: inicio,
        end: fin,
        mid: medio,
        leftVal,
        rightVal,
        decision: 'EVALUATE_MID',
        foundIndex: null,
        discardedRanges: [...discardedRanges],
        description: {
          es: `Evaluamos si la montaña sube hacia la izquierda (${leftVal !== null && leftVal > midVal ? 'SÍ' : 'NO'}), hacia la derecha (${rightVal !== null && rightVal > midVal ? 'SÍ' : 'NO'}) o si m ya es una cima.`,
          en: `Checking if mountain rises to the left (${leftVal !== null && leftVal > midVal ? 'YES' : 'NO'}), to the right (${rightVal !== null && rightVal > midVal ? 'YES' : 'NO'}) or if m is already a peak.`
        }
      }
    });

    // Check uphill left
    if (leftVal !== null && midVal < leftVal) {
      discardedRanges.push([medio, fin]);
      const prevFin = fin;
      fin = medio - 1;

      events.push({
        step: stepIndex++,
        type: 'GO_LEFT',
        message: {
          es: `Pendiente sube a la izquierda: A[${medio}] (${midVal}) < A[${medio - 1}] (${leftVal}). Descartamos mitad derecha [${medio}, ${prevFin}].`,
          en: `Slope rises to the left: A[${medio}] (${midVal}) < A[${medio - 1}] (${leftVal}). Discarding right half [${medio}, ${prevFin}].`
        },
        data: {
          array,
          start: inicio,
          end: fin,
          mid: medio,
          leftVal,
          rightVal,
          decision: 'GO_LEFT',
          foundIndex: null,
          discardedRanges: [...discardedRanges],
          description: {
            es: `Como A[m-1] > A[m], por el invariante del gradiente ascendente existe al menos un pico en [${inicio}, ${fin}]. Reducimos el problema a la mitad.`,
            en: `Since A[m-1] > A[m], by the uphill invariant at least one peak is guaranteed in [${inicio}, ${fin}]. Problem size halved.`
          }
        }
      });
    }
    // Check uphill right
    else if (rightVal !== null && midVal < rightVal) {
      discardedRanges.push([inicio, medio]);
      const prevInicio = inicio;
      inicio = medio + 1;

      events.push({
        step: stepIndex++,
        type: 'GO_RIGHT',
        message: {
          es: `Pendiente sube a la derecha: A[${medio}] (${midVal}) < A[${medio + 1}] (${rightVal}). Descartamos mitad izquierda [${prevInicio}, ${medio}].`,
          en: `Slope rises to the right: A[${medio}] (${midVal}) < A[${medio + 1}] (${rightVal}). Discarding left half [${prevInicio}, ${medio}].`
        },
        data: {
          array,
          start: inicio,
          end: fin,
          mid: medio,
          leftVal,
          rightVal,
          decision: 'GO_RIGHT',
          foundIndex: null,
          discardedRanges: [...discardedRanges],
          description: {
            es: `Como A[m+1] > A[m], por el invariante del gradiente ascendente existe al menos un pico en [${inicio}, ${fin}]. Reducimos el problema a la mitad.`,
            en: `Since A[m+1] > A[m], by the uphill invariant at least one peak is guaranteed in [${inicio}, ${fin}]. Problem size halved.`
          }
        }
      });
    }
    // Peak found!
    else {
      events.push({
        step: stepIndex++,
        type: 'PEAK_FOUND',
        message: {
          es: `¡Pico encontrado en índice ${medio} (valor ${midVal})! A[${medio}] es mayor o igual a ambos vecinos.`,
          en: `Peak found at index ${medio} (value ${midVal})! A[${medio}] is greater than or equal to both neighbors.`
        },
        data: {
          array,
          start: inicio,
          end: fin,
          mid: medio,
          leftVal,
          rightVal,
          decision: 'PEAK_FOUND',
          foundIndex: medio,
          discardedRanges: [...discardedRanges],
          description: {
            es: `El elemento en posición ${medio} (valor ${midVal}) satisface la condición de pico local en O(log n) pasos.`,
            en: `Element at position ${medio} (value ${midVal}) satisfies local peak condition in O(log n) steps.`
          }
        }
      });
      break;
    }
  }

  return {
    events,
    totalSteps: events.length
  };
}
