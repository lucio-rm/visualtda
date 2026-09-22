def multiplicar_karatsuba(x: int, y: int) -> int:
    """
    Multiplica dos enteros x e y en tiempo O(n^1.585) usando Karatsuba.
    """
    if x < 10 or y < 10:
        return x * y
        
    n = max(len(str(x)), len(str(y)))
    m = n // 2
    
    pot = 10 ** m
    x1, x0 = divmod(x, pot)
    y1, y0 = divmod(y, pot)
    
    z2 = multiplicar_karatsuba(x1, y1)
    z0 = multiplicar_karatsuba(x0, y0)
    z1 = multiplicar_karatsuba(x1 + x0, y1 + y0) - z2 - z0
    
    return (z2 * (10 ** (2 * m))) + (z1 * pot) + z0
