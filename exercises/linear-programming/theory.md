# Programación Lineal y Programación Lineal Entera (LP / ILP)

## 1. Fundamentos Matemáticos

Un **Problema de Programación Lineal (LP)** consiste en optimizar una función objetivo lineal sujeta a un conjunto finito de restricciones dadas por desigualdades e igualdades lineales:

$$\begin{aligned}
\text{Maximizar (o Minimizar)} \quad & z = \mathbf{c}^T \mathbf{x} = \sum_{j=1}^n c_j x_j \\
\text{Sujeto a} \quad & A \mathbf{x} \le \mathbf{b} \\
& \mathbf{x} \ge \mathbf{0}
\end{aligned}$$

Donde:
- $\mathbf{x} \in \mathbb{R}^n$ es el vector de variables de decisión.
- $\mathbf{c} \in \mathbb{R}^n$ es el vector de coeficientes de la función objetivo (dirección del gradiente).
- $A \in \mathbb{R}^{m \times n}$ y $\mathbf{b} \in \mathbb{R}^m$ definen el sistema de restricciones lineales.

---

## 2. Geometría de la Región Factible

1. **Hiperplanos y Semiespacios**: Cada restricción lineal $a_1 x_1 + a_2 x_2 \le b$ divide el espacio afín en dos semiespacios cerrados.
2. **Polítopo Convexo**: La región factible $\mathcal{F} = \{\mathbf{x} \in \mathbb{R}^n : A \mathbf{x} \le \mathbf{b}, \mathbf{x} \ge \mathbf{0}\}$ es la intersección de un número finito de semiespacios convexos; por ende, $\mathcal{F}$ es siempre un **conjunto convexo**.
3. **Curvas de Nivel (Líneas de Iso-costo / Iso-beneficio)**: La función objetivo $z = \mathbf{c}^T \mathbf{x}$ genera hiperplanos paralelos ortogonales al vector gradiente $\mathbf{c}$. Maximizar $z$ equivale a desplazar la recta en la dirección de $\mathbf{c}$ hasta el punto más lejano que aún intersecte $\mathcal{F}$.
4. **Teorema Fundamental de la Programación Lineal**:
   Si un problema lineal tiene solución óptima finita, entonces existe al menos un **vértice extremo** (solución básica factible) de la región factible que es óptimo.
   Por esta razón, el **Algoritmo Simplex** se desplaza de vértice en vértice a lo largo de aristas adyacentes mejorando monótonamente la función objetivo.

---

## 3. Programación Lineal Entera (ILP) y Relajación Lineal

Cuando las variables de decisión deben tomar valores discretos o binarios ($\mathbf{x} \in \{0, 1\}^n$ o $\mathbf{x} \in \mathbb{Z}^n$), el problema se denomina **Programación Lineal Entera (ILP)**.
- El problema general de ILP es **NP-difícil**.
- La **Relajación Lineal (LP Relaxation)** consiste en sustituir la restricción entera $x_i \in \{0, 1\}$ por la restricción continua $0 \le x_i \le 1$.
- Resolver la relajación continua toma tiempo polinomial (Kachiyan, Karmarkar, o Simplex práctico) y provee una **cota superior** (para maximización) sobre el valor óptimo entero.
- La diferencia entre el óptimo relajado continuo $z_{\text{LP}}^*$ y el óptimo entero $z_{\text{ILP}}^*$ se conoce como **Integrality Gap**.

---

## 4. Modelado Canónico de Problemas Clásicos de TDA

### Juan el Vago como ILP
- **Variables**: $x_i \in \{0, 1\}$ para $i = 0, \dots, n-1$ ($x_i = 1$ si trabaja el día $i$).
- **Función Objetivo**: $\max \sum_{i=0}^{n-1} g_i x_i$.
- **Restricciones**: $x_i + x_{i+1} \le 1$ para todo $i \in \{0, \dots, n-2\}$ (nunca dos días consecutivos).

### Mochila 0/1 como ILP
- **Variables**: $x_i \in \{0, 1\}$ para $i = 0, \dots, n-1$ ($x_i = 1$ si se incluye el elemento $i$).
- **Función Objetivo**: $\max \sum_{i=0}^{n-1} v_i x_i$.
- **Restricciones**: $\sum_{i=0}^{n-1} w_i x_i \le W$.

### Vertex Cover Mínimo como ILP
- **Variables**: $x_v \in \{0, 1\}$ para cada vértice $v \in V$ ($x_v = 1$ si $v \in C$).
- **Función Objetivo**: $\min \sum_{v \in V} x_v$.
- **Restricciones**: $x_u + x_v \ge 1$ para cada arista $(u, v) \in E$ (toda arista debe estar cubierta por al menos un extremo).

---

## 5. Trampa del Redondeo Ingenuo y Dualidad

### Por Qué el Redondeo Simple Falla
Resolver la relajación lineal continua produce coordenadas fraccionarias óptimas en tiempo polinomial. Una tentación ingenua es simplemente redondear cada variable al entero más cercano ($x_i \ge 0.5 \to 1$). Sin embargo, esto puede violar restricciones críticas volviendo la solución infactible, o producir una solución extremadamente subóptima. En el peor caso, la brecha de integralidad (*Integrality Gap*) puede ser arbitrariamente grande, lo que justifica la necesidad de algoritmos de Branch & Bound, planos de corte de Gomory o algoritmos de aproximación fundamentados en dualidad lineal.
