## Árbol Generador Mínimo de Kruskal

### 1. Definición Formal del Problema
Dado un grafo conexo y no dirigido $G = (V, E)$ donde cada arista $e \in E$ posee un costo real $c_e$, un **Árbol Generador Mínimo** (MST, por sus siglas en inglés) es un subconjunto de aristas $T \subseteq E$ tal que $(V, T)$ es conexo, acíclico (un árbol que abarca todos los vértices), y minimiza el costo total:
$$c(T) = \sum_{e \in T} c_e$$

---

### 2. La Propiedad del Corte (Cut Property)
**Teorema Fundamental del Corte**: Sea $S \subset V$ un subconjunto propio y no vacío de vértices, y sea el corte asociado $(S, V \setminus S)$ el conjunto de aristas con un extremo en $S$ y otro en $V \setminus S$. Si $e^* = (u, v)$ es la arista de costo estrictamente mínimo que cruza dicho corte, entonces $e^*$ pertenece necesariamente a **todo** árbol generador mínimo de $G$.

*Demostración (Argumento de Intercambio)*:
Sea $T$ un MST que hipotéticamente no contiene a $e^*$. Como $T$ es un árbol conexo, al añadir $e^*$ a $T$ se crea exactamente un ciclo simple $C$. Dado que $u \in S$ y $v \in V \setminus S$, el ciclo $C$ debe cruzar el corte $(S, V \setminus S)$ en al menos otra arista $e' \ne e^*$.
Construimos un nuevo árbol generador $T' = (T \setminus \{e'\}) \cup \{e^*\}$. El costo total de $T'$ es:
$$c(T') = c(T) - c_{e'} + c_{e^*}$$
Como $e^*$ es la arista de costo mínimo del corte, $c_{e^*} \le c_{e'}$, lo que implica $c(T') \le c(T)$. Dado que $T$ ya era óptimo, $c(T') = c(T)$, demostrando que $T'$ es también un MST que sí contiene a $e^*$. Si los costos son estrictamente distintos, $c(T') < c(T)$, contradiciendo la optimalidad de $T$.

---

### 3. Mecanismo Greedy e Invariante de Kruskal
1. **Ordenamiento**: Se ordenan todas las aristas de $E$ en orden no decreciente de peso: $c(e_1) \le c(e_2) \le \dots \le c(e_m)$.
2. **Selección Acíclica**: Se inicializa $T = \emptyset$. Se itera sobre las aristas ordenadas; si los extremos $u$ y $v$ de la arista candidata pertenecen a componentes conexas distintas, la arista se añade a $T$; de lo contrario, se descarta (pues formaría un ciclo).
3. **Invariante**: En cada paso, el conjunto de aristas acumulado $T$ es un subconjunto de algún árbol generador mínimo de $G$. Cada arista aceptada cruza el corte entre su componente conexa y el resto del grafo como arista de costo mínimo admisible.

---

### 4. Complejidad Asintótica y Union-Find
Para verificar eficientemente la conectividad de los extremos sin explorar caminos en cada paso, se emplea la estructura de datos **Disjoint-Set (Union-Find)** con unión por rango y compresión de caminos:
- **Ordenamiento de aristas**: $O(|E| \log |E|)$ comparaciones. Como $|E| \le |V|^2$, $\log |E| \le 2 \log |V|$, por lo que esta etapa toma $O(|E| \log |V|)$.
- **Operaciones de Union-Find**: Se ejecutan $2|E|$ operaciones `find` y $|V| - 1$ operaciones `union`. Con compresión de caminos, el tiempo amortizado por operación es $O(\alpha(|V|))$, donde $\alpha$ es la inversa de la función de Ackermann (una constante $\le 4$ para todo valor práctico).
- **Complejidad Temporal Total**: $O(|E| \log |V|)$, dominada por el ordenamiento inicial.
- **Complejidad Espacial**: $O(|V|)$ para almacenar los vectores de padres y rangos en Union-Find.
