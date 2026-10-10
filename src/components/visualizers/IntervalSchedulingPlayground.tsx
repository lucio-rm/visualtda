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

export function parseCustomIntervalString(
  input: string,
  lang: 'es' | 'en' = 'es'
): { intervals?: Interval[]; error?: string } {
  const isEs = lang === 'es';
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: isEs ? 'La entrada está vacía.' : 'Input cannot be empty.' };
  }

  // If input starts with JSON array bracket
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed)) {
        return {
          error: isEs
            ? 'El formato JSON debe ser una lista de pares [[inicio, fin], ...].'
            : 'JSON format must be a list of pairs [[start, end], ...].'
        };
      }
      const intervals: Interval[] = [];
      for (const item of parsed) {
        if (!Array.isArray(item) || item.length !== 2) {
          return {
            error: isEs
              ? 'Cada elemento debe ser una tupla de 2 números [inicio, fin].'
              : 'Each item must be a 2-number tuple [start, end].'
          };
        }
        const [s, e] = item;
        if (typeof s !== 'number' || typeof e !== 'number' || !Number.isInteger(s) || !Number.isInteger(e)) {
          return {
            error: isEs
              ? 'Los valores de inicio y fin deben ser números enteros.'
              : 'Start and end values must be integers.'
          };
        }
        if (s < 0 || e <= s || e > 100) {
          return {
            error: isEs
              ? `Intervalo inválido [${s}, ${e}]: se requiere 0 <= inicio < fin <= 100.`
              : `Invalid interval [${s}, ${e}]: requires 0 <= start < end <= 100.`
          };
        }
        intervals.push([s, e]);
      }
      if (intervals.length === 0) {
        return { error: isEs ? 'No se detectaron intervalos en la lista.' : 'No intervals detected in list.' };
      }
      if (intervals.length > 10) {
        return {
          error: isEs
            ? 'Máximo 10 intervalos permitidos para garantizar la legibilidad en pantalla.'
            : 'Maximum 10 intervals allowed for clear screen visualization.'
        };
      }
      return { intervals };
    } catch {
      // Continue to regex parser
    }
  }

  // Regex parser: handles patterns like "1-4, 2-6", "(1, 4), (2, 6)", "[[1, 4], [2, 6]]"
  const matches = trimmed.match(/\[?\s*(\d+)\s*[,-]\s*(\d+)\s*\]?/g);
  if (!matches || matches.length === 0) {
    return {
      error: isEs
        ? 'No se reconocieron intervalos válidos. Usá formato JSON [[1, 4], [2, 6]] o pares "1-4, 2-6".'
        : 'Could not recognize valid intervals. Use JSON [[1, 4], [2, 6]] or pairs "1-4, 2-6".'
    };
  }

  const intervals: Interval[] = [];
  for (const m of matches) {
    const nums = m
      .replace(/[()[\]]/g, '')
      .split(/[,-]/)
      .map((n) => parseInt(n.trim(), 10));
    if (nums.length === 2 && !isNaN(nums[0]) && !isNaN(nums[1])) {
      const [s, e] = nums;
      if (s < 0 || e <= s || e > 100) {
        return {
          error: isEs
            ? `Intervalo inválido [${s}, ${e}]: se requiere 0 <= inicio < fin <= 100.`
            : `Invalid interval [${s}, ${e}]: requires 0 <= start < end <= 100.`
        };
      }
      intervals.push([s, e]);
    }
  }

  if (intervals.length === 0) {
    return { error: isEs ? 'No se detectaron intervalos.' : 'No intervals found.' };
  }
  if (intervals.length > 10) {
    return {
      error: isEs
        ? 'Máximo 10 intervalos permitidos para garantizar la legibilidad en pantalla.'
        : 'Maximum 10 intervals allowed for clear screen visualization.'
    };
  }

  return { intervals };
}

export const IntervalSchedulingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePresetId, setActivePresetId] = useState<string>('standard');
  const [customIntervals, setCustomIntervals] = useState<Interval[]>(INITIAL_CUSTOM_INTERVALS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newStart, setNewStart] = useState<number>(1);
  const [newEnd, setNewEnd] = useState<number>(4);
  const [customError, setCustomError] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkText, setBulkText] = useState<string>('[[1, 4], [3, 5], [0, 6], [5, 7], [3, 8], [5, 9]]');

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
    if (customIntervals.length >= 10) {
      setCustomError(language === 'es' ? 'Máximo 10 tareas en el laboratorio.' : 'Maximum 10 tasks in sandbox.');
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="chip-btn"
                onClick={() => setShowBulkModal(!showBulkModal)}
                style={{ fontSize: '0.8125rem', padding: '0.25rem 0.5rem' }}
              >
                {showBulkModal
                  ? (language === 'es' ? 'Cerrar Carga Masiva' : 'Close Bulk Input')
                  : (language === 'es' ? 'Carga Masiva' : 'Bulk Input')}
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={() => {
                  setCustomIntervals(INITIAL_CUSTOM_INTERVALS);
                  setSelectedIds([]);
                  setCustomError(null);
                  setShowBulkModal(false);
                }}
                style={{ fontSize: '0.8125rem', padding: '0.25rem 0.5rem' }}
              >
                {language === 'es' ? 'Restablecer' : 'Reset'}
              </button>
            </div>
          </div>

          {showBulkModal && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {language === 'es'
                  ? 'Pegá tus intervalos en formato JSON [[1, 4], [2, 6]] o lista 1-4, 2-6 (máximo 10 tareas):'
                  : 'Paste intervals as JSON [[1, 4], [2, 6]] or pairs 1-4, 2-6 (max 10 tasks):'}
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={3}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'var(--surface-hover)', color: 'var(--text)', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowBulkModal(false)}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
                >
                  {language === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setCustomError(null);
                    const res = parseCustomIntervalString(bulkText, language);
                    if (res.error) {
                      setCustomError(res.error);
                    } else if (res.intervals && res.intervals.length > 0) {
                      setCustomIntervals(res.intervals);
                      setSelectedIds([]);
                      setShowBulkModal(false);
                    }
                  }}
                  style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem' }}
                >
                  {language === 'es' ? 'Cargar Tareas' : 'Load Tasks'}
                </button>
              </div>
            </div>
          )}

          {/* Active custom interval chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
            {customIntervals.map(([s, e], idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span>T{idx + 1} [{s}h – {e}h]</span>
                <button
                  type="button"
                  onClick={(ev) => handleRemoveCustomInterval(idx, ev)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--error, #ef4444)',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '0.85rem'
                  }}
                  title={language === 'es' ? 'Eliminar tarea' : 'Remove task'}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCustomInterval} className="custom-editor-row">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {language === 'es' ? 'Inicio:' : 'Start:'}
              </label>
              <input
                type="number"
                min="0"
                max="95"
                value={newStart}
                onChange={(e) => setNewStart(Math.max(0, parseInt(e.target.value, 10) || 0))}
                style={{ padding: '0.35rem 0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                {language === 'es' ? 'Fin:' : 'End:'}
              </label>
              <input
                type="number"
                min="1"
                max="100"
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
            <div style={{ color: 'var(--color-error, #dc2626)', fontSize: '0.8rem', marginTop: '0.35rem', fontWeight: 500 }}>
              {customError}
            </div>
          )}
        </div>
      )}

      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="playground-timeline-svg"
        role="img"
        aria-label={language === 'es' ? 'Línea de tiempo interactiva de tareas' : 'Interactive task timeline'}
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
              fontSize="13"
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

          let barFill = 'var(--surface)';
          let barStroke = 'var(--border-strong)';
          if (isConflict) {
            barFill = 'var(--state-conflict-bg)';
            barStroke = 'var(--error)';
          } else if (isSelected) {
            barFill = 'var(--state-solution-bg)';
            barStroke = 'var(--success)';
          }

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
              aria-label={language === 'es' ? `Tarea ${task.id}, ${task.start} a ${task.end} horas, ${statusDesc}` : `Task ${task.id}, ${task.start} to ${task.end} hours, ${statusDesc}`}
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
                stroke={barStroke}
                strokeWidth={isConflict ? 2 : 1.5}
              />
              <text
                x={x1 + 10}
                y={y + 19}
                fill={isConflict ? 'var(--error)' : 'var(--text)'}
                stroke="none"
                fontSize="12.5px"
                fontWeight="500"
                fontFamily="var(--font-mono)"
                pointerEvents="none"
              >
                {isConflict ? '[!] ' : isSelected ? '✓ ' : ''}{task.id} [{task.start}h - {task.end}h]
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
