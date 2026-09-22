def resolver_sudoku(tablero: list[list[int]]) -> bool:
    """
    Modifica el tablero in-place resolviendo el Sudoku. Retorna True si tiene solucion.
    """
    def encontrar_vacia():
        min_opciones = 10
        mejor_celda = None
        for r in range(9):
            for c in range(9):
                if tablero[r][c] == 0:
                    opciones = sum(1 for num in range(1, 10) if es_valido(r, c, num))
                    if opciones < min_opciones:
                        min_opciones = opciones
                        mejor_celda = (r, c)
        return mejor_celda

    def es_valido(r, c, num):
        for i in range(9):
            if tablero[r][i] == num or tablero[i][c] == num:
                return False
        br, bc = 3 * (r // 3), 3 * (c // 3)
        for i in range(br, br + 3):
            for j in range(bc, bc + 3):
                if tablero[i][j] == num:
                    return False
        return True

    celda = encontrar_vacia()
    if not celda:
        return True
    r, c = celda

    for num in range(1, 10):
        if es_valido(r, c, num):
            tablero[r][c] = num
            if resolver_sudoku(tablero):
                return True
            tablero[r][c] = 0

    return False
