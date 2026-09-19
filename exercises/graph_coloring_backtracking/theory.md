# Teoría y Demostración: Coloreo de Grafos ($k$-Coloring)

## 1. Planteo del Problema
Dado un grafo no dirigido $G = (V, E)$ y un entero $k \ge 1$, determinar si existe una función de coloración:
$$c : V \to \{1, 2, \dots, k\}$$
tal que para toda arista $(u, v) \in E$, se cumpla $c(u) \ne c(v)$.
El menor entero $k$ para el cual existe tal función se denomina **número cromático** del grafo, denotado $\chi(G)$.

## 2. Complejidad Computacional
- Para $k = 2$, el problema es equivalente a determinar si $G$ es bipartito (sin ciclos impares), lo cual se resuelve en tiempo lineal $O(|V| + |E|)$ mediante BFS o DFS.
- Para $k \ge 3$, el problema es **NP-completo** (uno de los 21 problemas NP-completos originales de Karp, 1972). No se conoce ningún algoritmo determinístico en tiempo polinomial.

## 3. Demostración de Correctitud e Invariantes
1. **Invariante de Estado Parcial**: A profundidad `idx` en el árbol de recursión, los vértices $v_0, \dots, v_{idx-1}$ tienen asignados colores válidos en $\{1, \dots, k\}$ tales que no existe ninguna arista monocromática entre ellos.
2. **Poda Temprana de Subárbol**: Si al evaluar el vértice $v_{idx}$ con el color $c$ se detecta que algún vecino $u \in N(v_{idx})$ con índice previo ya tiene $c(u) = c$, la condición de adyacencia se viola. El algoritmo descarta inmediatamente esa rama sin explorar las $k^{|V| - idx - 1}$ asignaciones posibles para los vértices restantes.
3. **Completitud por Backtracking**: Si ningún color en $\{1, \dots, k\}$ resulta seguro para $v_{idx}$, la función retorna `False`, forzando a la recursión a retroceder al nivel $idx - 1$ para explorar el siguiente color disponible. Al desasignar (`del colores[v]`), se restaura de manera estricta el estado del espacio de búsqueda.
4. **Terminación**:
   - Si se alcanza `idx == |V|`, todos los vértices fueron asignados de manera admisible, por lo que la coloración es válida.
   - Si el árbol de recursión es explorado exhaustivamente sin éxito, se demuestra formalmente que $\chi(G) > k$.

## 4. Complejidad Asintótica
- **Tiempo**: $O(k^{|V|})$ en el peor caso de grafos densos o instancias sin solución. En grafos esparcidos o instancias con alta simetría, las podas tempranas podan la gran mayoría de las ramas inviables.
- **Espacio**: $O(|V|)$ espacio auxiliar, determinado por la profundidad máxima de la pila de llamadas de recursión y el mapa de asignación de colores.
