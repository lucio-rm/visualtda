"""
Reducción Polinomial: Conjunto Independiente a Cobertura de Vértices (Independent Set <=_P Vertex Cover)
Referencia: Kleinberg & Tardos, "Algorithm Design", Capítulo 8.1.

Teorema Fundamental:
Sea G = (V, E) un grafo no dirigido y S un subconjunto de V.
S es un Conjunto Independiente en G si y solo si su complemento (V \\ S)
es una Cobertura de Vértices (Vertex Cover) en G.
"""

def reducir_instancia_is_a_vc(vertices: list[str], edges: list[tuple[str, str]], k: int) -> tuple[list[str], list[tuple[str, str]], int]:
    """
    Transforma una instancia de Conjunto Independiente (G, k)
    en una instancia equivalente de Cobertura de Vértices (G, k').

    Parámetros:
      vertices: Lista de identificadores de vértices V
      edges: Lista de pares (u, v) representando las aristas E
      k: Tamaño objetivo del conjunto independiente buscado

    Retorna:
      (V, E, k') donde k' = |V| - k
    """
    n = len(vertices)
    k_prime = n - k
    return list(vertices), list(edges), k_prime


def transformar_solucion_vc_a_is(vertices: list[str], cover: list[str]) -> list[str]:
    """
    Dada una cobertura de vértices C para el grafo G=(V, E),
    recupera en tiempo lineal el conjunto independiente complementario S = V \\ C.
    """
    set_cover = set(cover)
    return [v for v in vertices if v not in set_cover]


def transformar_solucion_is_a_vc(vertices: list[str], independent_set: list[str]) -> list[str]:
    """
    Dado un conjunto independiente S para el grafo G=(V, E),
    construye la cobertura de vértices complementaria C = V \\ S.
    """
    set_independent = set(independent_set)
    return [v for v in vertices if v not in set_independent]


def verificar_conjunto_independiente(edges: list[tuple[str, str]], S: list[str]) -> bool:
    """
    Verifica en O(|E|) si ninguna arista tiene ambos extremos dentro de S.
    """
    set_s = set(S)
    for u, v in edges:
        if u in set_s and v in set_s:
            return False
    return True


def verificar_cobertura_vertices(edges: list[tuple[str, str]], C: list[str]) -> bool:
    """
    Verifica en O(|E|) si toda arista en E tiene al menos un extremo en C.
    """
    set_c = set(C)
    for u, v in edges:
        if u not in set_c and v not in set_c:
            return False
    return True


reduce_is_to_vc = reducir_instancia_is_a_vc
vc_to_is = transformar_solucion_vc_a_is
is_to_vc = transformar_solucion_is_a_vc
check_independent_set = verificar_conjunto_independiente
check_vertex_cover = verificar_cobertura_vertices

