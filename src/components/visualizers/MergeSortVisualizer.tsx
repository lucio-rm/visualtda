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

      {/* Live Merge Comparison Card (shows active element comparison and placement) */}
      {data?.comparison && (
        <div
          className="merge-comparison-live-card"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--surface)',
            border: '1.5px solid var(--accent)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'es' ? 'Comparación en Fusión (Merge):' : 'Merge Comparison:'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 700 }}>
              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: data.comparison.winner === 'left' ? 'var(--state-solution-bg)' : 'var(--surface-hover)',
                  border: `2px solid ${data.comparison.winner === 'left' ? 'var(--success)' : 'var(--border)'}`,
                  color: data.comparison.winner === 'left' ? 'var(--success)' : 'var(--text)'
                }}
              >
                {language === 'es' ? 'izq' : 'left'}[{leftPointer}]: {data.comparison.leftVal}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>
                {data.comparison.leftVal <= data.comparison.rightVal ? '≤' : '>'}
              </span>
              <span
                style={{
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  backgroundColor: data.comparison.winner === 'right' ? 'var(--state-solution-bg)' : 'var(--surface-hover)',
                  border: `2px solid ${data.comparison.winner === 'right' ? 'var(--success)' : 'var(--border)'}`,
                  color: data.comparison.winner === 'right' ? 'var(--success)' : 'var(--text)'
                }}
              >
                {language === 'es' ? 'der' : 'right'}[{rightPointer}]: {data.comparison.rightVal}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === 'es' ? 'Elemento menor (gana):' : 'Winner (smaller):'}
            </span>
            <span
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '4px',
                backgroundColor: 'var(--state-solution-bg)',
                border: '1.5px solid var(--success)',
                color: 'var(--success)',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)',
                fontSize: '0.95rem'
              }}
            >
              {data.comparison.winner === 'left' ? data.comparison.leftVal : data.comparison.rightVal} → dest[{destPointer}]
            </span>
          </div>
        </div>
      )}

      {/* Array Bars Visualization */}
      <div className="bars-chart-container" role="img" aria-label={language === 'es' ? 'Gráfico de barras del arreglo en ordenamiento' : 'Bar chart of array during sorting'}>
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

      {/* Subproblem Recursion & Merge Status (Ascending Tree) */}
      <div className="mergesort-tree-live-panel" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'es' ? 'Árbol de Recursión (División y Fusión Ascendente):' : 'Recursion Tree (Division & Bottom-Up Merge):'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
            {data?.phase === 'divide' ? (language === 'es' ? '↓ Dividiendo' : '↓ Splitting') : data?.phase === 'base_case' ? (language === 'es' ? '• Caso Base (n=1)' : '• Base Case (n=1)') : data?.phase === 'complete' ? (language === 'es' ? '✓ Ordenamiento Completo' : '✓ Fully Sorted') : (language === 'es' ? '↑ Fusionando hacia arriba' : '↑ Merging Upward')}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ minWidth: '70px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{language === 'es' ? 'Nivel 0:' : 'Level 0:'}</span>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
              <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: activeRange && activeRange[0] === 0 && activeRange[1] === array.length - 1 ? '1.5px solid var(--accent)' : '1px solid var(--border)', backgroundColor: activeRange && activeRange[0] === 0 && activeRange[1] === array.length - 1 ? 'var(--state-active-bg)' : 'var(--surface-hover)', fontWeight: 700, color: 'var(--text)' }}>
                [{array.join(', ')}]
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ minWidth: '70px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{language === 'es' ? 'Nivel 1:' : 'Level 1:'}</span>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, flexWrap: 'wrap' }}>
              <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: activeRange && activeRange[0] === 0 && activeRange[1] === Math.floor(array.length / 2) - 1 ? '1.5px solid var(--accent)' : '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', color: 'var(--text)' }}>
                [{array.slice(0, Math.floor(array.length / 2)).join(', ')}]
              </div>
              <div style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: activeRange && activeRange[0] === Math.floor(array.length / 2) && activeRange[1] === array.length - 1 ? '1.5px solid var(--accent)' : '1px solid var(--border)', backgroundColor: 'var(--surface-hover)', color: 'var(--text)' }}>
                [{array.slice(Math.floor(array.length / 2)).join(', ')}]
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {language === 'es' ? 'Subarreglo en tratamiento actual: ' : 'Current subsegment: '}
            <strong style={{ color: 'var(--accent)' }}>A[{activeRange ? `${activeRange[0]}..${activeRange[1]}` : '0..7'}]</strong>
            {data?.phase === 'segment_merged' && (
              <span style={{ color: 'var(--success)', marginLeft: '0.5rem', fontWeight: 600 }}>
                {language === 'es' ? '✓ Mitades ordenadas combinadas con éxito' : '✓ Sorted halves successfully merged'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Master Theorem & Recursion Tree Rationale Card */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento Teórico: Árbol de Recursión y Teorema Maestro:' : 'Theoretical Rationale: Recursion Tree & Master Theorem:'}</strong>{' '}
        {language === 'es'
          ? 'Merge Sort divide el arreglo en 2 subproblemas de tamaño n/2 y realiza el merge de las mitades ordenadas en tiempo lineal O(n). La recurrencia es T(n) = 2T(n/2) + c·n. El árbol tiene log₂ n niveles y en cada nivel se realiza un trabajo acumulado constante de c·n. Multiplicando el trabajo por nivel por la altura total del árbol: O(n) · log₂ n = O(n log n), demostrando la cota inferior asintótica óptima para ordenamiento basado en comparaciones.'
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
