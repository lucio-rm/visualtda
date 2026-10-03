# Selección de Intervalos: Análisis Teórico, Correctness y Complejidad

## 1. Planteo del Problema
Dado un conjunto de $N$ tareas o intervalos $I = \{i_1, i_2, \dots, i_n\}$, donde cada intervalo $i$ posee un tiempo de inicio $s_i$ y un tiempo de fin $f_i$ con $s_i < f_i$.
Dos intervalos $i$ y $j$ son **compatibles** si no se solapan, es decir:
$$f_i \le s_j \quad \text{o} \quad f_j \le s_i$$
El objetivo es encontrar un subconjunto compatible $S \subseteq I$ de **tamaño máximo** ($|S|$ máximo).

---

## 2. Regla Greedy: Finalización Más Temprana (Earliest Finish Time)

### ¿Por qué fallan otras reglas intuitivas?
1. **Menor tiempo de inicio**: Puede elegir una tarea que comienza primero pero dura muchísimo tiempo, bloqueando a todas las demás.
2. **Menor duración ($f_i - s_i$)**: Puede elegir una tarea corta en el centro que solape dos tareas largas a los lados, obteniendo 1 en lugar de 2.
3. **Menos conflictos**: No garantiza optimalidad en todos los grafos de intervalos.

**Regla Óptima**: Seleccionar siempre la tarea disponible que **termine más temprano** ($f_i$ mínimo). Esto deja la mayor cantidad de tiempo libre para acomodar tareas posteriores.

---

## 3. Demostración de Corrección: Greedy Stays Ahead

Sean:
- $A = \{a_1, a_2, \dots, a_k\}$ el conjunto de intervalos seleccionados por el algoritmo Greedy, ordenados por tiempo de fin.
- $O = \{o_1, o_2, \dots, o_m\}$ un conjunto solución óptimo cualquiera, también ordenado por tiempo de fin.

Queremos demostrar que $|A| = |O|$, es decir, que $k = m$.

### Lema (Greedy Stays Ahead):
Para todo $r \le k$, se cumple:
$$f(a_r) \le f(o_r)$$

**Demostración por Inducción sobre $r$**:
1. **Base ($r=1$)**: El algoritmo Greedy elige $a_1$ como el intervalo con el menor tiempo de fin de todo el conjunto. Por lo tanto, $f(a_1) \le f(o_1)$ por definición.
2. **Paso Inductivo**: Supongamos que $f(a_{r-1}) \le f(o_{r-1})$.
   Como $O$ es compatible, sabemos que:
   $$s(o_r) \ge f(o_{r-1})$$
   Aplicando la hipótesis inductiva:
   $$s(o_r) \ge f(a_{r-1})$$
   Esto significa que el intervalo $o_r$ ya era compatible con la selección de Greedy al momento de elegir el $r$-ésimo elemento. Dado que Greedy selecciona el intervalo compatible que termine más temprano, necesariamente:
   $$f(a_r) \le f(o_r)$$

### Conclusión:
Si fuera $k < m$, el óptimo tendría un elemento $o_{k+1}$. Por el lema, $f(a_k) \le f(o_k) \le s(o_{k+1})$, lo que significaría que $o_{k+1}$ era compatible con $a_k$ y Greedy no se habría detenido en el paso $k$. Contradicción. Por lo tanto, $k = m$ y Greedy es estrictamente óptimo.

---

## 4. Complejidad

- **Complejidad Temporal**: $O(N \log N)$ dominada por el ordenamiento de los $N$ intervalos por tiempo de fin. El pase de selección greedy posterior toma $O(N)$ lineal.
- **Complejidad Espacial**: $O(N)$ para almacenar el arreglo ordenado y la lista de salida.

---

## 5. Trampa de la Intuición Ingenua y Contraejemplos

El problema de selección de intervalos es el ejemplo paradigmático donde heurísticas aparentemente "naturales" fracasan rotundamente frente a casos de prueba simples:

### Heurística Ingenua 1: Menor Tiempo de Inicio ($s_i$ mínimo)
- **Intuición**: Empezar lo antes posible para no perder tiempo libre.
- **Contraejemplo**: $I = \{ [0, 100], [1, 2], [3, 4], [5, 6] \}$.
- **Resultado Greedy**: Elige $[0, 100]$ por empezar en $t=0$, lo que bloquea a todos los demás. Total = $1$.
- **Óptimo**: $\{ [1, 2], [3, 4], [5, 6] \}$ con Total = $3$.

### Heurística Ingenua 2: Menor Duración ($f_i - s_i$ mínimo)
- **Intuición**: Tareas más cortas ocupan menos tiempo, liberando espacio para más tareas.
- **Contraejemplo**: $I = \{ [0, 5], [4, 7], [6, 11] \}$.
  - Duración de $[4, 7]$ es $3$.
  - Duraciones de $[0, 5]$ y $[6, 11]$ son $5$ cada una.
- **Resultado Greedy**: Elige vorazmente $[4, 7]$ por ser la más corta. Esto bloquea simultáneamente a $[0, 5]$ y $[6, 11]$. Total devuelto = $1$.
- **Óptimo**: Seleccionar $\{ [0, 5], [6, 11] \}$ obteniendo Total = $2$.

### Heurística Ingenua 3: Menor Número de Conflictos

- **Intuición**: Elegir en cada paso la tarea que colisione con la menor cantidad de tareas restantes.
- **Contraejemplo**: Aunque parece robusta, existen configuraciones específicas donde esta elección voraz conduce a soluciones subóptimas al elegir prematuramente un intervalo central en lugar de secuencias simétricas coordinadas.

Solo el criterio de **Earliest Finish Time** ($f_i$ mínimo) garantiza matemáticamente la propiedad "Greedy Stays Ahead", dejando siempre el tiempo residual libre más amplio posible.

