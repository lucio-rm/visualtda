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
      <div className="kt-canvas-container">
        <svg
          viewBox="0 0 540 220"
          style={{ width: '100%', maxWidth: '540px', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Estructura de la descomposición de Karatsuba"
        >
          {/* Main Top Node: (x, y) */}
          <rect x={180} y={15} width={180} height={40} rx={6} fill="var(--surface)" stroke="var(--accent)" strokeWidth={2} />
          <text x={270} y={38} textAnchor="middle" fill="var(--text)" fontSize="13px" fontWeight="700" fontFamily="var(--font-mono)">
            {x} × {y} (n=4, m={m})
          </text>

          {/* Connectors to 3 Karatsuba branches */}
          <line x1={220} y1={55} x2={90} y2={105} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={270} y1={55} x2={270} y2={105} stroke="var(--border)" strokeWidth={1.5} />
          <line x1={320} y1={55} x2={450} y2={105} stroke="var(--border)" strokeWidth={1.5} />

          {/* Branch 1: z2 = x1 * y1 */}
          <g>
            <rect
              x={20}
              y={105}
              width={140}
              height={55}
              rx={6}
              fill={subcalc === 'Z2' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg)'}
              stroke={subcalc === 'Z2' ? 'var(--accent)' : 'var(--border)'}
              strokeWidth={subcalc === 'Z2' ? 2 : 1}
            />
            <text x={90} y={126} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="600">
              1. Término Alto (z₂)
            </text>
            <text x={90} y={146} textAnchor="middle" fill="var(--text)" fontSize="12px" fontWeight="700" fontFamily="var(--font-mono)">
              {x1} × {y1} = {z2 ?? '?'}
            </text>
          </g>

          {/* Branch 2: zSum = (x1+x0)*(y1+y0) */}
          <g>
            <rect
              x={185}
              y={105}
              width={170}
              height={55}
              rx={6}
              fill={subcalc === 'ZSUM' || subcalc === 'Z1' ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg)'}
              stroke={subcalc === 'ZSUM' || subcalc === 'Z1' ? '#10b981' : 'var(--border)'}
              strokeWidth={subcalc === 'ZSUM' || subcalc === 'Z1' ? 2 : 1}
            />
            <text x={270} y={126} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="600">
              2. Suma Cruzada (z_sum)
            </text>
            <text x={270} y={146} textAnchor="middle" fill="var(--text)" fontSize="12px" fontWeight="700" fontFamily="var(--font-mono)">
              ({x1}+{x0}) × ({y1}+{y0}) = {zSum ?? '?'}
            </text>
          </g>

          {/* Branch 3: z0 = x0 * y0 */}
          <g>
            <rect
              x={380}
              y={105}
              width={140}
              height={55}
              rx={6}
              fill={subcalc === 'Z0' ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg)'}
              stroke={subcalc === 'Z0' ? '#f59e0b' : 'var(--border)'}
              strokeWidth={subcalc === 'Z0' ? 2 : 1}
            />
            <text x={450} y={126} textAnchor="middle" fill="var(--text-muted)" fontSize="11px" fontWeight="600">
              3. Término Bajo (z₀)
            </text>
            <text x={450} y={146} textAnchor="middle" fill="var(--text)" fontSize="12px" fontWeight="700" fontFamily="var(--font-mono)">
              {x0} × {y0} = {z0 ?? '?'}
            </text>
          </g>

          {/* Recombination Result Bar */}
          <g>
            <rect
              x={70}
              y={175}
              width={400}
              height={36}
              rx={6}
              fill={subcalc === 'COMBINE' || result !== null ? 'rgba(56, 189, 248, 0.1)' : 'var(--surface)'}
              stroke="var(--border)"
            />
            <text x={270} y={198} textAnchor="middle" fill="var(--text)" fontSize="12px" fontFamily="var(--font-mono)">
              z₂ · 10⁴ + z₁ · 10² + z₀ ={' '}
              <tspan fill="#38bdf8" fontWeight="700">
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
          <span className="kt-term-title">z_sum = (x₁+x₀)(y₁+y₀)</span>
          <span className="kt-term-val">{zSum !== null ? zSum : '—'}</span>
        </div>
        <div className={`kt-term-card ${subcalc === 'Z1' ? 'active' : ''}`}>
          <span className="kt-term-title">z₁ = z_sum - z₂ - z₀</span>
          <span className="kt-term-val">{z1 !== null ? z1 : '—'}</span>
        </div>
        <div className={`kt-term-card ${subcalc === 'Z0' ? 'active' : ''}`}>
          <span className="kt-term-title">z₀ = x₀ · y₀</span>
          <span className="kt-term-val">{z0 !== null ? z0 : '—'}</span>
        </div>
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
            ⏮
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ⏪
          </button>
          <button
            type="button"
            className="btn-control btn-play"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            aria-label={language === 'es' ? 'Siguiente paso' : 'Next step'}
          >
            ⏩
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
