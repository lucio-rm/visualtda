def minimizar_retraso_maximo(tareas: list[tuple[int, int]]) -> int:
    """
    tareas: lista de tuplas (duracion t_i, deadline d_i).
    Retorna el retraso maximo alcanzado.
    """
    ordenadas = sorted(tareas, key=lambda x: x[1])
    tiempo_actual = 0
    retraso_max = 0
    for t_i, d_i in ordenadas:
        tiempo_actual += t_i
        retraso = max(0, tiempo_actual - d_i)
        retraso_max = max(retraso_max, retraso)
    return retraso_max
