"""
Algoritmo de Ordenamiento por Fusión (Merge Sort)
Técnica: División y Conquista (Divide & Conquer)

Complejidad Temporal: O(n log n) en todos los casos (peor, mejor y promedio)
Complejidad Espacial: O(n) memoria auxiliar para la combinación
Estable: Sí (preserva el orden relativo de elementos iguales)
"""

def merge_sort(arreglo: list[int]) -> list[int]:
    """
    Ordena una lista de enteros en orden ascendente utilizando Merge Sort.
    Retorna una nueva lista ordenada sin mutar la entrada original.
    """
    if len(arreglo) <= 1:
        return list(arreglo)

    # 1. DIVIDIR: calcular el punto medio
    medio = len(arreglo) // 2
    mitad_izquierda = arreglo[:medio]
    mitad_derecha = arreglo[medio:]

    # 2. CONQUISTAR: resolver recursivamente ambas mitades
    izq_ordenada = merge_sort(mitad_izquierda)
    der_ordenada = merge_sort(mitad_derecha)

    # 3. COMBINAR (MERGE): intercalar dos listas ordenadas en tiempo lineal
    return merge(izq_ordenada, der_ordenada)


def merge(izq: list[int], der: list[int]) -> list[int]:
    """
    Combina dos listas previamente ordenadas en una única lista ordenada.
    Invariante: en cada iteración, el elemento menor de las cabezas no consumidas
    es transferido al final del resultado, garantizando monotonicidad.
    """
    resultado: list[int] = []
    i = 0
    j = 0

    while i < len(izq) and j < len(der):
        # La comparación <= garantiza la estabilidad del algoritmo
        if izq[i] <= der[j]:
            resultado.append(izq[i])
            i += 1
        else:
            resultado.append(der[j])
            j += 1

    # Agregar elementos restantes
    if i < len(izq):
        resultado.extend(izq[i:])
    if j < len(der):
        resultado.extend(der[j:])

    return resultado


if __name__ == "__main__":
    lista_prueba = [38, 27, 43, 3, 9, 82, 10]
    esperado = sorted(lista_prueba)
    obtenido = merge_sort(lista_prueba)

    print("Entrada original:", lista_prueba)
    print("Salida ordenada :", obtenido)
    assert obtenido == esperado, f"Esperado {esperado}, pero obtuvo {obtenido}"

    # Pruebas con duplicados y listas vacías
    assert merge_sort([]) == []
    assert merge_sort([5]) == [5]
    assert merge_sort([5, 1, 5, 2]) == [1, 2, 5, 5]
    print("Todas las pruebas canónicas de Merge Sort pasaron con éxito.")
