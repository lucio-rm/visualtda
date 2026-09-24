import { TraceTimeline, TraceEvent } from '../../types';

export interface TspTreeNode {
  id: string;
  parentId: string | null;
  city: number;
  visited: number[];
  cost: number;
  lowerBound: number;
  pruned: boolean;
  isBest: boolean;
  x: number;
  y: number;
}

export interface TspCity {
  id: number;
  name: string;
  x: number;
  y: number;
}

export interface TspBBStepData {
  cities: TspCity[];
  distMatrix: number[][];
  treeNodes: TspTreeNode[];
  currentNodeId: string | null;
  currentTour: number[];
  incumbentBest: number;
  prunedCount: number;
  exploredCount: number;
  action: 'INIT' | 'EXPLORE_NODE' | 'PRUNE_BOUND' | 'UPDATE_INCUMBENT' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_TSP_CITIES: TspCity[] = [
  { id: 0, name: 'Buenos Aires', x: 80, y: 70 },
  { id: 1, name: 'Córdoba', x: 230, y: 50 },
  { id: 2, name: 'Rosario', x: 380, y: 80 },
  { id: 3, name: 'Mendoza', x: 120, y: 190 },
  { id: 4, name: 'La Plata', x: 340, y: 190 }
];

export const DEFAULT_TSP_MATRIX: number[][] = [
  [0, 14, 4, 10, 20],
  [14, 0, 7, 8, 7],
  [4, 7, 0, 7, 16],
  [10, 8, 7, 0, 2],
  [20, 7, 16, 2, 0]
];

export function generateTspBBTrace(
  cities = DEFAULT_TSP_CITIES,
  dist = DEFAULT_TSP_MATRIX
): TraceTimeline<TspBBStepData> {
  const events: TraceEvent<TspBBStepData>[] = [];
  const n = cities.length;
  const treeNodes: TspTreeNode[] = [];

  let eventCounter = 0;
  let incumbentBest = Infinity;
  let prunedCount = 0;
  let exploredCount = 0;
  let currentTour: number[] = [0];

  function pushEvent(
    action: TspBBStepData['action'],
    nodeId: string | null,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        cities,
        distMatrix: dist,
        treeNodes: treeNodes.map((node) => ({ ...node, visited: [...node.visited] })),
        currentNodeId: nodeId,
        currentTour: [...currentTour],
        incumbentBest,
        prunedCount,
        exploredCount,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  function calculateLB(curr: number, visited: Set<number>, currentCost: number): number {
    const unvisited: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) unvisited.push(i);
    }
    if (unvisited.length === 0) {
      return currentCost + dist[curr][0];
    }
    let minOut = Infinity;
    for (const r of unvisited) {
      if (dist[curr][r] < minOut) minOut = dist[curr][r];
    }
    let minReturn = Infinity;
    for (const r of unvisited) {
      if (dist[r][0] < minReturn) minReturn = dist[r][0];
    }
    return currentCost + minOut + minReturn;
  }

  // 1. Root
  const rootLB = calculateLB(0, new Set([0]), 0);
  const rootNode: TspTreeNode = {
    id: 'node-root',
    parentId: null,
    city: 0,
    visited: [0],
    cost: 0,
    lowerBound: rootLB,
    pruned: false,
    isBest: false,
    x: 250,
    y: 30
  };
  treeNodes.push(rootNode);

  pushEvent(
    'INIT',
    rootNode.id,
    `Raíz del árbol Branch & Bound: Iniciando en Ciudad 0 (${cities[0].name}). Cota inferior inicial LB = ${rootLB}. Incumbent inicial = ∞.`,
    `Root of Branch & Bound tree: Starting at City 0 (${cities[0].name}). Initial LB = ${rootLB}. Incumbent = ∞.`
  );

  let nodeUid = 1;

  function explore(
    curr: number,
    visited: Set<number>,
    currentCost: number,
    parentId: string,
    depth: number
  ) {
    if (visited.size === n) {
      const total = currentCost + dist[curr][0];
      exploredCount++;
      currentTour = [...Array.from(visited), 0];

      if (total < incumbentBest) {
        incumbentBest = total;
        const leafNode: TspTreeNode = {
          id: `node-${nodeUid++}`,
          parentId,
          city: 0,
          visited: [...currentTour],
          cost: total,
          lowerBound: total,
          pruned: false,
          isBest: true,
          x: 40 + (exploredCount % 10) * 45,
          y: 40 + depth * 35
        };
        treeNodes.push(leafNode);

        pushEvent(
          'UPDATE_INCUMBENT',
          leafNode.id,
          `¡Nuevo mejor tour (Incumbent) hallado! Tour: [${currentTour.join('→')}] con costo = ${total}. Todas las ramas futuras con LB ≥ ${total} serán podadas.`,
          `New best tour (Incumbent) found! Tour: [${currentTour.join('→')}] cost = ${total}. Future branches with LB ≥ ${total} pruned.`
        );
      }
      return;
    }

    const lb = calculateLB(curr, visited, currentCost);
    if (lb >= incumbentBest) {
      prunedCount++;
      const prunedNode: TspTreeNode = {
        id: `node-${nodeUid++}`,
        parentId,
        city: curr,
        visited: Array.from(visited),
        cost: currentCost,
        lowerBound: lb,
        pruned: true,
        isBest: false,
        x: 40 + (prunedCount % 10) * 45,
        y: 40 + depth * 35
      };
      treeNodes.push(prunedNode);

      pushEvent(
        'PRUNE_BOUND',
        prunedNode.id,
        `Poda por cota: En ciudad ${curr}, LB = ${lb} ≥ Incumbent (${incumbentBest}). Se descarta este subárbol sin explorarlo.`,
        `Bound pruning: At city ${curr}, LB = ${lb} ≥ Incumbent (${incumbentBest}). Pruned without exploration.`
      );
      return;
    }

    const unvisited: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) unvisited.push(i);
    }
    unvisited.sort((a, b) => dist[curr][a] - dist[curr][b]);

    for (const v of unvisited) {
      visited.add(v);
      exploredCount++;

      const childNode: TspTreeNode = {
        id: `node-${nodeUid++}`,
        parentId,
        city: v,
        visited: Array.from(visited),
        cost: currentCost + dist[curr][v],
        lowerBound: calculateLB(v, visited, currentCost + dist[curr][v]),
        pruned: false,
        isBest: false,
        x: 30 + ((exploredCount * 37) % 440),
        y: 40 + depth * 35
      };
      treeNodes.push(childNode);

      pushEvent(
        'EXPLORE_NODE',
        childNode.id,
        `Explorando viaje a Ciudad ${v} (${cities[v].name}): Costo acumulado = ${childNode.cost}, Cota inferior LB = ${childNode.lowerBound}.`,
        `Exploring travel to City ${v}: Cumulative cost = ${childNode.cost}, LB = ${childNode.lowerBound}.`
      );

      explore(v, visited, currentCost + dist[curr][v], childNode.id, depth + 1);
      visited.delete(v);
    }
  }

  explore(0, new Set([0]), 0, rootNode.id, 1);

  pushEvent(
    'COMPLETE',
    null,
    `Búsqueda Branch & Bound finalizada. Costo óptimo mínimo = ${incumbentBest}. Nodos explorados: ${exploredCount}, Nodos podados: ${prunedCount}.`,
    `Branch & Bound search complete. Optimal minimum cost = ${incumbentBest}. Explored: ${exploredCount}, Pruned: ${prunedCount}.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
