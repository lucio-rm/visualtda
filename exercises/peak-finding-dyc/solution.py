def find_peak(arr: list[int]) -> int:
    """
    Given an array of n unsorted integers, finds the index of a local peak.
    An element arr[i] is a peak if it is greater than or equal to its neighbors:
      - If i > 0: arr[i] >= arr[i - 1]
      - If i < len(arr) - 1: arr[i] >= arr[i + 1]

    Time Complexity: O(log n) via Divide and Conquer.
    Space Complexity: O(1) iterative.

    Returns the index i of the peak element. If array is empty, returns -1.
    """
    if not arr:
        return -1

    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2

        if mid > 0 and arr[mid] < arr[mid - 1]:
            high = mid - 1
        elif mid < len(arr) - 1 and arr[mid] < arr[mid + 1]:
            low = mid + 1
        else:
            return mid

    return low


# Backward-compatible entry-point alias
buscar_pico = find_peak
