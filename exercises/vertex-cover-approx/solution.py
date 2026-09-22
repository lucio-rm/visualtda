"""
Algoritmo de 2-Aproximación para Cobertura de Vértices Mínima (Vertex Cover)
Referencia: Kleinberg & Tardos, "Algorithm Design", Capítulo 11, Sección 11.1.

Garantía Formal:
El algoritmo encuentra una cobertura C en tiempo O(|V| + |E|) tal que:
|C| <= 2 * |C*|
donde C* es la cobertura mínima óptima.
"""

def cobertura_vertices_2aprox(vertices: list[str], aristas: list[tuple[str, str]]) -> tuple[list[str], list[tuple[str, str]]]:
    """
    Calcula una 2-aproximación de la cobertura de vértices mínima
    seleccionando iterativamente aristas disjuntas (matching maximal).
    
    Parámetros:
      vertices: Lista de nombres de vértices V
      aristas: Lista de pares (u, v) representando las aristas E
      
    Retorna:
      (cobertura, matching_aristas):
        - cobertura: Conjunto C de vértices que cubren todas las aristas
        - matching_aristas: Conjunto M de aristas disjuntas seleccionadas
    """
    cobertura = set()
    matching = []
    
    # Conjunto de aristas aún no cubiertas
    aristas_restantes = list(aristas)
    
    for u, v in aristas_restantes:
        # Si la arista no está cubierta por ningún extremo ya elegido
        if u not in cobertura and v not in cobertura:
            # 1. Agregar la arista al matching M
            matching.append((u, v))
            # 2. Agregar AMBOS extremos a la cobertura C
            cobertura.add(u)
            cobertura.add(v)
            
    return sorted(list(cobertura)), matching


def verificar_cobertura(aristas: list[tuple[str, str]], cobertura: list[str]) -> bool:
    """
    Verifica en O(|E|) si cada arista tiene al menos un extremo en la cobertura.
    """
    set_c = set(cobertura)
    for u, v in aristas:
        if u not in set_c and v not in set_c:
            return False
    return True
