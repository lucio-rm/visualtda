import heapq

def codificar_huffman(frecuencias: dict[str, int]) -> dict[str, str]:
    """
    Construye los códigos binarios de Huffman libres de prefijo
    para un alfabeto de caracteres dado con sus frecuencias enteras.

    Complejidad Temporal: O(k log k) donde k es la cantidad de caracteres distintos.
    Complejidad Espacial: O(k) para el árbol binario y la tabla de códigos.

    Retorna un diccionario {caracter: codigo_binario}, por ejemplo {'A': '0', 'B': '10'}.
    """
    if not frecuencias:
        return {}

    # Caso borde: un único carácter
    if len(frecuencias) == 1:
        unico = next(iter(frecuencias))
        return {unico: '0'}

    # Elementos en el min-heap: (frecuencia, orden_insercion, caracter, hijo_izq, hijo_der)
    heap = []
    contador = 0
    for char, freq in frecuencias.items():
        heapq.heappush(heap, (freq, contador, char, None, None))
        contador += 1

    # Bucle voraz (Greedy): fusionar los dos nodos de menor frecuencia
    while len(heap) > 1:
        freq1, _, char1, izq1, der1 = heapq.heappop(heap)
        freq2, _, char2, izq2, der2 = heapq.heappop(heap)

        nodo_izq = (freq1, char1, izq1, der1)
        nodo_der = (freq2, char2, izq2, der2)

        nodo_padre = (freq1 + freq2, contador, None, nodo_izq, nodo_der)
        heapq.heappush(heap, nodo_padre)
        contador += 1

    # Recorrer el árbol desde la raíz para generar los códigos binarios
    raiz = heapq.heappop(heap)
    codigos: dict[str, str] = {}

    def asignar_codigos(nodo, prefijo_actual: str):
        _, _, char, izq, der = nodo if len(nodo) == 5 else (nodo[0], None, nodo[1], nodo[2], nodo[3])
        if char is not None:
            codigos[char] = prefijo_actual
            return

        if izq is not None:
            asignar_codigos(izq, prefijo_actual + '0')
        if der is not None:
            asignar_codigos(der, prefijo_actual + '1')

    asignar_codigos(raiz, '')
    return codigos
