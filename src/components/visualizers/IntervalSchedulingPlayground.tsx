import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_INTERVALS, IntervalItem } from '../../engine/algorithms/intervalSchedulingTrace';
import { intervalSchedulingValidator, Interval } from '../../engine/algorithms/intervalSchedulingValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './IntervalSchedulingPlayground.css';

export const IntervalSchedulingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markCompleted } = useStudentProgress();

  const allTasks: IntervalItem[] = useMemo(() => {
    return DEFAULT_INTERVALS.map(([start, end], idx) => ({
      id: `task-${idx + 1}`,
      start,
      end
    }));
  }, []);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  const selectedIntervals: Interval[] = selectedIds.map((id) => {
    const t = allTasks.find((item) => item.id === id)!;
    return [t.start, t.end];
  });

  const validation = intervalSchedulingValidator.validate(
    { intervals: DEFAULT_INTERVALS },
    selectedIntervals
  );

  const hasOverlap = validation.errors.some((e) => e.includes('Solapamiento'));
  const isOptimal = validation.valid && selectedIds.length === 3;

  useEffect(() => {
    if (isOptimal) {
      markCompleted('interval-scheduling');
    }
  }, [isOptimal]);

  // SVG coordinate mapping
  const svgWidth = 540;
  const svgHeight = allTasks.length * 36 + 40;
  const paddingLeft = 50;
  const paddingRight = 30;
  const usableWidth = svgWidth - paddingLeft - paddingRight;
  const maxTime = 10;
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
        <button type="button" className="btn-secondary" onClick={handleClear}>
          {language === 'es' ? 'Limpiar Selección' : 'Clear Selection'}
        </button>
      </div>

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
          const y = idx * 36 + 20;
          const x1 = getX(task.start);
          const x2 = getX(task.end);
          const width = Math.max(16, x2 - x1);
          const isSelected = selectedIds.includes(task.id);
          const isConflict = isSelected && hasOverlap;

          let barFill = 'rgba(59, 130, 246, 0.2)';
          if (isConflict) barFill = '#ef4444';
          else if (isSelected) barFill = '#10b981';

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
                height={24}
                rx={5}
                fill={barFill}
              />
              <text
                x={x1 + 8}
                y={y + 15}
                fill={isSelected ? '#ffffff' : 'var(--color-text)'}
                fontSize="11"
                fontWeight="600"
                fontFamily="var(--font-sans)"
              >
                {isConflict ? '⚠ ' : isSelected ? '✓ ' : ''}{task.id} [{task.start}-{task.end}]
              </text>
            </g>
          );
        })}
      </svg>

      <div className="playground-feedback-panel">
        <div className="score-row">
          <span>
            {language === 'es' ? 'Tareas seleccionadas:' : 'Selected tasks:'}{' '}
            <strong>{selectedIds.length} / 3 (Óptimo)</strong>
          </span>
          <span>
            {hasOverlap
              ? (language === 'es' ? '⚠️ Con solapamiento' : '⚠️ Has overlap')
              : (language === 'es' ? '✓ Compatibles' : '✓ Compatible')}
          </span>
        </div>

        {isOptimal ? (
          <div className="status-alert success">
            🎉 {language === 'es' ? '¡Excelente! Encontraste una combinación óptima de 3 tareas compatibles.' : 'Excellent! You found an optimal combination of 3 compatible tasks.'}
          </div>
        ) : hasOverlap ? (
          <div className="status-alert warning">
            ⚠️ {language === 'es' ? 'Hay tareas seleccionadas que se superponen en el tiempo. Deselecciona alguna para resolver el conflicto.' : 'Some selected tasks overlap in time. Deselect one to fix the conflict.'}
          </div>
        ) : selectedIds.length > 0 ? (
          <div className="status-alert info">
            💡 {language === 'es' ? `Tienes ${selectedIds.length} tarea(s) compatible(s). ¿Puedes encontrar una combinación que alcance 3?` : `You have ${selectedIds.length} compatible task(s). Can you reach 3?`}
          </div>
        ) : (
          <div className="status-alert info">
            👉 {language === 'es' ? 'Comienza seleccionando una tarea haciendo clic sobre ella.' : 'Start by clicking on any task to select it.'}
          </div>
        )}
      </div>
    </div>
  );
};
