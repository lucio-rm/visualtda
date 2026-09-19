# Cambio de Monedas (Coin Change con Programación Dinámica)

## 1. Planteo del Problema

Dado un sistema de monedas con $n$ denominaciones positivas $C = \{c_1, c_2, \dots, c_n\}$ (donde cada denominación puede reutilizarse una cantidad ilimitada de veces) y un monto objetivo $V \in \mathbb{N}$, se desea formar el monto exacto $V$ utilizando la **menor cantidad posible de monedas**.

---

## 2. ¿Por qué falla la estrategia Greedy?

En muchos sistemas monetarios estándar (como el Euro o el Peso Argentino con denominaciones canónicas), el algoritmo Greedy que elige en cada paso la moneda más grande posible ($c_{\max} \le v$) encuentra la solución óptima.

Sin embargo, para sistemas de denominaciones arbitrarios, **Greedy falla rotundamente**:

### El Contraejemplo Canónico de Cátedra:
- **Denominaciones**: $C = \{1, 3, 4\}$
- **Objetivo**: $V = 6$
- **Decisión Greedy**:
  1. Moneda más grande $\le 6$: elige $4$. Resta: $6 - 4 = 2$.
  2. Moneda más grande $\le 2$: elige $1$. Resta: $2 - 1 = 1$.
  3. Moneda más grande $\le 1$: elige $1$. Resta: $1 - 1 = 0$.
  - **Solución Greedy**: $\{4, 1, 1\}$ con un total de **3 monedas**.
- **Solución Óptima (Programación Dinámica)**:
  - Tomar dos monedas de $3$: $3 + 3 = 6$.
  - **Solución Óptima**: $\{3, 3\}$ con un total de **2 monedas**.

La elección miope de Greedy al tomar la moneda más grande ($4$) forzó un subproblema desfavorable ($V = 2$), impidiendo acceder a la combinación balanceada $\{3, 3\}$.

---

## 3. Subestructura Óptima y Recurrencia de Bellman

Cualquier combinación óptima de monedas para dar cambio de $V$ debe haber elegido una última moneda $c_i \in C$.
Por el principio de optimalidad de Bellman, las monedas restantes deben constituir necesariamente la solución óptima para dar cambio de $V - c_i$.

Definimos $\text{OPT}(v)$ como la **mínima cantidad de monedas** necesarias para formar el valor $v$:

$$\text{OPT}(v) = \begin{cases} 
0 & \text{si } v = 0 \\
\infty & \text{si no es posible formar } v \\
1 + \min_{\{c \in C : c \le v\}} \text{OPT}(v - c) & \text{si } v > 0 
\end{cases}$$

---

## 4. Reconstrucción de la Solución

Para conocer qué monedas concretas componen la solución óptima, almacenamos en un arreglo auxiliar:
$$\text{eleccion}[v] = c^*$$
donde $c^*$ es la moneda que minimizó la expresión $\text{OPT}(v - c) + 1$.

Una vez completada la tabla bottom-up hasta $V$:
1. Comenzamos en el estado actual $\text{curr} = V$.
2. Mientras $\text{curr} > 0$:
   - Agregamos la moneda $c = \text{eleccion}[\text{curr}]$ a la lista de cambio.
   - Retrocedemos al estado anterior: $\text{curr} \leftarrow \text{curr} - c$.

---

## 5. Análisis de Complejidad

- **Tiempo**: $O(V \cdot |C|)$
  - La tabla tiene $V + 1$ estados.
  - Cada estado evalúa a lo sumo $|C|$ transiciones.
  - La reconstrucción toma a lo sumo $V$ pasos en tiempo $O(V)$.
  - **Total**: $O(V \cdot |C|)$ (pseudo-polinomial).
- **Espacio Auxiliar**: $O(V)$ para los arreglos `dp` y `eleccion`.
