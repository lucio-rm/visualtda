# Búsqueda de un Pico en Arreglo 1D (Peak Finding)

## 1. Definición Formal del Problema

Dado un arreglo de $n$ enteros no ordenados $A = [a_0, a_1, \dots, a_{n-1}]$, un índice $i \in [0, n-1]$ define un **pico** (peak) si su valor es mayor o igual al de sus vecinos inmediatos:
- Si $i > 0 \implies A[i] \ge A[i - 1]$
- Si $i < n - 1 \implies A[i] \ge A[i + 1]$

> **Nota para los extremos**: Los elementos en las puntas ($i = 0$ y $i = n - 1$) solo tienen un vecino. Si $A[0] \ge A[1]$, $A[0]$ ya es un pico legítimo. Análogamente para $A[n-1] \ge A[n-2]$.

### Teorema de Existencia
Todo arreglo no vacío posee al menos un pico.
*Demostración inmediata*: El elemento máximo global del arreglo $\max_{0 \le k < n} A[k]$ satisface trivialmente la condición de ser mayor o igual a cualquier elemento adyacente. Sin embargo, no necesitamos hallar el máximo global; cualquier pico local es una respuesta válida.

---

## 2. Del Enfoque Secuencial $O(n)$ a División y Conquista $O(\log n)$

Un algoritmo ingenuo recorrería el arreglo de izquierda a derecha comparando vecinos en $O(n)$. Pero podemos resolverlo en **$O(\log n)$** utilizando el principio del **gradiente ascendente** (*uphill walk*):

1. Tomamos el elemento central $m = \lfloor (l + r) / 2 \rfloor$.
2. Si $A[m] < A[m - 1]$: el vecino izquierdo es estrictamente más alto. Subimos la montaña hacia la izquierda descartando toda la mitad derecha.
3. Si $A[m] < A[m + 1]$: el vecino derecho es estrictamente más alto. Subimos la montaña hacia la derecha descartando toda la mitad izquierda.
4. Si ninguna de las dos ocurre, $A[m] \ge A[m - 1]$ y $A[m] \ge A[m + 1]$, ¡por lo que $A[m]$ es un pico!

---

## 3. Demostración de Invariante: ¿Por qué siempre hay un pico en la mitad hacia la que subimos?

Supongamos que $A[m] < A[m - 1]$. Demostremos que el subarreglo $A[0 \dots m - 1]$ contiene obligatoriamente al menos un pico:
- Comenzamos en $m - 1$ con $A[m - 1] > A[m]$.
- Si retrocedemos:
  - O bien los valores siguen subiendo o manteniéndose hasta llegar al extremo $A[0]$, en cuyo caso $A[0] \ge A[1]$ y por lo tanto $A[0]$ es un pico.
  - O bien en algún índice $j < m - 1$ encontramos un descenso: $A[j] < A[j + 1]$. En ese caso, como veníamos subiendo desde $j+1$ hacia la derecha ($A[j + 1] \ge A[j + 2]$), el elemento $A[j + 1]$ es estrictamente un pico local.
- Por el principio del palomar y la finitud del subarreglo, es matemáticamente imposible que no exista un pico en dicha mitad.

---

## 4. Análisis de Complejidad Asintótica (Teorema Maestro)

En cada paso realizamos $O(1)$ comparaciones y reducimos el problema a una sola mitad de tamaño $\lfloor n/2 \rfloor$:

$$T(n) = T\left(\frac{n}{2}\right) + O(1)$$

Aplicando el **Teorema Maestro**:
- $a = 1$ (un único subproblema recursivo a resolver)
- $b = 2$ (el tamaño se divide a la mitad)
- $f(n) = O(1) = O(n^0)$, luego $d = 0$
- Como $\log_b a = \log_2 1 = 0 = d$, estamos en el **Caso 2** del Teorema Maestro:

$$T(n) = \Theta(n^d \log n) = \Theta(n^0 \log n) = \Theta(\log n)$$

- **Espacio Auxiliar**: $O(1)$ en la versión iterativa, u $O(\log n)$ en la versión recursiva por la pila de llamadas.

---

## 5. Trampa de la Intuición Ingenua: Tres Errores Frecuentes

### Creer que la Búsqueda Binaria Requiere un Arreglo Ordenado
El error conceptual más difundido es pensar que la búsqueda binaria solo funciona en arreglos ordenados:
- En *Peak Finding*, el arreglo de entrada está completamente **desordenado**.
- Lo que habilita la reducción binaria a la mitad no es el orden global, sino la existencia de un **invariante topológico**: si nos movemos en la dirección del vecino más alto ($A[m] < A[m+1]$), estamos garantizados de encontrar al menos un pico local antes de llegar al borde del arreglo.

### Confundir Pico Local con Máximo Global
- Encontrar el **máximo global** de un arreglo desordenado de $n$ elementos requiere necesariamente **$\Omega(n)$** comparaciones (un adversario siempre puede colocar el valor máximo en la última posición no inspeccionada).
- *Peak Finding* en $O(\log n)$ **no** encuentra el máximo global; encuentra un **máximo local** (un pico). Pretender que este algoritmo identifique el elemento más grande de un arreglo general es matemáticamente imposible.

### La Trampa de Seguir la Pendiente Descendente

Si $A[m] < A[m+1]$ y un algoritmo decidiera explorar la mitad izquierda buscando un contra-pico, podría caer en una pendiente monótonamente decreciente que termine en un valle o mínimo local, fallando en encontrar un pico. El invariante de correctitud exige estrictamente seguir la dirección ascendente (*uphill walk*).

