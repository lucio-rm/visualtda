# N-Reinas: Análisis Teórico, Correctness y Complejidad

## 1. Planteo del Problema
Dado un entero $N \ge 1$, el problema de las $N$-Reinas consiste en ubicar $N$ reinas sobre un tablero de ajedrez de dimensión $N \times N$ de manera tal que **ninguna reina amenace a otra**. En ajedrez, una reina puede moverse cualquier cantidad de casillas en su fila, en su columna o en cualquiera de sus dos diagonales.

Consecuentemente, una solución válida debe satisfacer simultáneamente:
1. Exactamente una reina por fila ($N$ reinas en total).
2. Exactamente una reina por columna.
3. A lo sumo una reina en cada diagonal principal ($r - c = \text{cte}$).
4. A lo sumo una reina en cada diagonal secundaria ($r + c = \text{cte}$).

---

## 2. Estrategia Algorítmica: Backtracking con Poda (Pruning)

### ¿Por qué no Fuerza Bruta?
Colocar $N$ reinas en $N^2$ casillas posibles de forma arbitraria genera un espacio de búsqueda combinatorial de:
$$\binom{N^2}{N}$$
Para $N=8$, esto representa $\binom{64}{8} \approx 4.4 \times 10^9$ estados.

Si aprovechamos la restricción de que sólo puede haber una reina por fila, el espacio se reduce a $N^N$ ($8^8 \approx 1.67 \times 10^7$ estados).
Si además restringimos a una permutación de columnas (una reina por columna), el espacio es $N!$ ($8! = 40,320$ estados).

**Backtracking** mejora drásticamente esto mediante **poda temprana**: en cuanto una reina en la fila $k$ entra en conflicto con una reina en una fila previa $i < k$, se descarta inmediatamente todo el subárbol descendiente de esa rama sin explorarlo. Para $N=8$, de los 40,320 estados posibles, el algoritmo de backtracking con poda sólo visita **2,057 estados** para hallar todas las soluciones.

---

## 3. Demostración de Corrección (Correctness)

### Invariante de Bucle / Recursión
En la llamada recursiva `backtrack(fila)`:
- **Invariante**: Para todas las filas $0 \le i < \text{fila}$, existe exactamente una reina ubicada en la columna `tablero[i]`, y ningún par de reinas en $\{0, \dots, \text{fila} - 1\}$ se ataca mutuamente (no comparten columna, ni diagonal principal, ni diagonal secundaria).

### Pasos de Inducción:
1. **Base**: Para `fila = 0`, el conjunto de reinas colocadas es vacío; el invariante se cumple trivialmente.
2. **Paso Inductivo**: Supongamos que el invariante se cumple al inicio de `backtrack(fila)`. Al considerar cada columna candidata `col`:
   - Si `col` o sus diagonales ya pertenecen a los conjuntos de casillas amenazadas, se poda la rama (no se realiza llamada recursiva para estados inválidos).
   - Si no hay conflicto, colocar la reina en `(fila, col)` garantiza que la configuración ampliada de tamaño `fila + 1` cumple el invariante. La llamada recursiva `backtrack(fila + 1)` preserva la hipótesis.
3. **Terminación**: La recursión incrementa `fila` en cada paso y está acotada superiormente por $N$. Al alcanzarse `fila = N`, por el invariante, todas las $N$ reinas están colocadas en posiciones mutuamente seguras, lo que garantiza que cualquier tablero agregado a `soluciones` es estrictamente válido. Al finalizar el recorrido de todas las ramas, el algoritmo garantiza exhaustividad (no se omite ninguna solución válida).

---

## 4. Análisis de Complejidad

### Complejidad Temporal: $O(N!)$
En el peor caso, la primera reina tiene $N$ opciones, la segunda a lo sumo $N-1$ (y con frecuencia menos debido a las diagonales), la tercera a lo sumo $N-2$, etc. La cota asintótica superior teórica es:
$$T(N) = O(N!)$$
Gracias a la verificación de conflictos en $O(1)$ utilizando conjuntos hash para columnas y diagonales, cada verificación de estado toma tiempo constante.

### Complejidad Espacial: $O(N)$
- La profundidad máxima del árbol de recursión es $N$, ocupando $O(N)$ marcos en la pila de llamadas.
- El vector `tablero_actual` requiere $O(N)$ enteros.
- Los conjuntos `columnas_ocupadas`, `diagonales_principales` y `diagonales_secundarias` almacenan a lo sumo $N$ elementos cada uno, resultando en $O(N)$ memoria auxiliar total.
