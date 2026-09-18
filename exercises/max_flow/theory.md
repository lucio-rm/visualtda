# Redes de Flujo (Max Flow / Min Cut): Fundamento Teórico y Demostración

Referencia: Jon Kleinberg & Éva Tardos, *Algorithm Design*, Capítulo 7: "Network Flow".

---

## 1. Definición Formal de una Red de Flujo

Una **red de flujo** es una tupla $G = (V, E, s, t, c)$ donde:
- $(V, E)$ es un grafo dirigido sin aristas antiparalelas (o simplificable).
- $s \in V$ es el nodo **fuente** (source).
- $t \in V$ es el nodo **sumidero** (sink), con $s \ne t$.
- $c: E \to \mathbb{R}^+$ asigna a cada arista $e \in E$ una **capacidad** estrictamente positiva $c(e) > 0$.

### Definición de Flujo Factible
Una función $f: E \to \mathbb{R}_{\ge 0}$ es un **flujo factible** si satisface dos condiciones fundamentales:
1. **Restricción de Capacidad**: Para toda arista $e \in E$:
   $$0 \le f(e) \le c(e)$$
2. **Conservación de Flujo**: Para todo vértice intermedio $v \in V \setminus \{s, t\}$:
   $$\sum_{e = (u, v) \in E} f(e) = \sum_{e = (v, w) \in E} f(e)$$
   *(El flujo entrante a un nodo debe ser idéntico al flujo saliente).*

El **valor del flujo**, denotado $v(f)$, es la cantidad neta que sale de la fuente:
$$v(f) = \sum_{e = (s, u) \in E} f(e) - \sum_{e = (u, s) \in E} f(e)$$

---

## 2. Cortes $s-t$ y Capacidad del Corte

Un **corte $s-t$**, denotado $(A, B)$, es una partición de los vértices $V$ tal que $s \in A$ y $t \in B$, con $A \cup B = V$ y $A \cap B = \emptyset$.

La **capacidad del corte**, denotada $c(A, B)$, es la suma de las capacidades de las aristas que van **estrictamente de $A$ hacia $B$**:
$$c(A, B) = \sum_{u \in A, \, v \in B, \, (u, v) \in E} c(u, v)$$
*(Las aristas en sentido inverso de $B$ hacia $A$ no suman a la capacidad del corte).*

### Lema de Dualidad Débil
**Lema**: Para cualquier flujo factible $f$ y cualquier corte $s-t$ $(A, B)$:
$$v(f) \le c(A, B)$$

*Demostración*:
Por la propiedad de conservación de flujo sumada sobre todos los nodos $u \in A$:
$$v(f) = \sum_{u \in A} \left( \sum_{(u, v) \in E} f(u, v) - \sum_{(v, u) \in E} f(v, u) \right)$$
Las aristas internas con ambos extremos en $A$ se cancelan mutuamente (aparecen una vez positiva y una vez negativa). Por tanto:
$$v(f) = \sum_{u \in A, v \in B, (u, v) \in E} f(u, v) - \sum_{v \in B, u \in A, (v, u) \in E} f(v, u)$$
Dado que $f(e) \ge 0$ para toda arista y $f(e) \le c(e)$ para aristas que cruzan de $A$ a $B$:
$$v(f) \le \sum_{u \in A, v \in B, (u, v) \in E} f(u, v) \le \sum_{u \in A, v \in B, (u, v) \in E} c(u, v) = c(A, B) \quad \blacksquare$$

**Corolario**: Si encontramos un flujo $f$ y un corte $(A, B)$ tales que $v(f) = c(A, B)$, entonces $f$ es **estrictamente un flujo máximo** y $(A, B)$ es **estrictamente un corte mínimo**.

---

## 3. Red Residual $G_f$ y Caminos de Aumento

Dada una red $G$ y un flujo factible $f$, la **red residual** $G_f = (V, E_f)$ modela la capacidad disponible para empujar flujo adicional o deshacer flujo previamente enviado:

Para cada arista $e = (u, v) \in E$:
1. **Arista Hacia Adelante (Forward)**: Si $f(e) < c(e)$, existe una arista $(u, v) \in E_f$ con capacidad residual:
   $$c_f(u, v) = c(e) - f(e)$$
2. **Arista Hacia Atrás (Backward)**: Si $f(e) > 0$, existe una arista inversa $(v, u) \in E_f$ con capacidad residual:
   $$c_f(v, u) = f(e)$$

Un **camino de aumento** (augmenting path) es un camino simple $P$ desde $s$ hasta $t$ en la red residual $G_f$.
La capacidad del cuello de botella de $P$ es:
$$\text{bottleneck}(P, f) = \min_{e \in P} c_f(e) > 0$$

Al aumentar el flujo a lo largo de $P$ en $\Delta = \text{bottleneck}(P, f)$, el valor del flujo se incrementa exactamente en $\Delta$: $v(f') = v(f) + \Delta$.

---

## 4. Teorema Fundamental del Flujo Máximo y Corte Mínimo (Max-Flow Min-Cut)

**Teorema**: Las siguientes tres afirmaciones son mutuamente equivalentes:
1. Existe un corte $s-t$ $(A^*, B^*)$ tal que $v(f) = c(A^*, B^*)$.
2. El flujo $f$ es un flujo máximo en $G$.
3. No existe ningún camino de aumento en la red residual $G_f$.

*Demostración ($3 \implies 1$)*:
Supongamos que en $G_f$ no existe ningún camino simple desde $s$ hasta $t$.
Definamos:
$$A^* = \{v \in V : \text{existe un camino en } G_f \text{ desde } s \text{ hasta } v\}, \quad B^* = V \setminus A^*$$
Como no hay camino de $s$ a $t$ en $G_f$, claramente $s \in A^*$ y $t \in B^*$. Por tanto, $(A^*, B^*)$ es un corte $s-t$ válido.

Para cualquier arista original $e = (u, v)$ con $u \in A^*$ y $v \in B^*$:
- Si $f(e) < c(e)$, existiría la arista residual $(u, v)$ en $G_f$, lo que implicaría que $v$ sería alcanzable desde $s$, contradiciendo que $v \in B^*$. Por ende, necesariamente $f(e) = c(e)$.
- Para cualquier arista original $e' = (v, u)$ con $v \in B^*$ y $u \in A^*$: si $f(e') > 0$, existiría la arista residual inversa $(u, v)$ en $G_f$, lo que de nuevo haría $v$ alcanzable desde $s$. Por ende, necesariamente $f(e') = 0$.

Sustituyendo en la fórmula del valor del flujo:
$$v(f) = \sum_{u \in A^*, v \in B^*} f(u, v) - \sum_{v \in B^*, u \in A^*} f(v, u) = \sum_{u \in A^*, v \in B^*} c(u, v) - 0 = c(A^*, B^*)$$
Por el Lema de Dualidad Débil, esto prueba simultáneamente que $f$ es máximo y $(A^*, B^*)$ es mínimo. $\blacksquare$

---

## 5. El Algoritmo de Edmonds-Karp y Complejidad

El método genérico de Ford-Fulkerson no especifica cómo elegir el camino de aumento. Con capacidades irracionales, podría no converger, o con capacidades enteras grandes tardar $O(E \cdot v(f))$.

El algoritmo de **Edmonds-Karp** (1972) resuelve esto eligiendo siempre el camino de aumento con la **menor cantidad de aristas** mediante una **Búsqueda en Amplitud (BFS)**:
- La distancia más corta desde $s$ a cualquier nodo en $G_f$ es monótonamente no decreciente a lo largo de las iteraciones.
- Cada arista crítica desaparece de $G_f$ y solo puede reaparecer después de que la distancia aumentó en al menos 2.
- Como la distancia máxima está acotada por $|V|$, cada arista puede ser crítica a lo sumo $|V|/2$ veces.
- Con $|E|$ aristas posibles, el número total de aumentos está acotado por $O(|V| \cdot |E|)$.
- Cada BFS toma $O(|E|)$ tiempo.
- **Complejidad Total**: $O(|V| \cdot |E|^2)$, independientemente de las magnitudes de las capacidades.
