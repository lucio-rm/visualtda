# Multiplicación Rápida de Karatsuba: División y Conquista Subcuadrática

## 1. Definición Formal y Planteo del Problema

Dados dos números enteros positivos $x$ e $y$ representados en base $B$ (típicamente $B=10$ o $B=2$) con $n$ dígitos cada uno, el algoritmo tradicional de multiplicación de la escuela primaria ejecuta $n^2$ multiplicaciones elementales dígito a dígito, con complejidad temporal $\Theta(n^2)$.

El algoritmo descubierto por Anatoly Karatsuba en 1960 demuestra que es posible multiplicar dos números de $n$ dígitos realizando únicamente 3 multiplicaciones de enteros de $n/2$ dígitos, rompiendo la barrera cuadrática.

---

## 2. Descomposición y el Truco Algebraico de Gauss

Sea $m = \lceil n/2 \rceil$. Escribimos los números divididos en sus mitades más y menos significativas:
$$x = x_1 \cdot B^m + x_0$$
$$y = y_1 \cdot B^m + y_0$$
donde $x_0, y_0 < B^m$ y $x_1, y_1$ contienen los dígitos restantes.

El producto de $x$ e $y$ se expande como:
$$x \cdot y = (x_1 B^m + x_0)(y_1 B^m + y_0) = x_1 y_1 B^{2m} + (x_1 y_0 + x_0 y_1) B^m + x_0 y_0$$

La expansión ingenua requiere 4 productos de tamaño $m$:
1. $z_2 = x_1 \cdot y_1$
2. $z_0 = x_0 \cdot y_0$
3. $x_1 \cdot y_0$
4. $x_0 \cdot y_1$

Karatsuba observó que el término central cruzado $(x_1 y_0 + x_0 y_1)$ puede obtenerse a partir de una única multiplicación adicional $z_1 = (x_1 + x_0)(y_1 + y_0)$ restando los términos ya calculados:
$$z_1 - z_2 - z_0 = (x_1 + x_0)(y_1 + y_0) - x_1 y_1 - x_0 y_0 = x_1 y_0 + x_0 y_1$$

Por lo tanto, solo se computan 3 multiplicaciones recursivas:
$$z_2 = x_1 \cdot y_1, \quad z_0 = x_0 \cdot y_0, \quad z_1 = (x_1 + x_0) \cdot (y_1 + y_0)$$
y la combinación final se reduce a sumas, restas y corrimientos:
$$x \cdot y = z_2 B^{2m} + (z_1 - z_2 - z_0) B^m + z_0$$

---

## 3. Invariante y Demostración Formal de Correctitud

### Invariante de Inducción
Para todo par de enteros no negativos $x, y < B^n$, el algoritmo retorna exactamente el producto numérico $x \cdot y$.
- *Caso base*: Cuando $n \le 1$, el producto es una multiplicación atómica que retorna $x \cdot y$ directamente.
- *Paso inductivo*: Asumiendo que las 3 llamadas recursivas computan fielmente $z_2, z_0, z_1$ para instancias de longitud $\le \lceil n/2 \rceil + 1$, la identidad algebraica demostrada garantiza que la recomposición polinomial en potencias de $B^m$ reproduce exactamente la expansión del producto $(x_1 B^m + x_0)(y_1 B^m + y_0)$.

---

## 4. Análisis de Complejidad Asintótica (Teorema Maestro)

Las sumas, restas y desplazamientos de potencias de $B$ involucran vectores de longitud $O(n)$, por lo que la fase de combinación requiere tiempo lineal $O(n)$.
La relación de recurrencia es:
$$T(n) = 3T(n/2) + O(n)$$

Aplicando el Teorema Maestro con $a = 3$, $b = 2$, y $f(n) = O(n)$:
- El exponente crítico es $\log_b a = \log_2 3 \approx 1.58496$.
- Como $f(n) = O(n^1)$ y $1 < \log_2 3$, estamos en el **Caso 1** del Teorema Maestro:
$$T(n) = \Theta(n^{\log_2 3}) \approx \Theta(n^{1.585})$$

La profundidad máxima del árbol de recursión es $\log_2 n$, consumiendo $O(n)$ memoria auxiliar para almacenar los dígitos intermedios en la pila de llamadas.

---

## 5. Trampa del Algoritmo Escolar de Grado 2 y Umbral Práctico

### Por Qué el Algoritmo Escolar Parece Más Simple
El algoritmo escolar tiene menor sobrecarga constante para enteros pequeños ($n < 32$ bits), por lo que librerías de alta precisión (como GMP o Python `int`) usan el método tradicional para números cortos y conmutan dinámicamente a Karatsuba para números grandes (criptografía RSA, números primos de Mersenne), reduciendo radicalmente los millones de operaciones requeridas.
