import React, { useState, useEffect } from 'react';
import { registry } from '../engine/registry';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseView } from '../components/ExerciseView';
import { NQueensVisualizer } from '../components/visualizers/NQueensVisualizer';
import { NQueensPlayground } from '../components/visualizers/NQueensPlayground';
import { IntervalSchedulingVisualizer } from '../components/visualizers/IntervalSchedulingVisualizer';
import { IntervalSchedulingPlayground } from '../components/visualizers/IntervalSchedulingPlayground';
import { KnapsackDpVisualizer } from '../components/visualizers/KnapsackDpVisualizer';
import { KnapsackPlayground } from '../components/visualizers/KnapsackPlayground';
import { JuanElVagoVisualizer } from '../components/visualizers/JuanElVagoVisualizer';
import { JuanElVagoPlayground } from '../components/visualizers/JuanElVagoPlayground';
import { KnapsackGreedyVisualizer } from '../components/visualizers/KnapsackGreedyVisualizer';
import { MergeSortVisualizer } from '../components/visualizers/MergeSortVisualizer';
import { MaxSubarrayVisualizer } from '../components/visualizers/MaxSubarrayVisualizer';
import { MaxSubarrayPlayground } from '../components/visualizers/MaxSubarrayPlayground';
import { MaxFlowVisualizer } from '../components/visualizers/MaxFlowVisualizer';
import { LinearProgrammingVisualizer } from '../components/visualizers/LinearProgrammingVisualizer';
import { LinearProgrammingPlayground } from '../components/visualizers/LinearProgrammingPlayground';
import { ReductionIsVcVisualizer } from '../components/visualizers/ReductionIsVcVisualizer';
import { ReductionIsVcPlayground } from '../components/visualizers/ReductionIsVcPlayground';
import { VertexCoverApproxVisualizer } from '../components/visualizers/VertexCoverApproxVisualizer';
import { VertexCoverApproxPlayground } from '../components/visualizers/VertexCoverApproxPlayground';
import { RandomizedFairCoinVisualizer } from '../components/visualizers/RandomizedFairCoinVisualizer';
import { RandomizedFairCoinPlayground } from '../components/visualizers/RandomizedFairCoinPlayground';
import { RoadAntennasVisualizer } from '../components/visualizers/RoadAntennasVisualizer';
import { RoadAntennasPlayground } from '../components/visualizers/RoadAntennasPlayground';
import { SubsetSumVisualizer } from '../components/visualizers/SubsetSumVisualizer';
import { SubsetSumPlayground } from '../components/visualizers/SubsetSumPlayground';
import { CoinChangeVisualizer } from '../components/visualizers/CoinChangeVisualizer';
import { CoinChangePlayground } from '../components/visualizers/CoinChangePlayground';
import { PeakFindingVisualizer } from '../components/visualizers/PeakFindingVisualizer';
import { PeakFindingPlayground } from '../components/visualizers/PeakFindingPlayground';
import { LcsVisualizer } from '../components/visualizers/LcsVisualizer';
import { LcsPlayground } from '../components/visualizers/LcsPlayground';
import { WeightedIntervalVisualizer } from '../components/visualizers/WeightedIntervalVisualizer';
import { WeightedIntervalPlayground } from '../components/visualizers/WeightedIntervalPlayground';
import { InversionCountingVisualizer } from '../components/visualizers/InversionCountingVisualizer';
import { InversionCountingPlayground } from '../components/visualizers/InversionCountingPlayground';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import './App.css';

export type ThemeMode = 'system' | 'light' | 'dark';

// N-Queens Content
const N_QUEENS_CANONICAL_PYTHON = `def resolver_n_reinas(n: int) -> list[list[int]]:
    soluciones = []
    tablero = [-1] * n
    columnas = set()
    diag_prin = set()  # fila - col
    diag_sec = set()   # fila + col

    def backtrack(fila: int) -> None:
        if fila == n:
            soluciones.append(list(tablero))
            return

        for col in range(n):
            if col in columnas or (fila - col) in diag_prin or (fila + col) in diag_sec:
                continue  # PODA temprana

            tablero[fila] = col
            columnas.add(col)
            diag_prin.add(fila - col)
            diag_sec.add(fila + col)

            backtrack(fila + 1)

            tablero[fila] = -1
            columnas.remove(col)
            diag_prin.remove(fila - col)
            diag_sec.remove(fila + col)

    backtrack(0)
    return soluciones`;

const N_QUEENS_PSEUDOCODE = `ALGORITMO ResolverNReinas(n):
    soluciones ← []
    tablero ← [-1] * n
    columnas, diagPrin, diagSec ← conjuntos vacíos

    PROCEDIMIENTO Backtrack(fila):
        SI fila = n:
            soluciones.Agregar(CopiaDe(tablero))
            RETORNAR

        PARA col DESDE 0 HASTA n - 1:
            SI col EN columnas O (fila - col) EN diagPrin O (fila + col) EN diagSec:
                CONTINUAR  // Poda de rama inviable

            ColocarReina(fila, col)
            Backtrack(fila + 1)
            DeshacerReina(fila, col)  // Backtracking

    Backtrack(0)
    RETORNAR soluciones`;

const N_QUEENS_CORRECTNESS = `El algoritmo mantiene como invariante que, al ingresar a la llamada recursiva para la fila k, todas las k reinas colocadas en las filas 0..k-1 no se atacan entre sí. En cada paso, se evalúan únicamente casillas que preservan el invariante (poda de ramas inválidas). Dado que el árbol es finito y la profundidad está acotada por N, la inducción sobre las filas demuestra que toda solución alcanzada en fila=N es válida y que la búsqueda exhaustiva no omite ninguna configuración admisible.`;

// Interval Scheduling Content
const INTERVALS_CANONICAL_PYTHON = `def seleccion_intervalos(intervalos: list[tuple[int, int]]) -> list[tuple[int, int]]:
    # 1. Ordenar por tiempo de finalización (earliest finish time)
    ordenados = sorted(intervalos, key=lambda x: x[1])

    seleccionados = []
    ultimo_fin = -float('inf')

    # 2. Selección voraz (Greedy choice)
    for inicio, fin in ordenados:
        if inicio >= ultimo_fin:
            seleccionados.append((inicio, fin))
            ultimo_fin = fin

    return seleccionados`;

const INTERVALS_PSEUDOCODE = `ALGORITMO SeleccionIntervalos(I):
    I_ordenados ← OrdenarPorTiempoDeFin(I)
    S ← []
    ultimoFin ← -Infinito

    PARA CADA (inicio, fin) EN I_ordenados:
        SI inicio >= ultimoFin:
            S.Agregar((inicio, fin))
            ultimoFin ← fin

    RETORNAR S`;

const INTERVALS_CORRECTNESS = `Demostración por el lema 'Greedy Stays Ahead' (Greedy se mantiene adelante): Sean A = {a_1, ..., a_k} la solución voraz y O = {o_1, ..., o_m} una solución óptima cualquiera. Por inducción sobre r, se demuestra que fin(a_r) <= fin(o_r) para todo r <= k. Dado que el intervalo voraz termina siempre antes o igual que el intervalo óptimo correspondiente, deja tanto o más tiempo libre para el resto de las tareas, impidiendo que el óptimo pueda contener un elemento adicional (m > k). Por ende, k = m y la selección voraz es estrictamente óptima.`;

// Knapsack DP Content
const KNAPSACK_DP_CANONICAL_PYTHON = `def mochila_dp(items, capacidad):
    n = len(items)
    dp = [[0] * (capacidad + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        peso, valor = items[i - 1].peso, items[i - 1].valor
        for w in range(capacidad + 1):
            if peso <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - peso] + valor)
            else:
                dp[i][w] = dp[i - 1][w]

    # Reconstrucción de items
    seleccionados = []
    w_restante = capacidad
    for i in range(n, 0, -1):
        if dp[i][w_restante] != dp[i - 1][w_restante]:
            seleccionados.append(items[i - 1])
            w_restante -= items[i - 1].peso

    seleccionados.reverse()
    return dp[n][capacidad], seleccionados`;

const KNAPSACK_DP_PSEUDOCODE = `ALGORITMO Mochila01_DP(items, W):
    n ← Longitud(items)
    Crear tabla DP[(n + 1)][(W + 1)] en 0

    PARA i DESDE 1 HASTA n:
        PARA w DESDE 0 HASTA W:
            SI items[i - 1].peso <= w:
                DP[i][w] ← MAX(DP[i - 1][w], DP[i - 1][w - items[i - 1].peso] + items[i - 1].valor)
            SINO:
                DP[i][w] ← DP[i - 1][w]

    RETORNAR DP[n][W] y ReconstruirSolucion(DP, items, W)`;

const KNAPSACK_DP_CORRECTNESS = `Principio de Optimalidad de Bellman: Sea S* la solución óptima para los primeros i elementos y capacidad w. Para el elemento i, solo existen dos alternativas exhaustivas: o bien i no pertenece a S* (en cuyo caso S* debe ser óptimo para i-1 elementos y capacidad w), o bien i sí pertenece a S* (en cuyo caso S* \\ {i} debe ser óptimo para i-1 elementos con capacidad w - w_i). Cualquier desviación subóptima en los subproblemas contradiría la optimalidad de S* por el argumento clásico 'cut-and-paste'. Por inducción sobre las filas de la tabla, DP[n][W] contiene el óptimo global.`;

// Juan el Vago (1D DP) Content
const JUAN_EL_VAGO_CANONICAL_PYTHON = `def juan_el_vago(ganancias: list[int]) -> tuple[int, list[int]]:
    n = len(ganancias)
    if n == 0: return 0, []
    if n == 1: return ganancias[0], [0]

    dp = [0] * n
    dp[0] = ganancias[0]
    dp[1] = max(ganancias[0], ganancias[1])

    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + ganancias[i])

    # Reconstrucción
    dias = []
    i = n - 1
    while i >= 0:
        if i == 0:
            dias.append(0); break
        elif i == 1:
            dias.append(1 if dp[1] == ganancias[1] else 0); break
        else:
            if dp[i] == dp[i - 1]:
                i -= 1
            else:
                dias.append(i)
                i -= 2

    dias.reverse()
    return dp[n - 1], dias`;

const JUAN_EL_VAGO_PSEUDOCODE = `ALGORITMO JuanElVago(G):
    n ← longitud(G)
    SI n == 0: RETORNAR (0, [])
    SI n == 1: RETORNAR (G[0], [0])

    DP[0] ← G[0]
    DP[1] ← MAX(G[0], G[1])

    PARA i DESDE 2 HASTA n - 1:
        DP[i] ← MAX(DP[i - 1], DP[i - 2] + G[i])

    dias ← ReconstruirDias(DP, G, n - 1)
    RETORNAR (DP[n - 1], dias)`;

const JUAN_EL_VAGO_CORRECTNESS = `Subestructura Óptima: Consideremos el subconjunto óptimo S* de días trabajados hasta el día i. Si el día i no pertenece a S*, S* debe ser óptimo para los primeros i-1 días (DP[i-1]). Si el día i pertenece a S*, por la restricción de no trabajar días consecutivos, el día i-1 no puede pertenecer a S*, por lo que S* \\ {i} debe ser óptimo para los primeros i-2 días (DP[i-2] + G[i]).
Cualquier otra elección menor violaría la optimalidad por contradicción (cut-and-paste).
La tabla 1D se computa en tiempo lineal O(n) y la reconstrucción recorre hacia atrás a lo sumo n pasos O(n).`;

// Knapsack Greedy Content
const KNAPSACK_GREEDY_CANONICAL_PYTHON = `def mochila_fraccionaria_greedy(items, capacidad):
    # 1. Ordenar decrecientemente por densidad (valor / peso)
    ordenados = sorted(items, key=lambda it: it.valor / it.peso, reverse=True)

    valor_total = 0.0
    cap_restante = capacidad
    asignaciones = []

    for it in ordenados:
        if cap_restante <= 0:
            break
        if it.peso <= cap_restante:
            asignaciones.append((it, 1.0))
            valor_total += it.valor
            cap_restante -= it.peso
        else:
            fraccion = cap_restante / it.peso
            asignaciones.append((it, fraccion))
            valor_total += it.valor * fraccion
            cap_restante = 0

    return valor_total, asignaciones`;

const KNAPSACK_GREEDY_PSEUDOCODE = `ALGORITMO MochilaFraccionaria_Greedy(items, W):
    OrdenarPorDensidadDecreciente(items, clave = valor / peso)
    valor_total ← 0, cap_restante ← W, asignaciones ← []

    PARA CADA it EN items:
        SI cap_restante <= 0: ROMPER
        SI it.peso <= cap_restante:
            asignaciones.Agregar(it, fraccion = 1.0)
            valor_total ← valor_total + it.valor
            cap_restante ← cap_restante - it.peso
        SINO:
            fraccion ← cap_restante / it.peso
            asignaciones.Agregar(it, fraccion)
            valor_total ← valor_total + it.valor * fraccion
            cap_restante ← 0

    RETORNAR (valor_total, asignaciones)`;

const KNAPSACK_GREEDY_CORRECTNESS = `Demostración por Argumento de Intercambio (Exchange Argument): Si existiera una solución óptima O distinta de la voraz G, sea k el primer elemento donde difieren. Dado que G toma la mayor fracción posible del elemento disponible con mayor densidad r_k, O debe tener o_k < g_k y compensar peso con algún elemento posterior j > k donde r_j <= r_k. Reemplazando una fracción de j por k en O incrementa o mantiene el valor total, transformando O en G sin perder calidad. Para la mochila 0/1, este argumento no aplica porque la indivisibilidad de los objetos puede dejar 'huecos' de capacidad que no pueden rellenarse.`;

// Merge Sort Content
const MERGE_SORT_CANONICAL_PYTHON = `def merge_sort(arr: list[int]) -> list[int]:
    if len(arr) <= 1:
        return list(arr)

    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])

    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    result = []
    i, j = 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`;

const MERGE_SORT_PSEUDOCODE = `ALGORITMO MergeSort(A, p, r):
    SI p < r:
        q ← ⌊(p + r) / 2⌋
        MergeSort(A, p, q)
        MergeSort(A, q + 1, r)
        Merge(A, p, q, r)

PROCEDIMIENTO Merge(A, p, q, r):
    Crear arreglos L y R para ambas mitades
    Intercalar elementos manteniendo orden L[i] <= R[j]
    Copiar remanentes al subarreglo final A[p..r]`;

const MERGE_SORT_CORRECTNESS = `Invariante del procedimiento Merge: al inicio de cada iteración, el arreglo resultado contiene los k elementos menores de ambos subarreglos en orden no decreciente, y los punteros i y j apuntan a las menores cabezas no consumidas. Dado que los subarreglos base de tamaño 1 están trivialmente ordenados, por inducción matemática sobre el tamaño de los subarreglos, la combinación garantiza que cada nivel de la recursión produce secuencias perfectamente ordenadas. La altura del árbol de recursión es log2(n) y en cada nivel se realizan O(n) operaciones lineales, resultando en complejidad óptima Theta(n log n).`;

// Max Subarray (D&C) Content
const MAX_SUBARRAY_CANONICAL_PYTHON = `def subarreglo_cruzado(arr: list[int]) -> list[int]:
    med = len(arr) // 2

    suma_parcial = 0
    cruzado_izq = med - 1 if med > 0 else 0
    suma_izq = -float('inf')
    for i in range(med - 1, -1, -1):
        suma_parcial += arr[i]
        if suma_parcial > suma_izq:
            suma_izq = suma_parcial
            cruzado_izq = i

    suma_parcial = 0
    cruzado_der = med
    suma_der = -float('inf')
    for j in range(med, len(arr)):
        suma_parcial += arr[j]
        if suma_parcial > suma_der:
            suma_der = suma_parcial
            cruzado_der = j

    return arr[cruzado_izq : cruzado_der + 1]

def subarreglo_maxima_suma(arr: list[int]) -> list[int]:
    if len(arr) <= 1:
        return list(arr)

    med = len(arr) // 2
    izq = subarreglo_maxima_suma(arr[:med])
    der = subarreglo_maxima_suma(arr[med:])
    cruzado = subarreglo_cruzado(arr)

    sumas = (
        sum(izq) if izq else -float('inf'),
        sum(der) if der else -float('inf'),
        sum(cruzado) if cruzado else -float('inf')
    )
    suma_maxima = max(sumas)

    if suma_maxima == sumas[0]:
        return izq
    elif suma_maxima == sumas[1]:
        return der
    else:
        return cruzado`;

const MAX_SUBARRAY_PSEUDOCODE = `ALGORITMO SubarregloCruzado(A, bajo, medio, alto):
    sumaIzq ← -∞, sumaParcial ← 0, maxIzq ← medio
    PARA i DESDE medio HACIA bajo:
        sumaParcial ← sumaParcial + A[i]
        SI sumaParcial > sumaIzq: sumaIzq ← sumaParcial; maxIzq ← i

    sumaDer ← -∞, sumaParcial ← 0, maxDer ← medio + 1
    PARA j DESDE medio + 1 HASTA alto:
        sumaParcial ← sumaParcial + A[j]
        SI sumaParcial > sumaDer: sumaDer ← sumaParcial; maxDer ← j

    RETORNAR (maxIzq, maxDer, sumaIzq + sumaDer)

ALGORITMO MaxSubarregloDyC(A, bajo, alto):
    SI bajo == alto: RETORNAR (bajo, alto, A[bajo])
    medio ← ⌊(bajo + alto) / 2⌋
    izq ← MaxSubarregloDyC(A, bajo, medio)
    der ← MaxSubarregloDyC(A, medio + 1, alto)
    cruzado ← SubarregloCruzado(A, bajo, medio, alto)
    RETORNAR el de máxima suma entre (izq, der, cruzado)`;

const MAX_SUBARRAY_CORRECTNESS = `Teorema de Descomposición Disjunta: Todo subarreglo contiguo A[i..j] en A[bajo..alto] cae en una de tres categorías exhaustivas y mutuamente excluyentes: (1) 100% contenido en la mitad izquierda A[bajo..medio], (2) 100% contenido en la mitad derecha A[medio+1..alto], o (3) cruzando el punto medio (i <= medio < j).
Dado que el cálculo cruzado recorre independientemente hacia la izquierda y hacia la derecha en tiempo lineal O(n), y las llamadas recursivas resuelven los casos (1) y (2), la solución óptima es necesariamente el máximo de las 3 alternativas.
Por el Teorema Maestro con a=2, b=2, c=1 (T(n) = 2T(n/2) + O(n)), dado que log2(2) = 1 = c, la complejidad temporal es Theta(n log n).`;

// Max Flow Content
const MAX_FLOW_CANONICAL_PYTHON = `from collections import deque

def edmonds_karp(vertices, aristas, fuente, sumidero):
    residual = {v: {} for v in vertices}
    for e in aristas:
        residual[e['origen']][e['destino']] = e['capacidad']
        residual[e['destino']][e['origen']] = 0

    flujo_total = 0
    while True:
        padre = {}
        cola = deque([fuente])
        visitados = {fuente}

        while cola:
            u = cola.popleft()
            if u == sumidero: break
            for v, cap in residual[u].items():
                if v not in visitados and cap > 0:
                    visitados.add(v)
                    padre[v] = u
                    cola.append(v)

        if sumidero not in padre: break

        # Cuello de botella
        delta = float('inf')
        curr = sumidero
        while curr != fuente:
            p = padre[curr]
            delta = min(delta, residual[p][curr])
            curr = p

        curr = sumidero
        while curr != fuente:
            p = padre[curr]
            residual[p][curr] -= delta
            residual[curr][p] += delta
            curr = p

        flujo_total += delta

    return flujo_total`;

const MAX_FLOW_PSEUDOCODE = `ALGORITMO EdmondsKarp(G, s, t):
    flujo_total ← 0
    Inicializar red residual G_f con capacidades originales

    MIENTRAS exista camino simple P de s a t en G_f (encontrado con BFS):
        Δ ← MIN{ c_f(u, v) : (u, v) ∈ P }
        flujo_total ← flujo_total + Δ
        PARA CADA (u, v) EN P:
            c_f(u, v) ← c_f(u, v) - Δ
            c_f(v, u) ← c_f(v, u) + Δ

    A* ← { v alcanzable desde s en G_f final }
    B* ← V \\ A*
    RETORNAR (flujo_total, CorteMinimo = (A*, B*))`;

const MAX_FLOW_CORRECTNESS = `Teorema Fundamental Max-Flow Min-Cut: Para cualquier flujo factible f y corte s-t (A, B), el lema de dualidad débil establece v(f) <= c(A, B). Cuando el algoritmo de Edmonds-Karp termina al no existir más caminos de aumento en la red residual G_f, sea A* el conjunto de vértices alcanzables desde s en G_f y B* = V \\ A*. Toda arista de A* a B* está saturada (f(e) = c(e)) y toda arista inversa está vacía (f(e') = 0). Por lo tanto, v(f) = c(A*, B*), demostrando simultáneamente que f es un flujo máximo y (A*, B*) es un corte mínimo (Dualidad Fuerte). Elegir caminos más cortos con BFS garantiza convergencia en O(V * E^2).`;

// Linear Programming Content
const LP_CANONICAL_PYTHON = `def resolver_lp_2d(c: tuple[float, float], restricciones: list[tuple[float, float, float]]) -> dict:
    todas = list(restricciones) + [(-1.0, 0.0, 0.0), (0.0, -1.0, 0.0)]
    vertices = []
    m = len(todas)

    for i in range(m):
        a1, b1, d1 = todas[i]
        for j in range(i + 1, m):
            a2, b2, d2 = todas[j]
            det = a1 * b2 - a2 * b1
            if abs(det) > 1e-9:
                x = (d1 * b2 - d2 * b1) / det
                y = (a1 * d2 - a2 * d1) / det
                if all(ak * x + bk * y <= dk + 1e-7 for ak, bk, dk in todas):
                    pt = (round(x, 5), round(y, 5))
                    if pt not in vertices:
                        vertices.append(pt)

    mejor_pt = None
    mejor_z = -float('inf')
    for x, y in vertices:
        z = c[0] * x + c[1] * y
        if z > mejor_z:
            mejor_z = z
            mejor_pt = (x, y)

    return {'optimo': mejor_pt, 'valor_maximo': mejor_z, 'vertices_factibles': vertices}`;

const LP_PSEUDOCODE = `ALGORITMO ResolverLP2D(c, Restricciones):
    R ← Restricciones ∪ { x ≥ 0, y ≥ 0 }
    V ← { Interseccion(r1, r2) : r1, r2 ∈ R, factibles en R }
    optimo ← argmax { c^T · v : v ∈ V }
    RETORNAR (optimo, c^T · optimo)`;

const LP_CORRECTNESS = `Teorema Fundamental de la Programación Lineal: La región factible F definida por un conjunto finito de semiespacios lineales es un conjunto convexo poliédrico. Si la función objetivo lineal z = c^T x tiene un valor óptimo finito sobre F, entonces existe al menos un vértice extremo (solución básica factible) en el que se alcanza dicho óptimo.
Por convexidad, si un vértice v tiene un valor objetivo estrictamente mayor que todos sus vértices vecinos en el grafo de aristas del polítopo, entonces v es un óptimo global. Esto fundamenta el Algoritmo Simplex.`;

// Reduction IS <=_P VC Content
const REDUCTION_CANONICAL_PYTHON = `def reducir_instancia_is_a_vc(vertices, aristas, k):
    # Transformación polinomial de la instancia: el grafo G se preserva y k' = |V| - k
    k_prima = len(vertices) - k
    return vertices, aristas, k_prima

def transformar_solucion_vc_a_is(vertices, cobertura):
    # Recuperación complementaria de la solución: S = V \\ C
    set_c = set(cobertura)
    return [v for v in vertices if v not in set_c]`;

const REDUCTION_PSEUDOCODE = `ALGORITMO Reduccion_IS_a_VC(Grafo G = (V, E), k):
    k' ← Longitud(V) - k
    RETORNAR (G, k')

PROCEDIMIENTO Reconstruir_IS(V, Cobertura C):
    RETORNAR [v PARA v EN V SI v ∉ C]`;

const REDUCTION_CORRECTNESS = `Teorema Fundamental de Complementariedad (Kleinberg & Tardos 8.1): Sea G = (V, E) un grafo y S un subconjunto de V. S es un Conjunto Independiente si y solo si V \\ S es una Cobertura de Vértices. Demostración (⟺): (⇒) Si S es independiente, ninguna arista tiene ambos extremos en S; por ende, toda arista tiene al menos un extremo en V \\ S, haciendo de V \\ S una cobertura. (⇐) Si V \\ S es una cobertura, toda arista tiene al menos un extremo fuera de S; por ende, ninguna arista une dos vértices de S, haciendo de S un conjunto independiente. Como la transformación toma tiempo O(|V| + |E|), se demuestra formalmente que Independent Set <=_P Vertex Cover y viceversa.`;

// Vertex Cover 2-Approximation Content
const APPROX_CANONICAL_PYTHON = `def cobertura_vertices_2aprox(vertices, aristas):
    cobertura = set()
    matching = []

    for u, v in aristas:
        if u not in cobertura and v not in cobertura:
            matching.append((u, v))
            cobertura.add(u)
            cobertura.add(v)

    return sorted(list(cobertura)), matching`;

const APPROX_PSEUDOCODE = `ALGORITMO CoberturaVertices_2Aprox(Grafo G = (V, E)):
    C ← ∅
    M ← []

    PARA CADA (u, v) EN E:
        SI u ∉ C Y v ∉ C:
            M.Agregar((u, v))
            C.Agregar(u)
            C.Agregar(v)

    RETORNAR (C, M)`;

const APPROX_CORRECTNESS = `Teorema de la Cota de 2-Aproximación (Kleinberg & Tardos 11.1): Sea M el matching maximal de aristas disjuntas seleccionado por el algoritmo y C la cobertura devuelta. Por construcción, |C| = 2·|M|. Como ninguna arista en M comparte vértices, cualquier cobertura óptima C* debe contener al menos un vértice distinto para cubrir cada arista de M, lo que impone la cota inferior estricta |C*| >= |M|. Multiplicando por 2: |C| = 2·|M| <= 2·|C*|. En consecuencia, el ratio de aproximación rho = |C| / |C*| <= 2 está formalmente garantizado en tiempo lineal O(|V| + |E|).`;

// Randomized Fair Coin Content
const FAIR_COIN_CANONICAL_PYTHON = `def moneda_equilibrada(fuente_cargada):
    while True:
        tiro1 = fuente_cargada()
        tiro2 = fuente_cargada()

        if tiro1 == 0 and tiro2 == 1:
            return 0
        elif tiro1 == 1 and tiro2 == 0:
            return 1
        # Si tiro1 == tiro2, se descarta el par y se repite la tirada`;

const FAIR_COIN_PSEUDOCODE = `ALGORITMO MonedaEquilibrada_VonNeumann(fuente_cargada):
    REPETIR:
        t1 ← fuente_cargada()
        t2 ← fuente_cargada()
        SI t1 = 0 Y t2 = 1:
            RETORNAR 0
        SI t1 = 1 Y t2 = 0:
            RETORNAR 1
        // Si t1 = t2, descartar y repetir`;

const FAIR_COIN_CORRECTNESS = `Teorema de Extracción de Aleatoriedad de Von Neumann (1951): Sea una fuente binaria Bernoulli independiente con sesgo P(1) = p desconocido (0 < p < 1). Al lanzar la moneda en pares disjuntos sucesivos (t1, t2), las probabilidades conjuntas son: P((0, 1)) = (1 - p)·p y P((1, 0)) = p·(1 - p). Por la conmutatividad del producto de números reales, (1 - p)·p = p·(1 - p) exactamente. Los eventos equiprobables se mapean a 0 y 1 respectivamente, descartando los empates (0, 0) y (1, 1). La probabilidad de éxito en cada ronda es q = 2p(1 - p) > 0. El número de rondas sigue una distribución geométrica Geom(q), lo que garantiza tiempo esperado E[T] = 1/q = 1 / (2p(1-p)) = O(1) flips y sesgo nulo.`;

// Highway Antennas (Interval Covering) Content
const ROAD_ANTENNAS_CANONICAL_PYTHON = `def construir_antenas(casas: list[float], radio: float) -> list[float]:
    casas_ordenadas = sorted(casas)
    antenas = []
    i = 0
    n = len(casas_ordenadas)

    while i < n:
        casa_sin_cubrir = casas_ordenadas[i]
        posicion = casa_sin_cubrir + radio
        antenas.append(posicion)

        limite = posicion + radio
        while i < n and casas_ordenadas[i] <= limite:
            i += 1

    return antenas`;

const ROAD_ANTENNAS_PSEUDOCODE = `ALGORITMO ConstruirAntenas(casas, radio):
    casas_ordenadas ← OrdenarAscendente(casas)
    antenas ← []
    i ← 0
    n ← Longitud(casas_ordenadas)

    MIENTRAS i < n:
        casa_sin_cubrir ← casas_ordenadas[i]
        posicion ← casa_sin_cubrir + radio
        antenas.Agregar(posicion)
        limite ← posicion + radio

        MIENTRAS i < n Y casas_ordenadas[i] <= limite:
            i ← i + 1

    RETORNAR antenas`;

const ROAD_ANTENNAS_CORRECTNESS = `Teorema de Optimalidad por Greedy Stays Ahead (Kleinberg & Tardos 4.2): Sean A = {a_1, ..., a_k} las posiciones ordenadas elegidas por Greedy y O* = {o_1, ..., o_m} cualquier solución óptima válida. Demostramos por inducción que a_j >= o_j para todo j. Caso base (j=1): la primera casa x_1 requiere o_1 <= x_1 + R. Como Greedy elige a_1 = x_1 + R, a_1 >= o_1. Paso inductivo: si a_j >= o_j, el alcance a_j + R >= o_j + R. La primera casa no cubierta x_sig está más allá de o_j + R, por lo que en O* debe cubrirse con o_{j+1} <= x_sig + R. Como Greedy elige a_{j+1} = x_sig + R >= o_{j+1}, la frontera de Greedy siempre está al menos tan a la derecha como la de O*. Por ende, k <= m y como O* es óptimo, k = m.`;

// Subset Sum (Backtracking with Pruning) Content
const SUBSET_SUM_CANONICAL_PYTHON = `def subconjuntos_que_suman(numeros: list[int], objetivo: int) -> list[list[int]]:
    elementos = [x for x in numeros if 0 < x <= objetivo]
    elementos.sort(reverse=True)
    soluciones = []
    actual = []

    def backtrack(idx: int, suma_actual: int, remanente: int) -> None:
        if suma_actual == objetivo:
            soluciones.append(list(actual))
            return
        if idx >= len(elementos):
            return

        elem = elementos[idx]
        nuevo_remanente = remanente - elem

        # Poda por exceso: suma + elem <= objetivo
        if suma_actual + elem <= objetivo:
            actual.append(elem)
            backtrack(idx + 1, suma_actual + elem, nuevo_remanente)
            actual.pop()

        # Poda por déficit: suma + nuevo_remanente >= objetivo
        if suma_actual + nuevo_remanente >= objetivo:
            backtrack(idx + 1, suma_actual, nuevo_remanente)

    backtrack(0, 0, sum(elementos))
    return soluciones`;

const SUBSET_SUM_PSEUDOCODE = `ALGORITMO SubconjuntosQueSuman(numeros, objetivo):
    elementos ← OrdenarDecreciente([x EN numeros SI x <= objetivo])
    soluciones ← []
    actual ← []

    PROCEDIMIENTO Backtrack(idx, suma_actual, remanente):
        SI suma_actual = objetivo:
            soluciones.Agregar(Copia(actual))
            RETORNAR
        SI idx >= Longitud(elementos):
            RETORNAR

        elem ← elementos[idx]
        nuevo_remanente ← remanente - elem

        SI suma_actual + elem <= objetivo:  // Poda por Exceso
            actual.Agregar(elem)
            Backtrack(idx + 1, suma_actual + elem, nuevo_remanente)
            actual.QuitarUltimo()

        SI suma_actual + nuevo_remanente >= objetivo:  // Poda por Déficit
            Backtrack(idx + 1, suma_actual, nuevo_remanente)

    Backtrack(0, 0, Suma(elementos))
    RETORNAR soluciones`;

const SUBSET_SUM_CORRECTNESS = `Teorema de Correctitud de Backtracking con Podas: El algoritmo modela el espacio de 2^n subconjuntos como un árbol binario de decisiones (incluir o excluir cada elemento). Por ser números estrictamente positivos: (1) Invariante de exceso: si suma_actual + w_i > S, cualquier inclusión adicional en el subárbol solo aumentará la suma; por lo tanto, ninguna solución factible existe en ese subárbol (Poda segura). (2) Invariante de déficit: si suma_actual + sum_{k=i+1}^n w_k < S, incluso si se incluyeran todos los números restantes, la suma máxima alcanzable no llegará a S; ninguna solución factible es descartada (Poda segura). Al terminar la exploración, el conjunto de hojas no podadas contiene exactamente todas las soluciones válidas.`;

// Coin Change (Dynamic Programming) Content
const COIN_CHANGE_CANONICAL_PYTHON = `def cambio_monedas_minimo(monedas: list[int], objetivo: int) -> list[int]:
    if objetivo <= 0 or not monedas:
        return []

    inf = float('inf')
    dp = [inf] * (objetivo + 1)
    eleccion = [-1] * (objetivo + 1)
    dp[0] = 0

    monedas_validas = sorted([c for c in monedas if c > 0])

    for v in range(1, objetivo + 1):
        for c in monedas_validas:
            if c <= v:
                costo = dp[v - c] + 1
                if costo < dp[v]:
                    dp[v] = costo
                    eleccion[v] = c

    if dp[objetivo] == inf:
        return []

    resultado = []
    actual = objetivo
    while actual > 0:
        c = eleccion[actual]
        resultado.append(c)
        actual -= c

    return sorted(resultado, reverse=True)`;

const COIN_CHANGE_PSEUDOCODE = `ALGORITMO CambioMonedasMinimo(monedas, objetivo):
    SI objetivo <= 0 O monedas está vacío:
        RETORNAR []

    dp ← Arreglo(objetivo + 1, Infinito)
    eleccion ← Arreglo(objetivo + 1, -1)
    dp[0] ← 0

    PARA v ← 1 HASTA objetivo:
        PARA CADA c EN monedas:
            SI c <= v Y dp[v - c] + 1 < dp[v]:
                dp[v] ← dp[v - c] + 1
                eleccion[v] ← c

    SI dp[objetivo] = Infinito:
        RETORNAR []

    resultado ← []
    actual ← objetivo
    MIENTRAS actual > 0:
        c ← eleccion[actual]
        resultado.Agregar(c)
        actual ← actual - c

    RETORNAR resultado`;

const COIN_CHANGE_CORRECTNESS = `Principio de Optimalidad de Bellman y Subestructura Óptima: Para cualquier solución óptima que devuelva cambio para un monto V utilizando k monedas {c_1, c_2, ..., c_k}, si retiramos una moneda c_1, el conjunto restante {c_2, ..., c_k} debe ser forzosamente una solución óptima para el subproblema de dar cambio a V - c_1 con k - 1 monedas. Si existiese una solución para V - c_1 con menos monedas, podríamos sumarle c_1 y obtener una solución para V con menos de k monedas, contradiciendo la optimalidad original. Al probar todas las monedas válidas c <= V y tomar el mínimo, el algoritmo explora la totalidad del espacio de elecciones de manera exhaustiva en tiempo O(V · |C|) y garantiza la solución global mínima.`;

// Peak Finding (Divide & Conquer) Content
const PEAK_FINDING_CANONICAL_PYTHON = `def buscar_pico(arreglo: list[int]) -> int:
    if not arreglo:
        return -1

    inicio = 0
    fin = len(arreglo) - 1

    while inicio <= fin:
        medio = (inicio + fin) // 2

        if medio > 0 and arreglo[medio] < arreglo[medio - 1]:
            fin = medio - 1
        elif medio < len(arreglo) - 1 and arreglo[medio] < arreglo[medio + 1]:
            inicio = medio + 1
        else:
            return medio

    return inicio`;

const PEAK_FINDING_PSEUDOCODE = `ALGORITMO BuscarPico(A):
    SI Longitud(A) = 0:
        RETORNAR -1

    inicio ← 0
    fin ← Longitud(A) - 1

    MIENTRAS inicio <= fin:
        medio ← (inicio + fin) DIV 2

        SI medio > 0 Y A[medio] < A[medio - 1]:
            fin ← medio - 1
        SINO SI medio < Longitud(A) - 1 Y A[medio] < A[medio + 1]:
            inicio ← medio + 1
        SINO:
            RETORNAR medio

    RETORNAR inicio`;

const PEAK_FINDING_CORRECTNESS = `Teorema del Gradiente Ascendente (Uphill Walk Invariant): Todo arreglo finito no vacío posee al menos un pico (el máximo global siempre es pico). Al tomar el centro m, si A[m] < A[m-1], la pendiente sube hacia la izquierda. Si recorremos hacia la izquierda, o bien los valores suben o se mantienen hasta llegar al extremo A[0] (el cual sería un pico por ser borde y A[0] >= A[1]), o bien encontramos un descenso en algún índice j tal que A[j] < A[j+1], en cuyo caso A[j+1] es un pico local. Por lo tanto, el subarreglo izquierdo contiene obligatoriamente al menos un pico. Análogamente para la derecha. Como T(n) = T(n/2) + O(1), por Teorema Maestro (caso 2, log_2 1 = 0 = d), la complejidad temporal es exactamente Theta(log n).`;

// Longest Common Subsequence (Dynamic Programming) Content
const LCS_CANONICAL_PYTHON = `def subsecuencia_comun_mas_larga(s1: str, s2: str) -> str:
    m = len(s1)
    n = len(s2)
    if m == 0 or n == 0:
        return ""

    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if s1[i - 1] == s2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    resultado = []
    i = m
    j = n
    while i > 0 and j > 0:
        if s1[i - 1] == s2[j - 1]:
            resultado.append(s1[i - 1])
            i -= 1
            j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1

    resultado.reverse()
    return "".join(resultado)`;

const LCS_PSEUDOCODE = `ALGORITMO SubsecuenciaComunMasLarga(X, Y):
    m ← Longitud(X)
    n ← Longitud(Y)
    SI m = 0 O n = 0:
        RETORNAR ""

    c ← Matriz(m + 1, n + 1, 0)

    PARA i ← 1 HASTA m:
        PARA j ← 1 HASTA n:
            SI X[i - 1] = Y[j - 1]:
                c[i, j] ← c[i - 1, j - 1] + 1
            SINO:
                c[i, j] ← Maximo(c[i - 1, j], c[i, j - 1])

    resultado ← []
    i ← m
    j ← n
    MIENTRAS i > 0 Y j > 0:
        SI X[i - 1] = Y[j - 1]:
            resultado.Agregar(X[i - 1])
            i ← i - 1
            j ← j - 1
        SINO SI c[i - 1, j] >= c[i, j - 1]:
            i ← i - 1
        SINO:
            j ← j - 1

    RETORNAR Invertir(resultado)`;

const LCS_CORRECTNESS = `Teorema de Subestructura Óptima de LCS (CLRS 15.4 / Kleinberg & Tardos 6.6): Sean X = <x_1, ..., x_m> e Y = <y_1, ..., y_n> secuencias y Z = <z_1, ..., z_k> cualquier LCS de X e Y. (1) Si x_m = y_n, forzosamente z_k = x_m = y_n y Z_{k-1} es un LCS de X_{m-1} e Y_{n-1}. Si existiera un LCS más largo para los prefijos, podríamos concatenarle x_m y contradecir la maximalidad de Z. (2) Si x_m != y_n y z_k != x_m, entonces Z es un LCS de X_{m-1} e Y. (3) Si x_m != y_n y z_k != y_n, Z es un LCS de X e Y_{n-1}. La recurrencia c[i,j] cubre de forma exhaustiva estas alternativas evaluando (m+1)(n+1) celdas en Theta(m*n), garantizando la longitud óptima global.`;

// Weighted Interval Scheduling Content
const WEIGHTED_INTERVAL_CANONICAL_PYTHON = `def planificar_intervalos_ponderados(intervalos: list[list[int]]) -> list[list[int]]:
    if not intervalos:
        return []

    # 1. Ordenar por tiempo de fin ascendente
    ordenados = sorted(intervalos, key=lambda x: x[1])
    n = len(ordenados)

    # 2. Precomputar p(j): el mayor i < j compatible (fin_i <= inicio_j)
    p = [0] * (n + 1)
    for j in range(1, n + 1):
        inicio_j = ordenados[j - 1][0]
        bajo, alto = 1, j - 1
        mejor = 0
        while bajo <= alto:
            medio = (bajo + alto) // 2
            if ordenados[medio - 1][1] <= inicio_j:
                mejor = medio
                bajo = medio + 1
            else:
                alto = medio - 1
        p[j] = mejor

    # 3. Llenar tabla DP con la ecuación de Bellman
    opt = [0] * (n + 1)
    for j in range(1, n + 1):
        peso_j = ordenados[j - 1][2]
        opt[j] = max(opt[j - 1], peso_j + opt[p[j]])

    # 4. Reconstrucción de la solución óptima
    seleccionados = []
    curr = n
    while curr > 0:
        peso_curr = ordenados[curr - 1][2]
        if peso_curr + opt[p[curr]] >= opt[curr - 1]:
            seleccionados.append(ordenados[curr - 1])
            curr = p[curr]
        else:
            curr -= 1

    seleccionados.reverse()
    return seleccionados`;

const WEIGHTED_INTERVAL_PSEUDOCODE = `ALGORITMO PlanificarIntervalosPonderados(intervalos):
    SI intervalos ESTÁ VACÍO:
        RETORNAR []

    ordenados ← OrdenarPorTiempoDeFin(intervalos)
    n ← Longitud(ordenados)
    p ← Arreglo(n + 1, 0)

    // Precomputar p(j) con búsqueda binaria O(n log n)
    PARA j ← 1 HASTA n:
        p[j] ← BusquedaBinariaMayorFinMenorOIgual(ordenados, ordenados[j - 1].inicio)

    // Recurrencia de Bellman
    OPT ← Arreglo(n + 1, 0)
    PARA j ← 1 HASTA n:
        OPT[j] ← Maximo(OPT[j - 1], ordenados[j - 1].peso + OPT[p[j]])

    // Reconstrucción del conjunto óptimo
    seleccionados ← []
    curr ← n
    MIENTRAS curr > 0:
        SI ordenados[curr - 1].peso + OPT[p[curr]] >= OPT[curr - 1]:
            seleccionados.Agregar(ordenados[curr - 1])
            curr ← p[curr]
        SINO:
            curr ← curr - 1

    RETORNAR Invertir(seleccionados)`;

const WEIGHTED_INTERVAL_CORRECTNESS = `Teorema de Bellman para Intervalos Ponderados (Kleinberg & Tardos 6.1): Considérese una solución óptima O para las primeras j tareas ordenadas por tiempo de finalización. Hay dos casos mutuamente excluyentes: (1) La tarea j no pertenece a O: entonces O es una solución óptima para el subproblema {1, ..., j-1}, con valor OPT(j-1). (2) La tarea j pertenece a O: entonces ninguna tarea entre p(j)+1 y j-1 puede pertenecer a O debido a incompatibilidad temporal con j. En consecuencia, O \\ {j} debe ser una solución óptima para el subproblema {1, ..., p(j)}, con valor v_j + OPT(p(j)). Si alguna de estas subsoluciones no fuera óptima, un argumento de intercambio (cut-and-paste) permitiría construir una solución superior a O, contradiciendo su optimalidad. Por inducción completa sobre j, OPT(j) = max(OPT(j-1), v_j + OPT(p(j))) computa exactamente el peso máximo obtenible.`;

// Inversion Counting Content
const INVERSION_COUNTING_CANONICAL_PYTHON = `def contar_inversiones(arreglo: list[int]) -> int:
    def merge_and_count(izq: list[int], der: list[int]) -> tuple[int, list[int]]:
        i = 0
        j = 0
        inversiones_cruzadas = 0
        mezclado = []
        len_izq = len(izq)
        len_der = len(der)

        while i < len_izq and j < len_der:
            if izq[i] <= der[j]:
                mezclado.append(izq[i])
                i += 1
            else:
                mezclado.append(der[j])
                # der[j] es menor que todos los elementos pendientes en izq
                inversiones_cruzadas += (len_izq - i)
                j += 1

        mezclado.extend(izq[i:])
        mezclado.extend(der[j:])
        return inversiones_cruzadas, mezclado

    def sort_and_count(arr: list[int]) -> tuple[int, list[int]]:
        if len(arr) <= 1:
            return 0, list(arr)

        medio = len(arr) // 2
        inv_izq, arr_izq = sort_and_count(arr[:medio])
        inv_der, arr_der = sort_and_count(arr[medio:])
        inv_cruzadas, arr_mezclado = merge_and_count(arr_izq, arr_der)

        return (inv_izq + inv_der + inv_cruzadas), arr_mezclado

    total, _ = sort_and_count(arreglo)
    return total`;

const INVERSION_COUNTING_PSEUDOCODE = `ALGORITMO ContarInversiones(A):
    (totalInv, _) ← OrdenarYContar(A)
    RETORNAR totalInv

PROCEDIMIENTO OrdenarYContar(A):
    n ← Longitud(A)
    SI n <= 1:
        RETORNAR (0, A)

    medio ← ParteEntera(n / 2)
    (invIzq, izqOrd) ← OrdenarYContar(A[0 ... medio - 1])
    (invDer, derOrd) ← OrdenarYContar(A[medio ... n - 1])
    (invCruzadas, mezclado) ← IntercalarYContar(izqOrd, derOrd)

    RETORNAR (invIzq + invDer + invCruzadas, mezclado)

PROCEDIMIENTO IntercalarYContar(izq, der):
    i ← 0, j ← 0, invCruzadas ← 0, mezclado ← []
    MIENTRAS i < Longitud(izq) Y j < Longitud(der):
        SI izq[i] <= der[j]:
            mezclado.Agregar(izq[i])
            i ← i + 1
        SINO:
            mezclado.Agregar(der[j])
            invCruzadas ← invCruzadas + (Longitud(izq) - i)
            j ← j + 1

    CopiarResto(izq, i, mezclado)
    CopiarResto(der, j, mezclado)
    RETORNAR (invCruzadas, mezclado)`;

const INVERSION_COUNTING_CORRECTNESS = `Teorema de Partición Disjunta de Inversiones (Kleinberg & Tardos 5.3 / CLRS 2-4): Todo par de índices (i, j) con i < j pertenece exactamente a uno de tres conjuntos disjuntos: (1) i, j < medio (inversión interna en mitad izquierda), (2) i, j >= medio (inversión interna en mitad derecha), o (3) i < medio <= j (inversión cruzada / split inversion). Por hipótesis inductiva, las llamadas recursivas cuentan exhaustivamente todas las inversiones de tipo (1) y (2). En la intercalación, dado que izq y der están ordenados, cuando der[j] < izq[i], se cumple der[j] < izq[k] para todo k >= i por transitividad. Por tanto, sumar exactamente len(izq) - i en ese instante cuenta de forma biunívoca todas las inversiones cruzadas en las que participa der[j]. Por el Teorema Maestro, T(n) = 2T(n/2) + O(n) = Theta(n log n).`;

const AppContent: React.FC = () => {
  const { t, dict } = useLanguage();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('visual_tda_theme');
    return (saved as ThemeMode) || 'system';
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('visual_tda_theme', theme);
  }, [theme]);

  const categories = registry.getCategories();
  const exercises = registry.getExercises(activeCategoryId || undefined);
  const selectedExercise = selectedExerciseId ? registry.getExercise(selectedExerciseId) : undefined;

  const handleHomeClick = () => {
    setSelectedExerciseId(null);
  };

  const getExerciseProps = () => {
    if (!selectedExercise) return {};

    if (selectedExercise.id === 'n-queens') {
      return {
        visualizerSlot: <NQueensVisualizer />,
        discoverPlaygroundSlot: <NQueensPlayground />,
        canonicalPython: N_QUEENS_CANONICAL_PYTHON,
        pseudocode: N_QUEENS_PSEUDOCODE,
        correctnessExplanation: N_QUEENS_CORRECTNESS,
        timeComplexity: 'O(N!)',
        spaceComplexity: 'O(N)'
      };
    }

    if (selectedExercise.id === 'interval-scheduling') {
      return {
        visualizerSlot: <IntervalSchedulingVisualizer />,
        discoverPlaygroundSlot: <IntervalSchedulingPlayground />,
        canonicalPython: INTERVALS_CANONICAL_PYTHON,
        pseudocode: INTERVALS_PSEUDOCODE,
        correctnessExplanation: INTERVALS_CORRECTNESS,
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)'
      };
    }

    if (selectedExercise.id === 'knapsack-dp') {
      return {
        visualizerSlot: <KnapsackDpVisualizer />,
        discoverPlaygroundSlot: <KnapsackPlayground />,
        canonicalPython: KNAPSACK_DP_CANONICAL_PYTHON,
        pseudocode: KNAPSACK_DP_PSEUDOCODE,
        correctnessExplanation: KNAPSACK_DP_CORRECTNESS,
        timeComplexity: 'O(n · W) [Pseudo-polinomial]',
        spaceComplexity: 'O(n · W)'
      };
    }

    if (selectedExercise.id === 'juan-el-vago') {
      return {
        visualizerSlot: <JuanElVagoVisualizer />,
        discoverPlaygroundSlot: <JuanElVagoPlayground />,
        canonicalPython: JUAN_EL_VAGO_CANONICAL_PYTHON,
        pseudocode: JUAN_EL_VAGO_PSEUDOCODE,
        correctnessExplanation: JUAN_EL_VAGO_CORRECTNESS,
        timeComplexity: 'O(n) [Lineal]',
        spaceComplexity: 'O(n) [O(1) sin reconstrucción]'
      };
    }

    if (selectedExercise.id === 'knapsack-greedy') {
      return {
        visualizerSlot: <KnapsackGreedyVisualizer />,
        canonicalPython: KNAPSACK_GREEDY_CANONICAL_PYTHON,
        pseudocode: KNAPSACK_GREEDY_PSEUDOCODE,
        correctnessExplanation: KNAPSACK_GREEDY_CORRECTNESS,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)'
      };
    }

    if (selectedExercise.id === 'merge-sort') {
      return {
        visualizerSlot: <MergeSortVisualizer />,
        canonicalPython: MERGE_SORT_CANONICAL_PYTHON,
        pseudocode: MERGE_SORT_PSEUDOCODE,
        correctnessExplanation: MERGE_SORT_CORRECTNESS,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)'
      };
    }

    if (selectedExercise.id === 'max-subarray-dyc') {
      return {
        visualizerSlot: <MaxSubarrayVisualizer />,
        discoverPlaygroundSlot: <MaxSubarrayPlayground />,
        canonicalPython: MAX_SUBARRAY_CANONICAL_PYTHON,
        pseudocode: MAX_SUBARRAY_PSEUDOCODE,
        correctnessExplanation: MAX_SUBARRAY_CORRECTNESS,
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(log n)'
      };
    }

    if (selectedExercise.id === 'max-flow') {
      return {
        visualizerSlot: <MaxFlowVisualizer />,
        canonicalPython: MAX_FLOW_CANONICAL_PYTHON,
        pseudocode: MAX_FLOW_PSEUDOCODE,
        correctnessExplanation: MAX_FLOW_CORRECTNESS,
        timeComplexity: 'O(V · E²)',
        spaceComplexity: 'O(V + E)'
      };
    }

    if (selectedExercise.id === 'linear-programming-formulation') {
      return {
        visualizerSlot: <LinearProgrammingVisualizer />,
        discoverPlaygroundSlot: <LinearProgrammingPlayground />,
        canonicalPython: LP_CANONICAL_PYTHON,
        pseudocode: LP_PSEUDOCODE,
        correctnessExplanation: LP_CORRECTNESS,
        timeComplexity: 'O(m · n) [Polinomial]',
        spaceComplexity: 'O(m · n)'
      };
    }

    if (selectedExercise.id === 'vertex-cover-reduction') {
      return {
        visualizerSlot: <ReductionIsVcVisualizer />,
        discoverPlaygroundSlot: <ReductionIsVcPlayground />,
        canonicalPython: REDUCTION_CANONICAL_PYTHON,
        pseudocode: REDUCTION_PSEUDOCODE,
        correctnessExplanation: REDUCTION_CORRECTNESS,
        timeComplexity: 'O(|V| + |E|) [Reducción Polinomial]',
        spaceComplexity: 'O(|V| + |E|)'
      };
    }

    if (selectedExercise.id === 'vertex-cover-approx') {
      return {
        visualizerSlot: <VertexCoverApproxVisualizer />,
        discoverPlaygroundSlot: <VertexCoverApproxPlayground />,
        canonicalPython: APPROX_CANONICAL_PYTHON,
        pseudocode: APPROX_PSEUDOCODE,
        correctnessExplanation: APPROX_CORRECTNESS,
        timeComplexity: 'O(|V| + |E|) [2-Aproximación Lineal]',
        spaceComplexity: 'O(|V| + |E|)'
      };
    }

    if (selectedExercise.id === 'randomized-fair-coin') {
      return {
        visualizerSlot: <RandomizedFairCoinVisualizer />,
        discoverPlaygroundSlot: <RandomizedFairCoinPlayground />,
        canonicalPython: FAIR_COIN_CANONICAL_PYTHON,
        pseudocode: FAIR_COIN_PSEUDOCODE,
        correctnessExplanation: FAIR_COIN_CORRECTNESS,
        timeComplexity: 'O(1) [Tiempo Esperado / Las Vegas]',
        spaceComplexity: 'O(1) [Espacio Auxiliar Constante]'
      };
    }

    if (selectedExercise.id === 'road-antennas-greedy') {
      return {
        visualizerSlot: <RoadAntennasVisualizer />,
        discoverPlaygroundSlot: <RoadAntennasPlayground />,
        canonicalPython: ROAD_ANTENNAS_CANONICAL_PYTHON,
        pseudocode: ROAD_ANTENNAS_PSEUDOCODE,
        correctnessExplanation: ROAD_ANTENNAS_CORRECTNESS,
        timeComplexity: 'O(n log n) [Ordenamiento] + O(n) [Escaneo lineal]',
        spaceComplexity: 'O(k) [k antenas construidas]'
      };
    }

    if (selectedExercise.id === 'subset-sum-backtracking') {
      return {
        visualizerSlot: <SubsetSumVisualizer />,
        discoverPlaygroundSlot: <SubsetSumPlayground />,
        canonicalPython: SUBSET_SUM_CANONICAL_PYTHON,
        pseudocode: SUBSET_SUM_PSEUDOCODE,
        correctnessExplanation: SUBSET_SUM_CORRECTNESS,
        timeComplexity: 'O(2^n) [Peor caso] / O(n) espacio con podas por exceso y cota superior',
        spaceComplexity: 'O(n) [Profundidad del árbol de recursión]'
      };
    }

    if (selectedExercise.id === 'coin-change-dp') {
      return {
        visualizerSlot: <CoinChangeVisualizer />,
        discoverPlaygroundSlot: <CoinChangePlayground />,
        canonicalPython: COIN_CHANGE_CANONICAL_PYTHON,
        pseudocode: COIN_CHANGE_PSEUDOCODE,
        correctnessExplanation: COIN_CHANGE_CORRECTNESS,
        timeComplexity: 'O(V · |C|) [V = monto objetivo, |C| = número de denominaciones]',
        spaceComplexity: 'O(V) [Tabla 1D dp y arreglo eleccion]'
      };
    }

    if (selectedExercise.id === 'peak-finding-dyc') {
      return {
        visualizerSlot: <PeakFindingVisualizer />,
        discoverPlaygroundSlot: <PeakFindingPlayground />,
        canonicalPython: PEAK_FINDING_CANONICAL_PYTHON,
        pseudocode: PEAK_FINDING_PSEUDOCODE,
        correctnessExplanation: PEAK_FINDING_CORRECTNESS,
        timeComplexity: 'O(log n) [División geométrica a la mitad por Teorema Maestro]',
        spaceComplexity: 'O(1) [Iterativo] / O(log n) [Recursivo por stack]'
      };
    }

    if (selectedExercise.id === 'lcs-dp') {
      return {
        visualizerSlot: <LcsVisualizer />,
        discoverPlaygroundSlot: <LcsPlayground />,
        canonicalPython: LCS_CANONICAL_PYTHON,
        pseudocode: LCS_PSEUDOCODE,
        correctnessExplanation: LCS_CORRECTNESS,
        timeComplexity: 'O(m · n) [m = len(s1), n = len(s2)]',
        spaceComplexity: 'O(m · n) [Tabla 2D de estados y reconstrucción]'
      };
    }

    if (selectedExercise.id === 'weighted-interval-scheduling') {
      return {
        visualizerSlot: <WeightedIntervalVisualizer />,
        discoverPlaygroundSlot: <WeightedIntervalPlayground />,
        canonicalPython: WEIGHTED_INTERVAL_CANONICAL_PYTHON,
        pseudocode: WEIGHTED_INTERVAL_PSEUDOCODE,
        correctnessExplanation: WEIGHTED_INTERVAL_CORRECTNESS,
        timeComplexity: 'O(n log n) [Ordenamiento inicial + n búsquedas binarias para p(j)]',
        spaceComplexity: 'O(n) [Arreglos OPT de memoización y punteros p(j)]'
      };
    }

    if (selectedExercise.id === 'inversion-counting-dyc') {
      return {
        visualizerSlot: <InversionCountingVisualizer />,
        discoverPlaygroundSlot: <InversionCountingPlayground />,
        canonicalPython: INVERSION_COUNTING_CANONICAL_PYTHON,
        pseudocode: INVERSION_COUNTING_PSEUDOCODE,
        correctnessExplanation: INVERSION_COUNTING_CORRECTNESS,
        timeComplexity: 'O(n log n) [Teorema Maestro T(n) = 2T(n/2) + O(n)]',
        spaceComplexity: 'O(n) [Arreglos auxiliares de mezcla]'
      };
    }

    return {};
  };

  return (
    <div className="app-layout">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        onHomeClick={handleHomeClick}
        currentExerciseTitle={selectedExercise ? t(selectedExercise.title) : undefined}
      />

      <main className="app-main" id="main-content">
        {!selectedExercise ? (
          <>
            <section className="welcome-banner">
              <h2>{t(dict.welcomeTitle)}</h2>
              <p>{t(dict.welcomeLead)}</p>
            </section>

            <section className="catalog-section">
              <div className="section-header">
                <h3>{t(dict.catalogTitle)}</h3>
              </div>
              <CategoryNav
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
              />
              <ExerciseList
                exercises={exercises}
                onSelectExercise={(id) => setSelectedExerciseId(id)}
              />
            </section>
          </>
        ) : (
          <ExerciseView
            exercise={selectedExercise}
            onBackToCatalog={handleHomeClick}
            {...getExerciseProps()}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>{t(dict.footerText)}</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);
