import heapq

def particionar_intervalos(intervalos: list[tuple[int, int]]) -> int:
    """
    Retorna la minima cantidad de aulas necesarias para programar todos los intervalos.
    """
    if not intervalos:
        return 0
    ordenados = sorted(intervalos, key=lambda x: x[0])
    aulas = []
    for inicio, fin in ordenados:
        if aulas and aulas[0] <= inicio:
            heapq.heappop(aulas)
        heapq.heappush(aulas, fin)
    return len(aulas)
