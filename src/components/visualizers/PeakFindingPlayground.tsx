import React, { useState, useMemo, useEffect, useRef } from 'react';
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
    name: { es: 'Montaña Central (Pico Único)', en: 'Single Central Mountain' },
    array: [1, 3, 7, 12, 18, 14, 9, 2]
  },
  {
    name: { es: 'Cordillera (Múltiples Picos)', en: 'Mountain Range (Multiple Peaks)' },
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

interface DcStepState {
  left: number;
  right: number;
  mid: number;
  stepCount: number;
  foundPeak: number | null;
  explanation: { es: string; en: string };
}

export const PeakFindingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [arrayStr, setArrayStr] = useState<string>('4, 10, 5, 8, 15, 3, 11, 2');
  const [userSelectedIndex, setUserSelectedIndex] = useState<number | null>(null);
  const [discoveredPeaks, setDiscoveredPeaks] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Divide and Conquer Step Simulation State
  const [dcState, setDcState] = useState<DcStepState | null>(null);

  // Dragging state for interactive bar heights
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const dragStartYRef = useRef<number>(0);
  const dragStartValRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);

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

  const maxVal = useMemo(() => Math.max(...array, 30), [array]);

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
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }
    if (draggingIdx !== null) return;
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
    setDcState(null);
    setError(null);
  };

  const handleRandom = () => {
    const size = Math.floor(Math.random() * 5) + 7; // 7 to 11 elements
    const randoms: number[] = [];
    for (let i = 0; i < size; i++) {
      randoms.push(Math.floor(Math.random() * 35) + 3);
    }
    setArrayStr(randoms.join(', '));
    setUserSelectedIndex(null);
    setDiscoveredPeaks(new Set());
    setDcState(null);
    setError(null);
  };

  // Dragging handler to adjust bar height interactively
  const handlePointerDown = (idx: number, e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    hasDraggedRef.current = false;
    setDraggingIdx(idx);
    dragStartYRef.current = e.clientY;
    dragStartValRef.current = array[idx];
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingIdx === null) return;
    const dy = dragStartYRef.current - e.clientY;
    if (Math.abs(dy) > 5) {
      hasDraggedRef.current = true;
    }
    // Every 4px of movement changes height by 1 unit
    const delta = Math.round(dy / 4);
    const newVal = Math.max(1, Math.min(50, dragStartValRef.current + delta));

    if (newVal !== array[draggingIdx]) {
      const nextArray = [...array];
      nextArray[draggingIdx] = newVal;
      setArrayStr(nextArray.join(', '));
      setDcState(null);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingIdx !== null) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture release safety
      }
      setDraggingIdx(null);
    }
  };

  // Divide and conquer step simulation
  const handleStartDcSimulation = () => {
    if (array.length === 0) return;
    const left = 0;
    const right = array.length - 1;
    const mid = Math.floor((left + right) / 2);

    const val = array[mid];
    const leftOk = mid === 0 || val >= array[mid - 1];
    const rightOk = mid === right || val >= array[mid + 1];

    if (leftOk && rightOk) {
      setDcState({
        left,
        right,
        mid,
        stepCount: 1,
        foundPeak: mid,
        explanation: {
          es: `Paso 1: M = [${mid}] (valor ${val}) es mayor o igual a sus vecinos inmediatos. ¡Cima encontrada directamente!`,
          en: `Step 1: M = [${mid}] (value ${val}) is >= immediate neighbors. Peak found directly!`
        }
      });
      return;
    }

    setDcState({
      left,
      right,
      mid,
      stepCount: 1,
      foundPeak: null,
      explanation: {
        es: `Paso 1: Inspeccionando punto medio M = [${mid}] (valor ${val}). Comparando con vecinos [${mid - 1}] y [${mid + 1}].`,
        en: `Step 1: Inspecting midpoint M = [${mid}] (value ${val}). Comparing with neighbors [${mid - 1}] and [${mid + 1}].`
      }
    });
  };

  const handleNextDcStep = () => {
    if (!dcState || dcState.foundPeak !== null) return;
    const { left, right, mid, stepCount } = dcState;
    const val = array[mid];

    let nextLeft = left;
    let nextRight = right;
    let reasonEs = '';
    let reasonEn = '';

    if (mid > 0 && array[mid - 1] > val) {
      nextRight = mid - 1;
      reasonEs = `Como A[${mid - 1}] = ${array[mid - 1]} > A[${mid}] = ${val}, el gradiente ascendente garantiza un pico a la izquierda [${nextLeft}..${nextRight}].`;
      reasonEn = `Since A[${mid - 1}] = ${array[mid - 1]} > A[${mid}] = ${val}, gradient invariant guarantees a peak in left half [${nextLeft}..${nextRight}].`;
    } else {
      nextLeft = mid + 1;
      reasonEs = `Como A[${mid + 1}] = ${array[mid + 1]} > A[${mid}] = ${val}, el gradiente ascendente garantiza un pico a la derecha [${nextLeft}..${nextRight}].`;
      reasonEn = `Since A[${mid + 1}] = ${array[mid + 1]} > A[${mid}] = ${val}, gradient invariant guarantees a peak in right half [${nextLeft}..${nextRight}].`;
    }

    const nextMid = Math.floor((nextLeft + nextRight) / 2);
    const nextVal = array[nextMid];
    const isPeak =
      (nextMid === 0 || nextVal >= array[nextMid - 1]) &&
      (nextMid === array.length - 1 || nextVal >= array[nextMid + 1]);

    setDcState({
      left: nextLeft,
      right: nextRight,
      mid: nextMid,
      stepCount: stepCount + 1,
      foundPeak: isPeak ? nextMid : null,
      explanation: {
        es: `Paso ${stepCount + 1}: ${reasonEs} ${isPeak ? `¡M = [${nextMid}] (${nextVal}) es una cumbre local!` : `Nuevo punto medio M = [${nextMid}] (${nextVal}).`}`,
        en: `Step ${stepCount + 1}: ${reasonEn} ${isPeak ? `M = [${nextMid}] (${nextVal}) is a local peak!` : `New midpoint M = [${nextMid}] (${nextVal}).`}`
      }
    });

    if (isPeak) {
      setDiscoveredPeaks((prev) => new Set([...prev, nextMid]));
    }
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
            ? 'Arrastra verticalmente cualquier columna para moldear el relieve. Haz clic para probar picos locales o activa el paso a paso de División y Conquista para ver cómo se descarta la mitad del arreglo en cada paso.'
            : 'Drag vertically on any column to reshape the terrain. Click to test local peaks or step through Divide and Conquer to see how half the array is pruned each step.'}
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
            🎲 {language === 'es' ? 'Generar Aleatorio' : 'Generate Random'}
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
            setDcState(null);
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
                ? 'Arrastra arriba/abajo para cambiar alturas, o toca para probar cima:'
                : 'Drag up/down to adjust heights, or click to test summit:'}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="peaks-count-tag">
                {language === 'es'
                  ? `Picos descubiertos: ${discoveredPeaks.size} / ${allPeaks.length}`
                  : `Discovered peaks: ${discoveredPeaks.size} / ${allPeaks.length}`}
              </span>
              <button
                type="button"
                className="chip-button"
                onClick={dcState ? handleNextDcStep : handleStartDcSimulation}
                disabled={dcState !== null && dcState.foundPeak !== null}
                style={{
                  backgroundColor: dcState ? '#3b82f6' : 'var(--accent)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 600
                }}
              >
                {dcState === null
                  ? (language === 'es' ? '▶ Paso a Paso DyC' : '▶ Step DyC')
                  : dcState.foundPeak !== null
                  ? (language === 'es' ? '✓ Pico Hallado' : '✓ Peak Found')
                  : (language === 'es' ? `Siguiente Paso (${dcState.stepCount + 1}) ⏭` : `Next Step (${dcState.stepCount + 1}) ⏭`)}
              </button>
              {dcState && (
                <button
                  type="button"
                  className="chip-button"
                  onClick={() => setDcState(null)}
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
                >
                  ✕ {language === 'es' ? 'Reiniciar DyC' : 'Reset DyC'}
                </button>
              )}
            </div>
          </div>

          {/* D&C Step Banner */}
          {dcState && (
            <div
              style={{
                padding: '0.5rem 0.8rem',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                borderLeft: '4px solid #3b82f6',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.85rem',
                color: 'var(--text)'
              }}
            >
              {dcState.explanation[language]}
            </div>
          )}

          {/* Bar Strip */}
          <div
            className="interactive-bars-strip"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {array.map((val, idx) => {
              const isSelected = userSelectedIndex === idx;
              const isFoundPeak = discoveredPeaks.has(idx);
              const isDcMid = dcState && dcState.mid === idx;
              const isDcActiveRange = dcState ? idx >= dcState.left && idx <= dcState.right : true;

              const heightPct = Math.max(15, Math.round((val / maxVal) * 100));

              let colClass = 'clickable-bar-col';
              if (isSelected) colClass += ' selected';
              if (isFoundPeak) colClass += ' is-peak';

              return (
                <div
                  key={idx}
                  className={colClass}
                  style={{
                    opacity: isDcActiveRange ? 1 : 0.35,
                    position: 'relative'
                  }}
                  tabIndex={0}
                  role="slider"
                  aria-label={
                    language === 'es'
                      ? `Columna ${idx}, altura ${val}${isFoundPeak ? ' (pico descubierto)' : ''}`
                      : `Column ${idx}, height ${val}${isFoundPeak ? ' (discovered peak)' : ''}`
                  }
                  aria-valuenow={val}
                  aria-valuemin={1}
                  aria-valuemax={100}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBarClick(idx);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const next = [...array];
                      next[idx] = Math.min(100, next[idx] + 1);
                      setArrayStr(next.join(', '));
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = [...array];
                      next[idx] = Math.max(1, next[idx] - 1);
                      setArrayStr(next.join(', '));
                    }
                  }}
                  onClick={() => handleBarClick(idx)}
                >
                  {/* Midpoint Indicator */}
                  {isDcMid && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-24px',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#3b82f6',
                        background: 'var(--surface)',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        border: '1px solid #3b82f6'
                      }}
                    >
                      M [{idx}]
                    </div>
                  )}

                  {isFoundPeak && <span className="peak-indicator-badge">▲</span>}

                  <div className="clickable-bar-val">{val}</div>

                  {/* Drag Handle Bar */}
                  <div
                    className="clickable-bar-fill"
                    style={{
                      height: `${heightPct}%`,
                      borderTop: isDcMid ? '3px solid #3b82f6' : undefined,
                      cursor: 'ns-resize'
                    }}
                    onPointerDown={(e) => handlePointerDown(idx, e)}
                    title={language === 'es' ? 'Arrastra verticalmente para ajustar la altura' : 'Drag vertically to adjust height'}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        borderRadius: '2px 2px 0 0'
                      }}
                    />
                  </div>

                  <div className="clickable-bar-idx">[{idx}]</div>
                </div>
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
                    {userValidation?.errors[0]}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="card-prompt">
              <em>
                {language === 'es'
                  ? 'Haz clic en una columna para inspeccionar.'
                  : 'Click on a column above to inspect.'}
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
            ? 'A diferencia de la búsqueda binaria clásica que requiere un arreglo ordenado, la búsqueda de pico busca una cresta local. Al comparar el punto medio con sus vecinos, si uno de ellos es más alto, el invariante de gradiente garantiza matemáticamente que en esa mitad existe al menos un pico. Esta reducción geométrica a la mitad en cada paso otorga una cota asintótica de O(log n): para un arreglo de n = 1.000.000 elementos, el algoritmo localiza un pico en a lo sumo 20 comparaciones.'
            : 'Unlike classic binary search which requires sorted elements, peak finding seeks a local crest. The gradient invariant guarantees at least one peak lies in the uphill half. This geometric halving yields an O(log n) bound: for an array of n = 1,000,000 elements, it locates a peak in at most 20 comparisons.'}
        </p>
      </div>
    </div>
  );
};
