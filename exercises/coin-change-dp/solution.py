"""
Problema del Cambio de Monedas (Coin Change - Mínima Cantidad de Monedas)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Programación Dinámica, Ejercicio 8 ★★).
"""

from typing import List

def coin_change_min(coins: List[int], target: int) -> List[int]:
    """
    Calculates the list of coins that sum to exactly 'target' minimizing total coin count.
    Each denomination in 'coins' can be used an unlimited number of times.

    Bellman Recurrence (1D Dynamic Programming):
      OPT(v) = 0                                       if v = 0
      OPT(v) = 1 + min { OPT(v - c) : c in coins, c <= v }  if v > 0

    Reconstruction:
      Store choice[v] = c, the coin denomination achieving minimum at subproblem v.
      Then reconstruct optimal combination backwards from target to 0.

    Complexity:
      - Time: O(target * |coins|).
      - Space: O(target) for DP table and choice array.
    """
    if target <= 0 or not coins:
        return []

    # Filter valid positive denominations
    denominations = sorted([c for c in coins if c > 0])
    if not denominations:
        return []

    INF = float('inf')
    dp = [INF] * (target + 1)
    choice = [-1] * (target + 1)

    # Base case
    dp[0] = 0

    # Iterative bottom-up DP table filling
    for v in range(1, target + 1):
        for c in denominations:
            if c <= v:
                cand = dp[v - c] + 1
                if cand < dp[v]:
                    dp[v] = cand
                    choice[v] = c

    # Target not reachable
    if dp[target] == INF:
        return []

    # Backward reconstruction
    change = []
    curr = target
    while curr > 0:
        c = choice[curr]
        if c <= 0:
            break
        change.append(c)
        curr -= c

    return change


# Backward-compatible entry-point aliases
cambio_minimo_monedas = coin_change_min
cambio_monedas_minimo = coin_change_min
