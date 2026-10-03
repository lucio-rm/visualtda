# Partición de Intervalos (Classroom Scheduling en Tiempo $O(n \log n)$)

## 1. Definición Formal del Problema

Dado un conjunto de $n$ tareas o clases $I = \{1, 2, \dots, n\}$, donde cada intervalo $i$ posee un tiempo de inicio $s_i$ y un tiempo de finalización $f_i$ con $s_i < f_i$, el problema de **Partición de Intervalos** consiste en asignar cada tarea a un recurso (aula o procesador) tal que ninguna pareja de tareas asignadas al mismo recurso se solape en el tiempo, minimizando la cantidad total de recursos utilizados.

Dos intervalos $i$ y $j$ se solapan si $s_i < f_j$ y $s_j < f_i$.

---

## 2. Definición de Profundidad (Depth) y Cota Inferior Estructural

**Definición**: La **profundidad** $d$ de una colección de intervalos es el número máximo de intervalos que coinciden simultáneamente en algún punto del tiempo:
$$d = \max_{t} |\{i \in I \mid s_i \le t < f_i\}|$$

**Lema de Cota Inferior**: Cualquier asignación válida requiere al menos $d$ aulas.

*Demostración*:
Sea $t^*$ un instante donde $d$ intervalos se solapan concurrentemente. Como los $d$ intervalos demandan el recurso exactamente en $t^*$, dos de ellos cualesquiera no pueden compartir la misma aula. Por lo tanto, se necesitan al menos $d$ aulas distintas para albergar solo a ese subconjunto:
$$\text{Aulas Requeridas} \ge d$$

---

## 3. Algoritmo Greedy y Demostración Formal de Optimalidad

El algoritmo greedy por tiempo de inicio temprano opera de la siguiente manera:
1. **Ordenamiento**: Ordenar los intervalos en orden no decreciente de sus tiempos de inicio: $s_1 \le s_2 \le \dots \le s_n$.
2. **Asignación**: Se itera sobre cada intervalo $i$. Si existe alguna aula existente cuyo intervalo previo haya finalizado antes de $s_i$, se asigna el intervalo $i$ a dicha aula. Si todas las aulas activas están ocupadas en $s_i$, se crea una nueva aula etiquetada con el siguiente número entero disponible.

### Teorema de Optimalidad
El algoritmo greedy nunca utiliza más de $d$ aulas, alcanzando exactamente el mínimo teórico posible.

*Demostración*:
Supongamos por contradicción que el algoritmo asigna el intervalo $i$ a un aula nueva con índice $d + 1$.
Esto implica que en el instante de asignación de $i$, cada una de las aulas $1, 2, \dots, d$ contenía algún intervalo asignado cuyo tiempo de finalización era posterior a $s_i$.
Dado que las tareas fueron procesadas en orden de inicio, todos esos $d$ intervalos comenzaron en instantes $s_j \le s_i$.
Junto con el intervalo $i$, tenemos $d + 1$ intervalos mutuamente superpuestos en el instante $t = s_i + \varepsilon$.
Esto contradice la definición de que la profundidad máxima de toda la instancia es $d$.
Por ende, el algoritmo jamás apertura un aula $d + 1$, y utiliza a lo sumo $d$ aulas. Como ninguna solución puede usar menos de $d$, la solución es óptima.

---

## 4. Análisis Detallado de Complejidad Asintótica (Min-Heap)

- Para consultar rápidamente el aula libre con menor tiempo de finalización, se mantiene un Min-Heap donde cada elemento representa un aula y su clave es el tiempo de finalización de su última tarea asignada.
- **Ordenamiento inicial**: $O(n \log n)$.
- **Asignación iterativa**: Para cada una de las $n$ tareas, se consulta la raíz del heap en $O(1)$ y se realiza una extracción/inserción en $O(\log d)$.
- **Complejidad Temporal Total**: $O(n \log n + n \log d) = O(n \log n)$ ya que $d \le n$.
- **Complejidad Espacial**: $O(n)$ para almacenar los intervalos y el heap de aulas.

---

## 5. Trampa de la Intuición Ingenua: Ordenar por Tiempo de Fin o Duración

### Por Qué Fallan Otras Reglas Greedy
- **Ordenar por duración más corta**: Puede dejar huecos fragmentados que obliguen a abrir aulas adicionales para intervalos largos subsiguientes.
- **Ordenar por tiempo de fin temprano**: Aunque funciona perfectamente para Interval Scheduling (donde seleccionamos el subconjunto disjunto máximo en un solo recurso), en Partición de Intervalos abrir aulas siguiendo el fin temprano puede agotar las aulas antes de procesar tareas que comenzaron mucho antes, violando la cota de profundidad $d$. Solo ordenar por **tiempo de inicio** garantiza la cota estructural.
