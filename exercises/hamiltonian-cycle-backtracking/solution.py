def ciclo_hamiltoniano(num_v: int, grafo: dict[int, list[int]]) -> list[int] | None:
    """
    Retorna el camino del ciclo hamiltoniano [v0, v1, ..., vn-1, v0] o None si no existe.
    """
    camino = [0]
    visitados = {0}

    def backtrack(u: int) -> bool:
        if len(camino) == num_v:
            return camino[0] in grafo.get(u, [])
            
        for v in grafo.get(u, []):
            if v not in visitados:
                visitados.add(v)
                camino.append(v)
                if backtrack(v):
                    return True
                camino.pop()
                visitados.remove(v)
        return False

    if backtrack(0):
        return camino + [camino[0]]
    return None
