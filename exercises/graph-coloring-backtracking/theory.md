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

---

## 5. Trampa de la Intuición Ingenua: Heurísticas Voraces y Ordenamientos Fijos

### El Fracaso del Coloreo Voraz (Greedy Coloring)
Una heurística muy popular consiste en ordenar los vértices (por ejemplo, por grado decreciente como en el algoritmo de Welsh-Powell) y asignar a cada vértice vorazmente el primer color disponible $\{1, 2, \dots\}$ que no genere conflicto con sus vecinos ya coloreados.

### Contraejemplo de Desempeño Pobre: El Grafo Corona ($K_{n/2, n/2} - M$)
- Consideremos un grafo bipartito con dos particiones $A = \{a_1, \dots, a_m\}$ y $B = \{b_1, \dots, b_m\}$, donde cada $a_i$ está conectado a todos los vértices de $B$ **excepto** a $b_i$ (es decir, el grafo bipartito completo menos un matching perfecto).
- Dado que el grafo es bipartito, su número cromático es estrictamente $\chi(G) = 2$ (todos los de $A$ de un color, todos los de $B$ de otro).
- Sin embargo, si la heurística voraz procesa los vértices en el orden intercalado $a_1, b_1, a_2, b_2, \dots, a_m, b_m$:
  - $a_1$ recibe color 1. Como $b_1$ no está conectado a $a_1$, también recibe color 1.
  - Para $a_2$, sus vecinos incluyen a $b_1$ (color 1), por lo que debe recibir color 2. De igual modo $b_2$ no es adyacente a $a_2$, recibiendo color 2.
  - Siguiendo esta secuencia, ¡la heurística voraz utiliza $m = |V|/2$ colores distintos para un grafo que se colorea con solo 2!
- Debido a que $k$-Coloring es NP-completo para $k \ge 3$, ninguna estrategia miope puede evitar callejones sin salida sin retroceso sistemático (Backtracking) y poda de invariantes.

