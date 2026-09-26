import React, { useMemo } from 'react';
import {
  generateKnapsackGreedyTrace,
  KnapsackGreedyStepData,
  DEFAULT_GREEDY_ITEMS,
  DEFAULT_GREEDY_CAPACITY
} from '../../engine/algorithms/knapsackGreedyTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import { KnapsackVisualBag, KnapsackVisualItem } from './KnapsackVisualBag';
import './KnapsackGreedyVisualizer.css';

export const KnapsackGreedyVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(
    () => generateKnapsackGreedyTrace(DEFAULT_GREEDY_ITEMS, DEFAULT_GREEDY_CAPACITY),
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
  } = useTraceTimeline<KnapsackGreedyStepData>(timeline, {
    baseIntervalMs: 800,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const items = data?.items || [];
  const capacity = data?.capacity || DEFAULT_GREEDY_CAPACITY;
  const totalWeight = data?.totalWeight || 0;
  const totalValue = data?.totalValue || 0;
  const counterexampleComparison = data?.counterexampleComparison;
  const currentPhase = data?.currentPhase || 'init';

  const visualItems: KnapsackVisualItem[] = useMemo(() => {
    return items.map((it) => ({
      id: it.id,
      name: it.name,
      weight: it.weight,
      value: it.value,
      fractionTaken: it.fractionTaken,
      weightTaken: it.weightTaken,
      valueTaken: it.valueTaken
    }));
  }, [items]);

  const selectedItemIds = useMemo(() => {
    return items.filter((it) => it.fractionTaken > 0).map((it) => it.id);
  }, [items]);

  return (
    <div className="knapsack-greedy-visualizer">
      {/* Header & Badges */}
      <div className="greedy-header-bar">
        <h4>{language === 'es' ? 'Mochila Fraccionaria: Selección Greedy por Densidad' : 'Fractional Knapsack: Greedy Density Selection'}</h4>
        <div className="knapsack-stats-group">
          <span className="stat-badge stat-highlight">
            <span className="stat-num">${totalValue.toFixed(1)}</span>
            <span className="stat-label">{language === 'es' ? 'Valor Obtenido' : 'Obtained Value'}</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">
              {totalWeight.toFixed(1)} / {capacity}
            </span>
            <span className="stat-label">{language === 'es' ? 'Capacidad Usada' : 'Used Capacity'}</span>
          </span>
          <span className="stat-badge">
            <span className="stat-num">
              {items.filter((it) => it.fractionTaken > 0).length}
            </span>
            <span className="stat-label">{language === 'es' ? 'Ítems con Asignación' : 'Assigned Items'}</span>
          </span>
        </div>
      </div>

      {/* Step Narrative Banner */}
      <div className={`step-narrative-banner ${currentEvent?.type || 'init'}`}>
        <span className="step-tag">
          {language === 'es' ? `Paso ${currentStepIndex + 1} / ${totalSteps}` : `Step ${currentStepIndex + 1} / ${totalSteps}`}
        </span>
        <p className="step-message-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es || (language === 'es' ? 'Iniciando evaluación greedy...' : 'Starting greedy evaluation...')}
        </p>
      </div>

      {/* Dual Zone: Items Shelf vs Authentic Knapsack Bag */}
      <div className="greedy-visual-split">
        <div className="greedy-items-shelf">
          <div className="shelf-header-title">
            {language === 'es' ? 'Ítems Disponibles (Ordenados por Densidad v_i / w_i)' : 'Available Items (Sorted by Density v_i / w_i)'}
          </div>
          <div className="greedy-items-grid">
            {items.map((it) => {
              const isPartial = it.status === 'taken_partial';
              return (
                <div key={it.id} className={`greedy-item-card ${it.status}`}>
                  <div className="greedy-card-header">
                    <span className="greedy-item-title">{it.name}</span>
                    <span className="density-badge">
                      {it.ratio.toFixed(2)} $/kg
                    </span>
                  </div>
                  <div className="greedy-item-specs">
                    <span>{language === 'es' ? 'Peso:' : 'Weight:'} {it.weight} kg</span>
                    <span>{language === 'es' ? 'Valor: $' : 'Value: $'}{it.value}</span>
                  </div>
                  <div className="fraction-gauge">
                    <div className="fraction-label-row">
                      <span>{language === 'es' ? 'Asignación:' : 'Allocation:'}</span>
                      <span>{(it.fractionTaken * 100).toFixed(1)}%</span>
                    </div>
                    <div className="fraction-track">
                      <div
                        className={`fraction-fill ${isPartial ? 'partial' : ''}`}
                        style={{ width: `${it.fractionTaken * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="greedy-bag-pane">
          <KnapsackVisualBag
            capacity={capacity}
            items={visualItems}
            selectedItemIds={selectedItemIds}
            totalWeight={totalWeight}
            totalValue={totalValue}
            language={language}
          />
        </div>
      </div>

      {/* Counterexample Section */}
      {(currentPhase === 'counterexample' || counterexampleComparison) && (
        <div className="counterexample-card">
          <div className="counterexample-title">
            {language === 'es'
              ? 'Análisis Crítico: ¿Por qué la estrategia Greedy falla en mochila 0/1 entera?'
              : 'Critical Analysis: Why Greedy fails on 0/1 integer knapsack?'}
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {language === 'es'
              ? 'En la mochila 0/1 no se permite fraccionar ítems. Observa cómo la regla greedy queda atrapada con capacidad ociosa no utilizable:'
              : 'In 0/1 knapsack, fractional splitting is forbidden. Notice how the greedy rule leaves unusable idle capacity:'}
          </p>
          <div className="counterexample-comparison-grid">
            <div className="comparison-box">
              <span className="comparison-box-title">
                {language === 'es' ? 'Fraccionaria (Greedy Óptimo)' : 'Fractional (Greedy Optimal)'}
              </span>
              <span className="comparison-box-val success">
                ${counterexampleComparison?.fractionalValue ?? 240}
              </span>
              <span className="comparison-box-desc">
                {language === 'es'
                  ? 'Toma 100% de A, 100% de B y 66.7% de C. Llena los 50kg sin desperdicio.'
                  : 'Takes 100% of A, 100% of B and 66.7% of C. Fills 50kg with zero waste.'}
              </span>
            </div>

            <div className="comparison-box greedy-fail">
              <span className="comparison-box-title">
                {language === 'es' ? '0/1 con Heurística Greedy' : '0/1 with Greedy Heuristic'}
              </span>
              <span className="comparison-box-val fail">
                ${counterexampleComparison?.greedy01Value ?? 160}
              </span>
              <span className="comparison-box-desc">
                {language === 'es'
                  ? 'Toma A (10kg) y B (20kg). Quedan 20kg libres, pero C (30kg) no entra. Valor $160.'
                  : 'Takes A (10kg) and B (20kg). 20kg remain free, but C (30kg) does not fit. Value $160.'}
              </span>
            </div>

            <div className="comparison-box dp-optimal">
              <span className="comparison-box-title">
                {language === 'es' ? '0/1 Óptimo Real (Prog. Dinámica)' : '0/1 True Optimum (Dynamic Programming)'}
              </span>
              <span className="comparison-box-val success">
                ${counterexampleComparison?.dp01Value ?? 220}
              </span>
              <span className="comparison-box-desc">
                {language === 'es'
                  ? 'Omite A y toma B (20kg) + C (30kg) = 50kg exactos. Valor $220.'
                  : 'Skips A and takes B (20kg) + C (30kg) = 50kg exact. Value $220.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Greedy 0/1 Failure Rationale Card (Section 12, 50 & 94) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Por qué Falla Greedy en Mochila 0/1:' : 'Why Greedy Fails in 0/1 Knapsack:'}</strong>{' '}
        {language === 'es'
          ? 'En la variante fraccionaria, ordenar por densidad v_i / w_i es óptimo por argumento de intercambio. Pero en la mochila 0/1, la indivisibilidad impide rellenar el espacio residual con fracciones de los mejores objetos. Un objeto denso pero liviano puede bloquear la inclusión de combinaciones más pesadas que llenan mejor la capacidad, perdiendo el óptimo global y haciendo indispensable la programación dinámica.'
          : 'For fractional knapsack, sorting by density v_i / w_i is optimal by exchange argument. In 0/1 knapsack, indivisibility forbids taking partial fractions. High-density items can leave unfilled capacity that could have yielded higher total value if packed with complementary items, making dynamic programming essential.'}
      </div>

      {/* Playback Controls */}
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
              aria-label={`Velocidad ${spd}x`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
