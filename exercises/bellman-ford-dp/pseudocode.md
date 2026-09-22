ALGORITMO BellmanFord(V, Aristas, s):
  dist[v] = infinito para todo v; dist[s] = 0
  REPETIR |V| - 1 veces:
    PARA cada (u, v, peso) en Aristas:
      SI dist[u] + peso < dist[v]:
        dist[v] = dist[u] + peso
  PARA cada (u, v, peso) en Aristas:
    SI dist[u] + peso < dist[v]:
      RETORNAR dist, CICLO_NEGATIVO_DETECTADO
  RETORNAR dist, OK
