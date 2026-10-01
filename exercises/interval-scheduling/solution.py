"""
Selección de Intervalos (Interval Scheduling) — Implementación Canónica Educativa
Técnica: Algoritmo Greedy (Selección greedy por tiempo de fin más temprano)
Complejidad Temporal: O(N log N) por el ordenamiento inicial
Complejidad Espacial: O(N) para la lista de intervalos seleccionados
"""

from typing import List, Tuple, NamedTuple


class Interval(NamedTuple):
    id: str
    start: int
    end: int


Intervalo = Interval


def interval_scheduling(intervals: List[Tuple[int, int]]) -> List[Tuple[int, int]]:
    """
    Selects the maximum subset of mutually compatible (non-overlapping) intervals.
    
    Greedy Strategy:
        Sort intervals by earliest finish time (EFT).
        In each step, select the first interval whose start time
        is greater than or equal to the finish time of the last selected interval.
    """
    if not intervals:
        return []

    # 1. Sort by finish time in ascending order (EFT)
    sorted_intervals = sorted(intervals, key=lambda x: x[1])

    selected: List[Tuple[int, int]] = []
    last_finish_time = -float('inf')

    # 2. Linear greedy pass
    for start, end in sorted_intervals:
        if start >= last_finish_time:
            selected.append((start, end))
            last_finish_time = end

    return selected


# Backward-compatible entry-point alias
seleccion_intervalos = interval_scheduling
