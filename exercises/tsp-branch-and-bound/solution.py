def tsp_branch_and_bound(distancias: list[list[int]]) -> int:
    """
    distancias: matriz n x n simetrica de costos.
    Retorna el costo del tour optimo.
    """
    n = len(distancias)
    if n <= 1:
        return 0
    mejor_costo = [float('inf')]

    def cota_inferior(actual: int, visitados: set[int], costo_actual: int) -> float:
        restantes = [i for i in range(n) if i not in visitados]
        if not restantes:
            return costo_actual + distancias[actual][0]
        min_saliente = min(distancias[actual][r] for r in restantes)
        min_retorno = min(distancias[r][0] for r in restantes)
        return costo_actual + min_saliente + min_retorno

    def explorar(u: int, visitados: set[int], costo_actual: int):
        if len(visitados) == n:
            costo_total = costo_actual + distancias[u][0]
            if costo_total < mejor_costo[0]:
                mejor_costo[0] = costo_total
            return

        if cota_inferior(u, visitados, costo_actual) >= mejor_costo[0]:
            return

        restantes = [v for v in range(n) if v not in visitados]
        restantes.sort(key=lambda v: distancias[u][v])

        for v in restantes:
            visitados.add(v)
            explorar(v, visitados, costo_actual + distancias[u][v])
            visitados.remove(v)

    explorar(0, {0}, 0)
    return mejor_costo[0]
