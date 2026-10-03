# Reducción Polinomial: Conjunto Independiente y Cobertura de Vértices

**Referencia Canónica**: Kleinberg & Tardos, *Algorithm Design*, Capítulo 8, Sección 8.1: *"A First Reduction: Independent Set and Vertex Cover"*.

---

## 1. Definiciones Formales

Sea $G = (V, E)$ un grafo no dirigido simple con $n = |V|$ vértices y $m = |E|$ aristas.

### Conjunto Independiente (Independent Set - IS)
Un subconjunto de vértices $S \subseteq V$ es un **Conjunto Independiente** si ningún par de vértices en $S$ está conectado por una arista:
$$\forall u, v \in S, \quad (u, v) \notin E$$

### Cobertura de Vértices (Vertex Cover - VC)
Un subconjunto de vértices $C \subseteq V$ es una **Cobertura de Vértices** si cada arista del grafo tiene al menos uno de sus extremos en $C$:
$$\forall (u, v) \in E, \quad u \in C \;\lor\; v \in C$$

---

## 2. Teorema Fundamental de Complementariedad (K&T 8.1)

> **Teorema**: Sea $G = (V, E)$ un grafo y $S \subseteq V$.  
> $S$ es un conjunto independiente en $G$ si y solo si su conjunto complementario $V \setminus S$ es una cobertura de vértices en $G$.

### Demostración Formal ($\iff$):

1. **Ida ($\Longrightarrow$)**:
   - Supongamos que $S$ es un conjunto independiente.
   - Consideremos cualquier arista arbitraria $e = (u, v) \in E$.
   - Dado que $S$ es independiente, es imposible que ambos extremos $\{u, v\}$ pertenezcan simultáneamente a $S$ (de lo contrario, existiría una arista uniendo dos vértices de $S$).
   - Por ende, al menos uno de los extremos debe quedar fuera de $S$, es decir:
     $$u \notin S \implies u \in (V \setminus S) \quad \text{o bien} \quad v \notin S \implies v \in (V \setminus S)$$
   - Como esto ocurre para toda arista $e \in E$, el conjunto complementario $C = V \setminus S$ incide sobre todas las aristas de $G$.
   - Por definición, $V \setminus S$ es una **cobertura de vértices**.

2. **Vuelta ($\Longleftarrow$)**:
   - Supongamos ahora que $C = V \setminus S$ es una cobertura de vértices.
   - Queremos demostrar que ningún par de vértices en $S$ comparte una arista.
   - Razonemos por reducción al absurdo: supongamos que existieran $u, v \in S$ tales que $(u, v) \in E$.
   - Dado que $C$ es una cobertura de vértices, la arista $(u, v)$ debe tener al menos un extremo en $C$.
   - Pero si $u \in C$, entonces $u \notin S$ (por ser $C = V \setminus S$). De igual forma, si $v \in C$, entonces $v \notin S$.
   - Esto contradice directamente que $u \in S$ y $v \in S$.
   - En consecuencia, no puede existir ninguna arista con ambos extremos en $S$.
   - Por definición, $S$ es un **conjunto independiente**.

Q.E.D. $\blacksquare$

---

## 3. Reducción Polinomial Bidireccional

### De Independent Set a Vertex Cover ($\text{IS} \le_P \text{VC}$):
- Instancia de IS: Dado $(G, k)$, ¿tiene $G$ un conjunto independiente de tamaño al menos $k$?
- Función de reducción: Construimos la instancia de VC $(G, k')$ con el mismo grafo $G$ y $k' = |V| - k$.
- La reducción toma tiempo $O(|V| + |E|)$ (tiempo lineal, trivialmente polinomial).
- Por el teorema: $G$ tiene un IS de tamaño $\ge k \iff G$ tiene un VC de tamaño $\le |V| - k$.

### Dualidad entre Optimización:
$$\max |S| \iff \min |V \setminus S|$$
El problema de hallar el **Conjunto Independiente Máximo** es exactamente dual y equivalente a encontrar la **Cobertura de Vértices Mínima**.
Ambos problemas pertenecen a la clase de problemas **NP-completos** (Karp, 1972).

---

## 4. Complejidad Temporal y Espacial

- **Tiempo de Reducción**: $O(|V| + |E|)$. La transformación de una instancia de Conjunto Independiente a una de Cobertura de Vértices simplemente toma el mismo grafo $G$ e invierte el parámetro objetivo: $k' = |V| - k$. Esto se evalúa en tiempo constante $O(1)$ sobre los parámetros o lineal $O(|V| + |E|)$ si se copia el grafo.
- **Espacio de Reducción**: $O(|V| + |E|)$ para representar el grafo y los conjuntos solución.
- **Complejidad de Resolución Exacta**: Dado que ambos problemas son NP-completos, resolver cualquiera de los dos en forma exacta requiere tiempo exponencial $O(2^{|V|})$ en el caso general mediante algoritmos exhaustivos o de ramificación y poda (Branch and Bound).

---

## 5. Trampa de la Intuición Ingenua y Errores Habituales en Reducciones

### Trampa 1: Inversión en la Dirección de la Reducción Polinomial
Un error fundamental frecuente al argumentar dureza NP consiste en invertir el sentido de la reducción:
- Para demostrar que un problema nuevo $Y$ es NP-completo, se debe reducir **un problema conocido difícil $X$ hacia el nuevo problema $Y$** ($X \le_P Y$). Esto demuestra que si existiera un algoritmo polinomial para $Y$, podríamos usarlo como subrutina para resolver $X$ en tiempo polinomial.
- Reducir al revés ($Y \le_P X$) solo demostraría que $Y$ no es más difícil que $X$, pero no aporta ninguna cota inferior de dificultad para $Y$.

### Trampa 2: La Falsa Preservación de Aproximaciones a Través del Complemento
Una intuición ingenua muy común es pensar que, debido a que $S = V \setminus C$, cualquier buena aproximación para Cobertura de Vértices (como la 2-aproximación de matching maximal) produce inmediatamente una buena aproximación para Conjunto Independiente tomando su complemento:
- Consideremos un grafo con $n = 1000$ vértices donde el Conjunto Independiente óptimo tiene tamaño $|S^*| = 10$.
- Por el teorema de complementariedad, la Cobertura de Vértices mínima óptima tiene tamaño $|C^*| = n - |S^*| = 990$.
- Un algoritmo de 2-aproximación para Vertex Cover puede legítimamente devolver una cobertura $C$ de tamaño $|C| \le 2 \cdot 990$, la cual en un grafo de 1000 vértices puede tomar hasta $n = 1000$ vértices.
- El conjunto complementario devuelto para Conjunto Independiente sería $S = V \setminus C$, con tamaño $|S| = 1000 - 1000 = 0$.
- ¡El error relativo respecto a la solución óptima ($|S^*| = 10$) es catastrófico!
- De hecho, mientras que Vertex Cover admite una 2-aproximación polinomial trivial, Independent Set es **inaproximable** dentro de un factor $n^{1-\varepsilon}$ para cualquier $\varepsilon > 0$ salvo que $P = NP$ (Håstad, 1999). Las garantías de aproximación **no** se conservan bajo operaciones de resta con respecto a una constante universal.

