import React from 'react';
import type { ExerciseMetadata } from '../types';
import type { TestCaseResult } from '../engine/exerciseContent';
import './VisualTestFailureInspector.css';

interface VisualTestFailureInspectorProps {
  testResult: TestCaseResult;
  exercise: ExerciseMetadata;
  language: 'es' | 'en';
  onClose: () => void;
  onOpenInVisualizer?: () => void;
}

export const getPedagogicalDiagnosis = (
  exercise: ExerciseMetadata,
  testResult: TestCaseResult,
  language: 'es' | 'en'
): { title: string; explanation: string; tip: string } => {
  const isEs = language === 'es';
  const cat = exercise.categoryId || exercise.techniqueId || '';
  const actualStr = String(testResult.actual ?? '');
  const expectedStr = String(testResult.expected ?? '');

  if (cat.includes('greedy')) {
    return {
      title: isEs ? 'Posible sesgo de elección miope (Greedy Choice)' : 'Potential Myopic Greedy Bias',
      explanation: isEs
        ? 'Las heurísticas voraces son sensibles al criterio de ordenamiento. Si tu algoritmo eligió un elemento por duración, peso o ganancia inmediata, pudo haber bloqueado una combinación de mayor valor global.'
        : 'Greedy heuristics depend critically on the sorting criteria. Choosing elements by immediate local benefit may have precluded a globally superior combination.',
      tip: isEs
        ? 'Comprobá el criterio de desempate y verificá si tu regla voraz satisface la propiedad de la elección glotona con el argumento de intercambio.'
        : 'Verify your tie-breaking logic and confirm your greedy rule satisfies the greedy-choice property via exchange arguments.'
    };
  }

  if (cat.includes('dynamic-programming')) {
    return {
      title: isEs ? 'Desajuste en caso base o relación de recurrencia' : 'Base Case or Recurrence Mismatch',
      explanation: isEs
        ? 'En programación dinámica, una discrepancia numérica suele deberse a un índice desplazado (off-by-one), no inicializar el caso base (e.g. 0 o infinito), o no considerar la opción de "no incluir" el elemento.'
        : 'In dynamic programming, numerical discrepancies typically stem from off-by-one indices, uninitialized base cases (e.g., 0 or infinity), or omitting the "skip element" transition.',
      tip: isEs
        ? 'Revisá las dimensiones de tu tabla/memoization y comprobá si estás tomando el máximo o mínimo correcto en cada transición.'
        : 'Check your memoization table bounds and verify whether you are taking the correct min/max over all valid choices.'
    };
  }

  if (cat.includes('divide-and-conquer')) {
    return {
      title: isEs ? 'Frontera de partición o caso de cruce' : 'Partition Boundary or Crossing Case',
      explanation: isEs
        ? 'Los algoritmos de división y conquista suelen fallar cuando el subproblema cruza la frontera del punto medio ($mid$), o cuando el tamaño del arreglo es impar/pequeño (1 o 2 elementos).'
        : 'Divide and conquer algorithms commonly fail when the optimal subproblem crosses the split boundary ($mid$), or on small subproblem edge sizes (1 or 2 items).',
      tip: isEs
        ? 'Asegurate de que la combinación (combine step) evalúe correctamente los candidatos que abarcan ambas mitades.'
        : 'Ensure your combine step properly reconciles candidates spanning across both left and right halves.'
    };
  }

  if (cat.includes('backtracking') || cat.includes('branch-and-bound')) {
    return {
      title: isEs ? 'Poda prematura o estado no restaurado' : 'Premature Pruning or State Leaks',
      explanation: isEs
        ? 'En exploración exhaustiva y backtracking, olvidar revertir una mutación al salir del llamado recursivo o podar una rama válida produce soluciones incompletas.'
        : 'In exhaustive backtracking, forgetting to undo a state mutation upon recursion return or over-pruning leads to missing valid solutions.',
      tip: isEs
        ? 'Verificá que el desmarcado de casilleros o variables ocurra exactamente simétrico al marcado al retroceder.'
        : 'Ensure your unmark/backtrack operations strictly mirror your forward mark step.'
    };
  }

  // Fallback diagnostic
  return {
    title: isEs ? 'Discrepancia en Restricciones o Caso Borde' : 'Constraint or Edge Case Discrepancy',
    explanation: isEs
      ? `Tu algoritmo devolvió "${actualStr}" mientras que la solución canónica requiere "${expectedStr}". Esto suele ocurrir ante entradas vacías, duplicados o condiciones límite.`
      : `Your algorithm produced "${actualStr}" while canonical requirements dictate "${expectedStr}". This often occurs on empty inputs, duplicates, or boundary conditions.`,
    tip: isEs
      ? 'Aislá este caso de prueba con valores mínimos o nulos para verificar el flujo de control.'
      : 'Isolate this test case using minimal or empty inputs to track exact control flow.'
  };
};

export const VisualTestFailureInspector: React.FC<VisualTestFailureInspectorProps> = ({
  testResult,
  exercise,
  language,
  onClose,
  onOpenInVisualizer
}) => {
  const diagnosis = getPedagogicalDiagnosis(exercise, testResult, language);
  const isEs = language === 'es';

  const formatVal = (v: unknown): string => {
    if (v === null || v === undefined) return isEs ? '(vacío / indefinido)' : '(null / undefined)';
    if (typeof v === 'object') {
      try {
        return JSON.stringify(v, null, 2);
      } catch {
        return String(v);
      }
    }
    return String(v);
  };

  const actualDisplay = formatVal(testResult.actual);
  const expectedDisplay = formatVal(testResult.expected);

  return (
    <div
      className="test-failure-inspector-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="inspector-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="test-failure-inspector-card">
        <header className="test-failure-inspector-header">
          <div className="test-failure-header-title-row">
            <span className="test-failure-icon" aria-hidden="true">🔍</span>
            <div>
              <h3 id="inspector-dialog-title" className="test-failure-title">
                {isEs ? 'Diagnóstico Pedagógico de Caso Fallido' : 'Pedagogical Failure Inspector'}
              </h3>
              <p className="test-failure-subtitle">
                {typeof testResult.description === 'string'
                  ? testResult.description
                  : testResult.description[language] || testResult.description.es}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="test-failure-close-btn"
            onClick={onClose}
            aria-label={isEs ? 'Cerrar inspector' : 'Close inspector'}
          >
            ✕
          </button>
        </header>

        <div className="test-failure-inspector-body">
          {/* Output Comparison Diff */}
          <div className="diff-comparison-grid">
            <div className="diff-box diff-box-actual">
              <div className="diff-box-label">
                <span className="diff-dot diff-dot-actual" />
                <strong>{isEs ? 'Obtenido (Tu Solución)' : 'Actual (Your Code)'}</strong>
              </div>
              <pre className="diff-pre actual-pre">{actualDisplay}</pre>
            </div>

            <div className="diff-box diff-box-expected">
              <div className="diff-box-label">
                <span className="diff-dot diff-dot-expected" />
                <strong>{isEs ? 'Esperado (Óptimo / Canónico)' : 'Expected (Optimal / Canonical)'}</strong>
              </div>
              <pre className="diff-pre expected-pre">{expectedDisplay}</pre>
            </div>
          </div>

          {/* Error Message if present */}
          {testResult.message && (
            <div className="test-failure-message-banner">
              <strong>{isEs ? 'Detalle:' : 'Detail:'}</strong> {testResult.message}
            </div>
          )}

          {/* Pedagogical Diagnostic Reasoning */}
          <div className="pedagogical-diagnosis-card">
            <div className="diagnosis-badge-title">
              <span className="diagnosis-sparkle" aria-hidden="true">💡</span>
              <h4>{diagnosis.title}</h4>
            </div>
            <p className="diagnosis-explanation">{diagnosis.explanation}</p>
            <div className="diagnosis-tip-box">
              <strong>{isEs ? 'Sugerencia de depuración:' : 'Debugging Hint:'}</strong> {diagnosis.tip}
            </div>
          </div>
        </div>

        <footer className="test-failure-inspector-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {isEs ? 'Volver al Código' : 'Back to Code'}
          </button>
          {onOpenInVisualizer && (
            <button
              type="button"
              className="btn-primary inspector-action-btn"
              onClick={() => {
                onClose();
                onOpenInVisualizer();
              }}
            >
              <span>{isEs ? 'Analizar en Visualizador' : 'Inspect in Visualizer'}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
