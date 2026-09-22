# Pseudocódigo: 2-Aproximación para Cobertura de Vértices

```text
ALGORITMO CoberturaVertices_2Aprox(Grafo G = (V, E)):
    C ← ConjuntoVacio()
    M ← ListaVacia()

    PARA CADA arista (u, v) EN E:
        SI (u ∉ C) Y (v ∉ C):
            M.Agregar((u, v))     // Arista disjunta (Matching)
            C.Agregar(u)          // Extremo izquierdo
            C.Agregar(v)          // Extremo derecho

    RETORNAR (C, M)
```
