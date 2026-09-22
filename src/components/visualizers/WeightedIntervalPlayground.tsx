import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import {
  WeightedInterval,
  solveWeightedIntervals,
  solveWeightedIntervalsGreedy
} from '../../engine/algorithms/weightedIntervalValidator';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './WeightedIntervalPlayground.css';

interface Preset {
  name: { es: string; en: string };
  intervals: WeightedInterval[];
}

const PRESETS: Preset[] = [
  {
    name: {
      es: '★ Trampa Greedy (Greedy pierde por mucho)',
      en: '★ Greedy Trap (Greedy falls far behind)'
    },
    intervals: [
      { id: 'T1', start: 0, end: 3, weight: 2 },
      { id: 'T2', start: 1, end: 6, weight: 10 },
      { id: 'T3', start: 4, end: 8, weight: 3 },
      { id: 'T4', start: 7, end: 11, weight: 8 },
      { id: 'T5', start: 9, end: 12, weight: 4 }
    ]
  },
  {
    name: {
      es: 'Kleinberg & Tardos (Ejemplo 6.1)',
      en: 'Kleinberg & Tardos (Example 6.1)'
    },
    intervals: [
      { id: 'A', start: 0, end: 4, weight: 3 },
      { id: 'B', start: 1, end: 6, weight: 4 },
      { id: 'C', start: 5, end: 8, weight: 4 },
      { id: 'D', start: 3, end: 9, weight: 7 },
      { id: 'E', start: 7, end: 10, weight: 2 },
      { id: 'F', start: 8, end: 11, weight: 1 }
    ]
  },
  {
    name: {
      es: 'Pesos Uniformes (Greedy = Óptimo)',
      en: 'Uniform Weights (Greedy = Optimal)'
    },
    intervals: [
      { id: 'J1', start: 1, end: 3, weight: 5 },
      { id: 'J2', start: 2, end: 5, weight: 5 },
      { id: 'J3', start: 4, end: 7, weight: 5 },
      { id: 'J4', start: 6, end: 9, weight: 5 }
    ]
  }
];

export const WeightedIntervalPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markCompleted } = useStudentProgress();
  const [intervals, setIntervals] = useState<WeightedInterval[]>(PRESETS[0].intervals);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const maxTime = useMemo(() => {
    return Math.max(...intervals.map((i) => i.end), 12);
  }, [intervals]);

  const optimalSolution = useMemo(() => {
    return solveWeightedIntervals(intervals);
  }, [intervals]);

  const greedySolution = useMemo(() => {
    return solveWeightedIntervalsGreedy(intervals);
  }, [intervals]);

  const optimalWeight = useMemo(() => {
    return optimalSolution.reduce((sum, item) => sum + item.weight, 0);
  }, [optimalSolution]);

  const greedyWeight = useMemo(() => {
    return greedySolution.reduce((sum, item) => sum + item.weight, 0);
  }, [greedySolution]);

  // User selection stats and collision check
  const userStatus = useMemo(() => {
    const chosen = intervals.filter((t) => selectedIds.includes(t.id));
    const sorted = [...chosen].sort((a, b) => a.start - b.start);

    let hasCollision = false;
    let collisionPair: [string, string] | null = null;

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].end > sorted[i + 1].start) {
        hasCollision = true;
        collisionPair = [sorted[i].id, sorted[i + 1].id];
        break;
      }
    }

    const totalWeight = chosen.reduce((sum, t) => sum + t.weight, 0);
    const isOptimal = !hasCollision && totalWeight === optimalWeight && chosen.length > 0;

    return {
      chosen,
      hasCollision,
      collisionPair,
      totalWeight,
      isOptimal
    };
  }, [intervals, selectedIds, optimalWeight]);

  useEffect(() => {
    if (userStatus.isOptimal) {
      markCompleted('weighted-interval-scheduling');
    }
  }, [userStatus.isOptimal]);

  const toggleTask = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const loadGreedy = () => {
    setSelectedIds(greedySolution.map((t) => t.id));
  };

  const handlePreset = (p: Preset) => {
    setIntervals(p.intervals);
    setSelectedIds([]);
  };

  return (
    <div className="weighted-interval-playground">
      <div className="playground-header">
        <h3>
          {language === 'es'
            ? 'Laboratorio: ¿Puedes superar a la Programación Dinámica?'
            : 'Playground: Can you beat Dynamic Programming?'}
        </h3>
        <p>
          {language === 'es'
            ? 'Haz clic en las tareas para seleccionarlas. Recuerda que no pueden solaparse en el tiempo. ¡Intenta maximizar la ganancia total!'
            : 'Click on tasks to select them. Remember they cannot overlap in time. Try to maximize total weight!'}
        </p>
      </div>

      {/* Presets */}
      <div className="presets-row">
        <span className="presets-label">
          {language === 'es' ? 'Escenarios:' : 'Scenarios:'}
        </span>
        <div className="preset-buttons">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="chip-button"
              onClick={() => handlePreset(p)}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Schedule */}
      <div className="interactive-tracks-box">
        <div className="tracks-header">
          <span>{language === 'es' ? 'Toca las tareas para activar/desactivar:' : 'Click tasks to toggle:'}</span>
          <div className="quick-buttons">
            <button className="btn-load greedy-load" onClick={loadGreedy}>
              {language === 'es' ? '👉 Probar Heurística Greedy' : '👉 Test Greedy Heuristic'}
            </button>
            <button
              className="btn-load clear-load"
              onClick={() => setSelectedIds([])}
              disabled={selectedIds.length === 0}
            >
              {language === 'es' ? 'Limpiar' : 'Clear'}
            </button>
          </div>
        </div>

        <div className="tracks-list">
          {intervals.map((task) => {
            const isSelected = selectedIds.includes(task.id);
            const isOpt = optimalSolution.some((t) => t.id === task.id);

            const leftPct = (task.start / maxTime) * 100;
            const widthPct = ((task.end - task.start) / maxTime) * 100;

            let rowClass = 'interactive-track-row';
            if (isSelected) rowClass += ' task-active';

            return (
              <div
                key={task.id}
                className={rowClass}
                onClick={() => toggleTask(task.id)}
              >
                <div className="task-meta">
                  <span className="task-title">{task.id}</span>
                  <span className="task-val">${task.weight}</span>
                </div>
                <div className="track-lane">
                  <div
                    className={`lane-interval-bar ${isSelected ? 'selected' : ''} ${isOpt && userStatus.isOptimal ? 'opt-match' : ''}`}
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <span className="lane-text">{task.id} (${task.weight})</span>
                    <span className="lane-range">[{task.start}, {task.end}]</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Board */}
      <div className="comparison-board">
        {/* User Attempt */}
        <div className={`score-card ${userStatus.hasCollision ? 'card-collision' : userStatus.isOptimal ? 'card-opt' : 'card-subopt'}`}>
          <div className="card-tag">
            {language === 'es' ? 'Tu Selección Manual' : 'Your Selection'}
          </div>
          <div className="card-main">
            <span className="main-stat">${userStatus.totalWeight}</span>
            <span className="main-count">
              ({selectedIds.length} {language === 'es' ? 'tareas' : 'tasks'})
            </span>
          </div>
          <div className="card-feedback">
            {userStatus.hasCollision ? (
              <span className="status-err">
                ⚠️ {language === 'es'
                  ? `Colisión: Tarea ${userStatus.collisionPair?.[0]} se superpone con ${userStatus.collisionPair?.[1]}!`
                  : `Collision: Task ${userStatus.collisionPair?.[0]} overlaps with ${userStatus.collisionPair?.[1]}!`}
              </span>
            ) : userStatus.isOptimal ? (
              <span className="status-ok">
                🎉 {language === 'es' ? '¡Excelente! Encontraste el óptimo global.' : 'Awesome! You found global optimum.'}
              </span>
            ) : selectedIds.length > 0 ? (
              <span className="status-warn">
                {language === 'es'
                  ? `Compatible pero subóptimo ($${userStatus.totalWeight} < $${optimalWeight}).`
                  : `Compatible but suboptimal ($${userStatus.totalWeight} < $${optimalWeight}).`}
              </span>
            ) : (
              <span className="status-prompt">
                {language === 'es' ? 'Toca tareas para armar tu propuesta.' : 'Click tasks to assemble your plan.'}
              </span>
            )}
          </div>
        </div>

        {/* DP Benchmark */}
        <div className="score-card dp-card">
          <div className="card-tag">
            {language === 'es' ? 'Óptimo (Programación Dinámica)' : 'Optimal (Dynamic Programming)'}
          </div>
          <div className="card-main">
            <span className="main-stat">${optimalWeight}</span>
            <span className="main-items">
              {userStatus.isOptimal
                ? `[${optimalSolution.map((t) => t.id).join(', ')}]`
                : language === 'es'
                ? '[??? ¡Encontrá el conjunto!]'
                : '[??? Find the set!]'}
            </span>
          </div>
          <div className="card-feedback status-ok">
            {language === 'es'
              ? 'Garantizado por Bellman en O(n log n).'
              : 'Guaranteed by Bellman in O(n log n).'}
          </div>
        </div>

        {/* Greedy Benchmark */}
        <div className="score-card greedy-card">
          <div className="card-tag greedy-tag">
            {language === 'es' ? 'Heurística Greedy' : 'Greedy Heuristic'}
          </div>
          <div className="card-main">
            <span className="main-stat greedy-stat">${greedyWeight}</span>
            <span className="main-items">[{greedySolution.map((t) => t.id).join(', ')}]</span>
          </div>
          <div className="card-feedback">
            {greedyWeight < optimalWeight ? (
              <span className="status-err">
                {language === 'es'
                  ? `Greedy pierde $${optimalWeight - greedyWeight} de ganancia.`
                  : `Greedy misses $${optimalWeight - greedyWeight} in profit.`}
              </span>
            ) : (
              <span>{language === 'es' ? 'Empata con el óptimo.' : 'Ties with optimal.'}</span>
            )}
          </div>
        </div>
      </div>

      {/* Educational Insight */}
      <div className="pedagogy-tip">
        <h4>
          {language === 'es'
            ? '💡 ¿Por qué es tan importante la función p(j)?'
            : '💡 Why is the predecessor function p(j) so crucial?'}
        </h4>
        <p>
          {language === 'es'
            ? 'Si no ordenáramos los intervalos, para saber qué tareas previas son compatibles con j tendríamos que buscar entre todas las demás tareas, lo que daría una búsqueda lenta o exponenciales subproblemas no encadenados. Al ordenar por tiempo de fin y precalcular p(j) con búsqueda binaria, cada decisión de incluir o no una tarea se evalúa en tiempo O(1), logrando un algoritmo estelar en O(n log n).'
            : 'Without ordering, checking compatibility would require evaluating all previous subsets. By sorting by finish time and precomputing p(j) via binary search, each Bellman decision takes O(1) time, yielding a stellar O(n log n) total runtime.'}
        </p>
      </div>
    </div>
  );
};
