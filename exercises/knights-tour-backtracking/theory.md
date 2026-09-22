## Recorrido del Caballo (Knight's Tour)
### Referencia: Kleinberg & Tardos Capítulo 8 / Euler / Warnsdorff

### 1. La Heurística de Warnsdorff
El factor de ramificación puede ser hasta 8 por celda. La heurística greedy de Warnsdorff ordena los movimientos candidatos según el número de casillas no visitadas a las que dicho movimiento puede acceder, eligiendo la que tiene menor grado de salida para evitar dejar esquinas aisladas.
