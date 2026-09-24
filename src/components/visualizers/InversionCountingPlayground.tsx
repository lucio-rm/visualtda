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
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);
  const [showDivideExplanation, setShowDivideExplanation] = useState<boolean>(false);
  const [customInputStr, setCustomInputStr] = useState<string>('2, 3, 8, 6, 1');
  const [customInputError, setCustomInputError] = useState<string | null>(null);

  const handleApplyCustomInput = () => {
    try {
      const parts = customInputStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) {
        throw new Error(language === 'es' ? 'Ingresá al menos 2 números separados por coma.' : 'Enter at least 2 comma-separated numbers.');
      }
      const nums = parts.map((p) => {
        const v = Number(p);
        if (isNaN(v)) throw new Error(language === 'es' ? `"${p}" no es un número válido.` : `"${p}" is not a valid number.`);
        return v;
      });
      if (nums.length < 2) {
        throw new Error(language === 'es' ? 'El arreglo debe tener al menos 2 elementos.' : 'Array must have at least 2 elements.');
      }
      if (nums.length > 10) {
        throw new Error(language === 'es' ? 'Máximo 10 elementos para mantener legibilidad visual.' : 'Maximum 10 elements to maintain visual legibility.');
      }
      setCustomInputError(null);
      setArray(nums);
    } catch (err: unknown) {
      setCustomInputError(err instanceof Error ? err.message : 'Error');
    }
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
      setGuessFeedback(
        language === 'es'
          ? `Conteo exacto verificado: el arreglo contiene ${trueTotalInversions} inversiones.`
          : `Exact count verified: the array contains ${trueTotalInversions} inversions.`
      );
      markAttempted('inversion-counting-dyc');
    } else if (num < trueTotalInversions) {
      setGuessFeedback(
        language === 'es'
          ? `Tu estimación (${num}) es inferior al número real. Hay más pares desordenados en el arreglo.`
          : `Your estimate (${num}) is too low. There are more out-of-order pairs.`
      );
    } else {
      setGuessFeedback(
        language === 'es'
          ? `Tu estimación (${num}) supera el número real. Recordá que solo se cuentan pares (i, j) con i < j y A[i] > A[j].`
          : `Your estimate (${num}) is too high. Remember only pairs (i, j) with i < j and A[i] > A[j] count.`
      );
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

        {/* Custom Input (Caso propio) */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Caso propio:' : 'Custom case:'}
          </label>
          <input
            type="text"
            value={customInputStr}
            onChange={(e) => setCustomInputStr(e.target.value)}
            placeholder="ej: 7, 2, 9, 1, 5"
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.85rem',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              width: '180px'
            }}
          />
          <button
            type="button"
            className="inv-pg-btn"
            onClick={handleApplyCustomInput}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.825rem' }}
          >
            {language === 'es' ? 'Cargar' : 'Load'}
          </button>
          {customInputError && (
            <span style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>
              {customInputError}
            </span>
          )}
        </div>

        {/* Array Visualization */}
        <div className="inv-pg-array-display">
          {array.map((val, idx) => {
            const isSelected = firstSelectedIdx === idx;
            const isInvolvedInDiscovered = discoveredPairs.some((p) => p.i === idx || p.j === idx);

            return (
              <div key={idx} className="inv-pg-item">
                <button
                  type="button"
                  className={`inv-pg-bar ${isSelected ? 'selected-left' : ''} ${isInvolvedInDiscovered ? 'has-inversions' : ''}`}
                  onClick={() => handleBarClick(idx)}
                  title={`Índice i=${idx}, Valor=${val}`}
                >
                  {val}
                </button>
                <span className="inv-pg-bar-idx">pos={idx}</span>
              </div>
            );
          })}
        </div>

        {/* Immediate Feedback Banner */}
        {feedbackMsg && (
          <div className={`inv-feedback-banner ${feedbackMsg.type}`} role="status">
            {feedbackMsg.text}
          </div>
        )}

        {/* Victory Card */}
        {allInversionsDiscovered && (
          <div className="inv-victory-card" role="status">
            
            <div>
              <strong>
                {language === 'es'
                  ? `Total de inversiones deducido: ${trueTotalInversions}.`
                  : `Brilliant deduction! You found all ${trueTotalInversions} inversions in the array.`}
              </strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                {language === 'es'
                  ? `El número total de inversiones representa la cantidad mínima de intercambios adyacentes necesarios para ordenar el arreglo (distancia tau de Kendall).`
                  : `Total inversions represent the minimum adjacent swaps required to sort the array (Kendall tau distance).`}
              </p>
            </div>
          </div>
        )}

        {isZeroDisorder && (
          <div className="inv-victory-card" role="status">
            <div>
              <strong>
                {language === 'es'
                  ? 'Arreglo ordenado: 0 inversiones.'
                  : 'Sorted array: 0 inversions.'}
              </strong>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                {language === 'es'
                  ? 'Todos los pares (i, j) con i < j satisfacen A[i] ≤ A[j]. Desorden nulo.'
                  : 'All pairs (i, j) with i < j satisfy A[i] ≤ A[j].'}
              </p>
            </div>
          </div>
        )}

        {/* Progress & Discovered Inversions */}
        <div className="inv-pg-discovery-panel">
          <div className="inv-discovery-header">
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
              {language === 'es' ? 'Inversiones descubiertas:' : 'Discovered inversions:'}
            </span>
            <span className="inv-discovery-counter">
              <strong>{discoveredPairs.length}</strong> {language === 'es' ? 'pares encontrados' : 'pairs found'}
            </span>
          </div>

          {discoveredPairs.length > 0 ? (
            <div className="inv-pairs-list">
              {discoveredPairs.map((p, idx) => (
                <span key={idx} className="inv-pair-pill">
                  (A[{p.i}]={p.valI} &gt; A[{p.j}]={p.valJ})
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

        {/* Challenge Guessing Box */}
        <div className="inv-challenge-box">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>
            {language === 'es' ? 'Desafío de Estimación Matemática:' : 'Mathematical Estimation Challenge:'}
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es'
              ? `¿Cuántas inversiones totales creés que tiene este arreglo de tamaño ${n} (máximo posible: ${maxPossibleInversions})?`
              : `How many total inversions do you think this size-${n} array has (max possible: ${maxPossibleInversions})?`}
          </p>
          <div className="inv-challenge-input-row">
            <input
              type="number"
              className="inv-challenge-input"
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              placeholder="0"
              min={0}
              max={maxPossibleInversions}
            />
            <button
              type="button"
              className="inv-pg-btn accent"
              onClick={handleVerifyGuess}
            >
              {language === 'es' ? 'Verificar Hipótesis' : 'Verify Guess'}
            </button>
          </div>
          {guessFeedback && (
            <div className="inv-guess-feedback" role="status">
              {guessFeedback}
            </div>
          )}
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
              <h4>{language === 'es' ? 'Principio de División y Conquista (Kleinberg & Tardos, Cap. 5.3)' : 'Divide & Conquer Principle (Kleinberg & Tardos, Ch. 5.3)'}</h4>
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
