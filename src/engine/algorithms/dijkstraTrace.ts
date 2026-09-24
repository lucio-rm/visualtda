import { TraceTimeline, TraceEvent } from '../../types';

export interface DijkstraNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface DijkstraEdge {
  u: string;
  v: string;
  weight: number;
}

export interface DijkstraStepData {
  nodes: DijkstraNode[];
  edges: DijkstraEdge[];
  source: string;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  visited: string[]; // settled nodes in S
  currentU: string | null;
  currentV: string | null;
  relaxedEdge: { u: string; v: string; weight: number } | null;
  priorityQueue: Array<{ node: string; dist: number }>;
  action: 'INIT' | 'EXTRACT_MIN' | 'RELAX_EDGE' | 'UPDATE_DIST' | 'SETTLE_NODE' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_DIJKSTRA_GRAPH: { nodes: DijkstraNode[]; edges: DijkstraEdge[]; source: string } = {
  source: 'S',
  nodes: [
    { id: 'S', label: 'S (Origen)', x: 60, y: 150 },
    { id: 'A', label: 'A', x: 190, y: 70 },
    { id: 'B', label: 'B', x: 190, y: 230 },
    { id: 'C', label: 'C', x: 330, y: 70 },
    { id: 'D', label: 'D', x: 330, y: 230 },
    { id: 'T', label: 'T (Destino)', x: 450, y: 150 }
  ],
  edges: [
    { u: 'S', v: 'A', weight: 4 },
    { u: 'S', v: 'B', weight: 2 },
    { u: 'A', v: 'B', weight: 1 },
    { u: 'B', v: 'A', weight: 3 },
    { u: 'A', v: 'C', weight: 5 },
    { u: 'B', v: 'D', weight: 6 },
    { u: 'C', v: 'T', weight: 3 },
    { u: 'D', v: 'T', weight: 2 },
    { u: 'C', v: 'D', weight: 1 }
  ]
};

export function generateDijkstraTrace(
  graph = DEFAULT_DIJKSTRA_GRAPH
): TraceTimeline<DijkstraStepData> {
  const events: TraceEvent<DijkstraStepData>[] = [];
  const { nodes, edges, source } = graph;

  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const visited = new Set<string>();

  for (const node of nodes) {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  }
  distances[source] = 0;

  let eventCounter = 0;

  function getPQ(): Array<{ node: string; dist: number }> {
    return nodes
      .filter((n) => !visited.has(n.id) && distances[n.id] < Infinity)
      .map((n) => ({ node: n.id, dist: distances[n.id] }))
      .sort((a, b) => a.dist - b.dist);
  }

  function pushEvent(
    action: DijkstraStepData['action'],
    u: string | null,
    v: string | null,
    relaxed: { u: string; v: string; weight: number } | null,
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
        distances: { ...distances },
        predecessors: { ...predecessors },
        visited: Array.from(visited),
        currentU: u,
        currentV: v,
        relaxedEdge: relaxed,
        priorityQueue: getPQ(),
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  pushEvent(
    'INIT',
    source,
    null,
    null,
    `Inicialización: Distancia a ${source} = 0, resto = ∞. Cola de prioridad inicializada.`,
    `Initialization: Distance to ${source} = 0, rest = ∞. Priority queue initialized.`
  );

  while (visited.size < nodes.length) {
    // Extract min from unvisited
    let minNode: string | null = null;
    let minDist = Infinity;

    for (const node of nodes) {
      if (!visited.has(node.id) && distances[node.id] < minDist) {
        minDist = distances[node.id];
        minNode = node.id;
      }
    }

    if (!minNode || minDist === Infinity) break;

    const u = minNode;
    pushEvent(
      'EXTRACT_MIN',
      u,
      null,
      null,
      `Greedy: Extraer nodo ${u} con distancia mínima acumulada d[${u}] = ${distances[u]}.`,
      `Greedy: Extract node ${u} with minimal accumulated distance d[${u}] = ${distances[u]}.`
    );

    visited.add(u);
    pushEvent(
      'SETTLE_NODE',
      u,
      null,
      null,
      `Nodo ${u} fijado en el conjunto de distancias óptimas definitivas S.`,
      `Node ${u} permanently settled into optimal set S.`
    );

    // Relax outgoing edges from u
    const outEdges = edges.filter((e) => e.u === u);
    for (const edge of outEdges) {
      const v = edge.v;
      if (visited.has(v)) continue;

      const alt = distances[u] + edge.weight;
      pushEvent(
        'RELAX_EDGE',
        u,
        v,
        edge,
        `Evaluando arista (${u} → ${v}, peso ${edge.weight}): d[${u}] + ${edge.weight} = ${alt} vs d[${v}] = ${distances[v] === Infinity ? '∞' : distances[v]}.`,
        `Evaluating edge (${u} → ${v}, weight ${edge.weight}): d[${u}] + ${edge.weight} = ${alt} vs d[${v}] = ${distances[v] === Infinity ? '∞' : distances[v]}.`
      );

      if (alt < distances[v]) {
        distances[v] = alt;
        predecessors[v] = u;
        pushEvent(
          'UPDATE_DIST',
          u,
          v,
          edge,
          `¡Relajación exitosa! Se encontró camino más corto hacia ${v}: d[${v}] actualizado a ${alt} con predecesor ${u}.`,
          `Successful relaxation! Shorter path found to ${v}: d[${v}] updated to ${alt} via predecessor ${u}.`
        );
      }
    }
  }

  pushEvent(
    'COMPLETE',
    null,
    null,
    null,
    'Algoritmo de Dijkstra finalizado. Todas las distancias mínimas desde el origen fueron calculadas óptimamente.',
    "Dijkstra's algorithm completed. All minimal distances from source calculated optimally."
  );

  return {
    events,
    totalSteps: events.length
  };
}
