import heapq


def partition_intervals(intervals: list[tuple[int, int]]) -> int:
    """
    Returns the minimum number of classrooms/resources required to schedule all intervals without conflict.
    """
    if not intervals:
        return 0
    sorted_intervals = sorted(intervals, key=lambda x: x[0])
    rooms = []
    for start, end in sorted_intervals:
        if rooms and rooms[0] <= start:
            heapq.heappop(rooms)
        heapq.heappush(rooms, end)
    return len(rooms)


# Backward-compatible entry-point alias
particionar_intervalos = partition_intervals
