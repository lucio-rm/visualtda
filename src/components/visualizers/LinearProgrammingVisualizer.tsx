import React, { useMemo } from 'react';
import {
  generateLinearProgrammingTrace,
  LPStepData,
  DEFAULT_LP_OBJECTIVE,
  DEFAULT_LP_CONSTRAINTS
} from '../../engine/algorithms/linearProgrammingTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './LinearProgrammingVisualizer.css';

export const LinearProgrammingVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const timeline = useMemo(
    () => generateLinearProgrammingTrace(DEFAULT_LP_OBJECTIVE, DEFAULT_LP_CONSTRAINTS),
    []
  );

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
  } = useTraceTimeline<LPStepData>(timeline, {
    baseIntervalMs: 850,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const objective = data?.objective || DEFAULT_LP_OBJECTIVE;
  const constraints = data?.constraints || DEFAULT_LP_CONSTRAINTS;
  const activeConstraintsCount = data?.activeConstraintsCount ?? 0;
  const vertices = data?.vertices || [];
  const currentVertexIndex = data?.currentVertexIndex;
  const optimalPoint = data?.optimalPoint;
  const optimalValue = data?.optimalValue;
  const integerPoints = data?.integerPoints || [];
  const phase = data?.phase || 'init';

  // SVG coordinate transformation
  // Model bounds: x in [0, 12], y in [0, 16]
  const svgWidth = 500;
  const svgHeight = 400;
  const padding = 50;

  const maxX = 12;
  const maxY = 16;

  const toSvgX = (x: number) => padding + (x / maxX) * (svgWidth - 2 * padding);
  const toSvgY = (y: number) => svgHeight - padding - (y / maxY) * (svgHeight - 2 * padding);

  // Polygon points string for feasible region
  // Sort vertices counter-clockwise
  const polygonPoints = useMemo(() => {
    if (vertices.length < 3) return '';
    // Centroid
    const cx = vertices.reduce((s, v) => s + v[0], 0) / vertices.length;
    const cy = vertices.reduce((s, v) => s + v[1], 0) / vertices.length;

    const sorted = [...vertices].sort((a, b) => {
      const angleA = Math.atan2(a[1] - cy, a[0] - cx);
      const angleB = Math.atan2(b[1] - cy, b[0] - cx);
      return angleA - angleB;
    });

    return sorted.map(([x, y]) => `${toSvgX(x)},${toSvgY(y)}`).join(' ');
  }, [vertices]);

  return (
    <div
      className="lp-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Programación Lineal' : 'Linear Programming Visualizer'}
    >
      {/* Top Header */}
      <div className="visualizer-header">
        <div className="phase-indicator">
          <span className="phase-badge-label">
            {language === 'es' ? 'Fase LP:' : 'LP Phase:'}
          </span>
          <span className="phase-badge-name">{phase.replace(/_/g, ' ').toUpperCase()}</span>
        </div>
        <div className="objective-display">
          {language === 'es' ? 'Función Objetivo:' : 'Objective Function:'}{' '}
          <code>max z = {objective[0]}x + {objective[1]}y</code>
          {optimalValue !== undefined && (
            <span className="opt-val-tag">
              {' '}| z* = <strong>{optimalValue}</strong>
            </span>
          )}
        </div>
      </div>

      {/* SVG Canvas for 2D Polytope */}
      <div className="svg-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="lp-svg"
          aria-label={language === 'es' ? 'Plano cartesiano de programación lineal' : 'Linear programming Cartesian plane'}
        >
          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10, 12].map((gx) => (
            <g key={`gx-${gx}`}>
              <line
                x1={toSvgX(gx)}
                y1={toSvgY(0)}
                x2={toSvgX(gx)}
                y2={toSvgY(maxY)}
                stroke="var(--border)"
                strokeDasharray="2 3"
                strokeWidth="1"
              />
              <text
                x={toSvgX(gx)}
                y={toSvgY(0) + 18}
                fontSize="13"
                textAnchor="middle"
                fill="var(--text-muted)"
              >
                {gx}
              </text>
            </g>
          ))}

          {[0, 4, 8, 12, 16].map((gy) => (
            <g key={`gy-${gy}`}>
              <line
                x1={toSvgX(0)}
                y1={toSvgY(gy)}
                x2={toSvgX(maxX)}
                y2={toSvgY(gy)}
                stroke="var(--border)"
                strokeDasharray="2 3"
                strokeWidth="1"
              />
              <text
                x={toSvgX(0) - 10}
                y={toSvgY(gy) + 4}
                fontSize="13"
                textAnchor="end"
                fill="var(--text-muted)"
              >
                {gy}
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={toSvgX(0)}
            y1={toSvgY(0)}
            x2={toSvgX(maxX)}
            y2={toSvgY(0)}
            stroke="var(--text)"
            strokeWidth="2"
          />
          <line
            x1={toSvgX(0)}
            y1={toSvgY(0)}
            x2={toSvgX(0)}
            y2={toSvgY(maxY)}
            stroke="var(--text)"
            strokeWidth="2"
          />

          <text x={toSvgX(maxX) - 10} y={toSvgY(0) - 8} fontSize="13" fontWeight="bold" fill="var(--text)">
            X
          </text>
          <text x={toSvgX(0) + 10} y={toSvgY(maxY) + 12} fontSize="13" fontWeight="bold" fill="var(--text)">
            Y
          </text>

          {/* Feasible Polytope Polygon */}
          {polygonPoints && activeConstraintsCount >= constraints.length && (
            <polygon
              points={polygonPoints}
              fill="var(--accent-subtle)"
              stroke="var(--accent)"
              strokeWidth="2"
            />
          )}

          {/* Constraint Lines */}
          {constraints.slice(0, activeConstraintsCount).map((c, i) => {
            // Find points where ax + by = c hits bounding box
            // If x = 0 => y = c/b
            // If y = 0 => x = c/a
            const p1 = { x: 0, y: c.c / c.b };
            const p2 = { x: c.c / c.a, y: 0 };

            return (
              <g key={i}>
                <line
                  x1={toSvgX(p1.x)}
                  y1={toSvgY(p1.y)}
                  x2={toSvgX(p2.x)}
                  y2={toSvgY(p2.y)}
                  stroke="var(--warning)"
                  strokeWidth="2.5"
                  strokeDasharray="4 2"
                />
                <text
                  x={toSvgX(p2.x / 2) + 10}
                  y={toSvgY(p1.y / 2) - 8}
                  fontSize="13"
                  fontWeight="bold"
                  fill="var(--warning)"
                >
                  {c.label}
                </text>
              </g>
            );
          })}

          {/* Integer points lattice (ILP comparison) */}
          {phase === 'integer_points' &&
            integerPoints.map(([ix, iy], idx) => (
              <circle
                key={`ip-${idx}`}
                cx={toSvgX(ix)}
                cy={toSvgY(iy)}
                r="3.5"
                fill="var(--warning)"
                opacity="0.8"
              />
            ))}

          {/* Polytope Extreme Vertices */}
          {vertices.map(([vx, vy], idx) => {
            const isOpt = optimalPoint && Math.abs(optimalPoint[0] - vx) < 1e-4 && Math.abs(optimalPoint[1] - vy) < 1e-4;
            const isCurrent = currentVertexIndex === idx;

            let fill = 'var(--accent)';
            let r = 6;
            if (isCurrent) {
              fill = 'var(--warning)';
              r = 8;
            }
            if (isOpt && (phase === 'optimal_found' || phase === 'complete')) {
              fill = 'var(--success)';
              r = 10;
            }

            return (
              <g key={`v-${idx}`}>
                <circle
                  cx={toSvgX(vx)}
                  cy={toSvgY(vy)}
                  r={r}
                  fill={fill}
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
                <text
                  x={toSvgX(vx) + 8}
                  y={toSvgY(vy) - 8}
                  fontSize="13"
                  fontWeight="bold"
                  fill="var(--text)"
                >
                  ({vx}, {vy})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vertices and Values Card */}
      <div className="vertices-panel">
        <div className="panel-title">
          {language === 'es'
            ? 'Vértices Extremos (Soluciones Básicas Factibles)'
            : 'Extreme Vertices (Basic Feasible Solutions)'}
        </div>
        <div className="vertices-grid">
          {vertices.map(([vx, vy], idx) => {
            const val = objective[0] * vx + objective[1] * vy;
            const isOpt = optimalPoint && Math.abs(optimalPoint[0] - vx) < 1e-4 && Math.abs(optimalPoint[1] - vy) < 1e-4;
            const isCurrent = currentVertexIndex === idx;

            let cardClass = 'vertex-chip';
            if (isCurrent) cardClass += ' current-eval';
            if (isOpt && (phase === 'optimal_found' || phase === 'complete')) cardClass += ' is-optimal';

            return (
              <div key={idx} className={cardClass}>
                <span className="v-coord">({vx}, {vy})</span>
                <span className="v-val">z = {val}</span>
                {isOpt && (phase === 'optimal_found' || phase === 'complete') && (
                  <span className="opt-star">{language === 'es' ? 'ÓPTIMO' : 'OPTIMAL'}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Narrative */}
      <div className="event-narrative">
        <p className="narrative-text">
          {currentEvent?.message?.[language] || currentEvent?.message?.es}
        </p>
      </div>

      {/* Fundamental Theorem of Linear Programming Card */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Teorema Fundamental de la Programación Lineal:' : 'Fundamental Theorem of Linear Programming:'}</strong>{' '}
        {language === 'es'
          ? 'En cualquier programa lineal con región factible convexa acotada y no vacía, el valor óptimo de la función objetivo se alcanza obligatoriamente en al menos un vértice extremo del poliedro. Mover las rectas de nivel c^T x = k en la dirección del gradiente c maximiza la ganancia hasta el último punto de contacto, que siempre contiene un vértice. Esto permite al algoritmo Simplex restringir la búsqueda a pivotear exclusivamente entre vértices adyacentes.'
          : 'For any LP with a bounded non-empty convex feasible region, an optimal solution is guaranteed to exist at one of the extreme vertices of the polyhedron. Sliding level lines c^T x = k in direction c hits the boundary at an extreme point. This geometric property allows the Simplex algorithm to find the global optimum by pivoting strictly along adjacent vertices.'}
      </div>

      {/* Controls Bar */}
      <div className="controls-bar">
        <button className="btn-control" onClick={reset} title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'} aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}>↺</button>
        <button className="btn-control" onClick={stepBackward} disabled={currentStepIndex === 0} title={language === 'es' ? 'Paso anterior (←)' : 'Step backward (←)'} aria-label={language === 'es' ? 'Paso anterior' : 'Step backward'}>←</button>
        <button className="btn-control btn-play" onClick={togglePlay} title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')} aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}>
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button className="btn-control" onClick={stepForward} disabled={currentStepIndex === totalSteps - 1} title={language === 'es' ? 'Paso siguiente (→)' : 'Step forward (→)'} aria-label={language === 'es' ? 'Paso siguiente' : 'Step forward'}>→</button>

        <div className="timeline-slider-wrapper">
          <input
            type="range"
            min={0}
            max={totalSteps - 1}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            aria-label={language === 'es' ? 'Línea de tiempo de ejecución' : 'Execution timeline'}
            className="timeline-slider"
          />
          <span className="step-counter">{currentStepIndex + 1} / {totalSteps}</span>
        </div>

        <div className="speed-selector">
          <span className="speed-label">{language === 'es' ? 'Vel:' : 'Speed:'}</span>
          <div className="segmented-control speed-segmented-control" role="group" aria-label={language === 'es' ? 'Velocidad' : 'Speed'}>
            {[0.5, 1, 1.5, 2].map((spd) => (
              <button
                key={spd}
                type="button"
                className={`segmented-btn ${playbackSpeed === spd ? 'active' : ''}`}
                onClick={() => setSpeed(spd)}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
