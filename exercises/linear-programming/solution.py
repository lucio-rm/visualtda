"""
Programación Lineal y Programación Lineal Entera (LP / ILP)
Referencia de Cátedra: Algoritmos RW / FIUBA & Kleinberg-Tardos Chapter 11.
"""

from typing import List, Tuple, Dict, Any

def resolver_lp_2d(c: Tuple[float, float], restricciones: List[Tuple[float, float, float]]) -> Dict[str, Any]:
    """
    Resuelve un problema de programación lineal en 2 variables por el método geométrico
    (Teorema Fundamental de la Programación Lineal):
        Maximizar: c[0] * x + c[1] * y
        Sujeto a: a * x + b * y <= d  para cada (a, b, d) en restricciones
                  x >= 0, y >= 0
                  
    Retorna {'optimo': (x, y), 'valor_maximo': float, 'vertices_factibles': list}
    """
    # Incluir las restricciones de no negatividad: -x <= 0, -y <= 0
    todas_restricciones = list(restricciones)
    todas_restricciones.append((-1.0, 0.0, 0.0))  # x >= 0
    todas_restricciones.append((0.0, -1.0, 0.0))  # y >= 0

    vertices_candidatos = []
    m = len(todas_restricciones)

    # Intersección de pares de rectas frontera
    for i in range(m):
        a1, b1, d1 = todas_restricciones[i]
        for j in range(i + 1, m):
            a2, b2, d2 = todas_restricciones[j]
            det = a1 * b2 - a2 * b1
            if abs(det) > 1e-9:  # No son paralelas
                x = (d1 * b2 - d2 * b1) / det
                y = (a1 * d2 - a2 * d1) / det

                # Verificar factibilidad respecto a todas las restricciones
                factible = True
                for a_k, b_k, d_k in todas_restricciones:
                    if a_k * x + b_k * y > d_k + 1e-7:
                        factible = False
                        break

                if factible:
                    # Evitar duplicados numéricos
                    pt = (round(x, 6), round(y, 6))
                    if pt not in vertices_candidatos:
                        vertices_candidatos.append(pt)

    if not vertices_candidatos:
        return {'factible': False, 'optimo': None, 'valor_maximo': -float('inf'), 'vertices_factibles': []}

    # Evaluar la función objetivo en cada vértice factible
    mejor_vertice = None
    mejor_valor = -float('inf')

    for x, y in vertices_candidatos:
        val = c[0] * x + c[1] * y
        if val > mejor_valor:
            mejor_valor = val
            mejor_vertice = (x, y)

    return {
        'factible': True,
        'optimo': mejor_vertice,
        'valor_maximo': mejor_valor,
        'vertices_factibles': sorted(vertices_candidatos)
    }


def modelar_juan_el_vago_ilp(ganancias: List[int]) -> Dict[str, Any]:
    """
    Construye la formulación formal de Programación Lineal Entera (ILP) para Juan el Vago:
        Variables: x_0, x_1, ..., x_{n-1} en {0, 1}
        Maximizar: sum(g_i * x_i)
        Sujeto a: x_i + x_{i+1} <= 1  para todo i in {0, ..., n-2}
    """
    n = len(ganancias)
    variables = [f"x_{i}" for i in range(n)]
    funcion_objetivo = " + ".join(f"{ganancias[i]}*x_{i}" for i in range(n))
    restricciones = [f"x_{i} + x_{i+1} <= 1" for i in range(n - 1)]

    return {
        'tipo': 'Maximizar',
        'variables': variables,
        'dominio': 'Binario {0, 1}',
        'funcion_objetivo': funcion_objetivo,
        'restricciones': restricciones,
        'cantidad_restricciones': len(restricciones)
    }


def modelar_mochila_ilp(valores: List[int], pesos: List[int], capacidad: int) -> Dict[str, Any]:
    """
    Construye la formulación formal de Programación Lineal Entera (ILP) para Mochila 0/1:
        Variables: x_0, x_1, ..., x_{n-1} en {0, 1}
        Maximizar: sum(v_i * x_i)
        Sujeto a: sum(w_i * x_i) <= W
    """
    n = len(valores)
    variables = [f"x_{i}" for i in range(n)]
    funcion_objetivo = " + ".join(f"{valores[i]}*x_{i}" for i in range(n))
    restriccion_capacidad = " + ".join(f"{pesos[i]}*x_{i}" for i in range(n)) + f" <= {capacidad}"

    return {
        'tipo': 'Maximizar',
        'variables': variables,
        'dominio': 'Binario {0, 1}',
        'funcion_objetivo': funcion_objetivo,
        'restricciones': [restriccion_capacidad],
        'cantidad_restricciones': 1
    }


if __name__ == "__main__":
    # Test LP 2D:
    # Maximizar 3x + 2y
    # s.a. 2x + y <= 18
    #      2x + 3y <= 42
    #      3x + y <= 24
    #      x, y >= 0
    c = (3.0, 2.0)
    restricciones = [
        (2.0, 1.0, 18.0),
        (2.0, 3.0, 42.0),
        (3.0, 1.0, 24.0)
    ]
    res = resolver_lp_2d(c, restricciones)
    print("Vértices Factibles:", res['vertices_factibles'])
    print(f"Óptimo en: {res['optimo']} con valor: {res['valor_maximo']}")
    assert res['factible'] is True
    assert res['optimo'] is not None
    print("Test LP 2D exitoso!")

    # Test Modelado Juan el Vago
    modelo_juan = modelar_juan_el_vago_ilp([10, 40, 20, 30, 50])
    print("Modelo Juan el Vago:", modelo_juan['restricciones'])
    assert len(modelo_juan['restricciones']) == 4
    print("Todos los tests de Programación Lineal pasaron con éxito!")
