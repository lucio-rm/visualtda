## TSP: Problema del Viajante de Comercio por Branch & Bound

### 1. Definición Formal y Planteo
Dado un conjunto de $n$ ciudades $V = \{1, 2, \dots, n\}$ y una matriz de distancias o costos $C = [c_{i,j}]$ entre cada par de ciudades con $c_{i,j} \ge 0$, el Problema del Viajante de Comercio (TSP, por sus siglas en inglés) consiste en encontrar un recorrido cerrado (tour) que visite cada ciudad exactamente una vez y regrese a la ciudad de origen, minimizando el costo total:
$$\min_{\pi \in S_n} \left( \sum_{i=1}^{n-1} c_{\pi(i), \pi(i+1)} + c_{\pi(n), \pi(1)} \right)$$

El TSP es NP-hard en sentido fuerte. La fuerza bruta explora $(n-1)! / 2$ tours posibles. El paradigma de **Ramificación y Poda (Branch & Bound)** permite hallar la solución óptima exacta podando subárboles masivos mediante cotas inferiores formales.

---

### 2. Principio de Branch & Bound y Cotas Inferiores
En cada nodo del árbol de búsqueda, representamos un tour parcial $P = (v_1, v_2, \dots, v_k)$ con costo acumulado:
$$c_{\text{acumulado}} = \sum_{i=1}^{k-1} c_{v_i, v_{i+1}}$$

Para decidir si expandir o podar el nodo, se calcula una **cota inferior admisible** $LB(nodo)$ (*Lower Bound*) de cualquier tour completo que extienda a $P$:
$$LB(nodo) = c_{\text{acumulado}} + \text{estimación admisible del resto}$$

**Propiedad de Admisibilidad**: La función $LB$ debe ser un estimador optimista riguroso: nunca debe sobreestimar el costo real ($LB \le \text{Costo Real}$).
Si $LB(nodo) \ge \text{Mejor Solución Completa Conocida}$, ningún descendiente de este nodo podrá mejorar el récord actual, por lo que el nodo se poda de inmediato.

---

### 3. Métodos Canónicos de Cota Inferior
1. **Suma de las Aristas Mínimas Incidentes (Little et al.)**:
   Para cada vértice no visitado $u \in V \setminus P$, cualquier tour válido debe llegar a $u$ por alguna arista y salir de él por otra. Tomando la mitad de la suma de las dos aristas incidentes de menor costo para cada ciudad libre (junto con las aristas obligadas del camino parcial), se obtiene una cota inferior válida en tiempo $O(n^2)$.
2. **Reducción Matricial (Filas y Columnas)**:
   Al restar el valor mínimo de cada fila y de cada columna de la matriz de costos residual, el total sustraído representa un costo ineludible que cualquier tour debe pagar.
3. **Árbol Generador Mínimo 1-Tree (Held & Karp)**:
   Un tour hamiltoniano es un árbol generador del conjunto de ciudades $\{2, \dots, n\}$ más dos aristas incidentes a la ciudad 1. Por lo tanto, el costo del MST sobre las ciudades restantes más las dos aristas más baratas que conectan con el origen provee una cota inferior extraordinariamente ajustada.

---

### 4. Complejidad Asintótica
- **Complejidad Temporal**: En el peor caso absoluto, el algoritmo explora $O(n!)$ estados. Con cotas inferiores de alta calidad como reducción matricial o 1-Tree y una buena heurística inicial (como Nearest Neighbor para fijar una cota superior temprana), el número real de nodos evaluados para $n \le 30$ se reduce en órdenes de magnitud.
- **Complejidad Espacial**: $O(n^2)$ para almacenar las matrices de costos reducidas en la pila de llamadas, o proporcional a la cantidad de nodos vivos en una cola de prioridad.
