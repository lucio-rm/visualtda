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
    <div className="algorithm-playground karatsuba-playground" role="region" aria-label="Laboratorio de Multiplicación de Karatsuba">
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
          backgroundColor: isMatch ? 'var(--state-solution-bg)' : 'var(--state-conflict-bg)',
          border: `1px solid ${isMatch ? 'var(--success)' : 'var(--error)'}`,
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.9rem',
          color: isMatch ? 'var(--success)' : 'var(--error)'
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
        {' '}({language === 'es' ? 'Multiplicaciones recursivas: exactamente 3 en vez de 4' : 'Recursive multiplications: exactly 3 instead of 4'})
      </div>

      {/* 2x2 Geometric Area Model SVG */}
      <div style={{ backgroundColor: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)', padding: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>
            {language === 'es'
              ? 'Modelo geométrico de áreas: 3 multiplicaciones computan los 4 cuadrantes'
              : 'Geometric area model: 3 multiplications resolve all 4 quadrants'}
          </span>
          <span style={{ color: 'var(--success)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
            T(n) = 3T(n/2) + O(n) ⇒ O(n^1.585)
          </span>
        </div>

        <svg
          viewBox="0 0 540 180"
          style={{ width: '100%', maxWidth: '540px', height: 'auto', display: 'block', margin: '0 auto' }}
          role="img"
          aria-label={language === 'es' ? 'Modelo de áreas de Karatsuba' : 'Karatsuba area model'}
        >
          {/* Outer frame */}
          <rect x={70} y={25} width={400} height={130} rx={6} fill="var(--surface)" stroke="var(--border)" strokeWidth={1.5} />

          {/* Dividing lines */}
          <line x1={270} y1={25} x2={270} y2={155} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="3 3" />
          <line x1={70} y1={90} x2={470} y2={90} stroke="var(--border)" strokeWidth={1.5} strokeDasharray="3 3" />

          {/* Labels for Top & Left factors */}
          <text x={170} y={16} textAnchor="middle" fill="var(--text-muted)" fontSize="13px" fontFamily="var(--font-mono)">
            x₁·10^m ({x1}·{pot})
          </text>
          <text x={370} y={16} textAnchor="middle" fill="var(--text-muted)" fontSize="13px" fontFamily="var(--font-mono)">
            x₀ ({x0})
          </text>

          <text x={60} y={62} textAnchor="end" fill="var(--text-muted)" fontSize="13px" fontFamily="var(--font-mono)">
            y₁ ({y1})
          </text>
          <text x={60} y={127} textAnchor="end" fill="var(--text-muted)" fontSize="13px" fontFamily="var(--font-mono)">
            y₀ ({y0})
          </text>

          {/* Quadrant 1: z2 = x1 * y1 */}
          <rect x={74} y={29} width={192} height={57} rx={4} fill="rgba(37, 99, 235, 0.12)" stroke="var(--accent)" strokeWidth={1.5} />
          <text x={170} y={52} textAnchor="middle" fill="var(--accent)" fontSize="13px" fontWeight="700" fontFamily="var(--font-mono)">
            z₂ = x₁ · y₁
          </text>
          <text x={170} y={72} textAnchor="middle" fill="var(--accent)" fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
            {x1} × {y1} = {z2}
          </text>

          {/* Quadrants 2 & 3: Cross Terms combined as z1 */}
          <rect x={274} y={29} width={192} height={57} rx={4} fill="rgba(217, 119, 6, 0.08)" stroke="var(--warning)" strokeWidth={1} strokeDasharray="4 2" />
          <text x={370} y={62} textAnchor="middle" fill="var(--warning)" fontSize="13px" fontWeight="600" fontFamily="var(--font-mono)">
            x₀ · y₁ = {x0 * y1}
          </text>

          <rect x={74} y={94} width={192} height={57} rx={4} fill="rgba(217, 119, 6, 0.08)" stroke="var(--warning)" strokeWidth={1} strokeDasharray="4 2" />
          <text x={170} y={127} textAnchor="middle" fill="var(--warning)" fontSize="13px" fontWeight="600" fontFamily="var(--font-mono)">
            x₁ · y₀ = {x1 * y0}
          </text>

          {/* Cross terms bridge tag */}
          <rect x={180} y={74} width={180} height={32} rx={6} fill="var(--surface)" stroke="var(--warning)" strokeWidth={1.5} />
          <text x={270} y={94} textAnchor="middle" fill="var(--warning)" fontSize="12px" fontWeight="700" fontFamily="var(--font-mono)">
            z₁ = {zSum} - {z2} - {z0} = {z1}
          </text>

          {/* Quadrant 4: z0 = x0 * y0 */}
          <rect x={274} y={94} width={192} height={57} rx={4} fill="rgba(16, 185, 129, 0.12)" stroke="var(--success)" strokeWidth={1.5} />
          <text x={370} y={117} textAnchor="middle" fill="var(--success)" fontSize="13px" fontWeight="700" fontFamily="var(--font-mono)">
            z₀ = x₀ · y₀
          </text>
          <text x={370} y={137} textAnchor="middle" fill="var(--success)" fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
            {x0} × {y0} = {z0}
          </text>
        </svg>

        {/* Tabular Shifted Recombination Block (Aligned Column Addition) */}
        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.85rem 1rem', marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            {language === 'es' ? 'Alineación de Columnas y Recombinación en Base 10^m:' : 'Column Alignment & Base 10^m Recombination:'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', maxWidth: '420px', margin: '0 auto', padding: '0.75rem 1.25rem', background: 'var(--bg)', borderRadius: '6px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>z₂ · 10^{2 * m} ({z2} × 10^{2 * m}):</span>
              <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{z2 * Math.pow(10, 2 * m)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ color: 'var(--warning)', fontWeight: 600 }}>+ z₁ · 10^{m} ({z1} × 10^{m}):</span>
              <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{z1 * pot}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '2px solid var(--border)', paddingBottom: '0.35rem' }}>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>+ z₀ · 10⁰ ({z0} × 1):</span>
              <span style={{ fontWeight: 700, color: 'var(--success)' }}>{z0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: '0.25rem' }}>
              <span style={{ fontWeight: 800, color: 'var(--text)' }}>Total (x × y):</span>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--success)' }}>{finalResult}</span>
            </div>
          </div>
        </div>
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
