import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const MajorityElementPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

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

  const handlePreset = (arr: number[]) => {
    setInputStr(arr.join(', '));
    markAttempted('majority-element-dyc');
  };

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Elemento Mayoritario">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className="btn-preset active"
            onClick={() => handlePreset([2, 2, 1, 1, 2, 2, 3, 2])}
          >
            {language === 'es' ? 'Mayoritario Claro (> n/2)' : 'Clear Majority (> n/2)'}
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={() => handlePreset([4, 4, 4, 1, 2, 3])}
          >
            {language === 'es' ? 'Caso Límite (Exacto n/2 - No mayoritario)' : 'Edge Case (Exact n/2 - No majority)'}
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={() => handlePreset([1, 2, 3, 4, 5, 6])}
          >
            {language === 'es' ? 'Todos Distintos (Sin mayoritario)' : 'All Distinct (No majority)'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            n = <strong>{n}</strong>
          </span>
          <span>
            {language === 'es' ? 'Umbral (> n/2):' : 'Threshold (> n/2):'}{' '}
            <strong style={{ color: 'var(--accent)' }}>&gt; {threshold}</strong>
          </span>
        </div>
      </div>

      {/* Array Text Input */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
          {language === 'es' ? 'Arreglo (separado por comas):' : 'Array (comma-separated):'}
        </span>
        <input
          type="text"
          value={inputStr}
          onChange={(e) => {
            setInputStr(e.target.value);
            markAttempted('majority-element-dyc');
          }}
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

      {/* Verdict Alert Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: majorityElement !== null ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${majorityElement !== null ? '#10b981' : '#f59e0b'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          color: majorityElement !== null ? '#10b981' : '#f59e0b'
        }}
        role="status"
      >
        {majorityElement !== null ? (
          <>
            ✓ <strong>{language === 'es' ? 'Elemento Mayoritario Confirmado' : 'Majority Element Confirmed'}</strong>:{' '}
            {language === 'es'
              ? `El elemento ${majorityElement} aparece ${freqMap[majorityElement]} veces en un arreglo de tamaño ${n} (${Math.round((freqMap[majorityElement] / n) * 100)}% > 50%).`
              : `Element ${majorityElement} appears ${freqMap[majorityElement]} times in size ${n} (${Math.round((freqMap[majorityElement] / n) * 100)}% > 50%).`}
          </>
        ) : (
          <>
            <strong>{language === 'es' ? 'No existe elemento mayoritario' : 'No majority element exists'}</strong>:{' '}
            {language === 'es'
              ? `Ningún elemento supera estrictamente ${threshold} apariciones. Nota académica: una "pluralidad" (el elemento más frecuente) no califica como mayoritario si no supera el 50% absoluto.`
              : `No element strictly exceeds ${threshold} occurrences.`}
          </>
        )}
      </div>

      {/* Frequency Tally Table */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Elemento' : 'Element'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Frecuencia' : 'Frequency'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Porcentaje' : 'Percentage'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? '¿Es Mayoritario? (> n/2)' : 'Is Majority? (> n/2)'}</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(freqMap)
              .sort((a, b) => b[1] - a[1])
              .map(([valStr, count]) => {
                const val = Number(valStr);
                const isMaj = val === majorityElement;
                const pct = n > 0 ? Math.round((count / n) * 100) : 0;

                return (
                  <tr
                    key={valStr}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      backgroundColor: isMaj ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                      {val}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {count}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {pct}%
                    </td>
                    <td
                      style={{
                        padding: '0.5rem 0.75rem',
                        textAlign: 'center',
                        fontWeight: '700',
                        color: isMaj ? '#10b981' : 'var(--text-muted)'
                      }}
                    >
                      {isMaj ? '✓ SÍ / YES' : '✗ No'}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
