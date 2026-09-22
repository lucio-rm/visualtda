import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { solveSubsetSum } from '../../engine/algorithms/subsetSumValidator';
import { generateSubsetSumTrace } from '../../engine/algorithms/subsetSumTrace';
import './SubsetSumPlayground.css';

interface Preset {
  id: string;
  name: { es: string; en: string };
  numbers: number[];
  target: number;
}

const PRESETS: Preset[] = [
  {
    id: 'guia11',
    name: {
      es: 'Guía Ej. 11: [2, 3, 5, 7, 8], S = 10',
      en: 'Guide Ex. 11: [2, 3, 5, 7, 8], S = 10'
    },
    numbers: [2, 3, 5, 7, 8],
    target: 10
  },
  {
    id: 'monedas',
    name: {
      es: 'Cambio de Monedas: [1, 2, 5, 10, 20, 50], S = 37',
      en: 'Coin Change: [1, 2, 5, 10, 20, 50], S = 37'
    },
    numbers: [1, 2, 5, 10, 20, 50],
    target: 37
  },
  {
    id: 'potencias',
    name: {
      es: 'Potencias de Dos: [1, 2, 4, 8, 16], S = 23',
      en: 'Powers of Two: [1, 2, 4, 8, 16], S = 23'
    },
    numbers: [1, 2, 4, 8, 16],
    target: 23
  }
];

export const SubsetSumPlayground: React.FC = () => {
  const { language, t } = useLanguage();

  const [numbers, setNumbers] = useState<number[]>([2, 3, 5, 7, 8]);
  const [target, setTarget] = useState<number>(10);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  // Canonical solutions
  const canonicalSolutions = useMemo(() => {
    return solveSubsetSum(numbers, target);
  }, [numbers, target]);

  // Pruning statistics
  const traceStats = useMemo(() => {
    const timeline = generateSubsetSumTrace(numbers, target);
    const lastEvent = timeline.events[timeline.totalSteps - 1]?.data;
    const explored = lastEvent?.exploredNodes ?? 0;
    const pruned = lastEvent?.prunedNodes ?? 0;
    const bruteForce = Math.pow(2, numbers.length);
    const savingsPct = Math.max(0, Math.round(((bruteForce - explored) / bruteForce) * 100));

    return {
      explored,
      pruned,
      bruteForce,
      savingsPct
    };
  }, [numbers, target]);

  // User interactive subset sum
  const userSelectedSum = useMemo(() => {
    let sum = 0;
    selectedIndices.forEach((idx) => {
      if (idx < numbers.length) sum += numbers[idx];
    });
    return sum;
  }, [numbers, selectedIndices]);

  const toggleNumber = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const isExactMatch = userSelectedSum === target;
  const isOverflow = userSelectedSum > target;

  return (
    <div className="subset-sum-playground">
      {/* Presets Row */}
      <div className="subset-playground-presets">
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {language === 'es' ? 'Escenarios de prueba:' : 'Presets:'}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className="preset-btn"
            onClick={() => {
              setNumbers(p.numbers);
              setTarget(p.target);
              setSelectedIndices(new Set());
            }}
          >
            {t(p.name)}
          </button>
        ))}
      </div>

      {/* Target Config */}
      <div className="subset-playground-config">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="target-input-slider" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {language === 'es' ? `Valor objetivo S: ${target}` : `Target sum S: ${target}`}
          </label>
          <input
            id="target-input-slider"
            type="range"
            min="1"
            max={Math.max(30, numbers.reduce((a, b) => a + b, 0))}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Conjunto de elementos:' : 'Input elements:'}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>
            [{numbers.join(', ')}] (Suma total = {numbers.reduce((a, b) => a + b, 0)})
          </span>
        </div>
      </div>

      {/* Interactive Subset Builder Zone */}
      <div className="interactive-builder-zone">
        <div className="builder-header">
          <span>{language === 'es' ? 'Haz clic en los números para armar tu subconjunto:' : 'Click numbers to build your candidate subset:'}</span>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '2px 8px' }}
            onClick={() => setSelectedIndices(new Set())}
          >
            {language === 'es' ? 'Limpiar selección' : 'Clear selection'}
          </button>
        </div>

        {/* Clickable Chips */}
        <div className="clickable-chips-grid">
          {numbers.map((val, idx) => {
            const isSelected = selectedIndices.has(idx);
            return (
              <button
                key={`chip-num-${val}-${idx}`}
                type="button"
                className={`clickable-chip ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleNumber(idx)}
                aria-pressed={isSelected}
                aria-label={`${val}, ${isSelected ? (language === 'es' ? 'en suma' : 'in sum') : (language === 'es' ? 'disponible' : 'available')}`}
              >
                <span className="chip-sub">{isSelected ? (language === 'es' ? 'En suma' : 'Chosen') : (language === 'es' ? 'Sumar' : 'Add')}</span>
                <span>{val}</span>
              </button>
            );
          })}
        </div>

        {/* Live Feedback Banner */}
        {isExactMatch ? (
          <div className="challenge-feedback-banner success">
            🎉 {language === 'es'
              ? `¡Suma exacta conseguida! La suma de tu selección es exactamente S = ${target}.`
              : `Exact sum achieved! Your selected numbers sum to exactly S = ${target}.`}
          </div>
        ) : isOverflow ? (
          <div className="challenge-feedback-banner suboptimal">
            ⚠️ {language === 'es'
              ? `Suma actual: ${userSelectedSum} > ${target} (excedido por ${userSelectedSum - target}). El algoritmo de Backtracking poda esta rama inmediatamente.`
              : `Current sum: ${userSelectedSum} > ${target} (exceeded by ${userSelectedSum - target}). Backtracking prunes this branch immediately.`}
          </div>
        ) : (
          <div className="challenge-feedback-banner incomplete">
            💡 {language === 'es'
              ? `Suma actual: ${userSelectedSum} / ${target} (faltan ${target - userSelectedSum} para alcanzar la meta).`
              : `Current sum: ${userSelectedSum} / ${target} (need ${target - userSelectedSum} to reach target).`}
          </div>
        )}
      </div>

      {/* Pruning Efficiency Comparison Card */}
      <div className="pruning-comparison-card">
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Fuerza Bruta (2^n)' : 'Brute Force (2^n)'}</span>
          <span className="comparison-stat-number">{traceStats.bruteForce}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Subconjuntos posibles' : 'Total possible subsets'}
          </span>
        </div>
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Nodos con Podas' : 'Nodes with Pruning'}</span>
          <span className="comparison-stat-number" style={{ color: '#3b82f6' }}>
            {traceStats.explored}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Visitados en Backtracking' : 'Visited by Backtracking'}
          </span>
        </div>
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Ramas Podadas' : 'Pruned Subtrees'}</span>
          <span className="comparison-stat-number" style={{ color: '#f59e0b' }}>
            {traceStats.pruned}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Descartadas por exceso/déficit' : 'Cut by excess/deficit'}
          </span>
        </div>
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Ahorro de Cómputo' : 'Search Space Saved'}</span>
          <span className="comparison-stat-number" style={{ color: '#10b981' }}>
            {traceStats.savingsPct}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Del árbol no explorado' : 'Of state space pruned'}
          </span>
        </div>
      </div>

      {/* Canonical Solutions Shelf */}
      <div className="all-solutions-box">
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {language === 'es'
            ? `Todos los ${canonicalSolutions.length} subconjuntos óptimos que suman S = ${target}:`
            : `All ${canonicalSolutions.length} optimal subsets summing to S = ${target}:`}
        </span>
        {canonicalSolutions.length === 0 ? (
          <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'No existe ningún subconjunto que sume exactamente la meta.' : 'No subset sums to the target.'}
          </span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {canonicalSolutions.map((sol, idx) => (
              <span key={`sol-can-${idx}`} className="solution-badge">
                #{idx + 1}: [{sol.join(', ')}]
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
