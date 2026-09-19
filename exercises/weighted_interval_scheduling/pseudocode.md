# Pseudocódigo Formal: Planificación de Intervalos Ponderados

```text
ALGORITMO PlanificarIntervalosPonderados(intervalos):
    n ← Longitud(intervalos)
    SI n = 0:
        RETORNAR []

    // 1. Ordenar por tiempo de finalización creciente
    ordenados ← OrdenarPorTiempoDeFin(intervalos)

    // 2. Precalcular arreglo p[1...n] con Búsqueda Binaria
    p ← Arreglo(n + 1, 0)
    PARA j ← 1 HASTA n:
        inicio_j ← ordenados[j - 1].inicio
        p[j] ← BusquedaBinariaMayorFinMenorIgual(ordenados, inicio_j, j - 1)

    // 3. Llenar tabla de memoización OPT[0...n]
    opt ← Arreglo(n + 1, 0)
    PARA j ← 1 HASTA n:
        peso_j ← ordenados[j - 1].peso
        opt[j] ← Maximo(opt[j - 1], peso_j + opt[p[j]])

    // 4. Reconstruir solución hacia atrás
    seleccionados ← []
    curr ← n
    MIENTRAS curr > 0:
        peso_curr ← ordenados[curr - 1].peso
        SI peso_curr + opt[p[curr]] >= opt[curr - 1]:
            seleccionados.Agregar(ordenados[curr - 1])
            curr ← p[curr]
        SINO:
            curr ← curr - 1

    RETORNAR Invertir(seleccionados)
```
