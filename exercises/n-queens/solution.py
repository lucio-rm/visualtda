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
                         una lista de enteros donde board[row] = col.
    """
    if n <= 0:
        return []

    solutions: List[List[int]] = []
    current_board: List[int] = [-1] * n

    # Sets for O(1) conflict check
    occupied_cols = set()
    main_diagonals = set()  # row - col is constant
    anti_diagonals = set()  # row + col is constant

    def backtrack(row: int) -> None:
        # Base case: if we reached row n, all queens are placed successfully
        if row == n:
            solutions.append(list(current_board))
            return

        # Explore candidate columns for the current row
        for col in range(n):
            diag_main = row - col
            diag_anti = row + col

            # Pruning: verify if current position causes conflict
            if (col in occupied_cols or
                diag_main in main_diagonals or
                diag_anti in anti_diagonals):
                continue

            # Place queen
            current_board[row] = col
            occupied_cols.add(col)
            main_diagonals.add(diag_main)
            anti_diagonals.add(diag_anti)

            # Recurse
            backtrack(row + 1)

            # Backtrack
            current_board[row] = -1
            occupied_cols.remove(col)
            main_diagonals.remove(diag_main)
            anti_diagonals.remove(diag_anti)

    backtrack(0)
    return solutions


def primera_solucion_n_reinas(n: int) -> Optional[List[int]]:
    """
    Retorna la primera solución válida encontrada, o None si no existe solución (ej. N=2 o N=3).
    """
    solutions = resolver_n_reinas(n)
    return solutions[0] if solutions else None


solve_n_queens = resolver_n_reinas
first_n_queens_solution = primera_solucion_n_reinas

