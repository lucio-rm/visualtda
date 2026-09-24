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

  // Tree computation
  const treeLevels = useMemo(() => {
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

  return (
    <div className="mergesort-playground">
      <div className="playground-intro">
        <h3>
          {language === 'es'
            ? 'Laboratorio Interactivo: Fusión de Subarreglos y Árbol de División'
            : 'Interactive Playground: Subarray Merging & Divide Tree'}
        </h3>
        <p>
          {language === 'es'
            ? 'Experimenta con la operación fundamental de Merge Sort: la fusión lineal O(N) mediante 2 punteros monótonos y la descomposición recursiva en O(log N) niveles.'
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
          {language === 'es' ? 'Fusión 2 Punteros (Merge Step)' : 'Two-Pointer Merge'}
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
              {language === 'es' ? 'Reiniciar Fusión' : 'Reset Merge'}
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
                ? `Arreglo Fusionado Resultante (${mergedList.length}/${leftHalf.length + rightHalf.length})`
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
                    ? 'Selecciona los elementos de L o R para construir la fusión ordenada.'
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
                {language === 'es' ? 'Complejidad de Fusión:' : 'Merge Complexity:'}
              </span>
              <span className="stat-item-value">O(N)</span>
            </div>
          </div>

          {isMergeComplete && (
            <div className="feedback-banner success" style={{ fontWeight: 600 }}>
              {language === 'es'
                ? 'Fusión completada con éxito. Ambos punteros alcanzaron el final en exactamente O(N) pasos sin ningún retroceso.'
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
                ? 'En cada nivel k, el problema se subdivide en 2^k subproblemas de tamaño N/(2^k). La suma de trabajo en cualquier nivel es siempre exactamente N.'
                : 'At each level k, the problem splits into 2^k subproblems of size N/(2^k). The sum of work at any level is always exactly N.'}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {treeLevels.map((lvl) => (
              <div key={lvl.level} className="tree-level-row">
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
                <span className="tree-level-work">Trabajo: {lvl.totalWork}</span>
              </div>
            ))}
          </div>

          <div className="stats-grid" style={{ marginTop: '0.5rem' }}>
            <div className="stat-item">
              <span className="stat-item-label">
                {language === 'es' ? 'Niveles de Profundidad (⌈log₂ N⌉ + 1):' : 'Depth Levels (⌈log₂ N⌉ + 1):'}
              </span>
              <span className="stat-item-value">{treeLevels.length}</span>
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
