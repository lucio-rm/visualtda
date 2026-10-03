# Ordenamiento por Fusión (Merge Sort): Fundamento Teórico y Demostración

## 1. El Paradigma de División y Conquista

Merge Sort (desarrollado por John von Neumann en 1945) es el ejemplo paradigmático de la técnica de **División y Conquista**:

1. **Dividir**: Partir la secuencia de $n$ elementos en dos subsecuencias de tamaño $\lfloor n/2 \rfloor$ y $\lceil n/2 \rceil$.
2. **Conquistar**: Ordenar recursivamente las dos subsecuencias utilizando Merge Sort. El caso base se alcanza cuando el subarreglo tiene longitud $\le 1$, el cual ya está trivialmente ordenado.
3. **Combinar**: Intercalar (*merge*) las dos subsecuencias ordenadas para producir una única secuencia ordenada de longitud $n$.

---

## 2. Invariante del Procedimiento de Fusión (Merge)

La corrección global de Merge Sort reposa en el procedimiento `merge(A[p..q], A[q+1..r])`.

**Invariante de Ciclo**: Al inicio de cada iteración del bucle `while`:
- El subarreglo auxiliar `resultado[0..k-1]` contiene los $k$ elementos más pequeños de $A[p..q]$ y $A[q+1..r]$, en orden estrictamente ascendente.
- $A[i]$ y $A[j]$ son los elementos más pequeños de sus respectivos subarreglos que aún no han sido transferidos a `resultado`.

**Inicialización ($k=0$)**: `resultado` está vacío. Contiene los 0 elementos menores. Los punteros $i=0$ y $j=0$ apuntan a los primeros elementos de cada mitad.

**Mantenimiento**: Supongamos que $A[i] \le A[j]$. Como $A[i]$ es el menor elemento de la mitad izquierda y $A[i] \le A[j]$ (que es el menor de la derecha), $A[i]$ es el menor de todos los elementos restantes. Transferirlo preserva el orden ascendente en `resultado`. Se avanza $i$ en 1 y $k$ en 1. El argumento es simétrico para $A[j] < A[i]$.

**Terminación**: Al agotarse una de las mitades, los elementos restantes de la otra mitad son todos mayores o iguales que el último insertado en `resultado` y ya se encuentran ordenados entre sí. Se copian directamente al final.

---

## 3. Demostración de Complejidad Temporal

### Relación de Recurrencia
Para ordenar $n$ elementos:
$$T(n) = \begin{cases}
c_1 & \text{si } n = 1 \\
2 T(n/2) + c_2 n & \text{si } n > 1
\end{cases}$$
donde $c_2 n$ representa el tiempo lineal de la división ($O(1)$) y la combinación ($O(n)$ comparaciones y asignaciones).

### Demostración mediante Árbol de Recursión
1. **Nivel 0**: 1 problema de tamaño $n$ $\implies$ costo de combinación = $c n$.
2. **Nivel 1**: 2 problemas de tamaño $n/2$ $\implies$ costo de combinación = $2 \times c(n/2) = c n$.
3. **Nivel $j$**: $2^j$ problemas de tamaño $n/2^j$ $\implies$ costo de combinación = $2^j \times c(n/2^j) = c n$.
4. **Profundidad del árbol**: La recursión se detiene cuando $n / 2^k = 1 \implies k = \log_2 n$.
5. **Costo Total**: La suma del costo en todos los niveles es:
$$T(n) = \sum_{j=0}^{\log_2 n} c n = c n (\log_2 n + 1) = \Theta(n \log n)$$

### Aplicación del Teorema Maestro
Para la recurrencia $T(n) = a T(n/b) + f(n)$ con $a = 2$, $b = 2$, y $f(n) = \Theta(n)$:
- Calculamos $\log_b a = \log_2 2 = 1$.
- Como $f(n) = \Theta(n^1) = \Theta(n^{\log_b a})$, aplica el **Caso 2 del Teorema Maestro**:
$$T(n) = \Theta(n^{\log_b a} \log n) = \Theta(n \log n)$$

---

## 4. Optimalidad y Cota Inferior

En el modelo de árbol de decisiones para algoritmos de ordenamiento basados en comparaciones:
- Hay $n!$ permutaciones posibles de la entrada.
- El árbol de decisión debe tener al menos $n!$ hojas para poder distinguir cada caso.
- La altura del árbol $h$ representa el número de comparaciones en el peor caso:
$$h \ge \log_2(n!) = \sum_{i=1}^n \log_2 i \ge \int_1^n \log_2 x \, dx = \Omega(n \log n)$$

Por ende, Merge Sort alcanza la **cota inferior teórica absoluta** para cualquier ordenamiento por comparación, siendo asymptotically optimal.

---

## 5. Trampa de la Intuición Ingenua y Errores Habituales

### La Falsa Promesa de la Fusión "In-Place" Trivial
Una idea común al aprender Merge Sort es intentar eliminar el arreglo auxiliar de tamaño $O(n)$ para lograr un algoritmo estrictamente *in-place* ($O(1)$ espacio auxiliar).
- Si al fusionar dos mitades contiguas se desplazan los elementos en el arreglo original para hacer lugar a un elemento menor de la mitad derecha, cada inserción requiere desplazar hasta $O(n)$ elementos en el peor caso.
- Esta modificación ingenua convierte el tiempo del procedimiento de fusión de $O(n)$ en $O(n^2)$, provocando que la complejidad temporal total de Merge Sort degenere a $T(n) = 2T(n/2) + O(n^2) = O(n^2)$, perdiendo por completo la ventaja del paradigma de división y conquista.

### La Trampa de la Pérdida de Estabilidad ($<$ vs. $\le$)

Merge Sort es un algoritmo **estable**: preserva el orden relativo de registros con claves iguales.
- Si en el bucle principal de intercalación se utiliza la condición estricta `A[i] < A[j]` en lugar de `A[i] <= A[j]`, ante dos elementos idénticos se tomará primero el de la mitad derecha.
- Esto destruye la estabilidad del ordenamiento, un requisito crítico en bases de datos y pipelines de procesamiento secuencial.

