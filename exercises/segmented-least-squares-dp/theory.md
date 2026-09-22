## Mínimos Cuadrados Segmentados
### Referencia: Kleinberg & Tardos, Capítulo 6.3

### 1. Recurrencia de Subproblemas
Para encontrar la partición óptima de los primeros $j$ puntos, el último segmento debe comenzar en algún $i \le j$:
$$OPT(j) = \min_{1 \le i \le j} \left( e_{i,j} + C + OPT(i-1) \right)$$
Con $OPT(0) = 0$. Complejidad temporal: $O(n^2)$ tras $O(n^3)$ precomputación de errores.
