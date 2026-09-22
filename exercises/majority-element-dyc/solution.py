def elemento_mayoritario(arr: list[int]) -> int | None:
    """
    Encuentra el elemento mayoritario (> n/2 apariciones) en O(n log n).
    """
    def resolver(izq: int, der: int) -> int | None:
        if izq == der:
            return arr[izq]
            
        mid = (izq + der) // 2
        cand_izq = resolver(izq, mid)
        cand_der = resolver(mid + 1, der)
        
        if cand_izq == cand_der:
            return cand_izq
            
        conteo_izq = sum(1 for i in range(izq, der + 1) if arr[i] == cand_izq) if cand_izq is not None else 0
        conteo_der = sum(1 for i in range(izq, der + 1) if arr[i] == cand_der) if cand_der is not None else 0
        
        umbral = (der - izq + 1) // 2
        if conteo_izq > umbral:
            return cand_izq
        if conteo_der > umbral:
            return cand_der
        return None

    return resolver(0, len(arr) - 1)
