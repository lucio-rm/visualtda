import { ValidationResult, Validator } from '../../types/validation';

export interface GraphInstance {
  vertices: string[];
  edges: [string, string][];
}

export interface ReductionInput extends GraphInstance {
  k: number; // Target size for Independent Set
}

export interface ReductionOutput {
  independentSet: string[];
  vertexCover: string[];
  reductionKPrime: number;
}

export class ReductionIsVcValidator implements Validator<ReductionInput, ReductionOutput> {
  /**
   * Verifies if S is a valid Independent Set on graph G.
   */
  validateIndependentSet(graph: GraphInstance, S: string[]): ValidationResult {
    const { vertices, edges } = graph;
    const errors: string[] = [];
    const vertSet = new Set(vertices);

    // 1. Check valid vertex IDs
    for (const v of S) {
      if (!vertSet.has(v)) {
        errors.push(`El vértice "${v}" no pertenece al conjunto de vértices V del grafo.`);
      }
    }

    // 2. Check no duplicates
    const sSet = new Set(S);
    if (sSet.size !== S.length) {
      errors.push('El conjunto independiente contiene vértices duplicados.');
    }

    // 3. Check independence condition: no edge has both endpoints in S
    for (const [u, v] of edges) {
      if (sSet.has(u) && sSet.has(v)) {
        errors.push(`Violación de independencia: La arista (${u}, ${v}) conecta dos vértices dentro del conjunto S.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Verifies if C is a valid Vertex Cover on graph G.
   */
  validateVertexCover(graph: GraphInstance, C: string[]): ValidationResult {
    const { vertices, edges } = graph;
    const errors: string[] = [];
    const vertSet = new Set(vertices);

    for (const v of C) {
      if (!vertSet.has(v)) {
        errors.push(`El vértice "${v}" no pertenece al conjunto de vértices V del grafo.`);
      }
    }

    const cSet = new Set(C);
    // Cover condition: every edge must have at least one endpoint in C
    for (const [u, v] of edges) {
      if (!cSet.has(u) && !cSet.has(v)) {
        errors.push(`Arista descubierta: La arista (${u}, ${v}) no tiene ningún extremo en la cobertura C.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Complete validation of the reduction output:
   * 1. k' = |V| - k
   * 2. |S| >= k
   * 3. S is an Independent Set
   * 4. C is the exact complement V \ S
   * 5. C is a Vertex Cover of size |V| - |S| <= k'
   */
  validate(input: ReductionInput, output: ReductionOutput): ValidationResult {
    const { vertices, edges, k } = input;
    const { independentSet, vertexCover, reductionKPrime } = output;
    const errors: string[] = [];

    const expectedKPrime = vertices.length - k;
    if (reductionKPrime !== expectedKPrime) {
      errors.push(
        `Parámetro de reducción k' incorrecto: Se esperaba |V| - k = ${vertices.length} - ${k} = ${expectedKPrime}, pero se obtuvo ${reductionKPrime}.`
      );
    }

    // Validate Independent Set
    const isVal = this.validateIndependentSet({ vertices, edges }, independentSet);
    if (!isVal.valid) {
      errors.push(...isVal.errors);
    }

    // Validate size requirement |S| >= k
    if (independentSet.length < k) {
      errors.push(
        `Tamaño insuficiente del Conjunto Independiente: Se requerían al menos ${k} vértices, se encontraron ${independentSet.length}.`
      );
    }

    // Validate exact complement C = V \ S
    const sSet = new Set(independentSet);
    const cSet = new Set(vertexCover);

    if (sSet.size + cSet.size !== vertices.length) {
      errors.push(
        `Violación de partición complementaria: |S| + |C| (${sSet.size} + ${cSet.size}) no coincide con |V| (${vertices.length}).`
      );
    }

    for (const v of vertices) {
      const inS = sSet.has(v);
      const inC = cSet.has(v);
      if (inS && inC) {
        errors.push(`Intersección no vacía: El vértice "${v}" está simultáneamente en S y en C.`);
      }
      if (!inS && !inC) {
        errors.push(`Omisión de partición: El vértice "${v}" no pertenece ni a S ni a C.`);
      }
    }

    // Validate Vertex Cover
    const vcVal = this.validateVertexCover({ vertices, edges }, vertexCover);
    if (!vcVal.valid) {
      errors.push(...vcVal.errors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export function reduceIndependentSetToVertexCover(
  input: ReductionInput,
  independentSet: string[]
): ReductionOutput {
  const sSet = new Set(independentSet);
  const vertexCover = input.vertices.filter((v) => !sSet.has(v));
  return {
    independentSet,
    vertexCover,
    reductionKPrime: input.vertices.length - input.k
  };
}

export const reductionIsVcValidator = new ReductionIsVcValidator();
