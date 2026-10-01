"""
2-Approximation Algorithm for Minimum Vertex Cover
Reference: Kleinberg & Tardos, "Algorithm Design", Chapter 11, Section 11.1.

Formal Guarantee:
The algorithm finds a vertex cover C in O(|V| + |E|) time such that:
|C| <= 2 * |C*|
where C* is the optimal minimum vertex cover.
"""

def vertex_cover_2approx(vertices: list[str], edges: list[tuple[str, str]]) -> tuple[list[str], list[tuple[str, str]]]:
    """
    Computes a 2-approximation of minimum vertex cover
    by iteratively selecting disjoint edges (maximal matching).

    Returns:
      (cover, matching_edges):
        - cover: Set C of vertices covering all edges
        - matching_edges: Set M of disjoint edges selected
    """
    cover: set[str] = set()
    matching: list[tuple[str, str]] = []

    remaining_edges = list(edges)

    for u, v in remaining_edges:
        if u not in cover and v not in cover:
            matching.append((u, v))
            cover.add(u)
            cover.add(v)

    return sorted(list(cover)), matching


def check_vertex_cover(edges: list[tuple[str, str]], cover: list[str]) -> bool:
    """
    Verifies in O(|E|) time whether every edge has at least one endpoint in the cover.
    """
    set_c = set(cover)
    for u, v in edges:
        if u not in set_c and v not in set_c:
            return False
    return True


# Backward-compatible entry-point aliases
cobertura_vertices_2aprox = vertex_cover_2approx
verificar_cobertura = check_vertex_cover
