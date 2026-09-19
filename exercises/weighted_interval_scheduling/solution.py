def planificar_intervalos_ponderados(intervalos: list[list[int]]) -> list[list[int]]:
    """
    Dado un conjunto de intervalos donde cada uno es [inicio, fin, peso],
    encuentra un subconjunto mutuamente compatible de intervalos que maximice
    la suma total de sus pesos.

    Complejidad Temporal: O(n log n) mediante ordenamiento + búsqueda binaria para p(j).
    Complejidad Espacial: O(n) para tabla de memoización y arreglo de punteros p(j).

    Retorna la lista de intervalos [inicio, fin, peso] seleccionados.
    """
    if not intervalos:
        return []

    # 1. Ordenar intervalos por tiempo de fin no decreciente
    ordenados = sorted(intervalos, key=lambda x: x[1])
    n = len(ordenados)

    # 2. Calcular p(j) para cada intervalo j (1-indexado):
    # p[j] es el mayor índice i < j tal que fin_i <= inicio_j (0 si no existe)
    p = [0] * (n + 1)
    for j in range(1, n + 1):
        inicio_j = ordenados[j - 1][0]
        bajo, alto = 1, j - 1
        mejor = 0
        while bajo <= alto:
            medio = (bajo + alto) // 2
            if ordenados[medio - 1][1] <= inicio_j:
                mejor = medio
                bajo = medio + 1
            else:
                alto = medio - 1
        p[j] = mejor

    # 3. Llenar tabla de Programación Dinámica
    opt = [0] * (n + 1)
    for j in range(1, n + 1):
        peso_j = ordenados[j - 1][2]
        opt[j] = max(opt[j - 1], peso_j + opt[p[j]])

    # 4. Reconstrucción de la solución óptima
    seleccionados = []
    curr = n
    while curr > 0:
        peso_curr = ordenados[curr - 1][2]
        if peso_curr + opt[p[curr]] >= opt[curr - 1]:
            seleccionados.append(ordenados[curr - 1])
            curr = p[curr]
        else:
            curr -= 1

    seleccionados.reverse()
    return seleccionados
