# Juan el Vago (Programación Dinámica 1D)

## 1. Planteo del Problema

Juan dispone de una serie de $n$ ofertas laborales diarias consecutivas, representadas por un arreglo de ganancias esperadas:
$$G = [g_0, g_1, g_2, \dots, g_{n-1}]$$
donde cada $g_i \ge 0$ es el dinero que ganaría si trabaja el día $i$.

### Restricción
Juan es ambicioso pero **vago**: **bajo ningún concepto aceptará trabajar dos días consecutivos** ($i$ e $i+1$).

### Objetivo
1. Determinar el **monto máximo** de dinero que puede recaudar.
2. Realizar una **reconstrucción** explícita para indicar cuáles son los días específicos en los que debe trabajar.

---

## 2. Subestructura Óptima y Ecuación de Recurrencia

Consideremos la decisión para el día $i$ ($i \ge 2$). Existen exactamente dos opciones excluyentes:

1. **No trabajar el día $i$**:
   Juan no cobra nada el día $i$, pero queda libre de trabajar el día $i-1$. Por lo tanto, el dinero máximo que puede acumular considerando hasta el día $i$ es exactamente el óptimo hasta el día $i-1$:
   $$\text{OPT}(i-1)$$

2. **Trabajar el día $i$**:
   Juan gana $g_i$. Debido a la restricción, **no puede haber trabajado el día $i-1$**. En consecuencia, el resto de sus días de trabajo deben ser seleccionados óptimamente entre los días $0, \dots, i-2$:
   $$\text{OPT}(i-2) + g_i$$

### Ecuación de Bellman
$$\text{OPT}(i) = \max\Big(\text{OPT}(i-1),\; \text{OPT}(i-2) + g_i\Big) \quad \text{para } i \ge 2$$

### Casos Base
- $n = 1$: Solo hay un día. Juan trabaja ese día:
  $$\text{OPT}(0) = g_0$$
- $n = 2$: Juan solo puede elegir uno de los dos días (no puede trabajar ambos). Elige el de mayor ganancia:
  $$\text{OPT}(1) = \max(g_0, g_1)$$

---

## 3. Algoritmo de Reconstrucción

Una vez completada la tabla unidimensional $\text{DP}[0 \dots n-1]$, el valor óptimo está en $\text{DP}[n-1]$. Para recuperar los días exactos:

1. Comenzar desde el último día $i = n - 1$.
2. Comparar $\text{DP}[i]$ con $\text{DP}[i-1]$:
   - Si $\text{DP}[i] == \text{DP}[i-1]$, significa que el máximo se logró **sin trabajar el día $i$**. Decrementar $i \leftarrow i - 1$.
   - Si $\text{DP}[i] > \text{DP}[i-1]$, significa que el óptimo se logró **trabajando el día $i$**. Registrar el día $i$ y saltar a $i \leftarrow i - 2$ (pues el día $i-1$ no se pudo trabajar).
3. Detenerse al llegar a los casos base ($i=0$ o $i=1$).

---

## 4. Conexión con Programación Lineal Entera (PL / ILP)

Este problema es idéntico a encontrar el **Conjunto Independiente de Peso Máximo (Maximum Weight Independent Set)** sobre un grafo camino (*path graph* $P_n$):

$$\begin{aligned}
\text{Maximizar} \quad & \sum_{i=0}^{n-1} g_i \cdot x_i \\
\text{Sujeto a} \quad & x_i + x_{i+1} \le 1 \quad \forall i \in \{0, \dots, n-2\} \\
& x_i \in \{0, 1\} \quad \forall i \in \{0, \dots, n-1\}
\end{aligned}$$

Donde $x_i = 1$ si Juan trabaja el día $i$ y $0$ en caso contrario.

---

## 5. Complejidad Asintótica

- **Tiempo**: Llenar un arreglo de tamaño $n$, donde cada casilla realiza $O(1)$ operaciones (una suma y un máximo):
  $$T(n) = \Theta(n)$$
  La reconstrucción recorre a lo sumo $n$ pasos hacia atrás: $O(n)$.
  Tiempo total: **$\Theta(n)$**.
- **Espacio**:
  - Con reconstrucción: Arreglo de tamaño $n \implies \Theta(n)$.
  - Sin reconstrucción: Solo se necesitan las dos casillas previas ($\text{ant}_1$ y $\text{ant}_2$), reduciendo el espacio auxiliar a **$O(1)$**.
