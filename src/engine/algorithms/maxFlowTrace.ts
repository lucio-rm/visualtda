import { TraceEvent, TraceTimeline } from '../../types/trace';
import { FlowEdge, FlowNetworkInput } from './maxFlowValidator';

export interface GraphNodePosition {
  id: string;
  x: number;
  y: number;
  label: string;
  isSource?: boolean;
  isSink?: boolean;
}

export interface EdgeTraceState extends FlowEdge {
  flow: number;
  residualForward: number;
  residualBackward: number;
  isInAugmentingPath?: boolean;
  isMinCutCrossing?: boolean;
}

export interface MaxFlowStepData {
  nodes: GraphNodePosition[];
  edges: EdgeTraceState[];
  source: string;
  sink: string;
  currentFlow: number;
  augmentingPath?: string[];
  bottleneckCapacity?: number;
  phase: 'init' | 'bfs_search' | 'path_found' | 'augment_flow' | 'no_more_paths' | 'min_cut' | 'complete';
  minCutS?: string[];
  minCutT?: string[];
  minCutCapacity?: number;
}

export const DEFAULT_FLOW_NETWORK: FlowNetworkInput = {
  vertices: ['s', 'u', 'v', 't'],
  edges: [
    { u: 's', v: 'u', capacity: 10 },
    { u: 's', v: 'v', capacity: 10 },
    { u: 'u', v: 'v', capacity: 2 },
    { u: 'u', v: 't', capacity: 10 },
    { u: 'v', v: 't', capacity: 10 }
  ],
  source: 's',
  sink: 't'
};

export const DEFAULT_NODE_POSITIONS: GraphNodePosition[] = [
  { id: 's', label: 'Fuente (s)', x: 90, y: 150, isSource: true },
  { id: 'u', label: 'u', x: 250, y: 70 },
  { id: 'v', label: 'v', x: 250, y: 230 },
  { id: 't', label: 'Sumidero (t)', x: 410, y: 150, isSink: true }
];

export function generateMaxFlowTrace(
  network: FlowNetworkInput = DEFAULT_FLOW_NETWORK,
  nodePositions: GraphNodePosition[] = DEFAULT_NODE_POSITIONS
): TraceTimeline<MaxFlowStepData> {
  const events: TraceEvent<MaxFlowStepData>[] = [];
  const { vertices, edges, source, sink } = network;

  // Track edge flows
  const flowMap = new Map<string, number>();
  for (const e of edges) {
    flowMap.set(`${e.u}->${e.v}`, 0);
  }

  // Residual graph capacities
  const residual: Record<string, Record<string, number>> = {};
  for (const v of vertices) residual[v] = {};
  for (const e of edges) {
    residual[e.u][e.v] = e.capacity;
    if (residual[e.v][e.u] === undefined) residual[e.v][e.u] = 0;
  }

  const buildEdgesState = (
    path: string[] = [],
    minCutS: string[] = []
  ): EdgeTraceState[] => {
    const pathEdges = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      pathEdges.add(`${path[i]}->${path[i + 1]}`);
    }

    const sSet = new Set(minCutS);

    return edges.map((e) => {
      const key = `${e.u}->${e.v}`;
      const f = flowMap.get(key) || 0;
      return {
        ...e,
        flow: f,
        residualForward: residual[e.u][e.v],
        residualBackward: residual[e.v][e.u],
        isInAugmentingPath: pathEdges.has(key),
        isMinCutCrossing: sSet.size > 0 && sSet.has(e.u) && !sSet.has(e.v)
      };
    });
  };

  let stepIndex = 0;
  let totalFlow = 0;

  // 1. Initial State
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Red de capacidades inicializada. Fuente: "${source}", Sumidero: "${sink}". Flujo inicial: 0.`,
      en: `Flow network initialized. Source: "${source}", Sink: "${sink}". Initial flow: 0.`
    },
    data: {
      nodes: nodePositions,
      edges: buildEdgesState(),
      source,
      sink,
      currentFlow: 0,
      phase: 'init'
    }
  });

  // Iterative Edmonds-Karp with BFS
  let iteration = 1;
  while (true) {
    // Event: BFS search starting
    events.push({
      step: stepIndex++,
      type: 'bfs_search',
      message: {
        es: `Iteración ${iteration}: Ejecutando BFS en la red residual para encontrar el camino de aumento más corto.`,
        en: `Iteration ${iteration}: Running BFS in residual graph to find shortest augmenting path.`
      },
      data: {
        nodes: nodePositions,
        edges: buildEdgesState(),
        source,
        sink,
        currentFlow: totalFlow,
        phase: 'bfs_search'
      }
    });

    const parent: Record<string, string> = {};
    const queue: string[] = [source];
    const visited = new Set<string>([source]);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === sink) break;

      for (const [neighbor, cap] of Object.entries(residual[curr])) {
        if (!visited.has(neighbor) && cap > 0) {
          visited.add(neighbor);
          parent[neighbor] = curr;
          queue.push(neighbor);
        }
      }
    }

    if (!parent[sink]) {
      // No more augmenting paths!
      events.push({
        step: stepIndex++,
        type: 'no_more_paths',
        message: {
          es: `No existen más caminos de aumento en la red residual desde "${source}" hacia "${sink}". Se alcanzó el flujo máximo.`,
          en: `No more augmenting paths in residual network from "${source}" to "${sink}". Maximum flow reached.`
        },
        data: {
          nodes: nodePositions,
          edges: buildEdgesState(),
          source,
          sink,
          currentFlow: totalFlow,
          phase: 'no_more_paths'
        }
      });
      break;
    }

    // Reconstruct path
    const path: string[] = [];
    let curr = sink;
    let bottleneck = Infinity;

    while (curr !== source) {
      const p = parent[curr];
      path.push(curr);
      bottleneck = Math.min(bottleneck, residual[p][curr]);
      curr = p;
    }
    path.push(source);
    path.reverse();

    // Event: Path found
    events.push({
      step: stepIndex++,
      type: 'path_found',
      message: {
        es: `Camino de aumento encontrado: ${path.join(' → ')}. Capacidad de cuello de botella: Δ = ${bottleneck}.`,
        en: `Augmenting path found: ${path.join(' → ')}. Bottleneck capacity: Δ = ${bottleneck}.`
      },
      data: {
        nodes: nodePositions,
        edges: buildEdgesState(path),
        source,
        sink,
        currentFlow: totalFlow,
        augmentingPath: path,
        bottleneckCapacity: bottleneck,
        phase: 'path_found'
      }
    });

    // Augment flow
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];

      residual[u][v] -= bottleneck;
      residual[v][u] += bottleneck;

      // Update forward flow if original edge exists
      const fKey = `${u}->${v}`;
      if (flowMap.has(fKey)) {
        flowMap.set(fKey, (flowMap.get(fKey) || 0) + bottleneck);
      } else {
        // Backward cancellation on original edge v->u
        const revKey = `${v}->${u}`;
        flowMap.set(revKey, (flowMap.get(revKey) || 0) - bottleneck);
      }
    }

    totalFlow += bottleneck;

    // Event: Augment flow
    events.push({
      step: stepIndex++,
      type: 'augment_flow',
      message: {
        es: `Flujo aumentado en +${bottleneck}. Flujo total acumulado: ${totalFlow}. Red residual actualizada.`,
        en: `Flow augmented by +${bottleneck}. Total accumulated flow: ${totalFlow}. Residual network updated.`
      },
      data: {
        nodes: nodePositions,
        edges: buildEdgesState(path),
        source,
        sink,
        currentFlow: totalFlow,
        augmentingPath: path,
        bottleneckCapacity: bottleneck,
        phase: 'augment_flow'
      }
    });

    iteration++;
  }

  // Min-Cut Computation
  const reachableFromS: string[] = [];
  const cutQueue: string[] = [source];
  const cutVisited = new Set<string>([source]);

  while (cutQueue.length > 0) {
    const curr = cutQueue.shift()!;
    reachableFromS.push(curr);

    for (const [neighbor, cap] of Object.entries(residual[curr])) {
      if (!cutVisited.has(neighbor) && cap > 0) {
        cutVisited.add(neighbor);
        cutQueue.push(neighbor);
      }
    }
  }

  const cutS = reachableFromS;
  const cutT = vertices.filter((v) => !cutVisited.has(v));

  let cutCapacity = 0;
  for (const e of edges) {
    if (cutVisited.has(e.u) && !cutVisited.has(e.v)) {
      cutCapacity += e.capacity;
    }
  }

  // Event: Min Cut
  events.push({
    step: stepIndex++,
    type: 'min_cut',
    message: {
      es: `Corte Mínimo (S, T): S = {${cutS.join(', ')}}, T = {${cutT.join(', ')}}. Capacidad del corte = ${cutCapacity}. Teorema: Flujo Máximo (${totalFlow}) == Capacidad de Corte Mínimo (${cutCapacity}).`,
      en: `Minimum Cut (S, T): S = {${cutS.join(', ')}}, T = {${cutT.join(', ')}}. Cut capacity = ${cutCapacity}. Max-Flow Min-Cut Theorem confirmed!`
    },
    data: {
      nodes: nodePositions,
      edges: buildEdgesState([], cutS),
      source,
      sink,
      currentFlow: totalFlow,
      phase: 'min_cut',
      minCutS: cutS,
      minCutT: cutT,
      minCutCapacity: cutCapacity
    }
  });

  // Completion Event
  events.push({
    step: stepIndex,
    type: 'complete',
    message: {
      es: `Finalizado: Flujo máximo ${totalFlow} verificado con el corte mínimo (Dualidad Fuerte).`,
      en: `Completed: Maximum flow ${totalFlow} verified by minimum cut (Strong Duality).`
    },
    data: {
      nodes: nodePositions,
      edges: buildEdgesState([], cutS),
      source,
      sink,
      currentFlow: totalFlow,
      phase: 'complete',
      minCutS: cutS,
      minCutT: cutT,
      minCutCapacity: cutCapacity
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
