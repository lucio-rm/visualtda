"""
Polynomial Reduction: Independent Set to Vertex Cover (Independent Set <=_P Vertex Cover)
Reference: Kleinberg & Tardos, "Algorithm Design", Chapter 8.1.

Fundamental Theorem:
Let G = (V, E) be an undirected graph and S a subset of V.
S is an Independent Set in G if and only if its complement (V \\ S)
is a Vertex Cover in G.
"""

def reduce_is_to_vc(vertices: list[str], edges: list[tuple[str, str]], k: int) -> tuple[list[str], list[tuple[str, str]], int]:
    """
    Transforms an Independent Set instance (G, k)
    into an equivalent Vertex Cover instance (G, k').

    Returns:
      (V, E, k') where k' = |V| - k
    """
    n = len(vertices)
    k_prime = n - k
    return list(vertices), list(edges), k_prime


def transform_vc_to_is(vertices: list[str], cover: list[str]) -> list[str]:
    """
    Given vertex cover C for G=(V, E),
    recovers complementary independent set S = V \\ C in linear time.
    """
    set_cover = set(cover)
    return [v for v in vertices if v not in set_cover]


def transform_is_to_vc(vertices: list[str], independent_set: list[str]) -> list[str]:
    """
    Given independent set S for G=(V, E),
    constructs complementary vertex cover C = V \\ S.
    """
    set_independent = set(independent_set)
    return [v for v in vertices if v not in set_independent]


def check_independent_set(edges: list[tuple[str, str]], independent_set: list[str]) -> bool:
    """
    Verifies in O(|E|) whether no edge has both endpoints in S.
    """
    set_s = set(independent_set)
    for u, v in edges:
        if u in set_s and v in set_s:
            return False
    return True


def check_vertex_cover(edges: list[tuple[str, str]], cover: list[str]) -> bool:
    """
    Verifies in O(|E|) whether every edge has at least one endpoint in C.
    """
    set_c = set(cover)
    for u, v in edges:
        if u not in set_c and v not in set_c:
            return False
    return True


# Backward-compatible entry-point aliases
reducir_instancia_is_a_vc = reduce_is_to_vc
transformar_solucion_vc_a_is = transform_vc_to_is
transformar_solucion_is_a_vc = transform_is_to_vc
verificar_conjunto_independiente = check_independent_set
verificar_cobertura_vertices = check_vertex_cover
