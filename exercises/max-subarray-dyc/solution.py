"""
Maximum Subarray Sum via Divide and Conquer
Course Reference: Algoritmos RW / FIUBA & CLRS Chapter 4.
"""

from typing import List, Tuple

def max_crossing_subarray(arr: List[int]) -> List[int]:
    """
    Finds the contiguous maximum-sum subarray crossing the midpoint.
    
    Complexity: O(n) time, O(1) auxiliary space.
    """
    if not arr:
        return []

    mid = len(arr) // 2

    # Scan left from mid - 1 to 0
    running_sum = 0
    cross_left = mid - 1 if mid > 0 else 0
    max_left = -float('inf')
    for i in range(mid - 1, -1, -1):
        running_sum += arr[i]
        if running_sum > max_left:
            max_left = running_sum
            cross_left = i

    # Scan right from mid to len(arr) - 1
    running_sum = 0
    cross_right = mid
    max_right = -float('inf')
    for j in range(mid, len(arr)):
        running_sum += arr[j]
        if running_sum > max_right:
            max_right = running_sum
            cross_right = j

    return arr[cross_left : cross_right + 1]


def max_subarray(arr: List[int]) -> List[int]:
    """
    Finds the contiguous subarray with maximum sum using Divide and Conquer.
    
    Recurrence: T(n) = 2T(n/2) + O(n) => O(n log n).
    """
    if not arr:
        return []
    if len(arr) == 1:
        return arr

    mid = len(arr) // 2

    left_sub = max_subarray(arr[:mid])
    right_sub = max_subarray(arr[mid:])
    cross_sub = max_crossing_subarray(arr)

    sum_left = sum(left_sub) if left_sub else -float('inf')
    sum_right = sum(right_sub) if right_sub else -float('inf')
    sum_cross = sum(cross_sub) if cross_sub else -float('inf')

    max_val = max(sum_left, sum_right, sum_cross)

    if max_val == sum_left:
        return left_sub
    elif max_val == sum_right:
        return right_sub
    else:
        return cross_sub


def kadane(arr: List[int]) -> Tuple[int, int, int]:
    """
    Kadane's algorithm in O(n) time.
    Returns (max_sum, start_index, end_index) inclusive.
    """
    if not arr:
        return 0, 0, 0

    max_ending_here = arr[0]
    max_so_far = arr[0]
    start = end = temp_start = 0

    for i in range(1, len(arr)):
        if arr[i] > max_ending_here + arr[i]:
            max_ending_here = arr[i]
            temp_start = i
        else:
            max_ending_here += arr[i]

        if max_ending_here > max_so_far:
            max_so_far = max_ending_here
            start = temp_start
            end = i

    return max_so_far, start, end


# Backward-compatible entry-point aliases
subarreglo_cruzado = max_crossing_subarray
subarreglo_maxima_suma = max_subarray
