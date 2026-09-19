def colorear_grafo(grafo: dict[str, list[str]], k: int) -> dict[str, int] | None:
    """
    Determina si existe un k-coloreo válido para el grafo no dirigido.
    Retorna un diccionario {vértice: color} con colores entre 1 y k,
    o None si no es posible colorear el grafo con k colores.
    """
    vertices = list(grafo.keys())
    colores = {}

    def es_seguro(v: str, c: int) -> bool:
        for vecino in grafo.get(v, []):
            if colores.get(vecino) == c:
                return False
        return True

    def backtrack(idx: int) -> bool:
        if idx == len(vertices):
            return True

        v = vertices[idx]
        for c in range(1, k + 1):
            if es_seguro(v, c):
                colores[v] = c
                if backtrack(idx + 1):
                    return True
                del colores[v]  # Backtrack

        return False

    return colores if backtrack(0) else None
