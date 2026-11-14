"""
Mochila Fraccionaria (Fractional Knapsack) — Implementación Canónica Educativa
Técnica: Algoritmo Greedy (Selección greedy por densidad de valor v_i / w_i)
Complejidad Temporal: O(N log N) por el ordenamiento inicial de ítems
Complejidad Espacial: O(N) para la lista de asignaciones fraccionarias resultantes

Nota Pedagógica Fundamental (Diferencia con Mochila 0/1):
- En Mochila Fraccionaria: la estrategia Greedy por densidad es ÓPTIMA (demostrable por exchange argument).
- En Mochila 0/1: La heurística greedy NO garantiza la solución óptima (contraejemplo clásico).
  Requiere Programación Dinámica O(N * W).
"""

from typing import NamedTuple


class Item(NamedTuple):
    name: str
    weight: float
    value: float

    @property
    def density(self) -> float:
        if self.weight <= 0:
            return 0.0
        return self.value / self.weight

    @property
    def nombre(self) -> str:
        return self.name

    @property
    def peso(self) -> float:
        return self.weight

    @property
    def valor(self) -> float:
        return self.value

    @property
    def densidad(self) -> float:
        return self.density

    def __getitem__(self, key):
        if isinstance(key, str):
            if key in ('name', 'nombre', 'id'):
                return self.name
            if key in ('weight', 'peso'):
                return self.weight
            if key in ('value', 'valor'):
                return self.value
            if key in ('density', 'densidad'):
                return self.density
            raise KeyError(key)
        return tuple.__getitem__(self, key)

    def get(self, key, default=None):
        try:
            return self[key]
        except (KeyError, TypeError, IndexError):
            return default


def _extract_item_weight(it) -> float:
    if isinstance(it, dict):
        w = it.get('weight', it.get('peso', 0.0))
    else:
        w = getattr(it, 'weight', getattr(it, 'peso', 0.0))
    return float(w) if w is not None else 0.0


def _extract_item_value(it) -> float:
    if isinstance(it, dict):
        v = it.get('value', it.get('valor', 0.0))
    else:
        v = getattr(it, 'value', getattr(it, 'valor', 0.0))
    return float(v) if v is not None else 0.0


def _extract_item_density(it) -> float:
    if isinstance(it, dict):
        if 'density' in it:
            return float(it['density'])
        if 'densidad' in it:
            return float(it['densidad'])
    else:
        if hasattr(it, 'density'):
            return float(it.density)
        if hasattr(it, 'densidad'):
            return float(it.densidad)
    weight = _extract_item_weight(it)
    if weight <= 0:
        return 0.0
    return _extract_item_value(it) / weight


class ItemAssignment(NamedTuple):
    item: object  # Item or dict
    fraction: float  # Between 0.0 and 1.0
    weight_taken: float
    value_obtained: float


AsignacionItem = ItemAssignment


def fractional_knapsack_greedy(items: list, capacity: float) -> tuple[float, list[ItemAssignment]]:
    """
    Solves Fractional Knapsack using Greedy density ordering (value / weight).
    Supports both Item objects and Python dict items gracefully.
    Provably optimal via the exchange argument.
    """
    # 1. Sort by descending density
    sorted_items = sorted(items, key=_extract_item_density, reverse=True)

    total_value = 0.0
    remaining_capacity = float(capacity)
    result: list[ItemAssignment] = []

    for it in sorted_items:
        if remaining_capacity <= 0:
            break

        weight = _extract_item_weight(it)
        value = _extract_item_value(it)

        if weight <= remaining_capacity:
            # Take whole item (fraction 1.0)
            result.append(ItemAssignment(item=it, fraction=1.0, weight_taken=weight, value_obtained=value))
            total_value += value
            remaining_capacity -= weight
        else:
            # Take fraction that fits into available capacity
            fraction = remaining_capacity / weight if weight > 0 else 0.0
            fraction_value = value * fraction
            result.append(ItemAssignment(item=it, fraction=fraction, weight_taken=remaining_capacity, value_obtained=fraction_value))
            total_value += fraction_value
            remaining_capacity = 0.0

    return total_value, result


def counterexample_knapsack_01() -> dict:
    """
    Demonstrates how the greedy density heuristic fails in 0/1 knapsack where items are indivisible.
    """
    # Instance: Capacity W = 50
    items = [
        Item(name="A", weight=10, value=60),   # Density = 6.0
        Item(name="B", weight=20, value=100),  # Density = 5.0
        Item(name="C", weight=30, value=120),  # Density = 4.0
    ]
    capacity = 50

    return {
        "items": items,
        "capacity": capacity,
        "capacidad": capacity,
        "greedy_01_selection": ["A", "B"],
        "greedy_01_value": 160,
        "optimal_01_selection": ["B", "C"],
        "optimal_01_value": 220,
        "difference": 60,
    }


# Backward-compatible entry-point aliases
mochila_fraccionaria = fractional_knapsack_greedy
mochila_fraccionaria_greedy = fractional_knapsack_greedy
contraejemplo_mochila_01 = counterexample_knapsack_01
