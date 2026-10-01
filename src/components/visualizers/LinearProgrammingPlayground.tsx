import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { solveLP2D, LinearConstraint } from '../../engine/algorithms/linearProgrammingValidator';
import './LinearProgrammingPlayground.css';

interface LPPreset {
  name: { es: string; en: string };
  objective: [number, number];
  constraints: LinearConstraint[];
  maxX: number;
  maxY: number;
}

const PRESETS: LPPreset[] = [
  {
    name: { es: 'Problema de Producción (3 restricciones)', en: 'Production Problem (3 constraints)' },
    objective: [3, 2],
    maxX: 14,
    maxY: 18,
    constraints: [
      { a: 2, b: 1, c: 18, label: '2x + y <= 18' },
      { a: 2, b: 3, c: 42, label: '2x + 3y <= 42' },
      { a: 3, b: 1, c: 24, label: '3x + y <= 24' }
    ]
  },
  {
    name: { es: 'Wyndor Glass (Hillier & Lieberman)', en: 'Wyndor Glass (Hillier & Lieberman)' },
    objective: [3, 5],
    maxX: 8,
    maxY: 10,
    constraints: [
      { a: 1, b: 0, c: 4, label: 'x <= 4 (Planta 1)' },
      { a: 0, b: 2, c: 12, label: '2y <= 12 (Planta 2)' },
      { a: 3, b: 2, c: 18, label: '3x + 2y <= 18 (Planta 3)' }
    ]
  },
  {
    name: { es: 'Mochila Continua 2 Ítems', en: 'Continuous Knapsack 2 Items' },
    objective: [5, 6],
    maxX: 6,
    maxY: 6,
    constraints: [
      { a: 2, b: 3, c: 12, label: '2x + 3y <= 12 (Capacidad)' },
      { a: 1, b: 0, c: 4, label: 'x <= 4' },
      { a: 0, b: 1, c: 3, label: 'y <= 3' }
    ]
  }
];

export const LinearProgrammingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [activeTab, setActiveTab] = useState<'geometric' | 'modeling'>('geometric');
  const [modelingProblem, setModelingProblem] = useState<'juan' | 'mochila' | 'vertex-cover'>('juan');

  const [c1, setC1] = useState<number>(3);
  const [c2, setC2] = useState<number>(2);
  const [activePreset, setActivePreset] = useState<LPPreset>(PRESETS[0]);
  const [selectedVertex, setSelectedVertex] = useState<[number, number] | null>(null);

  const solution = useMemo(() => {
    return solveLP2D([c1, c2], activePreset.constraints);
  }, [c1, c2, activePreset]);

  useEffect(() => {
    if (solution && solution.optimalPoint) {
      markAttempted('linear-programming-formulation');
    }
  }, [solution, markAttempted]);

  const handlePresetSelect = (p: LPPreset) => {
    setActivePreset(p);
    setC1(p.objective[0]);
    setC2(p.objective[1]);
    setSelectedVertex(null);
  };

  // SVG dimensions and scaling
  const svgWidth = 480;
  const svgHeight = 360;
  const padding = 45;
  const maxX = activePreset.maxX;
  const maxY = activePreset.maxY;

  const toSvgX = (x: number) => padding + (x / maxX) * (svgWidth - 2 * padding);
  const toSvgY = (y: number) => svgHeight - padding - (y / maxY) * (svgHeight - 2 * padding);

  // Feasible polygon points sorted counter-clockwise
  const polygonPoints = useMemo(() => {
    if (solution.vertices.length < 3) return '';
    const cx = solution.vertices.reduce((s, v) => s + v[0], 0) / solution.vertices.length;
    const cy = solution.vertices.reduce((s, v) => s + v[1], 0) / solution.vertices.length;

    const sorted = [...solution.vertices].sort((a, b) => {
      const angleA = Math.atan2(a[1] - cy, a[0] - cx);
      const angleB = Math.atan2(b[1] - cy, b[0] - cx);
      return angleA - angleB;
    });

    return sorted.map(([x, y]) => `${toSvgX(x)},${toSvgY(y)}`).join(' ');
  }, [solution.vertices, maxX, maxY]);

  // Optimal level set line segment (c1*x + c2*y = z*)
  const levelCurveLine = useMemo(() => {
    if (!solution.optimalPoint || solution.optimalValue === -Infinity) return null;
    const z = solution.optimalValue;
    // Points where c1*x + c2*y = z intersects borders of display [0, maxX], [0, maxY]
    const pts: [number, number][] = [];

    // Intersect with x = 0 -> y = z / c2
    if (c2 !== 0) {
      const yAt0 = z / c2;
      if (yAt0 >= 0 && yAt0 <= maxY * 1.2) pts.push([0, yAt0]);
    }
    // Intersect with y = 0 -> x = z / c1
    if (c1 !== 0) {
      const xAt0 = z / c1;
      if (xAt0 >= 0 && xAt0 <= maxX * 1.2) pts.push([xAt0, 0]);
    }
    // Intersect with x = maxX -> y = (z - c1*maxX) / c2
    if (c2 !== 0) {
      const yAtMax = (z - c1 * maxX) / c2;
      if (yAtMax >= 0 && yAtMax <= maxY * 1.2) pts.push([maxX, yAtMax]);
    }
    // Intersect with y = maxY -> x = (z - c2*maxY) / c1
    if (c1 !== 0) {
      const xAtMax = (z - c2 * maxY) / c1;
      if (xAtMax >= 0 && xAtMax <= maxX * 1.2) pts.push([xAtMax, maxY]);
    }

    if (pts.length < 2) return null;
    return {
      x1: toSvgX(pts[0][0]),
      y1: toSvgY(pts[0][1]),
      x2: toSvgX(pts[1][0]),
      y2: toSvgY(pts[1][1])
    };
  }, [solution.optimalPoint, solution.optimalValue, c1, c2, maxX, maxY]);

  return (
    <div className="lp-playground">
      <div className="playground-intro">
        <h3>
          {language === 'es'
            ? 'Laboratorio Interactivo de Programación Lineal (LP / ILP)'
            : 'Interactive Linear Programming Laboratory (LP / ILP)'}
        </h3>
        <p>
          {language === 'es'
            ? 'Explora la geometría continua de las soluciones factibles y el Teorema Fundamental de Programación Lineal, o inspecciona las formulaciones enteras canónicas de problemas de la cátedra.'
            : 'Explore the continuous geometry of feasible solutions and the Fundamental Theorem of LP, or inspect canonical integer formulations of course problems.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="playground-tabs">
        <button
          className={`tab-btn ${activeTab === 'geometric' ? 'active' : ''}`}
          onClick={() => setActiveTab('geometric')}
        >
          {language === 'es' ? 'Geometría 2D y Teorema Fundamental' : '2D Geometry & Fundamental Theorem'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'modeling' ? 'active' : ''}`}
          onClick={() => setActiveTab('modeling')}
        >
          {language === 'es' ? 'Modelado ILP de Problemas TDA' : 'ILP Modeling for TDA Problems'}
        </button>
      </div>

      {activeTab === 'geometric' ? (
        <div className="geometric-tab-content">
          {/* Presets */}
          <div className="presets-row">
            <span className="row-label">
              {language === 'es' ? 'Modelos de Prueba:' : 'Test Models:'}
            </span>
            <div className="preset-chips">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  className={`chip-btn ${activePreset.name.es === p.name.es ? 'selected' : ''}`}
                  onClick={() => handlePresetSelect(p)}
                >
                  {p.name[language]}
                </button>
              ))}
            </div>
          </div>

          {/* Objective Function Sliders */}
          <div className="controls-card">
            <div className="card-title">
              {language === 'es' ? 'Ajustar Vector Objetivo c = (c1, c2):' : 'Adjust Objective Vector c = (c1, c2):'}{' '}
              <code style={{ color: 'var(--accent)', fontWeight: 800 }}>
                max z = {c1}x + {c2}y
              </code>
            </div>
            <div className="sliders-row">
              <div className="slider-group">
                <label>c1 ({language === 'es' ? 'coeficiente X' : 'X coefficient'}): <strong>{c1}</strong></label>
                <input
                  type="range"
                  min={-3}
                  max={8}
                  step={1}
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value))}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>
              <div className="slider-group">
                <label>c2 ({language === 'es' ? 'coeficiente Y' : 'Y coefficient'}): <strong>{c2}</strong></label>
                <input
                  type="range"
                  min={-3}
                  max={8}
                  step={1}
                  value={c2}
                  onChange={(e) => setC2(Number(e.target.value))}
                  style={{ accentColor: 'var(--accent)' }}
                />
              </div>
            </div>
          </div>

          {/* 2D Polytope SVG Canvas */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'var(--surface)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              padding: '0.75rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ maxWidth: '580px', width: '100%', height: 'auto' }}
              role="img"
              aria-label={
                language === 'es'
                  ? 'Plano cartesiano 2D con región factible y curvas de nivel'
                  : '2D Cartesian plane with feasible region and level curves'
              }
            >
              {/* Coordinate Grid */}
              {Array.from({ length: 7 }).map((_, i) => {
                const gx = Math.round((maxX / 6) * i);
                const gy = Math.round((maxY / 6) * i);
                return (
                  <g key={`grid-lp-${i}`}>
                    <line
                      x1={toSvgX(gx)}
                      y1={toSvgY(0)}
                      x2={toSvgX(gx)}
                      y2={toSvgY(maxY)}
                      stroke="var(--border)"
                      strokeDasharray="2 3"
                      strokeWidth="1"
                      opacity={0.5}
                    />
                    <text
                      x={toSvgX(gx)}
                      y={toSvgY(0) + 16}
                      fontSize="13"
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontFamily="var(--font-mono)"
                    >
                      {gx}
                    </text>
                    <line
                      x1={toSvgX(0)}
                      y1={toSvgY(gy)}
                      x2={toSvgX(maxX)}
                      y2={toSvgY(gy)}
                      stroke="var(--border)"
                      strokeDasharray="2 3"
                      strokeWidth="1"
                      opacity={0.5}
                    />
                    <text
                      x={toSvgX(0) - 10}
                      y={toSvgY(gy) + 4}
                      fontSize="13"
                      textAnchor="end"
                      fill="var(--text-muted)"
                      fontFamily="var(--font-mono)"
                    >
                      {gy}
                    </text>
                  </g>
                );
              })}

              {/* Axes X and Y */}
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
              <text x={toSvgX(maxX) - 5} y={toSvgY(0) + 18} fill="var(--text)" fontSize="13" fontWeight="700">X</text>
              <text x={toSvgX(0) - 15} y={toSvgY(maxY) + 10} fill="var(--text)" fontSize="13" fontWeight="700">Y</text>

              {/* Shaded Feasible Polytope */}
              {polygonPoints && (
                <polygon
                  points={polygonPoints}
                  fill="rgba(59, 130, 246, 0.22)"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                />
              )}

              {/* Constraint boundary lines */}
              {activePreset.constraints.map((c, idx) => {
                // Find endpoints where a*x + b*y = c intersects the axes
                let p1: [number, number] | null = null;
                let p2: [number, number] | null = null;
                if (c.b !== 0 && c.a !== 0) {
                  p1 = [0, c.c / c.b];
                  p2 = [c.c / c.a, 0];
                } else if (c.b === 0 && c.a !== 0) {
                  p1 = [c.c / c.a, 0];
                  p2 = [c.c / c.a, maxY];
                } else if (c.a === 0 && c.b !== 0) {
                  p1 = [0, c.c / c.b];
                  p2 = [maxX, c.c / c.b];
                }

                if (!p1 || !p2) return null;

                return (
                  <line
                    key={`constr-line-${idx}`}
                    x1={toSvgX(p1[0])}
                    y1={toSvgY(p1[1])}
                    x2={toSvgX(p2[0])}
                    y2={toSvgY(p2[1])}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity={0.7}
                  />
                );
              })}

              {/* Optimal Level Curve Line */}
              {levelCurveLine && (
                <line
                  x1={levelCurveLine.x1}
                  y1={levelCurveLine.y1}
                  x2={levelCurveLine.x2}
                  y2={levelCurveLine.y2}
                  stroke="var(--success)"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                />
              )}

              {/* Polytope Vertices */}
              {solution.vertices.map(([vx, vy], idx) => {
                const isOpt =
                  solution.optimalPoint &&
                  Math.abs(solution.optimalPoint[0] - vx) < 1e-4 &&
                  Math.abs(solution.optimalPoint[1] - vy) < 1e-4;
                const isSel =
                  selectedVertex &&
                  Math.abs(selectedVertex[0] - vx) < 1e-4 &&
                  Math.abs(selectedVertex[1] - vy) < 1e-4;

                const zVal = Number((c1 * vx + c2 * vy).toFixed(2));

                return (
                  <g
                    key={`vertex-lp-${idx}`}
                    onClick={() => setSelectedVertex([vx, vy])}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={toSvgX(vx)}
                      cy={toSvgY(vy)}
                      r={isOpt ? 7 : 5}
                      fill={isOpt ? 'var(--success)' : isSel ? 'var(--accent)' : 'var(--accent)'}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <text
                      x={toSvgX(vx)}
                      y={toSvgY(vy) - 10}
                      fontSize="13"
                      textAnchor="middle"
                      fill={isOpt ? 'var(--success)' : 'var(--text)'}
                      fontFamily="var(--font-mono)"
                      fontWeight={isOpt ? '800' : '600'}
                    >
                      ({vx.toFixed(1)}, {vy.toFixed(1)}) z={zVal}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Vector arrow c */}
              <g transform={`translate(${toSvgX(0)}, ${toSvgY(0)})`}>
                <line
                  x1={0}
                  y1={0}
                  x2={(c1 / maxX) * (svgWidth - 2 * padding) * 0.75}
                  y2={-(c2 / maxY) * (svgHeight - 2 * padding) * 0.75}
                  stroke="var(--warning)"
                  strokeWidth="2.5"
                />
              </g>
            </svg>
          </div>

          {/* Live Solution Card */}
          <div className="solution-summary-card">
            <div className="summary-col">
              <span className="stat-label">
                {language === 'es' ? 'Vértice Óptimo (x*, y*):' : 'Optimal Vertex (x*, y*):'}
              </span>
              <span className="stat-value highlight" style={{ color: 'var(--success)' }}>
                {solution.optimalPoint ? `(${solution.optimalPoint[0]}, ${solution.optimalPoint[1]})` : 'N/A'}
              </span>
            </div>
            <div className="summary-col">
              <span className="stat-label">
                {language === 'es' ? 'Valor Máximo z*:' : 'Maximum Value z*:'}
              </span>
              <span className="stat-value highlight" style={{ color: 'var(--success)' }}>
                {solution.optimalValue !== -Infinity ? solution.optimalValue : 'N/A'}
              </span>
            </div>
            <div className="summary-col">
              <span className="stat-label">
                {language === 'es' ? 'Vértices Factibles:' : 'Feasible Vertices:'}
              </span>
              <span className="stat-value">{solution.vertices.length}</span>
            </div>
            {selectedVertex && (
              <div className="summary-col">
                <span className="stat-label">
                  {language === 'es' ? 'Vértice Inspeccionado:' : 'Inspected Vertex:'}
                </span>
                <span className="stat-value" style={{ color: 'var(--accent)' }}>
                  ({selectedVertex[0]}, {selectedVertex[1]}) → z = {Number((c1 * selectedVertex[0] + c2 * selectedVertex[1]).toFixed(2))}
                </span>
              </div>
            )}
          </div>

          {/* Educational Callout */}
          <div className="educational-note">
            <h4>
              {language === 'es'
                ? 'Teorema Fundamental de la Programación Lineal'
                : 'Fundamental Theorem of Linear Programming'}
            </h4>
            <p>
              {language === 'es'
                ? 'Como la función objetivo es lineal y la región factible es un polítopo convexo, las curvas de nivel c₁x + c₂y = z son rectas paralelas con vector normal c = (c₁, c₂). Al desplazar la recta en la dirección de máximo crecimiento, el valor máximo siempre se alcanza en al menos un vértice extremo (marcado en verde). Por esta razón, el método Simplex sólo necesita evaluar vértices extremos en lugar de explorar el interior infinito.'
                : 'Because the objective function is linear and the feasible region is a convex polytope, the level curves c₁x + c₂y = z are parallel lines with normal vector c = (c₁, c₂). Shifting this line in the direction of steepest ascent guarantees the maximum is attained at an extreme vertex (marked green). Hence Simplex only tests extreme vertices instead of searching the infinite continuous interior.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="modeling-tab-content">
          <div className="problem-selector">
            <label className="row-label">
              {language === 'es' ? 'Seleccionar Problema para Modelar:' : 'Select Problem to Model:'}
            </label>
            <div className="preset-chips">
              <button
                className={`chip-btn ${modelingProblem === 'juan' ? 'selected' : ''}`}
                onClick={() => setModelingProblem('juan')}
              >
                Juan el Vago
              </button>
              <button
                className={`chip-btn ${modelingProblem === 'mochila' ? 'selected' : ''}`}
                onClick={() => setModelingProblem('mochila')}
              >
                Mochila 0/1
              </button>
              <button
                className={`chip-btn ${modelingProblem === 'vertex-cover' ? 'selected' : ''}`}
                onClick={() => setModelingProblem('vertex-cover')}
              >
                Vertex Cover Mínimo
              </button>
            </div>
          </div>

          {modelingProblem === 'juan' && (
            <div className="model-card">
              <h4>
                {language === 'es'
                  ? 'Modelo ILP: Juan el Vago (Guía PD, Ej. 4)'
                  : 'ILP Model: Juan the Slacker (DP Guide, Ex. 4)'}
              </h4>
              <div className="math-block">
                <div className="math-row">
                  <span className="math-label">Variables:</span>
                  <code>{'x_i ∈ {0, 1} para cada día i ∈ {0, ..., n-1} (1 si Juan trabaja el día i)'}</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Función Objetivo:</span>
                  <code>max z = ∑ (g_i · x_i)</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Restricciones:</span>
                  <code>{'x_i + x_{i+1} ≤ 1  para todo i ∈ {0, ..., n-2} (nunca dos días seguidos)'}</code>
                </div>
              </div>
              <p className="model-desc">
                {language === 'es'
                  ? 'Equivale formalmente al Maximum Weight Independent Set sobre un grafo camino (Path Graph). La matriz de restricciones es totalmente unimodular, por lo que su relajación lineal produce automáticamente soluciones enteras en tiempo polinomial.'
                  : 'Formally equivalent to Maximum Weight Independent Set on a path graph. The constraint matrix is totally unimodular, so its linear relaxation naturally yields integer solutions in polynomial time.'}
              </p>
            </div>
          )}

          {modelingProblem === 'mochila' && (
            <div className="model-card">
              <h4>
                {language === 'es'
                  ? 'Modelo ILP: Problema de la Mochila 0/1 (Guía PL, Ej. 1)'
                  : 'ILP Model: 0/1 Knapsack Problem (LP Guide, Ex. 1)'}
              </h4>
              <div className="math-block">
                <div className="math-row">
                  <span className="math-label">Variables:</span>
                  <code>{'x_i ∈ {0, 1} para cada ítem i ∈ {0, ..., n-1} (1 si se incluye el ítem i)'}</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Función Objetivo:</span>
                  <code>max z = ∑ (v_i · x_i)</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Restricciones:</span>
                  <code>∑ (w_i · x_i) ≤ W (capacidad de la mochila)</code>
                </div>
              </div>
              <p className="model-desc">
                {language === 'es'
                  ? 'Si relajamos x_i ∈ [0, 1], obtenemos la versión de la mochila fraccionaria (resoluble mediante Greedy en O(n log n)). La solución fraccionaria otorga una cota superior estricta para la solución entera.'
                  : 'Relaxing to x_i ∈ [0, 1] yields fractional knapsack (solvable greedily in O(n log n)). The fractional solution provides an upper bound for the integer optimum.'}
              </p>
            </div>
          )}

          {modelingProblem === 'vertex-cover' && (
            <div className="model-card">
              <h4>
                {language === 'es'
                  ? 'Modelo ILP: Cobertura de Vértices Mínima (Guía PL, Ej. 3)'
                  : 'ILP Model: Minimum Vertex Cover (LP Guide, Ex. 3)'}
              </h4>
              <div className="math-block">
                <div className="math-row">
                  <span className="math-label">Variables:</span>
                  <code>{'x_v ∈ {0, 1} para cada vértice v ∈ V (1 si v pertenece a la cobertura)'}</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Función Objetivo:</span>
                  <code>min z = ∑ x_v</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Restricciones:</span>
                  <code>x_u + x_v ≥ 1  para cada arista (u, v) ∈ E</code>
                </div>
              </div>
              <p className="model-desc">
                {language === 'es'
                  ? 'Al relajar x_v ∈ [0, 1], redondear cada x_v ≥ 1/2 a 1 produce un algoritmo de 2-aproximación polinomial para Vertex Cover, demostrando el poder del redondeo de LP.'
                  : 'Relaxing to x_v ∈ [0, 1] and rounding each x_v ≥ 1/2 to 1 gives a 2-approximation for Vertex Cover, demonstrating the power of LP rounding.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
