## Bellman-Ford y Programación Dinámica en Grafos

### 1. Definición Formal y Planteo
Dado un grafo dirigido ponderado $G = (V, E)$ donde las aristas pueden poseer pesos reales negativos ($w(e) \in \mathbb{R}$), y un vértice origen $s \in V$, el problema de caminos mínimos busca la distancia mínima $d(s, v)$ para cada $v \in V$.

A diferencia del algoritmo de Dijkstra (cuya regla greedy asume pesos no negativos), la presencia de costos negativos invalida el principio de que los caminos no disminuyen de valor al alargarse. Sin embargo, si el grafo no contiene ciclos negativos alcanzables desde $s$, todo camino mínimo simple contiene a lo sumo $|V| - 1$ aristas.

---

### 2. Subestructura Óptima y Recurrencia
Definimos la cantidad $OPT(i, v)$ como el costo mínimo de un camino desde $s$ hasta $v$ utilizando a lo sumo $i$ aristas.

Para calcular $OPT(i, v)$, existen dos posibilidades para el camino óptimo:
1. El camino óptimo utiliza a lo sumo $i-1$ aristas: en este caso, su costo es $OPT(i-1, v)$.
2. El camino óptimo utiliza exactamente $i$ aristas, teniendo como última arista a $(u, v) \in E$: en este caso, el camino previo desde $s$ hasta $u$ debe ser un camino óptimo de a lo sumo $i-1$ aristas, con costo $OPT(i-1, u) + w(u, v)$.

Tomando el mínimo sobre todas las aristas entrantes a $v$:
$$OPT(i, v) = \min \left( OPT(i-1, v), \min_{(u, v) \in E} \{OPT(i-1, u) + w(u, v)\} \right)$$

**Casos Base**:
- $OPT(0, s) = 0$
- $OPT(0, v) = \infty$ para todo $v \ne s$

---

### 3. Detección de Ciclos Negativos
Si tras $|V| - 1$ iteraciones completas se ejecuta una iteración adicional ($i = |V|$) y para algún vértice $v$ se cumple:
$$\min_{(u, v) \in E} \{OPT(|V|-1, u) + w(u, v)\} < OPT(|V|-1, v)$$
significa que existe un camino de longitud $|V|$ aristas con menor costo que cualquier camino de $|V|-1$ aristas. Como cualquier camino con $|V|$ aristas contiene necesariamente un ciclo repetido por el Principio del Palomar, dicho ciclo tiene costo estrictamente negativo. El algoritmo detecta esta condición y alerta la ausencia de caminos mínimos bien definidos.

---

### 4. Complejidad Asintótica y Optimización Espacial
- **Complejidad Temporal**: Se computan $|V| - 1$ fases. En cada fase se relajan las $|E|$ aristas del grafo. Por lo tanto, la complejidad temporal es $O(|V| \cdot |E|)$. En grafos densos ($|E| \approx |V|^2$), esto equivale a $O(|V|^3)$.
- **Optimización de Memoria**: Aunque la definición teórica utiliza una tabla $M[0..|V|-1, V]$ que requeriría $O(|V|^2)$ espacio, la implementación canónica mantiene únicamente un vector unidimensional $\text{dist}[v]$ de tamaño $|V|$, actualizándolo in-place. La corrección se preserva debido a que relajar con valores de la misma fase solo acelera la convergencia sin producir subestimaciones erróneas. El espacio auxiliar es así estrictamente $O(|V|)$.
