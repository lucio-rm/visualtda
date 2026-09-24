import React, { useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { generateSubsetSumTrace, SubsetSumStepData } from '../../engine/algorithms/subsetSumTrace';
import './SubsetSumVisualizer.css';

interface SubsetSumVisualizerProps {
  initialNumbers?: number[];
  initialTarget?: number;
}

const DEFAULT_NUMBERS = [2, 3, 5, 7, 8];
const DEFAULT_TARGET = 10;

export const SubsetSumVisualizer: React.FC<SubsetSumVisualizerProps> = ({
  initialNumbers = DEFAULT_NUMBERS,
  initialTarget = DEFAULT_TARGET
}) => {
  const { language, t } = useLanguage();

  const timeline = useMemo(() => {
    return generateSubsetSumTrace(initialNumbers, initialTarget);
  }, [initialNumbers, initialTarget]);

  const {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    isAtStart,
    isAtEnd,
    play,
    pause,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
    goToStep
  } = useTraceTimeline<SubsetSumStepData>(timeline);

  const stepData = currentEvent?.data || timeline.events[0]?.data;
  const {
    elements,
    target,
    currentSubset,
    currentSum,
    currentIndex,
    currentElement,
    remainingSum,
    action,
    solutions,
    exploredNodes,
    prunedNodes
  } = stepData;

  const currentSubsetSet = useMemo(() => new Set(currentSubset), [currentSubset]);

  const progressPct = Math.min(100, Math.round((currentSum / target) * 100));

  return (
    <div className="subset-sum-visualizer">
      {/* Top Metrics Grid */}
      <div className="subset-metrics-grid">
        <div className="subset-metric-card">
          <span className="subset-metric-label">{language === 'es' ? 'Objetivo S' : 'Target S'}</span>
          <span className="subset-metric-val" style={{ color: '#3b82f6' }}>
            {target}
          </span>
        </div>
        <div className="subset-metric-card">
          <span className="subset-metric-label">{language === 'es' ? 'Suma Actual' : 'Current Sum'}</span>
          <span
            className="subset-metric-val"
            style={{ color: currentSum === target ? '#10b981' : currentSum > target ? '#ef4444' : 'var(--color-text)' }}
          >
            {currentSum} / {target}
          </span>
        </div>
        <div className="subset-metric-card">
          <span className="subset-metric-label">{language === 'es' ? 'Remanente Disponible' : 'Remaining Sum'}</span>
          <span className="subset-metric-val">{remainingSum}</span>
        </div>
        <div className="subset-metric-card">
          <span className="subset-metric-label">{language === 'es' ? 'Nodos Explorados' : 'Explored Nodes'}</span>
          <span className="subset-metric-val">{exploredNodes}</span>
        </div>
        <div className="subset-metric-card">
          <span className="subset-metric-label">{language === 'es' ? 'Nodos Podados' : 'Pruned Subtrees'}</span>
          <span className="subset-metric-val" style={{ color: '#f59e0b' }}>
            {prunedNodes}
          </span>
        </div>
        <div className="subset-metric-card">
          <span className="subset-metric-label">{language === 'es' ? 'Soluciones Halladas' : 'Solutions Found'}</span>
          <span className="subset-metric-val" style={{ color: '#10b981' }}>
            {solutions.length}
          </span>
        </div>
      </div>

      {/* Sum Progress Bar */}
      <div className="sum-progress-container">
        <div className="sum-progress-header">
          <span>{language === 'es' ? 'Progreso hacia la meta S:' : 'Progress towards target S:'}</span>
          <span>{progressPct}%</span>
        </div>
        <div className="sum-progress-track">
          <div
            className={`sum-progress-fill ${currentSum === target ? 'target-reached' : ''}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Candidate Numbers Strip */}
      <div className="elements-status-strip">
        {elements.map((elem, idx) => {
          const isIncluded = currentSubsetSet.has(elem);
          const isEvaluating = currentElement === elem && idx === currentIndex;
          const isPast = idx < currentIndex && !isIncluded;

          let chipClass = 'element-chip';
          if (isIncluded) chipClass += ' included';
          else if (isEvaluating) chipClass += ' evaluating';
          else if (isPast) chipClass += ' excluded';

          return (
            <div key={`elem-${elem}-${idx}`} className={chipClass}>
              <span className="chip-label">
                {isIncluded
                  ? language === 'es'
                    ? 'En suma'
                    : 'Included'
                  : isEvaluating
                  ? language === 'es'
                    ? 'Evaluando'
                    : 'Active'
                  : isPast
                  ? language === 'es'
                    ? 'Omitido'
                    : 'Skipped'
                  : language === 'es'
                  ? 'Disponible'
                  : 'Pending'}
              </span>
              <span>{elem}</span>
            </div>
          );
        })}
      </div>

      {/* Pruning and Action Status Banner */}
      {action === 'PRUNE_EXCESS' ? (
        <div className="pruning-status-banner excess">
          <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>[Poda]</span>
          <span>
            {language === 'es'
              ? `Poda por Exceso: ${currentSum} + ${currentElement} > ${target}. Se poda la rama porque ningún número positivo puede reducir la suma.`
              : `Excess Pruning: ${currentSum} + ${currentElement} > ${target}. Branch pruned because no positive addition can reduce the sum.`}
          </span>
        </div>
      ) : action === 'PRUNE_DEFICIT' ? (
        <div className="pruning-status-banner deficit">
          <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>[Poda]</span>
          <span>
            {language === 'es'
              ? `Poda por Déficit: Suma actual (${currentSum}) + remanente total (${remainingSum}) < ${target}. Imposible alcanzar la meta.`
              : `Deficit Pruning: Current sum (${currentSum}) + total remaining (${remainingSum}) < ${target}. Target unreachable.`}
          </span>
        </div>
      ) : action === 'SOLUTION_FOUND' ? (
        <div className="pruning-status-banner solution">
          <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>[Solución]</span>
          <span>
            {language === 'es'
              ? `Subconjunto exacto verificado: [${currentSubset.join(' + ')}] = ${target}.`
              : `Exact subset verified: [${currentSubset.join(' + ')}] = ${target}.`}
          </span>
        </div>
      ) : (
        <div className="pruning-status-banner exploring">
          <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>●</span>
          <span>
            {language === 'es'
              ? `Subconjunto actual: [${currentSubset.join(', ') || 'vacío'}] con suma = ${currentSum}.`
              : `Current subset: [${currentSubset.join(', ') || 'empty'}] with sum = ${currentSum}.`}
          </span>
        </div>
      )}

      {/* Solutions Shelf */}
      {solutions.length > 0 && (
        <div className="solutions-preview-shelf">
          <span className="solutions-shelf-title">
            {language === 'es' ? 'Subconjuntos válidos acumulados:' : 'Accumulated valid subsets:'}
          </span>
          <div className="solutions-tags-row">
            {solutions.map((sol, sIdx) => (
              <span key={`sol-${sIdx}`} className="solution-badge">
                #{sIdx + 1}: [{sol.join(', ')}]
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step Explanation Card */}
      <div className="step-explanation-box">
        <strong>{language === 'es' ? `Paso ${currentStepIndex + 1} de ${totalSteps}: ` : `Step ${currentStepIndex + 1} of ${totalSteps}: `}</strong>
        {t(stepData.description)}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={stepBackward}
          disabled={isAtStart}
          title={language === 'es' ? 'Paso anterior (←)' : 'Previous step (←)'}
        >
          {language === 'es' ? '← Anterior' : '← Previous'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={isPlaying ? pause : play}
          title={isPlaying ? 'Pausar (Espacio)' : 'Reproducir (Espacio)'}
        >
          {isPlaying ? (language === 'es' ? '⏸ Pausa' : '⏸ Pause') : (language === 'es' ? '▶ Reproducir' : '▶ Play')}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={stepForward}
          disabled={isAtEnd}
          title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
        >
          {language === 'es' ? 'Siguiente →' : 'Next →'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={reset}
          title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
        >
          {language === 'es' ? '↺ Reiniciar' : '↺ Reset'}
        </button>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="subset-timeline-slider" style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Paso:' : 'Step:'}
          </label>
          <input
            id="subset-timeline-slider"
            type="range"
            min="0"
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            style={{ width: '130px' }}
          />
          <select
            value={playbackSpeed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="form-control"
            style={{ width: 'auto', padding: '4px 8px', fontSize: '0.85rem' }}
          >
            <option value={0.6}>0.6x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>
    </div>
  );
};
