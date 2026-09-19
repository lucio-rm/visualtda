# Subsecuencia Común Más Larga (Longest Common Subsequence - LCS)

## 1. Definición Formal del Problema

Dadas dos cadenas de caracteres:
$$X = \langle x_1, x_2, \dots, x_m \rangle \quad \text{e} \quad Y = \langle y_1, y_2, \dots, y_n \rangle$$

Una secuencia $Z = \langle z_1, z_2, \dots, z_k \rangle$ es una **subsecuencia** de $X$ si existe una secuencia estrictamente creciente de índices $\langle i_1, i_2, \dots, i_k \rangle$ tal que para todo $j \in \{1, \dots, k\}$, se cumple $x_{i_j} = z_j$.

El problema de **Subsecuencia Común Más Larga (LCS)** consiste en encontrar una subsecuencia común a ambas cadenas que tenga longitud máxima $k$.

> **Diferencia clave con Subcadena**: Una subcadena requiere caracteres contiguos (ej: `"BC"` en `"ABCDE"`). Una subsecuencia permite omitir caracteres intermedios preservando el orden relativo (ej: `"ACE"` en `"ABCDE"`).

---

## 2. Subestructura Óptima y Principio de Bellman

Sean $X_i = \langle x_1, \dots, x_i \rangle$ e $Y_j = \langle y_1, \dots, y_j \rangle$ los prefijos de longitud $i$ y $j$.
Sea $c[i, j]$ la longitud del LCS de $X_i$ e $Y_j$.

### Teorema de Subestructura Óptima (CLRS 15.4 / Kleinberg & Tardos 6.6)
Para cualesquiera $i \in \{1, \dots, m\}$ y $j \in \{1, \dots, n\}$:

1. **Si $x_i = y_j$ (Coincidencia de caracteres)**:
   El carácter común $x_i$ debe formar parte del LCS de $X_i$ e $Y_j$.
   $$c[i, j] = c[i - 1, j - 1] + 1$$
   *(Transición Diagonal)*

2. **Si $x_i \ne y_j$ (Discrepancia de caracteres)**:
   Al menos uno de los dos caracteres $x_i$ o $y_j$ no puede formar parte del LCS. Por lo tanto, el óptimo coincide con el mejor subproblema de excluir $x_i$ o excluir $y_j$:
   $$c[i, j] = \max(c[i - 1, j], c[i, j - 1])$$
   *(Transición Vertical u Horizontal)*

3. **Casos Base**:
   Si alguna cadena es vacía ($i = 0$ o $j = 0$):
   $$c[i, 0] = 0, \quad c[0, j] = 0$$

---

## 3. Reconstrucción de la Solución (Backtracking en la Tabla 2D)

La matriz $c[0 \dots m, 0 \dots n]$ computa la longitud óptima en la celda $c[m, n]$. Para reconstruir la subsecuencia de caracteres:
1. Iniciamos en $(i, j) = (m, n)$.
2. Si $x_i = y_j$, agregamos $x_i$ al resultado y retrocedemos diagonalmente a $(i - 1, j - 1)$.
3. Si $x_i \ne y_j$:
   - Si $c[i - 1, j] \ge c[i, j - 1]$, nos movemos hacia arriba a $(i - 1, j)$.
   - En caso contrario, nos movemos hacia la izquierda a $(i, j - 1)$.
4. Al llegar al borde ($i = 0$ o $j = 0$), invertimos la lista acumulada.

---

## 4. Complejidad Asintótica

- **Tiempo de Ejecución**: $\Theta(m \cdot n)$. La tabla posee $(m + 1)(n + 1)$ celdas y cada una se evalúa en tiempo $O(1)$ tomando el máximo o sumando 1. La reconstrucción toma a lo sumo $O(m + n)$ pasos.
- **Espacio en Memoria**: $\Theta(m \cdot n)$ para almacenar la tabla 2D completa y permitir la reconstrucción del camino.

---

## 5. Aplicaciones en el Mundo Real
- **Sistemas de Control de Versiones (`diff`, `git diff`)**: Identifica líneas añadidas, eliminadas o conservadas comparando archivos fuente.
- **Bioinformática**: Alineamiento global de secuencias de nucleótidos de ADN/ARN y cadenas de aminoácidos en proteínas (Algoritmo de Needleman-Wunsch).
- **Procesamiento de Lenguaje Natural (NLP)**: Métrica ROUGE-L para evaluación automática de resúmenes de texto y detección de similitud / plagio.
