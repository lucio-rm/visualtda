def hamiltonian_cycle(num_v: int, graph: dict[int, list[int]]) -> list[int] | None:
    """
    Returns the vertex sequence of a Hamiltonian cycle [v0, v1, ..., vn-1, v0] or None if none exists.
    """
    path = [0]
    visited = {0}

    def backtrack(u: int) -> bool:
        if len(path) == num_v:
            return path[0] in graph.get(u, [])

        for v in graph.get(u, []):
            if v not in visited:
                visited.add(v)
                path.append(v)
                if backtrack(v):
                    return True
                path.pop()
                visited.remove(v)
        return False

    if backtrack(0):
        return path + [path[0]]
    return None


# Backward-compatible entry-point alias
ciclo_hamiltoniano = hamiltonian_cycle
