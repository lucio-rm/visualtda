export interface HamiltonianCycleInput {
  numVertices: number;
  adj: Record<number, number[]>;
}

export interface HamiltonianValidationResult {
  valid: boolean;
  errors: string[];
}

export function solveHamiltonianCycle(input: HamiltonianCycleInput): number[] | null {
  const { numVertices, adj } = input;
  if (numVertices <= 0) return null;
  if (numVertices === 1) return [0, 0];

  const path: number[] = [0];
  const visited = new Set<number>([0]);

  function backtrack(u: number): boolean {
    if (path.length === numVertices) {
      const neighbors = adj[u] || [];
      return neighbors.includes(0);
    }

    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        path.push(v);
        if (backtrack(v)) return true;
        path.pop();
        visited.delete(v);
      }
    }
    return false;
  }

  if (backtrack(0)) {
    return [...path, 0];
  }
  return null;
}

export const hamiltonianCycleValidator = {
  validate(input: HamiltonianCycleInput, cycle: number[] | null): HamiltonianValidationResult {
    const { numVertices, adj } = input;
    const errors: string[] = [];

    const expectedSol = solveHamiltonianCycle(input);
    if (expectedSol === null) {
      if (cycle === null || cycle === undefined) {
        return { valid: true, errors: [] };
      }
      return { valid: false, errors: ['El grafo no contiene ningún ciclo hamiltoniano, pero se retornó un ciclo.'] };
    }

    if (cycle === null || cycle === undefined) {
      return { valid: false, errors: ['El grafo posee un ciclo hamiltoniano válido, pero se retornó None.'] };
    }

    if (!Array.isArray(cycle)) {
      return { valid: false, errors: ['El ciclo debe ser una lista de enteros.'] };
    }

    if (cycle.length !== numVertices + 1) {
      return {
        valid: false,
        errors: [`Longitud incorrecta: se esperaban ${numVertices + 1} vértices (cerrando en el origen), pero se recibieron ${cycle.length}.`]
      };
    }

    if (cycle[0] !== 0 || cycle[cycle.length - 1] !== 0) {
      errors.push(`El ciclo debe comenzar y terminar en el vértice origen 0 (obtenido inicio: ${cycle[0]}, fin: ${cycle[cycle.length - 1]}).`);
    }

    const visited = new Set<number>();
    for (let i = 0; i < numVertices; i++) {
      const v = cycle[i];
      if (v < 0 || v >= numVertices) {
        errors.push(`Vértice fuera de rango [0, ${numVertices - 1}]: ${v}.`);
      }
      if (visited.has(v)) {
        errors.push(`El vértice ${v} fue visitado más de una vez antes del cierre.`);
      }
      visited.add(v);
    }

    for (let i = 0; i < cycle.length - 1; i++) {
      const u = cycle[i];
      const v = cycle[i + 1];
      const neighbors = adj[u] || [];
      if (!neighbors.includes(v)) {
        errors.push(`Arista inexistente entre (${u}, ${v}) en el grafo.`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
