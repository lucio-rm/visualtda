"""
Problema de la Mochila 0/1 (0/1 Knapsack Problem)
Técnica: Programación Dinámica (Bottom-Up con reconstrucción)

Complejidad Temporal: O(n * W)
Complejidad Espacial: O(n * W) [reconstrucción completa] o O(W) [solo valor óptimo]
"""

from typing import NamedTuple


class Item(NamedTuple):
    nombre: str
    peso: int
    valor: int


def mochila_dp(items: list[Item], capacidad: int) -> tuple[int, list[Item]]:
    """
    Resuelve el problema de la mochila 0/1 utilizando programación dinámica bottom-up.

    Retorna:
        tuple[int, list[Item]]: (valor_maximo, items_seleccionados)
    """
    n = len(items)
    if n == 0 or capacidad <= 0:
        return 0, []

    # dp[i][w] almacena el valor maximo considerando los primeros i items y capacidad w
    dp = [[0] * (capacidad + 1) for _ in range(n + 1)]

    # Construccion de la tabla bottom-up
    for i in range(1, n + 1):
        item = items[i - 1]
        for w in range(capacidad + 1):
            # Opcion 1: Excluir el item actual
            valor_sin_item = dp[i - 1][w]

            # Opcion 2: Incluir el item actual (si entra en la capacidad w)
            if item.peso <= w:
                valor_con_item = dp[i - 1][w - item.peso] + item.valor
                dp[i][w] = max(valor_sin_item, valor_con_item)
            else:
                dp[i][w] = valor_sin_item

    # Reconstruccion de la solucion optima desde dp[n][capacidad]
    valor_optimo = dp[n][capacidad]
    seleccionados: list[Item] = []
    w_restante = capacidad

    for i in range(n, 0, -1):
        # Si el valor difiere del de la fila anterior, el item i fue incluido
        if dp[i][w_restante] != dp[i - 1][w_restante]:
            item_incluido = items[i - 1]
            seleccionados.append(item_incluido)
            w_restante -= item_incluido.peso

    # Los items fueron recuperados de atras hacia adelante
    seleccionados.reverse()

    return valor_optimo, seleccionados


if __name__ == "__main__":
    # Instancia de prueba clasica
    elementos = [
        Item(nombre="Guitarra", peso=1, valor=1500),
        Item(nombre="Stereo", peso=4, valor=3000),
        Item(nombre="Laptop", peso=3, valor=2000),
        Item(nombre="Celular", peso=1, valor=2000),
    ]
    capacidad_mochila = 4

    val_max, seleccion = mochila_dp(elementos, capacidad_mochila)
    peso_total = sum(it.peso for it in seleccion)

    print(f"Capacidad Mochila: {capacidad_mochila}")
    print(f"Valor Optimo: ${val_max}")
    print(f"Peso Utilizado: {peso_total}/{capacidad_mochila}")
    print("Items Seleccionados:")
    for it in seleccion:
        print(f"  - {it.nombre}: peso={it.peso}, valor=${it.valor}")

    assert val_max == 4000  # Laptop ($2000, 3kg) + Celular ($2000, 1kg) o Guitarra + Celular... wait
    # Laptop (3kg, 2000) + Celular (1kg, 2000) = 4kg, 4000
    # Stereo (4kg, 3000) = 3000
    # Guitarra (1kg, 1500) + Celular (1kg, 2000) = 2kg, 3500
    assert peso_total <= capacidad_mochila
    print("Prueba superada exitosamente.")
