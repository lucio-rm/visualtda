def minimos_cuadrados_segmentados(puntos: list[tuple[float, float]], costo_c: float) -> tuple[float, list[int]]:
    """
    puntos: lista de (x, y) ordenados por x.
    costo_c: penalizacion por cada nuevo segmento.
    Retorna (costo_optimo, particiones).
    """
    n = len(puntos)
    if n == 0:
        return 0.0, []
    
    # Precomputo de errores cuadraticos e[i][j]
    e = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(i, n):
            pts = puntos[i:j+1]
            k = len(pts)
            if k <= 2:
                e[i][j] = 0.0
            else:
                sum_x = sum(p[0] for p in pts)
                sum_y = sum(p[1] for p in pts)
                sum_xy = sum(p[0] * p[1] for p in pts)
                sum_x2 = sum(p[0]**2 for p in pts)
                den = (k * sum_x2 - sum_x**2)
                if abs(den) < 1e-9:
                    a = 0.0
                    b = sum_y / k
                else:
                    a = (k * sum_xy - sum_x * sum_y) / den
                    b = (sum_y - a * sum_x) / k
                e[i][j] = sum((p[1] - (a * p[0] + b))**2 for p in pts)

    # DP
    opt = [0.0] * (n + 1)
    origen = [0] * (n + 1)
    for j in range(1, n + 1):
        min_cost = float('inf')
        best_i = 1
        for i in range(1, j + 1):
            cost = e[i-1][j-1] + costo_c + opt[i-1]
            if cost < min_cost:
                min_cost = cost
                best_i = i
        opt[j] = min_cost
        origen[j] = best_i

    # Reconstruccion
    particiones = []
    curr = n
    while curr > 0:
        particiones.append(curr)
        curr = origen[curr] - 1
    particiones.reverse()
    return opt[n], particiones
