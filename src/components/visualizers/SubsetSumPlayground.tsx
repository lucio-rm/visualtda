import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { solveSubsetSum } from '../../engine/algorithms/subsetSumValidator';
import { generateSubsetSumTrace } from '../../engine/algorithms/subsetSumTrace';
import { useStudentProgress } from '../../context/StudentProgressContext';
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
  const { markAttempted } = useStudentProgress();

  const [numbers, setNumbers] = useState<number[]>([2, 3, 5, 7, 8]);
  const [numbersStr, setNumbersStr] = useState<string>('2, 3, 5, 7, 8');
  const [target, setTarget] = useState<number>(10);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isDragOverBucket, setIsDragOverBucket] = useState<boolean>(false);

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

  useEffect(() => {
    if (isExactMatch && selectedIndices.size > 0) {
      markAttempted('subset-sum-backtracking');
    }
  }, [isExactMatch, selectedIndices]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', idx.toString());
  };

  const handleDropInBucket = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverBucket(false);
    const idxStr = e.dataTransfer.getData('text/plain');
    const idx = parseInt(idxStr, 10);
    if (!isNaN(idx) && idx >= 0 && idx < numbers.length) {
      setSelectedIndices((prev) => new Set([...prev, idx]));
    }
  };

  const handleDropInPool = (e: React.DragEvent) => {
    e.preventDefault();
    const idxStr = e.dataTransfer.getData('text/plain');
    const idx = parseInt(idxStr, 10);
    if (!isNaN(idx) && idx >= 0 && idx < numbers.length) {
      setSelectedIndices((prev) => {
        const next = new Set(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const fillPercentage = Math.min(100, Math.round((userSelectedSum / target) * 100));

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
              setNumbersStr(p.numbers.join(', '));
              setTarget(p.target);
              setSelectedIndices(new Set());
            }}
          >
            {t(p.name)}
          </button>
        ))}
      </div>

      {/* Target & Elements Config */}
      <div className="subset-playground-config">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="target-input-slider" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              {language === 'es' ? `Valor objetivo S:` : `Target sum S:`}
            </label>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)' }}>
              S = {target}
            </span>
          </div>
          <input
            id="target-input-slider"
            type="range"
            min="1"
            max={Math.max(30, numbers.reduce((a, b) => a + b, 0))}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            style={{ accentColor: 'var(--accent)' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="subset-elements-input" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Elementos (editables, separados por coma):' : 'Elements (editable, comma-separated):'}
          </label>
          <input
            id="subset-elements-input"
            type="text"
            value={numbersStr}
            onChange={(e) => {
              const val = e.target.value;
              setNumbersStr(val);
              const parsed = val
                .split(',')
                .map((s) => parseInt(s.trim(), 10))
                .filter((n) => !isNaN(n) && n > 0);
              if (parsed.length > 0) {
                setNumbers(parsed);
                setSelectedIndices(new Set());
              }
            }}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem'
            }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {language === 'es'
              ? `Total ${numbers.length} elementos (Suma máxima = ${numbers.reduce((a, b) => a + b, 0)})`
              : `Total ${numbers.length} elements (Max sum = ${numbers.reduce((a, b) => a + b, 0)})`}
          </span>
        </div>
      </div>

      {/* Tactile Drag & Drop Interactive Arena */}
      <div className="interactive-builder-zone">
        {/* Source Pool of Available Elements */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropInPool}
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px'
          }}
        >
          <div className="builder-header" style={{ marginBottom: '0.5rem' }}>
            <span>
              {language === 'es'
                ? 'Elementos disponibles (arrastra a la balanza o haz clic):'
                : 'Available elements (drag into bucket or click):'}
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              {numbers.length - selectedIndices.size} {language === 'es' ? 'en espera' : 'waiting'}
            </span>
          </div>

          <div className="clickable-chips-grid" style={{ minHeight: '60px' }}>
            {numbers.map((val, idx) => {
              const isSelected = selectedIndices.has(idx);
              if (isSelected) return null; // Rendered in bucket below

              return (
                <div
                  key={`chip-available-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onClick={() => toggleNumber(idx)}
                  className="clickable-chip"
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'grab' }}
                  title={language === 'es' ? 'Arrastra a la cubeta o haz clic' : 'Drag to bucket or click'}
                >
                  <span className="chip-sub">{language === 'es' ? 'Arrastrar' : 'Drag'}</span>
                  <span>{val}</span>
                </div>
              );
            })}
            {selectedIndices.size === numbers.length && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', alignSelf: 'center' }}>
                {language === 'es' ? 'Todos los elementos fueron colocados en la balanza.' : 'All elements placed in bucket.'}
              </span>
            )}
          </div>
        </div>

        {/* Target Bucket / Balance Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOverBucket(true);
          }}
          onDragLeave={() => setIsDragOverBucket(false)}
          onDrop={handleDropInBucket}
          style={{
            padding: '1rem',
            backgroundColor: isDragOverBucket
              ? 'rgba(59, 130, 246, 0.15)'
              : isExactMatch
              ? 'var(--state-solution-bg)'
              : isOverflow
              ? 'var(--state-conflict-bg)'
              : 'var(--surface)',
            border: `2px dashed ${
              isDragOverBucket
                ? '#3b82f6'
                : isExactMatch
                ? 'var(--success)'
                : isOverflow
                ? 'var(--error)'
                : 'var(--border)'
            }`,
            borderRadius: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <div className="builder-header" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>
              {language === 'es' ? 'Balanza de Suma Objetivo' : 'Target Sum Balance'}:{' '}
              <strong
                style={{
                  color: isExactMatch ? 'var(--success)' : isOverflow ? 'var(--error)' : 'var(--accent)',
                  fontSize: '1.1rem'
                }}
              >
                {userSelectedSum} / {target}
              </strong>
            </span>

            <button
              type="button"
              className="chip-btn"
              style={{ fontSize: '0.8125rem', padding: '0.2rem 0.5rem' }}
              onClick={() => setSelectedIndices(new Set())}
              disabled={selectedIndices.size === 0}
            >
              ✕ {language === 'es' ? 'Vaciar balanza' : 'Empty bucket'}
            </button>
          </div>

          {/* Fluid Level Bar Gauge */}
          <div
            style={{
              width: '100%',
              height: '14px',
              backgroundColor: 'var(--bg)',
              borderRadius: '7px',
              overflow: 'hidden',
              marginBottom: '0.75rem',
              border: '1px solid var(--border)',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${fillPercentage}%`,
                backgroundColor: isExactMatch ? 'var(--success)' : isOverflow ? 'var(--error)' : 'var(--accent)',
                transition: 'width 0.3s ease, background-color 0.3s ease'
              }}
            />
          </div>

          {/* Bucket Chips */}
          <div className="clickable-chips-grid" style={{ minHeight: '65px' }}>
            {Array.from(selectedIndices).map((idx) => {
              const val = numbers[idx];
              return (
                <div
                  key={`chip-in-bucket-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onClick={() => toggleNumber(idx)}
                  className="clickable-chip selected"
                  style={{
                    backgroundColor: isExactMatch ? 'var(--success)' : isOverflow ? 'var(--error)' : 'var(--accent)',
                    borderColor: isExactMatch ? '#059669' : isOverflow ? '#dc2626' : '#2563eb',
                    cursor: 'pointer'
                  }}
                  title={language === 'es' ? 'Haz clic o arrastra para quitar' : 'Click or drag to remove'}
                >
                  <span className="chip-sub">{language === 'es' ? 'Quitar' : 'Remove'}</span>
                  <span>{val}</span>
                </div>
              );
            })}
            {selectedIndices.size === 0 && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', alignSelf: 'center' }}>
                {language === 'es'
                  ? 'Arrastra números aquí o haz clic en los de arriba para construir tu subconjunto.'
                  : 'Drag numbers here or click above to build your subset.'}
              </span>
            )}
          </div>

          {/* Live Feedback Banner */}
          {isExactMatch ? (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--state-solution-bg)',
                borderLeft: '4px solid var(--success)',
                borderRadius: '4px',
                fontSize: '0.85rem',
                color: 'var(--text)'
              }}
            >
              <strong>
                {language === 'es' ? '¡Suma Exacta Factible!' : 'Exact Feasible Sum!'}
              </strong>{' '}
              {language === 'es'
                ? `Los números seleccionados suman exactamente S = ${target}. Se encontró una solución válida para el problema de la decisión.`
                : `Selected numbers sum to exactly S = ${target}. A valid solution to the decision problem was found.`}
            </div>
          ) : isOverflow ? (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--state-conflict-bg)',
                borderLeft: '4px solid var(--error)',
                borderRadius: '4px',
                fontSize: '0.85rem',
                color: 'var(--text)'
              }}
            >
              <strong>
                {language === 'es' ? 'Poda Inmediata por Exceso:' : 'Immediate Excess Pruning:'}
              </strong>{' '}
              {language === 'es'
                ? `Suma actual = ${userSelectedSum} > S = ${target} (exceso de ${userSelectedSum - target}). Como todos los números son positivos, cualquier adición posterior seguirá siendo mayor a S. El algoritmo de Backtracking poda esta rama sin explorar sus descendientes.`
                : `Current sum = ${userSelectedSum} > S = ${target} (overflow by ${userSelectedSum - target}). Since all numbers are positive, further additions only increase sum. Backtracking prunes this branch immediately.`}
            </div>
          ) : (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--bg)',
                borderRadius: '4px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}
            >
              {language === 'es'
                ? `Suma acumulada: ${userSelectedSum} / ${target} (faltan ${target - userSelectedSum} unidades para alcanzar el objetivo).`
                : `Accumulated sum: ${userSelectedSum} / ${target} (need ${target - userSelectedSum} more units to reach target).`}
            </div>
          )}
        </div>
      </div>

      {/* Pruning Efficiency Comparison Card */}
      <div className="pruning-comparison-card">
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Fuerza Bruta (2^n)' : 'Brute Force (2^n)'}</span>
          <span className="comparison-stat-number">{traceStats.bruteForce}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Subconjuntos totales' : 'Total subsets'}
          </span>
        </div>
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Nodos Explorados' : 'Explored Nodes'}</span>
          <span className="comparison-stat-number" style={{ color: '#3b82f6' }}>
            {traceStats.explored}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Visitados en Backtracking' : 'Visited in Backtracking'}
          </span>
        </div>
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Ramas Podadas' : 'Pruned Subtrees'}</span>
          <span className="comparison-stat-number" style={{ color: 'var(--warning)' }}>
            {traceStats.pruned}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Descartadas por cota' : 'Cut by bound'}
          </span>
        </div>
        <div className="comparison-stat-box">
          <span className="comparison-stat-title">{language === 'es' ? 'Ahorro de Cómputo' : 'Search Space Saved'}</span>
          <span className="comparison-stat-number" style={{ color: 'var(--success)' }}>
            {traceStats.savingsPct}%
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {language === 'es' ? 'Espacio podado' : 'State space pruned'}
          </span>
        </div>
      </div>

      {/* Canonical Solutions Shelf */}
      <div className="all-solutions-box">
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          {language === 'es'
            ? `Todos los ${canonicalSolutions.length} subconjuntos válidos que suman S = ${target}:`
            : `All ${canonicalSolutions.length} valid subsets summing to S = ${target}:`}
        </span>
        {canonicalSolutions.length === 0 ? (
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
            {language === 'es' ? 'No existe ningún subconjunto que sume exactamente la meta.' : 'No subset sums to the target.'}
          </span>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {canonicalSolutions.map((sol, idx) => (
              <span
                key={`sol-can-${idx}`}
                style={{
                  padding: '3px 8px',
                  backgroundColor: 'var(--surface)',
                  borderRadius: '4px',
                  border: '1px solid var(--border)',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                #{idx + 1}: [{sol.join(', ')}]
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
