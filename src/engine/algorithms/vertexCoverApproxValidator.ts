import { ValidationResult, Validator } from '../../types/validation';

export interface ApproxGraphInput {
  vertices: string[];
  edges: [string, string][];
  optimalMinCoverSize?: number;
}

export interface ApproxCoverOutput {
  cover: string[];
  matching: [string, string][];
}

export class VertexCoverApproxValidator implements Validator<ApproxGraphInput, ApproxCoverOutput> {
  validate(input: ApproxGraphInput, output: ApproxCoverOutput): ValidationResult {
    const { vertices, edges, optimalMinCoverSize } = input;
    const { cover, matching } = output;
    const errors: string[] = [];

    const vertSet = new Set(vertices);

    // 1. Validate cover vertices belong to graph
    for (const v of cover) {
      if (!vertSet.has(v)) {
        errors.push(`El vértice "${v}" en la cobertura no pertenece al conjunto de vértices del grafo.`);
      }
    }

    // 2. Validate feasibility (every edge is covered)
    const coverSet = new Set(cover);
    for (const [u, v] of edges) {
      if (!coverSet.has(u) && !coverSet.has(v)) {
        errors.push(`Arista descubierta: La arista (${u}, ${v}) no tiene ningún extremo en la cobertura generada.`);
      }
    }

    // 3. Validate matching independence (disjoint edges)
    const matchingVertices = new Set<string>();
    for (const [u, v] of matching) {
      if (matchingVertices.has(u)) {
        errors.push(`Violación de matching: El vértice "${u}" aparece en más de una arista del matching.`);
      }
      if (matchingVertices.has(v)) {
        errors.push(`Violación de matching: El vértice "${v}" aparece en más de una arista del matching.`);
      }
      matchingVertices.add(u);
      matchingVertices.add(v);
    }

    // 4. Validate construction: |C| == 2 * |M|
    if (coverSet.size !== 2 * matching.length) {
      errors.push(
        `Inconsistencia estructural: La cobertura tiene tamaño ${coverSet.size} pero el matching tiene ${matching.length} aristas (se esperaba |C| = 2·|M| = ${2 * matching.length}).`
      );
    }

    // 5. Validate 2-approximation bound relative to optimal (if provided)
    if (optimalMinCoverSize !== undefined) {
      const maxAllowed = 2 * optimalMinCoverSize;
      if (coverSet.size > maxAllowed) {
        errors.push(
          `Violación del ratio de 2-aproximación: El tamaño ${coverSet.size} excede 2·|C*| = ${maxAllowed}.`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const vertexCoverApproxValidator = new VertexCoverApproxValidator();
