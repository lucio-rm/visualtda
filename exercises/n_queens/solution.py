"""
N-Reinas (N-Queens) — Implementación Canónica Educativa
Técnica: Backtracking (Búsqueda sistemática con poda)
Complejidad Temporal: O(N!) en el peor caso
Complejidad Espacial: O(N) para la pila de recursión y estados de columnas/diagonales
"""

from typing import List, Optional


def resolver_n_reinas(n: int) -> List[List[int]]:
    """
    Encuentra todas las soluciones válidas para el problema de las N-Reinas.
    
    Parámetros:
        n (int): Tamaño del tablero (N x N) y número de reinas a colocar.
        
    Retorna:
        List[List[int]]: Lista de tableros válidos. Cada tablero se representa como
                         una lista de enteros donde board[fila] = columna.
    """
    if n <= 0:
        return []

    soluciones: List[List[int]] = []
    tablero_actual: List[int] = [-1] * n

    # Conjuntos para verificación de conflictos en O(1)
    columnas_ocupadas = set()
    diagonales_principales = set()  # fila - col es constante
    diagonales_secundarias = set()  # fila + col es constante

    def backtrack(fila: int) -> None:
        # Caso base: si alcanzamos la fila N, hemos ubicado todas las reinas con éxito
        if fila == n:
            soluciones.append(list(tablero_actual))
            return

        # Explorar cada columna candidata para la fila actual
        for col in range(n):
            diag_prin = fila - col
            diag_sec = fila + col

            # Poda (Pruning): verificar si la posición actual genera conflicto
            if (col in columnas_ocupadas or
                diag_prin in diagonales_principales or
                diag_sec in diagonales_secundarias):
                continue  # Conflicto detectado: podar rama del árbol de búsqueda

            # Tomar decisión: colocar reina
            tablero_actual[fila] = col
            columnas_ocupadas.add(col)
            diagonales_principales.add(diag_prin)
            diagonales_secundarias.add(diag_sec)

            # Llamada recursiva: avanzar al siguiente subproblema (siguiente fila)
            backtrack(fila + 1)

            # Deshacer decisión (Backtracking): restaurar el estado para explorar otras columnas
            tablero_actual[fila] = -1
            columnas_ocupadas.remove(col)
            diagonales_principales.remove(diag_prin)
            diagonales_secundarias.remove(diag_sec)

    backtrack(0)
    return soluciones


def primera_solucion_n_reinas(n: int) -> Optional[List[int]]:
    """
    Retorna la primera solución válida encontrada, o None si no existe solución (ej. N=2 o N=3).
    """
    soluciones = resolver_n_reinas(n)
    return soluciones[0] if soluciones else None


if __name__ == "__main__":
    n = 4
    soluciones = resolver_n_reinas(n)
    print(f"Soluciones para N={n}: {len(soluciones)}")
    for i, sol in enumerate(soluciones, 1):
        print(f"Solución {i}: {sol}")
