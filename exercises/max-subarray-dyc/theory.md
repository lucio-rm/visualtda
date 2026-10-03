# Subarreglo de Máxima Suma (División y Conquista)

## 1. Planteo del Problema

Dado un arreglo $A = [a_0, a_1, \dots, a_{n-1}]$ de $n$ enteros (que pueden incluir valores tanto positivos como negativos), encontrar un subarreglo contiguo $A[i \dots j]$ ($0 \le i \le j < n$) cuya suma:
$$\sum_{k=i}^{j} a_k$$
sea **máxima**.

### Ejemplos canónicos de cátedra
- $[5, 3, 2, 4, -1] \longrightarrow [5, 3, 2, 4]$ (Suma: $14$)
- $[5, 3, -5, 4, -1] \longrightarrow [5, 3]$ (Suma: $8$)
- $[5, -4, 2, 4, -1] \longrightarrow [5, -4, 2, 4]$ (Suma: $7$)
- $[-5, -2, -8] \longrightarrow [-2]$ (Suma: $-2$)

---

## 2. Intuición y Espacio de Búsqueda

Un enfoque por fuerza bruta evalúa todos los posibles pares $(i, j)$ con $i \le j$:
$$\sum_{i=1}^{n} (n - i + 1) = \frac{n(n+1)}{2} = \Theta(n^2)$$
Evaluar la suma de cada subarreglo directamente toma tiempo $\Theta(n^2)$ (usando sumas acumuladas) u $O(n^3)$ de manera ingenua.

### Estrategia de División y Conquista
Si dividimos el arreglo $A$ por su punto medio $m = \lfloor n / 2 \rfloor$ en dos mitades $A_{\text{izq}} = A[0 \dots m-1]$ y $A_{\text{der}} = A[m \dots n-1]$, cualquier subarreglo de máxima suma $A[i \dots j]$ debe pertenecer a exactamente una de estas tres categorías disjuntas:

1. **Enteramente en la mitad izquierda**: $0 \le i \le j < m$. Se resuelve recursivamente en $A_{\text{izq}}$.
2. **Enteramente en la mitad derecha**: $m \le i \le j < n$. Se resuelve recursivamente en $A_{\text{der}}$.
3. **Cruzando el punto medio**: $i < m \le j$. El subarreglo contiene al menos un elemento a la izquierda de $m$ y al menos un elemento a la derecha de $m$.

---

## 3. El Subarreglo Cruzado en Tiempo Lineal

¿Por qué podemos encontrar el subarreglo cruzado en $O(n)$ en lugar de cuadrático?
Porque la restricción de que cruza el punto medio **desacopla** la búsqueda hacia la izquierda de la búsqueda hacia la derecha:

- La parte izquierda del subarreglo cruzado termina obligatoriamente en $m-1$ y se extiende hacia algún índice $i \le m-1$.
- La parte derecha comienza obligatoriamente en $m$ y se extiende hacia algún índice $j \ge m$.

Por lo tanto:
$$\max_{i < m \le j} \sum_{k=i}^{j} a_k = \left(\max_{0 \le i < m} \sum_{k=i}^{m-1} a_k\right) + \left(\max_{m \le j < n} \sum_{k=m}^{j} a_k\right)$$

Podemos calcular ambas sumas máximas con dos simples recorridos lineales:
1. Recorrer de $m-1$ descendiendo hacia $0$, acumulando la suma y recordando el valor máximo y su índice $i^*$.
2. Recorrer de $m$ ascendiendo hacia $n-1$, acumulando la suma y recordando el valor máximo y su índice $j^*$.

El tiempo total del cálculo cruzado es $O(m) + O(n - m) = O(n)$.

### Demostración Formal de Correctitud por Inducción
Por inducción sobre la longitud $n$ del arreglo:
- **Base ($n = 1$)**: El único subarreglo posible es el elemento individual $A[0]$, que es trivialmente óptimo.
- **Paso Inductivo**: Supóngase que las llamadas recursivas sobre subarreglos de tamaño menor que $n$ retornan el subarreglo de máxima suma estrictamente contenido en ellos.
  Cualquier subarreglo contiguo óptimo global $A[i^* \dots j^*]$ cumple exactamente una de tres condiciones disjuntas:
  1. $j^* < m$: está completamente en $A_{\text{izq}}$, hallado por la llamada recursiva izquierda.
  2. $i^* \ge m$: está completamente en $A_{\text{der}}$, hallado por la llamada recursiva derecha.
  3. $i^* < m \le j^*$: cruza el punto medio $m$. Dado que cualquier suma cruzada se descompone en un sufijo de $A_{\text{izq}}$ más un prefijo de $A_{\text{der}}$, maximizar ambos términos de forma independiente garantiza encontrar el óptimo cruzado global.
  Al tomar el máximo de estas tres alternativas exhaustivas, el algoritmo garantiza hallar el óptimo global sin omitir ninguna configuración posible.

---

## 4. Análisis de Complejidad Asintótica (Teorema Maestro)

La función recursiva realiza:
- 2 llamadas recursivas sobre subarreglos de tamaño $n/2$ ($a = 2$).
- La división del problema divide el tamaño a la mitad ($b = 2$).
- El trabajo de combinación (cálculo del subarreglo cruzado y sumas) es lineal ($f(n) = O(n) \implies c = 1$).

La ecuación de recurrencia es:
$$T(n) = 2\,T\left(\frac{n}{2}\right) + O(n)$$

Aplicando el **Teorema Maestro**:
$$\log_b(a) = \log_2(2) = 1 = c$$
Estamos en el **Caso 2** del Teorema Maestro ($f(n) = \Theta(n^{\log_b a})$):
$$T(n) = \Theta(n \log n)$$

### Complejidad Espacial
- Si se pasan índices (`bajo`, `medio`, `alto`), el espacio en la pila de recursión es $O(\log n)$.
- Si se crean copias/slices de los arreglos, el espacio temporal es $O(n \log n)$.

---

## 5. Comparativa con el Algoritmo de Kadane ($O(n)$)

Existe un algoritmo aún más veloz basado en Programación Dinámica / Greedy llamado **Algoritmo de Kadane**:
- Mantiene la suma máxima del subarreglo que termina en la posición actual $i$:
  $$\text{max\_ending\_here}[i] = \max(a_i, \text{max\_ending\_here}[i-1] + a_i)$$
- Ejecuta en una única pasada con tiempo $O(n)$ y espacio $O(1)$.
- Sin embargo, el enfoque por **División y Conquista** es el paradigma clásico para ilustrar la descomposición en casos disjuntos y la aplicación del Teorema Maestro sobre estructuras contiguas.
