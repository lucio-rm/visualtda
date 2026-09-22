# Algoritmo de N-Reinas (Pseudocódigo)

```text
ALGORITMO ResolverNReinas(n):
    soluciones ← ListaVacia()
    tablero ← ArregloDeTamaño(n, inicializado con -1)
    
    columnasOcupadas ← ConjuntoVacio()
    diagonalesPrincipales ← ConjuntoVacio()  // fila - columna
    diagonalesSecundarias ← ConjuntoVacio()  // fila + columna

    PROCEDIMIENTO Backtrack(fila):
        // Caso Base: Si todas las filas tienen una reina válida
        SI fila = n ENTONCES:
            soluciones.Agregar(CopiaDe(tablero))
            RETORNAR

        // Explorar cada columna candidata en la fila actual
        PARA col DESDE 0 HASTA n - 1 HACER:
            diagPrin ← fila - col
            diagSec ← fila + col

            // PODA: Verificar si la posición entra en conflicto
            SI col EN columnasOcupadas O
               diagPrin EN diagonalesPrincipales O
               diagSec EN diagonalesSecundarias ENTONCES:
                CONTINUAR  // Podar rama inviable

            // 1. Tomar decisión
            tablero[fila] ← col
            columnasOcupadas.Agregar(col)
            diagonalesPrincipales.Agregar(diagPrin)
            diagonalesSecundarias.Agregar(diagSec)

            // 2. Llamada recursiva hacia el siguiente nivel
            Backtrack(fila + 1)

            // 3. Deshacer decisión (Backtracking)
            tablero[fila] ← -1
            columnasOcupadas.Eliminar(col)
            diagonalesPrincipales.Eliminar(diagPrin)
            diagonalesSecundarias.Eliminar(diagSec)

    Backtrack(0)
    RETORNAR soluciones
```
