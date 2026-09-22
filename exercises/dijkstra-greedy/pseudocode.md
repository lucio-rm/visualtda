ALGORITMO Dijkstra(G, origen):
  PARA cada v en V: dist[v] = infinito
  dist[origen] = 0
  Q = MinHeap([(0, origen)])
  MIENTRAS Q no vacia:
    (d_u, u) = Q.pop()
    SI d_u > dist[u]: CONTINUAR
    PARA cada (v, peso) en adyacentes[u]:
      SI dist[u] + peso < dist[v]:
        dist[v] = dist[u] + peso
        Q.push((dist[v], v))
  RETORNAR dist
