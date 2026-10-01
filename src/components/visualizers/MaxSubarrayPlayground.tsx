import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { computeOptimalMaxSubarray } from '../../engine/algorithms/maxSubarrayValidator';
import './MaxSubarrayPlayground.css';

interface Preset {
  name: { es: string; en: string };
  array: number[];
}

const PRESETS: Preset[] = [
  {
    name: { es: 'Ejemplo Cátedra 1 (Positivos y negativo al final)', en: 'Course Example 1 (Positive mix)' },
    array: [5, 3, 2, 4, -1]
  },
  {
    name: { es: 'Ejemplo Cátedra 2 (Negativo divide la suma)', en: 'Course Example 2 (Negative splits sum)' },
    array: [5, 3, -5, 4, -1]
  },
  {
    name: { es: 'Ejemplo Cátedra 3 (Cruzado supera a izquierda y derecha)', en: 'Course Example 3 (Crossing wins)' },
    array: [5, -4, 2, 4, -1]
  },
  {
    name: { es: 'Todos Negativos (Debe elegir el mayor)', en: 'All Negatives (Single best)' },
    array: [-5, -2, -8]
  },
  {
    name: { es: 'Clásico Bentley / LeetCode (Kadane vs DyC)', en: 'Classic Bentley / LeetCode' },
    array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
  }
];

export const MaxSubarrayPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [arrayStr, setArrayStr] = useState<string>('5, -4, 2, 4, -1');
  const [userStart, setUserStart] = useState<number | null>(null);
  const [userEnd, setUserEnd] = useState<number | null>(null);
  const [showDcPartition, setShowDcPartition] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const parsedArray = useMemo(() => {
    try {
      const parts = arrayStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) return [];
      return parts.map((s) => {
        const n = Number(s);
        if (isNaN(n) || !Number.isFinite(n)) throw new Error(`"${s}" no es un número válido`);
        return n;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el arreglo');
      return [];
    }
  }, [arrayStr]);

  const optimal = useMemo(() => {
    if (parsedArray.length === 0) return null;
    return computeOptimalMaxSubarray(parsedArray);
  }, [parsedArray]);

  // Compute Divide and Conquer 3-way partition:
  // 1. Left [0..mid], 2. Right [mid+1..n-1], 3. Crossing mid
  const dcPartition = useMemo(() => {
    const n = parsedArray.length;
    if (n < 2) return null;
    const mid = Math.floor((n - 1) / 2);

    // Left half
    const leftSlice = parsedArray.slice(0, mid + 1);
    const leftOpt = computeOptimalMaxSubarray(leftSlice);

    // Right half
    const rightSlice = parsedArray.slice(mid + 1);
    const rightOpt = computeOptimalMaxSubarray(rightSlice);
    const rightAdjusted = {
      ...rightOpt,
      startIndex: rightOpt.startIndex + mid + 1,
      endIndex: rightOpt.endIndex + mid + 1
    };

    // Crossing midpoint
    let maxLeftCrossingSum = -Infinity;
    let bestLeftCrossingIdx = mid;
    let currLeftSum = 0;
    for (let i = mid; i >= 0; i--) {
      currLeftSum += parsedArray[i];
      if (currLeftSum > maxLeftCrossingSum) {
        maxLeftCrossingSum = currLeftSum;
        bestLeftCrossingIdx = i;
      }
    }

    let maxRightCrossingSum = -Infinity;
    let bestRightCrossingIdx = mid + 1;
    let currRightSum = 0;
    for (let j = mid + 1; j < n; j++) {
      currRightSum += parsedArray[j];
      if (currRightSum > maxRightCrossingSum) {
        maxRightCrossingSum = currRightSum;
        bestRightCrossingIdx = j;
      }
    }

    const crossingSum = maxLeftCrossingSum + maxRightCrossingSum;
    const crossingOpt = {
      maxSum: crossingSum,
      startIndex: bestLeftCrossingIdx,
      endIndex: bestRightCrossingIdx
    };

    const overallBest = Math.max(leftOpt.maxSum, crossingOpt.maxSum, rightAdjusted.maxSum);

    return {
      mid,
      leftOpt,
      rightOpt: rightAdjusted,
      crossingOpt,
      overallBest
    };
  }, [parsedArray]);

  const userSum = useMemo(() => {
    if (userStart === null || userEnd === null || parsedArray.length === 0) return null;
    let s = 0;
    for (let i = userStart; i <= userEnd; i++) {
      s += parsedArray[i];
    }
    return s;
  }, [userStart, userEnd, parsedArray]);

  const isOptimal = optimal !== null && userSum !== null && userSum === optimal.maxSum;

  useEffect(() => {
    if (isOptimal) {
      markAttempted('max-subarray-dyc');
    }
  }, [isOptimal, markAttempted]);

  const handleItemClick = (idx: number) => {
    if (userStart === null) {
      setUserStart(idx);
      setUserEnd(idx);
    } else if (userEnd === userStart) {
      const start = Math.min(userStart, idx);
      const end = Math.max(userStart, idx);
      setUserStart(start);
      setUserEnd(end);
    } else {
      setUserStart(idx);
      setUserEnd(idx);
    }
  };

  const handleClearSelection = () => {
    setUserStart(null);
    setUserEnd(null);
  };

  const handlePresetSelect = (preset: Preset) => {
    setArrayStr(preset.array.join(', '));
    setUserStart(null);
    setUserEnd(null);
    setError(null);
  };

  const handleSelectRange = (start: number, end: number) => {
    setUserStart(start);
    setUserEnd(end);
  };

  return (
    <div className="max-subarray-playground">
      <div className="playground-intro">
        <h3>
          {language === 'es'
            ? 'Laboratorio Interactivo: Subarreglo de Máxima Suma (División y Conquista)'
            : 'Interactive Playground: Maximum Subarray (Divide and Conquer)'}
        </h3>
        <p>
          {language === 'es'
            ? 'Haz clic en los elementos para definir un subarreglo contiguo [inicio..fin] o examina la tripartición DyC para comprender cómo se combinan las mitades en tiempo O(n log n).'
            : 'Click elements to select a contiguous subarray [start..end] or inspect the D&C tripartition to understand how halves combine in O(n log n).'}
        </p>
      </div>

      {/* Preset Buttons */}
      <div className="presets-section">
        <label className="section-label">
          {language === 'es' ? 'Casos de prueba de la guía:' : 'Course guide test cases:'}
        </label>
        <div className="preset-chips">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="chip-btn"
              onClick={() => handlePresetSelect(p)}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Array Input */}
      <div className="input-group">
        <label htmlFor="array-input">
          {language === 'es'
            ? 'Arreglo de entrada (separado por comas):'
            : 'Input array (comma-separated):'}
        </label>
        <input
          id="array-input"
          type="text"
          value={arrayStr}
          onChange={(e) => {
            setArrayStr(e.target.value);
            setUserStart(null);
            setUserEnd(null);
            setError(null);
          }}
          placeholder="Ej: 5, -4, 2, 4, -1"
          className="array-text-input"
        />
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Visual Array Presentation */}
      {parsedArray.length > 0 && (
        <div className="array-visualization-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span className="box-title">
              {language === 'es'
                ? 'Toca dos índices para marcar el rango contiguo [i..j]:'
                : 'Click two items to select range [i..j]:'}
            </span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className="chip-btn"
                onClick={() => setShowDcPartition(!showDcPartition)}
                style={{
                  backgroundColor: showDcPartition ? 'var(--accent)' : 'var(--bg)',
                  color: showDcPartition ? '#fff' : 'var(--text)',
                  borderColor: 'var(--accent)'
                }}
              >
                {showDcPartition
                  ? (language === 'es' ? 'Ocultar Tripartición DyC' : 'Hide D&C Tripartition')
                  : (language === 'es' ? 'Ver Tripartición DyC' : 'Show D&C Tripartition')}
              </button>
              <button
                type="button"
                className="chip-btn"
                onClick={handleClearSelection}
                disabled={userStart === null}
              >
                {language === 'es' ? 'Limpiar Selección' : 'Clear Selection'}
              </button>
            </div>
          </div>

          {/* D&C Tripartition Cards Banner */}
          {showDcPartition && dcPartition && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--surface)',
                borderRadius: '6px',
                border: '1px solid var(--border)'
              }}
            >
              {/* Left Subproblem */}
              <div
                style={{
                  padding: '0.6rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  border: dcPartition.leftOpt.maxSum === dcPartition.overallBest ? '2px solid var(--success)' : '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectRange(dcPartition.leftOpt.startIndex, dcPartition.leftOpt.endIndex)}
                title={language === 'es' ? 'Haz clic para seleccionar este rango' : 'Click to select this range'}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {language === 'es' ? '1. Mejor a la Izquierda [0..m]' : '1. Best Left [0..m]'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                  Suma = {dcPartition.leftOpt.maxSum}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                  [{dcPartition.leftOpt.startIndex}..{dcPartition.leftOpt.endIndex}]
                </div>
              </div>

              {/* Crossing Subproblem */}
              <div
                style={{
                  padding: '0.6rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  border: dcPartition.crossingOpt.maxSum === dcPartition.overallBest ? '2px solid var(--success)' : '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectRange(dcPartition.crossingOpt.startIndex, dcPartition.crossingOpt.endIndex)}
                title={language === 'es' ? 'Haz clic para seleccionar este rango' : 'Click to select this range'}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {language === 'es' ? '2. Mejor Cruzado por Centro' : '2. Best Crossing Mid'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--warning)' }}>
                  Suma = {dcPartition.crossingOpt.maxSum}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                  [{dcPartition.crossingOpt.startIndex}..{dcPartition.crossingOpt.endIndex}]
                </div>
              </div>

              {/* Right Subproblem */}
              <div
                style={{
                  padding: '0.6rem',
                  borderRadius: '4px',
                  backgroundColor: 'var(--bg)',
                  border: dcPartition.rightOpt.maxSum === dcPartition.overallBest ? '2px solid var(--success)' : '1px solid var(--border)',
                  cursor: 'pointer'
                }}
                onClick={() => handleSelectRange(dcPartition.rightOpt.startIndex, dcPartition.rightOpt.endIndex)}
                title={language === 'es' ? 'Haz clic para seleccionar este rango' : 'Click to select this range'}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {language === 'es' ? '3. Mejor a la Derecha [m+1..n-1]' : '3. Best Right [m+1..n-1]'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)' }}>
                  Suma = {dcPartition.rightOpt.maxSum}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>
                  [{dcPartition.rightOpt.startIndex}..{dcPartition.rightOpt.endIndex}]
                </div>
              </div>
            </div>
          )}

          {/* Cards Strip */}
          <div className="items-row">
            {parsedArray.map((val, idx) => {
              const isUserSelected =
                userStart !== null &&
                userEnd !== null &&
                idx >= userStart &&
                idx <= userEnd;

              const isMid = dcPartition && dcPartition.mid === idx;

              return (
                <div
                  key={idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleItemClick(idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(idx);
                    }
                  }}
                  className={`item-card ${isUserSelected ? 'selected' : 'unselected'}`}
                  style={{
                    cursor: 'pointer',
                    position: 'relative',
                    borderRight: isMid && showDcPartition ? '3px dashed var(--warning)' : undefined
                  }}
                >
                  <span className="item-idx">i={idx}</span>
                  <span className={`item-val ${val >= 0 ? 'pos' : 'neg'}`}>
                    {val}
                  </span>
                  {isUserSelected && (
                    <span className="opt-tag">
                      {idx === userStart && idx === userEnd
                        ? '[i, j]'
                        : idx === userStart
                        ? '[inicio]'
                        : idx === userEnd
                        ? '[fin]'
                        : '•'}
                    </span>
                  )}
                  {isMid && showDcPartition && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-16px',
                        fontSize: '9px',
                        color: 'var(--warning)',
                        fontWeight: 800
                      }}
                    >
                      m
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* User selection score banner */}
          <div className="optimal-summary-card">
            <div className="summary-stat">
              <span className="stat-label">
                {language === 'es' ? 'Tu Selección:' : 'Your Selection:'}
              </span>
              <span className="stat-value">
                {userStart !== null && userEnd !== null
                  ? `[${userStart}..${userEnd}] → Suma: ${userSum}`
                  : language === 'es'
                  ? 'Toca elementos para armar un rango'
                  : 'Click elements to select a range'}
              </span>
            </div>

            <div className="summary-stat">
              <span className="stat-label">
                {language === 'es' ? 'Estado del intento:' : 'Attempt status:'}
              </span>
              <span className="stat-value">
                {isOptimal ? (
                  <span style={{ color: 'var(--success)', fontWeight: 800 }}>
                    {language === 'es' ? '¡Subarreglo de suma máxima verificado!' : 'Maximum sum subarray verified!'}
                  </span>
                ) : userSum !== null ? (
                  <span style={{ color: 'var(--warning)' }}>
                    {language === 'es'
                      ? `Suma actual ${userSum}. ¿Puedes superarla?`
                      : `Current sum ${userSum}. Can you beat it?`}
                  </span>
                ) : (
                  '—'
                )}
              </span>
            </div>

            {optimal && (
              <div className="summary-stat">
                <span className="stat-label">
                  {language === 'es' ? 'Cota Máxima Óptima:' : 'Optimal Maximum:'}
                </span>
                <span className="stat-value highlight">
                  {isOptimal ? (
                    `${optimal.maxSum} (Rango [${optimal.startIndex}..${optimal.endIndex}])`
                  ) : (
                    <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                      {language === 'es' ? 'No revelado (alcance el óptimo mediante experimentación)' : 'Hidden (reach optimum via experimentation)'}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* D&C Strategy Explanation Box */}
      <div className="educational-callout">
        <h4>
          {language === 'es'
            ? 'Fundamento de División y Conquista en este problema'
            : 'Divide & Conquer Rationale for this problem'}
        </h4>
        <p>
          {language === 'es'
            ? 'Al dividir el arreglo en dos mitades en el índice central m = ⌊n/2⌋, el subarreglo óptimo tiene sólo 3 posibilidades: está totalmente a la izquierda, totalmente a la derecha, o cruza por el centro. Al calcular el caso cruzado en tiempo lineal O(n), la recurrencia T(n) = 2T(n/2) + O(n) resuelve el problema en O(n log n), superando la fuerza bruta O(n²).'
            : 'By splitting the array in half at m = ⌊n/2⌋, the optimal subarray has only 3 possibilities: entirely on the left, entirely on the right, or crossing the center. Calculating the crossing case in linear O(n) time yields the recurrence T(n) = 2T(n/2) + O(n), giving O(n log n), easily beating brute force O(n²).'}
        </p>
      </div>
    </div>
  );
};
