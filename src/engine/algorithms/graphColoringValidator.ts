export interface GraphColoringInput {
  vertices: string[];
  edges: [string, string][];
  k: number;
}

export type GraphColoringOutput = Record<string, number> | null;

export interface GraphColoringValidationResult {
  valid: boolean;
  message: { es: string; en: string };
  conflictEdge?: [string, string];
}

export function solveGraphColoring(
  graph: GraphColoringInput
): GraphColoringOutput {
  const { vertices, edges, k } = graph;
  if (vertices.length === 0) return {};

  const adj = new Map<string, Set<string>>();
  for (const v of vertices) {
    adj.set(v, new Set());
  }
  for (const [u, v] of edges) {
    adj.get(u)?.add(v);
    adj.get(v)?.add(u);
  }

  const coloring: Record<string, number> = {};

  function isSafe(v: string, color: number): boolean {
    const neighbors = adj.get(v);
    if (!neighbors) return true;
    for (const neighbor of neighbors) {
      if (coloring[neighbor] === color) {
        return false;
      }
    }
    return true;
  }

  function backtrack(index: number): boolean {
    if (index === vertices.length) {
      return true;
    }

    const v = vertices[index];
    for (let c = 1; c <= k; c++) {
      if (isSafe(v, c)) {
        coloring[v] = c;
        if (backtrack(index + 1)) {
          return true;
        }
        delete coloring[v]; // Undo
      }
    }
    return false;
  }

  const hasSolution = backtrack(0);
  return hasSolution ? coloring : null;
}

export const graphColoringValidator = {
  validate(
    input: GraphColoringInput,
    output: GraphColoringOutput
  ): GraphColoringValidationResult {
    const { vertices, edges, k } = input;
    const trueSolution = solveGraphColoring(input);

    if (trueSolution === null) {
      if (output === null) {
        return {
          valid: true,
          message: {
            es: `Correcto: El grafo no es ${k}-coloreable y el algoritmo reportó correctamente None.`,
            en: `Correct: The graph is not ${k}-colorable and the algorithm correctly returned None.`
          }
        };
      }
      return {
        valid: false,
        message: {
          es: `Error: El grafo no admite un ${k}-coloreo, pero se devolvió una asignación.`,
          en: `Error: The graph is not ${k}-colorable, but an assignment was returned.`
        }
      };
    }

    if (output === null) {
      return {
        valid: false,
        message: {
          es: `Error: El grafo sí admite un ${k}-coloreo válido, pero se retornó None.`,
          en: `Error: The graph does admit a valid ${k}-coloring, but None was returned.`
        }
      };
    }

    // Verify all vertices are colored with valid range 1..k
    for (const v of vertices) {
      const c = output[v];
      if (c === undefined || typeof c !== 'number' || c < 1 || c > k || !Number.isInteger(c)) {
        return {
          valid: false,
          message: {
            es: `Error: El vértice "${v}" tiene un color inválido (${c}). Debe ser un entero entre 1 y ${k}.`,
            en: `Error: Vertex "${v}" has an invalid color (${c}). Must be an integer between 1 and ${k}.`
          }
        };
      }
    }

    // Verify no adjacent vertices share a color
    for (const [u, v] of edges) {
      if (output[u] === output[v]) {
        return {
          valid: false,
          conflictEdge: [u, v],
          message: {
            es: `Conflicto: Los vértices adyacentes "${u}" y "${v}" comparten el color ${output[u]}.`,
            en: `Conflict: Adjacent vertices "${u}" and "${v}" share color ${output[u]}.`
          }
        };
      }
    }

    return {
      valid: true,
      message: {
        es: `¡Válido! Todos los vértices están coloreados con a lo sumo ${k} colores sin conflictos en aristas.`,
        en: `Valid! All vertices are colored with at most ${k} colors with no edge conflicts.`
      }
    };
  }
};
