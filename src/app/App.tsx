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
import { MaxFlowVisualizer } from '../components/visualizers/MaxFlowVisualizer';
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
