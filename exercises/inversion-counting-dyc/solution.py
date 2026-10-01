def count_inversions(arr: list[int]) -> int:
    """
    Counts total number of inversions in the given array:
    pairs of indices (i, j) such that i < j and arr[i] > arr[j].

    Time Complexity: O(n log n) via Divide and Conquer (Merge Sort variant).
    Space Complexity: O(n) for auxiliary merge buffers.

    Returns total inversion count (integer >= 0).
    """
    def merge_and_count(left: list[int], right: list[int]) -> tuple[int, list[int]]:
        i = 0
        j = 0
        split_inversions = 0
        merged = []

        len_left = len(left)
        len_right = len(right)

        while i < len_left and j < len_right:
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                # If right[j] < left[i], then right[j] is smaller than all remaining elements in left[i:]
                merged.append(right[j])
                split_inversions += (len_left - i)
                j += 1

        merged.extend(left[i:])
        merged.extend(right[j:])
        return split_inversions, merged

    def sort_and_count(items: list[int]) -> tuple[int, list[int]]:
        if len(items) <= 1:
            return 0, list(items)

        mid = len(items) // 2
        inv_left, left_sorted = sort_and_count(items[:mid])
        inv_right, right_sorted = sort_and_count(items[mid:])
        inv_split, merged_items = merge_and_count(left_sorted, right_sorted)

        total = inv_left + inv_right + inv_split
        return total, merged_items

    total_inversions, _ = sort_and_count(arr)
    return total_inversions


# Backward-compatible entry-point alias
contar_inversiones = count_inversions
