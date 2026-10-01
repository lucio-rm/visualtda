def kruskal_mst(num_vertices: int, edges: list[tuple[int, int, int]]) -> tuple[int, list[tuple[int, int, int]]]:
    """
    edges: list of tuples (u, v, weight).
    Returns (total_cost, mst_edges).
    """
    sorted_edges = sorted(edges, key=lambda edge: edge[2])
    parent = list(range(num_vertices))
    rank = [0] * num_vertices

    def find_root(i: int) -> int:
        if parent[i] != i:
            parent[i] = find_root(parent[i])
        return parent[i]

    def union(i: int, j: int) -> bool:
        root_i = find_root(i)
        root_j = find_root(j)
        if root_i == root_j:
            return False
        if rank[root_i] < rank[root_j]:
            parent[root_i] = root_j
        elif rank[root_i] > rank[root_j]:
            parent[root_j] = root_i
        else:
            parent[root_j] = root_i
            rank[root_i] += 1
        return True

    total_cost = 0
    mst = []
    for u, v, weight in sorted_edges:
        if union(u, v):
            total_cost += weight
            mst.append((u, v, weight))
            if len(mst) == num_vertices - 1:
                break
    return total_cost, mst

