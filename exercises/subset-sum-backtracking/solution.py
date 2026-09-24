"""
Suma de Subconjuntos (Subset Sum con Backtracking y Podas)
Referencia de Cátedra: Algoritmos RW / FIUBA (Guía Backtracking, Ejercicio 11 ★).
"""

from typing import List

def subconjuntos_que_suman(numeros: List[int], objetivo: int) -> List[List[int]]:
    """
    Dado un arreglo de enteros positivos y un entero objetivo S,
    encuentra todos los subconjuntos disjuntos de índices cuya suma sea exactamente S.

    Estrategia de Backtracking con Podas:
      1. Ordenar los números (por ejemplo de mayor a menor) para que los números
         más grandes se evalúen primero, provocando podas por exceso en niveles
         más altos del árbol de recursión.
      2. En cada paso de decisión sobre el elemento numeros[idx]:
         - Rama 1 (Incluir): agregamos numeros[idx] a la solución parcial.
           * Poda por Exceso: si suma_parcial + numeros[idx] > objetivo, no exploramos.
         - Rama 2 (Excluir): omitimos numeros[idx].
           * Poda por Déficit / Cota Superior: si suma_parcial + suma_remanente < objetivo,
             incluso tomando todos los elementos restantes jamás llegaremos a S. Podamos.
      3. Caso Base de Éxito: si suma_parcial == objetivo, guardamos una copia del subconjunto.

    Complejidad:
      - Peor caso teórico: O(2^n).
      - Caso promedio con podas: drásticamente menor a 2^n.
      - Espacio auxiliar: O(n) por la profundidad de la pila de recursión.
    """
    if objetivo <= 0 or not numeros:
        return []

    # Filtrar no positivos o números mayores que el objetivo si los hubiera
    elementos = [x for x in numeros if 0 < x <= objetivo]
    # Ordenar decreciente para podar más rápido
    elementos.sort(reverse=True)

    soluciones: List[List[int]] = []
    subconjunto_actual: List[int] = []
    suma_total_remanente = sum(elementos)

    def backtrack(idx: int, suma_actual: int, remanente: int) -> None:
        # Caso base de éxito: alcanzamos el objetivo exacto
        if suma_actual == objetivo:
            soluciones.append(list(subconjunto_actual))
            return

        # Si llegamos al final del arreglo
        if idx >= len(elementos):
            return

        elem = elementos[idx]
        nuevo_remanente = remanente - elem

        # --- OPCIÓN 1: Incluir elem en el subconjunto ---
        # Poda por exceso: solo incluir si no superamos el objetivo
        if suma_actual + elem <= objetivo:
            subconjunto_actual.append(elem)
            backtrack(idx + 1, suma_actual + elem, nuevo_remanente)
            subconjunto_actual.pop()  # Deshacer cambio (Backtracking)

        # --- OPCIÓN 2: Excluir elem del subconjunto ---
        # Poda por déficit: solo continuar si la suma actual más lo que queda alcanza para S
        if suma_actual + nuevo_remanente >= objetivo:
            backtrack(idx + 1, suma_actual, nuevo_remanente)

    backtrack(0, 0, suma_total_remanente)
    return soluciones
