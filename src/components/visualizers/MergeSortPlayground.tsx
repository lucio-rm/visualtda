import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './MergeSortPlayground.css';

interface Preset {
  name: { es: string; en: string };
  array: number[];
}

const PRESETS: Preset[] = [
  {
    name: { es: 'Clásico Cátedra', en: 'Standard Lecture' },
    array: [38, 27, 43, 3, 9, 82, 10, 19]
  },
  {
    name: { es: 'Invertido (Peor Caso)', en: 'Reversed (Worst Case)' },
    array: [80, 70, 60, 50, 40, 30, 20, 10]
  },
  {
    name: { es: 'Preservación de Estabilidad (Valores Repetidos)', en: 'Stability Preservation (Duplicate Keys)' },
    array: [12, 25, 18, 12, 35, 18]
  },
  {
    name: { es: 'Ya Ordenado (Comportamiento Θ(n log n))', en: 'Already Sorted (Invariable Θ(n log n))' },
    array: [10, 20, 30, 40, 50, 60, 70, 80]
  },
  {
    name: { es: 'Casi Ordenado', en: 'Nearly Sorted' },
    array: [5, 10, 15, 20, 12, 25, 30]
  }
];

export const MergeSortPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activeTab, setActiveTab] = useState<'merge' | 'tree'>('merge');
  const [arrayStr, setArrayStr] = useState<string>('38, 27, 43, 3, 9, 82, 10, 19');
  const [error, setError] = useState<string | null>(null);

  // Simulation state for 2-pointer merge
  const [leftPointer, setLeftPointer] = useState<number>(0);
  const [rightPointer, setRightPointer] = useState<number>(0);
  const [mergedList, setMergedList] = useState<number[]>([]);
  const [comparisons, setComparisons] = useState<number>(0);
  const [feedback, setFeedback] = useState<{
    type: 'info' | 'warning' | 'success';
    message: { es: string; en: string };
  }>({
    type: 'info',
    message: {
      es: 'Compara los elementos activos señalados por los punteros i y j. Selecciona cuál debe colocarse primero.',
      en: 'Compare the active elements pointed by i and j. Select which one must be placed next.'
    }
  });

  const parsedArray = useMemo(() => {
    try {
      const parts = arrayStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) return [];
      const nums = parts.map((s) => {
        const n = Number(s);
        if (isNaN(n)) throw new Error(language === 'es' ? `"${s}" no es un número válido` : `"${s}" is not a valid number`);
        return n;
      });
      if (nums.length < 2) {
        throw new Error(language === 'es' ? 'Ingrese al menos 2 elementos' : 'Enter at least 2 elements');
      }
      if (nums.length > 16) {
        throw new Error(language === 'es' ? 'Máximo 16 elementos para el laboratorio' : 'Maximum 16 elements for playground');
      }
      setError(null);
      return nums;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al parsear arreglo');
      return [];
    }
  }, [arrayStr, language]);

  // Two sorted halves for the merge simulation
  const { leftHalf, rightHalf } = useMemo(() => {
    if (parsedArray.length === 0) return { leftHalf: [], rightHalf: [] };
    const mid = Math.floor(parsedArray.length / 2);
    const left = [...parsedArray.slice(0, mid)].sort((a, b) => a - b);
    const right = [...parsedArray.slice(mid)].sort((a, b) => a - b);
    return { leftHalf: left, rightHalf: right };
  }, [parsedArray]);

  const resetSimulation = useCallback(() => {
    setLeftPointer(0);
    setRightPointer(0);
    setMergedList([]);
    setComparisons(0);
    setFeedback({
      type: 'info',
      message: {
        es: 'Compara los elementos activos señalados por los punteros i y j. Selecciona cuál debe colocarse primero.',
        en: 'Compare the active elements pointed by i and j. Select which one must be placed next.'
      }
    });
  }, []);

  useEffect(() => {
    resetSimulation();
  }, [leftHalf, rightHalf, resetSimulation]);

  const handleTakeLeft = () => {
    if (leftPointer >= leftHalf.length) return;
    const lVal = leftHalf[leftPointer];
    markAttempted('merge-sort');

    if (rightPointer < rightHalf.length) {
      const rVal = rightHalf[rightPointer];
      setComparisons((c) => c + 1);

      if (lVal <= rVal) {
        setMergedList((prev) => [...prev, lVal]);
        setLeftPointer((p) => p + 1);
        if (lVal === rVal) {
          setFeedback({
            type: 'success',
            message: {
              es: `Correcto: L[${leftPointer}] (${lVal}) == R[${rightPointer}] (${rVal}). Tomar primero el elemento de la izquierda preserva la estabilidad de Merge Sort.`,
              en: `Correct: L[${leftPointer}] (${lVal}) == R[${rightPointer}] (${rVal}). Taking the left element first preserves Merge Sort stability.`
            }
          });
        } else {
          setFeedback({
            type: 'success',
            message: {
              es: `Correcto: L[${leftPointer}] (${lVal}) <= R[${rightPointer}] (${rVal}). Se avanza el puntero izquierdo sin retroceder.`,
              en: `Correct: L[${leftPointer}] (${lVal}) <= R[${rightPointer}] (${rVal}). Left pointer advances without backtracking.`
            }
          });
        }
      } else {
        setFeedback({
          type: 'warning',
          message: {
            es: `Violación de Invariante: L[${leftPointer}] (${lVal}) > R[${rightPointer}] (${rVal}). Si tomas el elemento mayor, el resultado no mantendrá orden no decreciente.`,
            en: `Invariant Violation: L[${leftPointer}] (${lVal}) > R[${rightPointer}] (${rVal}). Taking the greater element breaks non-decreasing ordering.`
          }
        });
      }
    } else {
      // Right is exhausted
      setMergedList((prev) => [...prev, lVal]);
      setLeftPointer((p) => p + 1);
      setFeedback({
        type: 'info',
        message: {
          es: `Subarreglo derecho agotado. Copiando L[${leftPointer}] (${lVal}) en tiempo constante directo.`,
          en: `Right subarray exhausted. Copying L[${leftPointer}] (${lVal}) in direct constant time.`
        }
      });
    }
  };

  const handleTakeRight = () => {
    if (rightPointer >= rightHalf.length) return;
    const rVal = rightHalf[rightPointer];
    markAttempted('merge-sort');

    if (leftPointer < leftHalf.length) {
      const lVal = leftHalf[leftPointer];
      setComparisons((c) => c + 1);

      if (rVal < lVal) {
        setMergedList((prev) => [...prev, rVal]);
        setRightPointer((p) => p + 1);
        setFeedback({
          type: 'success',
          message: {
            es: `Correcto: R[${rightPointer}] (${rVal}) < L[${leftPointer}] (${lVal}). Se añade al arreglo fusionado y avanza el puntero derecho.`,
            en: `Correct: R[${rightPointer}] (${rVal}) < L[${leftPointer}] (${lVal}). Appended to merged array and right pointer advances.`
          }
        });
      } else if (rVal === lVal) {
        setMergedList((prev) => [...prev, rVal]);
        setRightPointer((p) => p + 1);
        setFeedback({
          type: 'warning',
          message: {
            es: `Aviso Pedagógico: Valores iguales (${lVal}). Tomar el elemento derecho es válido numéricamente, pero viola la convención de estabilidad estándar (debe preferirse el izquierdo).`,
            en: `Pedagogical Notice: Equal values (${lVal}). Taking right element is numerically valid, but violates stability convention (left should be preferred).`
          }
        });
      } else {
        setFeedback({
          type: 'warning',
          message: {
            es: `Violación de Invariante: R[${rightPointer}] (${rVal}) > L[${leftPointer}] (${lVal}). Debe tomarse primero el menor elemento disponible.`,
            en: `Invariant Violation: R[${rightPointer}] (${rVal}) > L[${leftPointer}] (${lVal}). You must take the smallest available element first.`
          }
        });
      }
    } else {
      // Left is exhausted
      setMergedList((prev) => [...prev, rVal]);
      setRightPointer((p) => p + 1);
      setFeedback({
        type: 'info',
        message: {
          es: `Subarreglo izquierdo agotado. Copiando R[${rightPointer}] (${rVal}) directamente.`,
          en: `Left subarray exhausted. Copying R[${rightPointer}] (${rVal}) directly.`
        }
      });
    }
  };

  const isMergeComplete =
    leftHalf.length > 0 &&
    leftPointer === leftHalf.length &&
    rightPointer === rightHalf.length;

  // Helper to count two-pointer merge comparisons
  const countMergeComparisons = (left: number[], right: number[]): { merged: number[]; comparisons: number } => {
    let i = 0;
    let j = 0;
    let comps = 0;
    const merged: number[] = [];
    while (i < left.length && j < right.length) {
      comps++;
      if (left[i] <= right[j]) {
        merged.push(left[i++]);
      } else {
        merged.push(right[j++]);
      }
    }
    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);
    return { merged, comparisons: comps };
  };

  // Top-down split tree levels
  const splitLevels = useMemo(() => {
    if (parsedArray.length === 0) return [];
    const levels: { level: number; nodes: number[][]; totalWork: number }[] = [];
    let currentLevelNodes: number[][] = [parsedArray];
    let lvl = 0;

    levels.push({
      level: lvl,
      nodes: currentLevelNodes,
      totalWork: parsedArray.length
    });

    while (currentLevelNodes.some((arr) => arr.length > 1) && lvl < 8) {
      lvl++;
      const nextLevelNodes: number[][] = [];
      for (const node of currentLevelNodes) {
        if (node.length <= 1) {
          nextLevelNodes.push(node);
        } else {
          const m = Math.floor(node.length / 2);
          nextLevelNodes.push(node.slice(0, m));
          nextLevelNodes.push(node.slice(m));
        }
      }
      currentLevelNodes = nextLevelNodes;
      levels.push({
        level: lvl,
        nodes: currentLevelNodes,
        totalWork: parsedArray.length
      });
    }
    return levels;
  }, [parsedArray]);

  // Bottom-up conquer & merge tree levels
  const recombineLevels = useMemo(() => {
    if (parsedArray.length === 0) return [];
    
    // Base leaves from the end of the split tree
    const lastSplit = splitLevels[splitLevels.length - 1];
    let current: number[][] = lastSplit ? lastSplit.nodes : parsedArray.map((x) => [x]);
    
    const levels: Array<{
      level: number;
      nodes: Array<{ sorted: number[]; comparisons: number; left?: number[]; right?: number[] }>;
      totalComparisons: number;
    }> = [];

    levels.push({
      level: 0,
      nodes: current.map((arr) => ({ sorted: arr, comparisons: 0 })),
      totalComparisons: 0
    });

    let lvl = 0;
    while (current.length > 1 && lvl < 8) {
      lvl++;
      const nextNodes: Array<{ sorted: number[]; comparisons: number; left: number[]; right: number[] }> = [];
      const nextArrays: number[][] = [];
      let lvlComps = 0;

      for (let i = 0; i < current.length; i += 2) {
        if (i + 1 < current.length) {
          const { merged, comparisons } = countMergeComparisons(current[i], current[i + 1]);
          nextNodes.push({
            sorted: merged,
            comparisons,
            left: current[i],
            right: current[i + 1]
          });
          nextArrays.push(merged);
          lvlComps += comparisons;
        } else {
          nextNodes.push({
            sorted: current[i],
            comparisons: 0,
            left: current[i],
            right: []
          });
          nextArrays.push(current[i]);
        }
      }

      levels.push({
        level: lvl,
        nodes: nextNodes,
        totalComparisons: lvlComps
      });
      current = nextArrays;
    }

    return levels;
  }, [parsedArray, splitLevels]);

  const totalTreeComparisons = useMemo(() => {
    return recombineLevels.reduce((sum, lvl) => sum + lvl.totalComparisons, 0);
  }, [recombineLevels]);

  return (
    <div className="mergesort-playground">
      <div className="playground-intro">
        <h3>
          {language === 'es'
            ? 'Laboratorio Interactivo: Operación Merge y Árbol de División'
            : 'Interactive Playground: Subarray Merging & Divide Tree'}
        </h3>
        <p>
          {language === 'es'
            ? 'Experimenta con la operación fundamental de Merge Sort: el merge lineal O(N) mediante 2 punteros monótonos y la descomposición recursiva en O(log N) niveles.'
            : 'Experiment with the fundamental operation of Merge Sort: linear O(N) two-pointer merge and recursive decomposition across O(log N) levels.'}
        </p>
      </div>

      {/* Presets */}
      <div className="presets-section">
        <span className="section-label">
          {language === 'es' ? 'Casos de Estudio Curados:' : 'Curated Study Cases:'}
        </span>
        <div className="preset-chips">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className={`chip-btn ${arrayStr === p.array.join(', ') ? 'active' : ''}`}
              onClick={() => {
                setArrayStr(p.array.join(', '));
                resetSimulation();
              }}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="input-group">
        <label htmlFor="mergesort-input">
          {language === 'es'
            ? 'Caso Propio (valores separados por coma, 2 a 16 elementos):'
            : 'Custom Case (comma-separated values, 2 to 16 elements):'}
        </label>
        <input
          id="mergesort-input"
          type="text"
          className="array-input"
          value={arrayStr}
          onChange={(e) => setArrayStr(e.target.value)}
        />
      </div>

      {error && <div className="playground-error-banner">{error}</div>}

      {/* Tab Selector */}
      <div className="tab-selector" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'merge'}
          className={`tab-btn ${activeTab === 'merge' ? 'active' : ''}`}
          onClick={() => setActiveTab('merge')}
        >
          {language === 'es' ? 'Operación Merge (2 Punteros)' : 'Two-Pointer Merge'}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'tree'}
          className={`tab-btn ${activeTab === 'tree' ? 'active' : ''}`}
          onClick={() => setActiveTab('tree')}
        >
          {language === 'es' ? 'Árbol de Recursión y Teorema Maestro' : 'Recursion Tree & Master Theorem'}
        </button>
      </div>

      {activeTab === 'merge' ? (
        <div className="merge-simulation-container">
          <div className="halves-grid">
            {/* Left Subarray */}
            <div className="half-card">
              <div className="half-title">
                <span>{language === 'es' ? 'Subarreglo Izquierdo (L)' : 'Left Subarray (L)'}</span>
                <span>
                  {leftPointer}/{leftHalf.length}
                </span>
              </div>
              <div className="elements-row">
                {leftHalf.map((val, idx) => {
                  const isCurrent = idx === leftPointer;
                  const isConsumed = idx < leftPointer;
                  return (
                    <div
                      key={idx}
                      className={`element-pill ${isCurrent ? 'active-pointer' : ''} ${
                        isConsumed ? 'consumed' : ''
                      }`}
                    >
                      {isCurrent && <span className="pointer-badge">i={idx}</span>}
                      <span>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Subarray */}
            <div className="half-card">
              <div className="half-title">
                <span>{language === 'es' ? 'Subarreglo Derecho (R)' : 'Right Subarray (R)'}</span>
                <span>
                  {rightPointer}/{rightHalf.length}
                </span>
              </div>
              <div className="elements-row">
                {rightHalf.map((val, idx) => {
                  const isCurrent = idx === rightPointer;
                  const isConsumed = idx < rightPointer;
                  return (
                    <div
                      key={idx}
                      className={`element-pill ${isCurrent ? 'active-pointer' : ''} ${
                        isConsumed ? 'consumed' : ''
                      }`}
                    >
                      {isCurrent && <span className="pointer-badge">j={idx}</span>}
                      <span>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-bar">
            <button
              className="merge-action-btn"
              onClick={handleTakeLeft}
              disabled={leftPointer >= leftHalf.length}
            >
              {language === 'es'
                ? `Tomar de L[${leftPointer}] ${leftPointer < leftHalf.length ? `(${leftHalf[leftPointer]})` : ''}`
                : `Take from L[${leftPointer}] ${leftPointer < leftHalf.length ? `(${leftHalf[leftPointer]})` : ''}`}
            </button>
            <button
              className="merge-action-btn"
              onClick={handleTakeRight}
              disabled={rightPointer >= rightHalf.length}
            >
              {language === 'es'
                ? `Tomar de R[${rightPointer}] ${rightPointer < rightHalf.length ? `(${rightHalf[rightPointer]})` : ''}`
                : `Take from R[${rightPointer}] ${rightPointer < rightHalf.length ? `(${rightHalf[rightPointer]})` : ''}`}
            </button>
            <button className="chip-btn" onClick={resetSimulation}>
              {language === 'es' ? 'Reiniciar Merge' : 'Reset Merge'}
            </button>
          </div>

          {/* Feedback message */}
          <div className={`feedback-banner ${feedback.type}`}>
            {feedback.message[language]}
          </div>

          {/* Merged Array Output */}
          <div className="merged-output-card">
            <div className="merged-title">
              {language === 'es'
                ? `Arreglo Resultante del Merge (${mergedList.length}/${leftHalf.length + rightHalf.length})`
                : `Resulting Merged Array (${mergedList.length}/${leftHalf.length + rightHalf.length})`}
            </div>
            <div className="elements-row">
              {mergedList.map((val, idx) => (
                <div key={idx} className="element-pill" style={{ borderColor: 'var(--primary)' }}>
                  <span>{val}</span>
                </div>
              ))}
              {mergedList.length === 0 && (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {language === 'es'
                    ? 'Selecciona los elementos de L o R para construir el arreglo ordenado (Merge).'
                    : 'Select elements from L or R to construct the sorted merge.'}
                </span>
              )}
            </div>
          </div>

          {/* Metrics */}
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Comparaciones Realizadas:' : 'Comparisons Made:'}
              </span>
              <span className="stat-item-value">{comparisons}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Cota Superior Teórica (N-1):' : 'Theoretical Upper Bound (N-1):'}
              </span>
              <span className="stat-item-value">{Math.max(0, leftHalf.length + rightHalf.length - 1)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Complejidad del Merge:' : 'Merge Complexity:'}
              </span>
              <span className="stat-item-value">O(N)</span>
            </div>
          </div>

          {isMergeComplete && (
            <div className="feedback-banner success" style={{ fontWeight: 600 }}>
              {language === 'es'
                ? 'Merge completado con éxito. Ambos punteros alcanzaron el final en exactamente O(N) pasos sin ningún retroceso.'
                : 'Merge successfully completed. Both pointers reached the end in exactly O(N) steps without any backtracking.'}
            </div>
          )}
        </div>
      ) : (
        /* Tree Inspector */
        <div className="tree-inspector">
          <div className="playground-intro">
            <p>
              {language === 'es'
                ? 'Merge Sort opera en dos fases formales: división recursiva descendente (top-down) hasta casos base unitarios y conquista con fusión ascendente (bottom-up), donde cada par se recombina en tiempo lineal mediante comparaciones.'
                : 'Merge Sort operates in two formal phases: top-down recursive division down to singleton base cases, followed by bottom-up conquer and merge, where pairs recombine in linear time via comparisons.'}
            </p>
          </div>

          {/* Phase 1: Downward Division */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>↓</span>
              <span>{language === 'es' ? '1. Fase de División Recursiva (Top-Down Split)' : '1. Top-Down Recursive Division'}</span>
            </div>
            {splitLevels.map((lvl) => (
              <div key={`split-${lvl.level}`} className="tree-level-row">
                <span className="tree-level-label">
                  {language === 'es' ? `Nivel ${lvl.level}` : `Level ${lvl.level}`}
                </span>
                <div className="tree-nodes-container">
                  {lvl.nodes.map((nodeArr, nIdx) => (
                    <div key={nIdx} className="tree-node-block">
                      [{nodeArr.join(', ')}]
                    </div>
                  ))}
                </div>
                <span className="tree-level-work">{language === 'es' ? 'Trabajo:' : 'Work:'} {lvl.totalWork}</span>
              </div>
            ))}
          </div>

          {/* Phase 2: Upward Recombination & Merge */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>↑</span>
              <span>{language === 'es' ? '2. Fase de Fusión y Ordenamiento Ascendente (Bottom-Up Conquer & Merge)' : '2. Bottom-Up Conquer & Merge (Sorting)'}</span>
            </div>
            {recombineLevels.map((lvl) => (
              <div key={`rec-${lvl.level}`} className="tree-level-row" style={{ borderColor: lvl.level === recombineLevels.length - 1 ? 'var(--success)' : 'var(--border)' }}>
                <span className="tree-level-label">
                  {lvl.level === 0
                    ? (language === 'es' ? 'Casos Base' : 'Base Cases')
                    : (language === 'es' ? `Fusión L${lvl.level}` : `Merge L${lvl.level}`)}
                </span>
                <div className="tree-nodes-container">
                  {lvl.nodes.map((node, nIdx) => (
                    <div
                      key={nIdx}
                      className="tree-node-block"
                      style={{
                        backgroundColor: lvl.level === recombineLevels.length - 1 ? 'var(--state-solution-bg)' : 'var(--surface)',
                        border: lvl.level === recombineLevels.length - 1 ? '1.5px solid var(--success)' : '1px solid var(--border)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span>[{node.sorted.join(', ')}]</span>
                      {node.comparisons > 0 && (
                        <span style={{ fontSize: '0.72rem', color: 'var(--success)', fontWeight: 700 }}>
                          ({node.comparisons} {language === 'es' ? 'comp.' : 'comps'})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <span className="tree-level-work" style={{ color: 'var(--success)' }}>
                  {language === 'es' ? 'Comparaciones:' : 'Comparisons:'} {lvl.totalComparisons}
                </span>
              </div>
            ))}
          </div>

          <div className="stats-grid" style={{ marginTop: '0.75rem' }}>
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Niveles de Profundidad (⌈log₂ N⌉ + 1):' : 'Depth Levels (⌈log₂ N⌉ + 1):'}
              </span>
              <span className="stat-item-value">{splitLevels.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Comparaciones Totales en Árbol:' : 'Total Tree Comparisons:'}
              </span>
              <span className="stat-item-value" style={{ color: 'var(--success)' }}>{totalTreeComparisons}</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Trabajo por Nivel:' : 'Work per Level:'}
              </span>
              <span className="stat-item-value">Θ(N)</span>
            </div>
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Costo Asintótico Total:' : 'Total Asymptotic Cost:'}
              </span>
              <span className="stat-item-value">Θ(N log N)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
