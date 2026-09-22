```python
def subarreglo_cruzado(A):
    m = len(A) // 2
    
    suma_parcial = 0
    suma_izq = -inf
    cruzado_izq = m - 1
    para i desde m - 1 hasta 0:
        suma_parcial += A[i]
        si suma_parcial > suma_izq:
            suma_izq = suma_parcial
            cruzado_izq = i
            
    suma_parcial = 0
    suma_der = -inf
    cruzado_der = m
    para j desde m hasta len(A) - 1:
        suma_parcial += A[j]
        si suma_parcial > suma_der:
            suma_der = suma_parcial
            cruzado_der = j
            
    retornar A[cruzado_izq : cruzado_der + 1]

def subarreglo_maxima_suma(A):
    si len(A) <= 1:
        retornar A
        
    m = len(A) // 2
    izq = subarreglo_maxima_suma(A[0 : m])
    der = subarreglo_maxima_suma(A[m : len(A)])
    cruzado = subarreglo_cruzado(A)
    
    retornar el de mayor suma entre (izq, der, cruzado)
```
