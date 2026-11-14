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

    def __getitem__(self, key):
        if isinstance(key, str):
            if key in ('name', 'nombre', 'id'):
                return self.name
            if key in ('weight', 'peso'):
                return self.weight
            if key in ('value', 'valor'):
                return self.value
            raise KeyError(key)
        return tuple.__getitem__(self, key)

    def get(self, key, default=None):
        try:
            return self[key]
        except (KeyError, TypeError, IndexError):
            return default


def _extract_weight(item) -> int:
    if isinstance(item, dict):
        w = item.get('weight', item.get('peso', 0))
    else:
        w = getattr(item, 'weight', getattr(item, 'peso', 0))
    return int(w) if w is not None else 0


def _extract_value(item) -> int:
    if isinstance(item, dict):
        v = item.get('value', item.get('valor', 0))
    else:
        v = getattr(item, 'value', getattr(item, 'valor', 0))
    return int(v) if v is not None else 0


def knapsack_dp(items: list, capacity: int) -> tuple[int, list]:
    """
    Solves the 0/1 Knapsack problem using bottom-up Dynamic Programming.
    Gracefully handles both Item namedtuples and dictionary representations.

    Returns:
        tuple[int, list]: (optimal_value, selected_items)
    """
    n = len(items)
    if n == 0 or capacity <= 0:
        return 0, []

    # dp[i][w] stores maximum value considering first i items and capacity w
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    # Bottom-up table construction
    for i in range(1, n + 1):
        item = items[i - 1]
        item_weight = _extract_weight(item)
        item_value = _extract_value(item)

        for w in range(capacity + 1):
            val_without = dp[i - 1][w]
            if item_weight <= w:
                val_with = dp[i - 1][w - item_weight] + item_value
                dp[i][w] = max(val_without, val_with)
            else:
                dp[i][w] = val_without

    # Optimal solution reconstruction
    optimal_value = dp[n][capacity]
    selected_items: list = []
    remaining_capacity = capacity

    for i in range(n, 0, -1):
        if dp[i][remaining_capacity] != dp[i - 1][remaining_capacity]:
            included = items[i - 1]
            selected_items.append(included)
            inc_weight = _extract_weight(included)
            remaining_capacity -= inc_weight

    selected_items.reverse()
    return optimal_value, selected_items


# Backward-compatible entry-point alias
mochila_dp = knapsack_dp
