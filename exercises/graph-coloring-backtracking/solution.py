def colorear_grafo(graph: dict[str, list[str]], k: int) -> dict[str, int] | None:
    """
    Determina si existe un k-coloreo válido para el grafo no dirigido.
    Retorna un diccionario {vértice: color} con colores entre 1 y k,
    o None si no es posible colorear el grafo con k colores.
    """
    vertices = list(graph.keys())
    colors: dict[str, int] = {}

    def is_safe(v: str, c: int) -> bool:
        for neighbor in graph.get(v, []):
            if colors.get(neighbor) == c:
                return False
        return True

    def backtrack(idx: int) -> bool:
        if idx == len(vertices):
            return True

        v = vertices[idx]
        for c in range(1, k + 1):
            if is_safe(v, c):
                colors[v] = c
                if backtrack(idx + 1):
                    return True
                del colors[v]  # Backtrack

        return False

    return colors if backtrack(0) else None


color_graph = colorear_grafo

