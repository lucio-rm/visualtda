ALGORITMO MergeSort(A, p, r):
    // Ordena el subarreglo A[p..r]
    SI p < r:
        // 1. Dividir
        q ← ⌊(p + r) / 2⌋

        // 2. Conquistar recursivamente
        MergeSort(A, p, q)
        MergeSort(A, q + 1, r)

        // 3. Combinar
        Merge(A, p, q, r)

PROCEDIMIENTO Merge(A, p, q, r):
    n1 ← q - p + 1
    n2 ← r - q
    Crear arreglos L[1..n1 + 1] y R[1..n2 + 1]

    PARA i ← 1 HASTA n1:
        L[i] ← A[p + i - 1]
    PARA j ← 1 HASTA n2:
        R[j] ← A[q + j]

    L[n1 + 1] ← +∞  // Centinela
    R[n2 + 1] ← +∞  // Centinela

    i ← 1
    j ← 1
    PARA k ← p HASTA r:
        SI L[i] <= R[j]:
            A[k] ← L[i]
            i ← i + 1
        SINO:
            A[k] ← R[j]
            j ← j + 1
