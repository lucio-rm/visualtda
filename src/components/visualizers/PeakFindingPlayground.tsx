import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { solvePeakFinding, peakFindingValidator } from '../../engine/algorithms/peakFindingValidator';
import './PeakFindingPlayground.css';

interface Preset {
  name: { es: string; en: string };
  array: number[];
}

const PRESETS: Preset[] = [
  {
    name: { es: '🏔️ Montaña Central (Pico Único)', en: '🏔️ Single Central Mountain' },
    array: [1, 3, 7, 12, 18, 14, 9, 2]
  },
  {
    name: { es: '⚡ Cordillera (Múltiples Picos)', en: '⚡ Mountain Range (Multiple Peaks)' },
    array: [4, 10, 5, 8, 15, 3, 11, 2]
  },
  {
    name: { es: 'Creciente (Pico en Extremo Derecho)', en: 'Increasing (Peak at Right Edge)' },
    array: [2, 5, 9, 14, 21, 30]
  },
  {
    name: { es: 'Decreciente (Pico en Extremo Izquierdo)', en: 'Decreasing (Peak at Left Edge)' },
    array: [35, 28, 19, 11, 6, 2]
  },
  {
    name: { es: 'Meseta (Valores Duplicados)', en: 'Plateau (Equal Elements)' },
    array: [4, 9, 9, 9, 3]
  }
];

export const PeakFindingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [arrayStr, setArrayStr] = useState<string>('4, 10, 5, 8, 15, 3, 11, 2');
  const [userSelectedIndex, setUserSelectedIndex] = useState<number | null>(null);
  const [discoveredPeaks, setDiscoveredPeaks] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const array = useMemo(() => {
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
      setError(err instanceof Error ? err.message : 'Error al procesar arreglo');
      return [];
    }
  }, [arrayStr]);

  const maxVal = useMemo(() => Math.max(...array, 1), [array]);

  // Find all peaks in the array
  const allPeaks = useMemo(() => {
    const peaks: number[] = [];
    for (let i = 0; i < array.length; i++) {
      const val = array[i];
      const leftOk = i === 0 || val >= array[i - 1];
      const rightOk = i === array.length - 1 || val >= array[i + 1];
      if (leftOk && rightOk) {
        peaks.push(i);
      }
    }
    return peaks;
  }, [array]);

  const dycPeakIndex = useMemo(() => {
    if (array.length === 0) return -1;
    return solvePeakFinding(array);
  }, [array]);

  // User attempt validation
  const userValidation = useMemo(() => {
    if (userSelectedIndex === null || array.length === 0) return null;
    return peakFindingValidator.validate({ array }, userSelectedIndex);
  }, [userSelectedIndex, array]);

  const handleBarClick = (idx: number) => {
    setUserSelectedIndex(idx);
    if (allPeaks.includes(idx)) {
      setDiscoveredPeaks((prev) => {
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    }
  };

  useEffect(() => {
    if (userValidation?.valid) {
      markAttempted('peak-finding-dyc');
    }
  }, [userValidation, markAttempted]);

  const handlePreset = (preset: Preset) => {
    setArrayStr(preset.array.join(', '));
    setUserSelectedIndex(null);
    setDiscoveredPeaks(new Set());
    setError(null);
  };

  const handleRandom = () => {
    const size = Math.floor(Math.random() * 6) + 6; // 6 to 11 elements
    const randoms: number[] = [];
    for (let i = 0; i < size; i++) {
      randoms.push(Math.floor(Math.random() * 40) + 1);
    }
    setArrayStr(randoms.join(', '));
    setUserSelectedIndex(null);
    setDiscoveredPeaks(new Set());
    setError(null);
  };

  return (
    <div className="peak-finding-playground">
      <div className="playground-header">
        <h3>
          {language === 'es'
            ? 'Laboratorio: Explorador de Picos y Cumbres'
            : 'Playground: Peak Explorer & Summit Finder'}
        </h3>
        <p>
          {language === 'es'
            ? 'Haz clic en cualquier barra del perfil de elevación para verificar si es un pico local. Compara tu intuición con la búsqueda binaria en O(log n).'
            : 'Click on any bar in the elevation profile to check if it is a local peak. Compare your intuition against binary search in O(log n).'}
        </p>
      </div>

      {/* Presets */}
      <div className="presets-row">
        <span className="presets-label">
          {language === 'es' ? 'Perfiles de Terreno:' : 'Terrain Profiles:'}
        </span>
        <div className="preset-buttons">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="chip-button"
              onClick={() => handlePreset(p)}
            >
              {p.name[language]}
            </button>
          ))}
          <button className="chip-button random-btn" onClick={handleRandom}>
            {language === 'es' ? 'Generar Aleatorio' : 'Generate Random'}
          </button>
        </div>
      </div>

      {/* Custom Input */}
      <div className="input-block">
        <label htmlFor="peak-input">
          {language === 'es' ? 'Arreglo de alturas (separadas por coma):' : 'Heights array (comma separated):'}
        </label>
        <input
          id="peak-input"
          type="text"
          value={arrayStr}
          onChange={(e) => {
            setArrayStr(e.target.value);
            setUserSelectedIndex(null);
            setDiscoveredPeaks(new Set());
            setError(null);
          }}
          className="array-input"
        />
        {error && <div className="error-text">{error}</div>}
      </div>

      {/* Interactive Mountain Profile */}
      {array.length > 0 && (
        <div className="interactive-mountain-box">
          <div className="mountain-interactive-header">
            <span>
              {language === 'es'
                ? 'Haz clic en una columna para inspeccionar si es cima:'
                : 'Click a column to test if it is a summit:'}
            </span>
            <span className="peaks-count-tag">
              {language === 'es'
                ? `Picos descubiertos: ${discoveredPeaks.size} / ${allPeaks.length}`
                : `Discovered peaks: ${discoveredPeaks.size} / ${allPeaks.length}`}
            </span>
          </div>

          <div className="interactive-bars-strip">
            {array.map((val, idx) => {
              const isSelected = userSelectedIndex === idx;
              const isFoundPeak = discoveredPeaks.has(idx);

              const heightPct = Math.max(15, Math.round((val / maxVal) * 100));

              let colClass = 'clickable-bar-col';
              if (isSelected) colClass += ' selected';
              if (isFoundPeak) colClass += ' is-peak';

              return (
                <button
                  key={idx}
                  type="button"
                  className={colClass}
                  onClick={() => handleBarClick(idx)}
                >
                  {isFoundPeak && <span className="peak-indicator-badge">▲</span>}
                  <div className="clickable-bar-val">{val}</div>
                  <div
                    className="clickable-bar-fill"
                    style={{ height: `${heightPct}%` }}
                  ></div>
                  <div className="clickable-bar-idx">[{idx}]</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback & Comparisons */}
      <div className="comparison-cards-grid">
        {/* User Selection Card */}
        <div className="result-card user-card">
          <div className="card-tag">
            {language === 'es' ? 'Tu Selección' : 'Your Selection'}
          </div>
          {userSelectedIndex !== null ? (
            <>
              <div className="card-stat">
                {language === 'es'
                  ? `Índice [${userSelectedIndex}] (Altura: ${array[userSelectedIndex]})`
                  : `Index [${userSelectedIndex}] (Height: ${array[userSelectedIndex]})`}
              </div>
              <div className="card-status-message">
                {userValidation?.valid ? (
                  <span className="status-success">
                    {language === 'es' ? 'Pico local válido verificado.' : 'Valid local peak verified.'}
                  </span>
                ) : (
                  <span className="status-fail">
                    ❌ {userValidation?.errors[0]}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="card-prompt">
              <em>
                {language === 'es'
                  ? 'Haz clic en una barra para probar.'
                  : 'Click on a bar above to inspect.'}
              </em>
            </div>
          )}
        </div>

        {/* Divide and Conquer Benchmark */}
        <div className="result-card dyc-card">
          <div className="card-tag">
            {language === 'es' ? 'Solución por División y Conquista' : 'Divide & Conquer Solution'}
          </div>
          <div className="card-stat">
            {dycPeakIndex >= 0 ? (
              <>
                {language === 'es'
                  ? `Pico en [${dycPeakIndex}] (Altura: ${array[dycPeakIndex]})`
                  : `Peak at [${dycPeakIndex}] (Height: ${array[dycPeakIndex]})`}
              </>
            ) : (
              '—'
            )}
          </div>
          <div className="complexity-metric">
            <span className="metric-pill">
              {language === 'es' ? 'Pasos máximos DyC:' : 'Max D&C steps:'}{' '}
              <strong>⌈log₂(n)⌉ = {Math.ceil(Math.log2(Math.max(1, array.length)))}</strong>
            </span>
            <span className="metric-pill pill-subtle">
              {language === 'es' ? 'Búsqueda lineal:' : 'Linear search:'}{' '}
              n = {array.length}
            </span>
          </div>
        </div>
      </div>

      {/* Pedagogical Takeaway */}
      <div className="pedagogy-tip">
        <h4>
          {language === 'es'
            ? 'Fundamento: Búsqueda Binaria en Arreglos No Ordenados'
            : 'Rationale: Binary Search on Unsorted Arrays'}
        </h4>
        <p>
          {language === 'es'
            ? 'A diferencia de la búsqueda binaria clásica que requiere un arreglo ordenado, la búsqueda de pico no busca un valor específico, sino una cresta local. Al comparar el punto medio con sus vecinos, si uno de ellos es más alto, el invariante de gradiente garantiza matemáticamente que en esa mitad existe al menos un pico. Esta reducción geométrica a la mitad en cada paso otorga una cota asintótica de O(log n): para un arreglo de n = 1.000.000 elementos, el algoritmo localiza un pico en a lo sumo 20 comparaciones.'
            : 'Unlike classic binary search which requires sorted elements, peak finding seeks a local crest. The gradient invariant guarantees at least one peak lies in the uphill half. This geometric halving yields an O(log n) bound: for an array of n = 1,000,000 elements, it locates a peak in at most 20 comparisons.'}
        </p>
      </div>
    </div>
  );
};
