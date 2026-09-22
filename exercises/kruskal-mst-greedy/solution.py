def kruskal_mst(num_vertices: int, aristas: list[tuple[int, int, int]]) -> tuple[int, list[tuple[int, int, int]]]:
    """
    aristas: lista de tuplas (u, v, peso).
    Retorna (costo_total, aristas_mst).
    """
    ordenadas = sorted(aristas, key=lambda x: x[2])
    padre = list(range(num_vertices))
    rango = [0] * num_vertices

    def encontrar(i: int) -> int:
        if padre[i] != i:
            padre[i] = encontrar(padre[i])
        return padre[i]

    def unir(i: int, j: int) -> bool:
        raiz_i = encontrar(i)
        raiz_j = encontrar(j)
        if raiz_i == raiz_j:
            return False
        if rango[raiz_i] < rango[raiz_j]:
            padre[raiz_i] = raiz_j
        elif rango[raiz_i] > rango[raiz_j]:
            padre[raiz_j] = raiz_i
        else:
            padre[raiz_j] = raiz_i
            rango[raiz_i] += 1
        return True

    costo_total = 0
    mst = []
    for u, v, peso in ordenadas:
        if unir(u, v):
            costo_total += peso
            mst.append((u, v, peso))
            if len(mst) == num_vertices - 1:
                break
    return costo_total, mst
