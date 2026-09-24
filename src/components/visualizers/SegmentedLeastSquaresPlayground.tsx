import React, { useState } from 'react';
import {
  DEFAULT_SLS_POINTS,
  fitLineSegment
} from '../../engine/algorithms/segmentedLeastSquaresTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const SegmentedLeastSquaresPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markCompleted } = useStudentProgress();

  const [costC, setCostC] = useState<number>(3.5);
  const points = DEFAULT_SLS_POINTS;
  const n = points.length;

  // Run dynamic programming client-side for costC
  const e: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      e[i][j] = fitLineSegment(points, i, j).error;
    }
  }

  const opt = Array(n + 1).fill(0);
  const origin = Array(n + 1).fill(0);

  for (let j = 1; j <= n; j++) {
    let minCost = Infinity;
    let bestI = 1;
    for (let i = 1; i <= j; i++) {
      const cand = e[i - 1][j - 1] + costC + opt[i - 1];
      if (cand < minCost) {
        minCost = cand;
        bestI = i;
      }
    }
    opt[j] = Math.round(minCost * 100) / 100;
    origin[j] = bestI;
  }

  // Reconstruct partition
  const partitionRanges: Array<[number, number]> = [];
  let curr = n;
  while (curr > 0) {
    const startIdx = origin[curr] - 1;
    const endIdx = curr - 1;
    partitionRanges.unshift([startIdx, endIdx]);
    curr = origin[curr] - 1;
  }

  let totalError = 0;
  for (const [st, en] of partitionRanges) {
    totalError += e[st][en];
  }
  totalError = Math.round(totalError * 100) / 100;
  const totalPenalty = Math.round(partitionRanges.length * costC * 100) / 100;

  const handlePresetC = (cVal: number) => {
    setCostC(cVal);
    markCompleted('segmented-least-squares-dp');
  };

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Mínimos Cuadrados Segmentados">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${costC <= 1.0 ? 'active' : ''}`}
            onClick={() => handlePresetC(0.8)}
          >
            {language === 'es' ? 'C Bajo (0.8) - Muchos Segmentos' : 'Low C (0.8) - Many Segments'}
          </button>
          <button
            type="button"
            className={`btn-preset ${costC === 3.5 ? 'active' : ''}`}
            onClick={() => handlePresetC(3.5)}
          >
            {language === 'es' ? 'C Óptimo (3.5) - Balance Ideal' : 'Optimal C (3.5) - Ideal Balance'}
          </button>
          <button
            type="button"
            className={`btn-preset ${costC >= 15 ? 'active' : ''}`}
            onClick={() => handlePresetC(18.0)}
          >
            {language === 'es' ? 'C Alto (18.0) - Un Solo Segmento' : 'High C (18.0) - Single Line'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Segmentos resultantes:' : 'Resulting segments:'}{' '}
            <strong style={{ color: 'var(--accent)' }}>{partitionRanges.length}</strong>
          </span>
          <span>
            {language === 'es' ? 'Costo total:' : 'Total cost:'}{' '}
            <strong style={{ color: '#10b981' }}>{opt[n]}</strong>
          </span>
        </div>
      </div>

      {/* Slider for C */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span>
            {language === 'es' ? 'Ajustar penalización por segmento (C):' : 'Adjust segment penalty (C):'}{' '}
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{costC}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            {costC < 2
              ? language === 'es' ? 'Prioriza ajuste fino (bajo error)' : 'Prioritizes fine fit'
              : costC > 10
              ? language === 'es' ? 'Prioriza simplicidad (pocos segmentos)' : 'Prioritizes simplicity'
              : language === 'es' ? 'Compromiso balanceado' : 'Balanced compromise'}
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={20.0}
          step={0.5}
          value={costC}
          onChange={(e) => {
            setCostC(Number(e.target.value));
            markCompleted('segmented-least-squares-dp');
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Trade-off summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'ERROR RESIDUAL TOTAL' : 'TOTAL RESIDUAL ERROR'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700' }}>
            ∑ e_i,j = {totalError}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'PENALIZACIÓN TOTAL (C × k)' : 'TOTAL PENALTY (C × k)'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700' }}>
            {costC} × {partitionRanges.length} = {totalPenalty}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'COSTO TOTAL OPT(n)' : 'TOTAL OPT(n) COST'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
            {opt[n]}
          </div>
        </div>
      </div>

      {/* Segments breakdown */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Segmento' : 'Segment'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Puntos Abarcados' : 'Points Covered'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Error Cuadrático e_i,j' : 'Squared Error e_i,j'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Costo (e_i,j + C)' : 'Cost (e_i,j + C)'}</th>
            </tr>
          </thead>
          <tbody>
            {partitionRanges.map(([st, en], idx) => {
              const segErr = e[st][en];
              const segCost = Math.round((segErr + costC) * 100) / 100;
              return (
                <tr key={`seg-part-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    p{st + 1} ({points[st].x}, {points[st].y}) → p{en + 1} ({points[en].x}, {points[en].y})
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {segErr}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    {segCost}
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
