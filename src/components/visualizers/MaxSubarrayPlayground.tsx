import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
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
    name: { es: 'Clásico LeetCode / Bentley', en: 'Classic LeetCode / Bentley' },
    array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
  }
];

export const MaxSubarrayPlayground: React.FC = () => {
  const { language } = useLanguage();
  const [arrayStr, setArrayStr] = useState<string>('5, -4, 2, 4, -1');
  const [error, setError] = useState<string | null>(null);

  const parsedArray = useMemo(() => {
    try {
      const parts = arrayStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) {
        return [];
      }
      const nums = parts.map((s) => {
        const n = Number(s);
        if (isNaN(n)) throw new Error(`"${s}" no es un número válido`);
        return n;
      });
      return nums;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar el arreglo');
      return [];
    }
  }, [arrayStr]);

  const optimal = useMemo(() => {
    if (parsedArray.length === 0) return null;
    return computeOptimalMaxSubarray(parsedArray);
  }, [parsedArray]);

  const handlePresetSelect = (preset: Preset) => {
    setArrayStr(preset.array.join(', '));
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setArrayStr(e.target.value);
    setError(null);
  };

  return (
    <div className="max-subarray-playground">
      <div className="playground-intro">
        <h3>
          {language === 'es'
            ? 'Laboratorio Interactivo: Subarreglo de Máxima Suma'
            : 'Interactive Playground: Maximum Subarray'}
        </h3>
        <p>
          {language === 'es'
            ? 'Experimenta con diferentes configuraciones numéricas. Observa cómo la presencia de negativos altera los límites óptimos y cómo el subarreglo cruzado en el punto medio captura la solución óptima global.'
            : 'Experiment with different arrays. Notice how negative values shift optimal boundaries and how the crossing subarray at the midpoint captures the global optimum.'}
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
          onChange={handleInputChange}
          placeholder="Ej: 5, -4, 2, 4, -1"
          className="array-text-input"
        />
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Visual Array Presentation */}
      {parsedArray.length > 0 && (
        <div className="array-visualization-box">
          <div className="box-title">
            {language === 'es' ? 'Elementos y Subarreglo Óptimo' : 'Elements & Optimal Subarray'}
          </div>

          <div className="items-row">
            {parsedArray.map((val, idx) => {
              const isSelected =
                optimal &&
                idx >= optimal.startIndex &&
                idx <= optimal.endIndex;
              return (
                <div
                  key={idx}
                  className={`item-card ${isSelected ? 'selected' : 'unselected'}`}
                >
                  <span className="item-idx">i={idx}</span>
                  <span className={`item-val ${val >= 0 ? 'pos' : 'neg'}`}>
                    {val}
                  </span>
                  {isSelected && (
                    <span className="opt-tag">
                      {language === 'es' ? 'ÓPTIMO' : 'OPTIMAL'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {optimal && (
            <div className="optimal-summary-card">
              <div className="summary-stat">
                <span className="stat-label">
                  {language === 'es' ? 'Suma Máxima:' : 'Maximum Sum:'}
                </span>
                <span className="stat-value highlight">{optimal.maxSum}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">
                  {language === 'es' ? 'Subarreglo contiguo:' : 'Contiguous subarray:'}
                </span>
                <span className="stat-value">
                  [{optimal.subarray.join(', ')}]
                </span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">
                  {language === 'es' ? 'Rango de índices:' : 'Index range:'}
                </span>
                <span className="stat-value">
                  <code>[{optimal.startIndex}..{optimal.endIndex}]</code>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* D&C Strategy Explanation Box */}
      <div className="educational-callout">
        <h4>
          {language === 'es'
            ? '💡 ¿Por qué División y Conquista en este problema?'
            : '💡 Why Divide & Conquer for this problem?'}
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
