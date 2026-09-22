ALGORITMO MochilaBB(Capacidad, Pesos, Valores):
  Ordenar items por valor/peso decreciente
  mejor_valor = 0
  FUNCION Explorar(i, peso, valor):
    SI valor > mejor_valor Y peso <= Capacidad: mejor_valor = valor
    SI i == n: RETORNAR
    SI CotaRelajacionLineal(i, peso, valor) <= mejor_valor: RETORNAR
    Explorar(i+1, peso + w[i], valor + v[i])
    Explorar(i+1, peso, valor)
