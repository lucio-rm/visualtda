```python
ALGORITMO JuanElVago(ganancias):
    n ← longitud(ganancias)
    SI n == 0: RETORNAR (0, [])
    SI n == 1: RETORNAR (ganancias[0], [0])

    dp ← arreglo de tamaño n inicializado en 0
    dp[0] ← ganancias[0]
    dp[1] ← max(ganancias[0], ganancias[1])

    # Llenado de la tabla 1D
    PARA i DESDE 2 HASTA n - 1:
        dp[i] ← max(dp[i - 1], dp[i - 2] + ganancias[i])

    # Reconstrucción hacia atrás
    dias ← []
    i ← n - 1
    MIENTRAS i >= 0:
        SI i == 0:
            agregar 0 a dias; TERMINAR
        SINO SI i == 1:
            SI dp[1] == ganancias[1]: agregar 1 a dias
            SINO: agregar 0 a dias
            TERMINAR
        SINO:
            SI dp[i] == dp[i - 1]:
                i ← i - 1  # No trabajó el día i
            SINO:
                agregar i a dias  # Trabajó el día i
                i ← i - 2         # Salta el día i-1

    Invertir(dias)
    RETORNAR (dp[n - 1], dias)
```
