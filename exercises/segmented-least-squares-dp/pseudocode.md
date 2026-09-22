ALGORITMO MinimosCuadradosSegmentados(Puntos, C):
  Precomputar e[i, j] error cuadratico de p_i a p_j
  OPT[0] = 0
  PARA j de 1 a n:
    OPT[j] = min_{1 <= i <= j} (e[i, j] + C + OPT[i-1])
  RETORNAR OPT[n]
