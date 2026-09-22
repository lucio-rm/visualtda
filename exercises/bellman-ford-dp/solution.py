def bellman_ford(num_vertices: int, aristas: list[tuple[int, int, int]], origen: int) -> tuple[dict[int, float], bool]:
    """
    aristas: lista de (u, v, peso).
    Retorna (distancias, tiene_ciclo_negativo).
    """
    dist = {v: float('inf') for v in range(num_vertices)}
    dist[origen] = 0.0

    for _ in range(num_vertices - 1):
        actualizado = False
        for u, v, peso in aristas:
            if dist[u] != float('inf') and dist[u] + peso < dist[v]:
                dist[v] = dist[u] + peso
                actualizado = True
        if not actualizado:
            break

    tiene_ciclo = False
    for u, v, peso in aristas:
        if dist[u] != float('inf') and dist[u] + peso < dist[v]:
            tiene_ciclo = True
            break

    return dist, tiene_ciclo
