## Par de Puntos Más Cercano (Closest Pair of Points)
### Referencia: Kleinberg & Tardos, Capítulo 5.4

### 1. Invariante y Lema de Esparcimiento (Sparsity)
El lema fundamental demuestra que en cualquier caja de dimensiones $\delta \times 2\delta$ centrada en la recta divisoria, no puede haber más de 8 puntos que estén a distancia mutua $\ge \delta$. Por lo tanto, al ordenar la franja central por coordenada Y, basta con comparar cada punto con a lo sumo los siguientes 7 vecinos inmediatos.

### 2. Relación de Recurrencia
39043T(n) = 2T(n/2) + O(n)39043
Por el Teorema Maestro (Caso 2), la complejidad temporal es:
39043T(n) = O(n \log n)39043
