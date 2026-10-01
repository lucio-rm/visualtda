def k_esimo_elemento(arr: list[int], k: int) -> int:
    """
    Encuentra el k-esimo menor elemento (0-indexed) en tiempo lineal deterministico O(n).
    """
    if len(arr) <= 5:
        return sorted(arr)[k]

    sublists = [arr[i:i + 5] for i in range(0, len(arr), 5)]
    medians = [sorted(sub)[len(sub) // 2] for sub in sublists]

    pivot = k_esimo_elemento(medians, len(medians) // 2)

    smaller = [x for x in arr if x < pivot]
    equal = [x for x in arr if x == pivot]
    greater = [x for x in arr if x > pivot]

    if k < len(smaller):
        return k_esimo_elemento(smaller, k)
    elif k < len(smaller) + len(equal):
        return pivot
    else:
        return k_esimo_elemento(greater, k - len(smaller) - len(equal))


kth_smallest_element = k_esimo_elemento

