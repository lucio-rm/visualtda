## Estructura Secundaria de ARN (Interval DP)
### Referencia: Kleinberg & Tardos, Capítulo 6.5

### 1. Restricciones Biofísicas
1. Emparejamiento Watson-Crick: $\{A, U\}$ o $\{C, G\}$.
2. Sin cruces: Si $(i, j)$ y $(k, l)$ son pares, no pueden entrelazarse $i < k < j < l$.
3. Distancia mínima: $j - t \ge 4$ bases.
$$OPT(i, j) = \max \left( OPT(i, j-1), \max_{t < j-4} (1 + OPT(i, t-1) + OPT(t+1, j-1)) \right)$$
Complejidad: $O(n^3)$ en tiempo y $O(n^2)$ en espacio.
