# Pseudocódigo Formal: Subsecuencia Común Más Larga (LCS)

```text
ALGORITMO SubsecuenciaComunMasLarga(X, Y):
    m ← Longitud(X)
    n ← Longitud(Y)

    SI m = 0 O n = 0:
        RETORNAR ""

    // Inicializar matriz DP de tamaño (m + 1) x (n + 1) en ceros
    c ← Matriz(m + 1, n + 1, 0)

    // Llenado de la matriz bottom-up
    PARA i ← 1 HASTA m:
        PARA j ← 1 HASTA n:
            SI X[i - 1] = Y[j - 1]:
                c[i, j] ← c[i - 1, j - 1] + 1
            SINO:
                c[i, j] ← Maximo(c[i - 1, j], c[i, j - 1])

    // Reconstrucción del camino hacia atrás
    resultado ← []
    i ← m
    j ← n
    MIENTRAS i > 0 Y j > 0:
        SI X[i - 1] = Y[j - 1]:
            resultado.Agregar(X[i - 1])
            i ← i - 1
            j ← j - 1
        SINO SI c[i - 1, j] >= c[i, j - 1]:
            i ← i - 1
        SINO:
            j ← j - 1

    RETORNAR Invertir(resultado)
```
