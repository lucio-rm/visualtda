"""
Selección de Intervalos (Interval Scheduling) — Implementación Canónica Educativa
Técnica: Algoritmo Greedy (Selección greedy por tiempo de fin más temprano)
Complejidad Temporal: O(N log N) por el ordenamiento inicial
Complejidad Espacial: O(N) para la lista de intervalos seleccionados
"""

from typing import List, Tuple, NamedTuple


class Intervalo(NamedTuple):
    id: str
    inicio: int
    fin: int


def seleccion_intervalos(intervalos: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    """
    Selecciona el subconjunto máximo de intervalos compatibles (mutuamente disjuntos).
    
    Estrategia Greedy:
        Ordenar los intervalos por su tiempo de fin en forma creciente.
        En cada paso, seleccionar el primer intervalo cuyo tiempo de inicio
        sea mayor o igual al tiempo de fin del último intervalo seleccionado.
        
    Parámetros:
        intervalos: Lista de tuplas (inicio, fin) con inicio < fin.
        
    Retorna:
        Lista de tuplas (inicio, fin) correspondientes a la solución óptima.
    """
    if not intervalos:
        return []

    # 1. Ordenar por tiempo de finalización (earliest finish time)
    ordenados = sorted(intervalos, key=lambda x: x[1])

    seleccionados: List[Tuple[int, int]] = []
    ultimo_fin = -float("inf")

    # 2. Selección greedy (Greedy choice)
    for inicio, fin in ordenados:
        if inicio >= ultimo_fin:
            seleccionados.append((inicio, fin))
            ultimo_fin = fin

    return seleccionados


if __name__ == "__main__":
    ejemplo = [(0, 3), (1, 5), (3, 6), (4, 8), (6, 9), (7, 10)]
    optimo = seleccion_intervalos(ejemplo)
    print(f"Intervalos compatibles máximos seleccionados ({len(optimo)}): {optimo}")
