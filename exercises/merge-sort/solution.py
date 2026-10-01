"""
Algoritmo de Ordenamiento por Fusión (Merge Sort)
Técnica: División y Conquista (Divide & Conquer)

Complejidad Temporal: O(n log n) en todos los casos (peor, mejor y promedio)
Complejidad Espacial: O(n) memoria auxiliar para la combinación
Estable: Sí (preserva el orden relativo de elementos iguales)
"""

def merge_sort(arr: list[int]) -> list[int]:
    """
    Ordena una lista de enteros en orden ascendente utilizando Merge Sort.
    Retorna una nueva lista ordenada sin mutar la entrada original.
    """
    if len(arr) <= 1:
        return list(arr)

    # 1. DIVIDE: split array at mid
    mid = len(arr) // 2
    left_half = arr[:mid]
    right_half = arr[mid:]

    # 2. CONQUER: recursively sort halves
    left_sorted = merge_sort(left_half)
    right_sorted = merge_sort(right_half)

    # 3. COMBINE: merge two sorted lists in linear time
    return merge(left_sorted, right_sorted)


def merge(left: list[int], right: list[int]) -> list[int]:
    """
    Combines two previously sorted lists into a single sorted list.
    """
    result: list[int] = []
    i = 0
    j = 0

    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1

    if i < len(left):
        result.extend(left[i:])
    if j < len(right):
        result.extend(right[j:])

    return result

