ALGORITMO ResolverSudoku(Tablero):
  celda = CeldaConMenosOpciones(Tablero) (MRV)
  SI no hay celda vacia: RETORNAR True
  PARA num de 1 a 9:
    SI EsValido(Tablero, celda, num):
      Tablero[celda] = num
      SI ResolverSudoku(Tablero): RETORNAR True
      Tablero[celda] = 0 (Backtrack)
  RETORNAR False
