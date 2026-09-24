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
    nombre: str
    peso: float
    valor: float

    @property
    def densidad(self) -> float:
        return self.valor / self.peso if self.peso > 0 else 0.0


class AsignacionItem(NamedTuple):
    item: Item
    fraccion: float  # Entre 0.0 y 1.0
    peso_tomado: float
    valor_obtenido: float


def mochila_fraccionaria_greedy(items: list[Item], capacidad: float) -> tuple[float, list[AsignacionItem]]:
    """
    Resuelve la mochila fraccionaria seleccionando mediante Greedy por mayor densidad (valor / peso).
    Demostrablemente óptimo mediante argumento de intercambio (Exchange Argument).
    """
    # 1. Ordenar por densidad decreciente
    items_ordenados = sorted(items, key=lambda it: it.densidad, reverse=True)

    valor_total = 0.0
    capacidad_restante = capacidad
    resultado: list[AsignacionItem] = []

    for it in items_ordenados:
        if capacidad_restante <= 0:
            break

        if it.peso <= capacidad_restante:
            # Tomar el item completo (fraccion 1.0)
            resultado.append(AsignacionItem(item=it, fraccion=1.0, peso_tomado=it.peso, valor_obtenido=it.valor))
            valor_total += it.valor
            capacidad_restante -= it.peso
        else:
            # Tomar la fraccion que entra en la capacidad disponible
            fraccion = capacidad_restante / it.peso
            valor_fraccion = it.valor * fraccion
            resultado.append(AsignacionItem(item=it, fraccion=fraccion, peso_tomado=capacidad_restante, valor_obtenido=valor_fraccion))
            valor_total += valor_fraccion
            capacidad_restante = 0.0

    return valor_total, resultado


def contraejemplo_mochila_01() -> dict:
    """
    Demuestra cómo la heurística greedy falla en la mochila 0/1 (donde no se pueden partir ítems).
    """
    # Instancia: Capacidad W = 50
    items = [
        Item(nombre="A", peso=10, valor=60),   # Densidad = 6.0
        Item(nombre="B", peso=20, valor=100),  # Densidad = 5.0
        Item(nombre="C", peso=30, valor=120),  # Densidad = 4.0
    ]
    capacidad = 50

    # Heurística greedy 0/1: ordena por densidad y toma los que entren completos
    # Orden: A (densidad 6.0), B (densidad 5.0), C (densidad 4.0)
    # Toma A (peso 10, valor 60, queda cap 40)
    # Toma B (peso 20, valor 100, queda cap 20)
    # No puede tomar C (peso 30 > 20)
    # Total greedy 0/1: Valor 160, peso 30.

    # Solución óptima 0/1 (Programación Dinámica):
    # Toma B (peso 20) + C (peso 30) = peso 50 <= 50.
    # Total óptimo 0/1: Valor 100 + 120 = 220!
    return {
        "items": items,
        "capacidad": capacidad,
        "greedy_01_seleccion": ["A", "B"],
        "greedy_01_valor": 160,
        "optimo_01_seleccion": ["B", "C"],
        "optimo_01_valor": 220,
        "diferencia": 60,
    }
