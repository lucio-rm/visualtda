import math


def par_mas_cercano(points: list[tuple[float, float]]) -> float:
    """
    Calcula la distancia minima entre n puntos en R^2 en O(n log n).
    """
    points_x = sorted(points, key=lambda p: p[0])
    points_y = sorted(points, key=lambda p: p[1])

    def calc_distance(p1: tuple[float, float], p2: tuple[float, float]) -> float:
        return math.hypot(p1[0] - p2[0], p1[1] - p2[1])

    def solve_rec(px: list[tuple[float, float]], py: list[tuple[float, float]]) -> float:
        n = len(px)
        if n <= 3:
            min_d = float('inf')
            for i in range(n):
                for j in range(i + 1, n):
                    min_d = min(min_d, calc_distance(px[i], px[j]))
            return min_d

        mid = n // 2
        mid_x = px[mid][0]

        left_x = px[:mid]
        right_x = px[mid:]
        left_y = [p for p in py if p[0] <= mid_x]
        right_y = [p for p in py if p[0] > mid_x]

        d1 = solve_rec(left_x, left_y)
        d2 = solve_rec(right_x, right_y)
        delta = min(d1, d2)

        strip = [p for p in py if abs(p[0] - mid_x) < delta]
        for i in range(len(strip)):
            for j in range(i + 1, min(i + 8, len(strip))):
                delta = min(delta, calc_distance(strip[i], strip[j]))

        return delta

    return solve_rec(points_x, points_y)


closest_pair = par_mas_cercano

