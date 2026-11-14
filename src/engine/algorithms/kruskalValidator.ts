import { ValidationResult, Validator } from '../../types/validation';

export type KruskalEdge = [number, number, number]; // [u, v, weight]

export interface KruskalInputObject {
  numVertices: number;
  edges: KruskalEdge[];
}

export type KruskalInput =
  | KruskalInputObject
  | [number, KruskalEdge[]];

export type KruskalOutput =
  | number
  | [number, KruskalEdge[]]
  | { totalCost: number; edges?: KruskalEdge[] };

export function solveKruskalMst(
  numVertices: number,
  edges: KruskalEdge[]
): { totalCost: number; mstEdges: KruskalEdge[] } {
  if (numVertices <= 0) return { totalCost: 0, mstEdges: [] };

  const sorted = [...edges].sort((a, b) => a[2] - b[2]);
  const parent = Array.from({ length: numVertices }, (_, i) => i);
  const rank = new Array(numVertices).fill(0);

  function find(i: number): number {
    if (parent[i] !== i) {
      parent[i] = find(parent[i]);
    }
    return parent[i];
  }

  function union(i: number, j: number): boolean {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI === rootJ) return false;

    if (rank[rootI] < rank[rootJ]) {
      parent[rootI] = rootJ;
    } else if (rank[rootI] > rank[rootJ]) {
      parent[rootJ] = rootI;
    } else {
      parent[rootJ] = rootI;
      rank[rootI]++;
    }
    return true;
  }

  let totalCost = 0;
  const mstEdges: KruskalEdge[] = [];

  for (const edge of sorted) {
    const [u, v, w] = edge;
    if (u >= 0 && u < numVertices && v >= 0 && v < numVertices) {
      if (union(u, v)) {
        totalCost += w;
        mstEdges.push(edge);
        if (mstEdges.length === numVertices - 1) {
          break;
        }
      }
    }
  }

  return { totalCost, mstEdges };
}

export class KruskalValidator
  implements Validator<KruskalInput, KruskalOutput>
{
  validate(input: KruskalInput, output: KruskalOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let numVertices: number | undefined;
    let edges: KruskalEdge[] | undefined;

    if (Array.isArray(input)) {
      numVertices = typeof input[0] === 'number' ? input[0] : undefined;
      edges = Array.isArray(input[1]) ? input[1] : undefined;
    } else if (input && typeof input === 'object') {
      numVertices = input.numVertices;
      edges = input.edges;
    }

    if (typeof numVertices !== 'number' || numVertices <= 0) {
      return {
        valid: false,
        isValid: false,
        errors: ['La cantidad de vértices numVertices debe ser un entero positivo.'],
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

    for (let i = 0; i < edges.length; i++) {
      const e = edges[i];
      if (!Array.isArray(e) || e.length < 3 || typeof e[0] !== 'number' || typeof e[1] !== 'number' || typeof e[2] !== 'number') {
        errors.push(`Arista inválida en el índice ${i}: se esperaba [u, v, peso] numérico.`);
        return { valid: false, isValid: false, errors, warnings };
      }
      if (e[0] < 0 || e[0] >= numVertices || e[1] < 0 || e[1] >= numVertices) {
        errors.push(`Vértice fuera de rango [0, ${numVertices - 1}] en arista (${e[0]}, ${e[1]}).`);
        return { valid: false, isValid: false, errors, warnings };
      }
    }

    const { totalCost: optimalCost, mstEdges: canonicalMst } = solveKruskalMst(numVertices, edges);

    let reportedCost: number | null = null;
    let reportedEdges: KruskalEdge[] | null = null;

    if (typeof output === 'number') {
      reportedCost = output;
    } else if (Array.isArray(output)) {
      reportedCost = typeof output[0] === 'number' ? output[0] : null;
      if (Array.isArray(output[1])) {
        reportedEdges = output[1] as KruskalEdge[];
      }
    } else if (output && typeof output === 'object') {
      reportedCost = typeof output.totalCost === 'number' ? output.totalCost : null;
      if (Array.isArray(output.edges)) {
        reportedEdges = output.edges;
      }
    }

    if (reportedCost === null || Number.isNaN(reportedCost)) {
      return {
        valid: false,
        isValid: false,
        errors: ['El resultado debe incluir el costo total del Árbol Generador Mínimo (número o [costo, aristas]).'],
        warnings
      };
    }

    if (Math.abs(reportedCost - optimalCost) > 1e-4) {
      errors.push(
        `Costo subóptimo: Se obtuvo costo ${reportedCost}, pero el Árbol Generador Mínimo tiene costo ${optimalCost}.`
      );
    }

    if (reportedEdges !== null) {
      const expectedEdgeCount = canonicalMst.length;
      if (reportedEdges.length !== expectedEdgeCount) {
        errors.push(
          `Cantidad incorrecta de aristas: El árbol generador debe contener exactamente ${expectedEdgeCount} aristas, pero se reportaron ${reportedEdges.length}.`
        );
      }

      // Check acyclicity and weight sum
      const parent = Array.from({ length: numVertices }, (_, i) => i);
      function find(i: number): number {
        if (parent[i] !== i) parent[i] = find(parent[i]);
        return parent[i];
      }
      function union(i: number, j: number): boolean {
        const rI = find(i);
        const rJ = find(j);
        if (rI === rJ) return false;
        parent[rI] = rJ;
        return true;
      }

      let edgeSum = 0;
      for (const e of reportedEdges) {
        if (!Array.isArray(e) || e.length < 3) continue;
        edgeSum += e[2];
        if (!union(e[0], e[1])) {
          errors.push(`Ciclo detectado: La arista (${e[0]}, ${e[1]}) forma un ciclo en la selección.`);
          break;
        }
      }

      if (Math.abs(edgeSum - reportedCost) > 1e-4) {
        errors.push(
          `Inconsistencia: La suma de pesos de las aristas devueltas (${edgeSum}) no coincide con el costo total reportado (${reportedCost}).`
        );
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
        optimalCost
      }
    };
  }
}

export const kruskalValidator = new KruskalValidator();
