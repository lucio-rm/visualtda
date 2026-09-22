## Mochila 0/1 por Branch & Bound
### Referencia: Kleinberg & Tardos Capítulo 8 / Martello & Toth

### 1. Relajación Lineal Continua
Al resolver la mochila fraccionaria (Greedy en $O(n \log n)$) para los ítems restantes, se obtiene una cota superior formal $UB$ de la máxima ganancia posible en el subárbol. Si $UB \le \text{Mejor Entero}$, la poda es matemáticamente exacta.
