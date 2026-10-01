def mochila_branch_and_bound(capacity: int, weights: list[int], values: list[int]) -> int:
    """
    Retorna el valor optimo entero mediante Branch & Bound.
    """
    n = len(weights)
    items = sorted(zip(weights, values), key=lambda item: item[1] / item[0], reverse=True)
    best_value = [0]

    def upper_bound(idx: int, current_weight: int, current_value: int) -> float:
        if current_weight > capacity:
            return 0.0
        bound = float(current_value)
        remaining_capacity = capacity - current_weight
        for i in range(idx, n):
            w, v = items[i]
            if w <= remaining_capacity:
                remaining_capacity -= w
                bound += v
            else:
                bound += v * (remaining_capacity / w)
                break
        return bound

    def explore(idx: int, current_weight: int, current_value: int) -> None:
        if current_weight <= capacity and current_value > best_value[0]:
            best_value[0] = current_value
        if idx == n or current_weight > capacity:
            return

        if upper_bound(idx, current_weight, current_value) <= best_value[0]:
            return

        w, v = items[idx]
        if current_weight + w <= capacity:
            explore(idx + 1, current_weight + w, current_value + v)
        explore(idx + 1, current_weight, current_value)

    explore(0, 0, 0)
    return best_value[0]


knapsack_branch_and_bound = mochila_branch_and_bound

