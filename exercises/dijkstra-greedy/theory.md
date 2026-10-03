# Caminos Mínimos de Dijkstra: Algoritmo Greedy y Demostración Formal

## 1. Definición Formal del Problema

Dado un grafo dirigido o no dirigido $G = (V, E)$ ponderado con pesos no negativos en las aristas $w(e) \ge 0$ para toda $e \in E$, y un vértice origen $s \in V$, el problema de caminos mínimos desde una única fuente consiste en determinar la distancia mínima $d(s, v)$ y el camino de menor costo desde $s$ hasta cada vértice $v \in V$.

---

## 2. Invariante del Conjunto Explorado y Regla Greedy

El algoritmo mantiene una partición de los vértices en dos conjuntos:
- $S \subseteq V$: el conjunto de vértices cuyas distancias más cortas finales ya han sido determinadas de forma permanente.
- $V \setminus S$: los vértices cuyas distancias aún son provisionales.

Inicialmente $S = \{s\}$ con $\text{dist}[s] = 0$, y para todo $v \ne s$, $\text{dist}[v] = \infty$.
En cada iteración, el algoritmo realiza una elección puramente greedy: selecciona el vértice $u \in V \setminus S$ que minimiza $\text{dist}[u]$, lo añade a $S$, y actualiza las distancias provisionales de sus vecinos salientes $v \in V \setminus S$ mediante el paso de relajación:
$$\text{dist}[v] \leftarrow \min(\text{dist}[v], \text{dist}[u] + w(u, v))$$

---

## 3. Demostración Formal de Correctitud por Inducción (Greedy Stays Ahead)

### Teorema de Optimalidad
Para todo vértice $u \in S$, el valor asignado $\text{dist}[u]$ es exactamente igual a la longitud del camino más corto $d(s, u)$.

*Demostración por inducción en $|S|$*:
- **Caso Base**: Inicialmente $|S| = 1$ con $S = \{s\}$. Como los pesos de las aristas son no negativos ($w(e) \ge 0$), ningún camino que salga de $s$ y regrese a él puede tener costo negativo. Por lo tanto, $d(s, s) = 0 = \text{dist}[s]$.
- **Paso Inductivo**: Supongamos que la hipótesis es válida para todo vértice en $S$. Sea $u \in V \setminus S$ el vértice seleccionado en el paso actual por minimizar $\text{dist}[u]$.
  Consideremos cualquier camino alternativo $P$ desde $s$ hasta $u$. Dado que $s \in S$ y $u \notin S$, el camino $P$ debe abandonar $S$ en alguna primera arista $(x, y)$, donde $x \in S$ e $y \notin S$.
  La longitud del camino $P$ satisface:
  $$w(P) \ge w(P_{s \to y}) = d(s, x) + w(x, y) \ge \text{dist}[y]$$
  Dado que el algoritmo eligió a $u$ en lugar de $y$ (o eventualmente $y = u$), por la regla de selección greedy se tiene $\text{dist}[u] \le \text{dist}[y]$.
  Por consiguiente:
  $$w(P) \ge \text{dist}[y] \ge \text{dist}[u]$$
  Como esto vale para cualquier camino $P$, ningún camino puede ser más corto que $\text{dist}[u]$, demostrando que $\text{dist}[u] = d(s, u)$.

---

## 4. Análisis Detallado de Complejidad Asintótica (Min-Heap)

- **Implementación con Min-Heap (Cola de Prioridad)**:
  - Cada vértice se inserta y extrae del heap exactamente una vez: $|V|$ operaciones `extract-min`, costando $O(|V| \log |V|)$.
  - Cada arista saliente se examina a lo sumo una vez para relajación: $|E|$ operaciones `decrease-key`, costando $O(|E| \log |V|)$.
  - **Complejidad Temporal Total**: $O((|V| + |E|) \log |V|)$. Con heaps de Fibonacci puede reducirse teóricamente a $O(|E| + |V| \log |V|)$.
- **Complejidad Espacial**: $O(|V|)$ para almacenar el heap, las distancias y el vector de predecesores.

---

## 5. Trampa de la Intuición Ingenua y Contraejemplos con Pesos Negativos

### La Trampa de las Aristas Negativas
La no-negatividad de las aristas ($w(e) \ge 0$) es indispensable. Si existen aristas negativas, el supuesto fundamental de que cualquier camino que sale de $S$ no puede acortarse al alargarse deja de cumplirse. Un nodo ya fijado en $S$ podría recibir una distancia menor a través de un camino posterior con aristas negativas, arruinando la corrección de Dijkstra (situación que exige el algoritmo de Bellman-Ford).
- **Aplicaciones Reales**: Protocolos de enrutamiento en Internet (OSPF, IS-IS), sistemas de navegación GPS y cálculo de rutas logísticas mínimas.
