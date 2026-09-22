# Pseudocódigo Formal — Contar Inversiones

```text
ALGORITMO ContarInversiones(A):
    (totalInv, _) ← OrdenarYContar(A)
    RETORNAR totalInv

PROCEDIMIENTO OrdenarYContar(A):
    n ← Longitud(A)
    SI n <= 1:
        RETORNAR (0, A)

    medio ← ParteEntera(n / 2)
    (invIzq, izqOrdenado) ← OrdenarYContar(A[0 ... medio - 1])
    (invDer, derOrdenado) ← OrdenarYContar(A[medio ... n - 1])
    (invCruzadas, mezclado) ← IntercalarYContar(izqOrdenado, derOrdenado)

    total ← invIzq + invDer + invCruzadas
    RETORNAR (total, mezclado)

PROCEDIMIENTO IntercalarYContar(izq, der):
    i ← 0
    j ← 0
    invCruzadas ← 0
    mezclado ← []

    MIENTRAS i < Longitud(izq) Y j < Longitud(der):
        SI izq[i] <= der[j]:
            mezclado.Agregar(izq[i])
            i ← i + 1
        SINO:
            mezclado.Agregar(der[j])
            // Inversión detectada con todos los elementos pendientes en izq:
            invCruzadas ← invCruzadas + (Longitud(izq) - i)
            j ← j + 1

    MIENTRAS i < Longitud(izq):
        mezclado.Agregar(izq[i])
        i ← i + 1

    MIENTRAS j < Longitud(der):
        mezclado.Agregar(der[j])
        j ← j + 1

    RETORNAR (invCruzadas, mezclado)
```
