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
            style={{ color: currentSum === target ? 'var(--success)' : currentSum > target ? 'var(--error)' : 'var(--color-text)' }}
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
          <span className="subset-metric-val" style={{ color: 'var(--warning)' }}>
            {prunedNodes}
          </span>
        </div>
        <div className="subset-metric-card">
          <span className="subset-metric-label">{language === 'es' ? 'Soluciones Halladas' : 'Solutions Found'}</span>
          <span className="subset-metric-val" style={{ color: 'var(--success)' }}>
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
          <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
            {language === 'es' ? '[Poda]' : '[Pruning]'}
          </span>
          <span>
            {language === 'es'
              ? `Poda por Exceso: ${currentSum} + ${currentElement} > ${target}. Se poda la rama porque ningún número positivo puede reducir la suma.`
              : `Excess Pruning: ${currentSum} + ${currentElement} > ${target}. Branch pruned because no positive addition can reduce the sum.`}
          </span>
        </div>
      ) : action === 'PRUNE_DEFICIT' ? (
        <div className="pruning-status-banner deficit">
          <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
            {language === 'es' ? '[Poda]' : '[Pruning]'}
          </span>
          <span>
            {language === 'es'
              ? `Poda por Déficit: Suma actual (${currentSum}) + remanente total (${remainingSum}) < ${target}. Imposible alcanzar la meta.`
              : `Deficit Pruning: Current sum (${currentSum}) + total remaining (${remainingSum}) < ${target}. Target unreachable.`}
          </span>
        </div>
      ) : action === 'SOLUTION_FOUND' ? (
        <div className="pruning-status-banner solution">
          <span style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase' }}>
            {language === 'es' ? '[Solución]' : '[Solution]'}
          </span>
          <span>
            {language === 'es'
              ? `Subconjunto exacto verificado: [${currentSubset.join(' + ')}] = ${target}.`
              : `Exact subset verified: [${currentSubset.join(' + ')}] = ${target}.`}
          </span>
        </div>
      ) : (
        <div className="pruning-status-banner exploring">
          <span style={{ fontSize: '0.8125rem', opacity: 0.7 }}>●</span>
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

      {/* DP Recurrence & Pseudopolynomial Complexity Rationale Card (Section 12, 25 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Recurrencia DP y Complejidad Pseudopolinomial:' : 'DP Recurrence & Pseudopolynomial Complexity:'}</strong>{' '}
        {language === 'es'
          ? 'Para cada elemento i y suma w: M[i, w] = M[i-1, w] ∨ (w ≥ w_i ∧ M[i-1, w - w_i]). El tiempo de ejecución es O(n · W). Como la longitud en bits de la entrada es log₂ W, el valor numérico W = 2^(log₂ W) crece exponencialmente con la representación binaria. Es un algoritmo pseudopolinomial: eficiente para capacidades moderadas, pero NP-completo en el caso general.'
          : 'For each item i and capacity w: M[i, w] = M[i-1, w] ∨ (w ≥ w_i ∧ M[i-1, w - w_i]). The running time is O(n · W). Since input bit length is log₂ W, numerical value W = 2^(log₂ W) is exponential in representation size. Hence it is pseudopolynomial: highly practical for moderate sums, yet NP-complete in general.'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <button
          type="button"
          className="btn-control"
          onClick={stepBackward}
          disabled={isAtStart}
          title={language === 'es' ? 'Paso anterior (←)' : 'Previous step (←)'}
          aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
        >
          ←
        </button>
        <button
          type="button"
          className="btn-control btn-play"
          onClick={isPlaying ? pause : play}
          title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
          aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          type="button"
          className="btn-control"
          onClick={stepForward}
          disabled={isAtEnd}
          title={language === 'es' ? 'Paso siguiente (→)' : 'Next step (→)'}
          aria-label={language === 'es' ? 'Paso siguiente' : 'Next step'}
        >
          →
        </button>
        <button
          type="button"
          className="btn-control"
          onClick={reset}
          title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
          aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
        >
          ↺
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
            aria-label={language === 'es' ? 'Línea de tiempo de pasos' : 'Step timeline'}
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
