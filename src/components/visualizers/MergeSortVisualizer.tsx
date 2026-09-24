import React, { useMemo } from 'react';
import {
  generateMergeSortTrace,
  MergeSortStepData,
  DEFAULT_MERGE_SORT_ARRAY
} from '../../engine/algorithms/mergeSortTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './MergeSortVisualizer.css';

export const MergeSortVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(
    () => generateMergeSortTrace(DEFAULT_MERGE_SORT_ARRAY),
    []
  );

  const {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed
  } = useTraceTimeline<MergeSortStepData>(timeline, {
    baseIntervalMs: 750,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const array = data?.array || DEFAULT_MERGE_SORT_ARRAY;
  const activeRange = data?.activeRange;
  const leftRange = data?.leftRange;
  const rightRange = data?.rightRange;
  const leftPointer = data?.leftPointer;
  const rightPointer = data?.rightPointer;
  const destPointer = data?.destPointer;
  const depth = data?.depth ?? 0;
  const comparisonsCount = data?.comparisonsCount ?? 0;

  const maxVal = Math.max(...array, 85);

  const getBarClasses = (idx: number) => {
    const classes = ['bar-column'];

    const inActive =
      activeRange && idx >= activeRange[0] && idx <= activeRange[1];
    if (activeRange && !inActive) {
      classes.push('outside-active');
    }

    if (leftRange && idx >= leftRange[0] && idx <= leftRange[1]) {
      classes.push('in-left');
    } else if (rightRange && idx >= rightRange[0] && idx <= rightRange[1]) {
      classes.push('in-right');
    }

    if (leftPointer === idx) {
      classes.push('is-left-ptr');
    }
    if (rightPointer === idx) {
      classes.push('is-right-ptr');
    }
    if (destPointer === idx) {
      classes.push('is-dest');
    }

    return classes.join(' ');
  };

  const getPointerTag = (idx: number) => {
    if (destPointer === idx) return <span className="bar-pointer-tag dest-ptr">▲ dest[k]</span>;
    if (leftPointer === idx) return <span className="bar-pointer-tag left-ptr">▲ {language === 'es' ? 'izq[i]' : 'left[i]'}</span>;
    if (rightPointer === idx) return <span className="bar-pointer-tag right-ptr">▲ {language === 'es' ? 'der[j]' : 'right[j]'}</span>;
    return <span className="bar-pointer-tag">&nbsp;</span>;
  };

  return (
    <div className="mergesort-visualizer">
      {/* Header Bar */}
      <div className="mergesort-header-bar">
        <h4>{language === 'es' ? 'División y Conquista: Árbol de Recursión' : 'Divide & Conquer: Recursion Tree'}</h4>
        <div className="knapsack-stats-group">
          <span className="stat-badge stat-highlight">
            <span className="stat-num">{depth}</span>
            <span className="stat-label">{language === 'es' ? 'Nivel / Profundidad' : 'Depth Level'}</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{comparisonsCount}</span>
            <span className="stat-label">{language === 'es' ? 'Comparaciones' : 'Comparisons'}</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">{array.length}</span>
            <span className="stat-label">{language === 'es' ? 'Elementos' : 'Elements'}</span>
          </span>
        </div>
      </div>

      {/* Step Narrative Banner */}
      <div className={`step-narrative-banner ${currentEvent?.type || 'init'}`}>
        <span className="step-tag">
          {language === 'es' ? `Paso ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <p className="step-message-text">
          {language === 'es'
            ? currentEvent?.message?.es || 'Iniciando Merge Sort...'
            : currentEvent?.message?.en || 'Starting Merge Sort...'}
        </p>
      </div>

      {/* Subproblem Range Inspector */}
      {activeRange && (
        <div className="subproblem-callout">
          <span>{language === 'es' ? 'Subproblema Activo:' : 'Active Subproblem:'}</span>
          <span className="subproblem-badge merge">
            A[{activeRange[0]}..{activeRange[1]}]
          </span>
          {leftRange && (
            <span className="subproblem-badge left">
              {language === 'es' ? 'Mitad Izquierda:' : 'Left Half:'} A[{leftRange[0]}..{leftRange[1]}]
            </span>
          )}
          {rightRange && (
            <span className="subproblem-badge right">
              {language === 'es' ? 'Mitad Derecha:' : 'Right Half:'} A[{rightRange[0]}..{rightRange[1]}]
            </span>
          )}
        </div>
      )}

      {/* Array Bars Visualization */}
      <div className="bars-chart-container" role="img" aria-label="Gráfico de barras del arreglo en ordenamiento">
        {array.map((val, idx) => {
          const heightPx = Math.max(28, (val / maxVal) * 140);
          return (
            <div key={`bar-${idx}`} className={getBarClasses(idx)}>
              <div
                className="bar-pill"
                style={{ height: `${heightPx}px` }}
              >
                {val}
              </div>
              {getPointerTag(idx)}
              <span className="bar-index">[{idx}]</span>
            </div>
          );
        })}
      </div>

      {/* Master Theorem & Recursion Tree Rationale Card (Section 12, 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento Teórico: Árbol de Recursión y Teorema Maestro (K&T §5.1):' : 'Theoretical Rationale: Recursion Tree & Master Theorem (K&T §5.1):'}</strong>{' '}
        {language === 'es'
          ? 'Merge Sort divide el arreglo en 2 subproblemas de tamaño n/2 y fusiona las mitades ordenadas en tiempo lineal O(n). La recurrencia es T(n) = 2T(n/2) + c·n. El árbol tiene log₂ n niveles y en cada nivel se realiza un trabajo acumulado constante de c·n. Multiplicando el trabajo por nivel por la altura total del árbol: O(n) · log₂ n = O(n log n), demostrando la cota inferior asintótica óptima para ordenamiento basado en comparaciones.'
          : 'Merge Sort splits into 2 subproblems of size n/2 and merges in linear O(n) time: T(n) = 2T(n/2) + c·n. The recursion tree has height log₂ n, and each level executes exactly c·n total work. Total cost is c·n · log₂ n = O(n log n), achieving the information-theoretic lower bound for comparison sorting.'}
      </div>

      {/* Timeline Playback Controls */}
      <div className="timeline-controls-bar">
        <div className="timeline-buttons-group">
          <button
            type="button"
            className="btn-ctrl"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar (R)' : 'Reset (R)'}
            title={language === 'es' ? 'Reiniciar (tecla R)' : 'Reset (key R)'}
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-ctrl"
            onClick={stepBackward}
            disabled={currentStepIndex === 0}
            aria-label={language === 'es' ? 'Paso anterior (Flecha Izquierda)' : 'Previous step (Left Arrow)'}
            title={language === 'es' ? 'Paso anterior (←)' : 'Previous step (←)'}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-ctrl btn-play-pause"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
            title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="btn-ctrl"
            onClick={stepForward}
            disabled={currentStepIndex === totalSteps - 1}
            aria-label={language === 'es' ? 'Paso siguiente (Flecha Derecha)' : 'Next step (Right Arrow)'}
            title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
          >
            →
          </button>
        </div>

        <div className="timeline-slider-wrapper">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            className="timeline-slider"
            aria-label={language === 'es' ? 'Línea de tiempo de estados' : 'State timeline'}
          />
        </div>

        <div className="timeline-speed-group">
          <span className="speed-label">{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
          {[0.5, 1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => setSpeed(spd)}
              aria-label={language === 'es' ? `Velocidad ${spd}x` : `Speed ${spd}x`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
