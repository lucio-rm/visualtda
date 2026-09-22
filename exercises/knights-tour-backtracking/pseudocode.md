ALGORITMO RecorridoCaballo(N):
  Tablero = matriz N x N con -1
  FUNCION Backtrack(r, c, paso):
    Tablero[r, c] = paso
    SI paso == N*N - 1: RETORNAR True
    Vecinos = celdas validas accesibles desde (r, c)
    Ordenar Vecinos por GradoDeSalida ascendente (Warnsdorff)
    PARA cada (nr, nc) en Vecinos:
      SI Backtrack(nr, nc, paso + 1): RETORNAR True
    Tablero[r, c] = -1 (Backtrack)
    RETORNAR False
