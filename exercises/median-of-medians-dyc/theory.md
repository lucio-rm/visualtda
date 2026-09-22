## Selección en Tiempo Lineal Determinístico (Mediana de Medianas)
### Referencia: Kleinberg & Tardos Capítulo 13.5 / CLRS Capítulo 9.3

### 1. Garantía de Balanceo
Al agrupar en bloques de 5 y tomar la mediana de las medianas $:
- Al menos la mitad de las /5$ medianas son $\le p$.
- Cada una de esas medianas aporta al menos 3 elementos $\le p$.
- Por lo tanto, al menos  \times (n/10) = 0.3n$ elementos son menores o iguales a $, garantizando que el subproblema restante tiene tamaño $\le 0.7n$.

### 2. Recurrencia
39043T(n) \le T(n/5) + T(7n/10) + O(n)39043
Como /5 + 7/10 = 9/10 < 1$, la serie geométrica converge y (n) = O(n)$.
