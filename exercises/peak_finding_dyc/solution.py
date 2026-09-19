def buscar_pico(arreglo: list[int]) -> int:
    """
    Dado un arreglo de n enteros no ordenados, encuentra el índice de un pico.
    Un elemento arreglo[i] es un pico si es mayor o igual a sus vecinos adyacentes:
      - Si i > 0: arreglo[i] >= arreglo[i - 1]
      - Si i < len(arreglo) - 1: arreglo[i] >= arreglo[i + 1]

    Complejidad Temporal: O(log n) mediante División y Conquista.
    Complejidad Espacial: O(1) iterativo (o O(log n) recursivo por stack de llamadas).

    Retorna el índice i donde se encuentra el pico.
    Si el arreglo está vacío, retorna -1.
    """
    if not arreglo:
        return -1

    inicio = 0
    fin = len(arreglo) - 1

    while inicio <= fin:
        medio = (inicio + fin) // 2

        # Si el vecino izquierdo es estrictamente mayor, hay garantía de pico a la izquierda
        if medio > 0 and arreglo[medio] < arreglo[medio - 1]:
            fin = medio - 1
        # Si el vecino derecho es estrictamente mayor, hay garantía de pico a la derecha
        elif medio < len(arreglo) - 1 and arreglo[medio] < arreglo[medio + 1]:
            inicio = medio + 1
        else:
            # arreglo[medio] >= arreglo[medio-1] y arreglo[medio] >= arreglo[medio+1]
            return medio

    return inicio
