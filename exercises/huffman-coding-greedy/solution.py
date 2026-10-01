import heapq


def codificar_huffman(frequencies: dict[str, int]) -> dict[str, str]:
    """
    Construye los códigos binarios de Huffman libres de prefijo
    para un alfabeto de caracteres dado con sus frecuencias enteras.

    Complejidad Temporal: O(k log k) donde k es la cantidad de caracteres distintos.
    Complejidad Espacial: O(k) para el árbol binario y la tabla de códigos.

    Retorna un diccionario {caracter: codigo_binario}, por ejemplo {'A': '0', 'B': '10'}.
    """
    if not frequencies:
        return {}

    # Edge case: single character
    if len(frequencies) == 1:
        single = next(iter(frequencies))
        return {single: '0'}

    # Elements in min-heap: (frequency, insertion_order, char, left_child, right_child)
    heap = []
    counter = 0
    for char, freq in frequencies.items():
        heapq.heappush(heap, (freq, counter, char, None, None))
        counter += 1

    # Greedy loop: merge the two lowest-frequency nodes
    while len(heap) > 1:
        freq1, _, char1, left1, right1 = heapq.heappop(heap)
        freq2, _, char2, left2, right2 = heapq.heappop(heap)

        left_node = (freq1, char1, left1, right1)
        right_node = (freq2, char2, left2, right2)

        parent_node = (freq1 + freq2, counter, None, left_node, right_node)
        heapq.heappush(heap, parent_node)
        counter += 1

    root = heapq.heappop(heap)
    codes: dict[str, str] = {}

    def assign_codes(node, current_prefix: str) -> None:
        _, _, char, left, right = node if len(node) == 5 else (node[0], None, node[1], node[2], node[3])
        if char is not None:
            codes[char] = current_prefix
            return

        if left is not None:
            assign_codes(left, current_prefix + '0')
        if right is not None:
            assign_codes(right, current_prefix + '1')

    assign_codes(root, '')
    return codes


huffman_encoding = codificar_huffman

