"""
Problema del Flujo Máximo y Corte Mínimo (Max Flow / Min Cut)
Técnica: Redes de Flujo (Algoritmo de Edmonds-Karp / Ford-Fulkerson con BFS)

Referencia: Kleinberg & Tardos, "Algorithm Design", Capítulo 7.
Complejidad Temporal: O(V * E^2)
"""

from collections import deque
from typing import NamedTuple


class Edge(NamedTuple):
    origen: str
    destino: str
    capacidad: int


class FlujoResultado(NamedTuple):
    flujo_maximo: int
    flujo_aristas: dict[tuple[str, str], int]
    corte_minimo_S: set[str]
    corte_minimo_T: set[str]


def edmonds_karp(
    vertices: list[str],
    aristas: list[Edge],
    fuente: str,
    sumidero: str
) -> FlujoResultado:
    """
    Calcula el flujo máximo y el corte mínimo en una red de capacidades usando Edmonds-Karp (BFS).
    """
    # 1. Construir red residual
    # residual[u][v] = capacidad residual de u a v
    residual: dict[str, dict[str, int]] = {v: {} for v in vertices}
    aristas_originales: set[tuple[str, str]] = set()

    for e in aristas:
        residual[e.origen][e.destino] = e.capacidad
        # Arista residual de retroceso con capacidad inicial 0
        if e.destino not in residual or e.origen not in residual[e.destino]:
            residual[e.destino][e.origen] = 0
        aristas_originales.add((e.origen, e.destino))

    def bfs_camino_aumento() -> tuple[list[str], int] | None:
        """Encuentra un camino de aumento s -> t con la menor cantidad de aristas (BFS)."""
        padre: dict[str, str] = {}
        cola = deque([fuente])
        visitados = {fuente}

        while cola:
            actual = cola.popleft()
            if actual == sumidero:
                break

            for vecino, cap_residual in residual[actual].items():
                if vecino not in visitados and cap_residual > 0:
                    visitados.add(vecino)
                    padre[vecino] = actual
                    cola.append(vecino)

        if sumidero not in padre:
            return None

        # Reconstruir camino y cuello de botella
        camino = []
        curr = sumidero
        cuello_botella = float("inf")

        while curr != fuente:
            p = padre[curr]
            camino.append(curr)
            cuello_botella = min(cuello_botella, residual[p][curr])
            curr = p
        camino.append(fuente)
        camino.reverse()

        return camino, int(cuello_botella)

    flujo_total = 0

    # 2. Iterar mientras existan caminos de aumento en la red residual
    while True:
        resultado_bfs = bfs_camino_aumento()
        if not resultado_bfs:
            break

        camino, cuello_botella = resultado_bfs
        flujo_total += cuello_botella

        # Aumentar flujo a lo largo del camino
        for i in range(len(camino) - 1):
            u = camino[i]
            v = camino[i + 1]
            residual[u][v] -= cuello_botella
            residual[v][u] += cuello_botella

    # 3. Calcular flujo neto en aristas originales
    flujo_aristas: dict[tuple[str, str], int] = {}
    for e in aristas:
        # flujo = capacidad_original - residual_restante
        f = e.capacidad - residual[e.origen][e.destino]
        flujo_aristas[(e.origen, e.destino)] = f

    # 4. Encontrar Corte Mínimo (S, T) mediante alcanzabilidad en la red residual final
    alcanzables_desde_s: set[str] = set()
    cola_corte = deque([fuente])
    alcanzables_desde_s.add(fuente)

    while cola_corte:
        actual = cola_corte.popleft()
        for vecino, cap_res in residual[actual].items():
            if vecino not in alcanzables_desde_s and cap_res > 0:
                alcanzables_desde_s.add(vecino)
                cola_corte.append(vecino)

    corte_S = alcanzables_desde_s
    corte_T = set(vertices) - corte_S

    return FlujoResultado(
        flujo_maximo=flujo_total,
        flujo_aristas=flujo_aristas,
        corte_minimo_S=corte_S,
        corte_minimo_T=corte_T
    )
