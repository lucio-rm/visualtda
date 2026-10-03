# Problema del Viajante de Comercio (TSP) por Ramificación y Poda (Branch & Bound)

## 1. Definición Formal y Planteo de la Explosión $(n-1)!$

Dado un conjunto de $n$ ciudades $V = \{1, 2, \dots, n\}$ y una matriz de distancias o costos $C = [c_{i,j}]$ entre cada par de ciudades con $c_{i,j} \ge 0$, el Problema del Viajante de Comercio (TSP, por sus siglas en inglés) consiste en encontrar un recorrido cerrado (tour) que visite cada ciudad exactamente una vez y regrese a la ciudad de origen, minimizando el costo total:
$$\min_{\pi \in S_n} \left( \sum_{i=1}^{n-1} c_{\pi(i), \pi(i+1)} + c_{\pi(n), \pi(1)} \right)$$

El TSP es NP-hard en sentido fuerte. La fuerza bruta explora $(n-1)! / 2$ tours posibles. El paradigma de **Ramificación y Poda (Branch & Bound)** permite hallar la solución óptima exacta podando subárboles masivos mediante cotas inferiores formales.

---

## 2. Principio de Branch & Bound y Cotas Inferiores Admisibles

En cada nodo del árbol de búsqueda, representamos un tour parcial $P = (v_1, v_2, \dots, v_k)$ con costo acumulado:
$$c_{\text{acumulado}} = \sum_{i=1}^{k-1} c_{v_i, v_{i+1}}$$

Para decidir si expandir o podar el nodo, se calcula una **cota inferior admisible** $LB(nodo)$ (*Lower Bound*) de cualquier tour completo que extienda a $P$:
$$LB(nodo) = c_{\text{acumulado}} + \text{estimación admisible del resto}$$

**Propiedad de Admisibilidad**: La función $LB$ debe ser un estimador optimista riguroso: nunca debe sobreestimar el costo real ($LB \le \text{Costo Real}$).
Si $LB(nodo) \ge \text{Mejor Solución Completa Conocida}$, ningún descendiente de este nodo podrá mejorar el récord actual, por lo que el nodo se poda de inmediato.

---

## 3. Métodos Canónicos de Cota Inferior: 1-Tree y Reducción de Matrices

1. **Suma de las Aristas Mínimas Incidentes (Little et al.)**:
   Para cada vértice no visitado $u \in V \setminus P$, cualquier tour válido debe llegar a $u$ por alguna arista y salir de él por otra. Tomando la mitad de la suma de las dos aristas incidentes de menor costo para cada ciudad libre (junto con las aristas obligadas del camino parcial), se obtiene una cota inferior válida en tiempo $O(n^2)$.
2. **Reducción Matricial (Filas y Columnas)**:
   Al restar el valor mínimo de cada fila y de cada columna de la matriz de costos residual, el total sustraído representa un costo ineludible que cualquier tour debe pagar.
3. **Árbol Generador Mínimo 1-Tree (Held & Karp)**:
   Un tour hamiltoniano es un árbol generador del conjunto de ciudades $\{2, \dots, n\}$ más dos aristas incidentes a la ciudad 1. Por lo tanto, el costo del MST sobre las ciudades restantes más las dos aristas más baratas que conectan con el origen provee una cota inferior extraordinariamente ajustada.

---

## 4. Demostración de Optimalidad Global de la Poda y Criterio Best-First

### Teorema de Poda Exacta
Sea $S^*$ la mejor solución factible completa encontrada hasta el momento. Si para un nodo $u$ se cumple $LB(u) \ge \text{costo}(S^*)$, ningún tour que complete $u$ puede tener costo $< \text{costo}(S^*)$ por admisibilidad de $LB$. La poda del subárbol de $u$ preserva intacta la solución óptima global.
- **Estrategia Best-First**: Al expandir prioritariamente nodos con menor $LB$, se alcanzan hojas de bajo costo rápidamente, elevando la calidad de la cota superior y podando ramas secundarias.

---

## 5. Análisis de Complejidad Asintótica y Desempeño Frente a Fuerza Bruta

- **Complejidad Temporal**: En el peor caso absoluto, el algoritmo explora $O(n!)$ estados. Con cotas inferiores de alta calidad como reducción matricial o 1-Tree y una buena heurística inicial (como Nearest Neighbor para fijar una cota superior temprana), el número real de nodos evaluados para $n \le 30$ se reduce en órdenes de magnitud.
- **Complejidad Espacial**: $O(n^2)$ para almacenar las matrices de costos reducidas en la pila de llamadas, o proporcional a la cantidad de nodos vivos en una cola de prioridad.

---

## 6. Trampa de la Intuición Ingenua: El Fracaso del Vecino Más Cercano (Nearest Neighbor)

### La Ilusión de la Elección Miope
La heurística más intuitiva para TSP consiste en elegir en cada paso la ciudad no visitada más cercana (*Nearest Neighbor*). Aunque opera en tiempo $O(n^2)$, esconde una trampa estructural severa:

### Contraejemplo de la "Ciudad Varada":
- Consideremos 4 ciudades ubicadas en una recta: $A$ en $0$, $B$ en $1$, $C$ en $-2$, y $D$ en $10$.
  - Partiendo de $A(0)$:
  - La ciudad más cercana es $B(1)$ (distancia $1$).
  - Desde $B$, la no visitada más cercana es $C(-2)$ (distancia $3$).
  - Desde $C$, la única restante es $D(10)$ (distancia $12$).
  - Regreso de $D(10)$ a $A(0)$: distancia $10$.
  - **Costo Total Nearest Neighbor**: $1 + 3 + 12 + 10 = 26$.
- **Tour Óptimo**: $A \to C \to D \to B \to A$.
  - Distancias: $2 + 12 + 9 + 1 = 24$. (O en configuraciones con más puntos geométricos donde la última ciudad queda forzosamente aislada al final del recorrido, la relación de error crece como $\Theta(\log n)$ en espacios métricos y sin límite en grafos generales).

Nearest Neighbor "paga barato" al principio a expensas de quedar arrinconado con una arista final catastrófica. **Branch and Bound** evita esta trampa porque sus cotas inferiores ($LB$) contemplan el impacto global de las decisiones futuras.

