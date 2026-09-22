Ojo con dejarme solo y tener que crear un nuevo chat e, porque recien me puso un aviso que vos te iba s a quedar sin memoria si seguía escirbiendo en este chat y tenia que escribir en uno nuevo. vos decime si tengo/conviene que lo haga e. no me dejes tirado asi nomas y haciendote el recontrarepelotudo.







Bueno, como que el antigravity hizo una banda, seguramente en estructuras ejercicios que tal vez no hacia falta o no quería pero importa. la idea es que se haga bien los tests, etc.



En un momento paró. no sé por qué, sin que yo le diga STOP. idk.

pero bueno. tu misión de que no falle el ciclo no cumplió, entonces le dije "che , yo nunca te dije STOP asi que no pares." y ahí volvió a hacer algo de maxFlow o algo asi. no se.



pero bueno por ahora viene bien la cosa, me gustó esto de que haya hecho mucho. asi que ahora tu misión es esta:





audita absolutamente TODO lo que hizo. o sino decime Cómo hacerlo, para chequear que esté todo bien. la idea del proyecto.md era importante, la idea de todo lo que queríamos hacer que se esté cumpliendo y en cuánto pronosticas si seguimos así, terminar absolutamente todo.

te voy a pasar los ejercicios que quiero que tenga para cada tema. no agarres TODOS, sino los mas IMPORTANTES. más que nada los que también aparecen en el libro de Algorithm Design de Tardos y Kleinberg.



(no se si te van a aparecer los que muestran imagenes (son pocos), pero tal vez si te aparecen las estrellas. asi que enfocate por ahí). los ejercicios especificos, o no "tan comunes", dejalos. osea la idea es que practiquen los ejercicios FUNDAMENTALES para entender el tema. que si hacen esos bien y pasan los tests, significa que estan entendiendo bien la movida.

La idea tambien es para que entiendas la movida de por dónde quiero trabajar y cómo. y por qué lo habia separado por temas cada ejercicio.



Respondeme con el prompt/direccion/instruccion de lo que le tengo que mandar a antigravity. y Ademas, quiero que leas absolutamente todo lo que hizo, mas ese informe que supuestamente hace.



# División y Conquista

## Contenidos

1. [Ejercicio resuelto](https://algoritmos-rw.github.io/tda_bg/material/guias/dyc/#ejercicio-resuelto)
2. [Ejercicios propuestos](https://algoritmos-rw.github.io/tda_bg/material/guias/dyc/#ejercicios-propuestos)

## Ejercicio resuelto

### Enunciado

Dado un arreglo de n enteros (no olvidar que pueden haber números negativos), encontrar el subarreglo contiguo de máxima suma, utilizando División y Conquista. Indicar y justificar la complejidad del algoritmo. Ejemplos:

```
    [5, 3, 2, 4, -1] →  [5, 3, 2, 4]
    [5, 3, -5, 4, -1] →  [5, 3]
    [5, -4, 2, 4, -1] → [5, -4, 2, 4]
    [5, -4, 2, 4] → [5, -4, 2, 4]

```

#### Consideraciones Iniciales

En primer lugar, conviene analizar cuál es la forma que tienen las posibles respuestas al enunciado. Se tratan en este caso de partes del arreglo completo de mayor o menor longitud. Solo se pueden seleccionar elementos contiguos, por lo que los subarreglos posibles serían:

- El primer elemento solo
- El primero y el segundo
  - Y así hasta el último siendo `n` subarreglos que empiezan con el primero
- El segundo solo
- El segundo y el tercero
  - Y así hasta el último siendo `n−1` subarreglos que empiezan con el segundo
- Y así siguiendo con los n elementos

La cantidad total de soluciones posibles sería entonces `n+(n−1)+⋯+1` , lo cual se puede escribir como:

```math
∑i=1ni=n(n+1)2
```

La demostración formal no va al caso, pero se puede recordar [aquí](https://www.youtube.com/watch?v=tpkzn2e5mtI\&ab_channel=MathEasySolutions). Si quisiéramos obtener la mejor solución simplemente comparando cada solución posible, la complejidad temporal del algoritmo sería `O(n²)`.

Cabe destacar también que el algoritmo debe permitir el uso de números negativos. De lo contrario, el subarreglo de máxima suma siempre sería el arreglo completo. Si todos son positivos, nada va a sumar más que todos los elementos del arreglo.

#### Caso Base

Ahora bien, si el arreglo tiene un solo elemento, la solución es simplemente usar ese elemento sea cual sea su valor. Cuando son dos, puede convenir más usar solo el primero (`[1,-1]`), solo el segundo (`[-1,1]`) o ambos (`[1,1]`) dependiendo del caso. Si son más de dos elementos, se va complicando todo.

#### División y Conquista

Utilizando el caso base de un elemento, podemos dividir el arreglo por la mitad hasta obtener el caso en que tenemos que comparar dos subarreglos de largo 1.

Pero además de eso, debemos revisar cómo se comparan los arreglos generados por la recursión en cada llamada. Tenemos los elementos del lado izquierdo y del lado derecho de la llamada. Podríamos comparar el subarreglo candidato de cada lado y devolver el que sume más.

Sin embargo esto no es suficiente. En cada llamada, existen subarreglos candidatos que se pueden formar con los elementos del lado izquierdo y derecho, siempre y cuando sean contiguos.

Para aclarar esto, supongamos que en una llamada recursiva tenemos `[1,2]` en el arreglo derecho y `[3,-5]` en el lado izquierdo. El mejor subarreglo del lado izquierdo es `[1,2]` y el mejor del lado derecho es `[3]`. Pero para el arreglo combinado (`[1,2,3,-5]`) el mejor subarreglo es `[1,2,3]`.

Eso significa que en cada caso recursivo la mejor solución puede usar solo elementos del lado izquierdo, solo elementos del lado derecho o una combinación de elementos de ambos.

Es una situación similar al ejercicio de puntos más cercanos donde tenemos dos alternativas por la recursión pero hay que tener en cuenta que pasa al medio para asegurar la mejor decisión

#### Máximo Subarreglo Cruzado

Entonces, dada una llamada recursiva con el mejor candidato del lado izquierdo y derecho, necesitamos obtener el mejor candidato que use elementos de los arreglos a ambos lados de la recursión y que además sea contiguo. A este subarreglo candidato se lo suele llamar subarreglo cruzado. Solo basta con obtener el subarreglo cruzado que sume más.

Para obtener el máximo subarreglo cruzado, podemos aprovecharnos de que tiene que ser contiguo y hacer lo siguiente.

Primero iteraremos el arreglo del lado izquierdo desde su índice mayor hasta el menor. La idea es ir sumando los elementos en una variable e ir guardando el índice que hace que la suma sea máxima. Es necesario que se iteren todos los elementos del arreglo izquierdo pues no se puede asegurar cuál índice será el que maximice la suma.

Se hace lo mismo, pero con el arreglo derecho desde el índice menor hasta el mayor.

Luego, el arreglo cruzado de suma máxima será el arreglo izquierdo y derecho combinados desde el índice que maximiza la suma a izquierda hasta el índice que maximiza la suma a derecha. El subarreglo candidato es contiguo y está formado por las partes de cada lado que suman más.

Teniendo el candidato a izquierda, a derecha y el máximo subarreglo cruzado, se debe comparar cual suma más y devolver esa solución para esa llamada recursiva.

#### Implementación

```
def subarreglo_cruzado(arr):
    med = len(arr) // 2

    suma_parcial = 0
    cruzado_izq = med
    suma_izq = 0
    for i in range(med - 1, -1, -1):
        suma_parcial += arr[i]
        if suma_parcial > suma_izq:
            suma_izq = suma_parcial
            cruzado_izq = i

    suma_parcial = 0
    cruzado_der = med
    suma_der = 0
    for j in range(med, len(arr)):
        suma_parcial += arr[j]
        if suma_parcial > suma_der:
            suma_der = suma_parcial
            cruzado_der = j

    return arr[cruzado_izq : cruzado_der + 1]

def subarreglo_maxima_suma(arr):
    if len(arr) == 1:
        return arr

    med = len(arr) // 2

    izq = subarreglo_maxima_suma(arr[:med])
    der = subarreglo_maxima_suma(arr[med:])
    cruzado = subarreglo_cruzado(arr)

    sumas = (sum(izq), sum(der), sum(cruzado))
    suma_maxima = max(sumas)

    if suma_maxima == sumas[0]:
        return izq
    elif suma_maxima == sumas[1]:
        return der
    else:
        return cruzado

```

#### Complejidad

Para justificar la complejidad, utilizamos el teorema maestro. Se realizan dos llamadas recursivas para obtener el candidato a izquierda y derecha por lo que `A=2`. En cada llamada recursiva se divide el arreglo por la mitad, por lo tanto `B=2`. Para calcular el arreglo cruzado se deben recorrer ambas mitades hasta el final del ciclo haciendo que sea lineal en función de la cantidad de elementos. Calcular la suma de los subarreglos para comparar también es lineal, siendo el peor caso la suma de un subarreglo que contenga a todos los elementos. Eso significa que los cálculos auxiliares tienen complejidad lineal, resultando en que `C=1`.

La ecuación de recurrencia queda entonces como:

```math
T(n)=2T(n2)+O(n)
```

Haciendo los cálculos correspondientes llegamos a que

```math
log⁡2(2)=1=C⟹O(n⋅log⁡(n))
```

Es interesante notar que con el enfoque de división y conquista, se aprovechan los cálculos intermedios para poder obtener la solución sin necesidad de probar todas las combinaciones.

## Ejercicios propuestos

1. (★) Se cuenta con un arreglo de enteros ordenado de manera ascendente que contiene exactamente un número duplicado (es decir, todos los demás elementos son distintos, sin duplicados). Implementar una función que encuentre dicho número utilizando división y conquista. Indicar y justificar la complejidad del algoritmo, utilizando el Teorema Maestro.
2. (★) Se tiene un arreglo en el que se registran los resultados de tests automáticos de una porción de código. Este código se encontraba funcionando pero, debido a unos cambios que se están realizando, en algún momento dejó de funcionar. Se registra un 1 si pasa los tests, 0 en caso contrario. De esta manera, el arreglo tendrá la forma `[1, 1, 1, ..., 0, 0, ...]` (es decir, *unos seguidos de ceros*). Se pide: a. una función de orden `O(log⁡n)` que, por división y conquista, encuentre el índice del primer 0, de forma que se pueda reconocer rápidamente en qué modificación del código se dejó de pasar los tests. Si no hay ningún 0 (solo hay unos), debe devolver -1. b. demostrar con el Teorema Maestro que la función es, en efecto, `O(log⁡n)`.

   Ejemplos:
   ```
   [1, 1, 0, 0, 0] →  2
   [0, 0, 0, 0, 0] →  0
   [1, 1, 1, 1, 1] → -1

   ```
3. (★) Implementar un algoritmo que, por división y conquista, permita obtener la parte entera de la raíz cuadrada de un número `n`, en tiempo `O(log⁡n)`. Por ejemplo, para `n=10` debe devolver 3, y para `n=25` debe devolver 5. Justificar la complejidad del algoritmo.
4. (★) Se tiene un arreglo de `N>=3` elementos en forma de pico, esto es: estrictamente creciente hasta una determinada posición `p`, y estrictamente decreciente a partir de ella (con `0<p<N−1`). Por ejemplo, en el arreglo `[1, 2, 3, 1, 0, -2]` la posición del pico es `p=2`. Se pide: a. Implementar un algoritmo de división y conquista de complejidad `O(log⁡n)` que encuentre la posición `p` del pico. b. Justificar la complejidad del algoritmo mediante el teorema maestro.
5. (★) Implementar Merge Sort. Justificar la complejidad del algoritmo mediante el teorema maestro.
6. (★) Implementar un algoritmo de multiplicación de dos números grandes de longitud n, por división y conquista, con un orden de complejidad mejor que `O(n2)`. Justificar la complejidad del algoritmo mediante el teorema maestro.
7. (★★) Implementar un algoritmo que dados n puntos en un plano, busque la pareja que se encuentre más cercana, por división y conquista, con un orden de complejidad mejor que `O(n2)`. Justificar la complejidad del algoritmo mediante el teorema maestro. Se puede asumir que ningún par de puntos tienen la misma coordenada x o y.
8. (★) Dados un conjunto de n elementos, y 2 arreglos de longitud n, con dichos elementos. El arreglo A está completamente ordenado de menor a mayor. El arreglo B se encuentra desordenado. Indicar, por división y conquista, la cantidad de inversiones necesarias al arreglo B para que quede ordenado de menor a mayor, con un orden de complejidad mejor que `O(n2)`. Justificar la complejidad del algoritmo mediante el teorema maestro.
9. (★★★) Implementar una función, que utilice división y conquista, de complejidad `O(nlog⁡n)` que dado un arreglo de `n` números enteros devuelva `true` o `false` según si existe algún elemento que aparezca más de la mitad de las veces. Justificar la complejidad de la solución. Ejemplos:
   ```
   [1, 2, 1, 2, 3] -> false
   [1, 1, 2, 3] -> false
   [1, 2, 3, 1, 1, 1] -> true
   [1] -> true

   ```
   *Aclaración*: Este ejercicio puede resolverse, casi trivialmente, ordenando el arreglo con un algoritmo eficiente, o incluso se puede realizar más rápido utilizando una tabla de hash. Para cumplir con la consigna, resolver **sin ordenar el arreglo ni con tabla de hash**, sino puramente por división y conquista.
10. (★★★★) Resolver el ejercicio anterior, por división y conquista, en complejidad `O(n)`, dada la misma aclaración. Justificar la complejidad de la solución.
11. (★★★★) Implementar una función, que utilice división y conquista, de complejidad `O(n)` que dado un arreglo de `n` números enteros devuelva `true` o `false` según si existe algún elemento que aparezca más de dos tercios de las veces. Justificar la complejidad de la solución.
12. (★★★) Tenemos un arreglo de tamaño `2n` de la forma `{C1, C2, C3, … Cn, D1, D2, D3, … Dn}`, tal que la cantidad total de elementos del arreglo es potencia de 2 (por ende, `n` también lo es). Implementar un algoritmo de División y Conquista que modifique el arreglo de tal forma que quede con la forma `{C1, D1, C2, D2, C3, D3, …, Cn, Dn}`, **sin utilizar espacio adicional** (obviando el utilizado por la recursividad). Indicar y justificar su complejidad temporal.

    *Pista*: Pensar primero cómo habría que hacer si el arreglo tuviera 4 elementos (`{C1, C2, D1, D2}`). Luego, pensar a partir de allí el caso de 8 elementos, etc… para encontrar el patrón.
13. (★★) Debido a la trágica situación actual, es necesario realizar tests para detectar si alguna persona está contagiada de COVID-19. El problema es que los insumos tienden a ser bastante caros, y no vivimos en un país al que los recursos le sobren.

    Supongamos que por persona se toma más de una muestra (lo cual es cierto, pero a fines del ejercicio supongamos que son muchas muestras), y que podemos realizar un testeo a más de una persona al mismo tiempo mezclando las muestras (lo cual también es cierto): determinamos un conjunto de personas a testear, obtenemos una muestra de cada una de ellas, las “juntamos”, y al conjunto le realizamos el test. Si el test resulta negativo, implica que todas las personas testeadas en conjunto resultaron negativas. Si resulta positivo, implica que al menos una de las personas testedas resulta positiva.

    Suponer que existe una función `pcr(grupo)`, que devuelve `true` si al menos una persona del `grupo` es COVID-positivo, y `false` en caso contrario (los `grupos` pueden estar formados por 1 o más personas). Suponer que la positividad es extremadamente baja, e inclusive pueden suponer que va a haber una única persona contagiada (por simplicidad).

    Implementar un algoritmo que dado un conjunto de `n` personas, devuelva la o las personas contagiadas, utilizando la menor cantidad de tests posibles (considerando la notación Big Oh). En dicha notación, ¿cuántos tests se estarán utilizando?

    Pueden considerar que habrá una única persona contagiada, pero esto no cambiará el análisis a realizar.
14. (★★) Se sabe, por el teorema de Bolzano, que si una función es continua en un intervalo `[a, b]`, y que en el punto `a` es positiva y en el punto `b` es negativa (o viceversa), necesariamente debe haber (al menos) una raíz en dicho intervalo. Implementar una función raiz que reciba una función (univariable) y los extremos mencionados a y b, y devuelva una raíz dentro de dicho intervalo (si hay más de una, simplemente quedarse con una). La complejidad de dicha función debe ser logarítmica del largo del intervalo `[a, b]`. Asumir que por más que se esté trabajando con números enteros, hay raíz en dichos valores: Se puede trabajar con `floats`, y el algoritmo será equivalente, simplemente se plantea con `ints` para no generar confusiones con la complejidad. Justificar la complejidad de la función implementada.
15. (★) Es el año 1700, y la pirata Barba-ra Verde atacó un barco de la *Royal British Shipping & Something*, que transportaba una importante piedra preciosa de la corona británica. Al parecer, la escondieron en un cofre con muchas piedras preciosas falsas, en caso de un ataque. Barba-ra Verde sabe que los refuerzos británicos no tardarán en llegar, y deben huir lo más rápido posible. El problema es que no pueden llevarse el cofre completo por pesar demasiado. Necesita encontrar rápidamente la joya verdadera. La única forma de descubrir la joya verdadera es pesando. Se sabe que la joya verdadera va a pesar más que las imitaciones, y que las imitaciones pesan todas lo mismo. Cuenta con una balanza de platillos para poder pesarlas (es el 1700, no esperen una balanza digital).

    a. Escribir un algoritmo de división y conquista, para determinar cuál es la verdadera joya de la corona. Suponer que hay una función `balanza(grupo_de_joyas1, grupo_de_joyas2)` que devuelve 0 si ambos grupos pesan lo mismo, mayor a 0 si el `grupo1` pesa más que el `grupo2`, y menor que 0 si pasa lo contrario, y realiza esto en tiempo constante. b. Indicar y justificar (adecuadamente) la complejidad de la función implementada.
16. (★★★★) Sea una matriz `A` de tamaño `n×n`, con todos valores distintos. Un índice `(i,j)` es un máximo local si `A[i,j]` es estrictamente mayor que todos su vecinos que existan (arriba, abajo, izquierda, derecha). Implementar un algoritmo de División y Conquista que permita encontrar algún máximo local en tiempo `O(n)`. Justificar adecuadamente la complejidad del algoritmo. Prestar mucha atención a la ecuación de recurrencia escrita, ya que esto puede develar un error en el algoritmo planteado.
17. (★★★) Una función lineal se define como `f(x)=ax+b`. Si tenemos dos funciones lineales `f1(x)=a1x+b1` y `f2(x)=a2x+b2`, entonces la composición puede simplificarse a: `f3(x)=f1(f2(x))=(a1a2)x+(a1b2+b1)`. Es decir, tenemos una nueva función lineal, cuyos `a` y `b` son los resultates marcados.

    Utilizando **división y conquista**, implementar una función `composición_n(a, b, c, n)` que reciba los valores de `a` y `b` de una función lineal, `c` y `n` y determine el valor de `fn(c)=f(f(f(...f(c))` (`n` composiciones de la función `f` consigo misma) en tiempo `O(log⁡n)`. Justificar adecuadamente la complejidad del algoritmo implementado.

    Ayudas:
    - Recomendamos primero obtener los valores de `a` y `b` que corresponden a `fn(x)`. La cuenta final es trivial.# Greedy

## Contenidos

1. [Ejercicio resuelto](https://algoritmos-rw.github.io/tda_bg/material/guias/greedy/#ejercicio-resuelto)
2. [Ejercicios propuestos](https://algoritmos-rw.github.io/tda_bg/material/guias/greedy/#ejercicios-propuestos)

## Ejercicio resuelto

### Enunciado

Implementar un algoritmo greedy que permita obtener el Dominating Set mínimo (es decir, que contenga la menor cantidad de vértices) para el caso de un árbol (en el contexto de teoría de grafos, no un árbol binario). Indicar y justificar la complejidad del algoritmo implementado. Justificar por qué se trata de un algoritmo greedy. Indicar si el algoritmo siempre da solución óptima. Si lo es, explicar detalladamente, sino dar un contraejemplo.

### Consideración

Dado que es posible que para cuando estén realizando los ejercicios de Greedy aún no hayan visto sobre el problema de Dominating Set, aquí damos su definición:

Un dominating set de un grafo es un subconjunto de vértices de dicho grafo tal que, para cada vértice del grafo, dicho vértice pertenece al dominating set, o bien alguno de sus adyacentes pertenece al dominating set.

### Solución

Una primera idea que puede surgir es justamente pensar en los grados de los vértices. Tal como vimos Además, sabiendo que todo árbol de al menos 2 vértices tiene al menos 2 hojas que (al igual que el resto de vértices en el árbol) deben “ser dominadas”, quedaría una decisión que tomar: o bien incluir la hoja en el dominating set, o a sus respectivos adyacentes. Dado que queremos minimizar la cantidad de vértices en el dominating set, nos conviene poner el vértice que “más pueda dominar”. En particular, es claro que conviene el adyacente a la hoja, que puede cubrir más de uno.

Acá pueden surgir varios errores. El error más común es el siguiente: ordenar de menor a mayor grado, agregando el vértice y “anulando los que siguen”. Esto es un error porque estamos justamente agarrando al vértice contrario al que nos conviene (de óptimo local, nada). Ok, corrijamos eso, podríamos decir que ordenamos de menor a mayor grado, y en ese orden nos quedamos con el adyacente a dicho vértice. El problema ahora es que puede haber vértices ya dominados que generan la falsa ilusión de que un vértice estaría dominando efectivamente la mayor cantidad posible de vértices por ser sus adyacentes. Entonces, por lo mencionado, tenemos que considerar cuáles vértices ya están siendo dominados (es decir, quienes o bien están en el conjunto o tienen un ayacente en el conjunto). Esto empieza a tener algo de sentido. ¿El problema? Esto tiene un error conceptual gravísimo: técnicamente, no es un algoritmo greedy. Si quien lee dice “pero si ordené!”, ordenar no hace que un algoritmo sea greedy. Ordenar es únicamente una optimización que encontramos cuando el valor por el que vamos a ir buscando “el siguiente mínimo/máximo” no se ve alterado. Pero en este caso, eso no es cierto. Acá nos interesa ver por grado, a medida que, básicamente, estamos eliminando vértices del grafo para dejar de considerarlos. Esto altera el grado que debo considerar, por lo que el estado cambió y debo buscar el nuevo mínimo. El tema aquí es que haber ordenado y no considerar las modificaciones quita el elemento “local”. Cuando decimos que buscamos un óptimo local, justamente es local al estado de la iteración como la tenemos, no necesariamente esto está relacionado al estado original. Hay algoritmos donde el estado original va a permanecer para servirnos como óptimos locales (ejemplo, el algoritmo de Kruskal), pero en otros no es el caso y hay que ir considerando las actualizaciones (ejemplos, Dijkstra y Huffman). Por supuesto esto demora más, pero… es óptimo. La otra alternativa no es siquiera óptima, además de no ser enteramente greedy.

Para darles un contraejemplo, supongamos un grafo:

```
A - B - D - F
    |   |
    C   E

```

En este caso, inicialmente cubriremos B (o D), eliminando a A, C y D en el camino, dejándonos con E y F, los cuáles ambos deberían ser incluídos, dejándonos con un Dominating Set de 3 vértices cuando el óptimo es de 2 (B y D). Podríamos seguir agregando condiciones, pero hay que tener cuidado de no decir “bueno, ahora intento considerar una opción y otra”, cuando un algoritmo greedy aplica una simple regla para buscar el óptimo local.

Entonces, volvemos a plantear la solución realmente greedy:

- Buscamos un vértice de grado 1. A su adyacente lo agregamos al dominating set.
- Agregamos al conjunto de vértices dominados al vértice que agregamos al dominating set y a todos sus adyacentes
- Eliminamos del grafo a: el vértice de grado 1, al agregado al dominating set, y también a todos los adyacentes al vértice agregado que sean hojas (es decir, este podría estar vinculado a varias hojas), o que por eliminar a este pasaran a ser hojas (ya dominadas, no traen otro beneficio).
- Volvemos a buscar algún vértice de grado 1 aplicando la misma lógica, hasta que no queden vértices en el grafo, o solo queden vértices de grado 0
- Finalmente, si no quedan vertices de grado 1 pero el grafo aún tiene vertices (necesariamente todos los vértices que quedan tienen grado 0), agregamos al dominating set a los vértices del grafo que aún no están en el conjunto de dominados.

```
def dominating_set_arbol(grafo):
    ds = set()
    dominados = set()
    while len(grafo) > 0:
        v = obtener_vertice_grado_1(grafo)
        if v is None:
            break

        w = grafo.adyacentes(v)[0]
        ds.add(w)
        dominados.add(w)
        for x in grafo.adyacentes(w):
            dominados.add(x)
            if len(grafo.adyacentes(x)) <= 2:
                grafo.borrar_vertice(x)
        grafo.borrar_vertice(w)
    
    for v in grafo:
        if v not in dominados:
            ds.add(v)

    return ds

def obtener_vertice_grado_1(grafo):
    for v in grafo:
        if len(grafo.adyacentes(v)) == 1:
            return v

```

Hay otras formas de implementar esto (buscar en cada iteración a los vértices de grado 1 y aplicar esta lógica), que en sí sería lo mismo. También se puede obviar “eliminar” los vértices y simplemente ir modificando un diccionario con grados y cosas por el estilo.

La complejidad de este algoritmo es `O(n2)`, por la búsqueda de vértices de grado 1 en cada iteración. El algoritmo es greedy ya que iterativamente, a través de una regla sencilla, se busca aquel vértice que me maximiza la cantidad de hojas a dominar, las cuales son fáciles de detectar lo que conviene. Siendo este el óptimo local. Al saber que alguno de estos tiene que ir si o si, y que al eliminar una hoja siempre vamos a seguir teniendo un árbol (`→` va a tener al menos 2 hojas), entonces esta lógica siempre será correcta. Y por esto mismo el algoritmo será óptimo (no pedimos una demostración formal en el parcial, pero la idea viene justamente por ese lado, y usando el absurdo).

Alguien podría pensar que al no borrar todos los vértices adyacentes al que estamos agregando cometemos un error porque no estamos considerando que este ya se encuentra dominado. Esto es un error: estamos justamente considerando que a pesar de estar dominado, esto no hace que no convenga nunca incluirlo (mirar el contraejemplo anterior). Si no se lo elimina es porque tiene otro adyacente que aún falta por dominar.

## Ejercicios propuestos

1. (★) Explicar por qué el Algoritmo de Kruskal (para obtener el MST de un grafo no dirigido) es un Algoritmo Greedy.
2. (★) Explicar por qué el Algoritmo de Prim (para obtener el MST de un grafo no dirigido) es un Algoritmo Greedy.
3. (★) Explicar por qué el Algoritmo de Dijkstra (para obtener caminos mínimos desde un vértice, en un grafo con pesos positivos) es un Algoritmo Greedy.
4. (★★) Dada un aula/sala donde se pueden dar charlas. Las charlas tienen horario de inicio y fin. Implementar un algoritmo Greedy que reciba el arreglo de los horarios de las charlas, representando en tuplas los horarios de inicios de las charlas, y sus horarios de fin, e indique cuáles son las charlas a dar para maximizar la cantidad total de charlas. Indicar y justificar la complejidad del algoritmo implementado.
5. (★) Realizar un seguimiento de aplicar el Algoritmo de Huffman al texto `“PRETERINTENCIONALIDAD”`, indicando el binario resultante de comprimirlo. ¿Por qué se trata de un algoritmo Greedy? Justificar
6. (★) Se tiene un sistema monetario (ejemplo, el nuestro). Se quiere dar “cambio” de una determinada cantidad de plata. Implementar un algoritmo Greedy que devuelva el cambio pedido, usando la mínima cantidad de monedas/billetes. El algoritmo recibirá un arreglo de valores del sistema monetario, y la cantidad de cambio objetivo a dar, y debe devolver qué monedas/billetes deben ser utilizados para minimizar la cantidad total utilizda. Indicar y justificar la complejidad del algoritmo implementado. ¿El algoritmo implementado encuentra siempre la solución óptima? Justificar si es óptimo, o dar un contraejemplo. ¿Por qué se trata de un algoritmo Greedy? Justificar
7. (★★) Tenemos unos productos dados por un arreglo `R`, donde `R[i]` nos dice el precio del producto. Cada día podemos y debemos comprar uno (y sólo uno) de los productos, pero vivimos en una era de inflación y los precios aumentan todo el tiempo. El precio del producto `i` el día `j` es `R[i]j+1` (`j` comenzando en 0). Implementar un algoritmo greedy que nos indique el precio mínimo al que podemos comprar todos los productos. Indicar y justificar la complejidad del algoritmo implementado. ¿El algoritmo implementado encuentra siempre la solución óptima? Justificar. ¿Por qué se trata de un algoritmo Greedy? Justificar ¿Qué modificaciones se deben realizar para un estado de deflación, con productos que bajan de precio todo el tiempo?
8. (★★) Tenemos una mochila con una capacidad `W`. Hay elementos a guardar, cada uno tiene un valor, y un peso que ocupa de la capacidad total. Queremos maximizar el valor de lo que llevamos sin exceder la capacidad. Implementar un algoritmo Greedy que, reciba dos arreglos de valores y pesos de los elementos, y devuelva qué elementos deben ser guardados para maximizar la ganancia total. Indicar y justificar la complejidad del algoritmo implementado. ¿El algoritmo implementado encuentra siempre la solución óptima? Justificar. ¿Por qué se trata de un algoritmo Greedy? Justificar

   ¿Qué diferencias se perciben si en vez de tener que colocar los elementos completos, se pueden fraccionar para nuestra conveniencia?
9. (★★) Tenemos tareas con una duración y un deadline (fecha límite), pero pueden hacerse en cualquier momento, intentando que se hagan antes del deadline. Una tarea puede completarse luego de su deadline, pero ello tendra una penalización de latencia. Para este problema, buscamos minimizar la latencia máxima en el que las tareas se ejecuten. Es decir, dados los arreglos de: `T` tiempo de duraciones de las tareas y L representando al deadline de cada tarea, si definimos que una tarea `i` empieza en `Si`, entonces termina en `Fi=Si+Ti`, y su latencia es `Li=Fi−Di` (si `Fi>Di`, sino 0). Nuestra latencia máxima será aquella `i` que maximice el valor `Li`. Implementar un algoritmo que defina en qué orden deben realizarse las tareas, sabiendo que al terminar una tarea se puede empezar la siguiente. Indicar y justificar la complejidad del algoritmo implementado.

   Devolver un arreglo de tuplas, una tupla por tarea, en el orden en que deben ser realizadas, y que cada tupla indique: (el tiempo `Ti` de la tarea `i`, y la latencia resultante `Li` de esa tarea).

   ¿El algoritmo implementado encuentra siempre la solución óptima? Justificar. ¿Por qué se trata de un algoritmo Greedy? Justificar
10. (★) Una ruta tiene un conjunto de bifurcaciones para acceder a diferentes pueblos. El listado (ordenado por nombre del pueblo) contiene el número de kilómetro donde está ubicada cada una. Se desea ubicar la menor cantidad de patrullas policiales (en las bifurcaciones) de tal forma que no haya bifurcaciones con vigilancia a más de 50 km. Justificar que la solución es óptima. Indicar y justificar la complejidad del algoritmo implementado. Ejemplo:
    | CiudadBifurcación |     |
    | ----------------- | --- |
    | Castelli          | 185 |
    | Gral Guido        | 242 |
    | Lezama            | 156 |
    | Maipú             | 270 |
    | Sevigne           | 194 |
    Si pongo un patrullero en la bifurcación de Lezama, cubro Castelli y Sevigne. Pero no Gral Guido y Maipú. Necesitaría en ese caso, poner otro. Agrego otro patrullero en Gral Guido. Con eso tengo 2 móviles policiales en bifurcaciones que cubren todas los accesos a todas las ciudades con distancia menor a 50km.

    En un caso alternativo donde solamente se consideren las bifurcaciones de Castelli, Gral Guido y Sevigne, la
    única solución óptima sería colocar un móvil policial en Sevigne.
11. (★★) Las bolsas de un supermercado se cobran por separado y soportan hasta un peso máximo `P`, por encima del cual se rompen. Implementar un algoritmo greedy que, teniendo una lista de pesos de `n` productos comprados, encuentre la mejor forma de distribuir los productos en la menor cantidad posible de bolsas. Realizar el seguimiento del algoritmo propuesto para bolsas con peso máximo 5 y para una lista con los pesos: `[ 4, 2, 1, 3, 5 ]`. ¿El algoritmo implementado encuentra siempre la solución óptima? Justificar. Indicar y justificar la complejidad del algoritmo implementado.
12. (★★) Trabajamos para el mafioso Arnook, que es quien tiene la máxima influencia y poder en la zona costera de Ciudad República. Allí reina el caos y la delincuencia, a tal punto que quien termina organizando las pequeñas mafias locales no es otro sino Arnook. En particular, nos vamos a centrar en unos pedidos que recibe de parte de dichos grupos por el control de diferentes kilómetros de la ruta costera. Cada pequeña mafia le pide a Arnook control sobre un rango de kilómetros (por ejemplo, la mafia nro 1 le pide del kilómetro 1 al 3.5, la mafia 2 le pide del 3.3333 al 8, etc. . . ). Si hay una mafia tomando control de algún determinado kilómetro, no puede haber otra haciendo lo mismo (es decir, no pueden solaparse). Cada mafia pide por *un rango específico*. Arnook no cobra por kilómetraje sino por “otorgar el permiso”,
    indistintamente de los kilómetros pedidos. Ahora bien, esto es una mafia, no una ONG, y no debe rendir cuentas con nadie, así que lo único que es de interés es maximizar la cantidad de permisos otorgados (asegurándose de no otorgarle algún lugar a dos mafias diferentes). Implementar un algoritmo Greedy que reciba los rangos de kilómetros pedidos por cada mafia, y determine a cuáles se les otorgará control, de forma que no hayan dos mafias ocupando mismo territorio, y a su vez maximizando la cantidad de pedidos otorgados. Indicar y justificar la complejidad del algoritmo implementado. Justificar por qué el algoritmo planteado es Greedy. ¿El algoritmo da la solución óptima siempre?
13. (★★) Tenemos una ruta recta muy larga, de `K` kilómetros, sobre la cual hay casas dispersas. En dichas casas vive gente que usa mucho sus celulares. El intendente a cargo la ruta debe renovar por completo el sistema de antenas, teniendo que construir sobre la ruta nuevas antenas. Cada antena tiene un rango de cobertura de `R` kilómetros (valor constante conocido). Implementar un algoritmo Greedy que reciba **las ubicaciones de las casas**, en número de kilómetro sobre esta ruta (números *reales positivos*) **desordenadas**, y devuelva los kilómetros sobre los que debemos construir las antenas para que todas las casas tengan cobertura, y se construya para esto la menor cantidad de antenas posibles. Indicar y justificar la complejidad del algoritmo implementado. Justificar por qué se trata de un algoritmo greedy. ¿El algoritmo da la solución óptima siempre?
14. (★★) Se tiene una matriz donde en cada celda hay submarinos, o no, y se quiere poner faros para iluminarlos a todos. Implementar un algoritmo **Greedy** que dé la cantidad mínima de faros que se necesitan para que todos los submarinos queden iluminados, siendo que cada faro ilumina su celda y además todas las adyacentes (incluyendo las diagonales), y las directamente adyacentes a estas (es decir, un “radio de 2 celdas”). Indicar y justificar la complejidad del algoritmo implementado. ¿El algoritmo implementado da siempre la solución óptima? Justificar
15. (★★) Se tiene una colección de n libros con diferentes espesores, que pueden estar entre 1 y `n` (valores no necesariamente enteros). Tu objetivo es guardar esos libros en la menor cantidad de cajas. Todas las cajas disponibles son de la misma capacidad `L` (se asegura que `L≥n`). Obviamente, no podés partir un libro para que vaya en múltiples cajas, pero sí podés poner múltiples libros en una misma caja, siempre y cuando los espesores no superen esa capacidad L. Implementar un algoritmo Greedy que obtenga las cajas, tal que se minimicen la cantidad de cajas a utilizar. Indicar y justificar la complejidad del algoritmo implementado. Justificar por qué se trata de un algoritmo greedy. ¿El algoritmo propuesto encuentra siempre la solución óptima? Justificar. ¿Qué cambios aplicarías si supieras que los espesores sólo fueran números enteros de un rango acotado? Describir cómo afecta a la complejidad, y a su optimalidad.
16. (★★★) El club de Amigos de Siempre prepara una cena en sus instalaciones en la que desea invitar a la máxima cantidad de sus `n` socios. Sin embargo por protocolo cada persona invitada debe cumplir un requisito: Sólo puede ser invitada si conoce a al menos otras 4 personas invitadas.

    a. Nos solicitan seleccionar el mayor número posible de invitados. Proponer una estrategia greedy óptima para resolver el problema.

    b. Los organizadores desean que cada invitado pueda conocer nuevas personas. Por lo que nos solicitan que adicionemos una nueva restricción a la invitación: Sólo puede asistir si NO conoce al menos otras 4 personas invitadas. Modifique su propuesta para satisfacer esta nueva solución.
17. (★★) Imaginá que estamos organizando un torneo de guardias en un castillo. El castillo tiene un suelo dividido en una cuadrícula de tamaño `n x m`, y cada celda puede estar ocupada por un guardia o estar vacía. Los guardias tienen la habilidad de vigilar todas las celdas adyacentes a su posición, incluidas las diagonales, es decir, pueden ver las celdas vecinas que están justo al lado, arriba, abajo, a la izquierda, a la derecha o en las esquinas.

    Se nos pide colocar la mayor cantidad posible de guardias en el castillo sin que ninguno pueda vigilar a otro. Esto significa que no podemos colocar dos guardias en celdas adyacentes, ya que estarían vigilándose mutuamente.

    Implementar un algoritmo **greedy** que permita colocar el mayor número posible de guardias en el castillo sin que se vigilen entre sí. Indicar y justificar la complejidad del algoritmo. Indicar por qué se trata, en efecto, de un algoritmo greedy. El algorimto, ¿es óptimo? si lo es, justificar brevemente, sino dar un contraejemplo.# Backtracking

## Contenidos

1. [Ejercicio resuelto](https://algoritmos-rw.github.io/tda_bg/material/guias/bt/#ejercicio-resuelto)
2. [Ejercicios propuestos](https://algoritmos-rw.github.io/tda_bg/material/guias/bt/#ejercicios-propuestos)

## Ejercicio resuelto

(★★★★) El problema conocido como *Feedback Vertex Set (FVS)* indica: Dado un grafo (por simplificación, no dirigido), indicar vértices a eliminar de dicho grafo de tal manera que el grafo quede acíclico.

Implementar un algoritmo que, por **backtracking**, encuentre el mínimo FVS (es decir, el conjunto de menor cantidad de vértices a remover). Si bien es obvio, el grafo **no** cuenta con una primitiva `tiene_ciclos` (e, incluso, si la tuviera, sería poco conveniente usarla, recomendamos pensar por qué).

### Solución

El problema en sí a priori no tendría una enorme diferencia con otros ejercicios de Bactracking, salvo por la necesidad de detectar ciclos. El tema aquí es que podemos aplicar una gran poda, que además es extremadamente evidente: si una componente conexa no presenta ciclos, no tiene ningún sentido analizar qué pasaría si sacamos a un vértice de dicha componente. Simplemente es estamos perdiendo el tiempo. Este tipo de podas medianamente evidentes que muestran *entender el problema* y no simplemente *saberse una formula de Backtracking* es algo que se espera que se realice. Restaría realmente mucho no hacerlo.

Entonces, a partir de esto se puede plantear de diferentes formas. Lo que vamos a plantear aquí es ir vértice por vértice del grafo, dentro de un conjunto de vértices que (hasta ahora) tenga sentido ir analizando. Entonces, cada vez que sacamos un vértice, calculamos nuevamente cuáles tienen sentido, y los que no (componente conexa sin ciclos) directamente los sacamos.

Se podría hacer también que cada vez que vamos a analizar un vértice, se chequee si la componente a la que perteence es acíclica, y en ese caso saltearlo. Esto sería correcto, se tomaría como correcto totalmente (a fin de cuentas, muestra entender qué mejora se puede hacer en función de entender el problema), pero esto puede mejorarse para evitar hacer una operación lineal por cada vértice en todo momento, e ir ya reduciendo.

Entonces, primero vamos a hacer una breve función que nos determine las componentes conexas de un grafo:

```
def componentes_conexas(grafo):
   visitados = set()
   componentes = []
   for v in grafo:
        if v not in visitados:
            componente = []
            dfs_comp(grafo, v, visitados, componente)
            componentes.append(componente)
    return componentes

def dfs_comps(grafo, v, visitados, componente):
    componente.append(v)
    visitados.add(v)
    for w in grafo.adyacentes(v):
        if w not in visitados:
            dfs_comps(grafo, w, visitados, componente)

```

Esto es una función lineal sobre el grafo (en vértices y aristas, $\mathcal{O}(V+E)$).

Ahora hacemos una breve función que nos determine si una componente tiene ciclos. La hacemos con BFS, únicamente porque la anterior la hicimos con DFS (por supuesto, hacerla con DFS estaría bien):

```
def tiene_ciclo(grafo, componente):
    cola = Cola()
    origen = componente[0]
    cola.encolar(origen)
    visitados = set()
    visitados.add(origen)
    padres = {origen: None}
    while not cola.esta_vacia():
        v = cola.desencolar()
        for w in grafo.adyacentes(v):
            if w in visitados:
                if w is not padre[v]: # si es el padre, no es un ciclo
                    return True
            else:
                padres[w] = v
                visitados.add(w)
                cola.encolar(v)
    return False

```

Entonces nuestra idea es: iniciamos obteniendo las componentes conexas del grafo y ya filtrar las que no tienen ciclos. Luego, por cada vértice que aún está en una componente con ciclo, vemos qué pasa si lo sacamos (y recalculamos las componentes –> pueden cambiar porque podríamos estar sacando un vértice que en este punto sea un punto de articulación de lo que resta del grafo). Este último paso sería incluso mejorable si mantuviéramos cuenta de las componentes conexas del grafo, y cuando sacamos un vértice vemos las componentes que hay a partir de este (sin contarlo… digamos, similar a lo hecho en la función `componentes_conexas`). Esto implicaría un tanto más de programación que incluso no creemos que traiga muchas mejoras (y no esperamos que lo hagan porque justamente, implica mucho más de desarrollo para mantener todo en cuenta). Obviamente, en un TP podría ser conveniente explorar esta posibilidad, y analizar cuánto mejora una determinada poda.

```
def fvs_rec(grafo_actual, vertices_posibles, sol_parcial, sol_minima):
    if len(vertices_posibles) == 0:
        if len(sol_parcial) < len(sol_minima):
            return sol_parcial[:]
        else:
            return sol_minima

    # La poda obvia de casi todo problema, si ya no somos mejores al óptimo actual, cortamos. 
    if len(sol_parcial) >= len(sol_minima):
        return sol_minima

    # lo saco para no considerarlo
    # es más fácil que ir por índices, siendo que vamos a ir recalculando
    posible = vertices_posibles.pop()

    solucion_minima = fvs_rec(grafo_actual, vertices_posibles, sol_parcial, sol_minima)

    adyacentes = grafo_actual.adyacentes(posible)
    grafo_actual.borrar_vertice(posible)
    nuevos_posibles = potenciales(grafo_actual)
    sol_parcial.append(posible)
    solucion_minima = fvs_rec(grafo_actual, nuevos_posibles, sol_parcial, solucion_minima)
    
    # Backtrack para futuros llamados. No hice una copia porque eso es más costoso que simplemente
    # sacar un vértice y volverlo a poner
    vertices_posibles.append(posible)
    grafo_actual.agregar_vertice(posible)
    for v in adyacentes:
        grafo_actual.agregar_arista(posible, v)

    return solucion_minima
    

def potenciales(grafo):
    nuevos_posibles = []
    for comp in componentes_conexas(grafo):
        if tiene_ciclo(grafo, comp):
            for v in comp:
                nuevos_posibles.append(v)
    return nuevos_posibles

def fvs(grafo):
    # se podria hacer una copia del grafo para no estarlo modificando
    # la solución mínima inicial la consideramos una con todos los vértices, que es una solución trivial
    # (y seguro mejorable)
    return fvs_rec(grafo, potenciales(grafo), [], grafo.vertices())

```

## Ejercicios propuestos

1. (★★) Implementar por backtracking un algoritmo que, dado un grafo no dirigido y un numero `n` menor a `∣V∣`, devuelva si es posible obtener un subconjunto de n vertices tal que ningun par de vertices sea adyacente entre si.
2. (★★) Implementar un algoritmo que reciba un grafo y un número `n` que, utilizando backtracking, indique si es posible pintar cada vértice con n colores de tal forma que no hayan dos vértices adyacentes con el mismo color.
3. (★) Dado un tablero de ajedrez `n×n`, implementar un algoritmo por backtracking que ubique (si es posible) a `n` reinas de tal manera que ninguna pueda comerse con ninguna.
4. (★★) Implementar un algoritmo que dado un Grafo no dirigido nos devuelva un conjunto de vértices que representen un máximo Independent Set del mismo.
5. (★★) Un camino hamiltoniano, es un camino de un grafo, que visita todos los vértices del grafo una sola vez. Implementar un algoritmo por backtracking que encuentre un camino hamiltoniano de un grafo dado.
6. (★) Dada una matriz de 9x9, implementar un algoritmo por backtracking que llene la matriz con números del 1 al 9, dadas las condiciones del Sudoku (si es posible). Las condiciones son: (i) Las celdas están dispuestas en 9 subgrupos de 3x3. (ii) Cada columna y cada fila no puede repetir número. (iii) Cada subgrupo de 3x3 no puede repetir número.
7. (★) Implementar un algoritmo de backtracking que, dado una pieza de caballo en un tablero de ajedrez, determine los movimientos a realizar para que el caballo logre pasar por todos los casilleros del tablero una única vez. Recordar que el caballo mueve en forma de L (dos casilleros en una dirección, y un casillero en forma perpendicular).
8. (★★★) Implementar un algoritmo de backtracking que, dados dos grafos, determine si existe un Isomorfismo entre ambos.
9. (★) Se tiene una lista de materias que deben ser cursadas en el mismo cuatrimestre, cada materia está representada con una lista de cursos/horarios posibles a cursar (solo debe elegirse un horario por cada curso). Cada materia puede tener varios cursos. Implementar un algoritmo de backtracking que devuelva un listado con todas las combinaciones posibles que permitan asistir a un curso de cada materia sin que se solapen los horarios. Considerar que existe una función son\_compatibles(curso\_1, curso\_2) que dados dos cursos devuelve un valor booleano que indica si se pueden cursar al mismo tiempo.
10. (★) Implementar un algoritmo tipo Backtracking que reciba una cantidad de dados `n` y una suma `s`. La función debe devolver todas las tiradas posibles de `n` dados cuya suma es `s`. Por ejemplo, con `n=2` y `s=7`, debe devolver `[[1, 6], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1]]`. ¿De qué complejidad es el algoritmo en tiempo? ¿Y en espacio?
11. (★) Escribir un algoritmo que, utilizando backtracking, dada una lista de enteros positivos `L` y un entero `n` devuelva todos los subconjuntos de `L` que suman exactamente `n`.
12. (★) Modificar el algoritmo anterior para que, dada una lista de enteros positivos `L` y un entero `n`, devuelva un subconjunto de `L` que sume exactamente `n`, o, en caso de no existir, que devuelva el subconjunto de suma máxima sin superar el valor de `n`.
13. (★★) Un Vertex Cover de un Grafo G es un conjunto de vértices del grafo en el cual todas las aristas del grafo tienen al menos uno de sus extremos en dicho conjunto. Por ejemplo, el conjunto de todos los vértices del grafo siempre será un Vertex Cover. Implementar un algoritmo que dado un Grafo no dirigido nos devuelva un conjunto de vértices que representen un mínimo Vertex Cover del mismo (es decir, que sea el conjunto de tamaño mínimo).
14. (★★★) Un set dominante (Dominating Set) de un grafo G es un subconjunto **D** de vértices de G, tal que para todo vértice de G: o bien (i) *pertenece a D*; o bien (ii) es *adyacente a un vértice en D*. Implementar un algoritmo que reciba un Grafo, y devuelva un dominating set de dicho grafo con la mínima cantidad de vértices.
15. (★★★) Un bodegón tiene una única mesa larga con `W` lugares. Hay una persona en la puerta que anota los grupos que quieren sentarse a comer, y la *cantidad de integrantes* que conforma a cada uno. Para simplificar su trabajo, se los anota en un vector `P` donde `P[i]` contiene la cantidad de personas que integran el *grupo i*, siendo en total `n` grupos. Como se trata de un restaurante familiar, las personas sólo se sientan en la mesa si *todos los integrantes de su grupo* pueden sentarse. Implementar un algoritmo que, **por backtracking**, obtenga el conjunto de grupos que ocupan la mayor cantidad de espacios en la mesa (o en otras palabras, que dejan la menor cantidad de espacios vacíos).
16. (★★★) Para ayudar a personas con problemas visuales (por ejemplo, daltonismo) el gobierno de Agrabah decidió que en una misma parada de colectivo nunca pararán dos colectivos que usen el mismo color. El problema es que ya saben que eso está sucediendo hoy en día, así que van a repintar todas las líneas de colectivos. Por problemas presupuestarios, desean pintar los colectivos con la menor cantidad posible `k` colores diferentes. Como no quieren parecer un grupo de improvisados que malgasta los fondos públicos, quieren hacer un análisis para saber cuál es ese mínimo valor para cumplir con lo pedido (pintar cada línea con alguno de los `k` colores, de tal forma que no hayan dos de mismo color coincidiendo en la misma parada). Considerando que se tiene la información de todas las paradas de colectivo y qué líneas paran allí, modelar el problema utilizando grafos e implementar un algoritmo que determine el mínimo valor `k` para
    resolver el problema. Indicar la complejidad del algoritmo implementado.
17. (★★★) Se tiene una matriz donde en cada celda hay submarinos, o no, y se quiere poner faros para iluminarlos a todos. Implementar un algoritmo que dé la cantidad mínima de faros que se necesitan para que todos los submarinos queden iluminados, siendo que cada faro ilumina su celda y además todas las adyacentes (incluyendo las diagonales), y las directamente adyacentes a estas (es decir, un “radio de 2 celdas”).
18. (★★★) Implementar un algoritmo que, por backtracking, obtenga la cantidad total de posibles ordenamientos topológicos de un grafo dirigido y acíclico.
19. (★★) Implementar un algoritmo que, utilizando **backtracking**, resuelva el problema del cambio (obtener la forma de dar cambio en la mínima cantidad de monedas) con una nueva restricción: no se tiene una cantidad indefinida de cada moneda, sino una cantidad específica (y esto hace que pueda no haber solución). Suponer que la función a invocar es `cambio(n, monedas, cantidad_x_monedas)`, donde `n` sea el valor a devolver en cambio, `monedas` sea una lista ordenada de los valores de las monedas, y `cantidad_x_monedas` un diccionario.

# Programación Dinámica

## Contenidos

1. [Ejercicio resuelto](https://algoritmos-rw.github.io/tda_bg/material/guias/pd/#ejercicio-resuelto)
2. [Ejercicios propuestos](https://algoritmos-rw.github.io/tda_bg/material/guias/pd/#ejercicios-propuestos)

## Ejercicio resuelto

### Solución

#### Demostración del orden

## Ejercicios propuestos

1. (★) Implementar un algoritmo que, utilizando programación dinámica, obtenga el valor del n-ésimo número de fibonacci. Indicar y justificar la complejidad del algoritmo implementado. Definición:
   ```
   n = 0 --> Debe devolver 1
   n = 1 --> Debe devolver 1
   n --> Debe devolver la suma entre los dos anteriores números de fibonacci (los fibonacci n-2 y n-1)

   ```
2. (★★★) Dada un aula/sala donde se pueden dar charlas. Las charlas tienen horario de inicio y fin. Además, cada charla tiene asociado un valor de ganancia. Implementar un algoritmo que, utilizando programación dinámica, reciba un arreglo que en cada posición tenga una charla representada por una tripla de *inicio, fin y valor* de cada charla, e indique cuáles son las charlas a dar para maximizar la ganancia total obtenida. Indicar y justificar la complejidad del algoritmo implementado.
3. (★) Dada una escalera, y sabiendo que tenemos la capacidad de subir escalones de a 1 o 2 o 3 pasos, encontrar, utilizando programación dinámica, cuántas formas diferentes hay de subir la escalera hasta el paso n. Indicar y justificar la complejidad del algoritmo implementado. Ejemplos: n = 0 –> Debe devolver 1 (no moverse) n = 1 –> Debe devolver 1 (paso de 1) n = 2 –> Debe devolver 2 (dos pasos de 1, o un paso de 2) n = 3 –> Debe devolver 4 (un paso de 3, o tres pasos de 1, o un paso de 2 y uno de 1, o un paso de 1 y un paso de 2) n = 4 –> Debe devolver 7 n = 5 –> Debe devolver 13
4. (★★) Juan es ambicioso pero también algo vago. Dispone de varias ofertas de trabajo diarias, pero no quiere trabajar dos días seguidos. Dado un arreglo con el monto esperado a ganar cada día, determinar, por programación dinámica, el máximo monto a ganar, sabiendo que no aceptará trabajar dos días seguidos. Hacer una reconstrucción para verificar qué días debe trabajar. Indicar y justificar la complejidad del algoritmo implementado.
5. (★) Dado un laberinto representado por una grilla, queremos calcular la ganancia máxima que existe desde la posición `(0,0)` hasta la posición NxM. Los movimientos permitidos son, desde la esquina superior izquierda (el `(0,0)`), nos podemos mover hacia abajo o hacia la derecha. Pasar por un casillero determinado `(i,j)` nos da una ganancia de `Vi,j`. Implementar un algoritmo que, por programación dinámica, obtenga la máxima ganancia a través del laberinto. Hacer una reconstrucción del camino que se debe transitar. Indicar y justificar la complejidad del algoritmo implementado. Si hay algunos lugares por los que no podemos pasar (obstáculos), ¿cómo se debe modificar para resolver el mismo problema?
6. (★★) Dado el teclado numérico de un celular, y un número inicial `k`, encontrar la cantidad de posibles números de longitud `n` empezando por el botón del número inicial `k`. Restricción: solamente se puede presionar un botón si está arriba, abajo, a izquierda, o derecha del botón actual. Implementar el algoritmo por programación dinámica. Indicar y justificar la complejidad del algoritmo implementado. Ejemplos:

   Para n=1 empezando por cualquier dígito, solamente hay un número válido (el correspondiente dígito)

   Para N=2, depende de con cuál dígito se comienza:

   Empezando por 0, son válidos 08 (cantidad: 1)

   Empezando por 1, son válidos 12, 14 (cantidad: 2)

   Empezando por 2, son válidos 21, 23, 25 (cantidad: 3)

   Empezando por 3, son válidos 32, 36 (cantidad: 2)

   Empezando por 4, son válidos 41, 45, 47 (cantidad: 3)

   Empezando por 5, son válidos 52, 54, 56, 58 (cantidad: 4)

   Empezando por 6, son válidos 63, 65, 69 (cantidad: 3)

   Empezando por 7, son válidos 74, 78 (cantidad: 2)

   Empezando por 8, son válidos 80, 85, 87, 89 (cantidad: 4)

   Empezando por 9, son válidos 96, 98 (cantidad: 2)
7. (★★★) Tenemos una mochila con una capacidad W. Hay elementos a guardar, cada uno tiene un valor, y un peso que ocupa de la capacidad total. Queremos maximizar el valor de lo que llevamos sin exceder la capacidad. Implementar un algoritmo que, por programación dinámica, reciba los valores y pesos de los elementos, y devuelva qué elementos deben ser guardados para maximizar la ganancia total. Indicar y justificar la complejidad del algoritmo implementado.
8. (★★) Se tiene un sistema monetario (ejemplo, el nuestro). Se quiere dar “cambio” de una determinada cantidad de plata. Se desea devolver el cambio pedido, usando la mínima cantidad de monedas/billetes. Implementar un algoritmo que, por programación dinámica, reciba un arreglo de valores del sistema monetario, y la cantidad de cambio objetivo a dar, y devuelva qué monedas/billetes deben ser utilizados para minimizar la cantidad total utilizda. Indicar y justificar la complejidad del algoritmo implementado.
9. (★★★) Tenemos un conjunto de números `v1,v2,⋯,vn`, y queremos obtener un subconjunto de todos esos números tal que su suma sea igual o menor a un valor `V`, tratando de aproximarse lo más posible a V. Implementar un algoritmo que, por programación dinámica, reciba un arreglo de valores, y la suma objetivo `V`, y devuelva qué elementos deben ser utilizados para aproximar la suma lo más posible a `V`, sin pasarse. Indicar y justificar la complejidad del algoritmo implementado.
10. (★★★) Manejamos un negocio que atiende clientes en Londres y en California. Nos interesa cada mes decidir si operar en una u otra ciudad. Los costos de operación para cada mes pueden variar y son dados por 2 arreglos: `L` y `C`, con valores para todos los meses hasta `n`. Naturalmente, si en un mes operamos en una ciudad, y al siguiente en una distinta, habrá un costo fijo `M` por la mudanza. Dados los arreglos de costos de operación en Londres (`L`) y California (`C`), indicar la secuencia de las `n` localizaciones en las que operar durante los n meses, sabiendo que queremos minimizar el total de los costos de operación. Se puede empezar en cualquier ciudad. Indicar y justificar la complejidad del algoritmo implementado.
11. (★★) Dado un número **K**, se quiere obtener la mínima cantidad de operaciones para llegar desde 0 a K, siendo que las operaciones posibles son:

    (i) aumentar el valor del operando en 1;

    (ii) duplicar el valor del operando.

    Implementar un algoritmo que, por programación dinámica, obtenga la menor cantidad de operaciones a realizar (y cuáles son dichas operaciones). Desarrollar la ecuación de recurrencia. Indicar y justificar la complejidad del algoritmo implementado. Aclaración: asegurarse de que el algoritmo presentado sea de programación dinámica, con su correspondiente ecuación de recurrencia.
12. (★★★) Carlitos (primo de Juan, el vago) trabaja para una empresa de publicidad. Tiene un determinado presupuesto `P` que no puede sobrepasar, y tiene que una serie de campañas publicitarias para elegir. La campaña i cuesta `$Ci`. También se han realizado diversos estudios que permiten estimar cuánta ganancia nos dará cada campaña, que denominaremos `Gi`. Implementar un algoritmo que reciba esta información y devuelva cuáles campañas debe realizar Carlitos. Indicar y justificar la complejidad del algoritmo propuesto. ¿Da lo mismo si los valores están expresados en pesos argentinos, dólares u otra moneda? Por ejemplo, si una campaña cuesta 100 dólares, para pasar a pesos se debe hacer la conversión de divisa.
13. (★★★) Un bodegón tiene una única mesa larga con **W** lugares. Hay una persona en la puerta que anota los grupos que quieren sentarse a comer, y la *cantidad de integrantes* que conforma a cada uno. Para simplificar su trabajo, se los anota en un vector **P** donde P[i] contiene la cantidad de personas que integran el *grupo i*, siendo en total **n** grupos. Como se trata de un restaurante familiar, las personas sólo se sientan en la mesa si *todos los integrantes de su grupo* pueden sentarse. Implementar un algoritmo que, mediante programación dinámica, obtenga el conjunto de grupos que ocupan la mayor cantidad de espacios en la mesa (o en otras palabras, que dejan la menor cantidad de espacios vacíos). Indicar y justificar la complejidad del algoritmo.
14. (★★★) Somos ayudantes del gran ladrón *el Lunático*, que está pensando en su próximo atraco. Decidió en este caso robar toda una calle en un barrio privado, que tiene la particularidad de ser circular. Gracias a los trabajos de inteligencia realizados, sabemos cuánto se puede obtener por robar en cada casa. Podemos enumerar a la primer casa como la casa 0, de la cual podríamos obtener `g0`, la casa a su derecha es la 1, que nos daría `g1`, y así hasta llegar a la casa `n−1`, que nos daría `gn−1`. Toda casa `i` se considera adyacente a las casas `i−1` e `i+1`. Además, como la calle es circular, la casas 0 y `n−1` también **son vecinas**. El problema con el que cuenta *el Lunático* es que sabe de experiencias anteriores que, si roba en una casa, los vecinos directos se enterarían muy rápido. No le daría tiempo a luego intentar robarles a ellos. Es decir, para robar una casa debe prescindir de robarle a sus vecinos directos. El Lunático nos encarga saber cuáles casas debería atracar y cuál sería la ganancia máxima obtenible. Dado que nosotros nos llevamos un porcentaje de dicha ganancia, vamos a buscar el óptimo a este problema. Implementar un algoritmo que, por **programación dinámica**, obtenga la ganancia óptima, así como cuáles casas habría que robar, a partir de recibir un arreglo de las ganancias obtenibles. Para esto, escribir y describir la ecuación de recurrencia correspondiente. Indicar y justificar la complejidad del algoritmo propuesto.
15. (★★★) Dada una soga de n metros (`n≥2`) implementar un algoritmo que, utilizando programación dinámica, permita cortarla (en partes de largo entero) de manera tal que el producto de los largos de cada una de las partes resultantes sea máximo. El algoritmo debe devolver el valor del producto máximo alcanzable. Tener en cuenta que la soga puede cortarse varias veces, como se muestra en el ejemplo con n = 10. Indicar y justificar la complejidad del algoritmo. Ejemplos:

    n = 2 –> Debe devolver 1 (producto máximo es 1 \* 1)

    n = 3 –> Debe devolver 2 (producto máximo es 2 \* 1)

    n = 4 –> Debe devolver 4 (producto máximo es 2 \* 2)

    n = 5 –> Debe devolver 6 (producto máximo es 2 \* 3)

    n = 6 –> Debe devolver 9 (producto máximo es 3 \* 3)

    n = 10 -> Debe devolver 36 (producto máximo es 3 \* 3 \* 4)
16. (★★★★) Osvaldo es un empleado de una inescrupulosa empresa inmobiliaria, y está buscando un ascenso. Está viendo cómo se predice que evolucionará el precio de un inmueble (el cual no poseen, pero pueden comprar). Tiene la información de estas predicciones en el arreglo `p`, para todo día `i=1,2,...,n`. Osvaldo quiere determinar un día `j` en el cuál comprar la casa, y un día `k` en el cual venderla (`k>j`), suponiendo que eso sucederá sin lugar a dudas. El objetivo, por supuesto, es la de maximizar la ganancia dada por `p[k]−p[j]`.

    Implementar un algoritmo de **programación dinámica** que permita resolver el problema de Osvaldo. Indicar y justificar la complejidad del algoritmo implementado.
17. (★) Se sabe que existe la equivalencia `e=∑i=0∞1n!`, siendo `e` el número de Euler. Sabiendo esto, podemos aproximar el valor de `e` sumando los primeros `n` términos de dicha serie. Un algoritmo trivial puede obtener esto en `O(n2)`. Implementar un algoritmo que, utilizando programación dinámica, permita obtener dicha aproximación en tiempo lineal.



Programación Lineal

Contenidos

Ejercicio resuelto

Ejercicios propuestos

Ejercicio resuelto

Ejercicios propuestos

(★) Implementar un modelo de programación lineal que resuelva el Problema de la Mochila de valor máximo (ejercicio 7 de PD).

(★) Implementar un modelo de programación lineal que resuelva el problema de Juan El Vago (ejercicio 4 de PD).

(★) Implementar un modelo de programación lineal que resuelva el problema de Vertex Cover mínimo (ejercicio 13 de BT).

(★) Implementar un modelo de programación lineal que resuelva el problema de Dominating Set mínimo (ejercicio 14 de BT).

(★) Implementar un modelo de programación lineal que resuelva el problema de 3-SAT mínimo: que encuentre una solución que satisfaga, utlizando la menor cantidad de variables en true posible.

(★★★) Implementar un modelo de programación lineal que resuelva el problema de Independent Set Máximo.

(★★) Implementar un modelo de programación lineal que determine la cantidad mínima de colores a utilizar para poder pintar a un grafo de colores, de tal forma que ningún adyacente comparta color entre sí.

(★★) Implementar un modelo de programación lineal que permita determinar el clique de tamaño máximo dentro de un grafo. Indicar la cantidad de restricciones generadas en función de la cantidad de vértices y aristas (podés usar notación O para esto, no es importante el número exacto).

(★★★) Osvaldo es un empleado de una inescrupulosa empresa inmobiliaria, y está buscando un ascenso. Está viendo cómo se predice que evolucionará el precio de un inmueble (el cual no poseen, pero pueden comprar). Tiene la información de estas predicciones en el arreglo p, para todo día i=1,2,...,n. Osvaldo quiere determinar un día j en el cuál comprar la casa, y un día k en el cual venderla (k>j), suponiendo que eso sucederá sin lugar a dudas. El objetivo, por supuesto, es el de maximizar la ganancia dada por p[k]−p[j].

Implementar un modelo de programación lineal que determine el día de compra y el día de venta del inmueble. Indicar la cantidad de restricciones implementadas para esto.

(★★★★) Dado un arreglo de enteros ordenado, un elemento y un valor entero k, se quiere encontrar los k valores del arreglo más cercanos al elemento en cuestión (que bien podría estar en el arreglo, o no). Realizar un modelo de programación lineal que resuelva este problema. OJO nos interesa que sean cercanos al elemento, y eso se ve con el valor absoluto de la diferencia, y el operador módulo no es un operador lineal. Si se incluye el operador módulo como parte del Modelo, el ejercicio estará Mal. Resolver de tal manera que el modelo sea el que resuelva estas diferencias. Indicar la cantidad de restricciones definidas.

(★★) Se está formando una nueva comisión de actividades culturales de un pueblo. Cada habitante es miembro de 0 o más clubes, y de exactamente 1 partido político. Cada uno de los n clubes debe nombrar a un representante ante la nueva comisión de actividades culturales, con las siguientes restricciones: cada partido político no puede tener más de n2 simpatizantes en la comisión, y además queremos minimizar la cantidad simpatizantes a un mismo partido político; cada persona puede representar a solo un club, cada club debe estar representado por un miembro.

Implementar un modelo de programación lineal que dada la información de los habitantes (a qué clubes son miembros, a qué partido pertenecen), nos permita obtener los representantes válidos, que además minimicen la cantidad de simpatizantes a un mismo partido político. Indicar la cantidad de inecuaciones definidas en el modelo.

(★★) El 2-Partition Problem como problema de optimización se describe tal que: Dado un conjunto de n números positivos T={T1,T2,…,Tn}, se particionan los números en dos subconjuntos S1 y S2 (con intersección vacía y unión = T) de forma de minimizar la sumatoria de cualquiera de los subconjuntos (min⁡max⁡(S1,S2)).

Implementar un modelo de programación lineal que dados los valores de los Ti nos permita obtener la asignación óptima para S1 y S2. Indicar la cantidad de inecuaciones definidas en el modelo.

(★★★) El problema de Bin-Packing es el siguiente: dados n elementos de diferentes pesos pi se quiere ubicar a cada elemento en algún contenedor, donde cada contenedor tiene capacidad máxima M (todos los contenedores tienen la misma capacidad). Suponer que todos los pi son menores o iguales a M.

Implementar un modelo de programación lineal que permita determinar en qué contenedor va cada elemento, de forma de minimizar la cantidad de contenedores utilizados. Considerar que, como máximo, vas a usar n contenedores (es imposible tener que usar más). Indicar la cantidad de inecuaciones definidas.





Redes de Transporte

Contenidos

Ejercicio resuelto

Ejercicios propuestos

Ejercicio resuelto

Solución

Demostración del orden

Ejercicios propuestos

(★) Explicar para cada uno de los siguientes casos, qué modificaciones se deben aplicar sobre una red para convertirla en una red de flujo apta para la utilización del algoritmo de Ford-Fulkerson.

a. En la red existen bucles.

b. En la red hay ciclos de dos vértices (aristas antiparalelas).

c. En la red hay más de una fuente.

d. En la red hay más de un sumidero.

(★★) Implementar el algoritmo de Ford-Fulkerson, asumiendo que ya está implementada una función actualizar_grafo_residual, definida como actualizar_grafo_residual(grafo_residual, u, v, valor), que recibe el grafo residual, una arista dirigida dada por los vértices u y v, y el nuevo valor del flujo a través de la arista (u,v) y actualiza el grafo residual ya teniendo en cuenta el peso anterior de la arista, y su antiparalela. Devolver un diccionario con los valores de los flujos para todas las aristas del grafo original.

(★★) Dada una red y un diccionario que representa los valores de los flujos para las aristas, todos valores que respetan la restricción de cada arista, construir la red residual que refleja el estado actual de la red en función a los valores de flujo dados.

(★) Dada una red residual, dar un algoritmo que encuentre un camino de aumento que minimice el número de aristas utilizadas.

(★★) Dado un flujo máximo de un grafo, implementar un algoritmo que, si se le aumenta en una unidad la capacidad a una artista (por ejemplo, a una arista de capacidad 3 se le aumenta a 4), permita obtener el nuevo flujo máximo en tiempo lineal en vértices y aristas. Indicar y justificar la complejidad del algoritmo implementado.

(★★) Hacer un seguimiento de obtener el flujo máximo en la siguiente red de transporte, realizando las modificaciones previas que fueran necesarias. Luego, definir cuáles son los dos conjuntos del corte mínimo en dicha red.

grafo bf

(★★) Hacer un seguimiento de obtener el flujo máximo en la siguiente red de transporte, realizando las modificaciones previas que fueran necesarias. Luego, definir cuáles son los dos conjuntos del corte mínimo en dicha red.

grafo bf

(★) ¿Cuál es la relación entre el flujo máximo de una red, y un corte mínimo que separe su fuente y sumidero?

(★★) Dado un grafo bipartito no dirigido, un match es un subconjunto de las aristas en el cual para todo vértice v a lo sumo una arista del match incide en v (en el match, tienen grado a lo sumo 1). Decimos que el vértice v está matcheado si hay alguna arista que incida en él (sino, está unmatcheado). El matching máximo es aquel en el que tenemos la mayor cantidad de aristas (matcheamos la mayor cantidad posible). Dar una metodología para encontrar el matching máximo de un grafo, explicando en detalle cómo se modela el problema, cómo se lo resuelve y cómo se consigue el matching máximo. ¿Cuál es el orden temporal de la solución implementada?

(★★) Decimos que dos caminos son disjuntos si no comparten aristas (pueden compartir nodos). Dado un grafo dirigido y dos vértices s y t, encontrar el máximo número de caminos disjuntos s-t en G. Dar una metodología, explicando en detalle cómo se modela el problema, cómo se lo resuelve y cómo se consigue el máximo número de caminos disjuntos. ¿Cuál es el orden temporal de la solución implementada? ¿Cómo resolverías el problema si el grafo fuera no dirigido?

(★★★) Supongamos que tenemos un sistema de una facultad en el que cada alumno puede pedir hasta 10 libros de la biblioteca. La biblioteca tiene 3 copias de cada libro. Cada alumno desea pedir libros diferentes. Implementar un algoritmo que nos permita obtener la forma de asignar libros a alumnos de tal forma que la cantidad de préstamos sea máxima. Dar la metodología, explicando en detalle cómo se modela el problema, cómo se lo resuelve y cómo se consigue la máxima cantidad de préstamos. ¿Cuál es el orden temporal de la solución implementada?

(★★★) Suponer que queremos schedulear cómo los aviones van de un aeropuerto a otro para cumplir sus horarios. Podemos decir que podemos usar un avión para un segmento/vuelo i y luego para otro j si se cumple alguna de las siguientes condiciones: a. El destino de i y el origen de j son el mismo. o b. Podemos agregar un vuelo desde el destino de i al origen de j con tiempo suficiente.

Decimos que el vuelo j es alcanzable desde el vuelo i si es posible usar el avión del vuelo i y después para el vuelo j.
Dados todos los vuelos con origen y destino, y el tiempo que tarda un avión entre cada par de ciudades queremos decidir: ¿Podemos cumplir con los m vuelos usando a lo sumo k aviones? Dar la metodología, explicando en detalle cómo se modela el problema, cómo se lo resuelve y cómo se decide si es posible cumplir con la premisa. ¿Cuál es el orden temporal de la solución implementada?

(★★★) Carlos tiene un problema: sus 5 hijos no se soportan. Esto es a tal punto, que ni siquiera están dispuestos a caminar juntos para ir a la escuela. Incluso más: ¡tampoco quieren pasar por una cuadra por la que haya pasado alguno de sus hermanos! Sólo aceptan pasar por las esquinas, si es que algún otro pasó por allí. Por suerte, tanto la casa como la escuela quedan en esquinas, pero no está seguro si es posible enviar a sus 5 hijos a la misma escuela. No se puede asumir que la ciudad tenga alguna forma en específico, por ejemplo, no hay que asumir que todas las calles sean cuadradas. Utilizando lo visto en la materia, formular este problema y resolverlo. Indicar y justificar la complejidad del algoritmo.

(★★★) Se está formando una nueva comisión de actividades culturales de un pueblo. Cada habitante es miembro de 0 o más clubes, y de exactamente 1 partido político. Cada grupo de interés debe nombrar a un representante ante la nueva comisión de actividades culturales, con las siguientes restricciones: cada partido político no puede tener más de n/2 simpatizantes en la comisión, cada persona puede representar a solo un club, cada club debe estar representado por un miembro. Implementar un algoritmo que dada la información de los habitantes (a qué clubes son miembros, a qué partido pertenecen), nos dé una lista de representantes válidos. Indicar y justificar la complejidad del algoritmo implementado.

(★★★) En un hospital, se tiene un conjunto de médicos y un conjunto de pacientes. Cada médico tiene un horario con franjas horarias disponibles para citas médicas y su área de especialidad, y cada paciente tiene sus franjas horaria disponibles para ir al médico, junto con la información de qué tipo de especialidad requiere. Nuestro objetivo es emparejar médicos con pacientes de manera que se maximice el número total de citas médicas programadas. Se puede asumir que cada visita médica dura una cuota de tiempo fija, y que los pacientes pueden ser a priori atendidos por cualquier médico que coincida con el área de especialidad que requieren. Implementar un algoritmo que resuelva dicho problema de manera eficiente. Indicar y justificar la complejidad del algoritmo implementado.

(★★★) Una red de satélites se construyó para permitir la comunicación entre una nave espacial y la tierra. Ciertos Satélites pueden intercambiar mensajes entre otros (ida y vuelta). Algunos con la tierra, otros con la nave espacial. Contamos con la red y se pide medir su robustez: ¿cuántos satélites (en el peor de los casos) se pueden romper que dejen incomunicada la nave con la tierra? ¿Cuáles? Utilizando redes de flujo, resolver el problema. Indicar y justificar la complejidad del algoritmo implementado. Recordar que esto último debe estar en las variables del problema.

(★★★) Tito trabaja para la mafia. Debe llevar en camiones de caudales el dinero recaudado por la organización a modo de devolver favores a diferentes estaciones de policía. Entre diferentes rutas puede tener que cambiar de camión (para no ser fácilmente detectado), donde cada camión puede tener diferente capacidad. Además, en algunos puntos (escondites de la mafia) puede recoger más dinero.

Tito entonces cuenta con un grafo dirigido con las diferentes rutas, y puntos donde pueda tener que ir cambiando de camión según como cambie de ruta. El grafo es pesado y las aristas tienen como peso la capacidad del camión de caudales a usar por esa ruta. En cada vértice tenemos un punto donde podría (o no) poder recoger dinero o tener que dejar un agradecimiento, lo cual está modelado con un valor $w(v)$ (si es positivo, al pasar por allí podemos recoger dinero, si es negativo es que debemos dejar un agradecimiento, si es 0, es simplemente un punto de cambio de camión y nada más). Tito puede comenzar cada recorrido desde donde desee, si bien tiene sentido ir empezando desde algún escondite. Usando redes de flujo, implementar un algoritmo que reciba dicho grafo y determine si es posible pagar todos los agradecimientos correspondientes. No es necesario indicar cómo serían los recorridos. Indicar y justificar la complejidad del algoritmo implementado. El análisis de la complejidad debe ser completo.









# Reducciones y Clases de Complejidad

## Contenidos

1. [Ejercicio resuelto](https://algoritmos-rw.github.io/tda_bg/material/guias/reducciones/#ejercicio-resuelto)
2. [Ejercicios propuestos](https://algoritmos-rw.github.io/tda_bg/material/guias/reducciones/#ejercicios-propuestos)

## Ejercicio resuelto

[Aquí el ejercicio](https://drive.google.com/file/d/1VwJgSQzViEoLdShlNFu8OZuIN_WBtReg/view?usp=sharing).

## Ejercicios propuestos

1. (★) El problema del Independent Set se define como: dado un grafo no dirigido, obtener el máximo subconjunto de vértices del grafo tal que ningun par de vértices del subconjunto sea adyacente entre si. Dicho conjunto es un Independet Set. Definir el *problema de decisión* del Independent Set. Luego, implementar un verificador polinomial para este problema. ¿Cuál es la complejidad del verificador implementado? Justificar
2. (★) El problema del Vertex Cover se define como: dado un grafo no dirigido, obtener el mínimo subconjunto de vértices del grafo tal que toda arista del grafo tenga al menos uno de sus vértices perteneciendo al subconjunto. Dicho conjunto es un Vertex Cover. Definir el *problema de decisión* del Vertex Cover. Luego, implementar un verificador polinomial para este problema. ¿Cuál es la complejidad del verificador implementado? Justificar
3. (★★) Dados los problemas de decisiones de Independent Set y Vertex Cover, realizar dos reducciones.

   a. Reducir Independent Set a Vertex Cover.

   b. Reducir Vertex Cover a Independent Set.
4. (★★★) El problema de decisión de 3-SAT dice: dadas un número de cláusulas de variables booleanas, cada cláusula consta de la operación OR entre 3 términos, decidir si existe una configuración de las variables booleanas tal que sea posible cumplir todas las cláusulas. El problema de 3-SAT es NP-Completo. Dados los problemas de decisión de Independent Set y 3-SAT, demostrar que Independent Set es NP-Completo. Luego explicar de qué manera, con el trabajo hecho en la guía hasta este ejercicio, se puede afirmar que Vertex Cover es NP-Completo.
5. (★) Para cada uno de los siguientes problemas, implementar un verificador polinomial y justificar su complejidad.

   a. Dado un número por parámetro, si es la solución al problema de búsqueda del máximo en un arreglo.

   b. Dado un arreglo, si es la solución a tener el arreglo ordenado.

   c. Dadas un arreglo de posiciones de reinas, si es la solución de colocar al menos N-reinas en un tablero `NxN`.
6. (★★) Definir el problema de decisión de las N-Reinas. Usar que N-Reinas es un problema NP-Completo para demostrar que Demostrar que Independent Set es un problema NP-Completo.
7. (★★) Definir los problemas de decisión de Independent Set y K-Clique. Hacer una reducción de Independet Set a K-Clique. Dada esta reducción, ¿podemos afirmar que K-Clique es un problema NP-Completo?
8. (★★★) Definir los problemas de decisión de Camino Hamiltoniano y Ciclo Hamiltoniano. Sabiendo que Ciclo Hamiltoniano es NP-Completo, demostrar que Camino Hamiltoniano es NP-Completo.
9. (★★) Definir los problemas de decisión de Grafo Bipartito y 3-Coloreo. Sabiendo que 3-Coloreo es NP-Completo, reducir Grafo Bipartito a 3-Coloreo. ¿Podemos afirmar que Grafo Bipartito es un problema NP-Completo?
10. (★★) Definir los problemas de decisión de Subset Sum y Problema de la Mochila. Sabiendo que Subset Sum es NP-Completo, demostrar que el Problema de la Mochila es NP-Completo.
11. (★) ¿Pertenece el siguiente problema a PSPACE? Dada una lista de enteros positivos `L` y un entero `n` obtener todos los subconjuntos de `L` que suman exactamente `n`.
12. (★) ¿Pertenece el siguiente problema a PSPACE? Dada una lista de enteros positivos `L` y un entero `n` obtener **un** subconjunto de `L` que sume exactamente `n`, o, en caso de no existir, que devuelva el subconjunto de suma máxima sin superar el valor de `n`.
13. (★★) Realizar una reducción polinomial del siguiente problema a otro de los vistos durante la cursada. Ayuda: pensar en alguno de los vistos de programación dinámica. Dada esta reducción, ¿se puede afirmar que este problema es NP-Completo?

    Dado un número n, encontrar la cantidad más económica (con menos términos) de escribirlo como una suma de cuadrados.
14. (★★) En su tiempo libre, Carlitos colecciona figuritas del mundial. Incluso a más de un año de la coronación de gloria, hay mucho entusiasmo por estas. Llegó a coleccionar tantas que ahora se dedica a revenderlas (para sacar unos pesos extra de su trabajo principal como publicista). Tiene tantas figuritas que ya no revende al público directamente, sino a otros revendedores y cadenas de kioscos. En general, cuando le piden, le pide un lote de figuritas “por una cantidad determinada de dinero”. Cada tipo de figurita tiene un valor diferente (es decir, la de Messi no vale lo mismo que la del Bobo Weghorst). Podemos decir que absolutamente todos los tipos de figuritas tienen valores diferentes, todos valores enteros, y que Carlitos cuenta con una cantidad *ridículamente alta* de cada una de ellas. Por un análisis que hizo, sabe que si le piden figuritas por un determinado monto, le conviene dar la menor cantidad de figuritas posibles (siempre cumpliendo con el monto exacto pedido), incluso repitiendo figuritas en caso de ser necesario. El problema de las figuritas de Carlitos dice: dados los valores de los diferentes tipos de figuritas y un monto al que llegar, determinar cuáles figuritas debe dar Carlitos para cumplir exactamente con dicho monto dando la mínima cantidad de figuritas para ello. Asumir todos valores enteros, y que hay figurita de valor 1. Por otro lado, recordemos que el *Problema de SubsetSum* es NP-Completo. **Redefinir** ambos problemas en sus versiones de problema de decisión, y **realizar** una *reducción polinomial* de uno a otro. ¿Podemos con esta reducción afirmar que el problema de Carlitos es NP-Completo?
15. (★★) Se tiene una matriz donde en cada celda hay submarinos, o no, y se quiere poner faros para iluminarlos a todos. El problema es dar la cantidad mínima de faros que se necesitan para que todos los submarinos queden iluminados, siendo que cada faro ilumina su celda y además todas las adyacentes (incluyendo las diagonales), y las directamente adyacentes a estas (es decir, un “radio de 2 celdas”). ¿Se encuentra este problema en NP? ¿Qué problema NP-Completo visto en la cursada es parecido al problema definido? Definir en ambos casos el problema de decisión. ¿qué reducción podríamos hacer? ¿Podemos concluir que este problema es un problema NP-Completo?
16. (★★) El Hitting-Set Problem se define de la siguiente forma: Dado un conjunto de elemento `A` de `n` elementos, `m` subconjuntos `B1,B2,...,Bm` de `A` (`Bi⊆A∀i`), y un número `k`, ¿existe un subconjunto `C⊆A` con `∣C∣≤k` tal que `C` tenga al menos un elemento de cada `Bi` (es decir, `C∩Bi≠∅`)?

    Demostrar que el Hitting-Set Problem es un problema NP-Completo.
17. (★★) En el reino de Gondor ha incrementado enormemente la delincuencia luego de su urbanización. El rey Aragorn no quiere que todo su esfuerzo en construir calles resulte en vano, por lo que quiere poner guardianes a vigilar las calles por las noches. El problema es que cuesta mucho dinero entrenar a dichos guardianes, por lo que quiere reducir al mínimo la cantidad que sean necesarios entrenar. Sabe que cada guardian puede estar vigilando desde una esquina, y desde allí tener visibilidad hasta cualquier otra esquina directa. Necesita determinar la cantidad mínima de guardianes que son necesarios para cubrir todas las calles de su reino. Como primera medida, consulta con el oráculo Discipulus Theoriae Algoritmi (es decir, quien lee esta consigna), para determinar si esto es conseguible en corto tiempo (el oráculo le pregunó algo sobre tiempo polinomial, que Aragorn no entendió y le dijo “si, eso”). Tenemos que explicarle a Aragorn que este pedido no es realizable (y debe armarse de paciencia, o no buscar el mínimo exacto), porque el problema de Guardianes de Gondor es, en realidad, un problema NP-Completo (en su versión de problema de decisión: *“¿Se pueden vigilar todas las calles con esta topología con un máximo de K guardianes?”*).
18. (★★) Definir la relación entre la dificultad entre el problema de obtener el flujo máximo, con el problema de obtener el corte mínimo en una red de transporte. ¿Se puede concluir si alguno de estos problemas es NP-Completo, o que no lo sea? ¿Estos problemas pertenecen a PSPACE? Justificar adecuadamente cada respuesta.
19. (★★★) Un set dominante (Dominating Set) de un grafo G es un subconjunto **D** de vértices de G, tal que para todo vértice de G: o bien (i) *pertenece a D*; o bien (ii) es *adyacente a un vértice en D*. El problema de decisión del set dominante implica, dado un grafo G y un número `k`, determinar si existe un set dominante **D** de a lo sumo tamaño `k`. Demostrar que el Dominating Set Problem es un problema NP-Completo. Ayuda: recomendamos recordar Vertex Cover, que puede ser útil para esto.
20. (★★★★) El problema de elección de caminos (Path Selection) pregunta: dado un grafo dirigido G y un set de pedidos `P1,P2,⋯,Pc` de caminos dentro de dicho grafo y un número `k`, ¿es posible seleccionar al menos `k` de esos caminos tales que ningún par de caminos seleccionados comparta ningún nodo? Demostrar que Path Selection es un problema NP-Completo. Ayuda: este problema tiene mucha semejanza con Independent Set.
21. (★★★) El problema de selección de caminos (Path Selection) pregunta: dado un grafo dirigido G y un set de pedidos P1, P2, …, Pc de caminos dentro de dicho grafo y un número k, ¿es posible seleccionar al menos k de esos caminos tales que ningún par de caminos seleccionados comparta ningún nodo? **Dato**: Path Selection es un problema NP-Completo. Ahora bien, queremos demostrar nuevamente (*pero de otra forma a la vista en clase*) que Independent Set es un problema NP-Completo. Demostrar que Independent Set es un problema NP-Completo, utilizando Path Selection para esto.
22. (★) Mbappé, jugador de la selección francesa, es reconocido tanto por su increíble talento para jugar al fútbol, como su increíble talento para decir boludeces. Una de sus frases ha sido [“La Eurocopa es más difícil que el Mundial”](https://www.pagina12.com.ar/742161-para-kylian-mbappe-es-mas-facil-ganar-la-eurocopa-que-el-mun). Primero, demostrar que su afirmación es falsa. Segundo, Francia.
23. (★★★) El problema de *Separación en R Cliques* (SRC) se enuncia como: Dado un grafo, y un valor entero `R`, ¿se pueden separar todos los vértices del gráfo en a lo sumo `R` cliques? (cada clique puede tener una cantidad diferente de vértices). De una manera más formal, se puede enunciar: ¿existen `S1,S1,...,Sk`, subconjuntos **disjuntos** del conjunto de vértices `V` tal que `⋃iSi=V`, `k≤R`, y que que cada subgrafo correspondiente a los `Si` sea un clique (subgrafo completo)?

    Demostrar que el problema de *Separación en R Cliques* es un problema NP-Completo. Para esto, recomendamos recordar que el problema de coloreo es un problema NP-Completo. También, recomendamos recordar cómo fue que demostramos en clase que K-Clique es un problema NP-Completo (fue con la ayuda de Independent Set).
24. (★★) Podemos definir al problema de *K-ciclo* como: “Dado un grafo y un valor natural `K`, ¿existe un ciclo dentro del grafo de al menos `K` vértices?”.

    Demostrar que el problema de *K-ciclo* es un problema NP-Completo. Para esto, recomendamos utilizar el problema de *ciclo Hamiltoniano*.
25. (★★) La FIFA ha visto la cantidad de dinero que pudo embolsar gracias a partidos nunca antes vistos como “Argentina - Cabo Verde”, “Austria - Jordania”, “Alemania - Curaçao” o “Uzbekistán - Congo”. A partir de ello quiere ver si es posible hacer un torneo de inéditos: una liga entre equipos que nunca hayan jugado entre sí partidos oficiales, ninguno contra ninguno, así pueden jugar todos entre sí. Por ejemplo, Argentina y Noruega nunca jugaron un partido oficial entre sí.

    Podemos enunciar al problema de Recaudación de la FIFA como: “Dado un conjunto de $n$ equipos y la información de qué equipo jugó con cuál otro y cuántas veces (por ejemplo, en un diccionario) y un valor $k$, ¿es posible elegir al menos $k$ equipos que no hayan jugado nunca entre sí para que jueguen un torneo?”





Aproximaciones

Contenidos

Ejercicio resuelto

Solución

Ejercicios propuestos

Ejercicio resuelto

Solución

Ejercicios propuestos

(★★) Dado un grafo en forma de grilla como el dado a continuación, donde cada vértice tiene un peso w(v), se desea maximizar la sumatoria de los pesos de un Independent Set sobre dicho grafo.

a. Dar un algoritmo greedy que sirva de aproximación para la solución al problema.

b. Demostrar que cualquier vértice es parte de la solución aproximada, o bien tiene peso menor (o igual) a alguno de sus adyacentes, que es en efecto parte de dicha solución.

c. Analizar qué tan buena es la aproximación.

d. Analizar qué tan buena es la aproximación en el caso de un grafo que no necesariamente tenga esta forma de grilla.

grafo grilla

(★★★) El 2-Partition Problem como problema de optimización se describe tal que: Dado un conjunto de n números positivos T={T1,T2,…,Tn}, se particionan los números en dos subconjuntos S1 y S2 (con intersección vacía y unión = T) de forma de minimizar la sumatoria de cualquiera de los subconjuntos (min⁡max⁡(S1,S2)).

Para este problema, podemos plantear el siguiente algoritmo aproximado: Inicializar la solución como dos subconjuntos vacíos recorriendo los elementos de T, para cada elemento se lo coloca en el subconjunto con menor sumatoria hasta el momento.

Demostrar que el algoritmo propuesto es una 32-Aproximación.

(★★★) Un centro de fotocopiado tiene un conjunto de máquinas para procesar diferentes trabajos. Las mismas las compró en dos momentos diferentes. Teniendo m fotocopiadoras de la primera compra y k fotocopiadoras más modernas de la segunda. Como la tecnología mejoró las más nuevas trabajan el doble de rápido que las viejas. Cada día recibe un conjunto de pedidos con diferentes longitudes. Desea asignar las tareas a las máquinas de tal forma de terminar lo antes posible la jornada de trabajo.

Proponer un algoritmo de aproximación de tal forma que la diferencia con el óptimo sea como mucho 3 veces mayor.

(★★) Dado un grafo bipartito (no dirigido) donde cada vértice v tiene un valor positivo w(v) asociado, queremos obtener un Vertex Cover de suma mínima. Este problema es NP-Difícil, por lo que aplicaremos el siguiente algoritmo de aproximación:

Inicializaremos resultado=∅ como un conjunto vacío.

Vemos todas las aristas del grafo (sin ningún orden particular). Si la arista está cubierta, es decir, algún vértice de sus extremos está en el conjunto resultado, la ignoramos. Sino, agregamos a resultado al vértice del extremo de la arista cuyo valor sea menor (si son iguales, cualquiera de los dos).

Devolvemos resultado.

¿Podemos considerarla una buena aproximación? Calcular la cota de aproximación para justificar tu respuesta.

(★★★) Recordamos el problema de Interval Scheduling: Dado un conjunto de charlas a dar, con un horario de inicio y fin cada una, determinar la máxima cantidad de charlas a dar de tal forma que no haya solapamiento de horarios entre ninguna de las elegidas (devolver las charlas que logran esto).

En clase, analizamos la siguiente solución, que vimos que no es óptima: ordenar de menor a mayor duración, e ir agregando las tareas en dicho orden en tanto y cuanto no se solape con otra ya incluida.

Demostrar que este algoritmo es una 2-aproximación (es decir, que la cantidad de charlas que incluye es al menos la mitad de la solución óptima).







Algoritmos Randomizados

Contenidos

Ejercicio resuelto

Solución

Ejercicios propuestos

Ejercicio resuelto

Solución

Ejercicios propuestos

(★★) Realizar un seguimiento al operar con una Skip List (inicialmente vacía) para agregar los siguientes elementos: 8, 12, 20, 15, 5, 2, 9, 14. Cuando se necesiten resultados aleatorios, se puede utilizar la siguiente secuencia: 0 1 1 0 0 1 0 1 1 0 0 0 0 1 0 1 1 1 1 0 0 0 0 0 1 1 0 0 1 0 1 1 0. Luego mostrar un seguimiento de las búsquedas de: 18, 9 y 2.

(★★) Explicar detalladamente por qué elegimos un pivote de forma aleatoria para Quicksort. ¿Cuál es la complejidad esperada para el algoritmo? Justificar (no es necesario entrar en demostraciones utilizando probabilidad y estadística, pero esperamos una noción) Sin saber nada de las posiciones que QuickSort va a elegir como pivote, ¿Cómo podría forzar el usuario que el algoritmo demore más tiempo que el esperado?

(★★★) Se tiene una función monedaCargada que devuelve 0 el 60% de las veces, y 1 el 40% de las veces. Implementar una función que utilice la antes mencionada, que devuelva 0 o 1 de forma aleatoria de forma equiprobable (es decir, con probabilidad 50/50). ¿Cuál es la complejidad esperada para el algoritmo? Justificar.

Quiero una pistaSi ejecuto dos veces la función `monedaCargada`, ¿cuál es la probabilidad de que primero salga un 0 y luego un 1? ¿y la de que primero salga 1 y luego un 0?

(★★★) Dado un Grafo, planteamos el siguiente algoritmo de aproximación randomizado para obtener el Independent Set más grande, para el caso de un grafo d-regular (es decir, un grafo en el cual todos los vértices tienen grado exactamente d): Para cada vértice v seleccionar de forma uniformemente aleatoria xv el valor 0 o 1. Seleccionar para el Independent Set únicamente aquellos vértices con el valor 1 que no se conecten mediante aristas con otros vértices que tengan el valor 1.

a. Probar que el set resultante es independiente.

b. Calcula el tamaño esperado del set independiente (en función de n y d).

c. Para el cálculo de xv utilizamos p=12. Determinar si este es el valor mas conveniente o podemos encontrar uno mejor. Si es asi, de la fórmula del valor esperado con esta nueva probabilidad.

(★★★) Se tiene un polígono irregular que sabemos que encaja en un rectángulo de bas B y altura H. Asumir que se cuenta con una función dentro_del_poligono(punto), que retorna True si el punto dado por parámetro esta dentro del polígono, False en caso contrario. Proponer un algoritmo randomizado con el que se pueda estimar el área de esta figura irregular.

grafo bf

(★) Si le preguntamos a ChatGPT o Gemini qué es un algoritmo de tipo Sherwood (otro nombre para Las Vegas), Este nos responde con un texto similar a “The Sherwood algorithm, specifically in the context of binary search, is a randomized approach that introduces randomness to the selection of the middle element during each step. This contrast with the standard binary search algorithm, which always chooses the middle index based on (first + last) / 2. The Sherwood algorithm uses first + rand.randInt(last - first + 1) to introduce randomness. This modification helps to mitigate the worst-case performance of binary search”.

Explicar por qué podemos estar tranquilos y reirnos cuando nos dicen que la IA viene a reemplazar el trabajo de Ingenieros/as informáticos.













Eso son todos los ejercicios de la cátedra.

