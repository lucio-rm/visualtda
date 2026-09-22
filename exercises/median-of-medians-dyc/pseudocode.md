ALGORITMO SeleccionMediana(A, k):
  SI len(A) <= 5: RETORNAR Ordenar(A)[k]
  Grupos = dividir A en bloques de 5
  Medianas = [mediana(G) para G en Grupos]
  Pivote = SeleccionMediana(Medianas, len(Medianas)/2)
  Menores = [x en A si x < Pivote]
  Iguales = [x en A si x == Pivote]
  Mayores = [x en A si x > Pivote]
  SI k < len(Menores): RETORNAR SeleccionMediana(Menores, k)
  SINO SI k < len(Menores) + len(Iguales): RETORNAR Pivote
  SINO: RETORNAR SeleccionMediana(Mayores, k - len(Menores) - len(Iguales))
