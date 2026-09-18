```python
ALGORITMO MonedaEquilibrada(MonedaCargada):
    // MonedaCargada devuelve 1 con prob p y 0 con prob 1 - p
    MIENTRAS Verdadero:
        t1 ← MonedaCargada()
        t2 ← MonedaCargada()

        SI t1 == 0 Y t2 == 1:
            RETORNAR 0
        SINO SI t1 == 1 Y t2 == 0:
            RETORNAR 1
        // Si t1 == t2 ((0,0) o (1,1)), descartar y repetir
```
