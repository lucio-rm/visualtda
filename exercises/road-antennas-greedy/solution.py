"""
Antenas en una Ruta (Problema de Cobertura de Puntos con Intervalos)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Greedy, Ejercicio 13 ★★).
Kleinberg & Tardos, Capítulo 4.2.
"""

from typing import List

def place_antennas(houses: List[float], radius: float) -> List[float]:
    """
    Computes optimal antenna positions along a straight road to cover all houses
    with the minimum possible number of antennas.

    Greedy Strategy (Greedy Stays Ahead):
      1. Sort houses by coordinate in ascending order.
      2. Take the first uncovered house at x_i.
      3. Place antenna as far right as possible while still covering x_i:
         position = x_i + radius.
      4. Skip all houses covered by this antenna (houses <= position + radius).
      5. Repeat until all houses are covered.

    Complexity:
      - Time: O(n log n) due to initial sort + O(n) scan = O(n log n).
      - Space: O(k) for output antenna positions.
    """
    if not houses:
        return []
    if radius <= 0:
        raise ValueError("Coverage radius must be strictly positive.")

    # 1. Sort houses left to right
    sorted_houses = sorted(houses)
    antennas = []
    i = 0
    n = len(sorted_houses)

    while i < n:
        # First uncovered house
        uncovered_house = sorted_houses[i]

        # Greedy choice: place antenna as far right as permitted
        antenna_pos = uncovered_house + radius
        antennas.append(antenna_pos)

        # Upper bound of this antenna's coverage
        coverage_limit = antenna_pos + radius

        # Advance pointer past all houses covered by this antenna
        while i < n and sorted_houses[i] <= coverage_limit:
            i += 1

    return antennas


# Backward-compatible entry-point alias
construir_antenas = place_antennas
