def k_esimo_elemento(arr: list[int], k: int) -> int:
    """
    Encuentra el k-esimo menor elemento (0-indexed) en tiempo lineal deterministico O(n).
    """
    if len(arr) <= 5:
        return sorted(arr)[k]
        
    sublistas = [arr[i:i+5] for i in range(0, len(arr), 5)]
    medianas = [sorted(sub)[len(sub)//2] for sub in sublistas]
    
    pivote = k_esimo_elemento(medianas, len(medianas) // 2)
    
    menores = [x for x in arr if x < pivote]
    iguales = [x for x in arr if x == pivote]
    mayores = [x for x in arr if x > pivote]
    
    if k < len(menores):
        return k_esimo_elemento(menores, k)
    elif k < len(menores) + len(iguales):
        return pivote
    else:
        return k_esimo_elemento(mayores, k - len(menores) - len(iguales))
