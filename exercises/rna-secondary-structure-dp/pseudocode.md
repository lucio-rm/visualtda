ALGORITMO EstructuraARN(secuencia):
  dp[i, j] = 0 para todo i, j
  PARA len de 5 a n:
    PARA i de 0 a n - len:
      j = i + len - 1
      dp[i, j] = dp[i, j-1]
      PARA t de i a j - 5:
        SI (secuencia[t], secuencia[j]) son par valido:
          dp[i, j] = max(dp[i, j], 1 + dp[i, t-1] + dp[t+1, j-1])
  RETORNAR dp[0, n-1]
