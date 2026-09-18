# Pseudocódigo: Antenas en una Ruta (Greedy)

```text
ALGORITMO ConstruirAntenas(casas, radio):
    Entrada: casas (lista de reales), radio (real > 0)
    Salida: antenas (lista de posiciones de antenas óptimas)

    casas_ordenadas ← OrdenarAscendente(casas)
    antenas ← []
    i ← 0
    n ← Longitud(casas_ordenadas)

    MIENTRAS i < n:
        // Tomar la primera casa aún sin cobertura
        casa_sin_cubrir ← casas_ordenadas[i]

        // Regla golosa: ubicar antena lo más adelante posible
        posicion ← casa_sin_cubrir + radio
        antenas.Agregar(posicion)

        // Límite de alcance hacia adelante de esta antena
        alcance_maximo ← posicion + radio

        // Avanzar el índice pasando todas las casas dentro del alcance
        MIENTRAS i < n Y casas_ordenadas[i] <= alcance_maximo:
            i ← i + 1

    RETORNAR antenas
```
