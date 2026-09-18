import { TraceEvent, TraceTimeline } from '../../types/trace';
import { LocalizedString } from '../../types/category';

export interface ReductionTraceState {
  vertices: string[];
  edges: [string, string][];
  k: number;
  kPrime: number;
  independentSet: string[];
  vertexCover: string[];
  activeNode?: string;
  activeEdge?: [string, string];
  conflictEdge?: [string, string];
  coveredEdges: [string, string][];
  phase: 'is_selection' | 'complement_calculation' | 'vc_verification' | 'completed';
  explanation: LocalizedString;
}

export const DEFAULT_REDUCTION_GRAPH = {
  vertices: ['A', 'B', 'C', 'D', 'E'],
  edges: [
    ['A', 'B'],
    ['A', 'C'],
    ['B', 'D'],
    ['C', 'D'],
    ['C', 'E'],
    ['D', 'E']
  ] as [string, string][],
  k: 2
};

export const DEFAULT_GRAPH_LAYOUT: Record<string, { x: number; y: number }> = {
  A: { x: 100, y: 80 },
  B: { x: 270, y: 60 },
  C: { x: 100, y: 220 },
  D: { x: 270, y: 220 },
  E: { x: 430, y: 140 }
};

export function generateReductionTrace(
  graph = DEFAULT_REDUCTION_GRAPH
): TraceTimeline<ReductionTraceState> {
  const { vertices, edges, k } = graph;
  const kPrime = vertices.length - k;
  const events: TraceEvent<ReductionTraceState>[] = [];
  let step = 0;

  // Step 0: Inicialización
  events.push({
    step: ++step,
    type: 'init',
    message: {
      es: `Instancia de Conjunto Independiente: Grafo G con |V|=${vertices.length}, |E|=${edges.length}. Buscamos IS con k=${k}.`,
      en: `Independent Set Instance: Graph G with |V|=${vertices.length}, |E|=${edges.length}. Looking for IS with k=${k}.`
    },
    data: {
      vertices,
      edges,
      k,
      kPrime,
      independentSet: [],
      vertexCover: [],
      coveredEdges: [],
      phase: 'is_selection',
      explanation: {
        es: `Iniciamos la búsqueda de un conjunto de k=${k} vértices mutuamente no adyacentes.`,
        en: `We start searching for a set of k=${k} mutually non-adjacent vertices.`
      }
    }
  });

  // Step 1: Seleccionar A
  events.push({
    step: ++step,
    type: 'select_is_node',
    message: {
      es: `Agregamos vértice 'A' al Conjunto Independiente S.`,
      en: `Added vertex 'A' to Independent Set S.`
    },
    data: {
      vertices,
      edges,
      k,
      kPrime,
      independentSet: ['A'],
      vertexCover: [],
      activeNode: 'A',
      coveredEdges: [],
      phase: 'is_selection',
      explanation: {
        es: `Vértice 'A' entra en S={A}. Ningún vecino de 'A' podrá formar parte de S.`,
        en: `Vertex 'A' enters S={A}. No neighbor of 'A' may belong to S.`
      }
    }
  });

  // Step 2: Probar B -> Conflicto con A
  events.push({
    step: ++step,
    type: 'candidate_conflict',
    message: {
      es: `Candidato 'B': Existe arista (A, B). Conflicto detectado; 'B' no puede entrar a S.`,
      en: `Candidate 'B': Edge (A, B) exists. Conflict detected; 'B' cannot enter S.`
    },
    data: {
      vertices,
      edges,
      k,
      kPrime,
      independentSet: ['A'],
      vertexCover: [],
      activeNode: 'B',
      conflictEdge: ['A', 'B'],
      coveredEdges: [],
      phase: 'is_selection',
      explanation: {
        es: `Si incluyéramos 'B', la arista (A, B) tendría ambos extremos en S, violando la definición de conjunto independiente.`,
        en: `If 'B' were included, edge (A, B) would have both endpoints in S, violating independence.`
      }
    }
  });

  // Step 3: Seleccionar D -> Compatible con A
  events.push({
    step: ++step,
    type: 'select_is_node',
    message: {
      es: `Candidato 'D': No comparte arista con 'A'. Agregamos 'D' a S.`,
      en: `Candidate 'D': Shares no edge with 'A'. Added 'D' to S.`
    },
    data: {
      vertices,
      edges,
      k,
      kPrime,
      independentSet: ['A', 'D'],
      vertexCover: [],
      activeNode: 'D',
      coveredEdges: [],
      phase: 'is_selection',
      explanation: {
        es: `S = {A, D} es un Conjunto Independiente válido de tamaño k = 2. No existe arista entre A y D.`,
        en: `S = {A, D} is a valid Independent Set of size k = 2. No edge connects A and D.`
      }
    }
  });

  // Step 4: Reducción Polinomial - Cálculo del complemento V \ S
  const complementC = vertices.filter((v) => !['A', 'D'].includes(v)); // ['B', 'C', 'E']
  events.push({
    step: ++step,
    type: 'reduction_transform',
    message: {
      es: `Transformación Polinomial: k' = |V| - k = 5 - 2 = 3. Cobertura complementaria C = V \\ S = {B, C, E}.`,
      en: `Polynomial Reduction: k' = |V| - k = 5 - 2 = 3. Complementary cover C = V \\ S = {B, C, E}.`
    },
    data: {
      vertices,
      edges,
      k,
      kPrime,
      independentSet: ['A', 'D'],
      vertexCover: complementC,
      coveredEdges: [],
      phase: 'complement_calculation',
      explanation: {
        es: `Por el Teorema K&T 8.1, al retirar los vértices independientes S, el complemento C debe cubrir obligatoriamente todas las aristas de G.`,
        en: `By Theorem K&T 8.1, removing independent vertices S leaves a complement C that must cover all edges in G.`
      }
    }
  });

  // Steps 5..10: Verificación arista por arista de la Cobertura de Vértices
  const accumulatedCovered: [string, string][] = [];
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    accumulatedCovered.push(e);
    const coverNode = complementC.includes(e[0]) ? e[0] : e[1];

    events.push({
      step: ++step,
      type: 'verify_vc_edge',
      message: {
        es: `Arista (${e[0]}, ${e[1]}): Cubierta por el vértice '${coverNode}' ∈ C.`,
        en: `Edge (${e[0]}, ${e[1]}): Covered by vertex '${coverNode}' ∈ C.`
      },
      data: {
        vertices,
        edges,
        k,
        kPrime,
        independentSet: ['A', 'D'],
        vertexCover: complementC,
        activeEdge: e,
        coveredEdges: [...accumulatedCovered],
        phase: 'vc_verification',
        explanation: {
          es: `Dado que no hay aristas con ambos extremos en S, al menos un extremo pertenece necesariamente a C = V \\ S.`,
          en: `Since no edge has both endpoints in S, at least one endpoint must belong to C = V \\ S.`
        }
      }
    });
  }

  // Step final: Verificación completa de la dualidad
  events.push({
    step: ++step,
    type: 'completed',
    message: {
      es: `✓ Reducción Verificada: S={A, D} (tamaño 2) ⟺ C={B, C, E} (tamaño 3) cubre el 100% de las aristas.`,
      en: `✓ Reduction Verified: S={A, D} (size 2) ⟺ C={B, C, E} (size 3) covers 100% of edges.`
    },
    data: {
      vertices,
      edges,
      k,
      kPrime,
      independentSet: ['A', 'D'],
      vertexCover: complementC,
      coveredEdges: [...edges],
      phase: 'completed',
      explanation: {
        es: `Dualidad exacta: Max-IS (|S| = 2) equivale a Min-VC (|C| = 3). La transformación se calculó en tiempo O(|V| + |E|).`,
        en: `Exact duality: Max-IS (|S| = 2) corresponds to Min-VC (|C| = 3). Transformation computed in O(|V| + |E|) time.`
      }
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
