import React, { useState, useEffect, useMemo } from 'react';
import { DEFAULT_DP_ITEMS, DEFAULT_DP_CAPACITY } from '../../engine/algorithms/knapsackDpTrace';
import { knapsackDpValidator, KnapsackItem } from '../../engine/algorithms/knapsackDpValidator';
import { KnapsackVisualBag } from './KnapsackVisualBag';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './KnapsackPlayground.css';

type KnapsackPreset = 'standard' | 'counterexample' | 'custom';

const COUNTEREXAMPLE_ITEMS: KnapsackItem[] = [
  { id: 'item-a', name: 'Objeto A (Alta Densidad)', weight: 1, value: 10 },
  { id: 'item-b', name: 'Objeto B (Gran Rendimiento)', weight: 3, value: 24 },
  { id: 'item-c', name: 'Objeto C (Gran Rendimiento)', weight: 3, value: 24 }
];

const INITIAL_CUSTOM_ITEMS: KnapsackItem[] = [
  { id: 'c-1', name: 'Notebook', weight: 3, value: 30 },
  { id: 'c-2', name: 'Cámara', weight: 2, value: 22 },
  { id: 'c-3', name: 'Libro', weight: 1, value: 9 },
  { id: 'c-4', name: 'Linterna', weight: 2, value: 15 }
];

export const KnapsackPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePreset, setActivePreset] = useState<KnapsackPreset>('standard');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showGreedyComparison, setShowGreedyComparison] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verified'>('idle');

  // Custom case state
  const [customCapacity, setCustomCapacity] = useState<number>(6);
  const [customItems, setCustomItems] = useState<KnapsackItem[]>(INITIAL_CUSTOM_ITEMS);
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemWeight, setNewItemWeight] = useState<number>(2);
  const [newItemValue, setNewItemValue] = useState<number>(10);
  const [customError, setCustomError] = useState<string | null>(null);

  const items = useMemo(() => {
    if (activePreset === 'standard') return DEFAULT_DP_ITEMS;
    if (activePreset === 'counterexample') return COUNTEREXAMPLE_ITEMS;
    return customItems;
  }, [activePreset, customItems]);

  const capacity = useMemo(() => {
    if (activePreset === 'custom') return customCapacity;
    return DEFAULT_DP_CAPACITY;
  }, [activePreset, customCapacity]);

  // Reset selection when switching preset
  useEffect(() => {
    setSelectedIds([]);
    setShowGreedyComparison(false);
    setVerificationStatus('idle');
  }, [activePreset]);

  const toggleItem = (id: string) => {
    setVerificationStatus('idle');
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleClear = () => {
    setSelectedIds([]);
    setVerificationStatus('idle');
  };

  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const trimmed = newItemName.trim();
    if (!trimmed) {
      setCustomError(language === 'es' ? 'El nombre no puede estar vacío.' : 'Name cannot be empty.');
      return;
    }
    if (newItemWeight <= 0 || !Number.isInteger(newItemWeight)) {
      setCustomError(language === 'es' ? 'El peso debe ser un entero positivo.' : 'Weight must be a positive integer.');
      return;
    }
    if (newItemValue <= 0 || !Number.isInteger(newItemValue)) {
      setCustomError(language === 'es' ? 'El valor debe ser un entero positivo.' : 'Value must be a positive integer.');
      return;
    }
    if (customItems.length >= 8) {
      setCustomError(language === 'es' ? 'Máximo 8 ítems permitidos en el laboratorio.' : 'Maximum 8 items allowed in sandbox.');
      return;
    }

    const newItem: KnapsackItem = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      weight: newItemWeight,
      value: newItemValue
    };

    setCustomItems([...customItems, newItem]);
    setNewItemName('');
  };

  const handleRemoveCustomItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (customItems.length <= 1) {
      setCustomError(language === 'es' ? 'Debe haber al menos un ítem.' : 'Must have at least one item.');
      return;
    }
    setCustomItems(customItems.filter((it) => it.id !== id));
    setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
  };

  const selectedItems: KnapsackItem[] = items.filter((it) =>
    selectedIds.includes(it.id)
  );

  const totalWeight = selectedItems.reduce((acc, it) => acc + it.weight, 0);
  const totalValue = selectedItems.reduce((acc, it) => acc + it.value, 0);
  const isOverweight = totalWeight > capacity;

  const optimalValue = useMemo(() => {
    if (items.length === 0 || capacity <= 0) return 0;
    return knapsackDpValidator.computeOptimalValue(items, capacity);
  }, [items, capacity]);

  // Compute what a density greedy heuristic would select
  const greedySelection = useMemo(() => {
    const sorted = [...items].sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
    let w = 0;
    const picked: KnapsackItem[] = [];
    for (const it of sorted) {
      if (w + it.weight <= capacity) {
        picked.push(it);
        w += it.weight;
      }
    }
    return picked;
  }, [items, capacity]);

  const greedyWeight = greedySelection.reduce((acc, it) => acc + it.weight, 0);
  const greedyValue = greedySelection.reduce((acc, it) => acc + it.value, 0);

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
          <button
            type="button"
            className={`btn-secondary ${activePreset === 'custom' ? 'active' : ''}`}
            onClick={() => setActivePreset('custom')}
          >
            {language === 'es' ? 'Caso propio' : 'Custom Case'}
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            {language === 'es' ? 'Vaciar' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Custom item editor when activePreset === 'custom' */}
      {activePreset === 'custom' && (
        <div className="knapsack-custom-editor">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div className="custom-input-group">
              <label htmlFor="knapsack-cap-input">
                {language === 'es' ? 'Capacidad máxima W (kg):' : 'Max Capacity W (kg):'}
              </label>
              <input
                id="knapsack-cap-input"
                type="number"
                min="1"
                max="25"
                value={customCapacity}
                onChange={(e) => {
                  const val = Math.max(1, Math.min(25, parseInt(e.target.value, 10) || 1));
                  setCustomCapacity(val);
                }}
                style={{ width: '80px' }}
              />
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setCustomItems(INITIAL_CUSTOM_ITEMS);
                setCustomCapacity(6);
                setSelectedIds([]);
                setCustomError(null);
              }}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              {language === 'es' ? 'Restablecer ítems' : 'Reset items'}
            </button>
          </div>

          <form onSubmit={handleAddCustomItem} className="custom-editor-row">
            <div className="custom-input-group" style={{ flex: '1 1 120px' }}>
              <label>{language === 'es' ? 'Nombre del ítem:' : 'Item Name:'}</label>
              <input
                type="text"
                placeholder={language === 'es' ? 'Ej. Tablet' : 'e.g. Tablet'}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="custom-input-group" style={{ width: '90px' }}>
              <label>{language === 'es' ? 'Peso (kg):' : 'Weight (kg):'}</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newItemWeight}
                onChange={(e) => setNewItemWeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>
            <div className="custom-input-group" style={{ width: '90px' }}>
              <label>{language === 'es' ? 'Valor ($):' : 'Value ($):'}</label>
              <input
                type="number"
                min="1"
                max="999"
                value={newItemValue}
                onChange={(e) => setNewItemValue(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
            </div>
            <button
              type="submit"
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', height: '34px' }}
            >
              {language === 'es' ? '+ Agregar Ítem' : '+ Add Item'}
            </button>
          </form>

          {customError && (
            <div style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>
              {customError}
            </div>
          )}
        </div>
      )}

      {/* Interactive Dual Workspace: Items Shelf + Authentic Backpack Bag */}
      <div className="knapsack-dual-workspace">
        <div className="knapsack-shelf-column">
          <div className="shelf-column-header">
            <h5>
              {language === 'es'
                ? 'Objetos Disponibles (Hacé clic para empacar o quitar):'
                : 'Available Items (Click to pack or unpack):'}
            </h5>
          </div>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {activePreset === 'custom' && (
                        <button
                          type="button"
                          className="item-remove-btn"
                          onClick={(e) => handleRemoveCustomItem(it.id, e)}
                          title={language === 'es' ? 'Eliminar ítem' : 'Delete item'}
                          aria-label={language === 'es' ? `Eliminar ${it.name}` : `Delete ${it.name}`}
                        >
                          ✕
                        </button>
                      )}
                      <span className="item-status-icon" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {inPack ? (language === 'es' ? 'EN MOCHILA' : 'PACKED') : '+'}
                      </span>
                    </div>
                  </div>
                  <div className="item-pick-metrics">
                    <span>{language === 'es' ? 'Peso' : 'Weight'}: {it.weight} kg</span>
                    <span>{language === 'es' ? 'Valor' : 'Value'}: ${it.value}</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {language === 'es' ? 'Densidad:' : 'Density:'} {density} $/kg
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="knapsack-bag-column">
          <KnapsackVisualBag
            capacity={capacity}
            items={items}
            selectedItemIds={selectedIds}
            totalWeight={totalWeight}
            totalValue={totalValue}
            language={language}
            onUnpackItem={toggleItem}
            interactive={true}
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

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setVerificationStatus('verified');
              if (isOptimal) {
                markAttempted('knapsack-dp');
              }
            }}
            disabled={selectedIds.length === 0}
            style={{ fontWeight: 600 }}
          >
            {language === 'es' ? '✓ Verificar Mochila' : '✓ Verify Knapsack'}
          </button>
          {selectedIds.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClear}
            >
              {language === 'es' ? 'Vaciar Mochila' : 'Empty Knapsack'}
            </button>
          )}
        </div>

        {verificationStatus === 'idle' ? (
          <div className="status-alert info" style={{ marginTop: '0.75rem' }}>
            {language === 'es'
              ? selectedIds.length === 0
                ? 'Hacé clic en los objetos superiores para agregarlos a la mochila y luego presiona "Verificar Mochila".'
                : `Selección actual: $${totalValue} (${totalWeight} / ${capacity} kg). Presiona "Verificar Mochila" para validar si alcanzaste el valor óptimo.`
              : selectedIds.length === 0
                ? 'Click on the items above to pack them into the knapsack, then click "Verify Knapsack".'
                : `Current selection: $${totalValue} (${totalWeight} / ${capacity} kg). Click "Verify Knapsack" to validate if optimal.`}
          </div>
        ) : isOverweight ? (
          <div className="status-alert warning" style={{ marginTop: '0.75rem' }}>
            {language === 'es'
              ? `Capacidad máxima excedida por ${totalWeight - capacity} kg. Retirá algún ítem para restablecer la factibilidad.`
              : `Maximum capacity exceeded by ${totalWeight - capacity} kg. Remove an item to restore feasibility.`}
          </div>
        ) : isOptimal ? (
          <div className="status-alert success" style={{ marginTop: '0.75rem' }}>
            {language === 'es'
              ? `¡Excelente! Has alcanzado la combinación factible de valor máximo ($${totalValue}) con peso total de ${totalWeight} kg.`
              : `Excellent! You reached the optimal feasible combination ($${totalValue}) with total weight of ${totalWeight} kg.`}
          </div>
        ) : (
          <div className="status-alert warning" style={{ marginTop: '0.75rem' }}>
            {language === 'es'
              ? `Tu selección es factible ($${totalValue}, ${totalWeight} kg), pero aún no es el valor máximo posible. ¡Sigue intentando!`
              : `Your selection is feasible ($${totalValue}, ${totalWeight} kg), but not yet the maximum possible value. Keep trying!`}
          </div>
        )}
      </div>

      {/* Greedy vs. DP Analysis Toggle */}
      <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setShowGreedyComparison(!showGreedyComparison)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <span>{showGreedyComparison ? '▲' : '▼'}</span>
          <span>
            {language === 'es'
              ? 'Análisis Crítico: ¿Por qué la heurística Greedy falla en la Mochila 0/1?'
              : 'Critical Analysis: Why does the Greedy heuristic fail in 0/1 Knapsack?'}
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
              <strong>
                {language === 'es' ? 'Comparación en la instancia activa:' : 'Comparison on active instance:'}
              </strong>
              <br />
              • {language === 'es' ? 'Heurística Greedy (orden por densidad):' : 'Greedy Heuristic (density order):'} ${greedyValue} ({greedyWeight} kg / {capacity} kg)
              <br />
              • {language === 'es' ? 'Óptimo Global DP:' : 'Global DP Optimum:'} ${optimalValue}
              <br />
              <br />
              {greedyValue < optimalValue ? (
                <span style={{ color: 'var(--color-warning, #d97706)' }}>
                  {language === 'es'
                    ? `Greedy queda atrapado en un subóptimo ($${greedyValue} < $${optimalValue}) debido a holgura ociosa indivisible.`
                    : `Greedy is trapped in a suboptimal solution ($${greedyValue} < $${optimalValue}) due to indivisible slack capacity.`}
                </span>
              ) : (
                <span style={{ color: 'var(--color-success, var(--success))' }}>
                  {language === 'es'
                    ? `En esta instancia particular, la heurística Greedy coincide con el óptimo ($${greedyValue}). ¡Creá otra instancia o usá el contraejemplo para verla fallar!`
                    : `On this specific instance, Greedy matches the DP optimum ($${greedyValue}). Try another instance or the counterexample to see it fail!`}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
