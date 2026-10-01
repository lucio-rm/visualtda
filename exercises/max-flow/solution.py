"""
Problema del Flujo Máximo y Corte Mínimo (Max Flow / Min Cut)
Técnica: Redes de Flujo (Algoritmo de Edmonds-Karp / Ford-Fulkerson con BFS)

Referencia: Kleinberg & Tardos, "Algorithm Design", Capítulo 7.
Complejidad Temporal: O(V * E^2)
"""

from collections import deque
from typing import NamedTuple, Any


class Edge(NamedTuple):
    source: str
    target: str
    capacity: int


class FlowResult(NamedTuple):
    max_flow: int
    edge_flows: dict[tuple[str, str], int]
    min_cut_S: set[str]
    min_cut_T: set[str]


def edmonds_karp(
    vertices: list[str],
    edges: list[Any],
    source: str,
    sink: str
) -> FlowResult:
    """
    Computes maximum flow and minimum cut in a capacity network using Edmonds-Karp (BFS).
    """
    # 1. Build residual network
    residual: dict[str, dict[str, int]] = {v: {} for v in vertices}
    original_edges: set[tuple[str, str]] = set()

    for e in edges:
        if isinstance(e, dict):
            u = e.get("u") or e.get("origen")
            v = e.get("v") or e.get("destino")
            cap = e.get("capacity") if "capacity" in e else e.get("capacidad", 0)
        else:
            u = getattr(e, "source", None) or getattr(e, "origen", None) or getattr(e, "u", None) or e[0]
            v = getattr(e, "target", None) or getattr(e, "destino", None) or getattr(e, "v", None) or e[1]
            cap = getattr(e, "capacity", None) or getattr(e, "capacidad", None) or e[2]

        residual[u][v] = cap
        if v not in residual or u not in residual[v]:
            residual[v][u] = 0
        original_edges.add((u, v))

    def bfs_augmenting_path() -> tuple[list[str], int] | None:
        """Finds an s -> t augmenting path with the fewest edges (BFS)."""
        parent: dict[str, str] = {}
        queue = deque([source])
        visited = {source}

        while queue:
            current = queue.popleft()
            if current == sink:
                break

            for neighbor, residual_cap in residual[current].items():
                if neighbor not in visited and residual_cap > 0:
                    visited.add(neighbor)
                    parent[neighbor] = current
                    queue.append(neighbor)

        if sink not in parent:
            return None

        # Reconstruct path and bottleneck
        path = []
        curr = sink
        bottleneck = float("inf")

        while curr != source:
            p = parent[curr]
            path.append(curr)
            bottleneck = min(bottleneck, residual[p][curr])
            curr = p
        path.append(source)
        path.reverse()

        return path, int(bottleneck)

    total_flow = 0

    # 2. Iterate while augmenting paths exist in residual network
    while True:
        bfs_result = bfs_augmenting_path()
        if not bfs_result:
            break

        path, bottleneck = bfs_result
        total_flow += bottleneck

        for i in range(len(path) - 1):
            u = path[i]
            v = path[i + 1]
            residual[u][v] -= bottleneck
            residual[v][u] += bottleneck

    # 3. Calculate net flow on original edges
    edge_flows: dict[tuple[str, str], int] = {}
    for u, v in original_edges:
        init_cap = residual[u][v] + residual[v][u]
        # In simple directed graph, flow sent = initial capacity - remaining residual
        flow_val = (residual[v][u]) if residual[v][u] <= init_cap else 0
        edge_flows[(u, v)] = flow_val

    # 4. Find Minimum Cut (S, T) via BFS reachability in final residual graph
    reachable_from_s: set[str] = set()
    cut_queue = deque([source])
    reachable_from_s.add(source)

    while cut_queue:
        current = cut_queue.popleft()
        for neighbor, residual_cap in residual[current].items():
            if neighbor not in reachable_from_s and residual_cap > 0:
                reachable_from_s.add(neighbor)
                cut_queue.append(neighbor)

    cut_S = reachable_from_s
    cut_T = set(vertices) - cut_S

    return FlowResult(
        max_flow=total_flow,
        edge_flows=edge_flows,
        min_cut_S=cut_S,
        min_cut_T=cut_T
    )


FlujoResultado = FlowResult

