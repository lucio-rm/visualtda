import { TraceTimeline, TraceEvent } from '../../types';

export interface GroupOfFive {
  elements: number[];
  median: number;
}

export interface MedianOfMediansStepData {
  array: number[];
  k: number;
  groups: GroupOfFive[];
  medians: number[];
  pivot: number | null;
  lesser: number[];
  equal: number[];
  greater: number[];
  guaranteedEliminatedCount: number;
  action: 'INIT' | 'GROUP_OF_FIVE' | 'FIND_MEDIANS' | 'SELECT_PIVOT' | 'PARTITION' | 'SELECT_BRANCH' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_MOM_ARRAY = [
  12, 3, 5, 7, 4, 19, 26, 0, 8, 15,
  17, 1, 9, 21, 6, 2, 14, 10, 25, 11
]; // 20 elements, 4 groups of 5

export function generateMedianOfMediansTrace(
  inputArray: number[] = DEFAULT_MOM_ARRAY,
  targetK: number = 7 // 8th smallest element
): TraceTimeline<MedianOfMediansStepData> {
  const events: TraceEvent<MedianOfMediansStepData>[] = [];
  const array = [...inputArray];
  let eventCounter = 0;

  function pushEvent(
    action: MedianOfMediansStepData['action'],
    groups: GroupOfFive[],
    medians: number[],
    pivot: number | null,
    lesser: number[],
    equal: number[],
    greater: number[],
    eliminated: number,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        array: [...array],
        k: targetK,
        groups: groups.map((g) => ({ elements: [...g.elements], median: g.median })),
        medians: [...medians],
        pivot,
        lesser: [...lesser],
        equal: [...equal],
        greater: [...greater],
        guaranteedEliminatedCount: eliminated,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // 1. Initial State
  pushEvent(
    'INIT',
    [],
    [],
    null,
    [],
    [],
    [],
    0,
    `Búsqueda del elemento con índice k = ${targetK} (${targetK + 1}° menor) en un arreglo de n = ${array.length} elementos sin ordenar. Objetivo: tiempo lineal O(n) determinístico en el peor caso.`,
    `Finding element at index k = ${targetK} in unsorted array of n = ${array.length}. Goal: worst-case deterministic O(n) time.`
  );

  // 2. Divide into groups of 5
  const groups: GroupOfFive[] = [];
  for (let i = 0; i < array.length; i += 5) {
    const chunk = array.slice(i, i + 5);
    const sorted = [...chunk].sort((a, b) => a - b);
    const m = sorted[Math.floor(sorted.length / 2)];
    groups.push({ elements: chunk, median: m });
  }

  pushEvent(
    'GROUP_OF_FIVE',
    groups,
    [],
    null,
    [],
    [],
    [],
    0,
    `División en ⌈n/5⌉ = ${groups.length} grupos de 5 elementos. Agrupar de a 5 garantiza que la suma de subproblemas (n/5 + 7n/10 = 9n/10) sea estrictamente menor que 1.`,
    `Divided into ⌈n/5⌉ = ${groups.length} groups of 5 elements. Groups of 5 guarantee subproblem ratio (1/5 + 7/10 = 9/10) < 1.`
  );

  // 3. Find medians
  const medians = groups.map((g) => g.median);
  pushEvent(
    'FIND_MEDIANS',
    groups,
    medians,
    null,
    [],
    [],
    [],
    0,
    `Mediana calculada para cada grupo de 5: [${medians.join(', ')}]. Cada una requiere solo O(1) operaciones.`,
    `Median computed for each group of 5: [${medians.join(', ')}]. Each takes O(1) operations.`
  );

  // 4. Pivot: Median of medians
  const sortedMedians = [...medians].sort((a, b) => a - b);
  const pivot = sortedMedians[Math.floor(sortedMedians.length / 2)];

  pushEvent(
    'SELECT_PIVOT',
    groups,
    medians,
    pivot,
    [],
    [],
    [],
    Math.floor((3 * array.length) / 10),
    `Pivote seleccionado: Mediana de medianas p = ${pivot}. Propiedad fundamental: al menos 3/10 de los elementos (≥ ${Math.floor((3 * array.length) / 10)}) son ≤ p y al menos 3/10 son ≥ p.`,
    `Selected pivot: Median of medians p = ${pivot}. Key property: at least 3/10 of elements (≥ ${Math.floor((3 * array.length) / 10)}) are guaranteed ≤ p, and ≥ 3/10 are ≥ p.`
  );

  // 5. Partition around pivot
  const lesser = array.filter((x) => x < pivot);
  const equal = array.filter((x) => x === pivot);
  const greater = array.filter((x) => x > pivot);

  pushEvent(
    'PARTITION',
    groups,
    medians,
    pivot,
    lesser,
    equal,
    greater,
    Math.floor((3 * array.length) / 10),
    `Partición 3-vías alrededor de p = ${pivot}: Menores: ${lesser.length} elementos, Iguales: ${equal.length}, Mayores: ${greater.length}.`,
    `3-way partition around p = ${pivot}: Lesser: ${lesser.length}, Equal: ${equal.length}, Greater: ${greater.length}.`
  );

  // 6. Branch
  let finalResult = pivot;
  if (targetK < lesser.length) {
    pushEvent(
      'SELECT_BRANCH',
      groups,
      medians,
      pivot,
      lesser,
      equal,
      greater,
      greater.length + equal.length,
      `k = ${targetK} < |Menores| (${lesser.length}): El elemento buscado está en la mitad izquierda. Se descartan ${greater.length + equal.length} elementos sin evaluarlos.`,
      `k = ${targetK} < |Lesser| (${lesser.length}): Target is in left half. Pruned ${greater.length + equal.length} elements.`
    );
    const sortedLesser = [...lesser].sort((a, b) => a - b);
    finalResult = sortedLesser[targetK];
  } else if (targetK < lesser.length + equal.length) {
    pushEvent(
      'SELECT_BRANCH',
      groups,
      medians,
      pivot,
      lesser,
      equal,
      greater,
      array.length - 1,
      `|Menores| (${lesser.length}) ≤ k (${targetK}) < |Menores| + |Iguales| (${lesser.length + equal.length}): ¡El pivote p = ${pivot} es exactamente el elemento buscado!`,
      `|Lesser| ≤ k < |Lesser| + |Equal|: Pivot p = ${pivot} is exactly the sought element!`
    );
    finalResult = pivot;
  } else {
    const newK = targetK - lesser.length - equal.length;
    pushEvent(
      'SELECT_BRANCH',
      groups,
      medians,
      pivot,
      lesser,
      equal,
      greater,
      lesser.length + equal.length,
      `k = ${targetK} ≥ |Menores| + |Iguales| (${lesser.length + equal.length}): El elemento está en los Mayores con nuevo rango k' = ${newK}. Se descartan ${lesser.length + equal.length} elementos.`,
      `Target is in Greater half with new rank k' = ${newK}. Pruned ${lesser.length + equal.length} elements.`
    );
    const sortedGreater = [...greater].sort((a, b) => a - b);
    finalResult = sortedGreater[newK];
  }

  // 7. Complete
  pushEvent(
    'COMPLETE',
    groups,
    medians,
    pivot,
    lesser,
    equal,
    greater,
    0,
    `Búsqueda completada. El k-ésimo elemento (índice ${targetK}) es ${finalResult}. Ecuación de recurrencia demostrada: T(n) ≤ T(n/5) + T(7n/10) + O(n) ⇒ O(n) lineal estricto en peor caso.`,
    `Selection complete. Element at rank k = ${targetK} is ${finalResult}. Recurrence: T(n) ≤ T(n/5) + T(7n/10) + O(n) ⇒ strict worst-case O(n) linear time.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
