def weighted_interval_scheduling(intervals: list[list[int]]) -> list[list[int]]:
    """
    Given a set of intervals where each is [start, end, weight],
    finds a mutually compatible subset of intervals maximizing the total weight.

    Time Complexity: O(n log n) via sorting + binary search for p(j).
    Space Complexity: O(n) for DP memoization table and pointer array p(j).

    Returns the list of selected [start, end, weight] intervals.
    """
    if not intervals:
        return []

    # 1. Sort intervals by non-decreasing finish time
    sorted_intervals = sorted(intervals, key=lambda x: x[1])
    n = len(sorted_intervals)

    # 2. Compute p(j) for each interval j (1-indexed):
    # p[j] is the largest index i < j such that finish_i <= start_j (0 if none)
    p = [0] * (n + 1)
    for j in range(1, n + 1):
        start_j = sorted_intervals[j - 1][0]
        low, high = 1, j - 1
        best = 0
        while low <= high:
            mid = (low + high) // 2
            if sorted_intervals[mid - 1][1] <= start_j:
                best = mid
                low = mid + 1
            else:
                high = mid - 1
        p[j] = best

    # 3. Fill Dynamic Programming table
    opt = [0] * (n + 1)
    for j in range(1, n + 1):
        weight_j = sorted_intervals[j - 1][2]
        opt[j] = max(opt[j - 1], weight_j + opt[p[j]])

    # 4. Reconstruction of the optimal solution
    selected = []
    curr = n
    while curr > 0:
        weight_curr = sorted_intervals[curr - 1][2]
        if weight_curr + opt[p[curr]] >= opt[curr - 1]:
            selected.append(sorted_intervals[curr - 1])
            curr = p[curr]
        else:
            curr -= 1

    selected.reverse()
    return selected


# Backward-compatible entry-point alias
planificar_intervalos_ponderados = weighted_interval_scheduling
