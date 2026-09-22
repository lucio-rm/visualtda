ALGORITMO ParMasCercano(Puntos):
  Ordenar Puntos por coordenada X (Px) y por Y (Py)
  RECURSION(Px, Py):
    SI n <= 3: retornar distancia minima por fuerza bruta
    mid = n / 2
    delta_izq = RECURSION(Px_izq, Py_izq)
    delta_der = RECURSION(Px_der, Py_der)
    delta = min(delta_izq, delta_der)
    Franja = puntos en Py con |x - x_mid| < delta
    PARA i de 0 a len(Franja)-1:
      PARA j de i+1 a min(i+7, len(Franja)-1):
        delta = min(delta, dist(Franja[i], Franja[j]))
    RETORNAR delta
