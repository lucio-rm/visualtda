def recorrido_caballo(n: int) -> list[list[int]] | None:
    """
    Retorna tablero n x n con orden de visita [0 .. n^2 - 1] o None.
    """
    tablero = [[-1] * n for _ in range(n)]
    movimientos = [(2, 1), (1, 2), (-1, 2), (-2, 1), (-2, -1), (-1, -2), (1, -2), (2, -1)]

    def es_valido(r, c):
        return 0 <= r < n and 0 <= c < n and tablero[r][c] == -1

    def grado_salida(r, c):
        return sum(1 for dr, dc in movimientos if es_valido(r + dr, c + dc))

    def backtrack(r: int, c: int, paso: int) -> bool:
        tablero[r][c] = paso
        if paso == n * n - 1:
            return True

        candidatos = []
        for dr, dc in movimientos:
            nr, nc = r + dr, c + dc
            if es_valido(nr, nc):
                candidatos.append((grado_salida(nr, nc), nr, nc))
        candidatos.sort(key=lambda x: x[0])

        for _, nr, nc in candidatos:
            if backtrack(nr, nc, paso + 1):
                return True

        tablero[r][c] = -1
        return False

    if backtrack(0, 0, 0):
        return tablero
    return None
