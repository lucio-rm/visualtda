# Suma de Subconjuntos (Subset Sum con Backtracking)

## 1. Planteo del Problema

Dado un multiconjunto de $n$ números enteros estrictamente positivos $L = \{w_1, w_2, \dots, w_n\}$ y un entero objetivo $S > 0$, se desea encontrar todos los subconjuntos $L' \subseteq L$ tales que la suma de sus elementos sea exactamente igual a $S$:

$$\sum_{w \in L'} w = S$$

Este problema es una versión del clásico problema de decisión **Subset Sum**, conocido por pertenecer a la clase de problemas **NP-Completos** (Karp, 1972).

---

## 2. Modelado del Espacio de Búsqueda: Árbol Binario de Decisiones

El espacio de búsqueda exhaustivo consta de $2^n$ subconjuntos posibles. Puede estructurarse como un **árbol binario de decisiones**:
- En el nivel $i$ de profundidad ($i = 0, \dots, n-1$), se toma una decisión binaria respecto al elemento $w_i$:
  - **Rama Izquierda (`Tomar`)**: Incluir $w_i$ en el subconjunto parcial.
  - **Rama Derecha (`Dejar`)**: Excluir $w_i$ y avanzar al siguiente elemento.

Un recorrido exhaustivo sin podas visitaría los $2^{n+1} - 1$ nodos del árbol completo.

---

## 3. Podas Fundamentales (Pruning)

La técnica de **Backtracking** se diferencia de la fuerza bruta por su capacidad de podar subárboles completos tan pronto como se detecta que ninguna hoja de esa rama puede ser una solución factible.

### Poda 1: Poda por Exceso (Inviabilidad por Suma Superada)
Dado que todos los elementos son positivos ($w_i > 0$):
$$\text{suma\_actual} + w_i > S \implies \text{Podar}$$
Cualquier inclusión posterior solo incrementaría el valor de la suma, haciendo imposible regresar a $S$.

### Poda 2: Poda por Déficit / Cota Superior (Imposibilidad de Alcanzar la Meta)
Sea $R_i = \sum_{k=i+1}^{n} w_k$ la suma total de todos los elementos aún disponibles para ser considerados en ramas descendientes:
$$\text{suma\_actual} + R_i < S \implies \text{Podar}$$
Incluso si el algoritmo eligiera incluir **todos** los números restantes de la lista, la suma total acumulada jamás alcanzaría la meta $S$. Explorar esta rama es fútil.

### Optimización Heurística: Ordenamiento Decreciente
Si ordenamos el arreglo inicial tal que $w_1 \ge w_2 \ge \dots \ge w_n$:
1. Los números más voluminosos se consideran primero, disparando la **Poda por Exceso** en niveles muy cercanos a la raíz del árbol.
2. Al podar un nodo en nivel $k$, se eliminan de un solo golpe $2^{n-k}$ estados de búsqueda.

---

## 4. Análisis de Complejidad

- **Tiempo en el Peor Caso**: $O(2^n)$ — Ocurre en instancias diseñadas para que las podas no descarten ramas (por ejemplo, cuando $S = \sum w_i$ y todos los elementos son necesarios).
- **Tiempo en el Caso Promedio**: Drásticamente menor a $O(2^n)$. Las podas por exceso y cota superior eliminan típicamente más del 90% del árbol de estados.
- **Espacio Auxiliar**: $O(n)$ — Determinado por la altura máxima de la pila de llamadas recursivas y el arreglo de solución parcial.
