import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_DP_ITEMS, DEFAULT_DP_CAPACITY } from '../../engine/algorithms/knapsackDpTrace';
import { knapsackDpValidator, KnapsackItem } from '../../engine/algorithms/knapsackDpValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './KnapsackPlayground.css';

type KnapsackPreset = 'standard' | 'counterexample';

const COUNTEREXAMPLE_ITEMS: KnapsackItem[] = [
  { id: 'item-a', name: 'Objeto A (Alta Densidad)', weight: 1, value: 10 },
  { id: 'item-b', name: 'Objeto B (Gran Rendimiento)', weight: 3, value: 24 },
  { id: 'item-c', name: 'Objeto C (Gran Rendimiento)', weight: 3, value: 24 }
];

export const KnapsackPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePreset, setActivePreset] = useState<KnapsackPreset>('standard');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showGreedyComparison, setShowGreedyComparison] = useState<boolean>(false);

  const items = activePreset === 'standard' ? DEFAULT_DP_ITEMS : COUNTEREXAMPLE_ITEMS;
  const capacity = DEFAULT_DP_CAPACITY; // 6 kg

  // Reset selection when switching preset
  useEffect(() => {
    setSelectedIds([]);
    setShowGreedyComparison(false);
  }, [activePreset]);

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

  const selectedItems: KnapsackItem[] = items.filter((it) =>
    selectedIds.includes(it.id)
  );

  const totalWeight = selectedItems.reduce((acc, it) => acc + it.weight, 0);
  const totalValue = selectedItems.reduce((acc, it) => acc + it.value, 0);
  const isOverweight = totalWeight > capacity;

  const optimalValue = useMemo(() => {
    return knapsackDpValidator.computeOptimalValue(items, capacity);
  }, [items, capacity]);

  const validation = knapsackDpValidator.validate(
    { items, capacity },
    selectedItems
  );

  const isOptimal = validation.valid && totalValue === optimalValue && totalValue > 0;

  useEffect(() => {
    if (isOptimal) {
      markAttempted('knapsack-dp');
    }
  }, [isOptimal, markAttempted]);

  return (
    <div className="knapsack-playground-box">
      <div className="playground-header-row">
        <div>
          <h4 style={{ margin: 0 }}>
            {language === 'es'
              ? 'Laboratorio Experimental: Mochila 0/1 (DP vs. Greedy)'
              : 'Experimental Sandbox: 0/1 Knapsack (DP vs. Greedy)'}
          </h4>
          <p className="playground-instruction-text">
            {language === 'es'
              ? `Seleccioná qué objetos empacar en la mochila de ${capacity} kg. Observá por qué las decisiones locales inmediatas no garantizan el óptimo global en problemas enteros.`
              : `Select items to pack into the ${capacity} kg knapsack. Observe why immediate local decisions fail to guarantee the global optimum in discrete problems.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn-secondary ${activePreset === 'standard' ? 'active' : ''}`}
            onClick={() => setActivePreset('standard')}
          >
            {language === 'es' ? 'Instancia Estándar' : 'Standard Instance'}
          </button>
          <button
            type="button"
            className={`btn-secondary ${activePreset === 'counterexample' ? 'active' : ''}`}
            onClick={() => setActivePreset('counterexample')}
            title={language === 'es' ? 'Instancia donde Greedy por densidad fracasa' : 'Instance where density Greedy fails'}
          >
            {language === 'es' ? 'Contraejemplo de Greedy' : 'Greedy Counterexample'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {language === 'es' ? 'Vaciar' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Items Shelf */}
      <div className="knapsack-items-shelf">
        {items.map((it) => {
          const inPack = selectedIds.includes(it.id);
          const density = (it.value / it.weight).toFixed(1);
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
                <span className="item-status-icon" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  {inPack ? (language === 'es' ? 'EN MOCHILA' : 'PACKED') : '+'}
                </span>
              </div>
              <div className="item-pick-metrics">
                <span>{language === 'es' ? 'Peso' : 'Weight'}: {it.weight} kg</span>
                <span>{language === 'es' ? 'Valor' : 'Value'}: ${it.value}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {language === 'es' ? 'Densidad:' : 'Density:'} {density} $/kg
              </div>
            </div>
          );
        })}
      </div>

      {/* Backpack capacity gauge */}
      <div className="backpack-summary-card">
        <div className="gauge-label-row">
          <span>{language === 'es' ? 'Capacidad de Carga' : 'Weight Capacity'}</span>
          <span style={{ color: isOverweight ? 'var(--color-error)' : undefined, fontWeight: 700 }}>
            {totalWeight} kg / {capacity} kg ({Math.round((totalWeight / capacity) * 100)}%)
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${Math.min(100, (totalWeight / capacity) * 100)}%`,
              background: isOverweight ? 'var(--color-error)' : undefined
            }}
          />
        </div>
      </div>

      {/* Live Feedback panel */}
      <div className="playground-feedback-panel">
        <div className="score-row">
          <span>
            {language === 'es' ? 'Valor Total Acumulado:' : 'Total Accumulated Value:'}{' '}
            <strong>${totalValue}</strong>
          </span>
          <span style={{ color: isOverweight ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 600 }}>
            {isOverweight
              ? (language === 'es' ? '[No Factible] Capacidad excedida' : '[Infeasible] Capacity exceeded')
              : (language === 'es' ? '[Factible]' : '[Feasible]')}
          </span>
        </div>

        {isOptimal ? (
          <div className="status-alert success">
            {language === 'es'
              ? `Combinación factible de valor máximo alcanzada ($${totalValue}) con peso total de ${totalWeight} kg.`
              : `Optimal feasible combination reached ($${totalValue}) with total weight of ${totalWeight} kg.`}
          </div>
        ) : isOverweight ? (
          <div className="status-alert warning">
            {language === 'es'
              ? `Capacidad máxima excedida por ${totalWeight - capacity} kg. Retirá algún ítem para restablecer la factibilidad.`
              : `Maximum capacity exceeded by ${totalWeight - capacity} kg. Remove an item to restore feasibility.`}
          </div>
        ) : selectedIds.length > 0 ? (
          <div className="status-alert info">
            {language === 'es'
              ? `Selección factible actual: $${totalValue} (${totalWeight} kg). Aún quedan ${capacity - totalWeight} kg libres en la mochila.`
              : `Current feasible selection: $${totalValue} (${totalWeight} kg). Remaining capacity: ${capacity - totalWeight} kg.`}
          </div>
        ) : (
          <div className="status-alert info">
            {language === 'es'
              ? 'Hacé clic en los objetos superiores para agregarlos a la mochila.'
              : 'Click on the items above to pack them into the knapsack.'}
          </div>
        )}
      </div>

      {/* Greedy vs. DP Analysis Toggle */}
      <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowGreedyComparison(!showGreedyComparison)}
          style={{ width: '100%', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>
            {showGreedyComparison ? '▲' : '▼'}{' '}
            {language === 'es'
              ? 'Análisis Crítico: ¿Por qué la heurística Greedy falla en la Mochila 0/1?'
              : 'Critical Analysis: Why does the Greedy heuristic fail in 0/1 Knapsack?'}
          </span>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
            {language === 'es' ? 'Ver demostración' : 'View proof'}
          </span>
        </button>

        {showGreedyComparison && (
          <div style={{ marginTop: '0.75rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              {language === 'es'
                ? 'En la versión continua (Fraccionaria), ordenar por densidad de valor vᵢ / wᵢ es demostrablemente óptimo porque permite tomar fracciones arbitrarias del último elemento.'
                : 'In the fractional knapsack problem, sorting by density vᵢ / wᵢ is provably optimal because arbitrary fractional amounts can fill the remaining space.'}
            </p>
            <p style={{ margin: '0 0 0.5rem 0' }}>
              {language === 'es'
                ? 'En la Mochila 0/1 entera, la indivisibilidad rompe el argumento de intercambio Greedy: tomar el objeto con mayor densidad unitaria puede dejar una capacidad residual inutilizable (holgura ociosa).'
                : 'In 0/1 Knapsack, indivisibility invalidates the Greedy exchange argument: selecting the highest density item can leave unusable slack capacity.'}
            </p>
            <div style={{ background: 'var(--surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)' }}>
              <strong>{language === 'es' ? 'Contrajemplo concreto:' : 'Concrete Counterexample:'}</strong>
              <br />
              • A: $10 / 1 kg (Densidad: 10 $/kg)
              <br />
              • B: $24 / 3 kg (Densidad: 8 $/kg)
              <br />
              • C: $24 / 3 kg (Densidad: 8 $/kg)
              <br />
              • {language === 'es' ? 'Capacidad' : 'Capacity'} W = 6 kg
              <br />
              <br />
              → <strong>Greedy</strong> {language === 'es' ? 'empaca A ($10) y B ($24). Restan 2 kg (C no cabe). Total:' : 'packs A ($10) and B ($24). 2 kg remaining (C does not fit). Total:'} <strong>$34</strong> (peso 4 kg).
              <br />
              → <strong>DP</strong> {language === 'es' ? 'evalúa el estado compuesto y empaca B ($24) + C ($24). Total:' : 'evaluates composite states and packs B ($24) + C ($24). Total:'} <strong>$48</strong> (peso 6 kg).
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
