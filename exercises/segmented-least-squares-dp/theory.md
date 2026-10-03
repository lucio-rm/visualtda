# Mínimos Cuadrados Segmentados (Segmented Least Squares con DP)

## 1. Definición Formal y Planteo del Trade-off Precisión vs Complejidad

Dado un conjunto de $n$ puntos en el plano bidimensional $P = \{(x_1, y_1), (x_2, y_2), \dots, (x_n, y_n)\}$ ordenados de forma que $x_1 < x_2 < \dots < x_n$, el método clásico de regresión lineal por mínimos cuadrados halla una única recta $y = ax + b$ que minimiza la suma de errores al cuadrado:
$$E = \sum_{i=1}^n (y_i - a x_i - b)^2$$

Sin embargo, una única recta puede resultar insuficiente para aproximar datos con cambios de régimen o discontinuidades estructurales. Si se permitiese una cantidad arbitraria de segmentos, bastaría con unir cada par de puntos adyacentes con un segmento para lograr error $E = 0$, pero incurriendo en sobreajuste (*overfitting*).

El problema de **Mínimos Cuadrados Segmentados** equilibra la bondad del ajuste y la parsimonia del modelo: busca una partición del conjunto ordenado de puntos en $k$ segmentos contiguos que minimice la función objetivo regularizada:
$$\min \left( \sum_{\text{segmento } s} E_s + C \cdot k \right)$$
donde $C > 0$ es un hiperparámetro de penalización por cada segmento lineal adicional incorporado.

---

## 2. Precomputación de Errores por Segmento en $O(n^2)$

Para cualquier subsegmento contiguo de puntos $P_{i,j} = \{(x_i, y_i), \dots, (x_j, y_j)\}$ con $1 \le i \le j \le n$, los coeficientes óptimos de la recta de regresión $y = a x + b$ vienen dados por las fórmulas analíticas de mínimos cuadrados:
$$a = \frac{(j - i + 1) \sum_{k=i}^j x_k y_k - (\sum_{k=i}^j x_k)(\sum_{k=i}^j y_k)}{(j - i + 1) \sum_{k=i}^j x_k^2 - (\sum_{k=i}^j x_k)^2}$$
$$b = \frac{\sum_{k=i}^j y_k - a \sum_{k=i}^j x_k}{j - i + 1}$$
Denotamos como $e_{i,j}$ al error cuadrático mínimo asociado a la recta óptima para el bloque $P_{i,j}$ (con $e_{i,i} = 0$).
Existen $O(n^2)$ posibles pares $(i, j)$. Precomputar todos los valores $e_{i,j}$ toma tiempo $O(n^2)$ acumulando sumas acumuladas de $x_k, y_k, x_k y_k, x_k^2$.

---

## 3. Subestructura Óptima y Recurrencia de Bellman

Definimos $OPT(j)$ como el costo mínimo regularizado para particionar de forma óptima los primeros $j$ puntos $\{p_1, p_2, \dots, p_j\}$.

En cualquier partición óptima de los primeros $j$ puntos, el último segmento lineal debe cubrir necesariamente un subconjunto contiguo final $p_i, p_{i+1}, \dots, p_j$ para algún índice inicial $i \in \{1, 2, \dots, j\}$.
Dado que la partición es óptima, los puntos restantes $p_1, \dots, p_{i-1}$ deben a su vez estar particionados de manera óptima con costo $OPT(i-1)$.

Por el principio de subestructura óptima, la ecuación de Bellman es:
$$OPT(j) = \min_{1 \le i \le j} \left( e_{i,j} + C + OPT(i-1) \right)$$

### Caso Base
$$OPT(0) = 0$$

---

## 4. Demostración de Correctitud y Complejidad Asintótica ($O(n^2)$)

- **Fase de Precomputación**: Precalcular los errores cuadráticos $e_{i,j}$ para los $O(n^2)$ pares toma $O(n^2)$ tiempo utilizando sumas acumuladas prefijas.
- **Fase de Programación Dinámica**: La tabla unidimensional $OPT[0..n]$ tiene $n$ entradas. Cada entrada $j$ requiere tomar el mínimo sobre $j$ valores posibles de $i$. Por lo tanto:
  $$\sum_{j=1}^n j = \frac{n(n+1)}{2} = O(n^2) \text{ operaciones}$$
- **Complejidad Temporal Total**: $O(n^2)$.
- **Complejidad Espacial**: $O(n^2)$ para la matriz de errores $e_{i,j}$ y $O(n)$ para el vector de costos $OPT$ y el vector de retrocesos.
- **Reconstrucción**: Un vector de predecesores registra el punto de corte óptimo $i^*(j)$. El trazado hacia atrás desde $j = n$ recupera los puntos de partición exactos en tiempo $O(k) \le O(n)$.

---

## 5. Trampa de la Regresión Lineal Simple y Aplicaciones en Análisis de Señales

### Por Qué Falla la Regresión Lineal Global
Aplicar una única recta a series temporales con quiebres estructurales promedia erróneamente regímenes distintos, ocultando tendencias críticas. Permitir segmentos arbitrarios sin penalización $C$ lleva al sobreajuste trivial (unir cada punto). El parámetro de regularización $C$ de Kleinberg & Tardos formaliza el principio de parsimonia (Navaja de Ockham) en compresión de señales, finanzas y procesamiento de imágenes.
