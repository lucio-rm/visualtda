## Minimizar Retraso Máximo (Scheduling to Minimize Lateness)
### Referencia: Kleinberg & Tardos, Capítulo 4.2

### 1. Argumento de Intercambio (Exchange Argument)
Si una solución óptima $S^*$ tiene al menos una inversión, deben existir dos tareas adyacentes $i$ y $j$ con $d_i > d_j$. Al intercambiar $i$ y $j$, la tarea $j$ finaliza antes y la tarea $i$ finaliza en el instante original de $j$, sin aumentar el retraso máximo. Por lo tanto, el cronograma EDF es óptimo.
