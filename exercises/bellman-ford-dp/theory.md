## Bellman-Ford y Programación Dinámica en Grafos
### Referencia: Kleinberg & Tardos, Capítulo 6.8

### 1. Recurrencia sobre la Longitud del Camino
Sea $OPT(i, v)$ el costo mínimo de un camino desde $s$ hasta $v$ que utiliza a lo sumo $i$ aristas:
$$OPT(i, v) = \min \left( OPT(i-1, v), \min_{(u, v) \in E} (OPT(i-1, u) + c_{u,v}) \right)$$
Un camino simple en un grafo sin ciclos negativos tiene a lo sumo $|V| - 1$ aristas.
