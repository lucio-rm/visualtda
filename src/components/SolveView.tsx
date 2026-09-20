import React, { useState, useMemo } from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { EXERCISE_SOLVE_CONTENT, TestCaseResult } from '../engine/exerciseContent';
import { runPythonTests } from '../runtime/pythonTestRunner';
import { pythonService } from '../runtime/pythonExecutionService';

interface SolveViewProps {
  exercise: ExerciseMetadata;
  onSuccess: () => void;
  onSkipToUnderstand: () => void;
  starterCode?: string;
}

export const SolveView: React.FC<SolveViewProps> = ({
  exercise,
  onSuccess,
  onSkipToUnderstand,
  starterCode
}) => {
  const { language, t, dict } = useLanguage();

  const content = useMemo(() => {
    return EXERCISE_SOLVE_CONTENT[exercise.id] || null;
  }, [exercise.id]);

  const storageKey = `visual_tda_code_${exercise.id}`;
  const defaultCode = starterCode || content?.starterCode || '# Escribe tu solución aquí en Python\ndef resolver():\n    pass\n';

  const [code, setCodeState] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved !== null ? saved : defaultCode;
    } catch {
      return defaultCode;
    }
  });

  const setCode = (newCode: string) => {
    setCodeState(newCode);
    try {
      sessionStorage.setItem(storageKey, newCode);
    } catch {
      // Ignore quota error
    }
  };

  const handleResetCode = () => {
    setCode(defaultCode);
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
      es: 'Pista 1: Identifica qué información mínima necesitas recordar al avanzar de una etapa a la siguiente.',
      en: 'Hint 1: Identify what minimal information you need to maintain when advancing stages.'
    },
    {
      es: 'Pista 2: Cada decisión restringe fuertemente las opciones futuras. Intenta podar tan pronto como se detecte una incompatibilidad.',
      en: 'Hint 2: Early pruning: discard infeasible candidate decisions as soon as constraints are violated.'
    },
    {
      es: 'Pista 3: Construye la solución de forma sistemática y verifica la corrección sobre casos base antes de generalizar.',
      en: 'Hint 3: Construct solutions systematically and verify base cases before generalizing.'
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
        setTestSummary(
          language === 'es'
            ? `✓ ¡Excelente! ${evaluation.totalPassed} / ${evaluation.totalTests} casos de prueba superados con éxito.`
            : `✓ Excellent! ${evaluation.totalPassed} / ${evaluation.totalTests} test cases passed successfully.`
        );
        onSuccess();
      } else {
        setTestStatus('failed');
        setTestSummary(
          language === 'es'
            ? `${evaluation.totalPassed} / ${evaluation.totalTests} pruebas superadas. Revisa las condiciones que no cumplieron la validación.`
            : `${evaluation.totalPassed} / ${evaluation.totalTests} tests passed. Check conditions that failed validation.`
        );
      }
    } else {
      // Fallback
      if (code.trim().length > 40 && !code.includes('pass\n')) {
        setTestStatus('passed');
        setTestSummary(t(dict.testsSuccess));
        onSuccess();
      } else {
        setTestStatus('failed');
        setTestSummary(
          language === 'es'
            ? 'Prueba incompleta. La función aún contiene "pass" o falta implementar la lógica.'
            : 'Incomplete test. Function still contains "pass" or missing implementation.'
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
    setTestResults(evalResult.results);

    if (evalResult.runtimeError) {
      setTestStatus('failed');
      setTestSummary(
        language === 'es'
          ? 'Error detectado durante la ejecución en Python. Revisa la traza abajo.'
          : 'Error detected during Python execution. Check the traceback below.'
      );
      return;
    }

    if (evalResult.passed) {
      setTestStatus('passed');
      setTestSummary(
        language === 'es'
          ? `✓ ¡Excelente! ${evalResult.totalPassed} / ${evalResult.totalTests} pruebas en Python real superadas en ${Math.round(evalResult.executionTimeMs)} ms.`
          : `✓ Excellent! ${evalResult.totalPassed} / ${evalResult.totalTests} real Python tests passed in ${Math.round(evalResult.executionTimeMs)} ms.`
      );
      onSuccess();
    } else {
      setTestStatus('failed');
      setTestSummary(
        language === 'es'
          ? `${evalResult.totalPassed} / ${evalResult.totalTests} pruebas superadas. Revisa los casos fallidos.`
          : `${evalResult.totalPassed} / ${evalResult.totalTests} tests passed. Check failed test cases.`
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
          {' '}<strong>{t(exercise.title)}</strong>.
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
            <textarea
              className="code-editor-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={14}
              aria-label={t(dict.codeEditorAriaLabel)}
              spellCheck={false}
            />
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

              {runtimeError && (
                <div className="python-output-card">
                  <div className="python-output-header">
                    {language === 'es' ? '⚠️ Excepción / Error en Tiempo de Ejecución' : '⚠️ Runtime Exception / Error'}
                  </div>
                  <pre className="python-error-box">{runtimeError}</pre>
                </div>
              )}

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
                      <span className="test-case-badge">{tr.passed ? '✓ PASS' : '✗ FAIL'}</span>
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
                  onClick={onSuccess}
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
