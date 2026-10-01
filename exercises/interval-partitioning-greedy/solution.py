import heapq


def particionar_intervalos(intervals: list[tuple[int, int]]) -> int:
    """
    Retorna la minima cantidad de aulas necesarias para programar todos los intervalos.
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


partition_intervals = particionar_intervalos

