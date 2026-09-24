import { TraceTimeline, TraceEvent } from '../../types';

export interface BBTreeNode {
  id: string;
  parentId: string | null;
  itemIndex: number;
  decision: 'include' | 'exclude' | 'root';
  weight: number;
  value: number;
  upperBound: number;
  pruned: boolean;
  pruneReason?: 'capacity' | 'bound';
  isBest: boolean;
  x: number;
  y: number;
}

export interface KnapsackBBStepData {
  capacity: number;
  items: Array<{ id: string; w: number; v: number; ratio: number }>;
  treeNodes: BBTreeNode[];
  currentNodeId: string | null;
  incumbentBest: number;
  prunedCount: number;
  exploredCount: number;
  action: 'INIT' | 'EXPLORE_NODE' | 'PRUNE_BOUND' | 'PRUNE_CAPACITY' | 'UPDATE_INCUMBENT' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_BB_ITEMS = [
  { id: 'I1', w: 2, v: 40, ratio: 20 },
  { id: 'I2', w: 3, v: 50, ratio: 16.67 },
  { id: 'I3', w: 4, v: 60, ratio: 15 },
  { id: 'I4', w: 5, v: 50, ratio: 10 }
];

export function generateKnapsackBBTrace(
  capacity: number = 7,
  rawItems = DEFAULT_BB_ITEMS
): TraceTimeline<KnapsackBBStepData> {
  const events: TraceEvent<KnapsackBBStepData>[] = [];
  const items = [...rawItems].sort((a, b) => b.ratio - a.ratio);
  const n = items.length;

  const treeNodes: BBTreeNode[] = [];
  let eventCounter = 0;
  let incumbentBest = 0;
  let prunedCount = 0;
  let exploredCount = 0;

  function calculateBound(idx: number, curW: number, curV: number): number {
    if (curW > capacity) return 0;
    let b = curV;
    let rem = capacity - curW;
    for (let i = idx; i < n; i++) {
      if (items[i].w <= rem) {
        rem -= items[i].w;
        b += items[i].v;
      } else {
        b += items[i].v * (rem / items[i].w);
        break;
      }
    }
    return Math.round(b * 10) / 10;
  }

  function pushEvent(
    action: KnapsackBBStepData['action'],
    nodeId: string | null,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        capacity,
        items,
        treeNodes: treeNodes.map((node) => ({ ...node })),
        currentNodeId: nodeId,
        incumbentBest,
        prunedCount,
        exploredCount,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // Root node
  const rootBound = calculateBound(0, 0, 0);
  const rootNode: BBTreeNode = {
    id: 'root',
    parentId: null,
    itemIndex: 0,
    decision: 'root',
    weight: 0,
    value: 0,
    upperBound: rootBound,
    pruned: false,
    isBest: false,
    x: 250,
    y: 30
  };
  treeNodes.push(rootNode);

  pushEvent(
    'INIT',
    'root',
    `Raíz inicializada: Capacidad W = ${capacity}. Cota superior continua UB(raíz) = ${rootBound}. Mejor valor incumbent = 0.`,
    `Root initialized: Capacity W = ${capacity}. Continuous upper bound UB(root) = ${rootBound}. Incumbent best = 0.`
  );

  let nodeCounter = 1;

  function branch(parentId: string, itemIdx: number, curW: number, curV: number, decision: 'include' | 'exclude', x: number, y: number) {
    const it = items[itemIdx];
    const newW = decision === 'include' ? curW + it.w : curW;
    const newV = decision === 'include' ? curV + it.v : curV;
    const bound = calculateBound(itemIdx + 1, newW, newV);
    const nodeId = `node_${nodeCounter++}`;
    exploredCount++;

    const newNode: BBTreeNode = {
      id: nodeId,
      parentId,
      itemIndex: itemIdx + 1,
      decision,
      weight: newW,
      value: newV,
      upperBound: bound,
      pruned: false,
      isBest: false,
      x,
      y
    };
    treeNodes.push(newNode);

    pushEvent(
      'EXPLORE_NODE',
      nodeId,
      `Ramificación: ${decision === 'include' ? `Incluir ${it.id}` : `Excluir ${it.id}`}. Peso = ${newW}/${capacity}, Valor = ${newV}, Cota UB = ${bound}.`,
      `Branch: ${decision === 'include' ? `Include ${it.id}` : `Exclude ${it.id}`}. Weight = ${newW}/${capacity}, Value = ${newV}, UB = ${bound}.`
    );

    // Prune 1: Capacity exceeded
    if (newW > capacity) {
      newNode.pruned = true;
      newNode.pruneReason = 'capacity';
      prunedCount++;
      pushEvent(
        'PRUNE_CAPACITY',
        nodeId,
        `Poda por infactibilidad: Peso ${newW} excede la capacidad máxima ${capacity}. Rama podada.`,
        `Infeasibility pruning: Weight ${newW} exceeds capacity ${capacity}. Branch pruned.`
      );
      return;
    }

    // Update incumbent if valid and higher
    if (newV > incumbentBest) {
      incumbentBest = newV;
      // Mark old best as false
      treeNodes.forEach((n) => (n.isBest = false));
      newNode.isBest = true;
      pushEvent(
        'UPDATE_INCUMBENT',
        nodeId,
        `¡Nuevo óptimo incumbente hallado! Mejor valor alcanzado = ${incumbentBest}. Toda rama futura con UB ≤ ${incumbentBest} será podada.`,
        `New incumbent best found! Best value reached = ${incumbentBest}. Future branches with UB ≤ ${incumbentBest} pruned.`
      );
    }

    // Prune 2: Bound pruning
    if (bound <= incumbentBest && itemIdx + 1 < n) {
      newNode.pruned = true;
      newNode.pruneReason = 'bound';
      prunedCount++;
      pushEvent(
        'PRUNE_BOUND',
        nodeId,
        `Poda por cota superior (Branch & Bound): Cota UB = ${bound} ≤ Mejor valor incumbente (${incumbentBest}). Ninguna hoja de esta rama superará el óptimo conocido.`,
        `Bound pruning: UB = ${bound} ≤ Incumbent best (${incumbentBest}). Subtree cannot improve known optimum.`
      );
      return;
    }

    if (itemIdx + 1 < n) {
      const offsetX = Math.max(20, 110 / Math.pow(1.6, itemIdx));
      branch(nodeId, itemIdx + 1, newW, newV, 'include', x - offsetX, y + 60);
      branch(nodeId, itemIdx + 1, newW, newV, 'exclude', x + offsetX, y + 60);
    }
  }

  // Launch initial branches from root
  branch('root', 0, 0, 0, 'include', 140, 90);
  branch('root', 0, 0, 0, 'exclude', 360, 90);

  pushEvent(
    'COMPLETE',
    null,
    `Búsqueda Branch & Bound finalizada. Valor óptimo comprobado = ${incumbentBest}. Se podaron ${prunedCount} subárboles sin explorarlos exhaustivamente.`,
    `Branch & Bound search completed. Proven optimal value = ${incumbentBest}. Pruned ${prunedCount} subtrees without exhaustive exploration.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
