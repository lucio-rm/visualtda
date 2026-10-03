# Algoritmos de Aproximación: 2-Aproximación para Cobertura de Vértices

**Referencia Canónica**: Kleinberg & Tardos, *Algorithm Design*, Capítulo 11, Sección 11.1: *"A Greedy 2-Approximation for Vertex Cover"*.

---

## 1. Motivación y Contexto

El problema de la **Cobertura de Vértices Mínima (Minimum Vertex Cover)** es NP-completo (Karp, 1972). No se conoce ningún algoritmo que encuentre la solución óptima exacta en tiempo polinomial (a menos que $P = NP$).

Frente a la intractabilidad computacional, la teoría de **Algoritmos de Aproximación** busca algoritmos que:
1. Se ejecuten en tiempo polinomial estricto $O(n^c)$.
2. Produzcan siempre una solución factible.
3. Garanticen matemáticamente que el costo de la solución devuelta está acotado por un factor constante respecto del óptimo global:
   $$\frac{\text{Costo}(C)}{\text{Costo}(C^*)} \le \rho$$
   donde $\rho$ es el **ratio de aproximación** ($\rho = 2$ en este algoritmo).

---

## 2. El Algoritmo de Matching Maximal

```text
Inicializar C ← ∅
Inicializar M ← ∅

MIENTRAS exista una arista e = (u, v) no cubierta por C:
    Agregar e = (u, v) a M
    Agregar ambos extremos u y v a C

RETORNAR C y M
```

---

## 3. Demostración Formal de la Garantía de 2-Aproximación

> **Teorema (K&T 11.1)**: El conjunto $C$ retornado es una cobertura de vértices tal que $|C| \le 2 \cdot |C^*|$, donde $C^*$ es una cobertura de vértices mínima óptima.

### Demostración:

1. **Factibilidad**:
   - El bucle sólo termina cuando no queda ninguna arista descubierta.
   - En consecuencia, toda arista $e \in E$ tiene al menos un extremo en $C$. Por definición, $C$ es una cobertura de vértices válida.

2. **Cota Inferior del Óptimo ($|C^*| \ge |M|$)**:
   - Consideremos el conjunto de aristas $M$ seleccionadas por el algoritmo.
   - Por construcción, cuando una arista $(u, v)$ es elegida, ambos extremos entran en $C$. Toda arista examinada posteriormente que comparta un extremo con $(u, v)$ ya estará cubierta y será ignorada.
   - Por ende, **ningún par de aristas en $M$ comparte un vértice**; $M$ es un **matching** (apareamiento disjunto de aristas).
   - Cualquier cobertura de vértices válida, incluida la solución óptima desconocida $C^*$, debe cubrir obligatoriamente cada arista de $M$.
   - Como las aristas de $M$ no comparten vértices, ningún vértice de $C^*$ puede cubrir simultáneamente más de una arista de $M$.
   - En consecuencia, $C^*$ debe contener al menos un vértice distinto por cada arista de $M$:
     $$|C^*| \ge |M|$$

3. **Conclusión del Ratio**:
   - El algoritmo agrega exactamente 2 vértices por cada arista seleccionada en $M$:
     $$|C| = 2 \cdot |M|$$
   - Multiplicando la cota inferior por 2:
     $$|C| = 2 \cdot |M| \le 2 \cdot |C^*|$$
   - Dividiendo por $|C^*|$:
     $$\frac{|C|}{|C^*|} \le 2$$

Q.E.D. $\blacksquare$

---

## 4. Complejidad Temporal y Espacial

- **Tiempo**: $O(|V| + |E|)$. En una sola pasada sobre la lista de adyacencia o conjunto de aristas, cada arista es inspeccionada en tiempo $O(1)$ utilizando conjuntos hash para consultar membresía.
- **Espacio**: $O(|V| + |E|)$ para almacenar la estructura del grafo, el conjunto de cobertura $C$ y el matching $M$.

---

## 5. Trampa de la Intuición Ingenua: La Heurística Voraz de Máximo Grado

### Por Qué la Heurística de Máximo Grado Falla en Producir una Cota Constante
La intuición más extendida para Vertex Cover consiste en elegir vorazmente en cada paso el vértice que tenga el mayor grado residual en el grafo, con la esperanza de cubrir la mayor cantidad posible de aristas no cubiertas.
Sin embargo, esta heurística voraz **no** logra un factor de aproximación constante: sobre familias de grafos bipartitos especialmente construidos, la relación entre el tamaño de la cobertura voraz y el óptimo crece como $\Theta(\log |V|)$.
Por el contrario, el algoritmo de Matching Maximal, aunque parece contraintuitivo al incorporar ambos extremos de la arista en lugar de solo uno, garantiza estrictamente una cota constante $\le 2 \cdot |C^*|$ para cualquier grafo.
