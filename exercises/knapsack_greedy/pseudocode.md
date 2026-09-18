ALGORITMO MochilaFraccionaria_Greedy(items, W):
    // items: arreglo de tamaño n con .peso y .valor
    // W: capacidad máxima de la mochila

    // 1. Calcular densidades y ordenar
    PARA CADA item EN items:
        item.densidad ← item.valor / item.peso

    items_ordenados ← OrdenarPorDensidadDecreciente(items)

    valor_total ← 0.0
    capacidad_restante ← W
    asignaciones ← []

    // 2. Selección Voraz
    PARA CADA item EN items_ordenados:
        SI capacidad_restante <= 0:
            ROMPER

        SI item.peso <= capacidad_restante:
            // Tomar elemento completo
            asignaciones.Agregar(item, fraccion = 1.0)
            valor_total ← valor_total + item.valor
            capacidad_restante ← capacidad_restante - item.peso
        SINO:
            // Tomar fracción que agota la capacidad
            fraccion ← capacidad_restante / item.peso
            asignaciones.Agregar(item, fraccion = fraccion)
            valor_total ← valor_total + (item.valor * fraccion)
            capacidad_restante ← 0

    RETORNAR (valor_total, asignaciones)
