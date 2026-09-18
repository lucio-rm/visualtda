import { TraceEvent, TraceTimeline } from '../../types/trace';
import { KnapsackItem } from './knapsackDpValidator';

export interface KnapsackDpStepData {
  items: KnapsackItem[];
  capacity: number;
  table: number[][];
  computedMask: boolean[][];
  currentRow: number; // 0..n
  currentCol: number; // 0..capacity
  highlightTarget?: [number, number]; // [i, w]
  excludeSource?: [number, number];   // [i-1, w]
  includeSource?: [number, number];   // [i-1, w - weight]
  decisionType: 'init' | 'base_case' | 'cannot_fit' | 'compare' | 'reconstruct' | 'complete';
  comparison?: {
    excludeValue: number;
    includeValue: number;
    chosen: 'exclude' | 'include';
  };
  selectedItemIds: string[];
  reconstructionPointer?: [number, number];
  totalWeight: number;
  totalValue: number;
}

export const DEFAULT_DP_ITEMS: KnapsackItem[] = [
  { id: 'item-guitar', name: 'Guitarra', weight: 1, value: 15 },
  { id: 'item-phone', name: 'Celular', weight: 1, value: 20 },
  { id: 'item-laptop', name: 'Laptop', weight: 3, value: 20 },
  { id: 'item-stereo', name: 'Stereo', weight: 4, value: 30 }
];

export const DEFAULT_DP_CAPACITY = 6;

export function generateKnapsackDpTrace(
  items: KnapsackItem[] = DEFAULT_DP_ITEMS,
  capacity: number = DEFAULT_DP_CAPACITY
): TraceTimeline<KnapsackDpStepData> {
  const events: TraceEvent<KnapsackDpStepData>[] = [];
  const n = items.length;

  const table: number[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(0));
  const computedMask: boolean[][] = Array.from({ length: n + 1 }, () => Array(capacity + 1).fill(false));

  const cloneTable = () => table.map((row) => [...row]);
  const cloneMask = () => computedMask.map((row) => [...row]);

  let stepIndex = 0;

  // 0. Initial Event
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Inicializando tabla DP (${n + 1} filas × ${capacity + 1} columnas) para ${n} ítems y capacidad W=${capacity}.`,
      en: `Initializing DP table (${n + 1} rows × ${capacity + 1} cols) for ${n} items and capacity W=${capacity}.`
    },
    data: {
      items,
      capacity,
      table: cloneTable(),
      computedMask: cloneMask(),
      currentRow: -1,
      currentCol: -1,
      decisionType: 'init',
      selectedItemIds: [],
      totalWeight: 0,
      totalValue: 0
    }
  });

  // Base Cases: Row 0 (0 items)
  for (let w = 0; w <= capacity; w++) {
    table[0][w] = 0;
    computedMask[0][w] = true;
  }

  // Base Cases: Col 0 (0 capacity)
  for (let i = 0; i <= n; i++) {
    table[i][0] = 0;
    computedMask[i][0] = true;
  }

  events.push({
    step: stepIndex++,
    type: 'base_case',
    message: {
      es: 'Casos base: con 0 ítems o capacidad 0, el valor alcanzable es $0.',
      en: 'Base cases: with 0 items or capacity 0, attainable value is $0.'
    },
    data: {
      items,
      capacity,
      table: cloneTable(),
      computedMask: cloneMask(),
      currentRow: 0,
      currentCol: 0,
      decisionType: 'base_case',
      selectedItemIds: [],
      totalWeight: 0,
      totalValue: 0
    }
  });

  // Bottom-up evaluation
  for (let i = 1; i <= n; i++) {
    const item = items[i - 1];

    for (let w = 1; w <= capacity; w++) {
      if (item.weight > w) {
        // Cannot fit item
        table[i][w] = table[i - 1][w];
        computedMask[i][w] = true;

        events.push({
          step: stepIndex++,
          type: 'cannot_fit',
          message: {
            es: `Ítem ${i} (${item.name}, peso ${item.weight}) no cabe en capacidad ${w}. Se hereda DP[${i - 1}][${w}] = $${table[i - 1][w]}.`,
            en: `Item ${i} (${item.name}, weight ${item.weight}) does not fit in capacity ${w}. Inherit DP[${i - 1}][${w}] = $${table[i - 1][w]}.`
          },
          data: {
            items,
            capacity,
            table: cloneTable(),
            computedMask: cloneMask(),
            currentRow: i,
            currentCol: w,
            highlightTarget: [i, w],
            excludeSource: [i - 1, w],
            decisionType: 'cannot_fit',
            selectedItemIds: [],
            totalWeight: 0,
            totalValue: 0
          }
        });
      } else {
        // Fits: compare exclude vs include
        const excludeVal = table[i - 1][w];
        const includeVal = table[i - 1][w - item.weight] + item.value;
        const chosen = includeVal > excludeVal ? 'include' : 'exclude';
        table[i][w] = Math.max(excludeVal, includeVal);
        computedMask[i][w] = true;

        events.push({
          step: stepIndex++,
          type: 'compare',
          message: {
            es: `Ítem ${i} (${item.name}): Excluir=$${excludeVal} vs Incluir=$${includeVal} ($${table[i - 1][w - item.weight]} + $${item.value}). Óptimo: $${table[i][w]} (${chosen === 'include' ? 'INCLUIDO' : 'EXCLUIDO'}).`,
            en: `Item ${i} (${item.name}): Exclude=$${excludeVal} vs Include=$${includeVal}. Optimal: $${table[i][w]} (${chosen}).`
          },
          data: {
            items,
            capacity,
            table: cloneTable(),
            computedMask: cloneMask(),
            currentRow: i,
            currentCol: w,
            highlightTarget: [i, w],
            excludeSource: [i - 1, w],
            includeSource: [i - 1, w - item.weight],
            decisionType: 'compare',
            comparison: {
              excludeValue: excludeVal,
              includeValue: includeVal,
              chosen
            },
            selectedItemIds: [],
            totalWeight: 0,
            totalValue: 0
          }
        });
      }
    }
  }

  // Reconstruction Phase
  const selectedIds: string[] = [];
  let remCap = capacity;

  for (let i = n; i >= 1; i--) {
    const item = items[i - 1];
    const isIncluded = table[i][remCap] !== table[i - 1][remCap];

    events.push({
      step: stepIndex++,
      type: 'reconstruct',
      message: {
        es: isIncluded
          ? `Reconstrucción: En DP[${i}][${remCap}] (${table[i][remCap]}) != DP[${i - 1}][${remCap}] (${table[i - 1][remCap]}). Se incluyó ${item.name} (peso ${item.weight}, valor $${item.value}).`
          : `Reconstrucción: En DP[${i}][${remCap}] coincide con fila anterior. Se excluyó ${item.name}.`,
        en: isIncluded
          ? `Reconstruction: DP[${i}][${remCap}] != DP[${i - 1}][${remCap}]. Selected ${item.name}.`
          : `Reconstruction: DP[${i}][${remCap}] matches previous row. Excluded ${item.name}.`
      },
      data: {
        items,
        capacity,
        table: cloneTable(),
        computedMask: cloneMask(),
        currentRow: i,
        currentCol: remCap,
        highlightTarget: [i, remCap],
        reconstructionPointer: [i, remCap],
        decisionType: 'reconstruct',
        selectedItemIds: [...selectedIds],
        totalWeight: items.filter((it) => selectedIds.includes(it.id)).reduce((acc, it) => acc + it.weight, 0),
        totalValue: items.filter((it) => selectedIds.includes(it.id)).reduce((acc, it) => acc + it.value, 0)
      }
    });

    if (isIncluded) {
      selectedIds.unshift(item.id);
      remCap -= item.weight;
    }
  }

  const finalTotalWeight = items.filter((it) => selectedIds.includes(it.id)).reduce((acc, it) => acc + it.weight, 0);
  const finalTotalValue = items.filter((it) => selectedIds.includes(it.id)).reduce((acc, it) => acc + it.value, 0);

  // Completion Event
  events.push({
    step: stepIndex,
    type: 'complete',
    message: {
      es: `Completado: Solución óptima con valor $${finalTotalValue} y peso ${finalTotalWeight}/${capacity}.`,
      en: `Completed: Optimal solution with value $${finalTotalValue} and weight ${finalTotalWeight}/${capacity}.`
    },
    data: {
      items,
      capacity,
      table: cloneTable(),
      computedMask: cloneMask(),
      currentRow: -1,
      currentCol: -1,
      highlightTarget: [n, capacity],
      decisionType: 'complete',
      selectedItemIds: [...selectedIds],
      totalWeight: finalTotalWeight,
      totalValue: finalTotalValue
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
