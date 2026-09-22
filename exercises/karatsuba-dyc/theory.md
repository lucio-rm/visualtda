## Multiplicación Rápida de Karatsuba
### Referencia: Kleinberg & Tardos, Capítulo 5.5

### 1. Truco Algebraico de Gauss
Al descomponer  = x_1 10^m + x_0$ e  = y_1 10^m + y_0$, el producto clásico requiere 4 multiplicaciones:  y_1$,  y_0$,  y_1$,  y_0$. Karatsuba observa que:
39043(x_1 + x_0)(y_1 + y_0) - x_1 y_1 - x_0 y_0 = x_1 y_0 + x_0 y_139043
Esto reduce las 4 multiplicaciones a 3.

### 2. Recurrencia y Complejidad
39043T(n) = 3T(n/2) + O(n)39043
Por el Teorema Maestro con  = 3, b = 2$:
39043T(n) = O(n^{\log_2 3}) \approx O(n^{1.585})39043
