def knapsack_branch_and_bound(capacity: int, weights: list[int], values: list[int]) -> int:
    """
    Branch and Bound for 0/1 Knapsack using best-first search and fractional relaxation upper bound.
    """
    n = len(weights)
    if n == 0 or capacity <= 0:
        return 0

    def upper_bound(idx: int, current_weight: int, current_value: int) -> float:
        bound = float(current_value)
        total_w = current_weight
        for i in range(idx, n):
            if total_w + weights[i] <= capacity:
                total_w += weights[i]
                bound += values[i]
            else:
                remain = capacity - total_w
                bound += values[i] * (remain / weights[i])
                break
        return bound

    max_value = 0

    def explore(idx: int, current_weight: int, current_value: int) -> None:
        nonlocal max_value
        if current_weight > capacity:
            return
        if current_value > max_value:
            max_value = current_value
        if idx == n:
            return

        ub = upper_bound(idx, current_weight, current_value)
        if ub <= max_value:
            return  # Pruned

        # Branch with item idx
        explore(idx + 1, current_weight + weights[idx], current_value + values[idx])
        # Branch without item idx
        explore(idx + 1, current_weight, current_value)

    explore(0, 0, 0)
    return max_value


# Backward-compatible entry-point alias
mochila_branch_and_bound = knapsack_branch_and_bound
