import heapq

def dijkstra(grafo: dict[str, list[tuple[str, int]]], origen: str) -> dict[str, int]:
    """
    grafo: diccionario adyacencia {nodo: [(vecino, peso), ...]}.
    Retorna diccionario de distancias minimas {nodo: dist}.
    """
    distancias = {nodo: float('inf') for nodo in grafo}
    distancias[origen] = 0
    cola = [(0, origen)]
    while cola:
        dist_u, u = heapq.heappop(cola)
        if dist_u > distancias[u]:
            continue
        for v, peso in grafo.get(u, []):
            nueva_dist = dist_u + peso
            if nueva_dist < distancias[v]:
                distancias[v] = nueva_dist
                heapq.heappush(cola, (nueva_dist, v))
    return distancias
