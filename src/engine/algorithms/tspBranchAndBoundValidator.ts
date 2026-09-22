export interface TspValidationResult {
  valid: boolean;
  errors: string[];
}

export function solveTspBranchAndBound(dist: number[][]): number {
  const n = dist.length;
  if (n <= 1) return 0;
  if (n === 2) return dist[0][1] + dist[1][0];

  let bestCost = Infinity;

  function lowerBound(curr: number, visited: Set<number>, currentCost: number): number {
    const unvisited: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) unvisited.push(i);
    }
    if (unvisited.length === 0) {
      return currentCost + dist[curr][0];
    }

    let minOut = Infinity;
    for (const r of unvisited) {
      if (dist[curr][r] < minOut) minOut = dist[curr][r];
    }

    let minReturn = Infinity;
    for (const r of unvisited) {
      if (dist[r][0] < minReturn) minReturn = dist[r][0];
    }

    return currentCost + minOut + minReturn;
  }

  function explore(u: number, visited: Set<number>, currentCost: number) {
    if (visited.size === n) {
      const total = currentCost + dist[u][0];
      if (total < bestCost) {
        bestCost = total;
      }
      return;
    }

    if (lowerBound(u, visited, currentCost) >= bestCost) {
      return;
    }

    const unvisited: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) unvisited.push(i);
    }
    unvisited.sort((a, b) => dist[u][a] - dist[u][b]);

    for (const v of unvisited) {
      visited.add(v);
      explore(v, visited, currentCost + dist[u][v]);
      visited.delete(v);
    }
  }

  const initialVisited = new Set<number>([0]);
  explore(0, initialVisited, 0);

  return bestCost;
}

export const tspBranchAndBoundValidator = {
  validate(dist: number[][], resultCost: number): TspValidationResult {
    const errors: string[] = [];
    const expected = solveTspBranchAndBound(dist);

    if (typeof resultCost !== 'number' || isNaN(resultCost)) {
      return { valid: false, errors: ['El costo retornado debe ser un número entero o decimal.'] };
    }

    if (resultCost !== expected) {
      errors.push(`Costo subóptimo o incorrecto: se esperaban ${expected}, pero se obtuvieron ${resultCost}.`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
