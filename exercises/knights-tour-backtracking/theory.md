## Recorrido del Caballo (Knight's Tour)

### 1. Definición Formal y Modelado en Grafos
Dado un tablero de ajedrez de dimensiones $N \times N$, el problema del Recorrido del Caballo consiste en encontrar una secuencia de $N^2$ movimientos válidos según las reglas del ajedrez (desplazamiento en forma de "L": $(\pm 1, \pm 2)$ o $(\pm 2, \pm 1)$) tal que el caballo visite cada una de las $N^2$ casillas exactamente una vez.
- Si el movimiento final permite regresar a la casilla de inicio, el recorrido es **cerrado** (equivalente a encontrar un ciclo hamiltoniano en el grafo de movimientos del caballo $G_{\text{caballo}}$).
- En caso contrario, se denomina recorrido **abierto** (camino hamiltoniano).

---

### 2. Espacio de Estados y Backtracking Clásico
El problema puede verse como una búsqueda en profundidad (DFS) en un árbol de decisión donde:
- La raíz es la casilla de partida elegida $(r_0, c_0)$.
- En cada paso $k \in \{1, \dots, N^2 - 1\}$, desde la posición actual $(r, c)$ existen hasta 8 casillas destino teóricas.
- Se filtran los destinos que caen fuera de los límites del tablero o que corresponden a casillas ya visitadas.
- Si no quedan casillas legales accesibles y $k < N^2$, el algoritmo retrocede (backtrack), desmarca la casilla actual y ensaya otra rama alternativa.

Un árbol de profundidad $N^2 = 64$ con factor de ramificación promedio $\approx 4$ contiene más de $4^{64} \approx 3.4 \times 10^{38}$ estados, haciendo impracticable la búsqueda ciega sin heurísticas.

---

### 3. La Heurística de Warnsdorff
Propuesta por H. C. von Warnsdorff en 1823, esta regla orienta la exploración greedy de las ramas de backtracking:
**Regla de Warnsdorff**: Desde la casilla actual, examinar todos los movimientos válidos hacia casillas no visitadas. Para cada candidato $u$, calcular su **grado de salida no visitado**:
$$\text{grado}(u) = |\{v \mid v \text{ es accesible desde } u \text{ y } v \text{ no ha sido visitada}\}|$$
Ordenar los candidatos en orden estrictamente creciente de $\text{grado}(u)$, eligiendo prioritariamente la casilla con el menor grado.

*Fundamento Teórico*:
Las casillas periféricas (esquinas y bordes) tienen intrínsecamente pocos vecinos (2 o 3 movimientos posibles). Si se postergan en la exploración, terminan convirtiéndose en vértices aislados (callejones sin salida de grado 0) a los que ya ningún movimiento futuro podrá llegar sin quedar atrapado. Al visitar primero las casillas con menor grado accesible, se preservan intactas las casillas centrales de alta conectividad para las fases avanzadas del recorrido.

---

### 4. Complejidad Asintótica
- **Complejidad Temporal**: En el peor caso adverso teórico, el backtracking exhaustivo tiene una cota $O(8^{N^2})$. Sin embargo, la heurística de Warnsdorff reduce la cantidad de retrocesos de manera tan asombrosa que sobre tableros de $8 \times 8$ encuentra una solución completa en tiempo lineal $O(N^2)$ casi sin retrocesos.
- **Complejidad Espacial**: $O(N^2)$ para la matriz del tablero que registra el orden de visita y $O(N^2)$ en la pila de llamadas del sistema.
