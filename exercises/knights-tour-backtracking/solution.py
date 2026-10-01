def recorrido_caballo(n: int) -> list[list[int]] | None:
    """
    Retorna tablero n x n con orden de visita [0 .. n^2 - 1] o None.
    """
    board = [[-1] * n for _ in range(n)]
    moves = [(2, 1), (1, 2), (-1, 2), (-2, 1), (-2, -1), (-1, -2), (1, -2), (2, -1)]

    def is_valid(r: int, c: int) -> bool:
        return 0 <= r < n and 0 <= c < n and board[r][c] == -1

    def out_degree(r: int, c: int) -> int:
        return sum(1 for dr, dc in moves if is_valid(r + dr, c + dc))

    def backtrack(r: int, c: int, step: int) -> bool:
        board[r][c] = step
        if step == n * n - 1:
            return True

        candidates = []
        for dr, dc in moves:
            nr, nc = r + dr, c + dc
            if is_valid(nr, nc):
                candidates.append((out_degree(nr, nc), nr, nc))
        candidates.sort(key=lambda item: item[0])

        for _, nr, nc in candidates:
            if backtrack(nr, nc, step + 1):
                return True

        board[r][c] = -1
        return False

    if backtrack(0, 0, 0):
        return board
    return None


knights_tour = recorrido_caballo

