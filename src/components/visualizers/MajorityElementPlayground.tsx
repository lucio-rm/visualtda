import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

type PresetType = 'clear' | 'edge' | 'distinct' | 'custom';
type ParadigmView = 'dyc' | 'boyer-moore';

export const MajorityElementPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePreset, setActivePreset] = useState<PresetType>('clear');
  const [array, setArray] = useState<number[]>([2, 2, 1, 1, 2, 2, 3, 2]);
  const [activeTab, setActiveTab] = useState<ParadigmView>('dyc');
  const [newElemVal, setNewElemVal] = useState<number>(2);

  const n = array.length;
  const threshold = Math.floor(n / 2);

  // Compute frequencies
  const freqMap: Record<number, number> = {};
  for (const val of array) {
    freqMap[val] = (freqMap[val] || 0) + 1;
  }

  let majorityElement: number | null = null;
  for (const [valStr, count] of Object.entries(freqMap)) {
    if (count > threshold) {
      majorityElement = Number(valStr);
      break;
    }
  }

  // D&C split computations
  const mid = Math.floor(n / 2);
  const leftHalf = array.slice(0, mid);
  const rightHalf = array.slice(mid);

  // Local candidate in left
  const leftFreq: Record<number, number> = {};
  for (const val of leftHalf) leftFreq[val] = (leftFreq[val] || 0) + 1;
  let candLeft: number | null = null;
  for (const [valStr, count] of Object.entries(leftFreq)) {
    if (count > Math.floor(leftHalf.length / 2)) {
      candLeft = Number(valStr);
      break;
    }
  }

  // Local candidate in right
  const rightFreq: Record<number, number> = {};
  for (const val of rightHalf) rightFreq[val] = (rightFreq[val] || 0) + 1;
  let candRight: number | null = null;
  for (const [valStr, count] of Object.entries(rightFreq)) {
    if (count > Math.floor(rightHalf.length / 2)) {
      candRight = Number(valStr);
      break;
    }
  }

  // Boyer-Moore Voting Simulation Steps
  const boyerMooreSteps: Array<{
    idx: number;
    element: number;
    candidate: number | null;
    count: number;
    action: 'INIT' | 'CHANGE_CANDIDATE' | 'MATCH' | 'CANCEL';
    note: { es: string; en: string };
  }> = [];

  let bmCandidate: number | null = null;
  let bmCount = 0;
  for (let i = 0; i < array.length; i++) {
    const x = array[i];
    if (bmCount === 0) {
      bmCandidate = x;
      bmCount = 1;
      boyerMooreSteps.push({
        idx: i,
        element: x,
        candidate: bmCandidate,
        count: bmCount,
        action: 'CHANGE_CANDIDATE',
        note: {
          es: `Contador en 0: nuevo candidato provisional = ${x}`,
          en: `Count is 0: new provisional candidate = ${x}`
        }
      });
    } else if (x === bmCandidate) {
      bmCount++;
      boyerMooreSteps.push({
        idx: i,
        element: x,
        candidate: bmCandidate,
        count: bmCount,
        action: 'MATCH',
        note: {
          es: `Coincide con candidato ${bmCandidate}: incrementa contador a ${bmCount}`,
          en: `Matches candidate ${bmCandidate}: increment count to ${bmCount}`
        }
      });
    } else {
      bmCount--;
      boyerMooreSteps.push({
        idx: i,
        element: x,
        candidate: bmCandidate,
        count: bmCount,
        action: 'CANCEL',
        note: {
          es: `Discrepancia: pareja (${bmCandidate}, ${x}) cancelada mutuamente. Contador a ${bmCount}`,
          en: `Mismatch: pair (${bmCandidate}, ${x}) canceled out. Count down to ${bmCount}`
        }
      });
    }
  }

  const handlePreset = (type: PresetType, arr: number[]) => {
    setActivePreset(type);
    setArray(arr);
    markAttempted('majority-element-dyc');
  };

  const handleAdjustValue = (index: number, delta: number) => {
    setActivePreset('custom');
    setArray((prev) => {
      const next = [...prev];
      next[index] = Math.max(0, next[index] + delta);
      return next;
    });
    markAttempted('majority-element-dyc');
  };

  const handleRemoveElement = (index: number) => {
    if (array.length <= 1) return;
    setActivePreset('custom');
    setArray((prev) => prev.filter((_, i) => i !== index));
    markAttempted('majority-element-dyc');
  };

  const handleAddElement = () => {
    if (array.length >= 16) return;
    setActivePreset('custom');
    setArray((prev) => [...prev, newElemVal]);
    markAttempted('majority-element-dyc');
  };

  return (
    <div
      className="algorithm-playground majority-element-playground"
      role="region"
      aria-label={language === 'es' ? 'Laboratorio de Elemento Mayoritario' : 'Majority Element Laboratory'}
    >
      {/* Controls & Presets */}
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${activePreset === 'clear' ? 'active' : ''}`}
            onClick={() => handlePreset('clear', [2, 2, 1, 1, 2, 2, 3, 2])}
          >
            {language === 'es' ? 'Mayoritario Claro (> n/2)' : 'Clear Majority (> n/2)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${activePreset === 'edge' ? 'active' : ''}`}
            onClick={() => handlePreset('edge', [4, 4, 4, 1, 2, 3])}
          >
            {language === 'es' ? 'Caso Límite (Exacto n/2)' : 'Edge Case (Exact n/2)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${activePreset === 'distinct' ? 'active' : ''}`}
            onClick={() => handlePreset('distinct', [1, 2, 3, 4, 5, 6])}
          >
            {language === 'es' ? 'Todos Distintos' : 'All Distinct'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            n = <strong>{n}</strong>
          </span>
          <span>
            {language === 'es' ? 'Umbral (> n/2):' : 'Threshold (> n/2):'}{' '}
            <strong style={{ color: 'var(--accent)' }}>{`> ${threshold}`}</strong> ({threshold + 1}+)
          </span>
        </div>
      </div>

      {/* Interactive Array Elements Ribbon */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '0.85rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ fontWeight: '600' }}>
            {language === 'es' ? 'Arreglo Interactivo (hacé clic en + / - para modificar valores):' : 'Interactive Array (click + / - to change values):'}
          </span>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{language === 'es' ? 'Nuevo:' : 'New:'}</span>
            <input
              type="number"
              value={newElemVal}
              onChange={(e) => setNewElemVal(Number(e.target.value))}
              style={{ width: '48px', padding: '0.2rem 0.4rem', backgroundColor: 'var(--canvas-bg, var(--surface-light))', color: 'var(--text)', border: '1.5px solid var(--border)', borderRadius: '4px', fontWeight: 700 }}
            />
            <button
              type="button"
              onClick={handleAddElement}
              disabled={array.length >= 16}
              style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid var(--accent)', backgroundColor: 'var(--accent)', color: 'var(--accent-contrast)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700' }}
            >
              + {language === 'es' ? 'Agregar' : 'Add'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
          {array.map((val, idx) => {
            const isMaj = val === majorityElement;
            return (
              <div
                key={`elem-tile-${idx}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '0.5rem 0.65rem',
                  borderRadius: '8px',
                  border: isMaj ? '2px solid var(--success)' : '1.5px solid var(--border)',
                  backgroundColor: isMaj ? 'rgba(16, 185, 129, 0.15)' : 'var(--canvas-bg, var(--surface-light))',
                  boxShadow: 'var(--shadow-sm)',
                  minWidth: '60px'
                }}
              >
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  [{idx}]
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-mono)', margin: '0.2rem 0', color: isMaj ? 'var(--success)' : 'var(--text)' }}>
                  {val}
                </span>
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => handleAdjustValue(idx, 1)}
                    style={{
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      border: '1.5px solid var(--success)',
                      backgroundColor: 'rgba(16, 185, 129, 0.22)',
                      color: 'var(--success)',
                      cursor: 'pointer',
                      lineHeight: 1
                    }}
                    title={language === 'es' ? 'Incrementar' : 'Increment'}
                    aria-label={`Incrementar valor en posición ${idx}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustValue(idx, -1)}
                    style={{
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.15rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      border: '1.5px solid var(--warning)',
                      backgroundColor: 'rgba(245, 158, 11, 0.22)',
                      color: 'var(--warning)',
                      cursor: 'pointer',
                      lineHeight: 1
                    }}
                    title={language === 'es' ? 'Decrementar' : 'Decrement'}
                    aria-label={`Decrementar valor en posición ${idx}`}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveElement(idx)}
                    disabled={array.length <= 1}
                    style={{
                      width: '26px',
                      height: '26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 800,
                      borderRadius: '4px',
                      border: '1px solid var(--error)',
                      backgroundColor: 'rgba(239, 68, 68, 0.18)',
                      color: 'var(--error)',
                      cursor: array.length <= 1 ? 'not-allowed' : 'pointer',
                      opacity: array.length <= 1 ? 0.3 : 1,
                      lineHeight: 1
                    }}
                    title={language === 'es' ? 'Eliminar' : 'Remove'}
                    aria-label={`Eliminar elemento en posición ${idx}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Result Status Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: majorityElement !== null ? 'var(--state-solution-bg)' : 'var(--state-conflict-bg)',
          border: `1px solid ${majorityElement !== null ? 'var(--success)' : 'var(--error)'}`,
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}
      >
        {majorityElement !== null ? (
          <div>
            <strong>{language === 'es' ? 'Elemento Mayoritario Encontrado:' : 'Majority Element Found:'}</strong>{' '}
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--success)' }}>{majorityElement}</span>{' '}
            {`(${freqMap[majorityElement]} ${language === 'es' ? 'apariciones' : 'occurrences'} > ${threshold})`}
          </div>
        ) : (
          <div>
            <strong>{language === 'es' ? 'Sin Elemento Mayoritario:' : 'No Majority Element:'}</strong>{' '}
            {language === 'es'
              ? `Ningún elemento aparece más de ⌊n/2⌋ = ${threshold} veces en el arreglo.`
              : `No single element appears more than ⌊n/2⌋ = ${threshold} times in the array.`}
          </div>
        )}
      </div>

      {/* Paradigm View Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('dyc')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTab === 'dyc' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'dyc' ? 'var(--accent-contrast)' : 'var(--text)',
            fontWeight: activeTab === 'dyc' ? '700' : '400',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          {language === 'es' ? '1. División y Conquista (O(n log n))' : '1. Divide & Conquer (O(n log n))'}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('boyer-moore')}
          style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: activeTab === 'boyer-moore' ? 'var(--accent)' : 'transparent',
            color: activeTab === 'boyer-moore' ? 'var(--accent-contrast)' : 'var(--text)',
            fontWeight: activeTab === 'boyer-moore' ? '700' : '400',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          {language === 'es' ? '2. Cancelación en Parejas Boyer-Moore (O(n))' : '2. Boyer-Moore Pair Cancellation (O(n))'}
        </button>
      </div>

      {activeTab === 'dyc' ? (
        /* D&C Section */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {/* Left Half */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {language === 'es' ? 'MITAD IZQUIERDA (A[0 .. ⌊n/2⌋ - 1])' : 'LEFT HALF (A[0 .. ⌊n/2⌋ - 1])'}
              </div>
              <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                [{leftHalf.join(', ')}]
              </div>
              <div style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                {language === 'es' ? 'Candidato local:' : 'Local candidate:'}{' '}
                <strong>{candLeft !== null ? candLeft : language === 'es' ? 'Ninguno' : 'None'}</strong>
              </div>
            </div>

            {/* Right Half */}
            <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                {language === 'es' ? 'MITAD DERECHA (A[⌊n/2⌋ .. n - 1])' : 'RIGHT HALF (A[⌊n/2⌋ .. n - 1])'}
              </div>
              <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                [{rightHalf.join(', ')}]
              </div>
              <div style={{ marginTop: '0.35rem', fontSize: '0.85rem' }}>
                {language === 'es' ? 'Candidato local:' : 'Local candidate:'}{' '}
                <strong>{candRight !== null ? candRight : language === 'es' ? 'Ninguno' : 'None'}</strong>
              </div>
            </div>
          </div>

          {/* D&C Verification Table */}
          <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--canvas-bg, var(--surface-hover))' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>{language === 'es' ? 'Candidato Evaluado' : 'Tested Candidate'}</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Frecuencia Global' : 'Global Count'}</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Condición (> n/2)' : 'Condition (> n/2)'}</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Veredicto' : 'Verdict'}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set([candLeft, candRight].filter((c): c is number => c !== null))).map((cand) => {
                  const globalCount = freqMap[cand] || 0;
                  const isWinner = globalCount > threshold;
                  return (
                    <tr key={`dyc-cand-${cand}`} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                        {cand}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {globalCount} / {n} ({Math.round((globalCount / n) * 100)}%)
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                        {globalCount} &gt; {threshold}
                      </td>
                      <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                        {isWinner ? (
                          <strong style={{ color: 'var(--success)' }}>{language === 'es' ? 'MAYORITARIO' : 'MAJORITY'}</strong>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>{language === 'es' ? 'Descartado' : 'Discarded'}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--surface)',
              borderLeft: '4px solid var(--accent)',
              borderRadius: '0 6px 6px 0',
              fontSize: '0.85rem',
              lineHeight: 1.5
            }}
          >
            <strong>{language === 'es' ? 'Principio de División y Conquista:' : 'Divide & Conquer Principle:'}</strong>{' '}
            {language === 'es'
              ? 'Si un elemento es mayoritario en el arreglo global de tamaño n, DEBE ser mayoritario en al menos una de sus dos mitades. Por tanto, la recursión solo necesita verificar a lo sumo 2 candidatos contra el arreglo completo: T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'
              : 'If an element is the majority in the global array of size n, it MUST be the majority in at least one of the two halves. Thus the algorithm only tests at most 2 candidates: T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'}
          </div>
        </div>
      ) : (
        /* Boyer-Moore Voting Arena */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--state-active-bg)',
              border: '1px solid var(--accent)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}
          >
            <strong>{language === 'es' ? 'Argumento de Cancelación en Parejas (Boyer-Moore):' : 'Pair Cancellation Argument (Boyer-Moore):'}</strong>{' '}
            {language === 'es'
              ? 'Si emparejamos dos elementos distintos (x ≠ y) y los eliminamos, la condición de mayoría se preserva estrictamente para el elemento mayoritario (si existe). El algoritmo barre el arreglo en una sola pasada O(n) y espacio O(1).'
              : 'Pairing two distinct elements and eliminating them preserves the majority invariant. Boyer-Moore runs in single pass O(n) and O(1) space.'}
          </div>

          {/* Stepper Table */}
          <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--canvas-bg, var(--surface-hover))' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>i</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Elemento A[i]</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Candidato Provisional</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Contador</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left' }}>Acción de Cancelación / Coincidencia</th>
                </tr>
              </thead>
              <tbody>
                {boyerMooreSteps.map((st) => (
                  <tr key={`bm-step-${st.idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {st.idx}
                    </td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      {st.element}
                    </td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {st.candidate}
                    </td>
                    <td style={{ padding: '0.4rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      {st.count}
                    </td>
                    <td style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                      {language === 'es' ? st.note.es : st.note.en}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem' }}>
            <span>
              {language === 'es' ? 'Candidato superviviente de la pasada lineal:' : 'Surviving candidate from linear pass:'}{' '}
              <strong style={{ color: 'var(--accent)', fontSize: '1rem', fontFamily: 'var(--font-mono)' }}>{bmCandidate}</strong>
            </span>
            <span style={{ marginLeft: '1rem', color: 'var(--text-muted)' }}>
              ({language === 'es' ? 'Requiere 2da pasada de conteo para certificar si es > n/2' : 'Requires 2nd counting pass to verify if > n/2'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

