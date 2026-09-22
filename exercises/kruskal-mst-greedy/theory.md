## Árbol Generador Mínimo de Kruskal
### Referencia: Kleinberg & Tardos, Capítulo 4.5

### 1. La Propiedad del Corte (Cut Property)
Si $e = (u, v)$ es la arista de costo estrictamente mínimo que cruza el corte $(S, V - S)$, entonces $e$ pertenece a todo árbol generador mínimo. Kruskal respeta esta propiedad en cada selección greedy.
