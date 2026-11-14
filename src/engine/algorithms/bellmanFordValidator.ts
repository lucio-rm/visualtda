import { ValidationResult, Validator } from '../../types/validation';

export type DirectedWeightedEdge = [number, number, number]; // [u, v, weight]

export interface BellmanFordInputObject {
  numVertices: number;
  edges: DirectedWeightedEdge[];
  source: number;
}

export type BellmanFordInput =
  | BellmanFordInputObject
  | [number, DirectedWeightedEdge[], number];

export type BellmanFordOutput =
  | [Record<string | number, number>, boolean]
  | { distances: Record<string | number, number>; hasNegativeCycle: boolean };

export function solveBellmanFord(
  numVertices: number,
  edges: DirectedWeightedEdge[],
  source: number
): { distances: Record<number, number>; hasNegativeCycle: boolean } {
  const dist: number[] = new Array(numVertices).fill(Infinity);
  dist[source] = 0;

  for (let step = 0; step < numVertices - 1; step++) {
    let updated = false;
    for (const [u, v, w] of edges) {
      if (u >= 0 && u < numVertices && v >= 0 && v < numVertices) {
        if (dist[u] !== Infinity && dist[u] + w < dist[v]) {
          dist[v] = dist[u] + w;
          updated = true;
        }
      }
    }
    if (!updated) break;
  }

  let hasNegativeCycle = false;
  for (const [u, v, w] of edges) {
    if (u >= 0 && u < numVertices && v >= 0 && v < numVertices) {
      if (dist[u] !== Infinity && dist[u] + w < dist[v] - 1e-6) {
        hasNegativeCycle = true;
        break;
      }
    }
  }

  const resultDistances: Record<number, number> = {};
  for (let i = 0; i < numVertices; i++) {
    resultDistances[i] = dist[i];
  }

  return { distances: resultDistances, hasNegativeCycle };
}

export class BellmanFordValidator
  implements Validator<BellmanFordInput, BellmanFordOutput>
{
  validate(input: BellmanFordInput, output: BellmanFordOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let numVertices: number | undefined;
    let edges: DirectedWeightedEdge[] | undefined;
    let source: number | undefined;

    if (Array.isArray(input)) {
      numVertices = typeof input[0] === 'number' ? input[0] : undefined;
      edges = Array.isArray(input[1]) ? input[1] : undefined;
      source = typeof input[2] === 'number' ? input[2] : undefined;
    } else if (input && typeof input === 'object') {
      numVertices = input.numVertices;
      edges = input.edges;
      source = input.source;
    }

    if (typeof numVertices !== 'number' || numVertices <= 0) {
      return {
        valid: false,
        isValid: false,
        errors: ['El parámetro numVertices debe ser un entero positivo.'],
        warnings
      };
    }

    if (!Array.isArray(edges)) {
      return {
        valid: false,
        isValid: false,
        errors: ['La lista de aristas debe ser un arreglo de tuplas [u, v, peso].'],
        warnings
      };
    }

    if (typeof source !== 'number' || source < 0 || source >= numVertices) {
      return {
        valid: false,
        isValid: false,
        errors: [`El vértice origen ${source} debe estar en el rango [0, ${numVertices - 1}].`],
        warnings
      };
    }

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (!Array.isArray(e) || e.length < 3 || typeof e[0] !== 'number' || typeof e[1] !== 'number' || typeof e[2] !== 'number') {
        errors.push(`Arista inválida en el índice ${i}: se esperaba [u, v, peso] numérico.`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    let actualDistances: Record<string | number, number> | null = null;
    let actualHasCycle: boolean | null = null;

    if (Array.isArray(output)) {
      if (output.length >= 2) {
        actualDistances = typeof output[0] === 'object' && output[0] !== null ? output[0] : null;
        actualHasCycle = typeof output[1] === 'boolean' ? output[1] : null;
      }
    } else if (output && typeof output === 'object') {
      actualDistances = output.distances;
      actualHasCycle = output.hasNegativeCycle;
    }

    if (!actualDistances || typeof actualDistances !== 'object' || typeof actualHasCycle !== 'boolean') {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado de Bellman-Ford debe ser una tupla [distancias, tiene_ciclo_negativo] o un objeto { distances, hasNegativeCycle }.'],
        warnings
      };
    }

    const canonical = solveBellmanFord(numVertices, edges, source);

    if (actualHasCycle !== canonical.hasNegativeCycle) {
      if (canonical.hasNegativeCycle) {
        errors.push('Falso negativo: El grafo contiene un ciclo de costo negativo alcanzable, pero se reportó tiene_ciclo_negativo == False.');
      } else {
        errors.push('Falso positivo: Se reportó tiene_ciclo_negativo == True, pero el grafo no contiene ciclos negativos.');
      }
    }

    // If no negative cycle, verify distances
    if (!canonical.hasNegativeCycle) {
      for (let v = 0; v < numVertices; v++) {
        const expectedD = canonical.distances[v];
        const actualD = actualDistances[v] ?? actualDistances[String(v)];

        if (expectedD === Infinity) {
          if (actualD !== undefined && actualD !== null && actualD !== Infinity) {
            errors.push(`El vértice inalcanzable ${v} tiene asignada una distancia finita (${actualD}).`);
          }
        } else {
          if (typeof actualD !== 'number' || Number.isNaN(actualD)) {
            errors.push(`Falta la distancia mínima hacia el vértice alcanzable ${v}.`);
          } else if (Math.abs(actualD - expectedD) > 1e-4) {
            errors.push(
              `Distancia errónea hacia el vértice ${v}: Se obtuvo ${actualD}, pero el camino mínimo real tiene costo ${expectedD}.`
            );
          }
        }
      }

      // Check relaxation inequality
      for (const [u, v, w] of edges) {
        const du = actualDistances[u] ?? actualDistances[String(u)];
        const dv = actualDistances[v] ?? actualDistances[String(v)];
        if (typeof du === 'number' && Number.isFinite(du) && typeof dv === 'number' && Number.isFinite(dv)) {
          if (dv > du + w + 1e-5) {
            errors.push(
              `Infracción de optimalidad de Bellman-Ford: arista (${u} -> ${v}, w=${w}) no relajada (dist[${v}]=${dv} > dist[${u}]+${w}=${du + w}).`
            );
          }
        }
      }
    }

    const valid = errors.length === 0;
    return {
      valid,
      isValid: valid,
      errors,
      warnings,
      metrics: {
        numVertices,
        numEdges: edges.length,
        source,
        hasNegativeCycle: canonical.hasNegativeCycle
      }
    };
  }
}

export const bellmanFordValidator = new BellmanFordValidator();
