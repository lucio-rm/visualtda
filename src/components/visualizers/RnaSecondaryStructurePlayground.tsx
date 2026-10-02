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

  const baseColors: Record<string, string> = {
    A: 'var(--accent)', // sky
    U: 'var(--warning)', // amber
    C: 'var(--success)', // emerald
    G: '#ec4899'  // pink
  };

  const handlePreset = (seq: string) => {
    setSequence(seq);
    markAttempted('rna-secondary-structure-dp');
  };

  const handleCycleBase = (index: number) => {
    const cycleMap: Record<string, string> = { A: 'U', U: 'C', C: 'G', G: 'A' };
    const current = cleanSeq[index] || 'A';
    const nextBase = cycleMap[current] || 'A';
    const chars = cleanSeq.split('');
    chars[index] = nextBase;
    setSequence(chars.join(''));
    markAttempted('rna-secondary-structure-dp');
  };

  const handleAppendBase = (base: string) => {
    if (n >= 14) return;
    setSequence(cleanSeq + base);
    markAttempted('rna-secondary-structure-dp');
  };

  const handleRemoveLast = () => {
    if (n <= 1) return;
    setSequence(cleanSeq.slice(0, -1));
    markAttempted('rna-secondary-structure-dp');
  };

  // SVG dimensions
  const svgWidth = 560;
  const svgHeight = 175;
  const padLeft = 40;
  const spacing = n > 1 ? (svgWidth - 2 * padLeft) / (n - 1) : 0;
  const baselineY = 135;

  return (
    <div className="algorithm-playground rna-playground" role="region" aria-label="Laboratorio de Estructura Secundaria de ARN">
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
            <strong style={{ color: 'var(--success)' }}>{maxPairs}</strong>
          </span>
        </div>
      </div>

      {/* SVG Interactive Secondary Structure Arc Diagram */}
      <div style={{ backgroundColor: 'var(--canvas-bg)', borderRadius: '6px', border: '1px solid var(--border)', padding: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.35rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>
            {language === 'es'
              ? 'Estructura secundaria en arcos (haz clic sobre cualquier base para rotar A → U → C → G):'
              : 'Secondary structure arc diagram (click any base to cycle A → U → C → G):'}
          </span>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {['A', 'U', 'C', 'G'].map((b) => (
              <button
                key={`btn-add-${b}`}
                type="button"
                onClick={() => handleAppendBase(b)}
                disabled={n >= 14}
                style={{ padding: '0.1rem 0.35rem', fontSize: '0.8125rem', borderRadius: '3px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', color: baseColors[b], cursor: 'pointer', fontWeight: '700' }}
              >
                +{b}
              </button>
            ))}
            <button
              type="button"
              onClick={handleRemoveLast}
              disabled={n <= 1}
              style={{ padding: '0.1rem 0.35rem', fontSize: '0.8125rem', borderRadius: '3px', border: '1px solid var(--border)', backgroundColor: 'transparent', color: 'var(--error)', cursor: 'pointer' }}
              title={language === 'es' ? 'Eliminar última base' : 'Remove last base'}
            >
              ×
            </button>
          </div>
        </div>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
          role="img"
          aria-label={language === 'es' ? 'Diagrama de arcos de estructura secundaria de ARN' : 'RNA secondary structure arc diagram'}
        >
          {/* Backbone strand line */}
          <line
            x1={padLeft - 15}
            y1={baselineY}
            x2={n > 1 ? padLeft + (n - 1) * spacing + 15 : padLeft + 15}
            y2={baselineY}
            stroke="var(--border)"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Arcs for paired bases */}
          {computedPairs.map(([ti, tj], idx) => {
            const x1 = padLeft + ti * spacing;
            const x2 = padLeft + tj * spacing;
            const arcH = Math.min(85, ((tj - ti) * spacing) * 0.45);

            return (
              <g key={`rna-arc-${idx}`}>
                <path
                  d={`M ${x1} ${baselineY - 14} Q ${(x1 + x2) / 2} ${baselineY - 14 - arcH * 1.8} ${x2} ${baselineY - 14}`}
                  fill="none"
                  stroke="var(--success)"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* Bases along the strand */}
          {cleanSeq.split('').map((base, idx) => {
            const x = n > 1 ? padLeft + idx * spacing : padLeft;
            const color = baseColors[base] || 'var(--text)';
            const isPaired = computedPairs.some(([ti, tj]) => ti === idx || tj === idx);

            return (
              <g
                key={`base-node-${idx}`}
                onClick={() => handleCycleBase(idx)}
                style={{ cursor: 'pointer' }}
              >
                {/* Node circle */}
                <circle
                  cx={x}
                  cy={baselineY}
                  r={14}
                  fill={isPaired ? 'var(--surface)' : 'var(--canvas-bg)'}
                  stroke={isPaired ? 'var(--success)' : color}
                  strokeWidth={isPaired ? 2.5 : 1.5}
                />
                {/* Base letter */}
                <text
                  x={x}
                  y={baselineY + 4}
                  textAnchor="middle"
                  fill={color}
                  fontSize="13px"
                  fontWeight="800"
                  fontFamily="var(--font-mono)"
                >
                  {base}
                </text>
                {/* Index subscript */}
                <text
                  x={x}
                  y={baselineY + 26}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="13px"
                  fontFamily="var(--font-mono)"
                >
                  {idx}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Biological Invariant Notes Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: n < 5 ? 'var(--state-candidate-bg)' : 'var(--state-solution-bg)',
          border: `1px solid ${n < 5 ? 'var(--warning)' : 'var(--success)'}`,
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
                backgroundColor: 'var(--state-solution-bg)',
                border: '1px solid var(--success)',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <strong style={{ color: baseColors[cleanSeq[ti]] }}>{cleanSeq[ti]}</strong>[{ti}] ↔ <strong style={{ color: baseColors[cleanSeq[tj]] }}>{cleanSeq[tj]}</strong>[{tj}]
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

