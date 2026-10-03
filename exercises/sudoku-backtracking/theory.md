# Sudoku como Problema de Satisfacción de Restricciones (CSP) y Backtracking con Poda

## 1. Definición Formal y Modelado CSP

El juego de Sudoku estándar de $9 \times 9$ se modela formalmente como un **Problema de Satisfacción de Restricciones** (CSP, por sus siglas en inglés):
- **Variables**: $X = \{x_{i,j} \mid 1 \le i, j \le 9\}$, representando las 81 celdas de la grilla.
- **Dominios**: $D_{i,j} \subseteq \{1, 2, \dots, 9\}$ para cada celda vacía, o un conjunto unitario $\{v\}$ para las celdas prefijadas inicialmente.
- **Restricciones Alldifferent**:
  1. Cada fila $i$: $\text{Alldifferent}(x_{i,1}, x_{i,2}, \dots, x_{i,9})$.
  2. Cada columna $j$: $\text{Alldifferent}(x_{1,j}, x_{2,j}, \dots, x_{9,j})$.
  3. Cada subgrilla o caja de $3 \times 3$: $\text{Alldifferent}(\{x_{i,j} \mid \text{celdas en la misma caja}\})$.

---

## 2. Espacio de Estados y Backtracking Sistemático

La fuerza bruta ingenua evaluaría hasta $9^{k}$ combinaciones, donde $k$ es el número de celdas vacías (pudiendo superar $9^{50} \approx 5 \times 10^{47}$ configuraciones).
El paradigma de Backtracking explora el árbol de búsqueda en profundidad:
1. Asigna un valor candidato $v \in D_{i,j}$ a una variable no asignada.
2. Verifica si la asignación respeta de inmediato las restricciones de fila, columna y bloque.
3. Si ocurre un conflicto, la rama se poda sin explorar las celdas subsiguientes y el algoritmo retrocede (backtracks) para ensayar el siguiente valor de dominio.

---

## 3. Heurísticas de Poda: Minimum Remaining Values (MRV) y LCV

Para minimizar el tamaño del árbol explorado, se implementan heurísticas clásicas de satisfacción de restricciones:
- **MRV (Minimum Remaining Values)**: En cada paso, se selecciona la celda vacía con el menor número de valores válidos en su dominio actual (principio del "fallo más temprano" o *fail-first principle*). Si una celda tiene solo 1 opción válida, se fuerza de inmediato; si tiene 0 opciones, se poda la rama sin expandir subárboles inútiles.
- **Grado y Propagación de Restricciones**: Al asignar un valor a $x_{i,j}$, se eliminan instantáneamente ese dígito de los dominios de todos sus vecinos en la misma fila, columna y cuadrante (filtrado por consistencia de arco / *forward checking*).

---

## 4. Demostración de Correctitud, Propagación de Restricciones y Terminación

### Invariante de Corrección
En cada estado del árbol de backtracking, la asignación parcial de variables satisface todas las restricciones impuestas por las celdas fijadas. Como los dominios son finitos y el número de celdas no asignadas decrece estrictamente en cada nivel del árbol sin ciclos, el algoritmo garantiza terminar y encontrar una asignación consistente completa si existe, o certificar insatisfactibilidad podando todas las ramas.

---

## 5. Complejidad Asintótica, NP-Completitud y Desempeño Práctico

- **Complejidad Temporal**: En el peor caso asintótico sobre tableros generalizados de $N \times N$, el problema de resolver Sudoku es NP-completo (generalización a $N = n^2$). La cota de peor caso para un tablero con $k$ celdas vacías es $O(9^k)$. Sin embargo, con MRV y consistencia de arco, la mayoría de los tableros válidos de $9 \times 9$ se resuelven en unas pocas decenas o cientos de llamadas recursivas, explorando una fracción infinitesimal del espacio de búsqueda.
- **Complejidad Espacial**: $O(N)$ espacio en la pila de recursión (profundidad máxima $k \le 81$) y $O(81)$ en tablas de bits para verificación instantánea de restricciones en $O(1)$.
