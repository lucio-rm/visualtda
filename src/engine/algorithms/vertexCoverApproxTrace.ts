import { TraceEvent, TraceTimeline } from '../../types/trace';
import { LocalizedString } from '../../types/category';

export interface ApproxTraceState {
  vertices: string[];
  edges: [string, string][];
  matching: [string, string][];
  cover: string[];
  activeEdge?: [string, string];
  status: 'inspecting' | 'added_to_matching' | 'skipped_covered' | 'finished';
  coveredEdges: [string, string][];
  lowerBound: number; // |M|
  coverSize: number;  // |C| = 2 * |M|
  explanation: LocalizedString;
}

export const DEFAULT_APPROX_GRAPH = {
  vertices: ['A', 'B', 'C', 'D', 'E', 'F'],
  edges: [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'D'],
    ['C', 'D'],
    ['D', 'E'],
    ['D', 'F'],
    ['E', 'F']
  ] as [string, string][]
};

export const DEFAULT_APPROX_LAYOUT: Record<string, { x: number; y: number }> = {
  A: { x: 90, y: 70 },
  B: { x: 260, y: 70 },
  C: { x: 90, y: 220 },
  D: { x: 260, y: 220 },
  E: { x: 430, y: 70 },
  F: { x: 430, y: 220 }
};

export function generateVertexCoverApproxTrace(
  graph = DEFAULT_APPROX_GRAPH
): TraceTimeline<ApproxTraceState> {
  const { vertices, edges } = graph;
  const events: TraceEvent<ApproxTraceState>[] = [];
  let step = 0;

  const currentCover = new Set<string>();
  const currentMatching: [string, string][] = [];
  const coveredEdges: [string, string][] = [];

  // Step 0: Inicialización
  events.push({
    step: ++step,
    type: 'init',
    message: {
      es: `Grafo inicial: |V|=${vertices.length}, |E|=${edges.length}. Inicializamos cobertura C=∅ y matching M=∅.`,
      en: `Initial graph: |V|=${vertices.length}, |E|=${edges.length}. Initialized cover C=∅ and matching M=∅.`
    },
    data: {
      vertices,
      edges,
      matching: [],
      cover: [],
      status: 'inspecting',
      coveredEdges: [],
      lowerBound: 0,
      coverSize: 0,
      explanation: {
        es: 'Inicia el algoritmo de matching maximal. Buscaremos aristas disjuntas no cubiertas.',
        en: 'Maximal matching algorithm starts. We will search for uncovered disjoint edges.'
      }
    }
  });

  for (const [u, v] of edges) {
    const isCovered = currentCover.has(u) || currentCover.has(v);

    if (!isCovered) {
      // Arista no cubierta: entra al matching M y ambos extremos a C
      currentMatching.push([u, v]);
      currentCover.add(u);
      currentCover.add(v);

      // Actualizar aristas cubiertas hasta ahora
      const newlyCovered = edges.filter(
        (e) => (currentCover.has(e[0]) || currentCover.has(e[1])) && !coveredEdges.some((ce) => ce[0] === e[0] && ce[1] === e[1])
      );
      coveredEdges.push(...newlyCovered);

      events.push({
        step: ++step,
        type: 'match_edge',
        message: {
          es: `Arista (${u}, ${v}) no cubierta: Agregada a M. Se agregan ambos extremos {${u}, ${v}} a C.`,
          en: `Uncovered edge (${u}, ${v}): Added to M. Added both endpoints {${u}, ${v}} to C.`
        },
        data: {
          vertices,
          edges,
          matching: [...currentMatching],
          cover: Array.from(currentCover),
          activeEdge: [u, v],
          status: 'added_to_matching',
          coveredEdges: [...coveredEdges],
          lowerBound: currentMatching.length,
          coverSize: currentCover.size,
          explanation: {
            es: `Arista (${u}, ${v}) es disjunta con las anteriores. Cota inferior actualizada: |C*| ≥ ${currentMatching.length}. Tamaño de cobertura: |C| = ${currentCover.size}.`,
            en: `Edge (${u}, ${v}) is vertex-disjoint. Lower bound updated: |C*| ≥ ${currentMatching.length}. Cover size: |C| = ${currentCover.size}.`
          }
        }
      });
    } else {
      // Arista ya cubierta
      const coveringNode = currentCover.has(u) ? u : v;
      events.push({
        step: ++step,
        type: 'skip_edge',
        message: {
          es: `Arista (${u}, ${v}) ya está cubierta por '${coveringNode}' ∈ C. Omitida para preservar matching disjunto.`,
          en: `Edge (${u}, ${v}) is already covered by '${coveringNode}' ∈ C. Skipped to preserve disjoint matching.`
        },
        data: {
          vertices,
          edges,
          matching: [...currentMatching],
          cover: Array.from(currentCover),
          activeEdge: [u, v],
          status: 'skipped_covered',
          coveredEdges: [...coveredEdges],
          lowerBound: currentMatching.length,
          coverSize: currentCover.size,
          explanation: {
            es: `No podemos agregar (${u}, ${v}) a M porque compartiría vértice con otra arista del matching, invalidando la cota inferior.`,
            en: `Cannot add (${u}, ${v}) to M because it would share a vertex with another matched edge, breaking the lower bound.`
          }
        }
      });
    }
  }

  // Step final
  events.push({
    step: ++step,
    type: 'finished',
    message: {
      es: `✓ Cobertura completa: 100% aristas cubiertas con |C| = ${currentCover.size}. Garantía: |C| ≤ 2·|C*| porque |C*| ≥ ${currentMatching.length}.`,
      en: `✓ Complete cover: 100% edges covered with |C| = ${currentCover.size}. Bound: |C| ≤ 2·|C*| because |C*| ≥ ${currentMatching.length}.`
    },
    data: {
      vertices,
      edges,
      matching: [...currentMatching],
      cover: Array.from(currentCover),
      status: 'finished',
      coveredEdges: [...edges],
      lowerBound: currentMatching.length,
      coverSize: currentCover.size,
      explanation: {
        es: `El ratio de aproximación es ρ = |C| / |M| = ${currentCover.size} / ${currentMatching.length} = 2.0. Tiempo de ejecución lineal O(|V| + |E|).`,
        en: `Approximation ratio is ρ = |C| / |M| = ${currentCover.size} / ${currentMatching.length} = 2.0. Linear runtime O(|V| + |E|).`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
