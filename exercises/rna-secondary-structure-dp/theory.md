# Estructura Secundaria de ARN (Algoritmo de Nussinov por Intervalos)

## 1. Definición Formal y Planteo Biofísico (Bases Watson-Crick)

Una molécula de ARN es una cadena simple de nucleótidos o bases nitrogenadas $B = b_1 b_2 \dots b_n$, donde cada base pertenece al alfabeto $\{A, C, G, U\}$. En disolución biológica, la cadena se pliega sobre sí misma mediante enlaces de hidrógeno entre bases complementarias.

Una **estructura secundaria** es un conjunto de pares ordenados de bases $M = \{(i, j)\}$ con $1 \le i < j \le n$ que satisface cuatro restricciones biofísicas fundamentales:
1. **Regla de Complementariedad de Watson-Crick**: Cada par $(i, j) \in M$ debe ser un enlace válido: $\{b_i, b_j\} = \{A, U\}$ o $\{b_i, b_j\} = \{C, G\}$.
2. **Monogamia de Enlace**: Cada base $i$ participa a lo sumo en un único par $(i, j) \in M$.
3. **Rigidez Estérica (Bucle Mínimo)**: Para todo $(i, j) \in M$, las bases deben estar separadas por al menos 4 posiciones intermedias: $j - i > 4$ (para permitir la curvatura física de la cadena de azúcares y fosfatos).
4. **Sin Cruces (No-Pseudonudos)**: Si $(i, j) \in M$ y $(k, l) \in M$, no pueden entrelazarse de forma que $i < k < j < l$.

El objetivo consiste en encontrar una estructura secundaria válida $M$ que **maximice el número total de pares de bases** (correspondiente a la conformación de mínima energía libre de Gibbs).

---

## 2. Subestructura Óptima y Programación Dinámica por Intervalos

Definimos $OPT(i, j)$ como el número máximo de pares de bases compatibles que pueden formarse en el subsegmento de bases $b_i b_{i+1} \dots b_j$.

Para calcular $OPT(i, j)$, consideramos el comportamiento de la última base $b_j$:
1. **Caso 1**: La base $b_j$ no forma enlace con ninguna base en el intervalo. En tal caso, el valor óptimo es idéntico al de omitir $b_j$:
   $$OPT(i, j) = OPT(i, j-1)$$
2. **Caso 2**: La base $b_j$ se empareja con alguna base $b_t$ del intervalo ($i \le t < j - 4$).
   Por la restricción de "sin cruces", el par $(t, j)$ divide al intervalo en dos subproblemas completamente independientes y desacoplados:
   - El subintervalo interior $b_{t+1} \dots b_{j-1}$, que puede albergar a lo sumo $OPT(t+1, j-1)$ pares.
   - El subintervalo exterior izquierdo $b_i \dots b_{t-1}$, que puede albergar a lo sumo $OPT(i, t-1)$ pares.
   Sumando el par $(t, j)$ recién formado, la contribución total es:
   $$1 + OPT(i, t-1) + OPT(t+1, j-1)$$

---

## 3. Ecuación de Recurrencia de Bellman y Demostración de Optimalidad

Combinando ambas alternativas y buscando sobre todos los posibles compañeros de enlace válidos $t$:
$$OPT(i, j) = \max \left( OPT(i, j-1), \max_{\substack{i \le t < j - 4 \\ \{b_t, b_j\} \text{ válido}}} \{1 + OPT(i, t-1) + OPT(t+1, j-1)\} \right)$$

### Casos Base
Para todo intervalo de longitud $\le 5$ (es decir, $j - i \le 4$), la restricción de curvatura impide enlaces:
$$OPT(i, j) = 0 \quad \text{si } j - i \le 4$$

---

## 4. Orden de Evaluación Diagonal y Complejidad Asintótica ($O(n^3)$)

- **Orden de Cálculo**: Para que las subestructuras estén disponibles al evaluar $OPT(i, j)$, la tabla se llena en orden creciente de la **longitud del intervalo** $k = j - i$ desde $k = 5$ hasta $n - 1$.
- **Complejidad Temporal**: Existen $O(n^2)$ intervalos posibles $(i, j)$. Para cada intervalo, la búsqueda del punto de partición $t$ toma $O(n)$ comparaciones. Por lo tanto, la complejidad temporal total es $O(n^3)$.
- **Complejidad Espacial**: $O(n^2)$ para almacenar la matriz triangular superior de programación dinámica.
- **Reconstrucción**: Mediante punteros o inspección de las opciones que alcanzaron el máximo, la conformación óptima de pares de ARN se recupera en tiempo $O(n)$.

---

## 5. Trampa de la Intuición Greedy y Aplicaciones en Biología Computacional

### Por Qué Falla una Selección Voraz de Pares
Una estrategia greedy que empareja inmediatamente las primeras bases complementarias contiguas puede bloquear la formación de pares anidados de largo alcance más estables, resultando en un plegamiento con mucha menor cantidad de enlaces. La programación dinámica por intervalos explora el compromiso global óptimo de todas las configuraciones no cruzadas posibles.
- **Aplicaciones**: Predicción de plegamiento de ARN ribosomal (rRNA), ARN de transferencia (tRNA) y diseño de micro-ARNs en bioinformática.
