import heapq


def dijkstra(graph: dict[str, list[tuple[str, int]]], source: str) -> dict[str, int]:
    """
    graph: adjacency dictionary {node: [(neighbor, weight), ...]}.
    Returns dictionary of shortest distances {node: dist}.
    """
    distances = {node: float('inf') for node in graph}
    distances[source] = 0
    min_heap = [(0, source)]
    while min_heap:
        dist_u, u = heapq.heappop(min_heap)
        if dist_u > distances[u]:
            continue
        for v, weight in graph.get(u, []):
            new_dist = dist_u + weight
            if new_dist < distances[v]:
                distances[v] = new_dist
                heapq.heappush(min_heap, (new_dist, v))
    return distances

