def bellman_ford(num_vertices: int, edges: list[tuple[int, int, int]], source: int) -> tuple[dict[int, float], bool]:
    """
    edges: list of (u, v, weight).
    Returns (distances, has_negative_cycle).
    """
    distances = {v: float('inf') for v in range(num_vertices)}
    distances[source] = 0.0

    for _ in range(num_vertices - 1):
        updated = False
        for u, v, weight in edges:
            if distances[u] != float('inf') and distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
                updated = True
        if not updated:
            break

    has_neg_cycle = False
    for u, v, weight in edges:
        if distances[u] != float('inf') and distances[u] + weight < distances[v]:
            has_neg_cycle = True
            break

    return distances, has_neg_cycle

