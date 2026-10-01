import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_INTERVALS } from '../../engine/algorithms/intervalSchedulingTrace';
import { intervalSchedulingValidator, Interval } from '../../engine/algorithms/intervalSchedulingValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './IntervalSchedulingPlayground.css';

interface Preset {
  id: string;
  name: { es: string; en: string };
  intervals: Interval[];
  description: { es: string; en: string };
}

const PRESETS: Preset[] = [
  {
    id: 'standard',
    name: { es: 'Instancia Estándar (CLRS/KT)', en: 'Standard Instance (CLRS/KT)' },
    intervals: DEFAULT_INTERVALS,
    description: {
      es: 'Conjunto representativo de 6 charlas donde Earliest Finish Time encuentra el subconjunto maximal de 3 tareas.',
      en: 'Standard set of 6 tasks where Earliest Finish Time finds the maximal subset of 3 tasks.'
    }
  },
  {
    id: 'earliest-start',
    name: { es: 'Contraejemplo Inicio Temprano', en: 'Earliest Start Fails' },
    intervals: [
      [0, 10],
      [1, 3],
      [4, 6],
      [7, 9]
    ],
    description: {
      es: 'La tarea que empieza primero [0, 10] monopoliza todo el tiempo. La heurística greedy por tiempo de inicio toma solo 1 tarea, mientras que el óptimo toma 3 tareas disjuntas ([1,3], [4,6], [7,9]).',
      en: 'The task starting earliest [0, 10] blocks the entire timeline. Earliest-start heuristic takes only 1 task, while the optimum takes 3 compatible tasks ([1,3], [4,6], [7,9]).'
    }
  },
  {
    id: 'shortest',
    name: { es: 'Contraejemplo Menor Duración', en: 'Shortest Duration Fails' },
    intervals: [
      [0, 4],
      [3, 5],
      [4, 8]
    ],
    description: {
      es: 'La tarea más corta [3, 5] dura solo 2h, pero elegirla bloquea a [0, 4] y [4, 8]. La heurística greedy por duración obtiene 1 tarea, mientras que el óptimo logra 2.',
      en: 'The shortest task [3, 5] takes 2h, but picking it blocks [0, 4] and [4, 8]. Shortest-interval heuristic achieves 1 task vs 2 optimal.'
    }
  },
  {
    id: 'fewest-conflicts',
    name: { es: 'Contraejemplo Menos Conflictos', en: 'Fewest Conflicts Fails' },
    intervals: [
      [0, 3],
      [2, 5],
      [4, 7],
      [6, 9],
      [1, 4],
      [5, 8]
    ],
    description: {
      es: 'Elegir el intervalo con menor cantidad de solapamientos no garantiza el óptimo global.',
      en: 'Picking intervals with fewest overlaps does not guarantee the global optimum.'
    }
  }
];

const INITIAL_CUSTOM_INTERVALS: Interval[] = [
  [0, 3],
  [2, 6],
  [4, 7],
  [6, 9]
];

export const IntervalSchedulingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePresetId, setActivePresetId] = useState<string>('standard');
  const [customIntervals, setCustomIntervals] = useState<Interval[]>(INITIAL_CUSTOM_INTERVALS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newStart, setNewStart] = useState<number>(1);
  const [newEnd, setNewEnd] = useState<number>(4);
  const [customError, setCustomError] = useState<string | null>(null);

  const activePreset = PRESETS.find((p) => p.id === activePresetId);
  const currentIntervals: Interval[] = useMemo(() => {
    if (activePresetId === 'custom') return customIntervals;
    return activePreset ? activePreset.intervals : DEFAULT_INTERVALS;
  }, [activePresetId, activePreset, customIntervals]);

  const allTasks = useMemo(() => {
    return currentIntervals.map(([start, end], idx) => ({
      id: `T${idx + 1}`,
      start,
      end
    }));
  }, [currentIntervals]);

  const optimalCount = useMemo(() => {
    return intervalSchedulingValidator.computeOptimalCount(currentIntervals);
  }, [currentIntervals]);

  // Reset selected when preset changes
  useEffect(() => {
    setSelectedIds([]);
  }, [activePresetId]);

  const toggleTask = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((tid) => tid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
  };



  // Check overlaps
  const selectedIntervals: Interval[] = selectedIds
    .map((id) => {
      const t = allTasks.find((item) => item.id === id);
      return t ? ([t.start, t.end] as Interval) : null;
    })
    .filter((item): item is Interval => item !== null);

  const validation = intervalSchedulingValidator.validate(
    { intervals: currentIntervals },
    selectedIntervals
  );

  const hasOverlap = validation.errors.some((e) => e.includes('Solapamiento'));
  const isOptimal = validation.valid && selectedIds.length === optimalCount && optimalCount > 0;

  useEffect(() => {
    if (isOptimal) {
      markAttempted('interval-scheduling');
    }
  }, [isOptimal, markAttempted]);

  const handleAddCustomInterval = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    if (newStart < 0 || !Number.isInteger(newStart)) {
      setCustomError(language === 'es' ? 'El inicio debe ser un entero no negativo.' : 'Start must be a non-negative integer.');
      return;
    }
    if (newEnd <= newStart || !Number.isInteger(newEnd)) {
      setCustomError(language === 'es' ? 'El fin debe ser mayor al inicio.' : 'End must be strictly greater than start.');
      return;
    }
    if (customIntervals.length >= 8) {
      setCustomError(language === 'es' ? 'Máximo 8 tareas en el laboratorio.' : 'Maximum 8 tasks in sandbox.');
      return;
    }

    setCustomIntervals([...customIntervals, [newStart, newEnd]]);
    setSelectedIds([]);
  };

  const handleRemoveCustomInterval = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (customIntervals.length <= 1) {
      setCustomError(language === 'es' ? 'Debe haber al menos 1 tarea.' : 'Must have at least 1 task.');
      return;
    }
    const next = customIntervals.filter((_, i) => i !== idx);
    setCustomIntervals(next);
    setSelectedIds([]);
  };

  // SVG coordinate mapping
  const svgWidth = 600;
  const svgHeight = allTasks.length * 42 + 45;
  const paddingLeft = 50;
  const paddingRight = 30;
  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const maxTime = Math.max(10, ...currentIntervals.map((i) => i[1]));
  const getX = (t: number) => paddingLeft + (t / maxTime) * usableWidth;

  return (
    <div className="interval-playground-box">
      <div className="playground-header-row">
        <div>
          <h4 style={{ margin: 0 }}>
            {language === 'es' ? 'Explorador Interactivo de Intervalos' : 'Interactive Interval Explorer'}
          </h4>
          <p className="playground-instruction-text">
            {language === 'es'
              ? 'Haz clic en las tareas para seleccionarlas. Intenta maximizar la cantidad de tareas sin que se solapen.'
              : 'Click tasks to select them. Try to maximize compatible tasks without overlaps.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {language === 'es' ? 'Limpiar Selección' : 'Clear Selection'}
          </button>
        </div>
      </div>

      {/* Preset selection bar */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {language === 'es' ? 'Escenarios:' : 'Scenarios:'}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`chip-btn ${activePresetId === p.id ? 'active' : ''}`}
            onClick={() => {
              setActivePresetId(p.id);
              setCustomError(null);
            }}
          >
            {p.name[language]}
          </button>
        ))}
        <button
          type="button"
          className={`chip-btn ${activePresetId === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setActivePresetId('custom');
            setCustomError(null);
          }}
        >
          {language === 'es' ? 'Caso propio' : 'Custom Case'}
        </button>
      </div>

      {/* Description banner for active preset */}
      {activePreset && (
        <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', background: 'var(--surface-hover)', padding: '0.5rem 0.75rem', borderRadius: '4px' }}>
          {activePreset.description[language]}
        </div>
      )}

      {/* Custom item editor when activePresetId === 'custom' */}
      {activePresetId === 'custom' && (
        <div className="interval-custom-editor">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text)' }}>
              {language === 'es' ? 'Definir tareas de tu instancia propia:' : 'Define tasks for your custom instance:'}
            </span>
            <button
              type="button"
              className="chip-btn"
              onClick={() => {
                setCustomIntervals(INITIAL_CUSTOM_INTERVALS);
                setSelectedIds([]);
                setCustomError(null);
              }}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
            >
              {language === 'es' ? 'Restablecer' : 'Reset'}
            </button>
          </div>

          <form onSubmit={handleAddCustomInterval} className="custom-editor-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {language === 'es' ? 'Inicio:' : 'Start:'}
              </label>
              <input
                type="number"
                min="0"
                max="25"
                value={newStart}
                onChange={(e) => setNewStart(Math.max(0, parseInt(e.target.value, 10) || 0))}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {language === 'es' ? 'Fin:' : 'End:'}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={newEnd}
                onChange={(e) => setNewEnd(Math.max(1, parseInt(e.target.value, 10) || 1))}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
            <button
              type="submit"
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', height: '34px' }}
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

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="playground-timeline-svg"
        role="img"
        aria-label="Línea de tiempo interactiva de tareas"
      >
        {/* Time axis marks */}
        {Array.from({ length: maxTime + 1 }, (_, t) => (
          <g key={`mark-${t}`}>
            <line
              x1={getX(t)}
              y1={15}
              x2={getX(t)}
              y2={svgHeight - 15}
              stroke="var(--color-border)"
              strokeDasharray="2, 4"
            />
            <text
              x={getX(t)}
              y={svgHeight - 5}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {t}h
            </text>
          </g>
        ))}

        {/* Tasks */}
        {allTasks.map((task, idx) => {
          const y = idx * 42 + 20;
          const x1 = getX(task.start);
          const x2 = getX(task.end);
          const width = Math.max(16, x2 - x1);
          const isSelected = selectedIds.includes(task.id);
          const isConflict = isSelected && hasOverlap;

          let barFill = 'rgba(59, 130, 246, 0.2)';
          if (isConflict) barFill = 'var(--error)';
          else if (isSelected) barFill = 'var(--success)';

          const statusDesc = isConflict
            ? (language === 'es' ? 'en conflicto' : 'conflicted')
            : isSelected
              ? (language === 'es' ? 'seleccionada' : 'selected')
              : (language === 'es' ? 'no seleccionada' : 'not selected');

          return (
            <g
              key={task.id}
              onClick={() => toggleTask(task.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleTask(task.id);
                }
              }}
              tabIndex={0}
              role="button"
              aria-pressed={isSelected}
              aria-label={`Tarea ${task.id}, ${task.start} a ${task.end} horas, ${statusDesc}`}
              className={`task-bar-interactive ${isSelected ? 'selected' : ''} ${isConflict ? 'conflict' : ''}`}
              style={{ cursor: 'pointer', outline: 'none' }}
            >
              <rect
                x={x1}
                y={y}
                width={width}
                height={30}
                rx={6}
                fill={barFill}
                stroke={isConflict ? '#b91c1c' : isSelected ? '#059669' : 'var(--border-strong)'}
                strokeWidth={1.5}
              />
              <text
                x={x1 + 10}
                y={y + 19}
                fill={isSelected ? '#ffffff' : 'var(--text)'}
                fontSize="13"
                fontWeight="700"
                fontFamily="var(--font-sans)"
              >
                {isConflict ? '[!] ' : isSelected ? '[Sel] ' : ''}{task.id} [{task.start}-{task.end}]
              </text>
              {activePresetId === 'custom' && (
                <text
                  x={x2 - 14}
                  y={y + 20}
                  fill="var(--error)"
                  fontSize="13"
                  fontWeight="bold"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => handleRemoveCustomInterval(idx, e)}
                >
                  ✕
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="playground-feedback-panel">
        <div className="score-row">
          <span>
            {language === 'es' ? 'Tareas seleccionadas:' : 'Selected tasks:'}{' '}
            <strong>{selectedIds.length} / {optimalCount}</strong>
          </span>
          <span>
            {hasOverlap
              ? (language === 'es' ? '[Incompatible] Con solapamiento' : '[Incompatible] Has overlap')
              : (language === 'es' ? '[Válido] Compatibles' : '[Valid] Compatible')}
          </span>
        </div>

        {isOptimal ? (
          <div className="status-alert success">
            {language === 'es'
              ? `Conjunto máximo de tareas compatibles verificado (${optimalCount} tareas). ¡Óptimo alcanzado!`
              : `Maximum set of compatible tasks verified (${optimalCount} tasks). Optimum reached!`}
          </div>
        ) : hasOverlap ? (
          <div className="status-alert warning">
            {language === 'es' ? 'Hay tareas seleccionadas que se superponen en el tiempo. Deselecciona alguna para resolver el conflicto.' : 'Some selected tasks overlap in time. Deselect one to fix the conflict.'}
          </div>
        ) : selectedIds.length > 0 ? (
          <div className="status-alert info">
            {language === 'es' ? `Tienes ${selectedIds.length} tarea(s) compatible(s). ¿Puedes encontrar una combinación que alcance ${optimalCount}?` : `You have ${selectedIds.length} compatible task(s). Can you reach ${optimalCount}?`}
          </div>
        ) : (
          <div className="status-alert info">
            {language === 'es' ? 'Comienza seleccionando una tarea haciendo clic sobre ella.' : 'Start by clicking on any task to select it.'}
          </div>
        )}
      </div>
    </div>
  );
};
