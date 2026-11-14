import { ValidationResult, Validator } from '../../types/validation';

export type AdjacencyGraph = Record<string, [string, number][]>;

export interface DijkstraInput {
  graph: AdjacencyGraph;
  source: string;
}

export type DijkstraOutput = Record<string, number>;

export function solveDijkstra(
  graph: AdjacencyGraph,
  source: string
): Record<string, number> {
  const distances: Record<string, number> = {};
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
  }
  distances[source] = 0;

  const visited = new Set<string>();

  while (true) {
    let closestNode: string | null = null;
    let minDistance = Infinity;

    for (const [node, dist] of Object.entries(distances)) {
      if (!visited.has(node) && dist < minDistance) {
        minDistance = dist;
        closestNode = node;
      }
    }

    if (closestNode === null || minDistance === Infinity) {
      break;
    }

    visited.add(closestNode);

    const neighbors = graph[closestNode] || [];
    for (const [neighbor, weight] of neighbors) {
      if (minDistance + weight < (distances[neighbor] ?? Infinity)) {
        distances[neighbor] = minDistance + weight;
      }
    }
  }

  return distances;
}

export class DijkstraValidator
  implements Validator<DijkstraInput, DijkstraOutput>
{
  validate(input: DijkstraInput, output: DijkstraOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!input || typeof input !== 'object' || !input.graph || typeof input.source !== 'string') {
      return {
        valid: false,
        isValid: false,
        errors: ['La entrada debe ser un objeto { graph, source } donde graph es la lista de adyacencia y source es el nodo de partida.'],
        warnings
      };
    }

    const { graph, source } = input;

    if (!(source in graph)) {
      return {
        valid: false,
        isValid: false,
        errors: [`El nodo origen "${source}" no existe en los vértices del grafo.`],
        warnings
      };
    }

    // Verify non-negative edge weights
    for (const [u, edges] of Object.entries(graph)) {
      if (!Array.isArray(edges)) {
        errors.push(`Las aristas salientes del vértice "${u}" deben ser una lista de pares [vecino, peso].`);
        return { valid: false, isValid: false, errors, warnings };
      }
      for (const [v, w] of edges) {
        if (typeof w !== 'number' || Number.isNaN(w)) {
          errors.push(`El peso de la arista (${u} -> ${v}) no es un número válido.`);
          return { valid: false, isValid: false, errors, warnings };
        }
        if (w < 0) {
          errors.push(
            `Arista de costo negativo detectada (${u} -> ${v}, peso ${w}): El algoritmo de Dijkstra requiere pesos estrictamente no negativos (w >= 0).`
          );
          return { valid: false, isValid: false, errors, warnings };
        }
      }
    }

    if (!output || typeof output !== 'object' || Array.isArray(output)) {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado de Dijkstra debe ser un diccionario { nodo: distancia_minima }.'],
        warnings
      };
    }

    // Verify distance from source to itself is 0
    if (output[source] !== 0) {
      errors.push(
        `Distancia al origen incorrecta: La distancia desde el origen "${source}" hacia sí mismo debe ser estrictamente 0 (se obtuvo ${output[source]}).`
      );
    }

    const expectedDistances = solveDijkstra(graph, source);

    for (const node of Object.keys(graph)) {
      const expectedDist = expectedDistances[node];
      const actualDist = output[node];

      if (expectedDist === Infinity) {
        if (actualDist !== undefined && actualDist !== null && actualDist !== Infinity) {
          errors.push(`El nodo inalcanzable "${node}" tiene asignada una distancia finita (${actualDist}).`);
        }
      } else {
        if (typeof actualDist !== 'number' || Number.isNaN(actualDist)) {
          errors.push(`Falta la distancia calculada para el nodo alcanzable "${node}".`);
        } else if (Math.abs(actualDist - expectedDist) > 1e-4) {
          errors.push(
            `Distancia errónea para el nodo "${node}": Se obtuvo ${actualDist}, pero el camino más corto tiene costo ${expectedDist}.`
          );
        }
      }
    }

    // Relaxation inequality check: for every directed edge (u, v, w)
    for (const [u, edges] of Object.entries(graph)) {
      const du = output[u];
      if (du !== undefined && Number.isFinite(du)) {
        for (const [v, w] of edges) {
          const dv = output[v];
          if (dv !== undefined && Number.isFinite(dv)) {
            if (dv > du + w + 1e-5) {
              errors.push(
                `Violación de desigualdad triangular: dist(${v}) = ${dv} > dist(${u}) + w = ${du} + ${w}.`
              );
            }
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
        vertexCount: Object.keys(graph).length,
        source
      }
    };
  }
}

export const dijkstraValidator = new DijkstraValidator();
