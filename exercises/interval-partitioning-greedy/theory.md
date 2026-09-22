## Partición de Intervalos (Classroom Scheduling)
### Referencia: Kleinberg & Tardos, Capítulo 4.1

### 1. Definición de Profundidad (Depth)
La profundidad $d$ de un conjunto de intervalos es la cantidad máxima de intervalos que se superponen en un instante de tiempo arbitrario $t$. Cualquier solución válida requiere al menos $d$ aulas: $\text{Aulas requeridas} \ge d$.

### 2. Teorema de Optimalidad Greedy
El algoritmo por tiempo de inicio temprano nunca utiliza más de $d$ aulas. Cuando se considera el intervalo $i$, a lo sumo $d-1$ aulas están ocupadas con intervalos que empezaron antes de $s_i$ y terminan después de $s_i$. Por lo tanto, siempre existe un aula compatible disponible entre las primeras $d$.
