# Pseudocódigo Formal: Búsqueda de Pico en 1D

```text
ALGORITMO BuscarPico(A):
    SI Longitud(A) = 0:
        RETORNAR -1

    inicio ← 0
    fin ← Longitud(A) - 1

    MIENTRAS inicio <= fin:
        medio ← (inicio + fin) DIV 2

        // Verificar si la pendiente sube hacia la izquierda
        SI medio > 0 Y A[medio] < A[medio - 1]:
            fin ← medio - 1

        // Verificar si la pendiente sube hacia la derecha
        SINO SI medio < Longitud(A) - 1 Y A[medio] < A[medio + 1]:
            inicio ← medio + 1

        // Si ninguna pendiente sube, estamos en una cresta o meseta
        SINO:
            RETORNAR medio

    RETORNAR inicio
```
