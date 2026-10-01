def color_graph(graph: dict[str, list[str]], k: int) -> dict[str, int] | None:
    """
    Determines whether a valid k-coloring exists for the undirected graph.
    Returns a dictionary {vertex: color} with colors between 1 and k,
    or None if the graph cannot be colored with k colors.
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


# Backward-compatible entry-point alias
colorear_grafo = color_graph
