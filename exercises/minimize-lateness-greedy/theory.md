# Minimizar Retraso Máximo (Scheduling to Minimize Lateness): Regla EDF

## 1. Definición Formal del Problema

Se dispone de un único recurso (un procesador o máquina) y un conjunto de $n$ tareas $\{1, 2, \dots, n\}$. Cada tarea $i$ requiere un tiempo continuo de procesamiento $t_i > 0$ y posee una fecha de entrega límite $d_i$.
El procesador comienza en el instante $t = 0$ y solo puede ejecutar una tarea a la vez sin interrupciones (sin preempción).

Para un cronograma que asigna a la tarea $i$ un intervalo de inicio $s_i$ y finalización $f_i = s_i + t_i$, el **retraso** de la tarea $i$ se define como:
$$L_i = \max(0, f_i - d_i)$$
El objetivo consiste en encontrar un ordenamiento de las tareas que minimice el **retraso máximo**:
$$L_{\max} = \max_{1 \le i \le n} L_i$$

---

## 2. Regla Greedy: Earliest Deadline First (EDF)

El algoritmo ordena todas las tareas según su fecha de entrega límite en orden no decreciente:
$$d_1 \le d_2 \le \dots \le d_n$$
y las programa de manera contigua y secuencial sin tiempos muertos innecesarios:
$$s_1 = 0, \quad s_i = f_{i-1} \text{ para todo } i \ge 2$$

---

## 3. Demostración Formal de Optimalidad por Argumento de Intercambio

**Definición**: Un cronograma contiene una **inversión** si existe un par de tareas $i$ y $j$ tales que $i$ se programa antes que $j$, pero la fecha límite de $i$ es estrictamente posterior a la de $j$ ($d_i > d_j$). El cronograma EDF no contiene ninguna inversión.

**Lema de Inversiones Adyacentes**: Si un cronograma contiene alguna inversión, contiene al menos una inversión entre dos tareas consecutivas y contiguas.

### Teorema de Optimalidad
El cronograma producido por la regla EDF minimiza el retraso máximo.

*Demostración (Argumento de Intercambio)*:
Sea $S^*$ un cronograma óptimo con el menor número de inversiones posibles. Si $S^*$ no tiene inversiones, coincide con la solución EDF y el teorema se cumple.
Si $S^*$ tiene al menos una inversión, tomemos dos tareas adyacentes $i$ y $j$ donde $i$ se ejecuta inmediatamente antes que $j$, pero $d_i > d_j$.
Intercambiamos el orden de ejecución de $i$ y $j$, obteniendo un nuevo cronograma $S'$:
- Todas las demás tareas no alteran sus instantes de inicio ni finalización, por lo que sus retrasos permanecen invariantes.
- La tarea $j$ ahora finaliza antes que en $S^*$, por lo que su nuevo retraso $L_j' \le L_j \le L_{\max}(S^*)$.
- La tarea $i$ ahora finaliza exactamente en el instante en que finalizaba la tarea $j$ en $S^*$ ($f_i' = f_j$). Su nuevo retraso es:
  $$L_i' = f_i' - d_i = f_j - d_i < f_j - d_j = L_j \le L_{\max}(S^*)$$
Por consiguiente, el retraso máximo de ninguna de las tareas intercambiadas supera el retraso máximo original:
$$L_{\max}(S') \le L_{\max}(S^*)$$
Dado que $S^*$ ya era óptimo, $S'$ es también un cronograma óptimo y contiene estrictamente una inversión menos que $S^*$.
Repitiendo este argumento de intercambio inductivamente, podemos transformar $S^*$ en el cronograma EDF sin aumentar en ningún paso el retraso máximo. Por ende, EDF es globalmente óptimo.

---

## 4. Análisis Detallado de Complejidad Asintótica ($O(n \log n)$)

- **Ordenamiento inicial por fechas límite**: $O(n \log n)$ comparaciones.
- **Asignación temporal secuencial**: $O(n)$ acumulando duraciones.
- **Complejidad Temporal Total**: $O(n \log n)$.
- **Complejidad Espacial**: $O(n)$ para almacenar las tareas ordenadas y los tiempos resultantes.

---

## 5. Trampa de la Intuición: Por Qué Ordenar por Menor Duración Falla Rotundamente

### Contraejemplo de Duración Más Corta (Shortest Processing Time)
Consideremos dos tareas: Tarea 1 con $t_1 = 1, d_1 = 100$ y Tarea 2 con $t_2 = 10, d_2 = 10$.
- Si ordenamos por menor duración: Tarea 1 corre de 0 a 1 ($L_1 = 0$), luego Tarea 2 corre de 1 a 11 ($L_2 = 11 - 10 = 1$). El retraso máximo es 1.
- Con EDF: Tarea 2 corre de 0 a 10 ($L_2 = 0$), luego Tarea 1 corre de 10 a 11 ($L_1 = 0$). El retraso máximo es 0.
Ordenar por duración ignora la urgencia de los vencimientos, produciendo retrasos innecesarios.
