import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';

export type GraphColoringAction =
  | 'INIT'
  | 'TRY_COLOR'
  | 'CONFLICT'
  | 'ASSIGN_COLOR'
  | 'PRUNE'
  | 'BACKTRACK'
  | 'SUCCESS'
  | 'FAILURE';

export interface GraphColoringStepData {
  vertices: string[];
  edges: [string, string][];
  k: number;
  coloring: Record<string, number>;
  currentVertex: string | null;
  currentVertexIndex: number;
  attemptedColor: number | null;
  conflictEdge: [string, string] | null;
  action: GraphColoringAction;
  description: LocalizedString;
  exploredStates: number;
  backtrackCount: number;
}

export const DEFAULT_COLORING_GRAPH = {
  vertices: ['A', 'B', 'C', 'D', 'E'],
  edges: [
    ['A', 'B'],
    ['B', 'C'],
    ['C', 'D'],
    ['D', 'E'],
    ['E', 'A'],
    ['A', 'C'],
    ['A', 'D']
  ] as [string, string][],
  k: 3
};

export const DEFAULT_COLORING_LAYOUT: Record<string, { x: number; y: number }> = {
  A: { x: 250, y: 55 },
  B: { x: 420, y: 150 },
  C: { x: 360, y: 310 },
  D: { x: 140, y: 310 },
  E: { x: 80, y: 150 }
};

export const COLOR_PALETTE: Record<number, { name: { es: string; en: string }; fill: string; stroke: string }> = {
  1: { name: { es: 'Rojo', en: 'Red' }, fill: '#ef4444', stroke: '#b91c1c' },
  2: { name: { es: 'Azul', en: 'Blue' }, fill: '#3b82f6', stroke: '#1d4ed8' },
  3: { name: { es: 'Verde', en: 'Green' }, fill: '#10b981', stroke: '#047857' },
  4: { name: { es: 'Ámbar', en: 'Amber' }, fill: '#f59e0b', stroke: '#b45309' }
};

export function generateGraphColoringTrace(
  graph = DEFAULT_COLORING_GRAPH
): TraceTimeline<GraphColoringStepData> {
  const { vertices, edges, k } = graph;
  const events: TraceEvent<GraphColoringStepData>[] = [];
  let stepIndex = 0;

  // Build adjacency
  const adj = new Map<string, Set<string>>();
  for (const v of vertices) {
    adj.set(v, new Set());
  }
  for (const [u, v] of edges) {
    adj.get(u)?.add(v);
    adj.get(v)?.add(u);
  }

  const coloring: Record<string, number> = {};
  let exploredStates = 0;
  let backtrackCount = 0;

  // Step 0: INIT
  events.push({
    step: stepIndex++,
    type: 'INIT',
    message: {
      es: `Inicialización: Grafo G con |V| = ${vertices.length} vértices y |E| = ${edges.length} aristas. Buscamos un k-coloreo con k = ${k}.`,
      en: `Initialization: Graph G with |V| = ${vertices.length} vertices and |E| = ${edges.length} edges. Looking for a k-coloring with k = ${k}.`
    },
    data: {
      vertices,
      edges,
      k,
      coloring: {},
      currentVertex: null,
      currentVertexIndex: -1,
      attemptedColor: null,
      conflictEdge: null,
      action: 'INIT',
      description: {
        es: `Grafo sin colorear. Ningún vértice tiene color asignado. Iniciando exploración por el vértice ${vertices[0]}.`,
        en: `Uncolored graph. No vertex has an assigned color. Starting search from vertex ${vertices[0]}.`
      },
      exploredStates,
      backtrackCount
    }
  });

  function findConflict(v: string, color: number): [string, string] | null {
    const neighbors = adj.get(v);
    if (!neighbors) return null;
    for (const n of neighbors) {
      if (coloring[n] === color) {
        return [v, n];
      }
    }
    return null;
  }

  function backtrack(idx: number): boolean {
    if (idx === vertices.length) {
      events.push({
        step: stepIndex++,
        type: 'SUCCESS',
        message: {
          es: `¡Éxito! Se encontró una asignación válida de ${k} colores sin ningún conflicto adyacente.`,
          en: `Success! A valid assignment of ${k} colors was found with zero adjacent conflicts.`
        },
        data: {
          vertices,
          edges,
          k,
          coloring: { ...coloring },
          currentVertex: null,
          currentVertexIndex: idx,
          attemptedColor: null,
          conflictEdge: null,
          action: 'SUCCESS',
          description: {
            es: `Todos los ${vertices.length} vértices fueron coloreados exitosamente. Solución óptima alcanzada.`,
            en: `All ${vertices.length} vertices were successfully colored. Optimal solution reached.`
          },
          exploredStates,
          backtrackCount
        }
      });
      return true;
    }

    const v = vertices[idx];

    for (let c = 1; c <= k; c++) {
      exploredStates++;
      const colorInfo = COLOR_PALETTE[c] || { name: { es: `Color ${c}`, en: `Color ${c}` } };

      // Step: TRY_COLOR
      events.push({
        step: stepIndex++,
        type: 'TRY_COLOR',
        message: {
          es: `Probando ${colorInfo.name.es} (c=${c}) en vértice "${v}".`,
          en: `Trying ${colorInfo.name.en} (c=${c}) on vertex "${v}".`
        },
        data: {
          vertices,
          edges,
          k,
          coloring: { ...coloring },
          currentVertex: v,
          currentVertexIndex: idx,
          attemptedColor: c,
          conflictEdge: null,
          action: 'TRY_COLOR',
          description: {
            es: `Verificando si algún vecino de "${v}" ya posee el color ${colorInfo.name.es}...`,
            en: `Checking if any neighbor of "${v}" already has color ${colorInfo.name.en}...`
          },
          exploredStates,
          backtrackCount
        }
      });

      const conflict = findConflict(v, c);

      if (conflict) {
        // Step: CONFLICT
        const neighbor = conflict[1];
        events.push({
          step: stepIndex++,
          type: 'CONFLICT',
          message: {
            es: `Conflicto detectado: "${v}" es vecino de "${neighbor}" que ya tiene ${colorInfo.name.es}.`,
            en: `Conflict detected: "${v}" is adjacent to "${neighbor}" which already has ${colorInfo.name.en}.`
          },
          data: {
            vertices,
            edges,
            k,
            coloring: { ...coloring },
            currentVertex: v,
            currentVertexIndex: idx,
            attemptedColor: c,
            conflictEdge: conflict,
            action: 'CONFLICT',
            description: {
              es: `Arista (${conflict[0]}, ${conflict[1]}) en conflicto. Color ${c} descartado para "${v}".`,
              en: `Edge (${conflict[0]}, ${conflict[1]}) in conflict. Color ${c} discarded for "${v}".`
            },
            exploredStates,
            backtrackCount
          }
        });
        continue; // Try next color
      }

      // Valid assignment
      coloring[v] = c;
      events.push({
        step: stepIndex++,
        type: 'ASSIGN_COLOR',
        message: {
          es: `Asignación válida: Vértice "${v}" coloreado con ${colorInfo.name.es} (c=${c}).`,
          en: `Valid assignment: Vertex "${v}" colored with ${colorInfo.name.en} (c=${c}).`
        },
        data: {
          vertices,
          edges,
          k,
          coloring: { ...coloring },
          currentVertex: v,
          currentVertexIndex: idx,
          attemptedColor: c,
          conflictEdge: null,
          action: 'ASSIGN_COLOR',
          description: {
            es: `Ningún vecino entra en conflicto. Avanzando recursivamente al siguiente vértice.`,
            en: `No neighbor conflicts. Recursively advancing to the next vertex.`
          },
          exploredStates,
          backtrackCount
        }
      });

      if (backtrack(idx + 1)) {
        return true;
      }

      // Backtrack
      backtrackCount++;
      delete coloring[v];
      events.push({
        step: stepIndex++,
        type: 'BACKTRACK',
        message: {
          es: `Backtracking: Deshaciendo color ${colorInfo.name.es} en "${v}". Ningún subárbol produjo solución válida.`,
          en: `Backtracking: Undoing color ${colorInfo.name.en} on "${v}". No subtree yielded a valid solution.`
        },
        data: {
          vertices,
          edges,
          k,
          coloring: { ...coloring },
          currentVertex: v,
          currentVertexIndex: idx,
          attemptedColor: null,
          conflictEdge: null,
          action: 'BACKTRACK',
          description: {
            es: `Probando alternativas restantes o retrocediendo en el árbol de recursión.`,
            en: `Testing remaining alternatives or retreating in the recursion tree.`
          },
          exploredStates,
          backtrackCount
        }
      });
    }

    // Step: PRUNE (Exhausted all k colors for this vertex)
    events.push({
      step: stepIndex++,
      type: 'PRUNE',
      message: {
        es: `Poda de rama: Se agotaron los ${k} colores posibles para el vértice "${v}".`,
        en: `Branch pruning: All ${k} possible colors exhausted for vertex "${v}".`
      },
      data: {
        vertices,
        edges,
        k,
        coloring: { ...coloring },
        currentVertex: v,
        currentVertexIndex: idx,
        attemptedColor: null,
        conflictEdge: null,
        action: 'PRUNE',
        description: {
          es: `No hay opción factible para "${v}" bajo las decisiones previas. Retrocediendo...`,
          en: `No feasible option for "${v}" under prior choices. Backtracking...`
        },
        exploredStates,
        backtrackCount
      }
    });

    return false;
  }

  const success = backtrack(0);

  if (!success) {
    events.push({
      step: stepIndex++,
      type: 'FAILURE',
      message: {
        es: `Búsqueda completada sin solución: El grafo NO es ${k}-coloreable.`,
        en: `Search finished with no solution: The graph is NOT ${k}-colorable.`
      },
      data: {
        vertices,
        edges,
        k,
        coloring: {},
        currentVertex: null,
        currentVertexIndex: -1,
        attemptedColor: null,
        conflictEdge: null,
        action: 'FAILURE',
        description: {
          es: `Se exploró todo el espacio de estados. El número cromático χ(G) es estrictamente mayor que ${k}.`,
          en: `Exhaustive state-space search complete. Chromatic number χ(G) is strictly greater than ${k}.`
        },
        exploredStates,
        backtrackCount
      }
    });
  }

  return {
    events,
    totalSteps: events.length
  };
}
