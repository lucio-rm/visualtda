"""
Problema del Cambio de Monedas (Coin Change - Mínima Cantidad de Monedas)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Programación Dinámica, Ejercicio 8 ★★).
"""

from typing import List

def cambio_minimo_monedas(monedas: List[int], objetivo: int) -> List[int]:
    """
    Calcula la lista de monedas que suman exactamente 'objetivo' minimizando la cantidad total.
    Cada denominación en 'monedas' puede utilizarse una cantidad ilimitada de veces.

    Recurrencia de Bellman (Programación Dinámica 1D):
      OPT(v) = 0                                       si v = 0
      OPT(v) = 1 + min { OPT(v - c) : c in monedas, c <= v }  si v > 0

    Reconstrucción:
      Guardamos 'eleccion[v] = c', la moneda que minimizó OPT(v - c).
      Luego reconstruimos retrocediendo desde 'objetivo' hasta 0.

    Complejidad:
      - Tiempo: O(objetivo * |monedas|).
      - Espacio: O(objetivo) para la tabla DP y el arreglo de elecciones.
    """
    if objetivo <= 0 or not monedas:
        return []

    # Filtrar denominaciones válidas positivas
    denominaciones = sorted([c for c in monedas if c > 0])
    if not denominaciones:
        return []

    INF = float('inf')
    dp = [INF] * (objetivo + 1)
    eleccion = [-1] * (objetivo + 1)

    # Caso base
    dp[0] = 0

    # Llenado iterativo de la tabla DP (bottom-up)
    for v in range(1, objetivo + 1):
        for c in denominaciones:
            if c <= v:
                costo_candidato = dp[v - c] + 1
                if costo_candidato < dp[v]:
                    dp[v] = costo_candidato
                    eleccion[v] = c

    # Si no es posible formar el monto
    if dp[objetivo] == INF:
        return []

    # Reconstrucción de la solución óptima
    cambio = []
    curr = objetivo
    while curr > 0:
        c = eleccion[curr]
        if c <= 0:
            break
        cambio.append(c)
        curr -= c

    return cambio
