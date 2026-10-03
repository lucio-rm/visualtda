# Mochila 0/1 por Ramificación y Poda (Branch & Bound): Cotas y Relajación

## 1. Definición Formal y Planteo del Problema

Dado un conjunto de $n$ elementos $\{1, 2, \dots, n\}$, cada uno con un peso entero $w_i > 0$ y un beneficio $v_i > 0$, junto con una capacidad máxima entera $W > 0$, el problema de la Mochila 0/1 busca el vector binario $x = (x_1, \dots, x_n) \in \{0, 1\}^n$ que:
$$\text{maximiza } \sum_{i=1}^n v_i x_i \quad \text{sujeto a} \quad \sum_{i=1}^n w_i x_i \le W$$

Dado que es un problema NP-completo, cuando la capacidad $W$ es exponencial respecto al tamaño de la entrada, la programación dinámica en tiempo pseudo-polinomial $O(n W)$ puede resultar inviable. El paradigma de **Branch & Bound** ofrece un método de optimización global exacta que poda regiones extensas del espacio de búsqueda mediante cotas superiores continuas.

---

## 2. Ramificación del Árbol de Estados y Estrategia Best-First

El espacio de soluciones se organiza como un árbol binario de decisiones de profundidad $n$:
- En el nivel $i$, se toma la decisión de incluir el ítem $i$ ($x_i = 1$) o excluirlo ($x_i = 0$).
- Cada nodo del árbol representa una solución parcial caracterizada por:
  - Nivel actual en el árbol $i$.
  - Beneficio acumulado $V_{\text{actual}} = \sum_{j=1}^i v_j x_j$.
  - Peso acumulado $W_{\text{actual}} = \sum_{j=1}^i w_j x_j$.
  - Cota superior calculada $UB$ (*Upper Bound*) de la ganancia máxima alcanzable en ese subárbol.

---

## 3. Cota Superior Admisible por Relajación Continua (Mochila Fraccionaria)

Para calcular $UB(nodo)$, se relaja la restricción de integralidad para los ítems restantes $\{i+1, \dots, n\}$, permitiendo tomar fracciones continuas $x_j \in [0, 1]$ (problema de la Mochila Fraccionaria):
1. Los ítems se preordenan en orden decreciente de densidad de valor:
   $$\frac{v_1}{w_1} \ge \frac{v_2}{w_2} \ge \dots \ge \frac{v_n}{w_n}$$
2. Desde el ítem $i+1$, se agregan greedy todos los ítems enteros que quepan en la capacidad residual $W - W_{\text{actual}}$.
3. Si el siguiente ítem crítico $k$ no cabe completamente, se toma la fracción exacta $\frac{W_{\text{residual}}}{w_k}$.
4. La cota superior matemática es:
   $$UB = V_{\text{actual}} + \sum_{j=i+1}^{k-1} v_j + \frac{W - W_{\text{acumulado}}}{w_k} v_k$$

### Teorema de Poda Exacta
Como el valor óptimo de cualquier problema de optimización entera es menor o igual al valor óptimo de su relajación continua ($V_{\text{entero}}^* \le V_{\text{relajado}}^*$), se tiene garantizado que ningún descendiente del nodo actual puede superar $UB$.
Si $UB \le \text{Mejor Entero Conocido}$, el subárbol completo se poda inmediatamente sin pérdida de optimalidad global.

---

## 4. Análisis Detallado de Complejidad Asintótica y Comparativa con DP

- **Estrategia Best-First Search**: Empleando una cola de prioridad (Max-Heap) ordenada por $UB$, se expande siempre el nodo con el mayor potencial teórico de mejora, acelerando la convergencia hacia la solución óptima y permitiendo podar el resto de nodos tempranamente.
- **Complejidad Temporal**: En el peor caso adverso, Branch & Bound evalúa $O(2^n)$ nodos. Sin embargo, en la práctica sobre instancias típicas, la relajación lineal continua provee una cota tan ajustada que solo se explora una fracción mínima de nodos.
- **Complejidad Espacial**: $O(2^n)$ en el peor caso para la cola de prioridad de nodos vivos en memoria, o $O(n)$ si se implementa mediante Depth-First Branch & Bound con poda monótona.

---

## 5. Trampa de la Intuición Ingenua y Cuándo Conviene Frente a DP

### Cuándo Elegir Branch & Bound vs Programación Dinámica
- Si la capacidad $W$ es pequeña ($W \le 10^5$), la Programación Dinámica $O(n W)$ es preferible por su garantía pseudo-polinomial.
- Si $W$ es astronómico ($W = 10^{14}$) con coeficientes enteros de 64 bits, la tabla de DP desborda la memoria disponible. En ese régimen, Branch & Bound es el único método capaz de resolver la instancia en segundos podando la inmensa mayoría de ramas.
