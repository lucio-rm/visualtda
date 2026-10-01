def elemento_mayoritario(arr: list[int]) -> int | None:
    """
    Encuentra el elemento mayoritario (> n/2 apariciones) en O(n log n).
    """
    def solve_rec(left: int, right: int) -> int | None:
        if left == right:
            return arr[left]

        mid = (left + right) // 2
        cand_left = solve_rec(left, mid)
        cand_right = solve_rec(mid + 1, right)

        if cand_left == cand_right:
            return cand_left

        count_left = sum(1 for i in range(left, right + 1) if arr[i] == cand_left) if cand_left is not None else 0
        count_right = sum(1 for i in range(left, right + 1) if arr[i] == cand_right) if cand_right is not None else 0

        threshold = (right - left + 1) // 2
        if count_left > threshold:
            return cand_left
        if count_right > threshold:
            return cand_right
        return None

    return solve_rec(0, len(arr) - 1)


majority_element = elemento_mayoritario

