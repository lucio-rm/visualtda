import React, { useState, useEffect } from 'react';
import { DEFAULT_DP_ITEMS, DEFAULT_DP_CAPACITY } from '../../engine/algorithms/knapsackDpTrace';
import { knapsackDpValidator, KnapsackItem } from '../../engine/algorithms/knapsackDpValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './KnapsackPlayground.css';

export const KnapsackPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
  };

  const selectedItems: KnapsackItem[] = DEFAULT_DP_ITEMS.filter((it) =>
    selectedIds.includes(it.id)
  );

  const totalWeight = selectedItems.reduce((acc, it) => acc + it.weight, 0);
  const totalValue = selectedItems.reduce((acc, it) => acc + it.value, 0);
  const capacity = DEFAULT_DP_CAPACITY;

  const isOverweight = totalWeight > capacity;
  const validation = knapsackDpValidator.validate(
    { items: DEFAULT_DP_ITEMS, capacity },
    selectedItems
  );

  const isOptimal = validation.valid && totalValue === 65;

  useEffect(() => {
    if (isOptimal) {
      markAttempted('knapsack-dp');
    }
  }, [isOptimal]);

  return (
    <div className="knapsack-playground-box">
      <div className="playground-header-row">
        <div>
          <h4 style={{ margin: 0 }}>
            {language === 'es' ? 'Simulador Manual de la Mochila' : 'Manual Knapsack Simulator'}
          </h4>
          <p className="playground-instruction-text">
            {language === 'es'
              ? `Selecciona qué objetos guardar en la mochila de ${capacity} kg para maximizar el valor sin romper el límite de peso.`
              : `Select items to pack into the ${capacity} kg knapsack to maximize value without exceeding weight capacity.`}
          </p>
        </div>
        <button type="button" className="btn-secondary" onClick={handleClear}>
          {language === 'es' ? 'Vaciar Mochila' : 'Empty Knapsack'}
        </button>
      </div>

      {/* Items to choose from */}
      <div className="knapsack-items-shelf">
        {DEFAULT_DP_ITEMS.map((it) => {
          const inPack = selectedIds.includes(it.id);
          return (
            <div
              key={it.id}
              onClick={() => toggleItem(it.id)}
              className={`item-pick-card ${inPack ? 'in-pack' : ''}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleItem(it.id);
                }
              }}
              aria-pressed={inPack}
              aria-label={`${it.name}, ${it.weight} kg, $${it.value}, ${inPack ? (language === 'es' ? 'guardado en mochila' : 'in backpack') : (language === 'es' ? 'disponible' : 'available')}`}
            >
              <div className="item-pick-header">
                <span className="item-pick-name">{it.name}</span>
                <span className="item-status-icon">{inPack ? '🎒 ✓' : '➕'}</span>
              </div>
              <div className="item-pick-metrics">
                <span>{language === 'es' ? 'Peso' : 'Weight'}: {it.weight} kg</span>
                <span>{language === 'es' ? 'Valor' : 'Value'}: ${it.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Backpack status bar */}
      <div className="backpack-summary-card">
        <div className="gauge-label-row">
          <span>{language === 'es' ? 'Capacidad de Carga' : 'Load Capacity'}</span>
          <span style={{ color: isOverweight ? '#dc2626' : undefined, fontWeight: 700 }}>
            {totalWeight} kg / {capacity} kg ({Math.round((totalWeight / capacity) * 100)}%)
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, (totalWeight / capacity) * 100)}%`,
              background: isOverweight ? '#ef4444' : undefined
            }}
          />
        </div>
      </div>

      {/* Feedback panel */}
      <div className="playground-feedback-panel">
        <div className="score-row">
          <span>
            {language === 'es' ? 'Valor Total:' : 'Total Value:'}{' '}
            <strong>${totalValue} / $65 (Óptimo)</strong>
          </span>
          <span>
            {isOverweight
              ? (language === 'es' ? '⚠️ Exceso de peso' : '⚠️ Overweight')
              : (language === 'es' ? '✓ Peso factible' : '✓ Feasible weight')}
          </span>
        </div>

        {isOptimal ? (
          <div className="status-alert success">
            🎉 {language === 'es' ? '¡Increíble! Encontraste manualmente la combinación óptima global de $65 (Guitarra + Celular + Stereo).' : 'Awesome! You manually found the optimal combination of $65.'}
          </div>
        ) : isOverweight ? (
          <div className="status-alert warning">
            ⚠️ {language === 'es' ? `Has superado la capacidad máxima por ${totalWeight - capacity} kg. Retira algún ítem para volver a un estado factible.` : `You exceeded capacity by ${totalWeight - capacity} kg.`}
          </div>
        ) : selectedIds.length > 0 ? (
          <div className="status-alert info">
            💡 {language === 'es' ? `Llevas $${totalValue}. Aún quedan ${capacity - totalWeight} kg disponibles. ¿Puedes alcanzar los $65?` : `You have $${totalValue}. Can you reach $65?`}
          </div>
        ) : (
          <div className="status-alert info">
            👉 {language === 'es' ? 'Comienza agregando un objeto a la mochila.' : 'Start by packing an item.'}
          </div>
        )}
      </div>
    </div>
  );
};
