import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { solveLP2D, LinearConstraint } from '../../engine/algorithms/linearProgrammingValidator';
import './LinearProgrammingPlayground.css';

interface LPPreset {
  name: { es: string; en: string };
  objective: [number, number];
  constraints: LinearConstraint[];
}

const PRESETS: LPPreset[] = [
  {
    name: { es: 'Problema de Producción (3 restricciones)', en: 'Production Problem (3 constraints)' },
    objective: [3, 2],
    constraints: [
      { a: 2, b: 1, c: 18, label: '2x + y <= 18' },
      { a: 2, b: 3, c: 42, label: '2x + 3y <= 42' },
      { a: 3, b: 1, c: 24, label: '3x + y <= 24' }
    ]
  },
  {
    name: { es: 'Wyndor Glass (Hillier & Lieberman)', en: 'Wyndor Glass (Hillier & Lieberman)' },
    objective: [3, 5],
    constraints: [
      { a: 1, b: 0, c: 4, label: 'x <= 4 (Planta 1)' },
      { a: 0, b: 2, c: 12, label: '2y <= 12 (Planta 2)' },
      { a: 3, b: 2, c: 18, label: '3x + 2y <= 18 (Planta 3)' }
    ]
  },
  {
    name: { es: 'Mochila Continua 2 Ítems', en: 'Continuous Knapsack 2 Items' },
    objective: [5, 6],
    constraints: [
      { a: 2, b: 3, c: 12, label: '2x + 3y <= 12 (Capacidad)' },
      { a: 1, b: 0, c: 4, label: 'x <= 4' },
      { a: 0, b: 1, c: 3, label: 'y <= 3' }
    ]
  }
];

export const LinearProgrammingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markCompleted } = useStudentProgress();
  const [activeTab, setActiveTab] = useState<'geometric' | 'modeling'>('geometric');
  const [modelingProblem, setModelingProblem] = useState<'juan' | 'mochila' | 'vertex-cover'>('juan');

  const [c1, setC1] = useState<number>(3);
  const [c2, setC2] = useState<number>(2);
  const [activePreset, setActivePreset] = useState<LPPreset>(PRESETS[0]);

  const solution = useMemo(() => {
    return solveLP2D([c1, c2], activePreset.constraints);
  }, [c1, c2, activePreset]);

  useEffect(() => {
    if (solution && solution.optimalPoint) {
      markCompleted('linear-programming-formulation');
    }
  }, [solution, markCompleted]);

  const handlePresetSelect = (p: LPPreset) => {
    setActivePreset(p);
    setC1(p.objective[0]);
    setC2(p.objective[1]);
  };

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
            ? 'Explora la geometría de las soluciones óptimas en el plano continuo o inspecciona la formulación formal en Programación Lineal Entera de problemas clásicos de la cátedra.'
            : 'Explore the geometry of optimal solutions on the continuous plane or inspect the integer linear programming formulation of classic course problems.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="playground-tabs">
        <button
          className={`tab-btn ${activeTab === 'geometric' ? 'active' : ''}`}
          onClick={() => setActiveTab('geometric')}
        >
          {language === 'es' ? '📐 Geometría 2D y Teorema Fundamental' : '📐 2D Geometry & Fundamental Theorem'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'modeling' ? 'active' : ''}`}
          onClick={() => setActiveTab('modeling')}
        >
          {language === 'es' ? '📝 Modelado ILP de Problemas TDA' : '📝 ILP Modeling for TDA Problems'}
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
              {language === 'es' ? 'Ajustar Vector Objetivo c = (c1, c2):' : 'Adjust Objective Vector c = (c1, c2):'}
            </div>
            <div className="sliders-row">
              <div className="slider-group">
                <label>c1 (coeficiente X): <strong>{c1}</strong></label>
                <input
                  type="range"
                  min={-5}
                  max={10}
                  step={1}
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value))}
                />
              </div>
              <div className="slider-group">
                <label>c2 (coeficiente Y): <strong>{c2}</strong></label>
                <input
                  type="range"
                  min={-5}
                  max={10}
                  step={1}
                  value={c2}
                  onChange={(e) => setC2(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Live Solution Card */}
          <div className="solution-summary-card">
            <div className="summary-col">
              <span className="stat-label">
                {language === 'es' ? 'Vértice Óptimo (x*, y*):' : 'Optimal Vertex (x*, y*):'}
              </span>
              <span className="stat-value highlight">
                {solution.optimalPoint ? `(${solution.optimalPoint[0]}, ${solution.optimalPoint[1]})` : 'N/A'}
              </span>
            </div>
            <div className="summary-col">
              <span className="stat-label">
                {language === 'es' ? 'Valor Máximo z*:' : 'Maximum Value z*:'}
              </span>
              <span className="stat-value highlight">
                {solution.optimalValue !== -Infinity ? solution.optimalValue : 'N/A'}
              </span>
            </div>
            <div className="summary-col">
              <span className="stat-label">
                {language === 'es' ? 'Vértices Factibles Totales:' : 'Total Feasible Vertices:'}
              </span>
              <span className="stat-value">{solution.vertices.length}</span>
            </div>
          </div>

          {/* Educational Callout */}
          <div className="educational-note">
            <h4>
              {language === 'es'
                ? '💡 Teorema Fundamental de la Programación Lineal'
                : '💡 Fundamental Theorem of Linear Programming'}
            </h4>
            <p>
              {language === 'es'
                ? 'Como la función objetivo es lineal y la región factible es un polítopo convexo, las curvas de nivel son hiperplanos paralelos. El valor máximo siempre se alcanza en al menos un vértice extremo. Por esta razón, algoritmos como Simplex sólo necesitan recorrer los vértices a lo largo de aristas sin tener que explorar el interior continuo.'
                : 'Because the objective function is linear and the feasible region is a convex polytope, level curves are parallel hyperplanes. The maximum is always attained at an extreme vertex. This is why algorithms like Simplex only need to traverse vertices along edges.'}
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
                  <code>x_i ∈ &#123;0, 1&#125; para cada día i ∈ &#123;0, ..., n-1&#125; (1 si Juan trabaja el día i)</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Función Objetivo:</span>
                  <code>max z = ∑ (g_i · x_i)</code>
                </div>
                <div className="math-row">
                  <span className="math-label">Restricciones:</span>
                  <code>x_i + x_&#123;i+1&#125; ≤ 1  para todo i ∈ &#123;0, ..., n-2&#125; (nunca dos días seguidos)</code>
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
                  <code>x_i ∈ &#123;0, 1&#125; para cada ítem i ∈ &#123;0, ..., n-1&#125; (1 si se incluye el ítem i)</code>
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
                  <code>x_v ∈ &#123;0, 1&#125; para cada vértice v ∈ V (1 si v pertenece a la cobertura)</code>
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
