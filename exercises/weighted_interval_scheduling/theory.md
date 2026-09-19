# Planificación de Intervalos Ponderados (Weighted Interval Scheduling)

## 1. Motivación: El Puente entre Greedy y Programación Dinámica

En el problema de **Selección de Intervalos no ponderado** (Kleinberg & Tardos 4.1), una regla voraz (*Greedy*) tan simple como elegir siempre la tarea de fin más temprano garantiza encontrar la máxima cantidad de tareas compatibles.

Sin embargo, en el mundo real las tareas no valen lo mismo: cada tarea $j$ posee un valor o ganancia $v_j > 0$. En esta versión general ponderada, **cualquier heurística voraz fracasa**:
- Elegir por fin más temprano puede tomar una tarea de valor $1$ que bloquea una de valor $1000$.
- Elegir por mayor peso puede tomar una tarea gigantesca de valor $10$ que bloquea 20 tareas de valor $9$ (total $180$).
- Elegir por ratio valor/duración puede caer en trampas similares.

Para resolverlo de forma exacta y eficiente en tiempo **$O(n \log n)$**, recurrimos a la **Programación Dinámica** (Kleinberg & Tardos 6.1).

---

## 2. La Función Predecesora $p(j)$ y Búsqueda Binaria

Supongamos que ordenamos las $n$ tareas por tiempo de finalización creciente:
$$f_1 \le f_2 \le \dots \le f_n$$

Definimos la función clave $p(j)$:
$$p(j) = \text{el mayor índice } i < j \text{ tal que la tarea } i \text{ es compatible con } j \ (f_i \le s_j)$$
Si ninguna tarea previa es compatible con $j$, definimos $p(j) = 0$.

Dado que las tareas ya están ordenadas por tiempo de fin ($f_1 \le f_2 \dots$), encontrar el mayor $i$ con $f_i \le s_j$ es equivalente a realizar una **búsqueda binaria** en el arreglo de tiempos de fin.
- Tiempo para calcular $p(j)$ para una sola tarea: $O(\log n)$.
- Tiempo para calcular $p(j)$ para las $n$ tareas: $O(n \log n)$.

---

## 3. Principio de Optimalidad y Ecuación de Bellman

Consideremos el subproblema de encontrar el subconjunto óptimo entre las primeras $j$ tareas $\{1, 2, \dots, j\}$. Para la última tarea $j$, existen únicamente **dos opciones exhaustivas y mutuamente excluyentes**:

1. **La tarea $j$ NO pertenece a la solución óptima**:
   En este caso, la solución óptima para $\{1, \dots, j\}$ debe ser idéntica a la solución óptima para $\{1, \dots, j - 1\}$:
   $$\text{OPT}(j) = \text{OPT}(j - 1)$$

2. **La tarea $j$ SÍ pertenece a la solución óptima**:
   Si incluimos la tarea $j$, ganamos su peso $v_j$. Además, por definición de compatibilidad, ninguna tarea con índice entre $p(j) + 1$ y $j - 1$ puede ser elegida porque se superpone con $j$. La última tarea previa que puede coexistir con $j$ es $p(j)$. Por el principio de subestructura óptima:
   $$\text{OPT}(j) = v_j + \text{OPT}(p(j))$$

Combinando ambas alternativas, obtenemos la **Ecuación de Bellman**:
$$\text{OPT}(j) = \max\Big(\text{OPT}(j - 1), \ v_j + \text{OPT}(p(j))\Big)$$
con el caso base:
$$\text{OPT}(0) = 0$$

---

## 4. Reconstrucción de la Solución Óptima

Una vez computada la tabla `OPT[0...n]`, el valor máximo total reside en `OPT[n]`. Para recuperar los intervalos específicos:
1. Comenzamos en `curr = n`.
2. Si $v_{\text{curr}} + \text{OPT}[p(\text{curr})] \ge \text{OPT}[\text{curr} - 1]$:
   - La tarea `curr` fue seleccionada. La agregamos al resultado y saltamos a `curr = p(curr)`.
3. En caso contrario:
   - La tarea `curr` no fue seleccionada. Pasamos a `curr = curr - 1`.
4. Repetir mientras `curr > 0`.

---

## 5. Análisis de Complejidad Asintótica

| Etapa | Operación | Complejidad Temporal |
|---|---|---|
| 1 | Ordenar tareas por $f_j$ | $O(n \log n)$ |
| 2 | Calcular $p(j)$ para todo $j$ con búsqueda binaria | $n \times O(\log n) = O(n \log n)$ |
| 3 | Llenar tabla $\text{OPT}[0 \dots n]$ bottom-up | $n \times O(1) = O(n)$ |
| 4 | Reconstruir el conjunto de tareas | $O(n)$ |
| **Total** | **Algoritmo Completo** | **$O(n \log n)$** |

- **Espacio Auxiliar**: $O(n)$ para almacenar las tareas ordenadas, el arreglo $p(j)$ y la tabla $\text{OPT}$.
