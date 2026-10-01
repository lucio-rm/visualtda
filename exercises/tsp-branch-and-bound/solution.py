def tsp_branch_and_bound(distances: list[list[int]]) -> int:
    """
    Solves the Traveling Salesperson Problem (TSP) using Branch & Bound with admissible lower bounds.
    distances: n x n symmetric distance/cost matrix.
    Returns the optimal tour cost.
    """
    n = len(distances)
    if n <= 1:
        return 0
    best_cost = [float('inf')]

    def lower_bound(current_city: int, visited: set[int], current_cost: int) -> float:
        remaining = [i for i in range(n) if i not in visited]
        if not remaining:
            return current_cost + distances[current_city][0]
        min_outgoing = min(distances[current_city][r] for r in remaining)
        min_return = min(distances[r][0] for r in remaining)
        return current_cost + min_outgoing + min_return

    def explore(u: int, visited: set[int], current_cost: int) -> None:
        if len(visited) == n:
            total_cost = current_cost + distances[u][0]
            if total_cost < best_cost[0]:
                best_cost[0] = total_cost
            return

        if lower_bound(u, visited, current_cost) >= best_cost[0]:
            return

        remaining = [v for v in range(n) if v not in visited]
        remaining.sort(key=lambda v: distances[u][v])

        for v in remaining:
            visited.add(v)
            explore(v, visited, current_cost + distances[u][v])
            visited.remove(v)

    explore(0, {0}, 0)
    return int(best_cost[0])

# English alias
solve_tsp_bb = tsp_branch_and_bound
