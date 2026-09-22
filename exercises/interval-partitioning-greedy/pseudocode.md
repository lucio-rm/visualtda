ALGORITMO ParticionIntervalos(Intervalos):
  Ordenar Intervalos por tiempo de inicio: s1 <= s2 <= ... <= sn
  Aulas = MinHeap()
  PARA cada (inicio, fin) en Intervalos:
    SI Aulas no vacio Y Aulas.top() <= inicio:
      Aulas.pop()
    Aulas.push(fin)
  RETORNAR len(Aulas)
