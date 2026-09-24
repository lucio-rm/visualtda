import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

type PresetType = 'clear' | 'edge' | 'distinct' | 'custom';

export const MajorityElementPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [activePreset, setActivePreset] = useState<PresetType>('clear');
  const [inputStr, setInputStr] = useState<string>('2, 2, 1, 1, 2, 2, 3, 2');

  // Parse input
  const array = inputStr
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !isNaN(Number(s)))
    .map(Number);

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

  const handlePreset = (type: PresetType, arr: number[]) => {
    setActivePreset(type);
    setInputStr(arr.join(', '));
    markAttempted('majority-element-dyc');
  };

  const handleCustomInput = (val: string) => {
    setActivePreset('custom');
    setInputStr(val);
    markAttempted('majority-element-dyc');
  };

  return (
    <div className="algorithm-playground majority-element-playground" role="region" aria-label="Laboratorio de Elemento Mayoritario">
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
            {language === 'es' ? 'Caso Límite (Exacto n/2 - No mayoritario)' : 'Edge Case (Exact n/2 - No majority)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${activePreset === 'distinct' ? 'active' : ''}`}
            onClick={() => handlePreset('distinct', [1, 2, 3, 4, 5, 6])}
          >
            {language === 'es' ? 'Todos Distintos (Sin mayoritario)' : 'All Distinct (No majority)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${activePreset === 'custom' ? 'active' : ''}`}
            onClick={() => setActivePreset('custom')}
          >
            {language === 'es' ? 'Caso propio' : 'Custom Case'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            n = <strong>{n}</strong>
          </span>
          <span>
            {language === 'es' ? 'Umbral (> n/2):' : 'Threshold (> n/2):'}{' '}
            <strong style={{ color: 'var(--accent)' }}>{`> ${threshold}`}</strong>
          </span>
        </div>
      </div>

      {/* Array Text Input */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
          {language === 'es' ? 'Arreglo editable:' : 'Editable array:'}
        </span>
        <input
          type="text"
          value={inputStr}
          onChange={(e) => handleCustomInput(e.target.value)}
          placeholder="Ej: 3, 3, 4, 2, 3, 3, 3"
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)'
          }}
        />
      </div>

      {/* Visual Representation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Frecuencias de Elementos Observadas:' : 'Observed Element Frequencies:'}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {Object.entries(freqMap).map(([valStr, count]) => {
            const isMaj = count > threshold;
            return (
              <div
                key={`freq-${valStr}`}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  border: isMaj ? '2px solid #10b981' : '1px solid var(--border)',
                  backgroundColor: isMaj ? 'rgba(16, 185, 129, 0.1)' : 'var(--surface)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  minWidth: '70px'
                }}
              >
                <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{valStr}</span>
                <span style={{ fontSize: '0.75rem', color: isMaj ? '#10b981' : 'var(--text-muted)' }}>
                  {count} / {n} ({Math.round((count / n) * 100)}%)
                </span>
                {isMaj && (
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#10b981', marginTop: '0.2rem' }}>
                    MAYORITARIO
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Result Status */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: majorityElement !== null ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
          border: `1px solid ${majorityElement !== null ? '#10b981' : '#ef4444'}`,
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}
      >
        {majorityElement !== null ? (
          <div>
            <strong>{language === 'es' ? 'Elemento Mayoritario Encontrado:' : 'Majority Element Found:'}</strong>{' '}
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#10b981' }}>{majorityElement}</span>{' '}
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

      {/* D&C Intuition */}
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
          ? 'Si un elemento es mayoritario en el arreglo global de tamaño n, DEBE ser mayoritario en al menos una de sus dos mitades (izquierda o derecha). Por tanto, la recursión solo necesita verificar a lo sumo 2 candidatos contra el arreglo completo: T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'
          : 'If an element is the majority in the global array of size n, it MUST be the majority in at least one of the two halves. Thus the algorithm only tests at most 2 candidates: T(n) = 2T(n/2) + O(n) ⇒ O(n log n).'}
      </div>
    </div>
  );
};
