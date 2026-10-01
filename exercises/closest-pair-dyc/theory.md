## Par de Puntos Más Cercano (Closest Pair of Points)

### 1. Definición Formal y Modelado
Dado un conjunto $P = \{p_1, p_2, \dots, p_n\}$ de $n \ge 2$ puntos en el plano euclidiano $\mathbb{R}^2$, el objetivo consiste en determinar el par $(p_i, p_j)$ con $i \ne j$ que minimiza la distancia euclidiana:
$$d(p_i, p_j) = \sqrt{(x_i - x_j)^2 + (y_i - y_j)^2}$$

La búsqueda exhaustiva por fuerza bruta compara los $\binom{n}{2} = \frac{n(n-1)}{2}$ pares, requiriendo tiempo $\Theta(n^2)$. Mediante División y Conquista es posible resolver el problema en $O(n \log n)$.

---

### 2. Estrategia de División y Conquista
1. **Preprocesamiento**: Ordenar los puntos según su coordenada $X$ ($P_x$) y según su coordenada $Y$ ($P_y$).
2. **División**: Trazar una recta vertical $L: x = x^*$ que divida a $P$ en dos subconjuntos $Q$ (izquierda) y $R$ (derecha) de tamaño $\lceil n/2 \rceil$ y $\lfloor n/2 \rfloor$.
3. **Conquista**: Resolver recursivamente el problema para $Q$ y $R$, obteniendo las distancias mínimas $\delta_Q$ y $\delta_R$. Sea $\delta = \min(\delta_Q, \delta_R)$.
4. **Combinación**: El par más cercano global o bien está contenido enteramente en $Q$, enteramente en $R$, o bien cruza la recta divisoria $L$. En este último caso, ambos puntos deben encontrarse dentro de una banda vertical de ancho $2\delta$ centrada en $L$:
   $$S = \{p \in P \mid |x_p - x^*| < \delta\}$$

---

### 3. Lema de Esparcimiento (Sparsity Lemma) y Correctitud
**Lema**: Si dos puntos en la banda $S$ se encuentran a distancia menor que $\delta$, sus coordenadas $y$ difieren en menos de $\delta$. Además, en cualquier rectángulo de dimensiones $2\delta \times \delta$ centrado en $L$, pueden residir a lo sumo 8 puntos de $S$ tales que ningún par en la misma mitad esté a distancia $<\delta$.

*Demostración*:
Dividimos el rectángulo $[x^* - \delta, x^* + \delta] \times [y, y + \delta]$ en 8 cuadrados de lado $\delta / 2$ (4 a cada lado de $L$). En cada cuadrado de lado $\delta/2$, la distancia máxima entre dos puntos es la diagonal:
$$\sqrt{(\delta/2)^2 + (\delta/2)^2} = \frac{\delta}{\sqrt{2}} < \delta$$
Por lo tanto, ningún cuadrado puede contener más de un punto de la misma mitad sin violar que $\delta$ es la distancia mínima en cada mitad. En consecuencia, hay a lo sumo 8 puntos en total.

Al ordenar los puntos de la banda $S$ por su coordenada $Y$, cada punto $p \in S$ solo necesita ser comparado con a lo sumo los siguientes 7 puntos en dicho orden. La fase de combinación toma entonces tiempo lineal $O(|S|) = O(n)$.

---

### 4. Relación de Recurrencia y Complejidad
Preservando el ordenamiento en $Y$ durante la división mediante un paso de partición análogo a Merge Sort, la recurrencia es:
$$T(n) = 2T(n/2) + O(n)$$

Por el Teorema Maestro (Caso 2, con $a = 2, b = 2, d = 1$ ya que $2 = 2^1$):
$$T(n) = O(n \log n)$$
La memoria auxiliar es $O(n)$ para mantener los arreglos ordenados durante la combinación.
