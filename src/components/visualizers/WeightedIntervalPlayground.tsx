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
      es: 'Caso de Estudio: Falla de Heurística Greedy',
      en: 'Case Study: Greedy Heuristic Failure'
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

const INITIAL_CUSTOM_INTERVALS: WeightedInterval[] = [
  { id: 'I1', start: 0, end: 3, weight: 3 },
  { id: 'I2', start: 2, end: 6, weight: 8 },
  { id: 'I3', start: 5, end: 8, weight: 4 },
  { id: 'I4', start: 7, end: 10, weight: 6 }
];

export const WeightedIntervalPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePresetIndex, setActivePresetIndex] = useState<number | 'custom'>(0);
  const [customIntervals, setCustomIntervals] = useState<WeightedInterval[]>(INITIAL_CUSTOM_INTERVALS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  // Custom interval form state
  const [newId, setNewId] = useState<string>('');
  const [newStart, setNewStart] = useState<number>(1);
  const [newEnd, setNewEnd] = useState<number>(5);
  const [newWeight, setNewWeight] = useState<number>(6);
  const [customError, setCustomError] = useState<string | null>(null);

  const intervals = useMemo(() => {
    if (activePresetIndex === 'custom') return customIntervals;
    return PRESETS[activePresetIndex].intervals;
  }, [activePresetIndex, customIntervals]);

  // Sort intervals by finish time to compute p(j)
  const sortedIntervals = useMemo(() => {
    return [...intervals].sort((a, b) => a.end - b.end);
  }, [intervals]);

  // Compute p(j) for every interval in sortedIntervals
  // p(j) is the highest index i < j such that sortedIntervals[i].end <= sortedIntervals[j].start
  const pMap = useMemo(() => {
    const map: Record<string, { predId: string | null; predIndex: number }> = {};
    for (let j = 0; j < sortedIntervals.length; j++) {
      let predId: string | null = null;
      let predIndex = -1;
      for (let i = j - 1; i >= 0; i--) {
        if (sortedIntervals[i].end <= sortedIntervals[j].start) {
          predId = sortedIntervals[i].id;
          predIndex = i;
          break;
        }
      }
      map[sortedIntervals[j].id] = { predId, predIndex };
    }
    return map;
  }, [sortedIntervals]);

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
      markAttempted('weighted-interval-scheduling');
    }
  }, [userStatus.isOptimal, markAttempted]);

  const toggleTask = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const loadGreedy = () => {
    setSelectedIds(greedySolution.map((t) => t.id));
  };

  const handlePreset = (idx: number) => {
    setActivePresetIndex(idx);
    setSelectedIds([]);
    setCustomError(null);
    setHoveredTaskId(null);
  };

  const handleCustomMode = () => {
    setActivePresetIndex('custom');
    setSelectedIds([]);
    setCustomError(null);
    setHoveredTaskId(null);
  };

  const handleAddCustomInterval = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const trimmedId = (newId.trim() || `T${customIntervals.length + 1}`).toUpperCase();

    if (customIntervals.some((i) => i.id === trimmedId)) {
      setCustomError(language === 'es' ? `Ya existe una tarea con identificador "${trimmedId}".` : `Task with ID "${trimmedId}" already exists.`);
      return;
    }
    if (newStart < 0 || !Number.isInteger(newStart)) {
      setCustomError(language === 'es' ? 'El inicio debe ser un entero no negativo.' : 'Start must be a non-negative integer.');
      return;
    }
    if (newEnd <= newStart || !Number.isInteger(newEnd)) {
      setCustomError(language === 'es' ? 'El fin debe ser mayor al inicio.' : 'End must be strictly greater than start.');
      return;
    }
    if (newWeight <= 0 || !Number.isInteger(newWeight)) {
      setCustomError(language === 'es' ? 'El peso debe ser un entero positivo.' : 'Weight must be a positive integer.');
      return;
    }
    if (customIntervals.length >= 8) {
      setCustomError(language === 'es' ? 'Máximo 8 intervalos permitidos en el laboratorio.' : 'Maximum 8 intervals allowed in sandbox.');
      return;
    }

    const newItem: WeightedInterval = {
      id: trimmedId,
      start: newStart,
      end: newEnd,
      weight: newWeight
    };

    setCustomIntervals([...customIntervals, newItem]);
    setNewId('');
  };

  const handleRemoveCustomInterval = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (customIntervals.length <= 1) {
      setCustomError(language === 'es' ? 'Debe haber al menos un intervalo.' : 'Must have at least one interval.');
      return;
    }
    setCustomIntervals(customIntervals.filter((it) => it.id !== id));
    setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
  };

  const hoveredTask = intervals.find((t) => t.id === hoveredTaskId);
  const hoveredPred = hoveredTaskId ? pMap[hoveredTaskId]?.predId : null;

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
            ? 'Haz clic en las tareas para seleccionarlas. Pasa el cursor por cualquier intervalo para visualizar su función predecesora p(j), la clave matemática que permite formular la recurrencia de Bellman en O(n log n).'
            : 'Click tasks to select them. Hover over any interval to inspect its predecessor function p(j), the mathematical key enabling Bellman recurrence in O(n log n).'}
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
              className={`chip-button ${activePresetIndex === idx ? 'active' : ''}`}
              onClick={() => handlePreset(idx)}
            >
              {p.name[language]}
            </button>
          ))}
          <button
            className={`chip-button ${activePresetIndex === 'custom' ? 'active' : ''}`}
            onClick={handleCustomMode}
          >
            {language === 'es' ? 'Caso propio' : 'Custom Case'}
          </button>
        </div>
      </div>

      {/* Custom interval editor when activePresetIndex === 'custom' */}
      {activePresetIndex === 'custom' && (
        <div className="custom-interval-editor">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
              {language === 'es' ? 'Definir tareas de tu instancia propia:' : 'Define tasks for your custom instance:'}
            </span>
            <button
              type="button"
              className="chip-button"
              onClick={() => {
                setCustomIntervals(INITIAL_CUSTOM_INTERVALS);
                setSelectedIds([]);
                setCustomError(null);
              }}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              {language === 'es' ? 'Restablecer tareas' : 'Reset tasks'}
            </button>
          </div>

          <form onSubmit={handleAddCustomInterval} className="custom-interval-form">
            <div className="custom-interval-group" style={{ width: '80px' }}>
              <label>{language === 'es' ? 'ID:' : 'ID:'}</label>
              <input
                type="text"
                placeholder="T5"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                maxLength={4}
              />
            </div>
            <div className="custom-interval-group" style={{ width: '80px' }}>
              <label>{language === 'es' ? 'Inicio:' : 'Start:'}</label>
              <input
                type="number"
                min="0"
                max="20"
                value={newStart}
                onChange={(e) => setNewStart(Math.max(0, parseInt(e.target.value, 10) || 0))}
              />
            </div>
            <div className="custom-interval-group" style={{ width: '80px' }}>
              <label>{language === 'es' ? 'Fin:' : 'End:'}</label>
              <input
                type="number"
                min="1"
                max="25"
                value={newEnd}
                onChange={(e) => setNewEnd(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>
            <div className="custom-interval-group" style={{ width: '80px' }}>
              <label>{language === 'es' ? 'Peso ($):' : 'Weight ($):'}</label>
              <input
                type="number"
                min="1"
                max="99"
                value={newWeight}
                onChange={(e) => setNewWeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>
            <button
              type="submit"
              className="chip-button"
              style={{ height: '32px', background: 'var(--accent)', color: '#fff', border: 'none' }}
            >
              {language === 'es' ? '+ Agregar Tarea' : '+ Add Task'}
            </button>
          </form>

          {customError && (
            <div style={{ color: 'var(--color-error, #dc2626)', fontSize: '0.8rem' }}>
              {customError}
            </div>
          )}
        </div>
      )}

      {/* Predecessor Function Callout Banner */}
      {hoveredTask && (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderLeft: '4px solid #38bdf8',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: 'var(--text)'
          }}
        >
          <strong>
            {language === 'es'
              ? `Función Predecesora p(${hoveredTask.id}):`
              : `Predecessor Function p(${hoveredTask.id}):`}
          </strong>{' '}
          {hoveredPred ? (
            language === 'es' ? (
              <span>
                Última tarea compatible antes de {hoveredTask.start}:{' '}
                <strong style={{ color: '#10b981' }}>{hoveredPred}</strong>. La recurrencia evalúa:{' '}
                <code>OPT({hoveredTask.id}) = max(v_{'{' + hoveredTask.id + '}'} + OPT({hoveredPred}), OPT(ant))</code>.
              </span>
            ) : (
              <span>
                Latest compatible task before {hoveredTask.start}:{' '}
                <strong style={{ color: '#10b981' }}>{hoveredPred}</strong>. Recurrence evaluates:{' '}
                <code>OPT({hoveredTask.id}) = max(v_{'{' + hoveredTask.id + '}'} + OPT({hoveredPred}), OPT(prev))</code>.
              </span>
            )
          ) : language === 'es' ? (
            <span>
              Ninguna tarea previa es compatible (p({hoveredTask.id}) = 0). Si se elige {hoveredTask.id}, el beneficio es simplemente su peso ${hoveredTask.weight}.
            </span>
          ) : (
            <span>
              No previous task is compatible (p({hoveredTask.id}) = 0). If {hoveredTask.id} is chosen, reward is its weight ${hoveredTask.weight}.
            </span>
          )}
        </div>
      )}

      {/* Interactive Schedule */}
      <div className="interactive-tracks-box">
        <div className="tracks-header">
          <span>{language === 'es' ? 'Toca las tareas para armar tu subconjunto:' : 'Click tasks to assemble subset:'}</span>
          <div className="quick-buttons">
            <button className="btn-load greedy-load" onClick={loadGreedy}>
              {language === 'es' ? 'Probar Greedy' : 'Test Greedy'}
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
          {sortedIntervals.map((task, j) => {
            const isSelected = selectedIds.includes(task.id);
            const isOpt = optimalSolution.some((t) => t.id === task.id);
            const predInfo = pMap[task.id];
            const isPredOfHovered = hoveredPred === task.id;
            const isHovered = hoveredTaskId === task.id;

            const leftPct = (task.start / maxTime) * 100;
            const widthPct = ((task.end - task.start) / maxTime) * 100;

            let rowClass = 'interactive-track-row';
            if (isSelected) rowClass += ' task-active';

            return (
              <div
                key={task.id}
                className={rowClass}
                onClick={() => toggleTask(task.id)}
                onMouseEnter={() => setHoveredTaskId(task.id)}
                onMouseLeave={() => setHoveredTaskId(null)}
                style={{
                  backgroundColor: isHovered
                    ? 'rgba(56, 189, 248, 0.08)'
                    : isPredOfHovered
                    ? 'rgba(16, 185, 129, 0.12)'
                    : undefined,
                  borderLeft: isHovered
                    ? '3px solid #38bdf8'
                    : isPredOfHovered
                    ? '3px solid #10b981'
                    : undefined
                }}
              >
                <div className="task-meta">
                  <span className="task-title">
                    {task.id} <small style={{ color: 'var(--text-muted)' }}>({j + 1})</small>
                  </span>
                  <span className="task-val">${task.weight}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      color: predInfo?.predId ? '#10b981' : 'var(--text-muted)',
                      fontFamily: 'var(--font-mono)'
                    }}
                    title={language === 'es' ? 'Predecesor compatible' : 'Compatible predecessor'}
                  >
                    p={predInfo?.predId || '0'}
                  </span>
                  {activePresetIndex === 'custom' && (
                    <button
                      type="button"
                      className="interval-remove-btn"
                      onClick={(e) => handleRemoveCustomInterval(task.id, e)}
                      title={language === 'es' ? 'Eliminar tarea' : 'Delete task'}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="track-lane">
                  <div
                    className={`lane-interval-bar ${isSelected ? 'selected' : ''} ${isOpt && userStatus.isOptimal ? 'opt-match' : ''}`}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      border: isPredOfHovered ? '2px dashed #10b981' : undefined
                    }}
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
                {language === 'es'
                  ? `Incompatibilidad temporal: Tarea ${userStatus.collisionPair?.[0]} se superpone con ${userStatus.collisionPair?.[1]}.`
                  : `Temporal incompatibility: Task ${userStatus.collisionPair?.[0]} overlaps with ${userStatus.collisionPair?.[1]}.`}
              </span>
            ) : userStatus.isOptimal ? (
              <span className="status-ok">
                🎉 {language === 'es' ? 'Subconjunto de tareas compatibles de peso máximo alcanzado.' : 'Maximum weight compatible subset reached.'}
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
            <span className="main-stat" style={{ color: '#10b981' }}>${optimalWeight}</span>
            <span className="main-items">
              [{optimalSolution.map((t) => t.id).join(', ')}]
            </span>
          </div>
          <div className="card-feedback status-ok">
            {language === 'es'
              ? 'Calculado mediante búsqueda binaria de p(j) + memoización en O(n log n).'
              : 'Computed via binary search for p(j) + memoization in O(n log n).'}
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
            ? 'Fundamento: El Rol de la Función Predecesora p(j)'
            : 'Rationale: The Role of the Predecessor Function p(j)'}
        </h4>
        <p>
          {language === 'es'
            ? 'Si no ordenáramos los intervalos, determinar qué tareas previas son compatibles con j requeriría inspeccionar todas las demás tareas, generando subproblemas disjuntos difíciles de tabular. Al ordenar por tiempo de finalización y precalcular p(j) con búsqueda binaria, cada decisión de la recurrencia se evalúa en tiempo O(1), logrando una cota global estricta de O(n log n).'
            : 'Without sorting, determining compatibility would require inspecting all candidate intervals. By sorting by finish time and precomputing p(j) via binary search, each recurrence step evaluates in O(1) time, yielding a strict global bound of O(n log n).'}
        </p>
      </div>
    </div>
  );
};
