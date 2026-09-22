def mochila_branch_and_bound(capacidad: int, pesos: list[int], valores: list[int]) -> int:
    """
    Retorna el valor optimo entero mediante Branch & Bound.
    """
    n = len(pesos)
    items = sorted(zip(pesos, valores), key=lambda x: x[1]/x[0], reverse=True)
    mejor_valor = [0]

    def cota_superior(idx: int, peso_actual: int, valor_actual: int) -> float:
        if peso_actual > capacidad:
            return 0.0
        cota = valor_actual
        cap_restante = capacidad - peso_actual
        for i in range(idx, n):
            w, v = items[i]
            if w <= cap_restante:
                cap_restante -= w
                cota += v
            else:
                cota += v * (cap_restante / w)
                break
        return cota

    def explorar(idx: int, peso_actual: int, valor_actual: int):
        if peso_actual <= capacidad and valor_actual > mejor_valor[0]:
            mejor_valor[0] = valor_actual
        if idx == n or peso_actual > capacidad:
            return

        if cota_superior(idx, peso_actual, valor_actual) <= mejor_valor[0]:
            return

        w, v = items[idx]
        if peso_actual + w <= capacidad:
            explorar(idx + 1, peso_actual + w, valor_actual + v)
        explorar(idx + 1, peso_actual, valor_actual)

    explorar(0, 0, 0)
    return mejor_valor[0]
