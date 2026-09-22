def subsecuencia_comun_mas_larga(s1: str, s2: str) -> str:
    """
    Dadas dos cadenas s1 y s2, encuentra la subsecuencia común más larga (LCS).
    Una subsecuencia se obtiene eliminando cero o más caracteres sin alterar el orden relativo.

    Complejidad Temporal: O(m * n) donde m = len(s1), n = len(s2).
    Complejidad Espacial: O(m * n) para la matriz 2D de programación dinámica.

    Retorna la cadena de caracteres que forma la subsecuencia común óptima.
    Si no comparten caracteres o alguna es vacía, retorna "".
    """
    m = len(s1)
    n = len(s2)

    if m == 0 or n == 0:
        return ""

    dp = [[0] * (n + 1) for _ in range(m + 1)]

    # Llenado de la matriz bottom-up
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    # Reconstrucción del camino óptimo
    resultado = []
    i = m
    j = n
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            resultado.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1

    resultado.reverse()
    return "".join(resultado)
