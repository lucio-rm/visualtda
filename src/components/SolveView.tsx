import React, { useState, useMemo, useRef } from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { EXERCISE_SOLVE_CONTENT, TestCaseResult } from '../engine/exerciseContent';
import { runPythonTests } from '../runtime/pythonTestRunner';
import { pythonService } from '../runtime/pythonExecutionService';
import { useStudentProgress } from '../context/StudentProgressContext';

interface SolveViewProps {
  exercise: ExerciseMetadata;
  onSuccess: () => void;
  onAdvanceToUnderstand?: () => void;
  onSkipToUnderstand: () => void;
  starterCode?: string;
}

export const SolveView: React.FC<SolveViewProps> = ({
  exercise,
  onSuccess,
  onAdvanceToUnderstand,
  onSkipToUnderstand,
  starterCode
}) => {
  const { language, t, dict } = useLanguage();
  const { markAttempted, markTesting, markPassed } = useStudentProgress();

  const content = useMemo(() => {
    return EXERCISE_SOLVE_CONTENT[exercise.id] || null;
  }, [exercise.id]);

  const storageKey = `visual_tda_code_${exercise.id}`;
  const defaultCode = starterCode || content?.starterCode || '# Escribí tu solución aquí en Python 3\ndef resolver():\n    pass\n';

  const [code, setCodeState] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved !== null ? saved : defaultCode;
    } catch {
      return defaultCode;
    }
  });

  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = useMemo(() => Math.max(code.split('\n').length, 1), [code]);

  const setCode = (newCode: string) => {
    setCodeState(newCode);
    markAttempted(exercise.id);
    try {
      sessionStorage.setItem(storageKey, newCode);
    } catch {
      // Ignore quota error
    }
  };

  const handleResetCode = () => {
    setCode(defaultCode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = '    ';
      const newCode = code.substring(0, start) + spaces + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + 4;
      });
    } else if (e.key === 'Enter') {
      const target = e.currentTarget;
      const start = target.selectionStart;
      const currentLine = code.substring(0, start).split('\n').pop() || '';
      const indentMatch = currentLine.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';
      if (currentLine.trim().endsWith(':')) {
        indent += '    ';
      }
      if (indent.length > 0) {
        e.preventDefault();
        const end = target.selectionEnd;
        const newCode = code.substring(0, start) + '\n' + indent + code.substring(end);
        setCode(newCode);
        requestAnimationFrame(() => {
          target.selectionStart = target.selectionEnd = start + 1 + indent.length;
        });
      }
    }
  };

  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const [testSummary, setTestSummary] = useState<string>('');
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [stdout, setStdout] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [execEngine, setExecEngine] = useState<'ts' | 'pyodide'>('ts');

  const hints = content?.hints || [
    {
      es: 'Pista 1: Identificá qué subproblemas se repiten o qué propiedad invariante debe mantenerse en cada paso.',
      en: 'Hint 1: Identify repeating subproblems or invariant properties that must hold at each step.'
    },
    {
      es: 'Pista 2: Analizá si podés podar ramas inviables tempranamente o si una elección local miope conduce al óptimo.',
      en: 'Hint 2: Analyze early pruning of infeasible branches or whether a greedy choice leads to global optimality.'
    },
    {
      es: 'Pista 3: Comprobá los casos base antes de generalizar el paso recursivo o inductivo.',
      en: 'Hint 3: Verify base cases before generalizing the recursive or inductive step.'
    }
  ];

  const toggleHint = (index: number) => {
    if (revealedHints.includes(index)) {
      setRevealedHints(revealedHints.filter((h) => h !== index));
    } else {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const handleRunTests = async () => {
    setExecEngine('ts');
    setTestStatus('running');
    setStdout(null);
    setRuntimeError(null);
    setExecutionTimeMs(null);
    setTestSummary(t(dict.testsRunning));

    // Async execution simulation
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (content?.runTests) {
      const evaluation = await content.runTests(code);
      setTestResults(evaluation.results);

      if (evaluation.passed) {
        setTestStatus('passed');
        markPassed(exercise.id, evaluation.totalPassed, evaluation.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evaluation.totalPassed} / ${evaluation.totalTests} casos de prueba superados con éxito.`
            : `${evaluation.totalPassed} / ${evaluation.totalTests} test cases passed successfully.`
        );
        onSuccess();
      } else {
        setTestStatus('failed');
        markTesting(exercise.id, evaluation.totalPassed, evaluation.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evaluation.totalPassed} / ${evaluation.totalTests} pruebas superadas. Revisá las condiciones y salidas fallidas en la tabla de abajo.`
            : `${evaluation.totalPassed} / ${evaluation.totalTests} tests passed. Check failed conditions and outputs below.`
        );
      }
    } else {
      // Evaluate against Python test runner with real test cases
      const evalResult = await runPythonTests(exercise.id, code);
      setTestResults(evalResult.results);
      if (evalResult.passed) {
        setTestStatus('passed');
        markPassed(exercise.id, evalResult.totalPassed, evalResult.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evalResult.totalPassed} / ${evalResult.totalTests} casos de prueba superados con éxito.`
            : `${evalResult.totalPassed} / ${evalResult.totalTests} test cases passed successfully.`
        );
        onSuccess();
      } else {
        setTestStatus('failed');
        markTesting(exercise.id, evalResult.totalPassed, evalResult.totalTests);
        setTestSummary(
          language === 'es'
            ? `${evalResult.totalPassed} / ${evalResult.totalTests} casos superados. El código no satisfizo todas las restricciones o contiene errores.`
            : `${evalResult.totalPassed} / ${evalResult.totalTests} passed. Code did not satisfy all constraints or contains errors.`
        );
      }
    }
  };

  const handleRunPyodide = async () => {
    setExecEngine('pyodide');
    setTestStatus('running');
    setStdout(null);
    setRuntimeError(null);
    setExecutionTimeMs(null);
    setTestSummary(
      language === 'es'
        ? 'Iniciando Web Worker y ejecutando en entorno Python (Pyodide)...'
        : 'Starting Web Worker and running in Python (Pyodide) environment...'
    );

    const evalResult = await runPythonTests(exercise.id, code);
    setStdout(evalResult.stdout || null);
    setRuntimeError(evalResult.runtimeError || null);
    setExecutionTimeMs(evalResult.executionTimeMs);

    const effectiveResults: TestCaseResult[] =
      evalResult.results && evalResult.results.length > 0
        ? evalResult.results
        : [
            {
              testId: 'py-runtime-error',
              description: {
                es: 'Compilación y Ejecución en Entorno Python',
                en: 'Compilation and Execution in Python Environment'
              },
              passed: false,
              message: evalResult.runtimeError || (language === 'es' ? 'El código no pudo ejecutarse correctamente.' : 'Code failed to execute cleanly.'),
              expected: language === 'es' ? 'Ejecución limpia sin excepciones' : 'Clean execution without exceptions',
              actual: evalResult.runtimeError
                ? (language === 'es' ? 'Excepción / Error en ejecución' : 'Exception / Runtime error')
                : (language === 'es' ? 'Fallo en la ejecución' : 'Execution failure')
            }
          ];

    setTestResults(effectiveResults);

    if (evalResult.runtimeError) {
      setTestStatus('failed');
      markTesting(exercise.id, evalResult.totalPassed, evalResult.totalTests);
      setTestSummary(
        language === 'es'
          ? 'Error detectado durante la ejecución en Python. Revisa la traza abajo y los casos fallidos.'
          : 'Error detected during Python execution. Check the traceback and failed test cases below.'
      );
    } else if (evalResult.passed) {
      setTestStatus('passed');
      markPassed(exercise.id, evalResult.totalPassed, evalResult.totalTests);
      setTestSummary(
        language === 'es'
          ? `${evalResult.totalPassed} / ${evalResult.totalTests} pruebas superadas exitosamente en ${Math.round(evalResult.executionTimeMs)} ms.`
          : `${evalResult.totalPassed} / ${evalResult.totalTests} tests passed successfully in ${Math.round(evalResult.executionTimeMs)} ms.`
      );
      onSuccess();
    } else {
      setTestStatus('failed');
      markTesting(exercise.id, evalResult.totalPassed, evalResult.totalTests);
      setTestSummary(
        language === 'es'
          ? `${evalResult.totalPassed} / ${evalResult.totalTests} pruebas superadas. Revisa los casos fallidos en la tabla.`
          : `${evalResult.totalPassed} / ${evalResult.totalTests} tests passed. Check failed test cases in table.`
      );
    }
  };

  return (
    <section className="phase-view solve-view" aria-labelledby="solve-heading">
      <div className="view-intro">
        <h3 id="solve-heading" className="view-title">
          {t(dict.solveTitle)}
        </h3>
        <p className="view-lead">
          {t(dict.solveLead)}
        </p>
      </div>

      <div className="solve-layout">
        <div className="solve-editor-column">
          <div className="editor-card">
            <div className="editor-header">
              <div className="editor-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="editor-lang-badge">Python 3</span>
                <span className="editor-filename">solucion.py</span>
              </div>
              <button
                type="button"
                className="btn-reset-code"
                onClick={handleResetCode}
                title={t(dict.resetTemplateAriaLabel)}
                aria-label={t(dict.resetTemplateAriaLabel)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
              >
                {t(dict.resetTemplate)}
              </button>
            </div>
            <div className="editor-input-wrapper">
              <div ref={gutterRef} className="editor-gutter" aria-hidden="true">
                {Array.from({ length: lineCount }, (_, i) => (
                  <span key={i + 1} className="editor-line-number">
                    {i + 1}
                  </span>
                ))}
              </div>
              <textarea
                className="code-editor-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                onScroll={(e) => {
                  if (gutterRef.current) {
                    gutterRef.current.scrollTop = e.currentTarget.scrollTop;
                  }
                }}
                rows={14}
                aria-label={t(dict.codeEditorAriaLabel)}
                spellCheck={false}
              />
            </div>
            <div className="editor-actions">
              <button
                type="button"
                className="btn-fast-tests"
                onClick={handleRunTests}
                disabled={testStatus === 'running'}
                title={t(dict.tsValidationTitle)}
              >
                {testStatus === 'running' && execEngine === 'ts' ? t(dict.testsRunning) : t(dict.runTests)}
              </button>

              {pythonService.isSupported && (
                <button
                  type="button"
                  className="btn-pyodide"
                  onClick={handleRunPyodide}
                  disabled={testStatus === 'running'}
                  title={t(dict.pyodideValidationTitle)}
                >
                  {testStatus === 'running' && execEngine === 'pyodide' ? t(dict.testsRunning) : t(dict.runPyodideTests)}
                </button>
              )}
            </div>
          </div>

          {testStatus !== 'idle' && (
            <div className={`test-feedback-card ${testStatus}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{t(dict.evaluationResult)}</h4>
                {executionTimeMs !== null && (
                  <div className="test-meta-bar">
                    <span className="test-meta-badge">
                      {execEngine === 'pyodide' ? 'Python Web Worker' : 'TypeScript Validator'}
                    </span>
                    <span>{t(dict.executionTime)} {Math.round(executionTimeMs)} ms</span>
                  </div>
                )}
              </div>

              <p className="test-summary-message">{testSummary}</p>

              {runtimeError && (() => {
                const isInfraError =
                  runtimeError.includes('Pyodide') ||
                  runtimeError.includes('Web Worker') ||
                  runtimeError.includes('CDN') ||
                  runtimeError.includes('WebAssembly') ||
                  runtimeError.includes('estrategia de pruebas');

                return (
                  <div className={`python-output-card ${isInfraError ? 'infra-error' : 'student-error'}`}>
                    <div className="python-output-header">
                      {isInfraError
                        ? (language === 'es' ? 'Fallo de Inicialización del Entorno (Infraestructura)' : 'Environment Initialization Failure (Infrastructure)')
                        : (language === 'es' ? 'Excepción / Error en Tiempo de Ejecución en tu Código' : 'Runtime Exception / Error in Your Code')}
                    </div>
                    <pre className="python-error-box">{runtimeError}</pre>
                    {isInfraError && (
                      <p style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {language === 'es'
                          ? 'Este fallo se debe a la inicialización de WebAssembly/Pyodide, no a un error de lógica en tu solución. Podés reintentar la ejecución o usar las Pruebas Rápidas locales.'
                          : 'This failure is due to WebAssembly/Pyodide initialization, not your solution logic. You can retry or use Fast local tests.'}
                      </p>
                    )}
                  </div>
                );
              })()}

              {stdout && (
                <div className="python-output-card">
                  <div className="python-output-header">{t(dict.pythonStdOutput)}</div>
                  <pre className="python-stdout-box">{stdout}</pre>
                </div>
              )}

              {testResults.length > 0 && (
                <div className="test-case-results-list">
                  {testResults.map((tr) => (
                    <div key={tr.testId} className={`test-case-item ${tr.passed ? 'pass' : 'fail'}`}>
                      <span className="test-case-badge">{tr.passed ? 'PASS' : 'FAIL'}</span>
                      <div className="test-case-details">
                        <span className="test-case-desc">{t(tr.description)}</span>
                        {tr.message && <span className="test-case-msg">{tr.message}</span>}
                        {tr.actual && !tr.passed && (
                          <span className="test-case-actual">
                            {language === 'es' ? 'Obtenido' : 'Actual'}: {tr.actual} | {language === 'es' ? 'Esperado' : 'Expected'}: {tr.expected}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {testStatus === 'passed' && (
                <button
                  type="button"
                  className="btn-primary mt-2"
                  onClick={onAdvanceToUnderstand || onSuccess}
                >
                  {t(dict.proceedToUnderstand)}
                </button>
              )}
            </div>
          )}
        </div>

        <aside className="solve-sidebar">
          <div className="hints-card">
            <h4>{t(dict.hintsTitle)}</h4>
            <p className="hints-desc">
              {t(dict.hintsDesc)}
            </p>
            <div className="hints-list">
              {hints.map((hint, idx) => {
                const isRevealed = revealedHints.includes(idx);
                return (
                  <div key={idx} className="hint-item">
                    <button
                      type="button"
                      className={`btn-toggle-hint ${isRevealed ? 'revealed' : ''}`}
                      onClick={() => toggleHint(idx)}
                      aria-expanded={isRevealed}
                    >
                      {isRevealed
                        ? `▼ ${t(dict.hintLabel)} ${idx + 1}`
                        : `▶ ${t(dict.viewHintLabel)} ${idx + 1}`}
                    </button>
                    {isRevealed && <div className="hint-content">{t(hint)}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="skip-solution-card">
            <h4>{t(dict.skipSolutionTitle)}</h4>
            <p>
              {t(dict.skipSolutionDesc)}
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowSkipModal(true)}
            >
              {t(dict.viewCanonicalSolution)}
            </button>
          </div>
        </aside>
      </div>

      {showSkipModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="skip-dialog-title">
          <div className="modal-card">
            <h4 id="skip-dialog-title">{t(dict.skipModalTitle)}</h4>
            <p>{t(dict.skipModalBody)}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSkipModal(false)}
              >
                {t(dict.skipModalCancel)}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowSkipModal(false);
                  onSkipToUnderstand();
                }}
              >
                {t(dict.skipModalConfirm)} &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
