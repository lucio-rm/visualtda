import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';
import { computeHuffmanCost } from './huffmanValidator';

export type HuffmanAction =
  | 'INIT'
  | 'SELECT_TWO_MIN'
  | 'MERGE_NODES'
  | 'GENERATE_CODES'
  | 'COMPLETE';

export interface HuffmanTraceItem {
  id: string;
  char: string | null;
  freq: number;
  leftId?: string;
  rightId?: string;
}

export interface HuffmanStepData {
  queue: HuffmanTraceItem[];
  selectedIds: [string, string] | null;
  mergedParent: HuffmanTraceItem | null;
  codes: Record<string, string>;
  totalCostBits: number;
  fixedCostBits: number;
  action: HuffmanAction;
  description: LocalizedString;
  allNodes: Record<string, HuffmanTraceItem>;
  forestRoots: string[];
}

export const DEFAULT_HUFFMAN_FREQS: Record<string, number> = {
  A: 45,
  B: 13,
  C: 12,
  D: 16,
  E: 9,
  F: 5
};

export function generateHuffmanTrace(
  frequencies: Record<string, number> = DEFAULT_HUFFMAN_FREQS
): TraceTimeline<HuffmanStepData> {
  const events: TraceEvent<HuffmanStepData>[] = [];
  let stepIndex = 0;

  const totalChars = Object.values(frequencies).reduce((a, b) => a + b, 0);
  const fixedCost = totalChars * 8; // 8-bit ASCII baseline

  // Internal node representation
  interface InternalNode {
    id: string;
    char: string | null;
    freq: number;
    left: InternalNode | null;
    right: InternalNode | null;
  }

  const initialNodes: InternalNode[] = Object.entries(frequencies)
    .map(([char, freq]) => ({
      id: `leaf-${char}`,
      char,
      freq,
      left: null,
      right: null
    }))
    .sort((a, b) => a.freq - b.freq);

  const toTraceItem = (n: InternalNode): HuffmanTraceItem => ({
    id: n.id,
    char: n.char,
    freq: n.freq,
    leftId: n.left ? n.left.id : undefined,
    rightId: n.right ? n.right.id : undefined
  });

  const allNodes: Record<string, HuffmanTraceItem> = {};
  for (const n of initialNodes) {
    allNodes[n.id] = toTraceItem(n);
  }

  // Step 0: INIT
  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicialización: ${initialNodes.length} caracteres insertados en la cola de prioridad (Min-Heap).`,
      en: `Initialization: ${initialNodes.length} characters loaded into Min-Heap priority queue.`
    },
    data: {
      queue: initialNodes.map(toTraceItem),
      selectedIds: null,
      mergedParent: null,
      codes: {},
      totalCostBits: 0,
      fixedCostBits: fixedCost,
      action: 'INIT',
      allNodes: { ...allNodes },
      forestRoots: initialNodes.map((n) => n.id),
      description: {
        es: `Inicio: Cargamos cada carácter como un nodo hoja en el Min-Heap ordenado por frecuencia ascendente.`,
        en: `Start: Each character is enqueued into the Min-Heap sorted by ascending frequency.`
      }
    }
  });

  if (initialNodes.length <= 1) {
    const single = initialNodes[0];
    const codes = single ? { [single.char!]: '0' } : {};
    const cost = single ? single.freq : 0;
    events.push({
      step: stepIndex++,
      type: 'COMPLETE',
      message: {
        es: `Caso trivial (1 símbolo): código único "0".`,
        en: `Trivial case (1 symbol): single code "0".`
      },
      data: {
        queue: initialNodes.map(toTraceItem),
        selectedIds: null,
        mergedParent: null,
        codes,
        totalCostBits: cost,
        fixedCostBits: fixedCost,
        action: 'COMPLETE',
        allNodes: { ...allNodes },
        forestRoots: initialNodes.map((n) => n.id),
        description: {
          es: `Caso borde con un solo símbolo: asignamos código trivial "0".`,
          en: `Single symbol edge case: assign trivial "0" code.`
        }
      }
    });

    return { events, totalSteps: events.length };
  }

  const queue = [...initialNodes];
  let mergeCounter = 0;

  while (queue.length > 1) {
    const left = queue[0];
    const right = queue[1];
    const selectedIds: [string, string] = [left.id, right.id];

    // Step: SELECT_TWO_MIN
    events.push({
      step: stepIndex++,
      type: 'SELECT_TWO_MIN',
      message: {
        es: `Selección voraz: extraemos los dos nodos de menor frecuencia "${left.char ?? left.id}" (${left.freq}) y "${right.char ?? right.id}" (${right.freq}).`,
        en: `Greedy choice: extract the two lowest frequency nodes "${left.char ?? left.id}" (${left.freq}) and "${right.char ?? right.id}" (${right.freq}).`
      },
      data: {
        queue: queue.map(toTraceItem),
        selectedIds,
        mergedParent: null,
        codes: {},
        totalCostBits: 0,
        fixedCostBits: fixedCost,
        action: 'SELECT_TWO_MIN',
        allNodes: { ...allNodes },
        forestRoots: queue.map((n) => n.id),
        description: {
          es: `Estrategia Voraz: Extraemos los dos mínimos del heap: "${left.char ?? left.id}" (freq ${left.freq}) e "${right.char ?? right.id}" (freq ${right.freq}).`,
          en: `Greedy Choice: Pop the two smallest items: "${left.char ?? left.id}" (${left.freq}) and "${right.char ?? right.id}" (${right.freq}).`
        }
      }
    });

    queue.shift();
    queue.shift();
    mergeCounter++;

    const parent: InternalNode = {
      id: `internal-${mergeCounter}`,
      char: null,
      freq: left.freq + right.freq,
      left,
      right
    };

    allNodes[parent.id] = toTraceItem(parent);

    // Insert maintaining sorted order
    let insertIdx = 0;
    while (insertIdx < queue.length && queue[insertIdx].freq <= parent.freq) {
      insertIdx++;
    }
    queue.splice(insertIdx, 0, parent);

    // Step: MERGE_NODES
    events.push({
      step: stepIndex++,
      type: 'MERGE_NODES',
      message: {
        es: `Fusión: Creado nodo padre con frecuencia suma ${parent.freq} = ${left.freq} + ${right.freq}. Reinsertado en el heap.`,
        en: `Merge: Created parent node with sum frequency ${parent.freq} = ${left.freq} + ${right.freq}. Reinserted into heap.`
      },
      data: {
        queue: queue.map(toTraceItem),
        selectedIds: null,
        mergedParent: toTraceItem(parent),
        codes: {},
        totalCostBits: 0,
        fixedCostBits: fixedCost,
        action: 'MERGE_NODES',
        allNodes: { ...allNodes },
        forestRoots: queue.map((n) => n.id),
        description: {
          es: `Unión binaria: Rama izquierda '0' (${left.char ?? left.id}) y rama derecha '1' (${right.char ?? right.id}). Nueva frecuencia combinada: ${parent.freq}.`,
          en: `Binary union: Left branch '0' (${left.char ?? left.id}) and right branch '1' (${right.char ?? right.id}). New combined frequency: ${parent.freq}.`
        }
      }
    });
  }

  // Root remains
  const root = queue[0];
  const finalCodes: Record<string, string> = {};

  function traverseCodes(node: InternalNode | null, prefix: string) {
    if (!node) return;
    if (node.char !== null) {
      finalCodes[node.char] = prefix;
      return;
    }
    traverseCodes(node.left, prefix + '0');
    traverseCodes(node.right, prefix + '1');
  }

  traverseCodes(root, '');
  const optimalCost = computeHuffmanCost(frequencies, finalCodes);

  // Step: GENERATE_CODES
  events.push({
    step: stepIndex++,
    type: 'GENERATE_CODES',
    message: {
      es: `Árbol completo: asignando códigos binarios libres de prefijo por recorrido en profundidad.`,
      en: `Full tree: assigning prefix-free binary codewords via depth-first traversal.`
    },
    data: {
      queue: queue.map(toTraceItem),
      selectedIds: null,
      mergedParent: null,
      codes: { ...finalCodes },
      totalCostBits: optimalCost,
      fixedCostBits: fixedCost,
      action: 'GENERATE_CODES',
      allNodes: { ...allNodes },
      forestRoots: queue.map((n) => n.id),
      description: {
        es: `Recorrido DFS: Asignamos '0' a cada arista izquierda y '1' a cada arista derecha hasta alcanzar cada hoja.`,
        en: `DFS Traversal: Assign '0' to each left edge and '1' to each right edge down to every leaf.`
      }
    }
  });

  // Step: COMPLETE
  const savings = Math.round(((fixedCost - optimalCost) / fixedCost) * 100);
  events.push({
    step: stepIndex++,
    type: 'COMPLETE',
    message: {
      es: `¡Compresión Óptima! Costo Huffman: ${optimalCost} bits vs ASCII: ${fixedCost} bits (${savings}% de ahorro).`,
      en: `Optimal Compression! Huffman cost: ${optimalCost} bits vs ASCII: ${fixedCost} bits (${savings}% savings).`
    },
    data: {
      queue: queue.map(toTraceItem),
      selectedIds: null,
      mergedParent: null,
      codes: { ...finalCodes },
      totalCostBits: optimalCost,
      fixedCostBits: fixedCost,
      action: 'COMPLETE',
      allNodes: { ...allNodes },
      forestRoots: queue.map((n) => n.id),
      description: {
        es: `¡Codificación Óptima Completada! Costo total: ${optimalCost} bits (vs ${fixedCost} bits en ASCII de 8 bits). Se redujo el tamaño en un ${savings}%.`,
        en: `Optimal Huffman Coding Complete! Total cost: ${optimalCost} bits (vs ${fixedCost} bits in 8-bit ASCII). Size reduced by ${savings}%.`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
