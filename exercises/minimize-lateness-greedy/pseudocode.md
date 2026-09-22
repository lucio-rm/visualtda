ALGORITMO MinimizarRetraso(Tareas):
  Ordenar Tareas por fecha limite: d1 <= d2 <= ... <= dn (EDF)
  tiempo_actual = 0
  retraso_max = 0
  PARA cada (t_i, d_i) en Tareas:
    tiempo_actual = tiempo_actual + t_i
    retraso = max(0, tiempo_actual - d_i)
    retraso_max = max(retraso_max, retraso)
  RETORNAR retraso_max
