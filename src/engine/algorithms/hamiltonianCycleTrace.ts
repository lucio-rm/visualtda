import { TraceTimeline, TraceEvent } from '../../types';

export interface HamNode {
  id: number;
  label: string;
  x: number;
  y: number;
}

export interface HamEdge {
  u: number;
  v: number;
}

export interface HamiltonianStepData {
  nodes: HamNode[];
  edges: HamEdge[];
  currentPath: number[];
  visited: number[];
  currentVertex: number | null;
  candidateNext: number | null;
  isCycleFound: boolean;
  backtrackCount: number;
  action: 'INIT' | 'EXPLORE_VERTEX' | 'DEAD_END' | 'BACKTRACK' | 'CYCLE_FOUND' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_HAM_GRAPH: { nodes: HamNode[]; edges: HamEdge[] } = {
  nodes: [
    { id: 0, label: '0', x: 250, y: 40 },
    { id: 1, label: '1', x: 410, y: 100 },
    { id: 2, label: '2', x: 410, y: 220 },
    { id: 3, label: '3', x: 250, y: 280 },
    { id: 4, label: '4', x: 90, y: 220 },
    { id: 5, label: '5', x: 90, y: 100 }
  ],
  edges: [
    { u: 0, v: 1 }, { u: 1, v: 2 }, { u: 2, v: 3 },
    { u: 3, v: 4 }, { u: 4, v: 5 }, { u: 5, v: 0 },
    { u: 0, v: 3 }, { u: 1, v: 4 } // chords creating multiple paths and dead ends
  ]
};

export function generateHamiltonianCycleTrace(
  graph = DEFAULT_HAM_GRAPH
): TraceTimeline<HamiltonianStepData> {
  const events: TraceEvent<HamiltonianStepData>[] = [];
  const { nodes, edges } = graph;
  const numV = nodes.length;

  const adj: Map<number, number[]> = new Map();
  for (const n of nodes) adj.set(n.id, []);
  for (const e of edges) {
    adj.get(e.u)?.push(e.v);
    adj.get(e.v)?.push(e.u);
  }

  let eventCounter = 0;
  let backtrackCount = 0;
  let cycleFound = false;

  const path: number[] = [0];
  const visited: Set<number> = new Set([0]);

  function pushEvent(
    action: HamiltonianStepData['action'],
    curV: number | null,
    candNext: number | null,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        nodes,
        edges,
        currentPath: [...path],
        visited: Array.from(visited),
        currentVertex: curV,
        candidateNext: candNext,
        isCycleFound: cycleFound,
        backtrackCount,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // 1. Init
  pushEvent(
    'INIT',
    0,
    null,
    `Búsqueda de Ciclo Hamiltoniano en un grafo de ${numV} vértices. Iniciando en vértice origen v = 0.`,
    `Searching for Hamiltonian Cycle in ${numV}-vertex graph. Starting at source vertex v = 0.`
  );

  function dfs(u: number): boolean {
    if (path.length === numV) {
      const neighbors = adj.get(u) || [];
      if (neighbors.includes(0)) {
        cycleFound = true;
        path.push(0);
        pushEvent(
          'CYCLE_FOUND',
          0,
          null,
          `¡Ciclo Hamiltoniano encontrado! Todos los ${numV} vértices fueron visitados y existe arista de retorno (${u} → 0). Camino: [${path.join(' → ')}].`,
          `Hamiltonian Cycle found! All ${numV} vertices visited with return edge (${u} → 0). Path: [${path.join(' → ')}].`
        );
        return true;
      } else {
        pushEvent(
          'DEAD_END',
          u,
          0,
          `Camino completo de ${numV} vértices alcanzado, pero NO existe arista de retorno (${u} → 0) para cerrar el ciclo. Iniciando retroceso.`,
          `Path of ${numV} vertices reached, but NO return edge (${u} → 0) exists to close cycle. Backtracking.`
        );
        return false;
      }
    }

    const neighbors = adj.get(u) || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        path.push(v);

        pushEvent(
          'EXPLORE_VERTEX',
          v,
          null,
          `Avanzando por arista (${u} → ${v}). Vértices en camino actual: [${path.join(' → ')}].`,
          `Advancing along edge (${u} → ${v}). Current path: [${path.join(' → ')}].`
        );

        if (dfs(v)) return true;

        // Backtrack
        backtrackCount++;
        path.pop();
        visited.delete(v);

        pushEvent(
          'BACKTRACK',
          u,
          v,
          `Callejón sin salida desde ${v}. Retrocediendo a ${u} (backtrack #${backtrackCount}).`,
          `Dead end from ${v}. Backtracking to ${u} (backtrack #${backtrackCount}).`
        );
      }
    }

    return false;
  }

  dfs(0);

  pushEvent(
    'COMPLETE',
    null,
    null,
    cycleFound
      ? `Exploración finalizada con éxito. Ciclo Hamiltoniano verificado con ${backtrackCount} podas/retrocesos.`
      : `Exploración finalizada: no existe ciclo hamiltoniano en este grafo.`,
    cycleFound
      ? `Exploration complete with success. Hamiltonian cycle verified.`
      : `Exploration complete: no Hamiltonian cycle exists in this graph.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
