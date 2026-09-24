import React, { useState } from 'react';
import {
  DEFAULT_RNA_SEQUENCE,
  isValidPair
} from '../../engine/algorithms/rnaSecondaryStructureTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const RnaSecondaryStructurePlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [sequence, setSequence] = useState<string>(DEFAULT_RNA_SEQUENCE);

  const cleanSeq = sequence.toUpperCase().replace(/[^AUCG]/g, '');
  const n = cleanSeq.length;

  // Run dynamic programming client-side to compute max pairs
  const dp: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let k = 5; k <= n; k++) {
    for (let i = 0; i <= n - k; i++) {
      const j = i + k - 1;
      let maxP = dp[i][j - 1];
      for (let t = i; t < j - 4; t++) {
        if (isValidPair(cleanSeq[t], cleanSeq[j])) {
          const leftCost = t > i ? dp[i][t - 1] : 0;
          const centerCost = dp[t + 1][j - 1];
          maxP = Math.max(maxP, 1 + leftCost + centerCost);
        }
      }
      dp[i][j] = maxP;
    }
  }

  const maxPairs = n >= 5 ? dp[0][n - 1] : 0;

  // Reconstruct pairs
  const computedPairs: Array<[number, number]> = [];
  function reconstruct(i: number, j: number) {
    if (j <= i + 4) return;
    if (dp[i][j] === dp[i][j - 1]) {
      reconstruct(i, j - 1);
      return;
    }
    for (let t = i; t < j - 4; t++) {
      if (isValidPair(cleanSeq[t], cleanSeq[j])) {
        const leftCost = t > i ? dp[i][t - 1] : 0;
        const centerCost = dp[t + 1][j - 1];
        if (dp[i][j] === 1 + leftCost + centerCost) {
          computedPairs.push([t, j]);
          if (t > i) reconstruct(i, t - 1);
          reconstruct(t + 1, j - 1);
          return;
        }
      }
    }
  }
  if (n >= 5) reconstruct(0, n - 1);

  const handlePreset = (seq: string) => {
    setSequence(seq);
    markAttempted('rna-secondary-structure-dp');
  };

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Estructura Secundaria de ARN">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className="btn-preset active"
            onClick={() => handlePreset('ACCGGUAGU')}
          >
            {language === 'es' ? 'Horquilla (ACCGGUAGU)' : 'Hairpin (ACCGGUAGU)'}
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={() => handlePreset('AUGCAUGCUU')}
          >
            {language === 'es' ? '10 Bases (AUGCAUGCUU)' : '10 Bases (AUGCAUGCUU)'}
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={() => handlePreset('AUGC')}
          >
            {language === 'es' ? 'Giro Muy Cerrado (len < 5)' : 'Sharp Turn (len < 5)'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Longitud:' : 'Length:'} <strong>{n}</strong>
          </span>
          <span>
            {language === 'es' ? 'Pares óptimos:' : 'Optimal pairs:'}{' '}
            <strong style={{ color: '#10b981' }}>{maxPairs}</strong>
          </span>
        </div>
      </div>

      {/* Interactive Sequence Input */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
          {language === 'es' ? 'Secuencia de ARN {A, U, C, G}:' : 'RNA Sequence {A, U, C, G}:'}
        </span>
        <input
          type="text"
          value={sequence}
          onChange={(e) => {
            setSequence(e.target.value.toUpperCase());
            markAttempted('rna-secondary-structure-dp');
          }}
          placeholder="ACCGGUAGU"
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            backgroundColor: 'var(--bg)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '2px'
          }}
        />
      </div>

      {/* Biological Invariant Notes Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: n < 5 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          border: `1px solid ${n < 5 ? '#f59e0b' : '#10b981'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem'
        }}
        role="status"
      >
        {n < 5 ? (
          <>
            <strong>{language === 'es' ? 'Restricción de Giros Cerrados (No sharp turns)' : 'No Sharp Turns Rule'}</strong>:{' '}
            {language === 'es'
              ? 'La molécula de ARN requiere al menos 4 bases intermedias sin emparejar para poder doblarse sobre sí misma sin romperse (t < j - 4). Para n < 5, el resultado es estrictamente 0 pares.'
              : 'RNA molecules require at least 4 intervening unpaired bases to bend without structural strain. For n < 5, result is 0.'}
          </>
        ) : (
          <>
            <strong>{language === 'es' ? 'Estructura Biológica Válida' : 'Valid Biological Structure'}</strong>:{' '}
            {language === 'es'
              ? `Se detectaron ${maxPairs} pares complementarios Watson-Crick estrictamente no cruzados.`
              : `${maxPairs} complementary Watson-Crick non-crossing pairs detected.`}
          </>
        )}
      </div>

      {/* Paired bases summary */}
      {computedPairs.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {computedPairs.map(([ti, tj], idx) => (
            <span
              key={`pg-pair-${idx}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <strong>{cleanSeq[ti]}</strong>[{ti}] ↔ <strong>{cleanSeq[tj]}</strong>[{tj}]
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
