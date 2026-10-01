def resolver_sudoku(board: list[list[int]]) -> bool:
    """
    Solves Sudoku in-place using MRV (Minimum Remaining Values) backtracking.
    Returns True if a valid solution exists, False otherwise.
    """
    def find_empty_cell():
        min_options = 10
        best_cell = None
        for r in range(9):
            for c in range(9):
                if board[r][c] == 0:
                    options = sum(1 for num in range(1, 10) if is_valid(r, c, num))
                    if options < min_options:
                        min_options = options
                        best_cell = (r, c)
        return best_cell

    def is_valid(r: int, c: int, num: int) -> bool:
        for i in range(9):
            if board[r][i] == num or board[i][c] == num:
                return False
        box_r, box_c = 3 * (r // 3), 3 * (c // 3)
        for i in range(box_r, box_r + 3):
            for j in range(box_c, box_c + 3):
                if board[i][j] == num:
                    return False
        return True

    cell = find_empty_cell()
    if not cell:
        return True
    row, col = cell

    for num in range(1, 10):
        if is_valid(row, col, num):
            board[row][col] = num
            if resolver_sudoku(board):
                return True
            board[row][col] = 0

    return False

# English alias
solve_sudoku = resolver_sudoku
