# Antenas en una Ruta (Cobertura de Intervalos)

## 1. Contexto y Problema

Tenemos una ruta recta lineal representada como el semieje real $\mathbb{R}_{\ge 0}$, sobre la cual hay $n$ casas ubicadas en los kilómetros $x_1, x_2, \dots, x_n$ (valores reales, potencialmente desordenados).

Se deben construir estaciones base (antenas) sobre la ruta. Cada antena tiene un radio de cobertura fijo $R > 0$. Una antena situada en el kilómetro $a$ da servicio a todas las casas ubicadas en el intervalo cerrado:
$$[a - R, a + R]$$

**Objetivo**: Ubicar la **menor cantidad posible de antenas** sobre la ruta de tal modo que **todas** las casas queden cubiertas por al menos una antena.

---

## 2. Intuición y Regla Golosa (Greedy Choice)

Si ordenamos las casas de izquierda a derecha ($x_1 \le x_2 \le \dots \le x_n$), consideremos la **primera casa no cubierta** $x_{\text{prim}}$.

Cualquier antena que cubra $x_{\text{prim}}$ debe situarse en una posición $a$ tal que:
$$x_{\text{prim}} - R \le a \le x_{\text{prim}} + R$$

Para cubrir las casas que están a la derecha de $x_{\text{prim}}$, nos conviene empujar la posición de la antena **lo más a la derecha posible** sin dejar desprotegida a $x_{\text{prim}}$.

Por ende, la elección golosa óptima es fijar:
$$a = x_{\text{prim}} + R$$

Esta antena cubre el rango $[x_{\text{prim}}, x_{\text{prim}} + 2R]$. A continuación, descartamos todas las casas cuyo kilómetro sea $\le x_{\text{prim}} + 2R$ y reiteramos el proceso con la siguiente casa no cubierta.

---

## 3. Demostración Formal de Optimalidad (Greedy Stays Ahead)

Demostraremos que el algoritmo Greedy encuentra una solución de tamaño mínimo mediante un **argumento de intercambio / Greedy Stays Ahead**.

Sean $A = \{a_1, a_2, \dots, a_k\}$ las posiciones de las antenas elegidas por Greedy (ordenadas crecientemente) y sea $O^* = \{o_1, o_2, \dots, o_m\}$ cualquier solución óptima válida (ordenada crecientemente).

### Lema (Greedy cubre al menos tan a la derecha como cualquier óptimo)
Para todo $j \in \{1, \dots, k\}$, se cumple que:
$$a_j \ge o_j$$

**Demostración por inducción en $j$:**

1. **Caso base ($j = 1$):**
   La primera casa es $x_1$. Para que $o_1$ cubra $x_1$, necesariamente $o_1 \le x_1 + R$.
   Como Greedy elige exactamente $a_1 = x_1 + R$, se sigue de inmediato que:
   $$a_1 \ge o_1$$

2. **Paso inductivo:**
   Supongamos que $a_j \ge o_j$.
   Sea $x_{\text{sig}}$ la primera casa que no está cubierta por $a_j$. Dado que $a_j \ge o_j$, el alcance de $a_j$ hacia la derecha es:
   $$a_j + R \ge o_j + R$$
   Por ende, como $x_{\text{sig}} > a_j + R$, ciertamente $x_{\text{sig}} > o_j + R$.
   Esto implica que $x_{\text{sig}}$ tampoco puede estar cubierta por $o_j$. En consecuencia, en la solución óptima $O^*$, la casa $x_{\text{sig}}$ debe ser cubierta por una antena posterior, en particular por $o_{j+1}$.
   Para que $o_{j+1}$ cubra $x_{\text{sig}}$, debe cumplirse:
   $$o_{j+1} \le x_{\text{sig}} + R$$
   Greedy elige precisamente $a_{j+1} = x_{\text{sig}} + R$. Por lo tanto:
   $$a_{j+1} \ge o_{j+1}$$

$\blacksquare$

### Teorema (Optimalidad de Greedy)
El número de antenas elegidas por Greedy es menor o igual al de cualquier solución factible: $k \le m$. Dado que $O^*$ es óptimo, se concluye que $k = m$.

**Demostración:**
Si fuera $k > m$, entonces existiría la antena $a_{m+1}$.
Por el lema anterior, $a_m \ge o_m$, lo que implica que el conjunto $\{a_1, \dots, a_m\}$ cubre un prefijo de la ruta al menos tan extenso como $\{o_1, \dots, o_m\}$.
Como $O^*$ es una solución factible completa, $\{o_1, \dots, o_m\}$ cubre a todas las casas.
En consecuencia, $\{a_1, \dots, a_m\}$ ya cubre a todas las casas, por lo que Greedy no generaría una antena $a_{m+1}$ (el algoritmo se detiene cuando no hay más casas sin cobertura).
Contradicción. Por lo tanto, $k = m$. $\blacksquare$

---

## 4. Análisis de Complejidad

- **Tiempo**:
  - Ordenar las $n$ casas: $O(n \log n)$.
  - Escaneo lineal de dos punteros: cada casa se visita una sola vez: $O(n)$.
  - **Total**: $O(n \log n)$. (Si las casas ya están ordenadas, el algoritmo es estrictamente $O(n)$).
- **Espacio Auxiliar**: $O(k) \le O(n)$ para la lista de salida.

---

## 5. Trampa de la Intuición Ingenua: Centrar la Antena en la Casa

### Por Qué Colocar la Antena Sobre la Casa es Subóptimo
Una estrategia ingenua habitual es colocar la primera antena exactamente encima de la primera casa descubierta ($a = x_1$). Al hacer esto, el radio de cobertura hacia la izquierda $[x_1 - R, x_1]$ se desperdicia por completo porque no hay ninguna casa a la izquierda de $x_1$. Al adelantar la antena lo máximo posible hacia la derecha ($a = x_1 + R$), la casa $x_1$ sigue estando cubierta en el límite izquierdo del intervalo, pero se maximiza el alcance hacia la derecha hasta $x_1 + 2R$, reduciendo la cantidad total de antenas necesarias.
