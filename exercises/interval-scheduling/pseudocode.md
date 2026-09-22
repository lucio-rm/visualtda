# Selección de Intervalos (Pseudocódigo)

```text
ALGORITMO SeleccionIntervalos(I):
    // I es una lista de intervalos, cada uno con inicio s_i y fin f_i
    
    // 1. Ordenar intervalos por tiempo de fin creciente
    I_ordenados ← OrdenarPorFinCreciente(I)
    
    S ← ListaVacia()
    ultimoFin ← -Infinito
    
    // 2. Selección greedy
    PARA CADA intervalo (s_i, f_i) EN I_ordenados HACER:
        SI s_i >= ultimoFin ENTONCES:
            S.Agregar((s_i, f_i))
            ultimoFin ← f_i
            
    RETORNAR S
```
