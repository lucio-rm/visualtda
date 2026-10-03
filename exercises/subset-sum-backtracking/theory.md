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

### Demostración Formal de Correctitud e Invariantes de Búsqueda

1. **Invariante de Estado Parcial**: En el nivel $i$ del árbol de recursión, `suma_actual` refleja con exactitud $\sum_{k \in \text{elegidos}} w_k$, donde $\text{elegidos} \subseteq \{0, \dots, i-1\}$.
2. **Seguridad de la Poda por Exceso**: Dado que $w_k > 0$ para todo $k$, cualquier rama descendiente solo puede sumar valores no negativos. Por lo tanto, si $\text{suma\_actual} + w_i > S$, todo estado en el subárbol descendiente tendrá suma estrictamente superior a $S$. Podar esta rama no descarta ninguna solución válida.
3. **Seguridad de la Poda por Déficit**: Si $\text{suma\_actual} + R_i < S$, incluso incluyendo todos los elementos pendientes $\{w_{i+1}, \dots, w_n\}$, la suma máxima alcanzable no llegará a $S$. Ninguna hoja de esta rama puede ser solución.
4. **Completitud**: Las dos ramas (`Tomar` y `Dejar`) cubren exhaustivamente las decisiones binarias sobre cada elemento. Al podar únicamente ramas con cota inferior $>S$ o cota superior $<S$, se garantiza que toda solución válida $L'$ con $\sum_{w \in L'} w = S$ es visitada y reportada.

---

## 4. Análisis de Complejidad

- **Tiempo en el Peor Caso**: $O(2^n)$ — Ocurre en instancias diseñadas para que las podas no descarten ramas (por ejemplo, cuando $S = \sum w_i$ y todos los elementos son necesarios).
- **Tiempo en el Caso Promedio**: Drásticamente menor a $O(2^n)$. Las podas por exceso y cota superior eliminan típicamente más del 90% del árbol de estados.
- **Espacio Auxiliar**: $O(n)$ — Determinado por la altura máxima de la pila de llamadas recursivas y el arreglo de solución parcial.

---

## 5. Trampa de la Intuición Ingenua: El Fracaso de la Selección Voraz (Greedy)

### Contraejemplo de la Elección Miope
Una heurística voraz común consiste en ordenar los elementos de mayor a menor y tomar vorazmente cada elemento que no sobrepase $S$:
- **Instancia**: $L = [10, 6, 6]$, Objetivo: $S = 12$.
- **Ejecución Greedy**:
  1. Toma $10$ (cabe en $12$, resta $2$).
  2. Evalúa el primer $6$: no cabe ($10 + 6 = 16 > 12$), lo descarta.
  3. Evalúa el segundo $6$: no cabe, lo descarta.
  4. Finaliza con suma $10 \ne 12$ y declara erróneamente que no existe solución.
- **Solución Real**: El subconjunto $\{6, 6\}$ suma exactamente $6 + 6 = 12$.

La estrategia voraz falla porque tomar el elemento individual más grande puede bloquear combinaciones de múltiples elementos menores que juntos totalizan la suma requerida. El **Backtracking con Poda** explora alternativas y retrocede ante callejones sin salida, garantizando encontrar todas las soluciones válidas.

