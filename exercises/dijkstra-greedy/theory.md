## Caminos Mínimos de Dijkstra (Algoritmo Voraz)
### Referencia: Kleinberg & Tardos, Capítulo 4.4

### 1. Invariante de Corrección
En cada paso, para todo $u \in S$, `dist[u]` es la distancia más corta real. La no-negatividad de las aristas garantiza que ningún camino alternativo fuera de $S$ pueda ser menor. Complejidad: $O((|V| + |E|) \log |V|)$.
