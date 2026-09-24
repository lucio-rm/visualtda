import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const KaratsubaPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [inputX, setInputX] = useState<number>(5678);
  const [inputY, setInputY] = useState<number>(1234);

  // Compute Karatsuba steps for current inputs
  const strX = Math.abs(inputX).toString();
  const strY = Math.abs(inputY).toString();
  const n = Math.max(strX.length, strY.length);
  const m = Math.floor(n / 2);
  const pot = Math.pow(10, m);

  const x1 = Math.floor(inputX / pot);
  const x0 = inputX % pot;
  const y1 = Math.floor(inputY / pot);
  const y0 = inputY % pot;

  const z2 = x1 * y1;
  const z0 = x0 * y0;
  const sumX = x1 + x0;
  const sumY = y1 + y0;
  const zSum = sumX * sumY;
  const z1 = zSum - z2 - z0;
  const finalResult = z2 * Math.pow(10, 2 * m) + z1 * pot + z0;
  const standardResult = inputX * inputY;
  const isMatch = finalResult === standardResult;

  const handleRun = () => {
    if (isMatch) {
      markAttempted('karatsuba-dyc');
    }
  };

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de Multiplicación de Karatsuba">
      <div className="sdk-pg-controls">
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{language === 'es' ? 'Factor X:' : 'Factor X:'}</span>
            <input
              type="number"
              min={1}
              max={9999999}
              value={inputX}
              onChange={(e) => {
                setInputX(Number(e.target.value));
                handleRun();
              }}
              style={{
                width: '120px',
                padding: '0.3rem 0.5rem',
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </label>

          <label style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>{language === 'es' ? 'Factor Y:' : 'Factor Y:'}</span>
            <input
              type="number"
              min={1}
              max={9999999}
              value={inputY}
              onChange={(e) => {
                setInputY(Number(e.target.value));
                handleRun();
              }}
              style={{
                width: '120px',
                padding: '0.3rem 0.5rem',
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)'
              }}
            />
          </label>

          <div className="sdk-pg-presets">
            <button
              type="button"
              className="btn-preset"
              onClick={() => {
                setInputX(987654);
                setInputY(123456);
                handleRun();
              }}
            >
              {language === 'es' ? '6 dígitos' : '6 digits'}
            </button>
            <button
              type="button"
              className="btn-preset"
              onClick={() => {
                setInputX(99);
                setInputY(88);
                handleRun();
              }}
            >
              {language === 'es' ? '2 dígitos' : '2 digits'}
            </button>
          </div>
        </div>
      </div>

      {/* Result Confirmation Banner */}
      <div
        style={{
          padding: '0.75rem 1rem',
          backgroundColor: isMatch ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isMatch ? '#10b981' : '#ef4444'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          color: isMatch ? '#10b981' : '#ef4444'
        }}
        role="status"
      >
        <strong>
          {isMatch
            ? (language === 'es' ? '[Verificado] Resultado Correcto' : '[Verified] Correct Result')
            : (language === 'es' ? '[Error] Inconsistencia en Descomposición' : '[Error] Decomposition Inconsistency')}
          :
        </strong>{' '}
        {inputX} × {inputY} ={' '}
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{finalResult}</span>
        {' '}({language === 'es' ? 'Multiplicaciones recursivas: exactamente 3' : 'Recursive multiplications: exactly 3'})
      </div>

      {/* Breakdown Decomposition Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? '1. PARTICIÓN EN BASE 10^m' : '1. SPLIT AT BASE 10^m'}
          </div>
          <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            m = ⌊{n}/2⌋ = {m} (10^{m} = {pot})<br />
            x = {x1}·10^{m} + {x0}<br />
            y = {y1}·10^{m} + {y0}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? '2. MULTIPLICACIÓN 1: z₂' : '2. MULTIPLICATION 1: z₂'}
          </div>
          <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            z₂ = x₁ · y₁<br />
            z₂ = {x1} · {y1} = <strong>{z2}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? '3. MULTIPLICACIÓN 2: z₀' : '3. MULTIPLICATION 2: z₀'}
          </div>
          <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            z₀ = x₀ · y₀<br />
            z₀ = {x0} · {y0} = <strong>{z0}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? '4. MULTIPLICACIÓN 3: z_sum' : '4. MULTIPLICATION 3: z_sum'}
          </div>
          <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            z_sum = ({x1}+{x0}) · ({y1}+{y0})<br />
            z_sum = {sumX} · {sumY} = <strong>{zSum}</strong>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? '5. TRUCO ALGEBRAICO: z₁' : '5. ALGEBRAIC TRICK: z₁'}
          </div>
          <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            z₁ = z_sum - z₂ - z₀<br />
            z₁ = {zSum} - {z2} - {z0} = <strong>{z1}</strong><br />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              (Equivale a x₁y₀ + x₀y₁)
            </span>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? '6. RECOMBINACIÓN FINAL' : '6. FINAL COMBINATION'}
          </div>
          <div style={{ marginTop: '0.35rem', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
            z₂·10^{2*m} + z₁·10^{m} + z₀<br />
            = {z2 * Math.pow(10, 2 * m)} + {z1 * pot} + {z0}<br />
            = <strong>{finalResult}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
