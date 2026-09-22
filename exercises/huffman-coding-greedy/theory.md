# Codificación de Huffman — Teoría y Fundamentos

## 1. El Problema de Compresión y Códigos Libres de Prefijo

En telecomunicaciones y almacenamiento de datos, deseamos representar un texto sobre un alfabeto $C$ de $k$ caracteres utilizando la menor cantidad posible de bits.

- **Código de Longitud Fija** (ej. ASCII de 8 bits): cada símbolo ocupa $\lceil \log_2 k \rceil$ bits sin importar su frecuencia. Si el texto tiene $10^6$ letras y la letra 'E' aparece $300\,000$ veces y la 'Z' solo $500$ veces, ambas consumen el mismo espacio.
- **Código de Longitud Variable**: asigna códigos binarios más cortos a caracteres frecuentes y más largos a caracteres infrecuentes.

### Propiedad Libre de Prefijo (Prefix-Free Code)
Para decodificar un flujo continuo de bits de izquierda a derecha sin ambigüedad y sin separadores, **ningún código binario puede ser prefijo de otro**.
Por ejemplo:
- Si `'A' \to '0'` y `'B' \to '01'`, al leer `'01'`, no sabemos si es `"A..."` o `"B"`.
- En un código libre de prefijo, cada código corresponde a una **hoja** de un árbol binario.

---

## 2. Función de Costo Ponderado del Árbol

Sea $T$ un árbol binario completo donde cada hoja $c \in C$ tiene una frecuencia $f(c)$ y una profundidad $d_T(c)$ (longitud de su código binario). El costo total en bits del mensaje comprimido es:
$$B(T) = \sum_{c \in C} f(c) \cdot d_T(c)$$

El objetivo es hallar un árbol binario $T$ que **minimice $B(T)$**.

---

## 3. Estrategia Greedy de David Huffman (1952)

En lugar de construir el árbol de arriba hacia abajo (Top-Down, como Shannon-Fano), Huffman construye el árbol **de abajo hacia arriba (Bottom-Up)**:

1. Insertar cada símbolo $c$ como un nodo hoja en una **cola de prioridad de mínimos (Min-Heap)** con prioridad $f(c)$.
2. Mientras queden más de un nodo en el heap:
   - Extraer los dos nodos de menor frecuencia $x$ e $y$.
   - Crear un nuevo nodo padre $z$ con hijos $x$ (rama '0') e $y$ (rama '1'), y frecuencia $f(z) = f(x) + f(y)$.
   - Reinsertar $z$ en el Min-Heap.
3. El único nodo restante en el heap es la **raíz** del árbol óptimo de Huffman.

---

## 4. Demostración de Correctitud (Argumento de Intercambio / Cut-and-Paste)

### Lema 1 (Propiedad de Elección Voraz — CLRS 16.3 / K&T 4.8)
*Sean $x$ e $y$ dos símbolos con las frecuencias más bajas en $C$. Existe un árbol de prefijo óptimo para $C$ en el cual $x$ e $y$ son hermanos en el nivel más profundo.*

**Demostración**:
Sea $T$ un árbol óptimo cualquiera, y sean $a$ y $b$ dos hermanos en la profundidad máxima de $T$. Asumamos sin pérdida de generalidad que $f(x) \le f(y)$ y $f(a) \le f(b)$. Como $x$ e $y$ tienen las frecuencias mínimas globales:
$$f(x) \le f(a) \quad \text{y} \quad f(y) \le f(b)$$

Intercambiemos las posiciones de $x$ con $a$ para obtener $T'$, y luego $y$ con $b$ para obtener $T''$.
La diferencia de costo entre $T$ y $T'$ es:
$$B(T) - B(T') = f(a) d_T(a) + f(x) d_T(x) - f(a) d_{T'}(a) - f(x) d_{T'}(x)$$
$$= (f(a) - f(x))(d_T(a) - d_T(x)) \ge 0$$
dado que $f(a) \ge f(x)$ y $d_T(a) \ge d_T(x)$ (por ser $a$ de profundidad máxima).

Como $T$ era óptimo, $B(T') \le B(T)$ implica que $T'$ es también un árbol óptimo. El mismo argumento para $y$ y $b$ produce $T''$, donde $x$ e $y$ son hermanos en la máxima profundidad, manteniendo la optimalidad.

### Lema 2 (Subestructura Óptima)
Reemplazar $x$ e $y$ por un único símbolo $z$ con $f(z) = f(x) + f(y)$ produce un subproblema con $k - 1$ símbolos. La suma ponderada se preserva exactamente:
$$B(T) = B(T') + f(x) + f(y)$$
Cualquier solución óptima para $C'$ se extiende directamente a una solución óptima para $C$.

---

## 5. Análisis de Complejidad

- **Tiempo**:
  - Inicializar el heap con $k$ caracteres: $O(k)$.
  - Realizar $k - 1$ iteraciones, cada una con dos `heappop` y un `heappush`: $(k - 1) \times O(\log k) = O(k \log k)$.
  - Recorrido en profundidad (DFS) para extraer códigos: $O(k)$.
  - **Total**: $\Theta(k \log k)$.
- **Espacio**: $O(k)$ nodos en el árbol y tabla de códigos hash.
