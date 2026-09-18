"""
Reducción Polinomial: Conjunto Independiente a Cobertura de Vértices (Independent Set <=_P Vertex Cover)
Referencia: Kleinberg & Tardos, "Algorithm Design", Capítulo 8.1.

Teorema Fundamental:
Sea G = (V, E) un grafo no dirigido y S un subconjunto de V.
S es un Conjunto Independiente en G si y solo si su complemento (V \\ S)
es una Cobertura de Vértices (Vertex Cover) en G.
"""

def reducir_instancia_is_a_vc(vertices: list[str], aristas: list[tuple[str, str]], k: int) -> tuple[list[str], list[tuple[str, str]], int]:
    """
    Transforma una instancia de Conjunto Independiente (G, k)
    en una instancia equivalente de Cobertura de Vértices (G, k').
    
    Parámetros:
      vertices: Lista de identificadores de vértices V
      aristas: Lista de pares (u, v) representando las aristas E
      k: Tamaño objetivo del conjunto independiente buscado
      
    Retorna:
      (V, E, k') donde k' = |V| - k
    """
    n = len(vertices)
    k_prima = n - k
    # El grafo G = (V, E) se preserva intacto; sólo cambia el parámetro de tamaño
    return list(vertices), list(aristas), k_prima


def transformar_solucion_vc_a_is(vertices: list[str], cobertura: list[str]) -> list[str]:
    """
    Dada una cobertura de vértices C para el grafo G=(V, E),
    recupera en tiempo lineal el conjunto independiente complementario S = V \\ C.
    """
    set_cobertura = set(cobertura)
    return [v for v in vertices if v not in set_cobertura]


def transformar_solucion_is_a_vc(vertices: list[str], conjunto_indep: list[str]) -> list[str]:
    """
    Dado un conjunto independiente S para el grafo G=(V, E),
    construye la cobertura de vértices complementaria C = V \\ S.
    """
    set_indep = set(conjunto_indep)
    return [v for v in vertices if v not in set_indep]


def verificar_conjunto_independiente(aristas: list[tuple[str, str]], S: list[str]) -> bool:
    """
    Verifica en O(|E|) si ninguna arista tiene ambos extremos dentro de S.
    """
    set_s = set(S)
    for u, v in aristas:
        if u in set_s and v in set_s:
            return False  # Conflicto: arista interna en S
    return True


def verificar_cobertura_vertices(aristas: list[tuple[str, str]], C: list[str]) -> bool:
    """
    Verifica en O(|E|) si toda arista en E tiene al menos un extremo en C.
    """
    set_c = set(C)
    for u, v in aristas:
        if u not in set_c and v not in set_c:
            return False  # Arista descubierta
    return True
