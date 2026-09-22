ALGORITMO EdmondsKarp(G, s, t):
    // G = (V, E, c): red con capacidades c(u, v)
    // s: nodo fuente, t: nodo sumidero
    flujo_total ← 0
    Inicializar f(u, v) ← 0 para toda arista en E
    Inicializar red residual G_f con c_f(u, v) = c(u, v) y c_f(v, u) = 0

    MIENTRAS exista un camino simple P desde s hasta t en G_f:
        // Seleccionar P con el menor número de aristas usando BFS
        P ← BFS_CaminoMasCorto(G_f, s, t)
        SI P es nulo:
            ROMPER

        // Calcular capacidad del cuello de botella
        Δ ← MIN{ c_f(u, v) : (u, v) ∈ P }
        flujo_total ← flujo_total + Δ

        // Actualizar capacidades residuales a lo largo de P
        PARA CADA arista (u, v) EN P:
            c_f(u, v) ← c_f(u, v) - Δ
            c_f(v, u) ← c_f(v, u) + Δ

    // Corte Mínimo (A*, B*)
    A* ← { v ∈ V : v es alcanzable desde s en G_f final }
    B* ← V \ A*

    RETORNAR (flujo_total, G_f, A*, B*)
