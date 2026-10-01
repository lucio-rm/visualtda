## Selección Lineal Determinística (Mediana de Medianas)

### 1. Definición Formal del Problema
Dado un arreglo desordenado $A$ de $n$ elementos distintos y un entero $k \in \{1, 2, \dots, n\}$, el problema de selección (o estadístico de orden $k$) consiste en encontrar el $k$-ésimo elemento más pequeño de $A$.

Mientras que QuickSelect alcanza tiempo promedio $O(n)$ pero degrada a $\Theta(n^2)$ en el peor caso con pivotes desafortunados, el algoritmo de Blum, Floyd, Pratt, Rivest y Tarjan (BFPRT, 1973) garantiza tiempo lineal $O(n)$ en el peor caso absoluto seleccionando determinísticamente un pivote balanceado.

---

### 2. Algoritmo y Garantía de Balanceo
1. **Agrupamiento en Bloques de 5**: Dividir los $n$ elementos en $\lceil n/5 \rceil$ grupos de a lo sumo 5 elementos cada uno.
2. **Medianas Locales**: Hallar la mediana de cada grupo de 5 elementos (empleando a lo sumo 7 comparaciones por grupo, tiempo $O(1)$ por bloque). Reunir estas $\lceil n/5 \rceil$ medianas en un conjunto $M$.
3. **Pivote Recursivo**: Invocar recursivamente al algoritmo para hallar la mediana de $M$. Denotemos a este elemento como el pivote $p$.
4. **Partición**: Particionar el arreglo original $A$ alrededor de $p$ en tres conjuntos: menores que $p$ ($L$), iguales a $p$ ($E$) y mayores que $p$ ($G$).
5. **Decisión**:
   - Si $k \le |L|$, buscar recursivamente el elemento $k$ en $L$.
   - Si $|L| < k \le |L| + |E|$, el pivote $p$ es exactamente el estadístico de orden $k$.
   - Si $k > |L| + |E|$, buscar recursivamente el elemento $k - |L| - |E|$ en $G$.

---

### 3. Cota de Eliminación (Por qué bloques de 5)
**Lema de Poda Cuantitativa**: Al menos el 30% de los elementos de $A$ son menores o iguales a $p$, y al menos el 30% son mayores o iguales a $p$.

*Demostración*:
- Al menos la mitad de los $\lceil n/5 \rceil$ grupos tienen su mediana local $\le p$, es decir, al menos $\frac{1}{2} \lceil n/5 \rceil \ge \frac{n}{10}$ grupos.
- En cada uno de esos grupos, la mediana es mayor o igual a al menos 3 elementos de su propio grupo (ella misma y los 2 elementos inferiores).
- Por lo tanto, el número total de elementos menores o iguales al pivote $p$ es al menos:
  $$3 \cdot \left( \frac{1}{2} \left\lceil \frac{n}{5} \right\rceil \right) \ge \frac{3n}{10} = 0.3n$$
Por simetría, exactamente el mismo argumento prueba que al menos $\frac{3n}{10}$ elementos son mayores o iguales a $p$.
En consecuencia, el subproblema sobre el cual se realiza la llamada recursiva final tiene un tamaño que nunca supera:
$$n - \frac{3n}{10} = \frac{7n}{10} = 0.7n$$

---

### 4. Relación de Recurrencia y Complejidad Lineal
La complejidad temporal en el peor caso satisface la siguiente recurrencia:
$$T(n) \le T\left(\left\lceil \frac{n}{5} \right\rceil\right) + T\left(\frac{7n}{10}\right) + O(n)$$
donde $T(n/5)$ es el costo de encontrar el pivote $p$, $O(n)$ es el agrupamiento y partición, y $T(7n/10)$ es la búsqueda en el subconjunto restante.

Demostramos por inducción que $T(n) \le c \cdot n$ para alguna constante $c > 0$:
$$T(n) \le c \frac{n}{5} + c \frac{7n}{10} + an = c \left( \frac{2}{10} + \frac{7}{10} \right) n + an = \frac{9}{10}cn + an$$
Para que esto sea $\le cn$, requerimos:
$$\frac{9}{10}cn + an \le cn \iff an \le \frac{1}{10}cn \iff c \ge 10a$$
Como $2/10 + 7/10 = 9/10 < 1$, la suma de las fracciones es estrictamente menor que 1. Por lo tanto:
$$T(n) = O(n)$$
La memoria auxiliar en la pila de recursión es $O(n)$ o $O(\log n)$ si se reutiliza el almacenamiento in-place.
