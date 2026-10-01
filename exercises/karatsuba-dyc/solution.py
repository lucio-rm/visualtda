def karatsuba_multiply(x: int, y: int) -> int:
    """
    Multiplies two integers x and y in O(n^1.585) time using Karatsuba's algorithm.
    """
    if x < 10 or y < 10:
        return x * y

    n = max(len(str(x)), len(str(y)))
    m = n // 2

    power = 10 ** m
    x1, x0 = divmod(x, power)
    y1, y0 = divmod(y, power)

    z2 = karatsuba_multiply(x1, y1)
    z0 = karatsuba_multiply(x0, y0)
    z1 = karatsuba_multiply(x1 + x0, y1 + y0) - z2 - z0

    return (z2 * (10 ** (2 * m))) + (z1 * power) + z0


# Backward-compatible entry-point alias
multiplicar_karatsuba = karatsuba_multiply
