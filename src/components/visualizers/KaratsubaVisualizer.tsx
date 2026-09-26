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
          <strong style={{ color: '#10b981' }}>{multCount} / 3</strong>
        </div>
        <div className="kt-metric-badge">
          <span>{language === 'es' ? 'Multiplicaciones Ahorradas:' : 'Saved Multiplications:'}</span>
          <strong style={{ color: '#38bdf8' }}>{Math.max(0, 4 - multCount)}</strong>
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
          viewBox="0 0 660 260"
          style={{ width: '100%', maxWidth: '660px', height: 'auto', display: 'block' }}
          role="img"
          aria-label={language === 'es' ? 'Estructura algebraica del algoritmo de Karatsuba' : 'Karatsuba algebraic structure decomposition'}
        >
          {/* Main Top Node: (x, y) */}
          <rect x={220} y={12} width={220} height={46} rx={8} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2.5} />
          <text x={330} y={34} textAnchor="middle" fill="var(--text)" fontSize="14px" fontWeight="800" fontFamily="var(--font-mono)">
            {x} × {y}
          </text>
          <text x={330} y={49} textAnchor="middle" fill="var(--text-muted)" fontSize="10px" fontFamily="var(--font-mono)">
            x₁={x1}, x₀={x0} | y₁={y1}, y₀={y0} (m={m})
          </text>

          {/* Connectors to 3 Karatsuba branches */}
          <path d="M 260 58 L 105 105" stroke="var(--border-strong)" strokeWidth={2} fill="none" />
          <path d="M 330 58 L 330 105" stroke="var(--border-strong)" strokeWidth={2} fill="none" />
          <path d="M 400 58 L 555 105" stroke="var(--border-strong)" strokeWidth={2} fill="none" />

          {/* Branch 1: z2 = x1 * y1 */}
          <g>
            <rect
              x={15}
              y={105}
              width={180}
              height={62}
              rx={8}
              fill={subcalc === 'Z2' ? 'rgba(56, 189, 248, 0.18)' : 'var(--surface)'}
              stroke={subcalc === 'Z2' ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={subcalc === 'Z2' ? 2.5 : 1.5}
            />
            <text x={105} y={127} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="700">
              {language === 'es' ? 'Rama 1: Término Alto (z₂)' : 'Branch 1: High Term (z₂)'}
            </text>
            <text x={105} y={150} textAnchor="middle" fill={subcalc === 'Z2' ? 'var(--accent)' : 'var(--text)'} fontSize="13px" fontWeight="800" fontFamily="var(--font-mono)">
              {x1} × {y1} = {z2 ?? '—'}
            </text>
          </g>

          {/* Branch 2: Cross Product = (x1+x0)*(y1+y0) */}
          <g>
            <rect
              x={225}
              y={105}
              width={210}
              height={62}
              rx={8}
              fill={subcalc === 'ZSUM' || subcalc === 'Z1' ? 'rgba(16, 185, 129, 0.18)' : 'var(--surface)'}
              stroke={subcalc === 'ZSUM' || subcalc === 'Z1' ? '#10b981' : 'var(--border)'}
              strokeWidth={subcalc === 'ZSUM' || subcalc === 'Z1' ? 2.5 : 1.5}
            />
            <text x={330} y={127} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="700">
              {language === 'es' ? 'Rama 2: Producto Cruzado' : 'Branch 2: Cross Product'}
            </text>
            <text x={330} y={150} textAnchor="middle" fill={subcalc === 'ZSUM' || subcalc === 'Z1' ? '#10b981' : 'var(--text)'} fontSize="13px" fontWeight="800" fontFamily="var(--font-mono)">
              ({x1}+{x0}) × ({y1}+{y0}) = {zSum ?? '—'}
            </text>
          </g>

          {/* Branch 3: z0 = x0 * y0 */}
          <g>
            <rect
              x={465}
              y={105}
              width={180}
              height={62}
              rx={8}
              fill={subcalc === 'Z0' ? 'rgba(245, 158, 11, 0.18)' : 'var(--surface)'}
              stroke={subcalc === 'Z0' ? '#f59e0b' : 'var(--border)'}
              strokeWidth={subcalc === 'Z0' ? 2.5 : 1.5}
            />
            <text x={555} y={127} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="700">
              {language === 'es' ? 'Rama 3: Término Bajo (z₀)' : 'Branch 3: Low Term (z₀)'}
            </text>
            <text x={555} y={150} textAnchor="middle" fill={subcalc === 'Z0' ? '#f59e0b' : 'var(--text)'} fontSize="13px" fontWeight="800" fontFamily="var(--font-mono)">
              {x0} × {y0} = {z0 ?? '—'}
            </text>
          </g>

          {/* Recombination & Middle Term Bar */}
          <g>
            <rect
              x={50}
              y={185}
              width={560}
              height={55}
              rx={8}
              fill={subcalc === 'COMBINE' || result !== null ? 'rgba(37, 99, 235, 0.12)' : 'var(--surface)'}
              stroke={subcalc === 'COMBINE' || result !== null ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={subcalc === 'COMBINE' || result !== null ? 2 : 1.5}
            />
            <text x={330} y={207} textAnchor="middle" fill="var(--text)" fontSize="12px" fontWeight="600" fontFamily="var(--font-mono)">
              {language === 'es' ? 'Término medio:' : 'Middle term:'} z₁ = ({zSum ?? 'P'} - {z2 ?? 'z₂'} - {z0 ?? 'z₀'}) ={' '}
              <tspan fill="#10b981" fontWeight="800">
                {z1 ?? '—'}
              </tspan>
            </text>
            <text x={330} y={226} textAnchor="middle" fill="var(--text)" fontSize="12px" fontWeight="700" fontFamily="var(--font-mono)">
              {language === 'es' ? 'Recombinación:' : 'Recombination:'} z₂ · 10⁴ + z₁ · 10² + z₀ ={' '}
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
