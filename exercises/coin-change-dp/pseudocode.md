# Pseudocódigo: Cambio de Monedas (Programación Dinámica)

```text
ALGORITMO CambioMinimoMonedas(monedas, objetivo):
    Entrada: monedas (lista de enteros > 0), objetivo (entero >= 0)
    Salida: cambio (lista de monedas que suman objetivo con cantidad mínima)

    SI objetivo = 0:
        RETORNAR []

    dp ← Arreglo de tamaño (objetivo + 1) inicializado en ∞
    eleccion ← Arreglo de tamaño (objetivo + 1) inicializado en -1

    dp[0] ← 0  // Caso base: 0 monedas para valor 0

    PARA v DESDE 1 HASTA objetivo:
        PARA CADA c EN monedas:
            SI c <= v:
                costo ← dp[v - c] + 1
                SI costo < dp[v]:
                    dp[v] ← costo
                    eleccion[v] ← c

    SI dp[objetivo] = ∞:
        RETORNAR []  // No es posible formar el monto

    // Reconstrucción de la solución óptima
    cambio ← []
    actual ← objetivo
    MIENTRAS actual > 0:
        moneda ← eleccion[actual]
        cambio.Agregar(moneda)
        actual ← actual - moneda

    RETORNAR cambio
```
