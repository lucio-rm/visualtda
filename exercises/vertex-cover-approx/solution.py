"""
Algoritmo de 2-Aproximación para Cobertura de Vértices Mínima (Vertex Cover)
Referencia: Kleinberg & Tardos, "Algorithm Design", Capítulo 11, Sección 11.1.

Garantía Formal:
El algoritmo encuentra una cobertura C en tiempo O(|V| + |E|) tal que:
|C| <= 2 * |C*|
donde C* es la cobertura mínima óptima.
"""

def cobertura_vertices_2aprox(vertices: list[str], edges: list[tuple[str, str]]) -> tuple[list[str], list[tuple[str, str]]]:
    """
    Calcula una 2-aproximación de la cobertura de vértices mínima
    seleccionando iterativamente aristas disjuntas (matching maximal).

    Parámetros:
      vertices: Lista de nombres de vértices V
      edges: Lista de pares (u, v) representando las aristas E

    Retorna:
      (cover, matching_edges):
        - cover: Conjunto C de vértices que cubren todas las aristas
        - matching_edges: Conjunto M de aristas disjuntas seleccionadas
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


def verificar_cobertura(edges: list[tuple[str, str]], cover: list[str]) -> bool:
    """
    Verifica en O(|E|) si cada arista tiene al menos un extremo en la cobertura.
    """
    set_c = set(cover)
    for u, v in edges:
        if u not in set_c and v not in set_c:
            return False
    return True


vertex_cover_2approx = cobertura_vertices_2aprox
check_vertex_cover = verificar_cobertura

