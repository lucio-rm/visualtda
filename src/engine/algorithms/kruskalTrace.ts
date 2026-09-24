import { TraceTimeline, TraceEvent } from '../../types';

export interface KruskalNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface KruskalEdge {
  id: string;
  u: string;
  v: string;
  weight: number;
}

export interface KruskalStepData {
  nodes: KruskalNode[];
  edges: KruskalEdge[];
  sortedEdges: KruskalEdge[];
  currentEdgeIndex: number;
  mstEdges: string[];
  rejectedEdges: string[];
  components: Record<string, string>; // node id -> component root
  totalMstWeight: number;
  action: 'INIT' | 'SORT_EDGES' | 'CONSIDER_EDGE' | 'ACCEPT_EDGE' | 'REJECT_CYCLE' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_KRUSKAL_GRAPH: { nodes: KruskalNode[]; edges: KruskalEdge[] } = {
  nodes: [
    { id: 'A', label: 'A', x: 80, y: 70 },
    { id: 'B', label: 'B', x: 240, y: 50 },
    { id: 'C', label: 'C', x: 400, y: 70 },
    { id: 'D', label: 'D', x: 80, y: 230 },
    { id: 'E', label: 'E', x: 240, y: 250 },
    { id: 'F', label: 'F', x: 400, y: 230 }
  ],
  edges: [
    { id: 'e1', u: 'A', v: 'B', weight: 4 },
    { id: 'e2', u: 'A', v: 'D', weight: 2 },
    { id: 'e3', u: 'B', v: 'D', weight: 1 },
    { id: 'e4', u: 'B', v: 'C', weight: 3 },
    { id: 'e5', u: 'B', v: 'E', weight: 3 },
    { id: 'e6', u: 'C', v: 'F', weight: 2 },
    { id: 'e7', u: 'D', v: 'E', weight: 5 },
    { id: 'e8', u: 'E', v: 'F', weight: 4 },
    { id: 'e9', u: 'C', v: 'E', weight: 1 }
  ]
};

export function generateKruskalTrace(
  graph = DEFAULT_KRUSKAL_GRAPH
): TraceTimeline<KruskalStepData> {
  const events: TraceEvent<KruskalStepData>[] = [];
  const { nodes, edges } = graph;

  const parent: Record<string, string> = {};
  for (const node of nodes) parent[node.id] = node.id;

  function find(i: string): string {
    if (parent[i] === i) return i;
    parent[i] = find(parent[i]);
    return parent[i];
  }

  function union(i: string, j: string) {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) {
      parent[rootI] = rootJ;
    }
  }

  function getComponentMap(): Record<string, string> {
    const m: Record<string, string> = {};
    for (const node of nodes) {
      m[node.id] = find(node.id);
    }
    return m;
  }

  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
  const mstEdges: string[] = [];
  const rejectedEdges: string[] = [];
  let totalMstWeight = 0;
  let eventCounter = 0;

  function pushEvent(
    action: KruskalStepData['action'],
    edgeIdx: number,
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
        sortedEdges,
        currentEdgeIndex: edgeIdx,
        mstEdges: [...mstEdges],
        rejectedEdges: [...rejectedEdges],
        components: getComponentMap(),
        totalMstWeight,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  pushEvent(
    'INIT',
    -1,
    `Grafo con ${nodes.length} vértices y ${edges.length} aristas inicializado. Cada vértice inicia en su propio conjunto disjunto.`,
    `Graph with ${nodes.length} vertices and ${edges.length} edges initialized. Each vertex begins in its own disjoint set.`
  );

  pushEvent(
    'SORT_EDGES',
    0,
    `Greedy: Ordenamiento ascendente de las ${edges.length} aristas por peso w(e) en tiempo O(E log E).`,
    `Greedy: Ascending sort of all ${edges.length} edges by weight w(e) in O(E log E) time.`
  );

  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    const rootU = find(edge.u);
    const rootV = find(edge.v);

    pushEvent(
      'CONSIDER_EDGE',
      i,
      `Evaluando arista más liviana disponible (${edge.u} — ${edge.v}, peso ${edge.weight}). Componente(${edge.u})=${rootU}, Componente(${edge.v})=${rootV}.`,
      `Evaluating lightest available edge (${edge.u} — ${edge.v}, weight ${edge.weight}). Component(${edge.u})=${rootU}, Component(${edge.v})=${rootV}.`
    );

    if (rootU !== rootV) {
      union(rootU, rootV);
      mstEdges.push(edge.id);
      totalMstWeight += edge.weight;

      pushEvent(
        'ACCEPT_EDGE',
        i,
        `¡Aceptada en el AGM! Los vértices pertenecen a componentes distintas; se aplica la Propiedad de Corte. Uniendo componentes. Peso acumulado = ${totalMstWeight}.`,
        `Accepted into MST! Vertices belong to different components; Cut Property applies. Union executed. Total weight = ${totalMstWeight}.`
      );

      if (mstEdges.length === nodes.length - 1) {
        pushEvent(
          'COMPLETE',
          i,
          `¡Árbol Generador Mínimo completado! Se conectaron todos los ${nodes.length} vértices con exactamente ${mstEdges.length} aristas y costo total mínimo ${totalMstWeight}.`,
          `Minimum Spanning Tree completed! Connected all ${nodes.length} vertices with ${mstEdges.length} edges at minimal total cost ${totalMstWeight}.`
        );
        break;
      }
    } else {
      rejectedEdges.push(edge.id);
      pushEvent(
        'REJECT_CYCLE',
        i,
        `Rechazada: ${edge.u} y ${edge.v} ya están conectados en la misma componente conexa. Agregarla formaría un ciclo simple (Propiedad de Ciclo).`,
        `Rejected: ${edge.u} and ${edge.v} already connected in same component. Adding it would form a cycle (Cycle Property).`
      );
    }
  }

  return {
    events,
    totalSteps: events.length
  };
}
