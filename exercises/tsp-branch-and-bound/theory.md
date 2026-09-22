## TSP: Ramificación y Poda (Branch & Bound)
### Referencia: Kleinberg & Tardos Capítulo 8 / Papadimitriou & Steiglitz

### 1. Principio de Ramificación y Poda
Se subdivide el espacio de soluciones (Branch) y se calcula una función de cota inferior $L(nodo)$ (Bound). Si $L(nodo) \ge \text{Mejor Solución Conocida}$, ningún descendiente puede mejorar la cota, permitiendo podar el subárbol completo sin pérdida de optimalidad.
