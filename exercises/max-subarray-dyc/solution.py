"""
Subarreglo de Máxima Suma mediante División y Conquista
Referencia de Cátedra: Algoritmos RW / FIUBA & CLRS Chapter 4.
"""

from typing import List, Tuple

def subarreglo_cruzado(arr: List[int]) -> List[int]:
    """
    Encuentra el subarreglo contiguo de máxima suma que cruza el punto medio.
    
    Complejidad: O(n) tiempo, O(1) espacio adicional.
    """
    if not arr:
        return []
        
    med = len(arr) // 2

    # Exploración hacia la izquierda desde med - 1 hasta 0
    suma_parcial = 0
    cruzado_izq = med - 1 if med > 0 else 0
    suma_izq = -float('inf')
    for i in range(med - 1, -1, -1):
        suma_parcial += arr[i]
        if suma_parcial > suma_izq:
            suma_izq = suma_parcial
            cruzado_izq = i

    # Exploración hacia la derecha desde med hasta len(arr) - 1
    suma_parcial = 0
    cruzado_der = med
    suma_der = -float('inf')
    for j in range(med, len(arr)):
        suma_parcial += arr[j]
        if suma_parcial > suma_der:
            suma_der = suma_parcial
            cruzado_der = j

    return arr[cruzado_izq : cruzado_der + 1]


def subarreglo_maxima_suma(arr: List[int]) -> List[int]:
    """
    Encuentra el subarreglo contiguo con suma máxima usando División y Conquista.
    
    Recurrencia: T(n) = 2T(n/2) + O(n)
    Por Teorema Maestro: a=2, b=2, c=1 => log2(2) = 1 = c => O(n log n).
    """
    if not arr:
        return []
    if len(arr) == 1:
        return arr

    med = len(arr) // 2

    izq = subarreglo_maxima_suma(arr[:med])
    der = subarreglo_maxima_suma(arr[med:])
    cruzado = subarreglo_cruzado(arr)

    sum_izq = sum(izq) if izq else -float('inf')
    sum_der = sum(der) if der else -float('inf')
    sum_cruzado = sum(cruzado) if cruzado else -float('inf')

    suma_maxima = max(sum_izq, sum_der, sum_cruzado)

    if suma_maxima == sum_izq:
        return izq
    elif suma_maxima == sum_der:
        return der
    else:
        return cruzado


def kadane(arr: List[int]) -> Tuple[int, int, int]:
    """
    Algoritmo de Kadane (Programación Dinámica / Greedy) en O(n).
    Retorna (suma_maxima, inicio, fin) inclusivo.
    """
    if not arr:
        return 0, 0, 0
    
    max_hasta_aqui = arr[0]
    max_global = arr[0]
    inicio = fin = temp_inicio = 0
    
    for i in range(1, len(arr)):
        if arr[i] > max_hasta_aqui + arr[i]:
            max_hasta_aqui = arr[i]
            temp_inicio = i
        else:
            max_hasta_aqui += arr[i]
            
        if max_hasta_aqui > max_global:
            max_global = max_hasta_aqui
            inicio = temp_inicio
            fin = i
            
    return max_global, inicio, fin


if __name__ == "__main__":
    test_cases = [
        ([5, 3, 2, 4, -1], [5, 3, 2, 4]),
        ([5, 3, -5, 4, -1], [5, 3]),
        ([5, -4, 2, 4, -1], [5, -4, 2, 4]),
        ([5, -4, 2, 4], [5, -4, 2, 4]),
        ([-5, -2, -8], [-2]),
    ]
    for inp, expected in test_cases:
        res = subarreglo_maxima_suma(inp)
        print(f"Input: {inp} -> Result: {res} (Sum: {sum(res)})")
        assert sum(res) == sum(expected), f"Failed on {inp}: got {res}, expected {expected}"
    print("All Python test cases passed successfully!")
