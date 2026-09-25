import React, { useState } from 'react';
import { DEFAULT_MOM_ARRAY } from '../../engine/algorithms/medianOfMediansTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const MedianOfMediansPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [array, setArray] = useState<number[]>(DEFAULT_MOM_ARRAY);
  const [arrayInputStr, setArrayInputStr] = useState<string>(DEFAULT_MOM_ARRAY.join(', '));
  const [targetK, setTargetK] = useState<number>(7);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const sorted = [...array].sort((a, b) => a - b);
  const validK = Math.max(0, Math.min(array.length - 1, targetK));
  const expectedElement = sorted[validK] ?? sorted[0];

  // Group into 5s
  const groups: number[][] = [];
  for (let i = 0; i < array.length; i += 5) {
    groups.push(array.slice(i, i + 5));
  }
  const medians = groups.map((g) => {
    const s = [...g].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  });
  const sortedMedians = [...medians].sort((a, b) => a - b);
  const pivot = sortedMedians[Math.floor(sortedMedians.length / 2)];

  const lesser = array.filter((x) => x < pivot);
  const equal = array.filter((x) => x === pivot);
  const greater = array.filter((x) => x > pivot);

  const handleRandomize = () => {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    setArray(shuffled);
    setArrayInputStr(shuffled.join(', '));
    markAttempted('median-of-medians-dyc');
  };

  const handlePresetK = (kVal: number) => {
    setTargetK(kVal);
    markAttempted('median-of-medians-dyc');
  };

  const handleArrayInputChange = (val: string) => {
    setArrayInputStr(val);
    setIsCustomMode(true);
    const parsed = val
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    if (parsed.length >= 3) {
      setArray(parsed);
      setTargetK((prev) => Math.min(prev, parsed.length - 1));
      markAttempted('median-of-medians-dyc');
    }
  };

  const handleResetDefault = () => {
    setArray(DEFAULT_MOM_ARRAY);
    setArrayInputStr(DEFAULT_MOM_ARRAY.join(', '));
    setTargetK(7);
    setIsCustomMode(false);
  };

  return (
    <div className="algorithm-playground median-medians-playground" role="region" aria-label="Laboratorio de Mediana de Medianas">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${targetK === 0 ? 'active' : ''}`}
            onClick={() => handlePresetK(0)}
          >
            {language === 'es' ? 'Mínimo (k = 0)' : 'Minimum (k = 0)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${targetK === Math.floor(array.length / 2) ? 'active' : ''}`}
            onClick={() => handlePresetK(Math.floor(array.length / 2))}
          >
            {language === 'es' ? 'Mediana (k = ⌊n/2⌋)' : 'Median (k = ⌊n/2⌋)'}
          </button>
          <button
            type="button"
            className={`btn-preset ${targetK === array.length - 1 ? 'active' : ''}`}
            onClick={() => handlePresetK(array.length - 1)}
          >
            {language === 'es' ? 'Máximo (k = n-1)' : 'Maximum (k = n-1)'}
          </button>
          <button type="button" className="btn-preset" onClick={handleRandomize}>
            {language === 'es' ? 'Reordenar Arreglo' : 'Shuffle Array'}
          </button>
          {isCustomMode && (
            <button type="button" className="btn-preset" onClick={handleResetDefault}>
              {language === 'es' ? 'Restablecer' : 'Reset'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Índice k:' : 'Index k:'}{' '}
            <strong style={{ color: 'var(--accent)' }}>{validK}</strong>
          </span>
          <span>
            {language === 'es' ? 'Elemento esperado:' : 'Expected element:'}{' '}
            <strong style={{ color: '#10b981' }}>{expectedElement}</strong>
          </span>
        </div>
      </div>

      {/* Custom Case Array Input */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', whiteSpace: 'nowrap' }}>
          {language === 'es' ? 'Caso propio (separado por comas):' : 'Custom case (comma-separated):'}
        </span>
        <input
          type="text"
          value={arrayInputStr}
          onChange={(e) => handleArrayInputChange(e.target.value)}
          placeholder="Ej: 12, 3, 5, 7, 4, 19, 26, 22, 1"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="k-slider" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>k:</label>
          <input
            id="k-slider"
            type="range"
            min={0}
            max={Math.max(1, array.length - 1)}
            value={validK}
            onChange={(e) => setTargetK(parseInt(e.target.value, 10))}
            style={{ width: '80px' }}
          />
        </div>
      </div>

      {/* Recurrence Explanation Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem'
        }}
        role="status"
      >
        <strong>{language === 'es' ? 'Fundamento: ¿Por qué Grupos de 5?' : 'Rationale: Why Groups of 5?'}:</strong>{' '}
        {language === 'es'
          ? 'Grupos de 5 generan subproblemas de tamaño n/5 y a lo sumo 7n/10. La suma de razones es 1/5 + 7/10 = 9/10 < 1, lo que colapsa la serie geométrica en O(n) lineal estricto. Si usáramos grupos de 3: 1/3 + 2/3 = 1, la serie no colapsaría y costaría O(n log n).'
          : 'Groups of 5 yield subproblems n/5 and ≤ 7n/10. Sum 1/5 + 7/10 = 9/10 < 1 guarantees geometric convergence to strict linear O(n).'}
      </div>

      {/* SVG BFPRT Column Matrix */}
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)', padding: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.35rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>
            {language === 'es'
              ? 'Matriz BFPRT: Cada columna de 5 se ordena verticalmente. La fila central contiene las medianas.'
              : 'BFPRT Matrix: Each column of 5 is sorted vertically. Center row contains medians.'}
          </span>
          <span style={{ color: '#10b981', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
            {language === 'es' ? 'Poda garantizada ≥ 30%' : 'Guaranteed pruning ≥ 30%'}
          </span>
        </div>

        <svg
          viewBox={`0 0 ${Math.max(460, groups.length * 64 + 40)} 200`}
          style={{ width: '100%', maxWidth: `${Math.max(460, groups.length * 64 + 40)}px`, height: 'auto', display: 'block', margin: '0 auto' }}
          role="img"
          aria-label={language === 'es' ? 'Matriz de columnas de 5 del algoritmo BFPRT' : 'BFPRT columns of 5 matrix'}
        >
          {/* Medians row highlight band */}
          <rect
            x={15}
            y={24 + 2 * 32 - 2}
            width={groups.length * 64 + 10}
            height={32}
            rx={4}
            fill="rgba(56, 189, 248, 0.08)"
            stroke="var(--accent)"
            strokeWidth={1}
            strokeDasharray="4 2"
          />

          {/* Group Columns */}
          {groups.map((grp, colIdx) => {
            const sortedGrp = [...grp].sort((a, b) => a - b);
            const med = medians[colIdx];
            const isPivotCol = med === pivot;
            const x = 20 + colIdx * 64;

            return (
              <g key={`mom-svg-col-${colIdx}`}>
                {/* Column header */}
                <text
                  x={x + 28}
                  y={16}
                  textAnchor="middle"
                  fill={isPivotCol ? '#f59e0b' : 'var(--text-muted)'}
                  fontSize="10px"
                  fontFamily="var(--font-mono)"
                  fontWeight={isPivotCol ? '700' : '600'}
                >
                  G{colIdx + 1}
                </text>

                {/* 5 elements stacked vertically */}
                {sortedGrp.map((val, rowIdx) => {
                  const y = 24 + rowIdx * 32;
                  const isMedCell = rowIdx === Math.floor(sortedGrp.length / 2);
                  const isPivotCell = val === pivot;
                  const isGuaranteedLesser = val < pivot && (isMedCell || rowIdx < 2);
                  const isGuaranteedGreater = val > pivot && (isMedCell || rowIdx > 2);

                  return (
                    <g key={`mom-cell-${colIdx}-${rowIdx}`}>
                      <rect
                        x={x}
                        y={y}
                        width={56}
                        height={28}
                        rx={4}
                        fill={
                          isPivotCell
                            ? '#f59e0b'
                            : isGuaranteedLesser
                            ? 'rgba(56, 189, 248, 0.12)'
                            : isGuaranteedGreater
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'var(--surface)'
                        }
                        stroke={
                          isPivotCell
                            ? '#ffffff'
                            : isMedCell
                            ? 'var(--accent)'
                            : 'var(--border)'
                        }
                        strokeWidth={isPivotCell ? 2.5 : isMedCell ? 1.5 : 1}
                      />
                      <text
                        x={x + 28}
                        y={y + 18}
                        textAnchor="middle"
                        fill={isPivotCell ? '#0f172a' : 'var(--text)'}
                        fontSize="11px"
                        fontWeight={isPivotCell || isMedCell ? '700' : '500'}
                        fontFamily="var(--font-mono)"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Grouping inspection table */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Grupo (5)</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Elementos</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>Mediana del Grupo</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>¿Es Pivote Global?</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((grp, idx) => {
              const med = medians[idx];
              const isPiv = med === pivot;
              return (
                <tr
                  key={`grp-row-${idx}`}
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: isPiv ? 'rgba(245, 158, 11, 0.08)' : 'transparent'
                  }}
                >
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    G{idx + 1}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    [{grp.join(', ')}]
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    {med}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                    {isPiv ? (
                      <strong style={{ color: '#f59e0b' }}>PIVOTE ({pivot})</strong>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3-way partition distribution summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'MENORES QUE PIVOTE (< p)' : 'LESSER THAN PIVOT (< p)'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            {lesser.length} {language === 'es' ? 'elementos' : 'elements'}: [{lesser.join(', ')}]
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: '600' }}>
            {language === 'es' ? 'PIVOTE SELECCIONADO (= p)' : 'SELECTED PIVOT (= p)'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700' }}>
            p = {pivot} ({equal.length} {language === 'es' ? 'elem.' : 'elem.'})
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'MAYORES QUE PIVOTE (> p)' : 'GREATER THAN PIVOT (> p)'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            {greater.length} {language === 'es' ? 'elementos' : 'elements'}: [{greater.join(', ')}]
          </div>
        </div>
      </div>
    </div>
  );
};
