"""
Antenas en una Ruta (Problema de Cobertura de Puntos con Intervalos)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Greedy, Ejercicio 13 ★★).
Kleinberg & Tardos, Capítulo 4.2.
"""

from typing import List

def construir_antenas(casas: List[float], radio: float) -> List[float]:
    """
    Calcula la posición de las antenas sobre una ruta recta de forma que todas
    las casas queden cubiertas con la mínima cantidad posible de antenas.

    Estrategia Greedy (Greedy Stays Ahead):
      1. Ordenar las casas por kilómetro ascendente.
      2. Tomar la primera casa aún no cubierta en x_i.
      3. Colocar la antena lo más adelante posible sin dejar desprotegida a x_i:
         posicion = x_i + radio.
      4. Saltear todas las casas cubiertas por esta antena (casas <= posicion + radio).
      5. Repetir hasta cubrir todas las casas.

    Complejidad:
      - Tiempo: O(n log n) por el ordenamiento inicial + O(n) de escaneo lineal = O(n log n).
      - Espacio: O(k) para almacenar la lista de k antenas devueltas.
    """
    if not casas:
        return []
    if radio <= 0:
        raise ValueError("El radio de cobertura debe ser estrictamente positivo.")

    # 1. Ordenar casas de izquierda a derecha
    casas_ordenadas = sorted(casas)
    antenas = []
    i = 0
    n = len(casas_ordenadas)

    while i < n:
        # Primera casa sin cobertura
        casa_sin_cobertura = casas_ordenadas[i]

        # Elección Greedy: colocar la antena lo más a la derecha posible
        posicion_antena = casa_sin_cobertura + radio
        antenas.append(posicion_antena)

        # Límite superior de cobertura de esta antena
        cobertura_max = posicion_antena + radio

        # Avanzar el puntero saltando todas las casas que quedaron dentro del radio
        while i < n and casas_ordenadas[i] <= cobertura_max:
            i += 1

    return antenas
