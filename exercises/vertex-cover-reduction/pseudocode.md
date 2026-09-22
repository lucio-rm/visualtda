# Pseudocódigo: Reducción Independent Set a Vertex Cover

```text
ALGORITMO Reducir_IS_a_VC(Grafo G = (V, E), Entero k):
    n ← Longitud(V)
    k' ← n - k
    RETORNAR (G, k')

PROCEDIMIENTO Recuperar_IS_desde_VC(V, Cobertura C):
    S ← []
    PARA CADA vertice v EN V:
        SI v NO ESTÁ EN C:
            S.Agregar(v)
    RETORNAR S

PROCEDIMIENTO Verificar_Conjunto_Independiente(E, S):
    PARA CADA (u, v) EN E:
        SI (u ∈ S) Y (v ∈ S):
            RETORNAR Falso  // Conflicto de adyacencia
    RETORNAR Verdadero

PROCEDIMIENTO Verificar_Cobertura_Vertices(E, C):
    PARA CADA (u, v) EN E:
        SI (u ∉ C) Y (v ∉ C):
            RETORNAR Falso  // Arista no cubierta
    RETORNAR Verdadero
```
