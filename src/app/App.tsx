import React, { useState, useEffect } from 'react';
import { registry } from '../engine/registry';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseView } from '../components/ExerciseView';
import { NQueensVisualizer } from '../components/visualizers/NQueensVisualizer';
import { NQueensPlayground } from '../components/visualizers/NQueensPlayground';
import { IntervalSchedulingVisualizer } from '../components/visualizers/IntervalSchedulingVisualizer';
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

export const App: React.FC = () => {
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
        canonicalPython: INTERVALS_CANONICAL_PYTHON,
        pseudocode: INTERVALS_PSEUDOCODE,
        correctnessExplanation: INTERVALS_CORRECTNESS,
        timeComplexity: 'O(N log N)',
        spaceComplexity: 'O(N)'
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
        currentExerciseTitle={selectedExercise?.title.es}
      />

      <main className="app-main" id="main-content">
        {!selectedExercise ? (
          <>
            <section className="welcome-banner">
              <h2>Diseño y Análisis de Algoritmos</h2>
              <p>
                Aprende algoritmos fundamentales de forma interactiva y rigurosa. Observa su ejecución,
                comprende los invariantes de corrección y analiza su complejidad computacional.
              </p>
            </section>

            <section className="catalog-section">
              <div className="section-header">
                <h3>Categorías y Técnicas</h3>
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
        <p>Visual TDA — Principios: KISS · Separación Algoritmo/UI · Correctness Pedagógica</p>
      </footer>
    </div>
  );
};
