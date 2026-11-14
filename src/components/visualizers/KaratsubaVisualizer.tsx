import React, { useMemo } from 'react';
import { TraceScrubber } from '../TraceScrubber';
import {
  generateKaratsubaTrace,
  KaratsubaStepData
} from '../../engine/algorithms/karatsubaTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './KaratsubaVisualizer.css';

export const KaratsubaVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateKaratsubaTrace(5678, 1234), []);

  const {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed
  } = useTraceTimeline<KaratsubaStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const x = data?.x ?? 5678;
  const y = data?.y ?? 1234;
  const m = data?.m ?? 2;
  const x1 = data?.x1 ?? 56;
  const x0 = data?.x0 ?? 78;
  const y1 = data?.y1 ?? 12;
  const y0 = data?.y0 ?? 34;
  const z2 = data?.z2;
  const z0 = data?.z0;
  const zSum = data?.zSum;
  const z1 = data?.z1;
  const result = data?.result;
  const subcalc = data?.currentSubcalc ?? 'NONE';
  const multCount = data?.multiplicationCount ?? 0;
  const action = data?.action || 'INIT';
  const description = data?.description;

  return (
    <div
      className="karatsuba-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador del Algoritmo de Karatsuba' : 'Karatsuba algorithm visualizer'}
    >
      {/* Metrics Row */}
      <div className="kt-metrics-row">
        <div className="kt-metric-badge">
          <span>{language === 'es' ? 'Operación:' : 'Operation:'}</span>
          <strong>{x} × {y}</strong>
        </div>
        <div className="kt-metric-badge">
          <span>{language === 'es' ? 'Multiplicaciones Realizadas:' : 'Multiplications Used:'}</span>
          <strong style={{ color: 'var(--success)' }}>{multCount} / 3</strong>
        </div>
        <div className="kt-metric-badge">
          <span>{language === 'es' ? 'Ahorro vs Escolar (4 mult):' : 'Saved vs Naive (4 mult):'}</span>
          <strong style={{ color: 'var(--accent)' }}>{language === 'es' ? '1 de 4 (25%)' : '1 of 4 (25%)'}</strong>
        </div>
        <div className="kt-metric-badge kt-action-badge">
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Algebraic Structure Canvas */}
      <div className="kt-canvas-container" style={{ background: 'var(--canvas-bg, var(--surface-light))', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <svg
          viewBox="0 0 780 305"
          style={{
            width: '100%',
            maxWidth: 'min(100%, 680px, calc((100vh - 340px) * 2.5))',
            maxHeight: 'min(320px, calc(100vh - 340px))',
            height: 'auto',
            aspectRatio: '780 / 305',
            display: 'block',
            margin: '0 auto'
          }}
          role="img"
          aria-label={language === 'es' ? 'Diagrama de recursión de Karatsuba' : 'Karatsuba recursion diagram'}
        >
          {/* Root Multiplication Node */}
          <rect x={275} y={10} width={230} height={52} rx={8} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2.5} />
          <text x={390} y={32} textAnchor="middle" fill="var(--text)" fontSize="15px" fontWeight="800" fontFamily="var(--font-mono)">
            {x} × {y}
          </text>
          <text x={390} y={50} textAnchor="middle" fill="var(--text-muted)" fontSize="13px" fontFamily="var(--font-mono)">
            x₁={x1}, x₀={x0} | y₁={y1}, y₀={y0} (m={m})
          </text>

          {/* Connectors to 3 Karatsuba branches */}
          <path d="M 330 62 L 135 105" stroke="var(--graph-edge)" strokeWidth={2.5} fill="none" />
          <path d="M 390 62 L 390 105" stroke="var(--graph-edge)" strokeWidth={2.5} fill="none" />
          <path d="M 450 62 L 645 105" stroke="var(--graph-edge)" strokeWidth={2.5} fill="none" />

          {/* Branch 1: z2 = x1 * y1 */}
          <g>
            <rect
              x={20}
              y={105}
              width={230}
              height={72}
              rx={8}
              fill={subcalc === 'Z2' ? 'var(--accent-subtle)' : 'var(--surface)'}
              stroke="var(--accent)"
              strokeWidth={subcalc === 'Z2' ? 2.5 : 1.5}
            />
            <text x={135} y={127} textAnchor="middle" fill="var(--accent)" fontSize="12px" fontWeight="700">
              {language === 'es' ? '1. Término Alto (z₂)' : '1. High Term (z₂)'}
            </text>
            <text x={135} y={154} textAnchor="middle" fill="var(--accent)" fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
              {x1} × {y1} = {z2 !== null && z2 !== undefined ? z2 : '—'}
            </text>
          </g>

          {/* Branch 2: Cross Product = (x1+x0)*(y1+y0) */}
          <g>
            <rect
              x={275}
              y={105}
              width={230}
              height={72}
              rx={8}
              fill={subcalc === 'ZSUM' || subcalc === 'Z1' ? 'var(--warning-bg)' : 'var(--surface)'}
              stroke="var(--warning)"
              strokeWidth={subcalc === 'ZSUM' || subcalc === 'Z1' ? 2.5 : 1.5}
            />
            <text x={390} y={124} textAnchor="middle" fill="var(--warning)" fontSize="12px" fontWeight="700">
              {language === 'es' ? '2. Producto Cruzado (P)' : '2. Cross Product (P)'}
            </text>
            <text x={390} y={143} textAnchor="middle" fill="var(--warning)" fontSize="12px" fontWeight="700" fontFamily="var(--font-mono)">
              ({x1}+{x0}) × ({y1}+{y0})
            </text>
            <text x={390} y={163} textAnchor="middle" fill="var(--warning)" fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
              = {zSum !== null && zSum !== undefined ? zSum : '—'}
            </text>
          </g>

          {/* Branch 3: z0 = x0 * y0 */}
          <g>
            <rect
              x={530}
              y={105}
              width={230}
              height={72}
              rx={8}
              fill={subcalc === 'Z0' ? 'var(--success-bg)' : 'var(--surface)'}
              stroke="var(--success)"
              strokeWidth={subcalc === 'Z0' ? 2.5 : 1.5}
            />
            <text x={645} y={127} textAnchor="middle" fill="var(--success)" fontSize="12px" fontWeight="700">
              {language === 'es' ? '3. Término Bajo (z₀)' : '3. Low Term (z₀)'}
            </text>
            <text x={645} y={154} textAnchor="middle" fill="var(--success)" fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
              {x0} × {y0} = {z0 !== null && z0 !== undefined ? z0 : '—'}
            </text>
          </g>

          {/* Recombination & Middle Term Bar */}
          <g>
            <rect
              x={20}
              y={195}
              width={740}
              height={85}
              rx={10}
              fill={subcalc === 'COMBINE' || result !== null ? 'rgba(37, 99, 235, 0.12)' : 'var(--surface)'}
              stroke={subcalc === 'COMBINE' || result !== null ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={subcalc === 'COMBINE' || result !== null ? 2 : 1.5}
            />
            <text x={390} y={224} textAnchor="middle" fill="var(--text)" fontSize="13px" fontWeight="600" fontFamily="var(--font-mono)">
              {language === 'es' ? '4. Término Medio:' : '4. Middle Term:'} z₁ ={' '}
              <tspan fill="#0d9488" fontWeight="700">P</tspan> -{' '}
              <tspan fill="var(--accent)" fontWeight="700">z₂</tspan> -{' '}
              <tspan fill="var(--success)" fontWeight="700">z₀</tspan> = ({' '}
              <tspan fill="#0d9488" fontWeight="700">{zSum ?? 'P'}</tspan> -{' '}
              <tspan fill="var(--accent)" fontWeight="700">{z2 ?? 'z₂'}</tspan> -{' '}
              <tspan fill="var(--success)" fontWeight="700">{z0 ?? 'z₀'}</tspan> ) ={' '}
              <tspan fill="var(--warning)" fontWeight="800">
                {z1 !== null && z1 !== undefined ? z1 : '—'}
              </tspan>
            </text>
            <text x={390} y={254} textAnchor="middle" fill="var(--text)" fontSize="14px" fontWeight="700" fontFamily="var(--font-mono)">
              {language === 'es' ? 'Resultado Final:' : 'Final Result:'}{' '}
              <tspan fill="var(--accent)">z₂ · 10⁴</tspan> +{' '}
              <tspan fill="var(--warning)">z₁ · 10²</tspan> +{' '}
              <tspan fill="var(--success)">z₀</tspan> ={' '}
              <tspan fill="var(--success)" fontWeight="800">
                {result !== null && result !== undefined ? result : '...'}
              </tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* Tabular Shifted Recombination Block (Aligned Column Addition) */}
      <div className="kt-recombination-block" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          {language === 'es' ? 'Alineación de Columnas y Recombinación en Base 10^m:' : 'Column Alignment & Base 10^m Recombination:'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', maxWidth: '420px', margin: '0 auto', padding: '0.75rem 1.25rem', background: 'var(--canvas-bg, var(--surface-light))', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>z₂ · 10⁴ ({z2 ?? 'z₂'} × 10000):</span>
            <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{z2 !== null && z2 !== undefined ? `${z2 * 10000}` : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>+ z₁ · 10² ({z1 ?? 'z₁'} × 100):</span>
            <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{z1 !== null && z1 !== undefined ? `${z1 * 100}` : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', borderBottom: '2px solid var(--border)', paddingBottom: '0.35rem' }}>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>+ z₀ · 10⁰ ({z0 ?? 'z₀'} × 1):</span>
            <span style={{ fontWeight: 700, color: 'var(--success)' }}>{z0 !== null && z0 !== undefined ? `${z0}` : '—'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingTop: '0.25rem' }}>
            <span style={{ fontWeight: 800, color: 'var(--text)' }}>Total (x × y):</span>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--success)' }}>{result !== null && result !== undefined ? result : '...'}</span>
          </div>
        </div>
      </div>

      {/* Formula Detail Cards */}
      <div className="kt-formula-panel">
        <div className={`kt-term-card kt-term-z2 ${subcalc === 'Z2' ? 'active' : ''}`}>
          <span className="kt-term-title" style={{ color: 'var(--accent)' }}>z₂ = x₁ · y₁</span>
          <span className="kt-term-val" style={{ color: 'var(--accent)' }}>{z2 !== null ? z2 : '—'}</span>
        </div>
        <div className={`kt-term-card kt-term-zsum ${subcalc === 'ZSUM' ? 'active' : ''}`}>
          <span className="kt-term-title" style={{ color: '#0d9488' }}>{language === 'es' ? 'P = (x₁+x₀)(y₁+y₀)' : 'P = (x₁+x₀)(y₁+y₀)'}</span>
          <span className="kt-term-val" style={{ color: '#0d9488' }}>{zSum !== null ? zSum : '—'}</span>
        </div>
        <div className={`kt-term-card kt-term-z1 ${subcalc === 'Z1' ? 'active' : ''}`}>
          <span className="kt-term-title" style={{ color: 'var(--warning)' }}>z₁ = P - z₂ - z₀</span>
          <span className="kt-term-val" style={{ color: 'var(--warning)' }}>{z1 !== null ? z1 : '—'}</span>
        </div>
        <div className={`kt-term-card kt-term-z0 ${subcalc === 'Z0' ? 'active' : ''}`}>
          <span className="kt-term-title" style={{ color: 'var(--success)' }}>z₀ = x₀ · y₀</span>
          <span className="kt-term-val" style={{ color: 'var(--success)' }}>{z0 !== null ? z0 : '—'}</span>
        </div>
      </div>

      {/* Master Theorem Complexity Card (Section 12 & 44) */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Teorema Maestro: 4 Productos Escolares vs. 3 de Karatsuba:' : 'Master Theorem: 4 Schoolbook Products vs. 3 Karatsuba Multiplications:'}</strong>{' '}
        {language === 'es'
          ? 'La división ingenua en 4 productos genera T(n) = 4T(n/2) + O(n) ⇒ O(n^log₂ 4) = O(n²), sin ganancia asintótica. El truco algebraico de Karatsuba calcula el término cruzado z₁ = (x₁+x₀)(y₁+y₀) - z₂ - z₀ requiriendo solo 3 productos recursivos: T(n) = 3T(n/2) + O(n) ⇒ O(n^log₂ 3) ≈ O(n^1.585), revolucionando la aritmética de enteros grandes.'
          : 'Naive split into 4 products yields T(n) = 4T(n/2) + O(n) ⇒ O(n²). Karatsuba’s algebraic trick computes cross term z₁ = (x₁+x₀)(y₁+y₀) - z₂ - z₀ with just 3 recursive multiplications: T(n) = 3T(n/2) + O(n) ⇒ O(n^log₂ 3) ≈ O(n^1.585), accelerating large-integer arithmetic.'}
      </div>

      {/* Playback Controls */}
      <div className="trace-controls" role="toolbar" aria-label={language === 'es' ? 'Controles de reproducción' : 'Playback controls'}>
        <div className="trace-buttons">
          <button
            type="button"
            className="btn-control"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar visualización' : 'Reset visualization'}
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-control btn-play"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            aria-label={language === 'es' ? 'Siguiente paso' : 'Next step'}
          >
            →
          </button>
        </div>

        <div className="trace-scrubber">
          <TraceScrubber
            currentStepIndex={currentStepIndex}
            totalSteps={totalSteps}
            onSeek={goToStep}
            language={language}
            showCounter={false}
            ariaLabel={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
          />
          <span className="step-counter">
            {language === 'es' ? 'Paso' : 'Step'} {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="trace-speed">
          <span>{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => setSpeed(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
