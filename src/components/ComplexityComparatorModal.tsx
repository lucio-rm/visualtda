import React, { useState, useEffect } from 'react';
import './ComplexityComparatorModal.css';

export interface ComplexityComparatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'es' | 'en';
}

interface ComplexityClass {
  notation: string;
  name: { es: string; en: string };
  category: { es: string; en: string };
  evaluator: (n: number) => { ops: number | string; approxSeconds: number | string; status: 'instant' | 'fast' | 'moderate' | 'slow' | 'intractable' };
  examples: string[];
}

function formatOps(n: number | string): string {
  if (typeof n === 'string') return n;
  if (n < 10000) return n.toLocaleString();
  if (n < 1e6) return `${(n / 1000).toFixed(1)}k`;
  if (n < 1e9) return `${(n / 1e6).toFixed(1)}M`;
  if (n < 1e12) return `${(n / 1e9).toFixed(2)}G (Mil millones)`;
  return n.toExponential(2);
}

function formatTime(secs: number | string, lang: 'es' | 'en'): string {
  if (typeof secs === 'string') return secs;
  const isEs = lang === 'es';
  if (secs < 1e-6) return `< 1 µs (${isEs ? 'instantáneo' : 'instant'})`;
  if (secs < 1e-3) return `${(secs * 1e6).toFixed(1)} µs`;
  if (secs < 1) return `${(secs * 1000).toFixed(1)} ms`;
  if (secs < 60) return `${secs.toFixed(2)} s`;
  if (secs < 3600) return `${(secs / 60).toFixed(1)} min`;
  if (secs < 86400) return `${(secs / 3600).toFixed(1)} ${isEs ? 'horas' : 'hours'}`;
  if (secs < 31536000) return `${(secs / 86400).toFixed(1)} ${isEs ? 'días' : 'days'}`;
  const years = secs / 31536000;
  if (years < 100) return `${years.toFixed(1)} ${isEs ? 'años' : 'years'}`;
  if (years < 1e6) return `${(years / 1000).toFixed(1)} ${isEs ? 'milenios' : 'millennia'}`;
  return `${years.toExponential(1)} ${isEs ? 'años (> edad del universo)' : 'years (> age of universe)'}`;
}

const COMPLEXITY_CLASSES: ComplexityClass[] = [
  {
    notation: 'O(1)',
    name: { es: 'Constante', en: 'Constant' },
    category: { es: 'Inmediato', en: 'Immediate' },
    evaluator: () => ({ ops: 1, approxSeconds: 1e-9, status: 'instant' }),
    examples: ['Hash lookup', 'Array index', 'Guard clause']
  },
  {
    notation: 'O(log n)',
    name: { es: 'Logarítmico', en: 'Logarithmic' },
    category: { es: 'Excelente', en: 'Excellent' },
    evaluator: (n) => {
      const ops = Math.ceil(Math.log2(Math.max(1, n)));
      return { ops, approxSeconds: ops * 1e-9, status: 'instant' };
    },
    examples: ['Búsqueda Binaria', 'Peak Finding (1D)', 'Predecesor p(j)']
  },
  {
    notation: 'O(n)',
    name: { es: 'Lineal', en: 'Linear' },
    category: { es: 'Óptimo Práctico', en: 'Practically Optimal' },
    evaluator: (n) => ({ ops: n, approxSeconds: n * 1e-9, status: 'fast' }),
    examples: ['Mediana de Medianas (BFPRT)', 'Juan el Vago (DP 1D)', 'Majority Element']
  },
  {
    notation: 'O(n log n)',
    name: { es: 'Linealítmico', en: 'Linearithmic' },
    category: { es: 'Estándar Ordenamiento', en: 'Sorting Standard' },
    evaluator: (n) => {
      const ops = Math.ceil(n * Math.log2(Math.max(1, n)));
      return { ops, approxSeconds: ops * 1e-9, status: 'fast' };
    },
    examples: ['Merge Sort', 'Interval Scheduling', 'Kruskal MST', 'Par Más Cercano']
  },
  {
    notation: 'O(n²)',
    name: { es: 'Cuadrático', en: 'Quadratic' },
    category: { es: 'Polinomial Aceptable', en: 'Acceptable Polynomial' },
    evaluator: (n) => {
      const ops = n * n;
      return { ops, approxSeconds: ops * 1e-9, status: ops > 1e8 ? 'moderate' : 'fast' };
    },
    examples: ['Segmented Least Squares (DP)', 'LCS 2D', 'Inversion Counting (naive)']
  },
  {
    notation: 'O(n³)',
    name: { es: 'Cúbico', en: 'Cubic' },
    category: { es: 'Polinomial Pesado', en: 'Heavy Polynomial' },
    evaluator: (n) => {
      const ops = Math.pow(n, 3);
      return { ops, approxSeconds: ops * 1e-9, status: ops > 1e9 ? 'slow' : 'moderate' };
    },
    examples: ['RNA Secondary Structure (DP)', 'Multiplicación Matricial Clásica']
  },
  {
    notation: 'O(2ⁿ)',
    name: { es: 'Exponencial', en: 'Exponential' },
    category: { es: 'Intratable', en: 'Intractable' },
    evaluator: (n) => {
      if (n > 60) return { ops: '2^' + n, approxSeconds: 'Infinito', status: 'intractable' };
      const ops = Math.pow(2, n);
      return { ops, approxSeconds: ops * 1e-9, status: n > 30 ? 'intractable' : 'slow' };
    },
    examples: ['Subset Sum (exhaustivo)', 'Mochila 0-1 (fuerza bruta)', 'Vertex Cover (exacto)']
  },
  {
    notation: 'O(n!)',
    name: { es: 'Factorial', en: 'Factorial' },
    category: { es: 'Hiper-intratable', en: 'Hyper-intractable' },
    evaluator: (n) => {
      if (n > 15) return { ops: n + '!', approxSeconds: 'Infinito', status: 'intractable' };
      let fact = 1;
      for (let i = 2; i <= n; i++) fact *= i;
      return { ops: fact, approxSeconds: fact * 1e-9, status: n > 12 ? 'intractable' : 'slow' };
    },
    examples: ['TSP (permutaciones)', 'Hamiltonian Cycle (naive)', 'N-Queens (fuerza bruta)']
  }
];

export const ComplexityComparatorModal: React.FC<ComplexityComparatorModalProps> = ({
  isOpen,
  onClose,
  language
}) => {
  const [nValue, setNValue] = useState<number>(20);
  const isEs = language === 'es';

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const presets = [10, 20, 50, 100, 1000, 10000];

  return (
    <div className="complexity-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Comparador Asintótico">
      <div className="complexity-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="complexity-modal-header">
          <div className="complexity-header-title">
            <span className="complexity-badge">f(n)</span>
            <h3>{isEs ? 'Laboratorio Asintótico: Comparador de Complejidad' : 'Asymptotic Laboratory: Complexity Comparator'}</h3>
          </div>
          <button type="button" className="complexity-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <div className="complexity-modal-body">
          <p className="complexity-modal-intro">
            {isEs
              ? 'Analizá el crecimiento del número de operaciones y tiempo estimado a 1 GHz (10⁹ ops/seg) según Kleinberg & Tardos (Capítulo 2).'
              : 'Analyze operation growth and estimated 1 GHz wall-clock execution time based on Kleinberg & Tardos (Chapter 2).'}
          </p>

          {/* Controls bar */}
          <div className="complexity-input-bar">
            <label htmlFor="complexity-n-input" className="complexity-input-label">
              {isEs ? 'Tamaño de Entrada n:' : 'Input Size n:'}
            </label>
            <input
              id="complexity-n-input"
              type="number"
              min={1}
              max={1000000}
              value={nValue}
              onChange={(e) => setNValue(Math.max(1, Math.min(1000000, Number(e.target.value) || 1)))}
              className="complexity-n-field"
            />
            <div className="complexity-presets-pills">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`complexity-preset-pill ${nValue === p ? 'active' : ''}`}
                  onClick={() => setNValue(p)}
                >
                  n={p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Table of Asymptotic classes */}
          <div className="complexity-table-wrapper">
            <table className="complexity-table">
              <thead>
                <tr>
                  <th>{isEs ? 'Clase Asintótica' : 'Asymptotic Class'}</th>
                  <th>{isEs ? 'Tipo de Crecimiento' : 'Growth Type'}</th>
                  <th>{isEs ? 'Operaciones f(n)' : 'Operations f(n)'}</th>
                  <th>{isEs ? 'Tiempo Estimado (1 GHz)' : 'Estimated Time (1 GHz)'}</th>
                  <th>{isEs ? 'Ejemplos en Visual TDA' : 'Visual TDA Examples'}</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_CLASSES.map((cls) => {
                  const evalResult = cls.evaluator(nValue);
                  const isIntractable = evalResult.status === 'intractable';

                  return (
                    <tr key={cls.notation} className={`complexity-row ${evalResult.status}`}>
                      <td className="col-notation">
                        <code>{cls.notation}</code>
                      </td>
                      <td className="col-name">
                        <span className="complexity-name-badge">{cls.name[language]}</span>
                      </td>
                      <td className="col-ops">
                        <span className={`ops-value ${isIntractable ? 'ops-danger' : ''}`}>
                          {formatOps(evalResult.ops)}
                        </span>
                      </td>
                      <td className="col-time">
                        <span className={`time-badge time-${evalResult.status}`}>
                          {formatTime(evalResult.approxSeconds, language)}
                        </span>
                      </td>
                      <td className="col-examples">
                        <div className="example-chips">
                          {cls.examples.map((ex) => (
                            <span key={ex} className="example-chip">{ex}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {nValue >= 30 && (
            <div className="complexity-intractable-banner">
              ⚠️ <strong>{isEs ? 'Barrera de Intratabilidad' : 'Intractability Boundary'}:</strong>{' '}
              {isEs
                ? `Para n = ${nValue}, las soluciones de fuerza bruta O(2ⁿ) y O(n!) superan los recursos computacionales del universo. Por ello, en Visual TDA estudiamos Programación Dinámica, Algoritmos Voraces y Técnicas de Aproximación.`
                : `For n = ${nValue}, brute-force algorithms O(2ⁿ) and O(n!) exceed universe computational limits. That is why Visual TDA focuses on Dynamic Programming, Greedy, and Approximation.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
