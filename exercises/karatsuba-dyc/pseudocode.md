ALGORITMO Karatsuba(x, y):
  SI x < 10 O y < 10: RETORNAR x * y
  m = ceil(n / 2)
  x1, x0 = x / 10^m, x mod 10^m
  y1, y0 = y / 10^m, y mod 10^m
  z2 = Karatsuba(x1, y1)
  z0 = Karatsuba(x0, y0)
  z1 = Karatsuba(x1 + x0, y1 + y0) - z2 - z0
  RETORNAR z2 * 10^(2m) + z1 * 10^m + z0
