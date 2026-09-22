ALGORITMO TSP_BranchAndBound(Costos):
  mejor_costo = infinito
  FUNCION Explorar(u, visitados, costo_actual):
    SI len(visitados) == n:
      mejor_costo = min(mejor_costo, costo_actual + Costos[u, 0])
      RETORNAR
    cota = CostoActual + CotaMST(Restantes)
    SI cota >= mejor_costo: RETORNAR
    PARA cada v no visitado:
      Explorar(v, visitados + {v}, costo_actual + Costos[u, v])
