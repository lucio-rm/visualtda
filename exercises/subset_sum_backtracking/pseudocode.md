# Pseudocódigo: Suma de Subconjuntos con Podas

```text
ALGORITMO SubconjuntosQueSuman(numeros, objetivo):
    Entrada: numeros (lista de enteros > 0), objetivo (entero > 0)
    Salida: soluciones (lista de subconjuntos que suman exactamente objetivo)

    elementos ← OrdenarDecreciente([x EN numeros SI x <= objetivo])
    soluciones ← []
    subconjunto_actual ← []
    remanente_total ← Suma(elementos)

    PROCEDIMIENTO Backtrack(indice, suma_actual, remanente):
        // Caso Base de Éxito
        SI suma_actual = objetivo:
            soluciones.Agregar(Copia(subconjunto_actual))
            RETORNAR

        // Fin de los elementos
        SI indice >= Longitud(elementos):
            RETORNAR

        elem ← elementos[indice]
        nuevo_remanente ← remanente - elem

        // OPCIÓN 1: Incluir elem (con Poda por Exceso)
        SI suma_actual + elem <= objetivo:
            subconjunto_actual.Agregar(elem)
            Backtrack(indice + 1, suma_actual + elem, nuevo_remanente)
            subconjunto_actual.QuitarUltimo()  // Deshacer

        // OPCIÓN 2: Excluir elem (con Poda por Déficit)
        SI suma_actual + nuevo_remanente >= objetivo:
            Backtrack(indice + 1, suma_actual, nuevo_remanente)

    Backtrack(0, 0, remanente_total)
    RETORNAR soluciones
```
