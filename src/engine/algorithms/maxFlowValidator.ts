import { ValidationResult, Validator } from '../../types/validation';

export interface FlowEdge {
  u: string;
  v: string;
  capacity: number;
}

export interface FlowNetworkInput {
  vertices: string[];
  edges: FlowEdge[];
  source: string;
  sink: string;
}

export interface FlowOutput {
  maxFlow: number;
  edgeFlows: Record<string, number>; // "u->v" => flow
  minCutS?: string[];
  minCutT?: string[];
}

export class MaxFlowValidator implements Validator<FlowNetworkInput, FlowOutput> {
  validate(input: FlowNetworkInput, output: FlowOutput): ValidationResult {
    const { vertices, edges, source, sink } = input;
    const errors: string[] = [];

    if (!output || typeof output.maxFlow !== 'number' || !output.edgeFlows) {
      return {
        valid: false,
        errors: ['El resultado debe incluir maxFlow (número) y edgeFlows (diccionario "u->v" => flujo).']
      };
    }

    const edgeMap = new Map<string, FlowEdge>();
    for (const e of edges) {
      edgeMap.set(`${e.u}->${e.v}`, e);
    }

    // 1. Capacity constraints
    for (const [key, flow] of Object.entries(output.edgeFlows)) {
      const edge = edgeMap.get(key);
      if (!edge) {
        errors.push(`La arista "${key}" no pertenece a la red de capacidades original.`);
        continue;
      }
      if (flow < 0) {
        errors.push(`Flujo negativo (${flow}) en la arista ${key}.`);
      }
      if (flow > edge.capacity) {
        errors.push(`Capacidad excedida en ${key}: flujo ${flow} > capacidad ${edge.capacity}.`);
      }
    }

    // 2. Flow conservation for all intermediate vertices
    for (const v of vertices) {
      if (v === source || v === sink) continue;

      let inFlow = 0;
      let outFlow = 0;

      for (const e of edges) {
        const flow = output.edgeFlows[`${e.u}->${e.v}`] || 0;
        if (e.v === v) inFlow += flow;
        if (e.u === v) outFlow += flow;
      }

      if (inFlow !== outFlow) {
        errors.push(
          `Infracción de conservación en nodo "${v}": flujo entrante (${inFlow}) != flujo saliente (${outFlow}).`
        );
      }
    }

    // 3. Flow value matches source net outflow
    let sourceOut = 0;
    let sourceIn = 0;
    for (const e of edges) {
      const flow = output.edgeFlows[`${e.u}->${e.v}`] || 0;
      if (e.u === source) sourceOut += flow;
      if (e.v === source) sourceIn += flow;
    }
    const netSourceFlow = sourceOut - sourceIn;

    if (netSourceFlow !== output.maxFlow) {
      errors.push(
        `Discrepancia en valor de flujo: flujo neto saliente de fuente "${source}" (${netSourceFlow}) no coincide con maxFlow declarado (${output.maxFlow}).`
      );
    }

    // 4. Optimality against true Edmonds-Karp value
    const trueMaxFlow = this.computeTrueMaxFlow(input);
    if (errors.length === 0 && output.maxFlow < trueMaxFlow) {
      errors.push(
        `Subóptimo: El flujo total obtenido es ${output.maxFlow}, pero el flujo máximo posible es ${trueMaxFlow}.`
      );
    }

    // 5. Min Cut duality validation if provided
    if (output.minCutS && output.minCutT) {
      const S = new Set(output.minCutS);
      const T = new Set(output.minCutT);

      if (!S.has(source)) {
        errors.push(`El corte S debe contener al nodo fuente "${source}".`);
      }
      if (!T.has(sink)) {
        errors.push(`El corte T debe contener al nodo sumidero "${sink}".`);
      }

      let cutCapacity = 0;
      for (const e of edges) {
        if (S.has(e.u) && T.has(e.v)) {
          cutCapacity += e.capacity;
        }
      }

      if (cutCapacity !== trueMaxFlow) {
        errors.push(
          `El corte (S, T) no es mínimo: su capacidad es ${cutCapacity}, pero el flujo máximo es ${trueMaxFlow}.`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  computeTrueMaxFlow(input: FlowNetworkInput): number {
    const { vertices, edges, source, sink } = input;
    const residual: Record<string, Record<string, number>> = {};
    for (const v of vertices) residual[v] = {};

    for (const e of edges) {
      residual[e.u][e.v] = e.capacity;
      if (residual[e.v][e.u] === undefined) residual[e.v][e.u] = 0;
    }

    let totalFlow = 0;

    while (true) {
      const parent: Record<string, string> = {};
      const queue: string[] = [source];
      const visited = new Set<string>([source]);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr === sink) break;

        for (const [neighbor, cap] of Object.entries(residual[curr])) {
          if (!visited.has(neighbor) && cap > 0) {
            visited.add(neighbor);
            parent[neighbor] = curr;
            queue.push(neighbor);
          }
        }
      }

      if (!parent[sink]) break;

      let bottleneck = Infinity;
      let curr = sink;
      while (curr !== source) {
        const p = parent[curr];
        bottleneck = Math.min(bottleneck, residual[p][curr]);
        curr = p;
      }

      curr = sink;
      while (curr !== source) {
        const p = parent[curr];
        residual[p][curr] -= bottleneck;
        residual[curr][p] += bottleneck;
        curr = p;
      }

      totalFlow += bottleneck;
    }

    return totalFlow;
  }
}

export function solveMaxFlow(input: FlowNetworkInput): FlowOutput {
  const { vertices, edges, source, sink } = input;
  const residual: Record<string, Record<string, number>> = {};
  for (const v of vertices) residual[v] = {};

  for (const e of edges) {
    residual[e.u][e.v] = e.capacity;
    if (residual[e.v][e.u] === undefined) residual[e.v][e.u] = 0;
  }

  let totalFlow = 0;

  while (true) {
    const parent: Record<string, string> = {};
    const queue: string[] = [source];
    const visited = new Set<string>([source]);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === sink) break;

      for (const [neighbor, cap] of Object.entries(residual[curr])) {
        if (!visited.has(neighbor) && cap > 0) {
          visited.add(neighbor);
          parent[neighbor] = curr;
          queue.push(neighbor);
        }
      }
    }

    if (!parent[sink]) break;

    let bottleneck = Infinity;
    let curr = sink;
    while (curr !== source) {
      const p = parent[curr];
      bottleneck = Math.min(bottleneck, residual[p][curr]);
      curr = p;
    }

    curr = sink;
    while (curr !== source) {
      const p = parent[curr];
      residual[p][curr] -= bottleneck;
      residual[curr][p] += bottleneck;
      curr = p;
    }

    totalFlow += bottleneck;
  }

  const edgeFlows: Record<string, number> = {};
  for (const e of edges) {
    const forwardRem = residual[e.u][e.v] ?? 0;
    edgeFlows[`${e.u}->${e.v}`] = Math.max(0, e.capacity - forwardRem);
  }

  const reachable = new Set<string>([source]);
  const q = [source];
  while (q.length > 0) {
    const u = q.shift()!;
    for (const [v, cap] of Object.entries(residual[u])) {
      if (!reachable.has(v) && cap > 0) {
        reachable.add(v);
        q.push(v);
      }
    }
  }

  return {
    maxFlow: totalFlow,
    edgeFlows,
    minCutS: Array.from(reachable),
    minCutT: vertices.filter(v => !reachable.has(v))
  };
}

export const maxFlowValidator = new MaxFlowValidator();
