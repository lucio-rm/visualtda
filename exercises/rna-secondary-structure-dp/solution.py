def estructura_secundaria_arn(secuencia: str) -> int:
    """
    secuencia: cadena de bases {A, U, C, G}.
    Retorna la cantidad maxima de pares de bases no cruzados.
    """
    n = len(secuencia)
    if n < 5:
        return 0
    pares_validos = {('A', 'U'), ('U', 'A'), ('C', 'G'), ('G', 'C')}
    dp = [[0] * n for _ in range(n)]

    for longitud in range(5, n + 1):
        for i in range(n - longitud + 1):
            j = i + longitud - 1
            max_p = dp[i][j-1]
            for t in range(i, j - 4):
                if (secuencia[t], secuencia[j]) in pares_validos:
                    izq = dp[i][t-1] if t > i else 0
                    centro = dp[t+1][j-1]
                    max_p = max(max_p, 1 + izq + centro)
            dp[i][j] = max_p

    return dp[0][n-1]
