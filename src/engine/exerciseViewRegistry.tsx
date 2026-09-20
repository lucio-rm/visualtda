import React from 'react';
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
import { HuffmanVisualizer } from '../components/visualizers/HuffmanVisualizer';
import { HuffmanPlayground } from '../components/visualizers/HuffmanPlayground';
import { GraphColoringVisualizer } from '../components/visualizers/GraphColoringVisualizer';
import { GraphColoringPlayground } from '../components/visualizers/GraphColoringPlayground';

export interface ExerciseViewConfig {
  visualizerSlot?: React.ReactNode;
  discoverPlaygroundSlot?: React.ReactNode;
  canonicalPython?: string;
  pseudocode?: string;
  correctnessExplanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export const EXERCISE_VIEW_REGISTRY: Record<string, ExerciseViewConfig> = {
  'n-queens': {
    visualizerSlot: <NQueensVisualizer />,
    discoverPlaygroundSlot: <NQueensPlayground />,
    canonicalPython: `def resolver_n_reinas(n: int) -> list[list[int]]:
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
    return soluciones`,
    pseudocode: `ALGORITMO ResolverNReinas(n):
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
    RETORNAR soluciones`,
    correctnessExplanation: `El algoritmo mantiene como invariante que, al ingresar a la llamada recursiva para la fila k, todas las k reinas colocadas en las filas 0..k-1 no se atacan entre sí. En cada paso, se evalúan únicamente casillas que preservan el invariante (poda de ramas inválidas). Dado que el árbol es finito y la profundidad está acotada por N, la inducción sobre las filas demuestra que toda solución alcanzada en fila=N es válida y que la búsqueda exhaustiva no omite ninguna configuración admisible.`,
    timeComplexity: 'O(N!)',
    spaceComplexity: 'O(N)'
  },

  'interval-scheduling': {
    visualizerSlot: <IntervalSchedulingVisualizer />,
    discoverPlaygroundSlot: <IntervalSchedulingPlayground />,
    canonicalPython: `def seleccion_intervalos(intervalos: list[tuple[int, int]]) -> list[tuple[int, int]]:
    ordenados = sorted(intervalos, key=lambda x: x[1])
    seleccionados = []
    ultimo_fin = -float('inf')

    for inicio, fin in ordenados:
        if inicio >= ultimo_fin:
            seleccionados.append((inicio, fin))
            ultimo_fin = fin

    return seleccionados`,
    pseudocode: `ALGORITMO SeleccionIntervalos(I):
    I_ordenados ← OrdenarPorTiempoDeFin(I)
    S ← []
    ultimoFin ← -Infinito

    PARA CADA (inicio, fin) EN I_ordenados:
        SI inicio >= ultimoFin:
            S.Agregar((inicio, fin))
            ultimoFin ← fin

    RETORNAR S`,
    correctnessExplanation: `Demostración por el lema 'Greedy Stays Ahead' (Greedy se mantiene adelante): Sean A = {a_1, ..., a_k} la solución voraz y O = {o_1, ..., o_m} una solución óptima cualquiera. Por inducción sobre r, se demuestra que fin(a_r) <= fin(o_r) para todo r <= k. Dado que el intervalo voraz termina siempre antes o igual que el intervalo óptimo correspondiente, deja tanto o más tiempo libre para el resto de las tareas, impidiendo que el óptimo pueda contener un elemento adicional (m > k). Por ende, k = m y la selección voraz es estrictamente óptima.`,
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(N)'
  },

  'knapsack-dp': {
    visualizerSlot: <KnapsackDpVisualizer />,
    discoverPlaygroundSlot: <KnapsackPlayground />,
    canonicalPython: `def mochila_dp(items, capacidad):
    n = len(items)
    dp = [[0] * (capacidad + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        peso, valor = items[i - 1].peso, items[i - 1].valor
        for w in range(capacidad + 1):
            if peso <= w:
                dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - peso] + valor)
            else:
                dp[i][w] = dp[i - 1][w]

    seleccionados = []
    w_restante = capacidad
    for i in range(n, 0, -1):
        if dp[i][w_restante] != dp[i - 1][w_restante]:
            seleccionados.append(items[i - 1])
            w_restante -= items[i - 1].peso

    seleccionados.reverse()
    return dp[n][capacidad], seleccionados`,
    pseudocode: `ALGORITMO Mochila01_DP(items, W):
    n ← Longitud(items)
    Crear tabla DP[(n + 1)][(W + 1)] en 0

    PARA i DESDE 1 HASTA n:
        PARA w DESDE 0 HASTA W:
            SI items[i - 1].peso <= w:
                DP[i][w] ← MAX(DP[i - 1][w], DP[i - 1][w - items[i - 1].peso] + items[i - 1].valor)
            SINO:
                DP[i][w] ← DP[i - 1][w]

    RETORNAR DP[n][W] y ReconstruirSolucion(DP, items, W)`,
    correctnessExplanation: `Principio de Optimalidad de Bellman: Sea S* la solución óptima para los primeros i elementos y capacidad w. Para el elemento i, solo existen dos alternativas exhaustivas: o bien i no pertenece a S* (en cuyo caso S* debe ser óptimo para i-1 elementos y capacidad w), o bien i sí pertenece a S* (en cuyo caso S* \\ {i} debe ser óptimo para i-1 elementos con capacidad w - w_i). Cualquier desviación subóptima en los subproblemas contradiría la optimalidad de S* por el argumento clásico 'cut-and-paste'. Por inducción sobre las filas de la tabla, DP[n][W] contiene el óptimo global.`,
    timeComplexity: 'O(n · W) [Pseudo-polinomial]',
    spaceComplexity: 'O(n · W)'
  },

  'juan-el-vago': {
    visualizerSlot: <JuanElVagoVisualizer />,
    discoverPlaygroundSlot: <JuanElVagoPlayground />,
    canonicalPython: `def juan_el_vago(ganancias: list[int]) -> tuple[int, list[int]]:
    n = len(ganancias)
    if n == 0: return 0, []
    if n == 1: return ganancias[0], [0]

    dp = [0] * n
    dp[0] = ganancias[0]
    dp[1] = max(ganancias[0], ganancias[1])

    for i in range(2, n):
        dp[i] = max(dp[i - 1], dp[i - 2] + ganancias[i])

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
    return dp[n - 1], dias`,
    pseudocode: `ALGORITMO JuanElVago(G):
    n ← longitud(G)
    SI n == 0: RETORNAR (0, [])
    SI n == 1: RETORNAR (G[0], [0])

    DP[0] ← G[0]
    DP[1] ← MAX(G[0], G[1])

    PARA i DESDE 2 HASTA n - 1:
        DP[i] ← MAX(DP[i - 1], DP[i - 2] + G[i])

    dias ← ReconstruirDias(DP, G, n - 1)
    RETORNAR (DP[n - 1], dias)`,
    correctnessExplanation: `Subestructura Óptima: Consideremos el subconjunto óptimo S* de días trabajados hasta el día i. Si el día i no pertenece a S*, S* debe ser óptimo para los primeros i-1 días (DP[i-1]). Si el día i pertenece a S*, por la restricción de no trabajar días consecutivos, el día i-1 no puede pertenecer a S*, por lo que S* \\ {i} debe ser óptimo para los primeros i-2 días (DP[i-2] + G[i]). Cualquier otra elección menor violaría la optimalidad por contradicción (cut-and-paste).`,
    timeComplexity: 'O(n) [Lineal]',
    spaceComplexity: 'O(n) [O(1) sin reconstrucción]'
  },

  'knapsack-greedy': {
    visualizerSlot: <KnapsackGreedyVisualizer />,
    canonicalPython: `def mochila_fraccionaria_greedy(items, capacidad):
    ordenados = sorted(items, key=lambda it: it.valor / it.peso, reverse=True)
    valor_total = 0.0
    cap_restante = capacidad
    asignaciones = []

    for it in ordenados:
        if cap_restante <= 0: break
        if it.peso <= cap_restante:
            asignaciones.append((it, 1.0))
            valor_total += it.valor
            cap_restante -= it.peso
        else:
            fraccion = cap_restante / it.peso
            asignaciones.append((it, fraccion))
            valor_total += it.valor * fraccion
            cap_restante = 0

    return valor_total, asignaciones`,
    pseudocode: `ALGORITMO MochilaFraccionaria_Greedy(items, W):
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

    RETORNAR (valor_total, asignaciones)`,
    correctnessExplanation: `Demostración por Argumento de Intercambio (Exchange Argument): Si existiera una solución óptima O distinta de la voraz G, sea k el primer elemento donde difieren. Dado que G toma la mayor fracción posible del elemento disponible con mayor densidad r_k, O debe tener o_k < g_k y compensar peso con algún elemento posterior j > k donde r_j <= r_k. Reemplazando una fracción de j por k en O incrementa o mantiene el valor total, transformando O en G sin perder calidad.`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  },

  'merge-sort': {
    visualizerSlot: <MergeSortVisualizer />,
    canonicalPython: `def merge_sort(arr: list[int]) -> list[int]:
    if len(arr) <= 1: return list(arr)
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left: list[int], right: list[int]) -> list[int]:
    result = []
    i, j = 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result`,
    pseudocode: `ALGORITMO MergeSort(A, p, r):
    SI p < r:
        q ← ⌊(p + r) / 2⌋
        MergeSort(A, p, q)
        MergeSort(A, q + 1, r)
        Merge(A, p, q, r)`,
    correctnessExplanation: `Invariante del procedimiento Merge: al inicio de cada iteración, el arreglo resultado contiene los k elementos menores de ambos subarreglos en orden no decreciente. La altura del árbol de recursión es log2(n) y en cada nivel se realizan O(n) operaciones lineales, resultando en Θ(n log n).`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  },

  'max-subarray-dyc': {
    visualizerSlot: <MaxSubarrayVisualizer />,
    discoverPlaygroundSlot: <MaxSubarrayPlayground />,
    canonicalPython: `def subarreglo_maxima_suma(arr: list[int]) -> list[int]:
    if len(arr) <= 1: return list(arr)
    med = len(arr) // 2
    izq = subarreglo_maxima_suma(arr[:med])
    der = subarreglo_maxima_suma(arr[med:])
    cruzado = subarreglo_cruzado(arr)
    sumas = (sum(izq) if izq else -float('inf'), sum(der) if der else -float('inf'), sum(cruzado) if cruzado else -float('inf'))
    m = max(sumas)
    return izq if m == sumas[0] else (der if m == sumas[1] else cruzado)`,
    pseudocode: `ALGORITMO MaxSubarregloDyC(A, bajo, alto):
    SI bajo == alto: RETORNAR (bajo, alto, A[bajo])
    medio ← ⌊(bajo + alto) / 2⌋
    izq ← MaxSubarregloDyC(A, bajo, medio)
    der ← MaxSubarregloDyC(A, medio + 1, alto)
    cruzado ← SubarregloCruzado(A, bajo, medio, alto)
    RETORNAR el de máxima suma entre (izq, der, cruzado)`,
    correctnessExplanation: `Teorema de Descomposición Disjunta: Todo subarreglo contiguo A[i..j] cae en una de tres categorías exhaustivas: (1) 100% en mitad izquierda, (2) 100% en mitad derecha, o (3) cruzando el punto medio. Por Teorema Maestro con a=2, b=2, c=1 (T(n) = 2T(n/2) + O(n)), la complejidad es Θ(n log n).`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  },

  'max-flow': {
    visualizerSlot: <MaxFlowVisualizer />,
    canonicalPython: `from collections import deque

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
                    visitados.add(v); padre[v] = u; cola.append(v)
        if sumidero not in padre: break

        delta = min(residual[padre[curr]][curr] for curr in iter(lambda: curr, fuente)) # bottleneck
        curr = sumidero
        while curr != fuente:
            p = padre[curr]; residual[p][curr] -= delta; residual[curr][p] += delta; curr = p
        flujo_total += delta
    return flujo_total`,
    pseudocode: `ALGORITMO EdmondsKarp(G, s, t):
    flujo_total ← 0
    MIENTRAS exista camino simple P de s a t en red residual G_f (BFS):
        Δ ← MIN{ c_f(u, v) : (u, v) ∈ P }
        flujo_total ← flujo_total + Δ
        AumentarFlujo(P, Δ)
    RETORNAR (flujo_total, CorteMinimo)`,
    correctnessExplanation: `Teorema Max-Flow Min-Cut: Al no existir más caminos de aumento en G_f, sea A* el conjunto alcanzable desde s y B* = V \\ A*. Toda arista de A* a B* está saturada y toda arista inversa vacía. Por ende v(f) = c(A*, B*), demostrando que f es máximo y (A*, B*) es corte mínimo.`,
    timeComplexity: 'O(V · E²)',
    spaceComplexity: 'O(V + E)'
  },

  'linear-programming-formulation': {
    visualizerSlot: <LinearProgrammingVisualizer />,
    discoverPlaygroundSlot: <LinearProgrammingPlayground />,
    canonicalPython: `def resolver_lp_2d(c, restricciones):
    todas = list(restricciones) + [(-1.0, 0.0, 0.0), (0.0, -1.0, 0.0)]
    vertices = []
    # Intersecar pares de restricciones y filtrar puntos factibles
    return {'optimo': mejor_pt, 'valor_maximo': mejor_z}`,
    pseudocode: `ALGORITMO ResolverLP2D(c, Restricciones):
    R ← Restricciones ∪ { x ≥ 0, y ≥ 0 }
    V ← { Intersecciones factibles }
    RETORNAR argmax { c^T · v : v ∈ V }`,
    correctnessExplanation: `Teorema Fundamental de Programación Lineal: La región factible es un poliedro convexo. Si la función objetivo lineal tiene un óptimo finito, se alcanza en al menos un vértice extremo.`,
    timeComplexity: 'O(m²)',
    spaceComplexity: 'O(m)'
  },

  'vertex-cover-reduction': {
    visualizerSlot: <ReductionIsVcVisualizer />,
    discoverPlaygroundSlot: <ReductionIsVcPlayground />,
    canonicalPython: `def reducir_instancia_is_a_vc(vertices, aristas, k):
    return vertices, aristas, len(vertices) - k

def transformar_solucion_vc_a_is(vertices, cobertura):
    set_c = set(cobertura)
    return [v for v in vertices if v not in set_c]`,
    pseudocode: `ALGORITMO Reduccion_IS_a_VC(Grafo G, k):
    RETORNAR (G, |V| - k)`,
    correctnessExplanation: `Teorema de Complementariedad (K&T 8.1): S es Conjunto Independiente si y solo si V \\ S es Cobertura de Vértices.`,
    timeComplexity: 'O(|V| + |E|)',
    spaceComplexity: 'O(|V|)'
  },

  'vertex-cover-approx': {
    visualizerSlot: <VertexCoverApproxVisualizer />,
    discoverPlaygroundSlot: <VertexCoverApproxPlayground />,
    canonicalPython: `def cobertura_vertices_2aprox(vertices, aristas):
    cobertura = set(); matching = []
    for u, v in aristas:
        if u not in cobertura and v not in cobertura:
            matching.append((u, v)); cobertura.add(u); cobertura.add(v)
    return sorted(list(cobertura)), matching`,
    pseudocode: `ALGORITMO CoberturaVertices_2Aprox(G = (V, E)):
    C ← ∅; M ← []
    PARA CADA (u, v) EN E:
        SI u ∉ C Y v ∉ C:
            M.Agregar((u, v)); C.Agregar(u); C.Agregar(v)
    RETORNAR (C, M)`,
    correctnessExplanation: `Cota de 2-Aproximación (K&T 11.1): M es un matching maximal de aristas disjuntas. Toda cobertura óptima C* debe contener al menos un vértice por cada arista de M, por lo que |C*| >= |M|. Como |C| = 2|M| <= 2|C*|, el ratio rho <= 2.`,
    timeComplexity: 'O(|V| + |E|)',
    spaceComplexity: 'O(|V| + |E|)'
  },

  'randomized-fair-coin': {
    visualizerSlot: <RandomizedFairCoinVisualizer />,
    discoverPlaygroundSlot: <RandomizedFairCoinPlayground />,
    canonicalPython: `def moneda_equilibrada(fuente_cargada):
    while True:
        t1, t2 = fuente_cargada(), fuente_cargada()
        if t1 == 0 and t2 == 1: return 0
        if t1 == 1 and t2 == 0: return 1`,
    pseudocode: `ALGORITMO MonedaEquilibrada_VonNeumann(fuente):
    REPETIR:
        t1, t2 ← fuente(), fuente()
        SI t1 = 0 Y t2 = 1: RETORNAR 0
        SI t1 = 1 Y t2 = 0: RETORNAR 1`,
    correctnessExplanation: `Teorema de Von Neumann (1951): P((0, 1)) = (1-p)p = p(1-p) = P((1, 0)). Por conmutatividad, los eventos son equiprobables. Tiempo esperado E[T] = 1/(2p(1-p)) = O(1).`,
    timeComplexity: 'O(1) esperado [Las Vegas]',
    spaceComplexity: 'O(1)'
  },

  'road-antennas-greedy': {
    visualizerSlot: <RoadAntennasVisualizer />,
    discoverPlaygroundSlot: <RoadAntennasPlayground />,
    canonicalPython: `def construir_antenas(casas: list[float], radio: float) -> list[float]:
    casas_ord = sorted(casas); antenas = []; i = 0; n = len(casas_ord)
    while i < n:
        pos = casas_ord[i] + radio
        antenas.append(pos)
        while i < n and casas_ord[i] <= pos + radio: i += 1
    return antenas`,
    pseudocode: `ALGORITMO ConstruirAntenas(casas, radio):
    OrdenarAscendente(casas); antenas ← []
    MIENTRAS i < n:
        pos ← casas[i] + radio; antenas.Agregar(pos)
        AvanzarCasasCubiertas(pos + radio)`,
    correctnessExplanation: `Greedy Stays Ahead: Por inducción, cada antena voraz se posiciona tan o más a la derecha que la antena óptima correspondiente, garantizando el mínimo número de antenas k = m.`,
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)'
  },

  'subset-sum-backtracking': {
    visualizerSlot: <SubsetSumVisualizer />,
    discoverPlaygroundSlot: <SubsetSumPlayground />,
    canonicalPython: `def subconjuntos_que_suman(numeros: list[int], objetivo: int) -> list[list[int]]:
    elementos = sorted([x for x in numeros if 0 < x <= objetivo], reverse=True)
    soluciones, actual = [], []
    def backtrack(idx, suma, rem):
        if suma == objetivo: soluciones.append(list(actual)); return
        if idx >= len(elementos): return
        elem = elementos[idx]
        if suma + elem <= objetivo: # Poda exceso
            actual.append(elem); backtrack(idx + 1, suma + elem, rem - elem); actual.pop()
        if suma + rem - elem >= objetivo: # Poda déficit
            backtrack(idx + 1, suma, rem - elem)
    backtrack(0, 0, sum(elementos))
    return soluciones`,
    pseudocode: `ALGORITMO SubconjuntosQueSuman(numeros, objetivo):
    OrdenarDecreciente(numeros)
    Backtrack(idx=0, suma=0, remanente=SumaTotal)`,
    correctnessExplanation: `Invariantes de poda: (1) Si suma + elem > S, la suma futura solo aumentará (Poda por exceso). (2) Si suma + remanente < S, incluso tomando todo no se alcanza S (Poda por déficit).`,
    timeComplexity: 'O(2ⁿ) [Podas podan drásticamente el espacio práctico]',
    spaceComplexity: 'O(n) [Pila de llamadas]'
  },

  'coin-change-dp': {
    visualizerSlot: <CoinChangeVisualizer />,
    discoverPlaygroundSlot: <CoinChangePlayground />,
    canonicalPython: `def cambio_monedas_minimo(monedas: list[int], objetivo: int) -> list[int]:
    if objetivo <= 0 or not monedas: return []
    dp = [float('inf')] * (objetivo + 1); eleccion = [-1] * (objetivo + 1); dp[0] = 0
    for v in range(1, objetivo + 1):
        for c in sorted([x for x in monedas if x > 0]):
            if c <= v and dp[v - c] + 1 < dp[v]:
                dp[v] = dp[v - c] + 1; eleccion[v] = c
    if dp[objetivo] == float('inf'): return []
    res = []; act = objetivo
    while act > 0: res.append(eleccion[act]); act -= eleccion[act]
    return sorted(res, reverse=True)`,
    pseudocode: `ALGORITMO CambioMonedasMinimo(monedas, objetivo):
    DP[0] ← 0
    PARA v ← 1 HASTA objetivo:
        DP[v] ← MIN { DP[v - c] + 1 : c ∈ monedas, c ≤ v }
    RETORNAR Reconstruir(DP, eleccion)`,
    correctnessExplanation: `Principio de Bellman: Retirar una moneda c_1 de una solución óptima para V deja una solución óptima para V - c_1. Probar todas las monedas válidas garantiza el mínimo global en O(V · |C|).`,
    timeComplexity: 'O(V · |C|)',
    spaceComplexity: 'O(V)'
  },

  'peak-finding-dyc': {
    visualizerSlot: <PeakFindingVisualizer />,
    discoverPlaygroundSlot: <PeakFindingPlayground />,
    canonicalPython: `def buscar_pico(arr: list[int]) -> int:
    if not arr: return -1
    ini, fin = 0, len(arr) - 1
    while ini <= fin:
        med = (ini + fin) // 2
        if med > 0 and arr[med] < arr[med - 1]: fin = med - 1
        elif med < len(arr) - 1 and arr[med] < arr[med + 1]: ini = med + 1
        else: return med
    return ini`,
    pseudocode: `ALGORITMO BuscarPico(A):
    MIENTRAS ini <= fin:
        med ← (ini + fin) DIV 2
        SI A[med] < A[med - 1]: fin ← med - 1
        SINO SI A[med] < A[med + 1]: ini ← med + 1
        SINO: RETORNAR med`,
    correctnessExplanation: `Gradiente Ascendente: Si el elemento central es menor que su vecino izquierdo, el gradiente sube hacia la izquierda; un pico está garantizado en esa mitad. T(n) = T(n/2) + O(1) = Θ(log n).`,
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)'
  },

  'lcs-dp': {
    visualizerSlot: <LcsVisualizer />,
    discoverPlaygroundSlot: <LcsPlayground />,
    canonicalPython: `def subsecuencia_comun_mas_larga(s1: str, s2: str) -> str:
    m, n = len(s1), len(s2)
    if m == 0 or n == 0: return ""
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = dp[i-1][j-1] + 1 if s1[i-1] == s2[j-1] else max(dp[i-1][j], dp[i][j-1])
    res = []; i, j = m, n
    while i > 0 and j > 0:
        if s1[i-1] == s2[j-1]: res.append(s1[i-1]); i -= 1; j -= 1
        elif dp[i-1][j] >= dp[i][j-1]: i -= 1
        else: j -= 1
    return "".join(reversed(res))`,
    pseudocode: `ALGORITMO LCS(X, Y):
    PARA i ← 1 HASTA m:
        PARA j ← 1 HASTA n:
            c[i, j] ← c[i-1, j-1] + 1 SI X[i-1] = Y[j-1] SINO MAX(c[i-1, j], c[i, j-1])
    RETORNAR Reconstruir(c)`,
    correctnessExplanation: `Subestructura óptima CLRS 15.4: Si x_m = y_n, z_k = x_m y Z_{k-1} es LCS de los prefijos. Si no, el LCS coincide con el mejor entre acortar X o Y. Complejidad Θ(m · n).`,
    timeComplexity: 'O(m · n)',
    spaceComplexity: 'O(m · n)'
  },

  'weighted-interval-scheduling': {
    visualizerSlot: <WeightedIntervalVisualizer />,
    discoverPlaygroundSlot: <WeightedIntervalPlayground />,
    canonicalPython: `def planificar_intervalos_ponderados(intervalos: list[list[int]]) -> list[list[int]]:
    if not intervalos: return []
    ordenados = sorted(intervalos, key=lambda x: x[1])
    n = len(ordenados)
    p = [0] * (n + 1)
    for j in range(1, n + 1):
        # Búsqueda binaria para el mayor i < j compatible
        pass
    opt = [0] * (n + 1)
    for j in range(1, n + 1):
        opt[j] = max(opt[j - 1], ordenados[j - 1][2] + opt[p[j]])
    return seleccionados`,
    pseudocode: `ALGORITMO PlanificarIntervalosPonderados(intervalos):
    OrdenarPorTiempoDeFin(intervalos)
    Precomputar_p_vía_búsqueda_binaria()
    PARA j ← 1 HASTA n:
        OPT[j] ← MAX(OPT[j - 1], v_j + OPT[p[j]])`,
    correctnessExplanation: `Ecuación de Bellman K&T 6.1: Para la tarea j, o bien no pertenece al óptimo (OPT(j-1)), o sí pertenece (v_j + OPT(p(j))). Búsqueda binaria precomputa p(j) en O(n log n).`,
    timeComplexity: 'O(n log n) [Búsqueda binaria de p(j) + ordenamiento]',
    spaceComplexity: 'O(n) [Arreglos OPT de memoización y punteros p(j)]'
  },

  'inversion-counting-dyc': {
    visualizerSlot: <InversionCountingVisualizer />,
    discoverPlaygroundSlot: <InversionCountingPlayground />,
    canonicalPython: `def contar_inversiones(arreglo: list[int]) -> int:
    def sort_and_count(arr):
        if len(arr) <= 1: return 0, list(arr)
        med = len(arr) // 2
        inv_izq, izq = sort_and_count(arr[:med])
        inv_der, der = sort_and_count(arr[med:])
        inv_cruzadas, mezclado = merge_and_count(izq, der)
        return (inv_izq + inv_der + inv_cruzadas), mezclado
    total, _ = sort_and_count(arreglo)
    return total`,
    pseudocode: `ALGORITMO ContarInversiones(A):
    (invIzq, L) ← OrdenarYContar(A[0..mid])
    (invDer, R) ← OrdenarYContar(A[mid..n])
    (invCruzadas, M) ← IntercalarYContar(L, R)
    RETORNAR invIzq + invDer + invCruzadas`,
    correctnessExplanation: `Partición Disjunta: Toda inversión (i, j) está en la mitad izquierda, en la derecha, o cruza la mitad. Al intercalar L y R ordenados, si der[j] < izq[i], der[j] forma inversiones con todos los remanentes de izq (+ len(izq) - i).`,
    timeComplexity: 'O(n log n) [Teorema Maestro T(n) = 2T(n/2) + O(n)]',
    spaceComplexity: 'O(n) [Arreglos auxiliares de mezcla]'
  },

  'huffman-coding-greedy': {
    visualizerSlot: <HuffmanVisualizer />,
    discoverPlaygroundSlot: <HuffmanPlayground />,
    canonicalPython: `import heapq

def codificar_huffman(frecuencias: dict[str, int]) -> dict[str, str]:
    if not frecuencias: return {}
    heap = [(f, i, c, None, None) for i, (c, f) in enumerate(frecuencias.items())]
    heapq.heapify(heap)
    while len(heap) > 1:
        f1, _, c1, l1, r1 = heapq.heappop(heap)
        f2, _, c2, l2, r2 = heapq.heappop(heap)
        heapq.heappush(heap, (f1 + f2, -1, None, (f1, c1, l1, r1), (f2, c2, l2, r2)))
    # Asignar prefijos binarios recorriendo el árbol
    return codigos`,
    pseudocode: `ALGORITMO CodificarHuffman(frecuencias):
    Q ← MinHeap(frecuencias)
    MIENTRAS |Q| > 1:
        izq ← ExtraerMinimo(Q); der ← ExtraerMinimo(Q)
        padre ← Nodo(izq.f + der.f, izq, der)
        Insertar(Q, padre)
    RETORNAR GenerarCodigosPrefijo(Raiz(Q))`,
    correctnessExplanation: `Optimalidad de Huffman CLRS 16.3 / K&T 4.8: Los dos símbolos de menor frecuencia son hermanos en la máxima profundidad. Fusionarlos vorazmente en un meta-nodo preserva la subestructura óptima.`,
    timeComplexity: 'O(k log k) [k fusiones voraces con Min-Heap priority queue]',
    spaceComplexity: 'O(k) [Árbol binario de prefijo y tabla de códigos]'
  },

  'graph-coloring-backtracking': {
    visualizerSlot: <GraphColoringVisualizer />,
    discoverPlaygroundSlot: <GraphColoringPlayground />,
    canonicalPython: `def colorear_grafo(grafo: dict[str, list[str]], k: int) -> dict[str, int] | None:
    vertices = list(grafo.keys())
    colores = {}

    def es_seguro(v: str, c: int) -> bool:
        for vecino in grafo.get(v, []):
            if colores.get(vecino) == c:
                return False
        return True

    def backtrack(idx: int) -> bool:
        if idx == len(vertices):
            return True

        v = vertices[idx]
        for c in range(1, k + 1):
            if es_seguro(v, c):
                colores[v] = c
                if backtrack(idx + 1):
                    return True
                del colores[v]  # Backtracking / desasignar

        return False

    return colores if backtrack(0) else None`,
    pseudocode: `ALGORITMO ColorearGrafo(grafo, k):
    vertices ← Claves(grafo)
    colores ← MapaVacio()

    FUNCION EsSeguro(v, c):
        PARA CADA vecino EN grafo[v]:
            SI colores[vecino] = c:
                RETORNAR Falso
        RETORNAR Verdadero

    FUNCION Backtrack(idx):
        SI idx = Longitud(vertices):
            RETORNAR Verdadero

        v ← vertices[idx]
        PARA c DESDE 1 HASTA k:
            SI EsSeguro(v, c):
                colores[v] ← c
                SI Backtrack(idx + 1):
                    RETORNAR Verdadero
                Eliminar(colores, v)  // Deshacer elección

        RETORNAR Falso

    SI Backtrack(0):
        RETORNAR colores
    SINO:
        RETORNAR Nulo`,
    correctnessExplanation: `Optimalidad y Poda en Coloreo de Grafos (Karp 1972 / K&T 8.4): En cada nivel de recursión idx, los primeros idx vértices están coloreados con valores válidos sin conflicto. La función EsSeguro poda inmediatamente cualquier rama que intente asignar a un vértice el mismo color que uno de sus vecinos adyacentes, evitando la exploración de los k^(|V|-idx) estados descendientes. Si la recursión finaliza sin éxito, se demuestra formalmente que χ(G) > k.`,
    timeComplexity: 'O(k^|V|) [Peor caso exhaustivo] / Bounded Search Tree con poda temprana',
    spaceComplexity: 'O(|V|) [Pila de llamadas de recursión y asignación de colores]'
  }
};

export function getExerciseViewConfig(exerciseId: string): ExerciseViewConfig {
  return EXERCISE_VIEW_REGISTRY[exerciseId] || {};
}
