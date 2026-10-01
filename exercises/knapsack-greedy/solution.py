"""
Problema de la Mochila Fraccionaria y Heurística Greedy (Greedy)
Técnica: Algoritmos Greedy (Greedy)

Para la Mochila Fraccionaria:
  El algoritmo greedy ordenando por densidad de valor (valor / peso) es ESTRICTAMENTE ÓPTIMO.
  Complejidad: O(n log n) por el ordenamiento.

Para la Mochila 0/1:
  La heurística greedy NO garantiza la solución óptima (contraejemplo clásico).
"""

from typing import NamedTuple


class Item(NamedTuple):
    name: str
    weight: float
    value: float

    @property
    def density(self) -> float:
        return self.value / self.weight if self.weight > 0 else 0.0

    # Compatibility aliases
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


class ItemAssignment(NamedTuple):
    item: Item
    fraction: float  # Between 0.0 and 1.0
    weight_taken: float
    value_obtained: float


AsignacionItem = ItemAssignment


def mochila_fraccionaria_greedy(items: list[Item], capacity: float) -> tuple[float, list[ItemAssignment]]:
    """
    Resuelve la mochila fraccionaria seleccionando mediante Greedy por mayor densidad (valor / peso).
    Demostrablemente óptimo mediante argumento de intercambio (Exchange Argument).
    """
    # 1. Sort by descending density
    sorted_items = sorted(items, key=lambda it: it.density, reverse=True)

    total_value = 0.0
    remaining_capacity = capacity
    result: list[ItemAssignment] = []

    for it in sorted_items:
        if remaining_capacity <= 0:
            break

        if it.weight <= remaining_capacity:
            # Take whole item (fraction 1.0)
            result.append(ItemAssignment(item=it, fraction=1.0, weight_taken=it.weight, value_obtained=it.value))
            total_value += it.value
            remaining_capacity -= it.weight
        else:
            # Take fraction that fits into available capacity
            fraction = remaining_capacity / it.weight
            fraction_value = it.value * fraction
            result.append(ItemAssignment(item=it, fraction=fraction, weight_taken=remaining_capacity, value_obtained=fraction_value))
            total_value += fraction_value
            remaining_capacity = 0.0

    return total_value, result


def contraejemplo_mochila_01() -> dict:
    """
    Demuestra cómo la heurística greedy falla en la mochila 0/1 (donde no se pueden partir ítems).
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


fractional_knapsack_greedy = mochila_fraccionaria_greedy
counterexample_knapsack_01 = contraejemplo_mochila_01

