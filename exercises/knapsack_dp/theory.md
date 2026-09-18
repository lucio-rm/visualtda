# Mochila 0/1 (Programación Dinámica): Fundamento Teórico y Demostración

## 1. Definición Formal del Problema

Dado un conjunto de $n$ elementos $\{1, 2, \dots, n\}$, donde cada elemento $i$ posee:
- Un peso entero $w_i \in \mathbb{Z}^+$
- Un valor positivo $v_i \in \mathbb{R}^+$

Y una mochila con capacidad entera máxima $W \in \mathbb{Z}^+$.

El objetivo es seleccionar un subconjunto de elementos $S \subseteq \{1, \dots, n\}$ que maximice el valor total sin exceder la capacidad de la mochila:

$$\max \sum_{i \in S} v_i \quad \text{sujeto a} \quad \sum_{i \in S} w_i \le W$$

Equivalentemente, definiendo variables de decisión binarias $x_i \in \{0, 1\}$:
$$\max \sum_{i=1}^n v_i x_i \quad \text{sujeto a} \quad \sum_{i=1}^n w_i x_i \le W, \quad x_i \in \{0, 1\}$$

---

## 2. Subestructura Óptima (Principio de Optimalidad de Bellman)

Sea $S^*$ el subconjunto óptimo para los primeros $i$ elementos con capacidad disponible $w$. Consideremos el último elemento $i$:

- **Caso 1: El elemento $i$ NO pertenece a $S^*$ ($x_i = 0$).**
  Entonces $S^*$ debe ser la solución óptima para los primeros $i-1$ elementos con la misma capacidad $w$.
  *Demostración por contradicción*: Si existiera un subconjunto $S'$ de $\{1, \dots, i-1\}$ con peso $\le w$ y valor estrictamente mayor, podríamos reemplazar $S^*$ por $S'$ y obtener una solución de mayor valor para los primeros $i$ elementos, contradiciendo la optimalidad de $S^*$.

- **Caso 2: El elemento $i$ SÍ pertenece a $S^*$ ($x_i = 1$).**
  Entonces $S^* \setminus \{i\}$ debe ser la solución óptima para los primeros $i-1$ elementos con capacidad reducida $w - w_i$.
  *Demostración por contradicción*: Si existiera un subconjunto $S'' \subseteq \{1, \dots, i-1\}$ con peso $\le w - w_i$ y valor estrictamente mayor que el valor de $S^* \setminus \{i\}$, entonces $S'' \cup \{i\}$ tendría peso $\le (w - w_i) + w_i = w$ y valor estrictamente mayor que $S^*$, contradiciendo nuevamente la optimalidad.

---

## 3. Relación de Recurrencia

Definimos $DP[i][w]$ como el valor máximo obtenible considerando un subconjunto de los primeros $i$ elementos con una capacidad disponible $w$, para $0 \le i \le n$ y $0 \le w \le W$.

$$DP[i][w] = \begin{cases} 
0 & \text{si } i = 0 \text{ o } w = 0 \\
DP[i-1][w] & \text{si } w_i > w \\
\max\Big(DP[i-1][w], \; DP[i-1][w - w_i] + v_i\Big) & \text{si } w_i \le w
\end{cases}$$

---

## 4. Invariante de la Tabla y Corrección

**Invariante del ciclo**: Al finalizar la iteración de la fila $i$, la celda $DP[i][w]$ contiene el valor óptimo exacto para el subproblema definido por los primeros $i$ elementos y capacidad $w$, para todo $w \in \{0, \dots, W\}$.

**Paso Base ($i=0$)**: Con 0 elementos disponibles, el valor que se puede acumular es 0 para cualquier capacidad $w$. $DP[0][w] = 0$ satisface trivialmente el invariante.

**Paso Inductivo ($i-1 \to i$)**: Asumiendo que las filas $0, \dots, i-1$ son correctas:
- Si $w_i > w$, el elemento $i$ no cabe. La única opción factible es no incluirlo, por lo que $DP[i][w] = DP[i-1][w]$, que es óptimo por hipótesis inductiva.
- Si $w_i \le w$, las únicas dos decisiones factibles son incluirlo o excluirlo. La recurrencia toma el máximo entre ambas alternativas exhaustivas, ambas evaluadas con subproblemas ya resueltos óptimamente por hipótesis inductiva.

Por inducción matemática, al concluir la fila $n$, la celda $DP[n][W]$ contiene el valor de la solución óptima global.

---

## 5. Reconstrucción de la Solución Óptima

Una vez construida la matriz, el subconjunto óptimo $S^*$ se reconstruye en tiempo $O(n)$ rastreando las decisiones desde $(n, W)$ hacia $(0, 0)$:

```
w = W
Para i desde n bajando hasta 1:
    Si DP[i][w] != DP[i-1][w]:
        Item i fue seleccionado (x_i = 1)
        w = w - w_i
    Sino:
        Item i no fue seleccionado (x_i = 0)
```

---

## 6. Análisis de Complejidad

- **Complejidad Temporal**: Se computan $(n + 1) \times (W + 1)$ celdas. Cada celda requiere $O(1)$ operaciones (comparación y suma). La reconstrucción requiere $O(n)$. Por lo tanto, el tiempo total es $\Theta(n \cdot W)$.
- **Complejidad Espacial**: La tabla requiere una matriz de $(n + 1) \times (W + 1)$ enteros, es decir, $O(n \cdot W)$. Si únicamente se requiere el valor máximo y no los ítems seleccionados, el espacio puede optimizarse a $O(W)$ conservando solo la fila anterior.

### ¿Por qué es Pseudo-polinomial?
El tamaño de la entrada en bits para representar el número $W$ es $\approx \log_2(W)$. Un algoritmo verdaderamente polinomial debería tener cota proporcional a $(\log W)^k$. La cota $O(n \cdot W) = O(n \cdot 2^{\log W})$ es en realidad exponencial respecto a la longitud en bits de $W$. Por esta razón, el problema de la mochila 0/1 es NP-completo débil y admite algoritmos pseudo-polinomiales cuando $W$ está acotado por un polinomio en $n$.
