# Simulación de Moneda Equilibrada con Moneda Cargada (Algoritmo de Von Neumann)

## 1. Planteo del Problema

Se dispone de una función o dispositivo físico `moneda_cargada()` que produce bits aleatorios independientes según una distribución de Bernoulli con probabilidad desconocida $p \in (0, 1)$:
$$P(X = 1) = p, \quad P(X = 0) = 1 - p \quad (p \ne 0.5)$$
Por ejemplo, la función devuelve $0$ el $60\%$ de las veces ($1-p = 0.6$) y $1$ el $40\%$ de las veces ($p = 0.4$).

### Objetivo
Diseñar una función `moneda_equilibrada()` que produzca bits $0$ y $1$ con **probabilidad exactamente igual** ($50\%$ cada uno), utilizando únicamente llamadas a `moneda_cargada()`, sin requerir conocer el valor exacto de $p$.

---

## 2. El Algoritmo de John von Neumann (1951)

En 1951, en su célebre artículo *"Various techniques used in connection with random digits"*, John von Neumann propuso la siguiente solución:

Lanzar la moneda cargada en **pares ordenados** de tiradas independientes $(T_1, T_2)$:

| Par $(T_1, T_2)$ | Probabilidad teórica | Acción del algoritmo |
|:---:|:---:|:---:|
| **$(0, 1)$** | $(1 - p) \cdot p$ | **Emitir $0$** y terminar |
| **$(1, 0)$** | $p \cdot (1 - p)$ | **Emitir $1$** y terminar |
| **$(0, 0)$** | $(1 - p)^2$ | Descartar y repetir ronda |
| **$(1, 1)$** | $p^2$ | Descartar y repetir ronda |

### Demostración Formal de Corrección
Por la **propiedad conmutativa del producto real**:
$$(1 - p) \cdot p = p \cdot (1 - p)$$

Dado que el algoritmo solo se detiene cuando ocurre el evento $(0, 1)$ o el evento $(1, 0)$, la probabilidad condicional de emitir $0$ dado que el algoritmo finalizó en esa ronda es:
$$P(\text{Salida} = 0 \mid \text{Fin}) = \frac{P(0, 1)}{P(0, 1) + P(1, 0)} = \frac{p(1-p)}{p(1-p) + p(1-p)} = \frac{p(1-p)}{2p(1-p)} = \frac{1}{2}$$

De manera idéntica:
$$P(\text{Salida} = 1 \mid \text{Fin}) = \frac{p(1-p)}{2p(1-p)} = \frac{1}{2}$$

**Conclusión**: La salida es matemáticamente justa e imparcial ($50\% - 50\%$), **independientemente del valor del sesgo $p$** (siempre que $0 < p < 1$).

---

## 3. Análisis de Complejidad Temporal Esperada

Este es un algoritmo de la clase **Las Vegas**: su salida es siempre 100% correcta, y su tiempo de ejecución es una variable aleatoria.

1. La probabilidad de éxito en cualquier ronda de 2 lanzamientos es:
   $$P_{\text{éxito}} = 2p(1 - p)$$
2. Como cada ronda es independiente, la cantidad de rondas $R$ hasta el primer éxito sigue una **Distribución Geométrica** con parámetro $\theta = 2p(1 - p)$.
3. La esperanza matemática del número de rondas es:
   $$\mathbb{E}[R] = \frac{1}{\theta} = \frac{1}{2p(1 - p)}$$
4. Como cada ronda realiza exactamente $2$ lanzamientos de la moneda sesgada, el número esperado total de lanzamientos $\mathbb{E}[T]$ es:
   $$\mathbb{E}[T] = 2 \cdot \mathbb{E}[R] = \frac{2}{2p(1 - p)} = \frac{1}{p(1 - p)} = O(1)$$

### Ejemplo Numérico ($p = 0.4$)
$$\mathbb{E}[T] = \frac{1}{0.4 \cdot 0.6} = \frac{1}{0.24} \approx 4.167 \text{ lanzamientos}$$
En promedio se requieren apenas $\approx 4$ tiros para producir un bit perfectamente no sesgado.

---

## 4. Tipos de Algoritmos Randomizados

- **Las Vegas**: Siempre produce el resultado correcto; el tiempo de ejecución es probabilístico pero con tiempo esperado finito (e.g. Von Neumann Fair Coin, Randomized Quicksort).
- **Monte Carlo**: Tiempo de ejecución estrictamente acotado; existe una probabilidad de error $\epsilon$ que puede reducirse exponencialmente mediante repeticiones independientes (e.g. Test de primalidad Miller-Rabin).

---

## 5. Trampa de la Intuición Ingenua: Estimación Empírica del Sesgo

### Por Qué la Estimación por Frecuencias Falla
Una propuesta habitual e intuitiva consiste en lanzar la moneda un gran número de veces $N$ para estimar $\hat{p} = \text{conteo}/N$ y luego intentar corregir la salida usando un umbral. Sin embargo, cualquier estimación empírica finita tiene varianza estadística y error de muestreo, por lo que la moneda resultante conservará un sesgo residual no nulo. El truco de Von Neumann es conceptualmente superior: utiliza la **simetría estocástica** de los pares ordenados $(0, 1)$ y $(1, 0)$ para cancelar el sesgo algebraicamente sin necesidad de conocer, estimar o aproximar $p$.
