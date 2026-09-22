# Mochila Fraccionaria (Greedy): Fundamento Teórico y Demostración

## 1. Definición Formal del Problema

Dado un conjunto de $n$ elementos $\{1, 2, \dots, n\}$, donde cada elemento $i$ posee:
- Un peso $w_i > 0$
- Un valor $v_i > 0$
- Densidad de valor $r_i = \frac{v_i}{w_i}$

Y una mochila con capacidad máxima $W > 0$.

A diferencia del problema 0/1, en la **Mochila Fraccionaria** está permitido tomar cualquier fracción $x_i \in [0, 1]$ de cada elemento. La cantidad de peso consumido por el elemento $i$ es $x_i \cdot w_i$, y el valor aportado es $x_i \cdot v_i$.

$$\max \sum_{i=1}^n x_i v_i \quad \text{sujeto a} \quad \sum_{i=1}^n x_i w_i \le W, \quad x_i \in [0, 1]$$

---

## 2. Estrategia Greedy (Greedy Choice)

La intuición económica fundamental dicta que cada unidad de peso consumida de la capacidad debe maximizar el valor obtenido. Por lo tanto:
1. Calculamos la densidad $r_i = \frac{v_i}{w_i}$ para cada elemento.
2. Ordenamos los elementos de manera decreciente por densidad: $r_1 \ge r_2 \ge \dots \ge r_n$.
3. Asignamos $x_i = 1$ al primer elemento. Si no cabe completo, tomamos la fracción máxima posible que sature la capacidad restante y finalizamos.

---

## 3. Demostración de Optimalidad (Argumento de Intercambio / Exchange Argument)

**Teorema**: La solución greedy $G = (g_1, g_2, \dots, g_n)$ es óptima para la mochila fraccionaria.

**Demostración**:
Sea $O = (o_1, o_2, \dots, o_n)$ una solución óptima arbitraria que difiere de la solución greedy $G$.
Asumimos que los elementos están ordenados tal que $r_1 \ge r_2 \ge \dots \ge r_n$.

Sea $k$ el primer índice donde $g_k \ne o_k$.
Por diseño del algoritmo greedy, como $G$ siempre toma la máxima fracción posible del elemento disponible con mayor densidad, debe ocurrir que $g_k > o_k$.

Dado que $O$ no tomó tanto del elemento $k$ como $G$, y ambas llenan la capacidad $W$ (o consumen todo lo disponible), debe existir algún elemento posterior $j > k$ tal que $o_j > g_j$ (la solución $O$ utilizó capacidad para el elemento $j$ que $G$ no utilizó o utilizó menos).

Como $j > k$, sabemos que $r_k \ge r_j$.
Podemos transformar la solución $O$ en una nueva solución factible $O'$ incrementando $o_k$ en $\Delta$ y reduciendo $o_j$ en $\Delta \cdot \frac{w_k}{w_j}$, donde $\Delta = \min(g_k - o_k, \; o_j \cdot \frac{w_j}{w_k})$.

El cambio neto en el valor total de la solución es:
$$\Delta \cdot v_k - \Delta \cdot \frac{w_k}{w_j} \cdot v_j = \Delta \cdot w_k \left( \frac{v_k}{w_k} - \frac{v_j}{w_j} \right) = \Delta \cdot w_k (r_k - r_j) \ge 0$$

Dado que $r_k \ge r_j$, el nuevo valor total es mayor o igual al de $O$. Como $O$ ya era óptima, el nuevo valor debe ser exactamente igual, demostrando que $O'$ es también óptima y coincide con $G$ en mayor medida que $O$.
Repitiendo este intercambio un número finito de veces, transformamos $O$ en $G$ sin perder valor, probando que $G$ es estrictamente óptima.

---

## 4. ¿Por qué Greedy Falla en la Mochila 0/1? (El Contraejemplo)

En la mochila 0/1, la restricción de indivisibilidad $x_i \in \{0, 1\}$ rompe el argumento de intercambio. Tomar un elemento con alta densidad puede dejar un "hueco" de capacidad inutilizable que no se puede rellenar con fracciones de otros ítems.

### Contraejemplo Canónico:
- Capacidad de la mochila: $W = 50$
- Elementos:
  1. Ítem A: Peso $10$, Valor $60 \implies r_A = 6.0$
  2. Ítem B: Peso $20$, Valor $100 \implies r_B = 5.0$
  3. Ítem C: Peso $30$, Valor $120 \implies r_C = 4.0$

- **Solución Greedy 0/1**:
  - Selecciona Ítem A (peso consumido $10$, valor $60$, capacidad libre $40$).
  - Selecciona Ítem B (peso consumido $30$, valor $160$, capacidad libre $20$).
  - Ítem C requiere peso $30$, pero solo quedan $20$. Al ser 0/1, no puede entrar.
  - **Valor obtenido por Greedy**: $160$.

- **Solución Óptima 0/1 (Programación Dinámica)**:
  - Selecciona Ítem B + Ítem C (peso consumido $20 + 30 = 50$, capacidad libre $0$).
  - **Valor óptimo**: $100 + 120 = 220$.

Greedy produce $160 < 220$, un error del $27.3\%$. Esta comparación demuestra visualmente por qué se requiere Programación Dinámica para 0/1.

---

## 5. Análisis de Complejidad

- **Complejidad Temporal**:
  - Cálculo de densidades: $O(n)$
  - Ordenamiento de $n$ elementos: $O(n \log n)$
  - Bucle de selección greedy: $O(n)$
  - **Total**: $O(n \log n)$.
- **Complejidad Espacial**: $O(n)$ para almacenar los elementos ordenados y la asignación resultante.
