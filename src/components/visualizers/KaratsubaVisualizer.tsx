import React, { useMemo } from 'react';
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
      aria-label="Visualizador del Algoritmo de Karatsuba"
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
      <div className="kt-canvas-container" style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
        <svg
          viewBox="0 0 720 290"
          style={{ width: '100%', maxWidth: '720px', height: 'auto', display: 'block', margin: '0 auto' }}
          role="img"
          aria-label={language === 'es' ? 'Diagrama de recursión de Karatsuba' : 'Karatsuba recursion diagram'}
        >
          {/* Root Multiplication Node */}
          <rect x={245} y={10} width={230} height={52} rx={8} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2.5} />
          <text x={360} y={32} textAnchor="middle" fill="var(--text)" fontSize="15px" fontWeight="800" fontFamily="var(--font-mono)">
            {x} × {y}
          </text>
          <text x={360} y={50} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontFamily="var(--font-mono)">
            x₁={x1}, x₀={x0} | y₁={y1}, y₀={y0} (m={m})
          </text>

          {/* Connectors to 3 Karatsuba branches */}
          <path d="M 300 62 L 125 105" stroke="var(--border-strong)" strokeWidth={2} fill="none" />
          <path d="M 360 62 L 360 105" stroke="var(--border-strong)" strokeWidth={2} fill="none" />
          <path d="M 420 62 L 595 105" stroke="var(--border-strong)" strokeWidth={2} fill="none" />

          {/* Branch 1: z2 = x1 * y1 */}
          <g>
            <rect
              x={20}
              y={105}
              width={210}
              height={70}
              rx={8}
              fill={subcalc === 'Z2' ? 'var(--state-active-bg)' : 'var(--surface)'}
              stroke={subcalc === 'Z2' ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={subcalc === 'Z2' ? 2.5 : 1.5}
            />
            <text x={125} y={128} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="700">
              {language === 'es' ? '1. Término Alto (z₂)' : '1. High Term (z₂)'}
            </text>
            <text x={125} y={154} textAnchor="middle" fill={subcalc === 'Z2' ? 'var(--accent)' : 'var(--text)'} fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
              {x1} × {y1} = {z2 ?? '—'}
            </text>
          </g>

          {/* Branch 2: Cross Product = (x1+x0)*(y1+y0) */}
          <g>
            <rect
              x={255}
              y={105}
              width={210}
              height={70}
              rx={8}
              fill={subcalc === 'ZSUM' || subcalc === 'Z1' ? 'var(--state-solution-bg)' : 'var(--surface)'}
              stroke={subcalc === 'ZSUM' || subcalc === 'Z1' ? 'var(--success)' : 'var(--border)'}
              strokeWidth={subcalc === 'ZSUM' || subcalc === 'Z1' ? 2.5 : 1.5}
            />
            <text x={360} y={128} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="700">
              {language === 'es' ? '2. Producto Cruzado (P)' : '2. Cross Product (P)'}
            </text>
            <text x={360} y={154} textAnchor="middle" fill={subcalc === 'ZSUM' || subcalc === 'Z1' ? 'var(--success)' : 'var(--text)'} fontSize="13px" fontWeight="800" fontFamily="var(--font-mono)">
              ({x1}+{x0}) × ({y1}+{y0}) = {zSum ?? '—'}
            </text>
          </g>

          {/* Branch 3: z0 = x0 * y0 */}
          <g>
            <rect
              x={490}
              y={105}
              width={210}
              height={70}
              rx={8}
              fill={subcalc === 'Z0' ? 'var(--state-candidate-bg)' : 'var(--surface)'}
              stroke={subcalc === 'Z0' ? 'var(--warning)' : 'var(--border)'}
              strokeWidth={subcalc === 'Z0' ? 2.5 : 1.5}
            />
            <text x={595} y={128} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="700">
              {language === 'es' ? '3. Término Bajo (z₀)' : '3. Low Term (z₀)'}
            </text>
            <text x={595} y={154} textAnchor="middle" fill={subcalc === 'Z0' ? 'var(--warning)' : 'var(--text)'} fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
              {x0} × {y0} = {z0 ?? '—'}
            </text>
          </g>

          {/* Recombination & Middle Term Bar */}
          <g>
            <rect
              x={30}
              y={195}
              width={660}
              height={75}
              rx={10}
              fill={subcalc === 'COMBINE' || result !== null ? 'var(--state-active-bg)' : 'var(--surface)'}
              stroke={subcalc === 'COMBINE' || result !== null ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={subcalc === 'COMBINE' || result !== null ? 2 : 1.5}
            />
            <text x={360} y={222} textAnchor="middle" fill="var(--text)" fontSize="13px" fontWeight="600" fontFamily="var(--font-mono)">
              {language === 'es' ? '4. Término Medio:' : '4. Middle Term:'} z₁ = P - z₂ - z₀ = ({zSum ?? 'P'} - {z2 ?? 'z₂'} - {z0 ?? 'z₀'}) ={' '}
              <tspan fill="var(--success)" fontWeight="800">
                {z1 ?? '—'}
              </tspan>
            </text>
            <text x={360} y={250} textAnchor="middle" fill="var(--text)" fontSize="14px" fontWeight="700" fontFamily="var(--font-mono)">
              {language === 'es' ? 'Resultado Final:' : 'Final Result:'} z₂ · 10⁴ + z₁ · 10² + z₀ ={' '}
              <tspan fill="var(--accent)" fontWeight="800">
                {result ?? '...'}
              </tspan>
            </text>
          </g>
        </svg>
      </div>

      {/* Formula Detail Cards */}
      <div className="kt-formula-panel">
        <div className={`kt-term-card ${subcalc === 'Z2' ? 'active' : ''}`}>
          <span className="kt-term-title">z₂ = x₁ · y₁</span>
          <span className="kt-term-val">{z2 !== null ? z2 : '—'}</span>
        </div>
        <div className={`kt-term-card ${subcalc === 'ZSUM' ? 'active' : ''}`}>
          <span className="kt-term-title">{language === 'es' ? 'P = (x₁+x₀)(y₁+y₀)' : 'P = (x₁+x₀)(y₁+y₀)'}</span>
          <span className="kt-term-val">{zSum !== null ? zSum : '—'}</span>
        </div>
        <div className={`kt-term-card ${subcalc === 'Z1' ? 'active' : ''}`}>
          <span className="kt-term-title">z₁ = P - z₂ - z₀</span>
          <span className="kt-term-val">{z1 !== null ? z1 : '—'}</span>
        </div>
        <div className={`kt-term-card ${subcalc === 'Z0' ? 'active' : ''}`}>
          <span className="kt-term-title">z₀ = x₀ · y₀</span>
          <span className="kt-term-val">{z0 !== null ? z0 : '—'}</span>
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
      <div className="trace-controls" role="toolbar" aria-label="Controles de reproducción">
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
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            aria-label={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
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
