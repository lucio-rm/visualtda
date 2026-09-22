ALGORITMO Kruskal(V, Aristas):
  Ordenar Aristas por peso creciente
  UF = UnionFind(len(V))
  MST = []
  costo_total = 0
  PARA cada (u, v, peso) en Aristas:
    SI UF.find(u) != UF.find(v):
      UF.union(u, v)
      MST.append((u, v, peso))
      costo_total = costo_total + peso
  RETORNAR costo_total, MST
