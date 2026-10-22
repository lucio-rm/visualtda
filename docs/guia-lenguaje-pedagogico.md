# Visual TDA — Guía de Lenguaje Pedagógico y Rigor Conceptual

> **Manual de Redacción Universitaria y Convenciones Teóricas**  
> **Referencia Principal**: Kleinberg & Tardos, *Algorithm Design* (Pearson/Addison-Wesley)  
> **Cátedra de Referencia**: Teoría y Diseño de Algoritmos (FIUBA / UBA)  

---

## 1. Tono y Audiencia

Visual TDA está diseñado para estudiantes de grado universitario en Ingeniería Informática y Ciencias de la Computación. Por lo tanto:

- **Tono Adulto y Riguroso**: Se descarta el lenguaje infantilizado, las animaciones vacías o el tono de "gamificación" superficial. Cero emojis en las explicaciones teóricas y en los componentes formales del software.
- **Enfoque Inductivo y Matemático**: Se asume familiaridad con estructuras de datos discretas (árboles, grafos, conjuntos), recurrencias matemáticas y notación asintótica ($O$, $\Omega$, $\Theta$).
- **No se oculta la dificultad**: Cuando un problema es NP-Completo o requiere una demostración delicada (e.g. demostración de *Greedy Stays Ahead* o intercambio), se explica con claridad en lugar de trivializarlo.

---

## 2. Convenciones Terminológicas Canónicas

### 2.1 Uso de "Greedy" vs. "Algoritmos Voraces"
- **Término Canónico**: Se utiliza el término universal **Greedy** en títulos, insignias técnicas, taxonomías y código (`categoryId: 'greedy'`, badge: `GREEDY`).
- **Uso Explicativo**: El término "voraz" se acepta únicamente dentro del cuerpo descriptivo para evocar la intuición de una elección miope e irrevocable, pero la técnica se formaliza siempre como *Algoritmo Greedy*.

### 2.2 Conceptos Clave por Paradigma

#### A. Algoritmos Greedy (K&T Capítulo 4)
- **Elección Local Óptima**: Decisión irrevocable guiada por un criterio de ordenamiento sin retroceso.
- **Argumento de Intercambio (*Exchange Argument*)**: Técnica de demostración formal que toma una solución óptima arbitraria $O$ y la transforma gradualmente en la solución voraz $A$ sin empeorar el valor objetivo ($v(O') \ge v(O)$).
- **Greedy Stays Ahead**: Demostración inductiva que prueba que en cada paso $k$, la solución voraz avanza al menos tanto como cualquier solución admisible ($f(A_k) \le f(O_k)$).

#### B. División y Conquista (K&T Capítulo 5)
- **Subproblemas Disjuntos**: División en partes independientes que no se solapan.
- **Paso de Combinación (*Combine Step*)**: La operación crítica (e.g., fusión en $O(N)$) donde reside el trabajo algorítmico principal.
- **Teorema Maestro**: Formulación asintótica para recurrencias del tipo $T(n) = a T(n/b) + O(n^d)$.

#### C. Programación Dinámica (K&T Capítulo 6)
- **Subestructura Óptima**: La solución global contiene dentro de sí soluciones óptimas a sus subproblemas.
- **Subproblemas Superpuestos**: Los subproblemas se repiten exponencialmente si se computan ingenuamente; la DP los tabula en tiempo polinomial.
- **Holgura Ociosa (*Slack Capacity*)**: Capacidad remanente indivisible que provoca el fracaso de Greedy en la mochila entera 0/1.
- **Reconstrucción (*Traceback*)**: Retroceso desde la celda final de la matriz hacia los casos base para recuperar los elementos que componen la solución óptima.

#### D. Búsqueda en Espacio de Estados y Backtracking (K&T Capítulo 8)
- **Invariante de Estado**: Condición que debe cumplirse en cada nodo del árbol de decisión (e.g. en N-Reinas, que ninguna reina amenace a otra en filas previas).
- **Poda Inmediata (*Pruning*)**: Abandono de un subárbol completo sin evaluar sus descendientes tan pronto como se detecta una violación a las restricciones.

#### E. Flujo en Redes y Programación Lineal (K&T Capítulos 7 y 11)
- **Red Residual**: Grafo donde las aristas reflejan capacidad residual para enviar más flujo o retroceder flujo previo.
- **Corte Mínimo y Cuello de Botella**: Teorema Max-Flow Min-Cut de Ford-Fulkerson.
- **Dualidad de Programación Lineal**: Cota superior que certifica la optimalidad de una solución primal.

---

## 3. La Regla de Explicar el "POR QUÉ"

Cada vez que el sistema presenta un paso de traza o una transición de estado, debe responder a cuatro preguntas esenciales:

1. **¿Qué hizo el algoritmo?** (*e.g., "Evaluó colocar una reina en la casilla (1, 2)"*).
2. **¿Por qué tomó esa decisión?** (*e.g., "Porque la casilla está libre de ataques en fila y columna, pero colisiona en la diagonal secundaria con la reina en (0, 1)"*).
3. **¿Cuál es la consecuencia teórica?** (*e.g., "Se poda inmediatamente la rama; se descartan $N^{N-2}$ posibles configuraciones descendentes sin explorarlas"*).
4. **¿Cuál es el costo asintótico del paso?** (*e.g., "Chequeo de colisión en $O(1)$ mediante conjuntos de diagonales"*).

Cualquier visualizador que únicamente diga *"Paso siguiente"* sin brindar causalidad incumple esta directiva pedagógica.
