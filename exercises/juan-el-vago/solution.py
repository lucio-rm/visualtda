"""
Problema de Juan el Vago (Programación Dinámica 1D con Reconstrucción)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Programación Dinámica, Ej. 4).
Equivalente formal: Maximum Weight Independent Set on Path Graphs / House Robber.
"""

from typing import List, Tuple

def lazy_juan(profits: List[int]) -> Tuple[int, List[int]]:
    """
    Determines via dynamic programming the maximum profit for Juan
    knowing he will never accept working two consecutive days.
    
    Returns a tuple (max_profit, worked_days) where worked_days
    is the list of indices (0-indexed) of days Juan should work.
    
    Time Complexity: O(n)
    Space Complexity: O(n) for reconstruction (or O(1) for profit only).
    """
    n = len(profits)
    if n == 0:
        return 0, []
    if n == 1:
        return profits[0], [0]
    if n == 2:
        if profits[0] >= profits[1]:
            return profits[0], [0]
        else:
            return profits[1], [1]

    # dp[i] stores maximum accumulable profit considering up to day i inclusive
    dp = [0] * n
    dp[0] = profits[0]
    dp[1] = max(profits[0], profits[1])

    # Bellman recurrence: dp[i] = max(dp[i - 1], dp[i - 2] + profits[i])
    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + profits[i])

    # Backward reconstruction of optimal days
    days = []
    i = n - 1
    while i >= 0:
        if i == 0:
            days.append(0)
            break
        elif i == 1:
            if dp[1] == profits[1]:
                days.append(1)
            else:
                days.append(0)
            break
        else:
            if dp[i] == dp[i - 1]:
                i -= 1
            else:
                days.append(i)
                i -= 2

    days.reverse()
    return dp[n - 1], days


# Backward-compatible entry-point alias
juan_el_vago = lazy_juan
