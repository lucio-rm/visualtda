ALGORITMO Mochila01_DP(items, W):
    // items: arreglo de tamaño n con atributos .peso y .valor
    // W: capacidad máxima de la mochila
    n ← Longitud(items)
    Crear tabla DP de tamaño (n + 1) × (W + 1) inicializada en 0

    PARA i DESDE 1 HASTA n:
        peso_i ← items[i - 1].peso
        valor_i ← items[i - 1].valor

        PARA w DESDE 0 HASTA W:
            SI peso_i > w:
                DP[i][w] ← DP[i - 1][w]
            SINO:
                excluir ← DP[i - 1][w]
                incluir ← DP[i - 1][w - peso_i] + valor_i
                DP[i][w] ← MAX(excluir, incluir)

    // Reconstrucción de la solución óptima
    seleccionados ← []
    capacidad_restante ← W
    PARA i DESDE n BAJANDO HASTA 1:
        SI DP[i][capacidad_restante] ≠ DP[i - 1][capacidad_restante]:
            seleccionados.Agregar(items[i - 1])
            capacidad_restante ← capacidad_restante - items[i - 1].peso

    Invertir(seleccionados)
    RETORNAR (DP[n][W], seleccionados)
