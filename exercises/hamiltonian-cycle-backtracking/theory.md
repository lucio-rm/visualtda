## Ciclo Hamiltoniano y Búsqueda Exhaustiva

### 1. Definición Formal y NP-Completitud
Dado un grafo no dirigido o dirigido $G = (V, E)$ con $n = |V|$ vértices, un **Ciclo Hamiltoniano** es un ciclo simple cerrado que visita cada vértice de $V$ exactamente una vez y regresa al vértice de partida.

El problema de decisión ("¿posee $G$ un ciclo hamiltoniano?") es uno de los 21 problemas NP-completos fundacionales de Richard Karp (1972). A diferencia del Ciclo Euleriano (que recorre cada arista una vez y puede resolverse en tiempo lineal $O(|E|)$ mediante el teorema de Euler), no se conoce ningún algoritmo polinomial para el Ciclo Hamiltoniano en grafos generales.

---

### 2. Espacio de Soluciones y Árbol de Permutaciones
Una aproximación por fuerza bruta pura generaría las $(n-1)!$ posibles permutaciones de los vértices (fijando un vértice inicial arbitrario por simetría circular) y verificaría para cada una si todas las aristas consecutivas existen en $E$. Para $n = 20$, $(20-1)! \approx 1.2 \times 10^{17}$ permutaciones, lo que resulta computacionalmente intratable.

El algoritmo de **Backtracking** construye el ciclo paso a paso como un vector $P = [v_0, v_1, \dots, v_k]$:
- Se fija el vértice inicial $v_0 \in V$.
- En el paso $k$ ($1 \le k < n$), se ensaya como sucesor $v_k$ a cada vecino $u$ de $v_{k-1}$ que cumpla dos condiciones de factibilidad inmediata:
  1. $(v_{k-1}, u) \in E$ (existe la arista de enlace).
  2. $u \notin \{v_0, v_1, \dots, v_{k-1}\}$ (el vértice no ha sido visitado previamente en el camino).
- Si en algún paso ningún vecino satisface estas condiciones, la rama se poda de raíz y el algoritmo retrocede (backtrack) para probar otro sucesor en el nivel anterior.
- Al alcanzar la longitud $n$, se comprueba si la arista de cierre $(v_{n-1}, v_0) \in E$ existe para completar el ciclo.

---

### 3. Técnicas de Poda y Optimización
Para acelerar la búsqueda y evitar explorar subárboles condenados al fracaso:
1. **Poda por Grado de Vértice**: Si en cualquier instante del recorrido existe algún vértice no visitado $w$ tal que todos sus vecinos excepto a lo sumo uno ya han sido consumidos en el camino, $w$ jamás podrá formar parte de un ciclo simple (que requiere dos aristas incidentes distintas). La rama se poda inmediatamente.
2. **Conectividad Residual**: Si el subgrafo inducido por los vértices aún no visitados junto con los extremos del camino actual deja de ser conexo, no es posible cerrar un ciclo simple.
3. **Simetría y Dirección**: En grafos no dirigidos, para cualquier ciclo $v_0 - v_1 - \dots - v_{n-1} - v_0$ existe su reflejo idéntico invertido. Forzar que el índice del segundo vértice sea menor que el del último ($v_1 < v_{n-1}$) reduce el espacio de búsqueda a la mitad exacta.

---

### 4. Complejidad Asintótica
- **Complejidad Temporal**: En el peor caso (grafo completo $K_n$), el algoritmo explora $\Theta(n!)$ estados. En grafos esparcidos con grado máximo $\Delta$, la complejidad temporal está acotada por $O(\Delta^n)$.
- **Complejidad Espacial**: $O(n)$ en memoria auxiliar, correspondiente al vector del camino actual y a la pila de llamadas de recursión, con un vector booleano de pertenencia para pruebas en $O(1)$.
