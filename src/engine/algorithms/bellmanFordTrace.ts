import { TraceTimeline, TraceEvent } from '../../types';

export interface BellmanFordNode {
  id: string;
  x: number;
  y: number;
}

export interface BellmanFordEdge {
  u: string;
  v: string;
  weight: number;
}

export interface BellmanFordStepData {
  nodes: BellmanFordNode[];
  edges: BellmanFordEdge[];
  source: string;
  iteration: number; // 0..|V|-1
  table: Array<Record<string, number>>; // table[i][v] = min dist with <= i edges
  currentEdge: BellmanFordEdge | null;
  updatedNode: string | null;
  hasNegativeCycle: boolean;
  action: 'INIT' | 'START_ITERATION' | 'EVALUATE_EDGE' | 'UPDATE_DP_CELL' | 'CYCLE_CHECK' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_BELLMAN_FORD_GRAPH: { nodes: BellmanFordNode[]; edges: BellmanFordEdge[]; source: string } = {
  source: 'S',
  nodes: [
    { id: 'S', x: 60, y: 140 },
    { id: 'A', x: 190, y: 60 },
    { id: 'B', x: 190, y: 220 },
    { id: 'C', x: 330, y: 60 },
    { id: 'D', x: 330, y: 220 },
    { id: 'T', x: 450, y: 140 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 4 },
    { u: 'S', v: 'B', weight: 2 },
    { u: 'B', v: 'A', weight: 1 },
    { u: 'A', v: 'C', weight: 2 },
    { u: 'B', v: 'D', weight: 4 },
    { u: 'C', v: 'D', weight: -3 }, // Negative weight edge
    { u: 'C', v: 'T', weight: 3 },
    { u: 'D', v: 'T', weight: 2 }
  ]
};

export function generateBellmanFordTrace(
  graph = DEFAULT_BELLMAN_FORD_GRAPH
): TraceTimeline<BellmanFordStepData> {
  const events: TraceEvent<BellmanFordStepData>[] = [];
  const { nodes, edges, source } = graph;

  const numNodes = nodes.length;
  const table: Array<Record<string, number>> = [];

  // Row 0
  const row0: Record<string, number> = {};
  for (const n of nodes) row0[n.id] = Infinity;
  row0[source] = 0;
  table.push(row0);

  let eventCounter = 0;

  function pushEvent(
    action: BellmanFordStepData['action'],
    iter: number,
    edge: BellmanFordEdge | null,
    updatedNode: string | null,
    hasNegCycle: boolean,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        nodes,
        edges,
        source,
        iteration: iter,
        table: table.map((r) => ({ ...r })),
        currentEdge: edge,
        updatedNode,
        hasNegativeCycle: hasNegCycle,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  pushEvent(
    'INIT',
    0,
    null,
    null,
    false,
    `Inicialización: Tabla DP M[0, v]. M[0, ${source}] = 0, resto de vértices = ∞.`,
    `Initialization: DP table M[0, v]. M[0, ${source}] = 0, other vertices = ∞.`
  );

  for (let i = 1; i < numNodes; i++) {
    const prevRow = table[i - 1];
    const currentRow: Record<string, number> = { ...prevRow };
    table.push(currentRow);

    pushEvent(
      'START_ITERATION',
      i,
      null,
      null,
      false,
      `Iteración i=${i}: Calculando caminos con a lo sumo ${i} aristas mediante la recurrencia M[i, v] = min(M[i-1, v], min_u { M[i-1, u] + c_uv }).`,
      `Iteration i=${i}: Computing paths with at most ${i} edges using DP recurrence.`
    );

    let changedInIteration = false;

    for (const edge of edges) {
      const u = edge.u;
      const v = edge.v;
      const weight = edge.weight;

      if (prevRow[u] !== Infinity) {
        const candidateDist = prevRow[u] + weight;

        pushEvent(
          'EVALUATE_EDGE',
          i,
          edge,
          null,
          false,
          `Evaluando arista (${u} → ${v}, peso ${weight}): M[${i - 1}, ${u}] + (${weight}) = ${candidateDist} vs M[${i}, ${v}] = ${currentRow[v] === Infinity ? '∞' : currentRow[v]}.`,
          `Evaluating edge (${u} → ${v}, weight ${weight}): M[${i - 1}, ${u}] + (${weight}) = ${candidateDist} vs M[${i}, ${v}] = ${currentRow[v] === Infinity ? '∞' : currentRow[v]}.`
        );

        if (candidateDist < currentRow[v]) {
          currentRow[v] = candidateDist;
          changedInIteration = true;

          pushEvent(
            'UPDATE_DP_CELL',
            i,
            edge,
            v,
            false,
            `¡Actualización en celda M[${i}, ${v}]! Se reduce la distancia a ${v} a ${candidateDist} usando la arista (${u} → ${v}).`,
            `Update at cell M[${i}, ${v}]! Distance to ${v} reduced to ${candidateDist} via edge (${u} → ${v}).`
          );
        }
      }
    }

    if (!changedInIteration) {
      pushEvent(
        'COMPLETE',
        i,
        null,
        null,
        false,
        `Convergencia anticipada en i=${i}: Ninguna distancia disminuyó. El algoritmo alcanzó el estado estacionario óptimo sin ciclos negativos.`,
        `Early convergence at i=${i}: No distances decreased. Algorithm reached optimal steady state without negative cycles.`
      );
      break;
    }
  }

  return {
    events,
    totalSteps: events.length
  };
}
