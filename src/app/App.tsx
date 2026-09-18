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
import { KnapsackGreedyVisualizer } from '../components/visualizers/KnapsackGreedyVisualizer';
import { MergeSortVisualizer } from '../components/visualizers/MergeSortVisualizer';
import { MaxSubarrayVisualizer } from '../components/visualizers/MaxSubarrayVisualizer';
import { MaxSubarrayPlayground } from '../components/visualizers/MaxSubarrayPlayground';
import { MaxFlowVisualizer } from '../components/visualizers/MaxFlowVisualizer';
import { ReductionIsVcVisualizer } from '../components/visualizers/ReductionIsVcVisualizer';
import { ReductionIsVcPlayground } from '../components/visualizers/ReductionIsVcPlayground';
import { VertexCoverApproxVisualizer } from '../components/visualizers/VertexCoverApproxVisualizer';
import { VertexCoverApproxPlayground } from '../components/visualizers/VertexCoverApproxPlayground';
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
