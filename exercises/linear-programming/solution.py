"""
Programación Lineal y Programación Lineal Entera (LP / ILP)
Referencia de Cátedra: Algoritmos RW / FIUBA & Kleinberg-Tardos Chapter 11.
"""

from typing import List, Tuple, Dict, Any

def solve_lp_2d(c: Tuple[float, float], constraints: List[Tuple[float, float, float]]) -> Dict[str, Any]:
    """
    Solves a 2-variable linear programming problem using the geometric vertex enumeration method:
        Maximize: c[0] * x + c[1] * y
        Subject to: a * x + b * y <= d  for each (a, b, d) in constraints
                  x >= 0, y >= 0
                  
    Returns {'factible': bool, 'feasible': bool, 'optimo': (x, y), 'optimal': (x, y), 'valor_maximo': float, 'max_value': float, 'vertices_factibles': list, 'feasible_vertices': list}
    """
    # Include non-negativity constraints: -x <= 0, -y <= 0
    all_constraints = list(constraints)
    all_constraints.append((-1.0, 0.0, 0.0))  # x >= 0
    all_constraints.append((0.0, -1.0, 0.0))  # y >= 0

    candidate_vertices = []
    m = len(all_constraints)

    # Intersection of all constraint line pairs
    for i in range(m):
        a1, b1, d1 = all_constraints[i]
        for j in range(i + 1, m):
            a2, b2, d2 = all_constraints[j]
            det = a1 * b2 - a2 * b1
            if abs(det) > 1e-9:  # Lines are not parallel
                x = (d1 * b2 - d2 * b1) / det
                y = (a1 * d2 - a2 * d1) / det

                # Verify feasibility against all constraints
                feasible = True
                for a_k, b_k, d_k in all_constraints:
                    if a_k * x + b_k * y > d_k + 1e-7:
                        feasible = False
                        break

                if feasible:
                    pt = (round(x, 6), round(y, 6))
                    if pt not in candidate_vertices:
                        candidate_vertices.append(pt)

    if not candidate_vertices:
        return {
            'factible': False,
            'feasible': False,
            'optimo': None,
            'optimal': None,
            'valor_maximo': -float('inf'),
            'max_value': -float('inf'),
            'vertices_factibles': [],
            'feasible_vertices': []
        }

    # Evaluate objective function at each feasible vertex
    best_vertex = None
    best_value = -float('inf')

    for x, y in candidate_vertices:
        val = c[0] * x + c[1] * y
        if val > best_value:
            best_value = val
            best_vertex = (x, y)

    sorted_vertices = sorted(candidate_vertices)
    return {
        'factible': True,
        'feasible': True,
        'optimo': best_vertex,
        'optimal': best_vertex,
        'valor_maximo': best_value,
        'max_value': best_value,
        'vertices_factibles': sorted_vertices,
        'feasible_vertices': sorted_vertices
    }


def model_juan_el_vago_ilp(profits: List[int]) -> Dict[str, Any]:
    """
    Constructs formal Integer Linear Programming (ILP) formulation for Lazy Juan:
        Variables: x_0, x_1, ..., x_{n-1} in {0, 1}
        Maximize: sum(p_i * x_i)
        Subject to: x_i + x_{i+1} <= 1  for all i in {0, ..., n-2}
    """
    n = len(profits)
    variables = [f"x_{i}" for i in range(n)]
    objective_func = " + ".join(f"{profits[i]}*x_{i}" for i in range(n))
    constraints_list = [f"x_{i} + x_{i+1} <= 1" for i in range(n - 1)]

    return {
        'tipo': 'Maximizar',
        'type': 'Maximize',
        'variables': variables,
        'dominio': 'Binario {0, 1}',
        'domain': 'Binary {0, 1}',
        'funcion_objetivo': objective_func,
        'objective_function': objective_func,
        'restricciones': constraints_list,
        'constraints': constraints_list,
        'cantidad_restricciones': len(constraints_list),
        'constraint_count': len(constraints_list)
    }


def model_knapsack_ilp(values: List[int], weights: List[int], capacity: int) -> Dict[str, Any]:
    """
    Constructs formal Integer Linear Programming (ILP) formulation for 0/1 Knapsack:
        Variables: x_0, x_1, ..., x_{n-1} in {0, 1}
        Maximize: sum(v_i * x_i)
        Subject to: sum(w_i * x_i) <= W
    """
    n = len(values)
    variables = [f"x_{i}" for i in range(n)]
    objective_func = " + ".join(f"{values[i]}*x_{i}" for i in range(n))
    capacity_constraint = " + ".join(f"{weights[i]}*x_{i}" for i in range(n)) + f" <= {capacity}"

    return {
        'tipo': 'Maximizar',
        'type': 'Maximize',
        'variables': variables,
        'dominio': 'Binario {0, 1}',
        'domain': 'Binary {0, 1}',
        'funcion_objetivo': objective_func,
        'objective_function': objective_func,
        'restricciones': [capacity_constraint],
        'constraints': [capacity_constraint],
        'cantidad_restricciones': 1,
        'constraint_count': 1
    }


# Backward-compatible entry-point aliases
resolver_lp_2d = solve_lp_2d
modelar_juan_el_vago_ilp = model_juan_el_vago_ilp
modelar_mochila_ilp = model_knapsack_ilp
