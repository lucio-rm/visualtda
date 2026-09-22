ALGORITMO CicloHamiltoniano(G, n):
  camino = [0]
  visitados = {0}
  FUNCION Backtrack(u):
    SI len(camino) == n: RETORNAR (0 en vecinos[u])
    PARA cada v en vecinos[u]:
      SI v no en visitados:
        visitados.add(v); camino.append(v)
        SI Backtrack(v): RETORNAR True
        camino.pop(); visitados.remove(v)
    RETORNAR False
