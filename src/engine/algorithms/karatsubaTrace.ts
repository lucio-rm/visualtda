import { TraceTimeline, TraceEvent } from '../../types';

export interface KaratsubaNode {
  id: string;
  x: number;
  y: number;
  m: number;
  x1: number;
  x0: number;
  y1: number;
  y0: number;
  z2: number | null;
  z0: number | null;
  zSum: number | null;
  z1: number | null;
  result: number | null;
}

export interface KaratsubaStepData {
  x: number;
  y: number;
  m: number;
  x1: number;
  x0: number;
  y1: number;
  y0: number;
  z2: number | null;
  z0: number | null;
  zSum: number | null;
  z1: number | null;
  result: number | null;
  currentSubcalc: 'NONE' | 'Z2' | 'Z0' | 'ZSUM' | 'Z1' | 'COMBINE';
  multiplicationCount: number;
  standardMultiplicationCount: number;
  action: 'INIT' | 'SPLIT_DIGITS' | 'COMPUTE_Z2' | 'COMPUTE_Z0' | 'COMPUTE_ZSUM' | 'COMPUTE_Z1' | 'COMBINE' | 'COMPLETE';
  description: { es: string; en: string };
}

export function generateKaratsubaTrace(x: number = 5678, y: number = 1234): TraceTimeline<KaratsubaStepData> {
  const events: TraceEvent<KaratsubaStepData>[] = [];
  let eventCounter = 0;

  const nDigits = Math.max(x.toString().length, y.toString().length);
  const m = Math.floor(nDigits / 2);
  const pot = Math.pow(10, m);

  const x1 = Math.floor(x / pot);
  const x0 = x % pot;
  const y1 = Math.floor(y / pot);
  const y0 = y % pot;

  let z2: number | null = null;
  let z0: number | null = null;
  let zSum: number | null = null;
  let z1: number | null = null;
  let result: number | null = null;

  function pushEvent(
    action: KaratsubaStepData['action'],
    subcalc: KaratsubaStepData['currentSubcalc'],
    multCount: number,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        x,
        y,
        m,
        x1,
        x0,
        y1,
        y0,
        z2,
        z0,
        zSum,
        z1,
        result,
        currentSubcalc: subcalc,
        multiplicationCount: multCount,
        standardMultiplicationCount: 4,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // 1. Init
  pushEvent(
    'INIT',
    'NONE',
    0,
    `Multiplicación de enteros x = ${x} e y = ${y} (${nDigits} dígitos). El método ingenuo requiere 4 multiplicaciones de subenteros. Karatsuba usará solo 3.`,
    `Multiplying integers x = ${x} and y = ${y} (${nDigits} digits). Naive divide-and-conquer needs 4 multiplications. Karatsuba uses only 3.`
  );

  // 2. Split
  pushEvent(
    'SPLIT_DIGITS',
    'NONE',
    0,
    `División en base 10^${m}: x = ${x1}·10^${m} + ${x0}, y = ${y1}·10^${m} + ${y0}. Partes altas: (x1=${x1}, y1=${y1}), partes bajas: (x0=${x0}, y0=${y0}).`,
    `Split at base 10^${m}: x = ${x1}·10^${m} + ${x0}, y = ${y1}·10^${m} + ${y0}. High parts: (x1=${x1}, y1=${y1}), low parts: (x0=${x0}, y0=${y0}).`
  );

  // 3. Compute z2
  z2 = x1 * y1;
  pushEvent(
    'COMPUTE_Z2',
    'Z2',
    1,
    `Multiplicación 1/3 (Término alto): z2 = x1 · y1 = ${x1} · ${y1} = ${z2}. Corresponde al coeficiente de 10^(2·${m}).`,
    `Multiplication 1/3 (High term): z2 = x1 · y1 = ${x1} · ${y1} = ${z2}. Coefficient of 10^(2·${m}).`
  );

  // 4. Compute z0
  z0 = x0 * y0;
  pushEvent(
    'COMPUTE_Z0',
    'Z0',
    2,
    `Multiplicación 2/3 (Término bajo): z0 = x0 · y0 = ${x0} · ${y0} = ${z0}. Corresponde al término independiente.`,
    `Multiplication 2/3 (Low term): z0 = x0 · y0 = ${x0} · ${y0} = ${z0}. Independent term.`
  );

  // 5. Compute zSum
  const sumX = x1 + x0;
  const sumY = y1 + y0;
  zSum = sumX * sumY;
  pushEvent(
    'COMPUTE_ZSUM',
    'ZSUM',
    3,
    `Multiplicación 3/3 (Truco de Karatsuba): z_sum = (x1 + x0) · (y1 + y0) = (${x1}+${x0}) · (${y1}+${y0}) = ${sumX} · ${sumY} = ${zSum}.`,
    `Multiplication 3/3 (Karatsuba trick): z_sum = (x1 + x0) · (y1 + y0) = (${x1}+${x0}) · (${y1}+${y0}) = ${sumX} · ${sumY} = ${zSum}.`
  );

  // 6. Compute z1
  z1 = zSum - z2 - z0;
  pushEvent(
    'COMPUTE_Z1',
    'Z1',
    3,
    `Cálculo del término cruzado sin multiplicar: z1 = z_sum - z2 - z0 = ${zSum} - ${z2} - ${z0} = ${z1}. Nota que exactamente x1·y0 + x0·y1 = ${x1*y0} + ${x0*y1} = ${z1}. ¡Se ahorró una multiplicación entera!`,
    `Cross term computed without multiplication: z1 = z_sum - z2 - z0 = ${zSum} - ${z2} - ${z0} = ${z1}. Equals x1·y0 + x0·y1 with zero extra multiplications!`
  );

  // 7. Combine
  const term2 = z2 * Math.pow(10, 2 * m);
  const term1 = z1 * pot;
  result = term2 + term1 + z0;
  pushEvent(
    'COMBINE',
    'COMBINE',
    3,
    `Combinación: x·y = z2·10^(2·${m}) + z1·10^${m} + z0 = ${term2} + ${term1} + ${z0} = ${result}.`,
    `Combination: x·y = z2·10^(2·${m}) + z1·10^${m} + z0 = ${term2} + ${term1} + ${z0} = ${result}.`
  );

  // 8. Complete
  pushEvent(
    'COMPLETE',
    'NONE',
    3,
    `Multiplicación completada: ${x} · ${y} = ${result}. Verificación: ${x * y === result ? 'CORRECTO ✓' : 'ERROR'}. Complejidad: T(n) = 3T(n/2) + O(n) ⇒ O(n^1.585) frente a O(n^2) del método tradicional.`,
    `Multiplication complete: ${x} · ${y} = ${result}. Verification: ${x * y === result ? 'CORRECT ✓' : 'ERROR'}. Complexity: T(n) = 3T(n/2) + O(n) ⇒ O(n^1.585) vs O(n^2) naive.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
