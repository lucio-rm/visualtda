```python
ALGORITMO ResolverLP2D(c, restricciones):
    // Incluir restricciones de no negatividad x >= 0, y >= 0
    R ← restricciones ∪ {(-1, 0, 0), (0, -1, 0)}
    vertices ← []

    // 1. Calcular intersección de cada par de rectas
    PARA CADA par de restricciones (r1, r2) en R:
        (x, y) ← Interseccion(r1, r2)
        SI (x, y) cumple todas las desigualdades en R:
            vertices.agregar((x, y))

    // 2. Evaluar función objetivo en vértices factibles
    mejorVertice ← NULO
    mejorValor ← -∞
    PARA CADA (x, y) en vertices:
        z ← c[0] * x + c[1] * y
        SI z > mejorValor:
            mejorValor ← z
            mejorVertice ← (x, y)

    RETORNAR (mejorVertice, mejorValor)
```
