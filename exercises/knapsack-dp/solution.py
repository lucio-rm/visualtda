"""
Problema de la Mochila 0/1 (0/1 Knapsack Problem)
Técnica: Programación Dinámica (Bottom-Up con reconstrucción)

Complejidad Temporal: O(n * W)
Complejidad Espacial: O(n * W) [reconstrucción completa] o O(W) [solo valor óptimo]
"""

from typing import NamedTuple


class Item(NamedTuple):
    name: str
    weight: int
    value: int

    @property
    def nombre(self) -> str:
        return self.name

    @property
    def peso(self) -> int:
        return self.weight

    @property
    def valor(self) -> int:
        return self.value


def knapsack_dp(items: list[Item], capacity: int) -> tuple[int, list[Item]]:
    """
    Solves the 0/1 Knapsack problem using bottom-up Dynamic Programming.

    Returns:
        tuple[int, list[Item]]: (optimal_value, selected_items)
    """
    n = len(items)
    if n == 0 or capacity <= 0:
        return 0, []

    # dp[i][w] stores maximum value considering first i items and capacity w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    # Bottom-up table construction
    for i in range(1, n + 1):
        item = items[i - 1]
        item_weight = getattr(item, 'weight', getattr(item, 'peso', 0))
        item_value = getattr(item, 'value', getattr(item, 'valor', 0))

        for w in range(capacity + 1):
            val_without = dp[i - 1][w]
            if item_weight <= w:
                val_with = dp[i - 1][w - item_weight] + item_value
                dp[i][w] = max(val_without, val_with)
            else:
                dp[i][w] = val_without

    # Optimal solution reconstruction
    optimal_value = dp[n][capacity]
    selected_items: list[Item] = []
    remaining_capacity = capacity

    for i in range(n, 0, -1):
        if dp[i][remaining_capacity] != dp[i - 1][remaining_capacity]:
            included = items[i - 1]
            selected_items.append(included)
            inc_weight = getattr(included, 'weight', getattr(included, 'peso', 0))
            remaining_capacity -= inc_weight

    selected_items.reverse()
    return optimal_value, selected_items


# Backward-compatible entry-point alias
mochila_dp = knapsack_dp
