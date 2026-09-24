import { TraceTimeline, TraceEvent } from '../../types';

export interface MajorityElementStepData {
  array: number[];
  left: number;
  right: number;
  mid: number | null;
  candLeft: number | null;
  candRight: number | null;
  countLeft: number;
  countRight: number;
  threshold: number;
  winner: number | null;
  recursionDepth: number;
  action: 'INIT' | 'SPLIT' | 'BASE_CASE' | 'SOLVE_LEFT' | 'SOLVE_RIGHT' | 'COMBINE_VERIFY' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_MAJORITY_ARRAY = [2, 2, 1, 1, 2, 2, 3, 2]; // n=8, majority = 2

export function generateMajorityElementTrace(
  inputArray: number[] = DEFAULT_MAJORITY_ARRAY
): TraceTimeline<MajorityElementStepData> {
  const events: TraceEvent<MajorityElementStepData>[] = [];
  const array = [...inputArray];
  let eventCounter = 0;

  function pushEvent(
    action: MajorityElementStepData['action'],
    left: number,
    right: number,
    mid: number | null,
    candL: number | null,
    candR: number | null,
    cntL: number,
    cntR: number,
    winner: number | null,
    depth: number,
    descEs: string,
    descEn: string
  ) {
    const threshold = Math.floor((right - left + 1) / 2);
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        array: [...array],
        left,
        right,
        mid,
        candLeft: candL,
        candRight: candR,
        countLeft: cntL,
        countRight: cntR,
        threshold,
        winner,
        recursionDepth: depth,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // 1. Initial State
  pushEvent(
    'INIT',
    0,
    array.length - 1,
    null,
    null,
    null,
    0,
    0,
    null,
    0,
    `Arreglo de entrada con n = ${array.length} elementos. Un elemento es mayoritario si aparece estrictamente más de n/2 = ${Math.floor(array.length / 2)} veces.`,
    `Input array with n = ${array.length} elements. An element is majority if it appears strictly more than n/2 = ${Math.floor(array.length / 2)} times.`
  );

  function solve(izq: number, der: number, depth: number): number | null {
    if (izq === der) {
      const val = array[izq];
      pushEvent(
        'BASE_CASE',
        izq,
        der,
        null,
        val,
        null,
        1,
        0,
        val,
        depth,
        `Caso base [${izq}]: Subarreglo de 1 elemento (${val}). Es trivialmente el candidato mayoritario local.`,
        `Base case [${izq}]: Single element subarray (${val}). Trivially local majority candidate.`
      );
      return val;
    }

    const mid = Math.floor((izq + der) / 2);
    pushEvent(
      'SPLIT',
      izq,
      der,
      mid,
      null,
      null,
      0,
      0,
      null,
      depth,
      `División del rango [${izq}..${der}] en mitad izquierda [${izq}..${mid}] y mitad derecha [${mid + 1}..${der}].`,
      `Splitting range [${izq}..${der}] into left half [${izq}..${mid}] and right half [${mid + 1}..${der}].`
    );

    const candIzq = solve(izq, mid, depth + 1);
    const candDer = solve(mid + 1, der, depth + 1);

    if (candIzq === candDer) {
      pushEvent(
        'COMBINE_VERIFY',
        izq,
        der,
        mid,
        candIzq,
        candDer,
        0,
        0,
        candIzq,
        depth,
        `Ambas mitades coinciden en el candidato ${candIzq}. Por propiedad de D&C, ${candIzq} es el ganador del rango [${izq}..${der}].`,
        `Both halves agree on candidate ${candIzq}. By D&C property, ${candIzq} wins range [${izq}..${der}].`
      );
      return candIzq;
    }

    // Count candidates
    let countIzq = 0;
    let countDer = 0;
    for (let i = izq; i <= der; i++) {
      if (candIzq !== null && array[i] === candIzq) countIzq++;
      if (candDer !== null && array[i] === candDer) countDer++;
    }

    const threshold = Math.floor((der - izq + 1) / 2);
    let ganador: number | null = null;
    if (countIzq > threshold) {
      ganador = candIzq;
    } else if (countDer > threshold) {
      ganador = candDer;
    }

    pushEvent(
      'COMBINE_VERIFY',
      izq,
      der,
      mid,
      candIzq,
      candDer,
      countIzq,
      countDer,
      ganador,
      depth,
      ganador !== null
        ? `Verificación en [${izq}..${der}]: candidato ${ganador} tiene ${ganador === candIzq ? countIzq : countDer} apariciones > umbral ${threshold}. ¡Gana el rango!`
        : `Verificación en [${izq}..${der}]: ningún candidato superó el umbral > ${threshold} (candIzq=${candIzq}: ${countIzq}, candDer=${candDer}: ${countDer}). Ningún mayoritario en este rango.`,
      ganador !== null
        ? `Verification in [${izq}..${der}]: candidate ${ganador} has > threshold ${threshold} occurrences. Wins range!`
        : `Verification in [${izq}..${der}]: neither candidate exceeded > ${threshold}. No majority in range.`
    );

    return ganador;
  }

  const finalWinner = solve(0, array.length - 1, 0);

  pushEvent(
    'COMPLETE',
    0,
    array.length - 1,
    null,
    finalWinner,
    null,
    0,
    0,
    finalWinner,
    0,
    finalWinner !== null
      ? `Resultado final: El elemento mayoritario del arreglo es ${finalWinner}. Complejidad: T(n) = 2T(n/2) + O(n) ⇒ O(n log n).`
      : `Resultado final: No existe elemento mayoritario en el arreglo. Ningún elemento supera estrictamente n/2 apariciones.`,
    finalWinner !== null
      ? `Final result: Majority element is ${finalWinner}. Complexity: T(n) = 2T(n/2) + O(n) ⇒ O(n log n).`
      : `Final result: No majority element exists in the array.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
