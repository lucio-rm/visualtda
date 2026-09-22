## Elemento Mayoritario por División y Conquista
### Referencia: Kleinberg & Tardos, Ejercicios de Capítulo 5

### 1. Invariante de Conquista
Si un elemento $ aparece estrictamente más de /2$ veces en [1..n]$, entonces por el Principio del Palomar (Pigeonhole Principle), debe aparecer más de la mitad de las veces en al menos una de las dos mitades [1..n/2]$ o [n/2+1..n]$.

### 2. Recurrencia
39043T(n) = 2T(n/2) + O(n) \implies T(n) = O(n \log n)39043
