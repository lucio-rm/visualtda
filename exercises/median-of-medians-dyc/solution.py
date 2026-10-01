def find_kth_element(arr: list[int], k: int) -> int:
    """
    Finds the k-th smallest element (0-indexed) in deterministic O(n) worst-case time
    using the Median of Medians (BFPRT) algorithm.
    """
    if len(arr) <= 5:
        return sorted(arr)[k]

    sublists = [arr[i:i + 5] for i in range(0, len(arr), 5)]
    medians = [sorted(sub)[len(sub) // 2] for sub in sublists]

    pivot = find_kth_element(medians, len(medians) // 2)

    smaller = [x for x in arr if x < pivot]
    equal = [x for x in arr if x == pivot]
    greater = [x for x in arr if x > pivot]

    if k < len(smaller):
        return find_kth_element(smaller, k)
    elif k < len(smaller) + len(equal):
        return pivot
    else:
        return find_kth_element(greater, k - len(smaller) - len(equal))


# Backward-compatible entry-point aliases
kth_smallest_element = find_kth_element
k_esimo_elemento = find_kth_element
