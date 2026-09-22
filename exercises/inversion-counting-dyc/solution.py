def contar_inversiones(arreglo: list[int]) -> int:
    """
    Cuenta el número total de inversiones en el arreglo dado:
    pares de índices (i, j) tales que i < j y arreglo[i] > arreglo[j].

    Complejidad Temporal: O(n log n) mediante División y Conquista (Merge Sort).
    Complejidad Espacial: O(n) para arreglos auxiliares de mezcla.

    Retorna la cantidad total de inversiones (entero >= 0).
    """
    def merge_and_count(izq: list[int], der: list[int]) -> tuple[int, list[int]]:
        i = 0
        j = 0
        inversiones_cruzadas = 0
        mezclado = []

        len_izq = len(izq)
        len_der = len(der)

        while i < len_izq and j < len_der:
            if izq[i] <= der[j]:
                mezclado.append(izq[i])
                i += 1
            else:
                # Si der[j] < izq[i], entonces der[j] es menor que TODOS los
                # elementos restantes en izq[i, ..., len_izq - 1]
                mezclado.append(der[j])
                inversiones_cruzadas += (len_izq - i)
                j += 1

        mezclado.extend(izq[i:])
        mezclado.extend(der[j:])
        return inversiones_cruzadas, mezclado

    def sort_and_count(arr: list[int]) -> tuple[int, list[int]]:
        if len(arr) <= 1:
            return 0, list(arr)

        medio = len(arr) // 2
        inv_izq, arr_izq = sort_and_count(arr[:medio])
        inv_der, arr_der = sort_and_count(arr[medio:])
        inv_cruzadas, arr_mezclado = merge_and_count(arr_izq, arr_der)

        total = inv_izq + inv_der + inv_cruzadas
        return total, arr_mezclado

    total_inversiones, _ = sort_and_count(arreglo)
    return total_inversiones
