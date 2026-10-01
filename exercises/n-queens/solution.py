"""
N-Reinas (N-Queens) — Educational Canonical Implementation
Technique: Backtracking (Systematic search with branch pruning)
Time Complexity: O(N!) in worst-case
Space Complexity: O(N) for recursion stack and diagonal/column bitsets
"""

from typing import List, Optional


def solve_n_queens(n: int) -> List[List[int]]:
    """
    Finds all valid non-attacking queen configurations on an N x N chessboard.

    Parameters:
        n (int): Board dimension (N x N) and number of queens to place.

    Returns:
        List[List[int]]: List of valid solutions, where each board is represented
                         as a list of integers with board[row] = col.
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


def first_n_queens_solution(n: int) -> Optional[List[int]]:
    """
    Returns the first valid solution found, or None if no solution exists (e.g. N=2 or N=3).
    """
    solutions = solve_n_queens(n)
    return solutions[0] if solutions else None


# Backward-compatible entry-point aliases
resolver_n_reinas = solve_n_queens
primera_solucion_n_reinas = first_n_queens_solution
