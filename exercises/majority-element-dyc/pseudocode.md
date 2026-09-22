ALGORITMO ElementoMayoritario(A, izq, der):
  SI izq == der: RETORNAR A[izq]
  mid = (izq + der) / 2
  cand_izq = ElementoMayoritario(A, izq, mid)
  cand_der = ElementoMayoritario(A, mid + 1, der)
  SI cand_izq == cand_der: RETORNAR cand_izq
  Contar apariciones de cand_izq y cand_der en A[izq..der]
  SI conteo(cand_izq) > (der - izq + 1) / 2: RETORNAR cand_izq
  SI conteo(cand_der) > (der - izq + 1) / 2: RETORNAR cand_der
  RETORNAR None
