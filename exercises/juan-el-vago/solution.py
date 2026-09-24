"""
Problema de Juan el Vago (Programación Dinámica 1D con Reconstrucción)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Programación Dinámica, Ej. 4).
Equivalente formal: Maximum Weight Independent Set on Path Graphs / House Robber.
"""

from typing import List, Tuple

def juan_el_vago(ganancias: List[int]) -> Tuple[int, List[int]]:
    """
    Determina por programación dinámica el máximo monto a ganar por Juan
    sabiendo que nunca aceptará trabajar dos días consecutivos.
    
    Retorna una tupla con (monto_maximo, dias_trabajados) donde dias_trabajados
    es la lista de índices (0-indexed) de los días en que Juan debe trabajar.
    
    Complejidad Temporal: O(n)
    Complejidad Espacial: O(n) para reconstrucción (u O(1) si solo se calcula el monto).
    """
    n = len(ganancias)
    if n == 0:
        return 0, []
    if n == 1:
        return ganancias[0], [0]
    if n == 2:
        if ganancias[0] >= ganancias[1]:
            return ganancias[0], [0]
        else:
            return ganancias[1], [1]

    # dp[i] almacena la máxima ganancia acumulable considerando hasta el día i inclusive
    dp = [0] * n
    dp[0] = ganancias[0]
    dp[1] = max(ganancias[0], ganancias[1])

    # Ecuación de Bellman / Recurrencia:
    # dp[i] = max(dp[i - 1], dp[i - 2] + ganancias[i])
    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + ganancias[i])

    # Reconstrucción de la solución óptima recorriendo hacia atrás
    dias = []
    i = n - 1
    while i >= 0:
        if i == 0:
            dias.append(0)
            break
        elif i == 1:
            if dp[1] == ganancias[1]:
                dias.append(1)
            else:
                dias.append(0)
            break
        else:
            # Si dp[i] proviene de no trabajar el día i, es igual a dp[i - 1]
            if dp[i] == dp[i - 1]:
                i -= 1
            else:
                # Si dp[i] proviene de trabajar el día i, sumó ganancias[i] + dp[i - 2]
                dias.append(i)
                i -= 2

    dias.reverse()
    return dp[n - 1], dias
