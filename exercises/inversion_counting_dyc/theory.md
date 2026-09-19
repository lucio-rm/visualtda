# Contar Inversiones en $O(n \log n)$ — Teoría y Fundamentos

## 1. Definición Formal de Inversión

Dado un arreglo $A = [a_0, a_1, \dots, a_{n-1}]$ de números reales o enteros, una **inversión** es un par de índices $(i, j)$ tal que:
$$i < j \quad \text{y} \quad A[i] > A[j]$$

El número de inversiones cuantifica **qué tan desordenado** está un arreglo:
- **Arreglo ya ordenado** (ej. $[1, 2, 3, 4]$): $0$ inversiones.
- **Arreglo en orden estrictamente decreciente** (ej. $[4, 3, 2, 1]$): $\frac{n(n-1)}{2}$ inversiones (máximo posible).
- **Distancia de Kendall Tau**: Esta métrica es fundamental en sistemas de recomendación y análisis de preferencias (comparar rankings de películas, canciones o usuarios).

---

## 2. Límites del Enfoque Ingenuo ($O(n^2)$)

Un doble bucle anidado que compara todo par $(i, j)$ toma:
$$\sum_{i=0}^{n-2} (n - 1 - i) = \frac{n(n-1)}{2} = \Theta(n^2)$$
Para $n = 10^5$, requeriría $5 \times 10^9$ operaciones, superando cualquier límite de tiempo aceptable.

---

## 3. Estrategia de División y Conquista (Kleinberg & Tardos 5.3 / CLRS 2-4)

Dividimos el arreglo por la mitad en el índice $\text{medio} = \lfloor n/2 \rfloor$. Cualquier inversión $(i, j)$ cae forzosamente en **exactamente una** de tres clases mutuamente excluyentes:

1. **Inversiones Internas Izquierdas**: $0 \le i < j < \text{medio}$ (ambos índices en la mitad izquierda).
2. **Inversiones Internas Derechas**: $\text{medio} \le i < j < n$ (ambos índices en la mitad derecha).
3. **Inversiones Cruzadas (Split Inversions)**: $i < \text{medio} \le j$ con $A[i] > A[j]$ ($i$ en la izquierda, $j$ en la derecha).

$$\text{Total Inversiones} = \text{Inv}_{\text{izq}} + \text{Inv}_{\text{der}} + \text{Inv}_{\text{cruzadas}}$$

Las dos primeras se resuelven mediante llamadas recursivas en mitades de tamaño $n/2$. El desafío crucial reside en contar las **inversiones cruzadas en tiempo lineal $O(n)$**.

---

## 4. El Gran Insight: Intercalación Ordenada (Piggybacking en Merge)

Si las dos mitades ya están ordenadas de menor a mayor:
$$\text{izq} = [l_0, l_1, \dots, l_{p-1}], \quad \text{der} = [r_0, r_1, \dots, r_{q-1}]$$

Cuando comparamos $l_i$ con $r_j$:
- Si $l_i \le r_j$: no hay inversión entre $l_i$ y $r_j$. Se avanza $i \leftarrow i + 1$.
- Si $r_j < l_i$: como $\text{izq}$ está ordenado, **todos** los elementos desde el índice $i$ hasta $p-1$ son estrictamente mayores que $l_i$, y por tanto **todos ellos son mayores que $r_j$**.

$$\text{Nuevas inversiones generadas por } r_j = p - i = \text{len}(\text{izq}) - i$$

¡Este cálculo se efectúa en **tiempo $O(1)$** en lugar de verificar elemento por elemento!

---

## 5. Análisis de Complejidad Asintótica

Por el Teorema Maestro:
$$T(n) = 2T\left(\frac{n}{2}\right) + O(n)$$
- $a = 2$ subproblemas
- $b = 2$ factor de reducción del tamaño
- $f(n) = O(n) = \Theta(n^{\log_b a}) = \Theta(n^1)$

Corresponde al Caso 2 del Teorema Maestro:
$$T(n) = \Theta(n \log n)$$

- **Espacio**: $O(n)$ para almacenar los arreglos temporales de mezcla durante la recursión.
