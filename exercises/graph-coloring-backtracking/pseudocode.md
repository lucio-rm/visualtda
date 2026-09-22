# Pseudocódigo: Coloreo de Grafos con Backtracking y Poda

```text
ALGORITMO ColorearGrafo(grafo, k):
    vertices ← Claves(grafo)
    colores ← MapaVacio()

    FUNCION EsSeguro(v, c):
        PARA CADA vecino EN grafo[v]:
            SI colores[vecino] = c:
                RETORNAR Falso
        RETORNAR Verdadero

    FUNCION Backtrack(idx):
        SI idx = Longitud(vertices):
            RETORNAR Verdadero

        v ← vertices[idx]
        PARA c DESDE 1 HASTA k:
            SI EsSeguro(v, c):
                colores[v] ← c
                SI Backtrack(idx + 1):
                    RETORNAR Verdadero
                Eliminar(colores, v)  // Deshacer elección (Backtrack)

        RETORNAR Falso

    SI Backtrack(0):
        RETORNAR colores
    SINO:
        RETORNAR Nulo
```
