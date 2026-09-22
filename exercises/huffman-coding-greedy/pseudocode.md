# Pseudocódigo Formal — Codificación de Huffman

```text
ALGORITMO CodificarHuffman(frecuencias):
    SI Longitud(frecuencias) = 0:
        RETORNAR DiccionarioVacio()

    SI Longitud(frecuencias) = 1:
        c ← PrimerCaracter(frecuencias)
        RETORNAR { c: "0" }

    Q ← MinHeapVacio()

    // 1. Insertar nodos hojas en la cola de prioridad
    PARA CADA (caracter, freq) EN frecuencias:
        nodo ← CrearNodo(caracter, freq, izq = NULO, der = NULO)
        Q.Insertar(prioridad = freq, valor = nodo)

    // 2. Proceso Greedy (Greedy): fusionar los dos menores
    MIENTRAS Q.Tamaño() > 1:
        izq ← Q.ExtraerMinimo()
        der ← Q.ExtraerMinimo()
        padre ← CrearNodo(
            caracter = NULO,
            freq = izq.freq + der.freq,
            izq = izq,
            der = der
        )
        Q.Insertar(prioridad = padre.freq, valor = padre)

    // 3. Generar tabla de códigos binarios mediante DFS
    raiz ← Q.ExtraerMinimo()
    codigos ← DiccionarioVacio()

    PROCEDIMIENTO AsignarCodigos(nodo, prefijo):
        SI nodo.caracter != NULO:
            codigos[nodo.caracter] ← prefijo
            RETORNAR

        SI nodo.izq != NULO:
            AsignarCodigos(nodo.izq, prefijo + "0")

        SI nodo.der != NULO:
            AsignarCodigos(nodo.der, prefijo + "1")

    AsignarCodigos(raiz, "")
    RETORNAR codigos
```
