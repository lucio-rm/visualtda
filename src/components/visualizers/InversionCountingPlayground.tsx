import React, { useState, useMemo, useEffect } from 'react';
import { countInversions } from '../../engine/algorithms/inversionCountingValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './InversionCountingPlayground.css';

const DEFAULT_ARRAY = [2, 3, 8, 6, 1];

interface DiscoveredInversion {
  i: number;
  j: number;
  valI: number;
  valJ: number;
}

export const InversionCountingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [array, setArray] = useState<number[]>(DEFAULT_ARRAY);
  const [firstSelectedIdx, setFirstSelectedIdx] = useState<number | null>(null);
  const [discoveredPairs, setDiscoveredPairs] = useState<DiscoveredInversion[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [guessInput, setGuessInput] = useState<string>('');
  const [guessFeedback, setGuessFeedback] = useState<{ text: string; correct: boolean } | null>(null);
  const [showDivideExplanation, setShowDivideExplanation] = useState<boolean>(false);
  const [customInputStr, setCustomInputStr] = useState<string>('2, 3, 8, 6, 1');
  const [customInputError, setCustomInputError] = useState<string | null>(null);
  const [newElemVal, setNewElemVal] = useState<number>(4);

  const handleApplyCustomInput = () => {
    try {
      const parts = customInputStr
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) {
        throw new Error(language === 'es' ? 'Ingresá al menos 2 números.' : 'Enter at least 2 numbers.');
      }
      const nums = parts.map((p) => {
        const v = Number(p);
        if (isNaN(v)) throw new Error(language === 'es' ? `"${p}" no es un número válido.` : `"${p}" is not a valid number.`);
        return v;
      });
      if (nums.length < 2) {
        throw new Error(language === 'es' ? 'El arreglo debe tener al menos 2 elementos.' : 'Array must have at least 2 elements.');
      }
      if (nums.length > 12) {
        throw new Error(language === 'es' ? 'Máximo 12 elementos para mantener legibilidad visual.' : 'Maximum 12 elements to maintain visual legibility.');
      }
      setCustomInputError(null);
      setArray(nums);
    } catch (err: unknown) {
      setCustomInputError(err instanceof Error ? err.message : 'Error');
    }
  };

  const handleAdjustValue = (index: number, delta: number) => {
    const next = [...array];
    next[index] = next[index] + delta;
    setArray(next);
    setCustomInputStr(next.join(', '));
  };

  const handleRemoveElement = (index: number) => {
    if (array.length <= 2) return;
    const next = array.filter((_, i) => i !== index);
    setArray(next);
    setCustomInputStr(next.join(', '));
  };

  const handleAddElement = () => {
    if (array.length >= 10) return;
    const next = [...array, newElemVal];
    setArray(next);
    setCustomInputStr(next.join(', '));
  };

  const handleReverseArray = () => {
    const next = [...array].reverse();
    setArray(next);
    setCustomInputStr(next.join(', '));
  };

  // Secret calculation for verification (not revealed to student prematurely)
  const trueTotalInversions = useMemo(() => countInversions(array), [array]);
  const n = array.length;
  const maxPossibleInversions = (n * (n - 1)) / 2;

  // Reset discovery when array changes
  useEffect(() => {
    setFirstSelectedIdx(null);
    setDiscoveredPairs([]);
    setFeedbackMsg(null);
    setGuessFeedback(null);
  }, [array]);

  const allInversionsDiscovered = discoveredPairs.length === trueTotalInversions && trueTotalInversions > 0;
  const isZeroDisorder = trueTotalInversions === 0;

  // Trigger mastery completion when student discovers all inversions
  useEffect(() => {
    if (allInversionsDiscovered || (isZeroDisorder && discoveredPairs.length === 0)) {
      markAttempted('inversion-counting-dyc');
    }
  }, [allInversionsDiscovered, isZeroDisorder]);

  // Student clicks an element
  const handleBarClick = (idx: number) => {
    if (firstSelectedIdx === null) {
      setFirstSelectedIdx(idx);
      setFeedbackMsg({
        text: language === 'es'
          ? `Elemento seleccionado: A[${idx}] = ${array[idx]}. Ahora seleccioná otro elemento para comparar.`
          : `Selected item: A[${idx}] = ${array[idx]}. Now select another element to compare.`,
        type: 'info'
      });
      return;
    }

    if (firstSelectedIdx === idx) {
      setFirstSelectedIdx(null);
      setFeedbackMsg(null);
      return;
    }

    // Determine left (i) and right (j) with i < j
    const i = Math.min(firstSelectedIdx, idx);
    const j = Math.max(firstSelectedIdx, idx);
    const valI = array[i];
    const valJ = array[j];
    setFirstSelectedIdx(null);

    // Check inversion condition: i < j and A[i] > A[j]
    if (valI > valJ) {
      const alreadyFound = discoveredPairs.some((p) => p.i === i && p.j === j);
      if (alreadyFound) {
        setFeedbackMsg({
          text: language === 'es'
            ? `Ya habías descubierto esta inversión: A[${i}]=${valI} > A[${j}]=${valJ}.`
            : `You already discovered this inversion: A[${i}]=${valI} > A[${j}]=${valJ}.`,
          type: 'info'
        });
      } else {
        const newPair: DiscoveredInversion = { i, j, valI, valJ };
        setDiscoveredPairs((prev) => [...prev, newPair]);
        setFeedbackMsg({
          text: language === 'es'
            ? `Inversión identificada: A[${i}]=${valI} > A[${j}]=${valJ} (con índice ${i} < ${j}).`
            : `Inversion identified: A[${i}]=${valI} > A[${j}]=${valJ} (with index ${i} < ${j}).`,
          type: 'success'
        });
      }
    } else {
      setFeedbackMsg({
        text: language === 'es'
          ? `No es inversión: A[${i}]=${valI} ≤ A[${j}]=${valJ}. El par está en orden relativo correcto.`
          : `Not an inversion: A[${i}]=${valI} ≤ A[${j}]=${valJ}. Relative order is already sorted.`,
        type: 'error'
      });
    }
  };

  const handleVerifyGuess = () => {
    const num = parseInt(guessInput.trim(), 10);
    if (isNaN(num)) return;

    if (num === trueTotalInversions) {
      setGuessFeedback({
        text:
          language === 'es'
            ? `¡Respuesta correcta! El arreglo contiene exactamente ${trueTotalInversions} inversiones.`
            : `Correct answer! The array contains exactly ${trueTotalInversions} inversions.`,
        correct: true
      });
      markAttempted('inversion-counting-dyc');
    } else {
      setGuessFeedback({
        text:
          language === 'es'
            ? `Respuesta incorrecta. Indicaste ${num} inversiones, pero no coincide con el total real. ¡Seguí explorando e intentando!`
            : `Incorrect answer. You entered ${num} inversions, which does not match the actual total. Keep exploring and try again!`,
        correct: false
      });
    }
  };

  const handleRandomize = () => {
    const len = 5;
    const randoms: number[] = [];
    while (randoms.length < len) {
      const val = Math.floor(Math.random() * 20) + 1;
      if (!randoms.includes(val)) {
        randoms.push(val);
      }
    }
    setArray(randoms);
  };

  return (
    <div className="inversion-playground">
      <div className="inv-pg-card">
        <div className="inv-pg-header">
          <div>
            <div className="inv-pg-title">
              {language === 'es'
                ? 'Laboratorio Interactivo: Descubrimiento de Inversiones'
                : 'Interactive Inversion Discovery Sandbox'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
              {language === 'es'
                ? 'Hacé clic en dos casillas para comparar sus valores. Descubrí vos mismo cuántos pares violan el orden ascendente.'
                : 'Click two slots to compare values. Discover how many pairs violate ascending order yourself.'}
            </div>
          </div>

          <div className="inv-pg-actions">
            <button
              type="button"
              className="inv-pg-btn"
              onClick={() => {
                setArray([2, 3, 8, 6, 1]);
                setCustomInputStr('2, 3, 8, 6, 1');
                setCustomInputError(null);
              }}
            >
              CLRS [2, 3, 8, 6, 1]
            </button>
            <button
              type="button"
              className="inv-pg-btn"
              onClick={() => {
                setArray([5, 4, 3, 2, 1]);
                setCustomInputStr('5, 4, 3, 2, 1');
                setCustomInputError(null);
              }}
            >
              {language === 'es' ? 'Invertido [5, 4, 3, 2, 1]' : 'Reversed [5, 4, 3, 2, 1]'}
            </button>
            <button
              type="button"
              className="inv-pg-btn"
              onClick={() => {
                setArray([1, 2, 3, 4, 5]);
                setCustomInputStr('1, 2, 3, 4, 5');
                setCustomInputError(null);
              }}
            >
              {language === 'es' ? 'Ordenado [1, 2, 3, 4, 5]' : 'Sorted [1, 2, 3, 4, 5]'}
            </button>
            <button
              type="button"
              className="inv-pg-btn accent"
              onClick={handleRandomize}
            >
              {language === 'es' ? 'Aleatorio' : 'Randomize'}
            </button>
          </div>
        </div>

        {/* Custom Input & Array Builder Form */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleApplyCustomInput();
            }}
            style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <label htmlFor="inv-custom-input-box" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {language === 'es' ? 'Caso propio:' : 'Custom case:'}
            </label>
            <input
              id="inv-custom-input-box"
              type="text"
              value={customInputStr}
              onChange={(e) => setCustomInputStr(e.target.value)}
              placeholder="ej: 7, 2, 9, 1, 5"
              style={{
                padding: '0.35rem 0.65rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--canvas-bg, var(--surface-light))',
                color: 'var(--text)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                width: '180px'
              }}
            />
            <button
              type="submit"
              className="inv-pg-btn"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
            >
              {language === 'es' ? 'Cargar' : 'Load'}
            </button>
          </form>

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              type="button"
              className="inv-pg-btn"
              onClick={handleReverseArray}
              title={language === 'es' ? 'Invertir orden del arreglo' : 'Reverse array order'}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.825rem' }}
            >
              ⇄ {language === 'es' ? 'Invertir' : 'Reverse'}
            </button>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
              {language === 'es' ? 'Agregar:' : 'Add:'}
            </span>
            <input
              type="number"
              value={newElemVal}
              onChange={(e) => setNewElemVal(Number(e.target.value))}
              style={{
                width: '48px',
                padding: '0.2rem 0.35rem',
                backgroundColor: 'var(--canvas-bg, var(--surface-light))',
                color: 'var(--text)',
                border: '1.5px solid var(--border)',
                borderRadius: '4px',
                fontSize: '0.85rem'
              }}
            />
            <button
              type="button"
              className="inv-pg-btn accent"
              onClick={handleAddElement}
              disabled={array.length >= 10}
              style={{ padding: '0.35rem 0.6rem', fontSize: '0.825rem' }}
            >
              + {language === 'es' ? 'Agregar' : 'Add'}
            </button>
          </div>

          {customInputError && (
            <span style={{ fontSize: '0.8rem', color: 'var(--error)' }}>
              {customInputError}
            </span>
          )}
        </div>

        {/* Array Visualization with Direct Item Controls */}
        <div className="inv-pg-array-display">
          {array.map((val, idx) => {
            const isSelected = firstSelectedIdx === idx;

            return (
              <div key={idx} className="inv-pg-item" style={{ minWidth: '74px', width: '74px' }}>
                <button
                  type="button"
                  className={`inv-pg-bar ${isSelected ? 'selected-left' : ''}`}
                  onClick={() => handleBarClick(idx)}
                  aria-label={`Elemento en posición ${idx}, valor ${val}`}
                  style={{ width: '64px', height: '52px' }}
                >
                  {val}
                </button>
                <span className="inv-pg-bar-idx">pos={idx}</span>
                <div style={{ display: 'flex', gap: '3px', marginTop: '2px', width: '100%', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleAdjustValue(idx, 1)}
                    style={{
                      width: '22px',
                      height: '22px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: '3px',
                      border: '1.5px solid var(--success)',
                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--success)',
                      cursor: 'pointer'
                    }}
                    aria-label={`Incrementar valor en posición ${idx}`}
                    title={language === 'es' ? 'Incrementar' : 'Increment'}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustValue(idx, -1)}
                    style={{
                      width: '22px',
                      height: '22px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: '3px',
                      border: '1.5px solid var(--warning)',
                      backgroundColor: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--warning)',
                      cursor: 'pointer'
                    }}
                    aria-label={`Decrementar valor en posición ${idx}`}
                    title={language === 'es' ? 'Decrementar' : 'Decrement'}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveElement(idx)}
                    disabled={array.length <= 2}
                    style={{
                      width: '22px',
                      height: '22px',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      borderRadius: '3px',
                      border: '1px solid var(--error)',
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: 'var(--error)',
                      cursor: array.length <= 2 ? 'not-allowed' : 'pointer',
                      opacity: array.length <= 2 ? 0.3 : 1
                    }}
                    aria-label={`Eliminar elemento en posición ${idx}`}
                    title={language === 'es' ? 'Eliminar' : 'Delete'}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Permanent Stable Guidance & Comparison Status Card */}
        <div
          className="inv-status-card"
          style={{
            minHeight: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            background: 'var(--canvas-bg, var(--surface-light))',
            border: '1px solid var(--border)',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>
              {language === 'es' ? 'Estado:' : 'Status:'}
            </span>
            <span>
              {firstSelectedIdx !== null ? (
                <span>
                  {language === 'es' ? '1er elemento seleccionado:' : '1st item selected:'}{' '}
                  <strong style={{ color: 'var(--accent)' }}>A[{firstSelectedIdx}] = {array[firstSelectedIdx]}</strong>.{' '}
                  {language === 'es' ? 'Hacé clic en otro elemento para comparar.' : 'Click another card to compare.'}
                </span>
              ) : feedbackMsg ? (
                <span style={{ color: feedbackMsg.type === 'success' ? 'var(--success)' : feedbackMsg.type === 'error' ? 'var(--error)' : 'var(--text)' }}>
                  {feedbackMsg.text}
                </span>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>
                  {language === 'es'
                    ? 'Hacé clic en dos casillas para verificar si forman una inversión (A[i] > A[j] con i < j).'
                    : 'Click two cards to test if they form an inversion (A[i] > A[j] with i < j).'}
                </span>
              )}
            </span>
          </div>
          {firstSelectedIdx !== null && (
            <button
              type="button"
              className="inv-pg-btn"
              onClick={() => {
                setFirstSelectedIdx(null);
                setFeedbackMsg(null);
              }}
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
            >
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
          )}
        </div>

        {/* Progress & Discovered Inversions */}
        <div className="inv-pg-discovery-panel">
          <div className="inv-discovery-header">
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {language === 'es' ? 'Inversiones descubiertas por exploración:' : 'Discovered inversions from exploration:'}
            </span>
            <span className="inv-discovery-counter">
              <strong>{discoveredPairs.length}</strong> {language === 'es' ? 'pares encontrados' : 'pairs found'}
            </span>
          </div>

          {discoveredPairs.length > 0 ? (
            <div className="inv-pairs-list">
              {discoveredPairs.map((p, idx) => (
                <span key={idx} className="inv-pair-pill">
                  {`(A[${p.i}]=${p.valI} > A[${p.j}]=${p.valJ})`}
                </span>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'es'
                ? 'Aún no has descubierto ninguna inversión. Hacé clic en casillas para explorar pares.'
                : 'No inversions discovered yet. Click cells to explore pairs.'}
            </div>
          )}
        </div>

        {/* Answer Verification Box (RTA) */}
        <div
          className="inv-challenge-box"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: 'var(--accent)',
                  letterSpacing: '0.05em',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                RTA:
              </span>
              <input
                type="number"
                className="inv-challenge-input"
                value={guessInput}
                onChange={(e) => {
                  setGuessInput(e.target.value);
                  setGuessFeedback(null);
                }}
                placeholder={language === 'es' ? '¿Cuántas inversiones?' : 'Total inversions?'}
                min={0}
                max={maxPossibleInversions}
                style={{
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  width: '180px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--border)',
                  background: 'var(--canvas-bg, var(--surface-light))',
                  color: 'var(--text)'
                }}
              />
              <button
                type="button"
                className="inv-pg-btn accent"
                onClick={handleVerifyGuess}
                style={{ padding: '0.5rem 1.25rem', fontWeight: 700 }}
              >
                {language === 'es' ? 'Verificar Respuesta' : 'Verify Answer'}
              </button>
            </div>

            {guessFeedback && (
              <div
                className={`inv-feedback-banner ${guessFeedback.correct ? 'success' : 'error'}`}
                role="status"
                style={{ marginTop: '0.25rem' }}
              >
                <strong>{guessFeedback.text}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Divide and Conquer Pedagogical Explanation */}
        <div className="inv-dnc-toggle-card">
          <button
            type="button"
            className="btn-toggle-dnc"
            onClick={() => setShowDivideExplanation(!showDivideExplanation)}
          >
            {showDivideExplanation ? '▲ Ocultar' : '▼ Ver'} {language === 'es' ? 'Fundamento Teórico: ¿Por qué O(N log N) con Merge Sort?' : 'Theoretical Insight: Why O(N log N) with Merge Sort?'}
          </button>

          {showDivideExplanation && (
            <div className="inv-dnc-explanation-content">
              <h4>{language === 'es' ? 'Principio de División y Conquista (Divide & Conquer)' : 'Divide & Conquer Principle (Divide & Conquer)'}</h4>
              <p>
                {language === 'es'
                  ? 'Una búsqueda exhaustiva por pares compara cada elemento con los demás en tiempo O(N²). Merge Sort cuenta las inversiones cruzadas en tiempo lineal O(N) durante la mezcla:'
                  : 'Exhaustive pairwise search checks every pair in O(N²) time. Merge Sort counts cross-inversions in linear O(N) time during merge:'}
              </p>
              <div className="inv-dnc-math-box">
                <code>
                  Inversiones(A) = Inversiones(Izq) + Inversiones(Der) + InversionesCruzadas(Izq, Der)
                </code>
              </div>
              <p>
                {language === 'es'
                  ? 'Cuando el puntero de la mitad derecha avanza porque Der[j] < Izq[i], automáticamente Der[j] es menor que Izq[i] y que TODOS los elementos restantes de la mitad izquierda. Se suman (mid - i + 1) inversiones en O(1) tiempo constante, logrando una cota asintótica global de O(N log N).'
                  : 'When right pointer advances because Right[j] < Left[i], Right[j] is smaller than Left[i] and ALL remaining items in Left. We add (mid - i + 1) inversions in O(1), achieving O(N log N) overall.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
