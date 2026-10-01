## Elemento Mayoritario por División y Conquista

### 1. Definición Formal del Problema
Dado un arreglo $A = [a_1, a_2, \dots, a_n]$ de $n$ elementos, se define como **elemento mayoritario** a aquel valor $x$ que aparece estrictamente más de $\lfloor n/2 \rfloor$ veces en $A$. Si ningún valor satisface esta condición de frecuencia estricta, el arreglo no posee elemento mayoritario.

---

### 2. Principio del Palomar y Lema de Conquista
**Lema Fundamental**: Si un elemento $x$ es mayoritario en el arreglo global $A[1..n]$, entonces $x$ debe ser necesariamente elemento mayoritario en al menos una de las dos mitades:
$$A_L = A[1..\lfloor n/2 \rfloor] \quad \text{o} \quad A_R = A[\lfloor n/2 \rfloor + 1 .. n]$$

*Demostración por contradicción*:
Supongamos que $x$ no es mayoritario en $A_L$ ni en $A_R$. Sea $n_L = \lfloor n/2 \rfloor$ y $n_R = \lceil n/2 \rceil$.
- En la mitad izquierda, $x$ aparece a lo sumo $\lfloor n_L / 2 \rfloor \le n_L / 2$ veces.
- En la mitad derecha, $x$ aparece a lo sumo $\lfloor n_R / 2 \rfloor \le n_R / 2$ veces.
Sumando ambas apariciones:
$$\text{frecuencia}(x, A) = \text{frecuencia}(x, A_L) + \text{frecuencia}(x, A_R) \le \frac{n_L}{2} + \frac{n_R}{2} = \frac{n}{2}$$
Esto contradice la premisa de que $x$ es mayoritario en $A$ (que exige $> n/2$). Por lo tanto, $x$ debe ser mayoritario en al menos una de las mitades.

---

### 3. Algoritmo y Paso de Combinación
1. **Caso Base**: Si $|A| = 1$, el único elemento es trivialmente el candidato mayoritario de ese subarreglo.
2. **División y Conquista**: Resolver recursivamente para $A_L$ y $A_R$, obteniendo los candidatos $m_L$ y $m_R$ (cada uno puede ser un valor o `None`).
3. **Combinación**:
   - Si $m_L = m_R$, ambos subproblemas concuerdan y ese valor se propaga como candidato.
   - Si difieren, se realiza una verificación en tiempo lineal $O(n)$ contando las apariciones reales de $m_L$ y de $m_R$ en el segmento $A[1..n]$. Si alguno supera estrictamente $n/2$, ese es el mayoritario; en caso contrario, se retorna `None`.

---

### 4. Relación de Recurrencia y Complejidad
En cada nivel de la recursión se resuelven 2 subproblemas de tamaño $n/2$, seguidos por una verificación lineal $O(n)$ de frecuencias:
$$T(n) = 2T(n/2) + O(n)$$

Por el Teorema Maestro (Caso 2, con $a = 2, b = 2, d = 1$ ya que $\log_2 2 = 1$):
$$T(n) = \Theta(n \log n)$$
El espacio auxiliar consumido en la pila de recursión es $O(\log n)$.
*(Nota: Aunque el algoritmo de Boyer-Moore Voting logra $O(n)$ tiempo y $O(1)$ espacio, la versión D&C ilustra con rigor el Principio del Palomar y el paradigma de bifurcación y combinación).*
