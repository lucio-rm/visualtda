import React, { useState, useEffect } from 'react';
import { ExerciseMetadata, formatTechniqueLabel } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useInstructorMode } from '../context/InstructorModeContext';
import { isExerciseSolutionAuthorized, verifyInstructorAccess } from '../utils/cryptoAuth';
import { getOrDecryptSolution, getDecryptedSolutionSync } from '../utils/solutionCrypto';
import { getApprovedStudentSolution, getStudentAttempts } from '../utils/studentAttempts';
import { StudentAttemptsViewer } from './StudentAttemptsViewer';
import { TheoryMarkdown } from './common/TheoryMarkdown';
import { getRelatedExercisesFor } from '../engine/crossExerciseConnections';
import { getExerciseInsight } from '../engine/exerciseContextInsights';
import { highlightPythonCode, highlightPseudocode } from '../utils/pythonSyntaxHighlighter';

interface UnderstandViewProps {
  exercise: ExerciseMetadata;
  canonicalPython: string;
  pseudocode: string;
  correctnessExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  visualizerSlot?: React.ReactNode;
  solutionUnlocked?: boolean;
  onGoToSolve?: () => void;
  onNavigateToExercise?: (exerciseId: string) => void;
}

function localizeComplexityText(text: string, lang: 'es' | 'en'): string {
  if (lang === 'es' || !text) return text;
  return text
    .replace(/en mejor, promedio y peor caso/g, 'in best, average, and worst case')
    .replace(/ordenamiento por densidad valor\/peso/g, 'sorting by value/weight density')
    .replace(/lista de ítems/g, 'item list')
    .replace(/para el arreglo auxiliar de fusión/g, 'for auxiliary merge buffer')
    .replace(/para el arreglo auxiliar de merge/g, 'for auxiliary merge buffer')
    .replace(/buffers de fusión/g, 'merge buffers')
    .replace(/buffers de merge/g, 'merge buffers')
    .replace(/arreglos auxiliares para la banda de fusión/g, 'auxiliary arrays for merge strip')
    .replace(/arreglos auxiliares para la banda de merge/g, 'auxiliary arrays for merge strip')
    .replace(/arreglos auxiliares para la franja de merge/g, 'auxiliary arrays for merge strip')
    .replace(/D&C estándar \/ O\(N\) vía Kadane/g, 'standard D&C / O(N) via Kadane')
    .replace(/para la pila de recursión/g, 'recursion call stack')
    .replace(/para la red residual/g, 'for the residual network')
    .replace(/Simplex en peor caso \/ O\(poly\(n\)\) métodos de punto interior/g, 'worst-case Simplex / O(poly(n)) interior point methods')
    .replace(/matriz del tablero Simplex/g, 'Simplex tableau matrix')
    .replace(/reducción a Vertex Cover/g, 'reduction to Vertex Cover')
    .replace(/grafo transformado/g, 'transformed graph')
    .replace(/2-aproximación por matching maximal/g, '2-approximation via maximal matching')
    .replace(/árbol de combinaciones/g, 'combination tree')
    .replace(/algoritmo de von Neumann/g, 'von Neumann algorithm')
    .replace(/sin memoria adicional/g, 'no auxiliary memory')
    .replace(/greedy por extremo derecho/g, 'greedy by right endpoint')
    .replace(/puntos ordenados/g, 'sorted points')
    .replace(/tabla DP/g, 'DP table')
    .replace(/búsqueda binaria/g, 'binary search')
    .replace(/matriz DP/g, 'DP matrix')
    .replace(/pila de recursión/g, 'recursion stack')
    .replace(/árbol y tabla de códigos/g, 'tree and code table')
    .replace(/construcción de árbol y tabla de codificación/g, 'tree construction and code table')
    .replace(/árbol de estados de backtracking/g, 'backtracking state tree')
    .replace(/tablero/g, 'board')
    .replace(/tablero y conjuntos de restricciones/g, 'board and constraint sets')
    .replace(/heurística de Warnsdorff/g, 'Warnsdorff heuristic')
    .replace(/cola de prioridad \(min-heap\)/g, 'min-heap priority queue')
    .replace(/árbol de búsqueda con podas/g, 'search tree with branch & bound pruning')
    .replace(/cola de prioridad de nodos/g, 'priority queue of branch & bound nodes')
    .replace(/ordenamiento por tiempo de finalización/g, 'sorting by completion deadline')
    .replace(/ordenamiento de tareas/g, 'task sorting')
    .replace(/multiplicaciones recursivas/g, 'recursive multiplications')
    .replace(/pila de llamadas recursivas/g, 'recursive call stack')
    .replace(/algoritmo D&C de Boyer-Moore/g, 'Boyer-Moore D&C algorithm')
    .replace(/selección lineal/g, 'linear selection')
    .replace(/cálculo de errores cuadráticos/g, 'least-squares error computation')
    .replace(/árbol de permutaciones con podas/g, 'permutation tree with pruning')
    .replace(/en el peor caso/g, 'in the worst case')
    .replace(/peor caso/g, 'worst case')
    .replace(/caso promedio/g, 'average case')
    .replace(/mejor caso/g, 'best case');
}

export const UnderstandView: React.FC<UnderstandViewProps> = ({
  exercise,
  canonicalPython,
  pseudocode,
  correctnessExplanation,
  timeComplexity,
  spaceComplexity,
  visualizerSlot,
  solutionUnlocked = false,
  onGoToSolve,
  onNavigateToExercise
}) => {
  const { t, dict, language } = useLanguage();
  const { isInstructorMode } = useInstructorMode();
  const isFacultyAuthenticated = isInstructorMode && verifyInstructorAccess();

  const studentAttempts = getStudentAttempts(exercise.id);
  const approvedSolution = getApprovedStudentSolution(exercise.id);

  const [codeMode, setCodeMode] = useState<'python' | 'pseudocode' | 'student' | 'attempts'>(() => {
    if (isFacultyAuthenticated) return 'python';
    if (approvedSolution) return 'student';
    if (studentAttempts.length > 0) return 'attempts';
    return 'student';
  });

  const authStatus = isExerciseSolutionAuthorized(exercise.id, isInstructorMode, solutionUnlocked);
  const canViewCanonicalPython = authStatus.authorized;
  const isTampered = authStatus.isTampered;
  const relatedExercises = getRelatedExercisesFor(exercise.id);
  const insight = getExerciseInsight(exercise.id, exercise.categoryId);

  const [decryptedPython, setDecryptedPython] = useState<string | null>(() => getDecryptedSolutionSync(exercise.id));
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [copiedCodeMode, setCopiedCodeMode] = useState<string | null>(null);

  const handleCopyCodeText = (text: string, mode: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedCodeMode(mode);
      setTimeout(() => setCopiedCodeMode(null), 2000);
    } catch {
      // ignore clipboard error
    }
  };

  useEffect(() => {
    if (isFacultyAuthenticated && (codeMode === 'student' || codeMode === 'attempts') && !approvedSolution) {
      setCodeMode('python');
    } else if (!isFacultyAuthenticated && (codeMode === 'python' || codeMode === 'pseudocode')) {
      setCodeMode(approvedSolution ? 'student' : studentAttempts.length > 0 ? 'attempts' : 'student');
    }
  }, [isFacultyAuthenticated, approvedSolution, studentAttempts.length, codeMode]);

  useEffect(() => {
    let isMounted = true;
    if (canViewCanonicalPython) {
      const cached = getDecryptedSolutionSync(exercise.id);
      if (cached) {
        setDecryptedPython(cached);
      } else {
        setIsDecrypting(true);
        getOrDecryptSolution(exercise.id)
          .then((code) => {
            if (isMounted) {
              setDecryptedPython(code);
              setIsDecrypting(false);
            }
          })
          .catch(() => {
            if (isMounted) setIsDecrypting(false);
          });
      }
    }
    return () => {
      isMounted = false;
    };
  }, [exercise.id, canViewCanonicalPython]);

  const effectivePython =
    decryptedPython ||
    (canonicalPython && canonicalPython.trim().length > 0 ? canonicalPython : '');

  return (
    <section className="phase-view understand-view" aria-labelledby="understand-heading">
      <div className="view-intro">
        <h3 id="understand-heading" className="view-title">
          {t(dict.understandTitle)}
        </h3>
        <p className="view-lead">
          {t(dict.understandLead)}
        </p>
      </div>

      <div className="understand-grid">
        {/* Visualizer and Timeline area */}
        <div className="understand-visualizer-container">
          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0 }}>{t(dict.understandVisualizerHeading)}</h4>
              <span className="keyboard-hints" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {language === 'es' ? 'Atajos: [← / →] pasos · [Espacio] reproducir · [R] reiniciar' : 'Shortcuts: [← / →] step · [Space] play · [R] reset'}
              </span>
            </div>
            {visualizerSlot || (
              <div className="visualizer-slot-placeholder">
                <p>{t(dict.understandVisualizerPlaceholder)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Code, Pseudocode, and Student Attempts Card */}
        <div className="understand-code-container">
          <div className="card-panel">
            <div className="code-view-header">
              <h4>{t(dict.understandCanonicalHeading)}</h4>
              <div className="code-toggle-group" role="group" aria-label={t(dict.codeToggleLabel)}>
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'student' ? 'active' : ''}`}
                  onClick={() => setCodeMode('student')}
                  aria-pressed={codeMode === 'student'}
                >
                  {language === 'es' ? 'Tu Solución' : 'Your Solution'}
                </button>
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'attempts' ? 'active' : ''}`}
                  onClick={() => setCodeMode('attempts')}
                  aria-pressed={codeMode === 'attempts'}
                >
                  {language === 'es' ? `Intentos (${studentAttempts.length})` : `Attempts (${studentAttempts.length})`}
                </button>
                {isFacultyAuthenticated && (
                  <>
                    <button
                      type="button"
                      className={`btn-code-toggle ${codeMode === 'python' ? 'active' : ''}`}
                      onClick={() => setCodeMode('python')}
                      aria-pressed={codeMode === 'python'}
                    >
                      {language === 'es' ? 'Python (Docente)' : 'Python (Faculty)'}
                    </button>
                    <button
                      type="button"
                      className={`btn-code-toggle ${codeMode === 'pseudocode' ? 'active' : ''}`}
                      onClick={() => setCodeMode('pseudocode')}
                      aria-pressed={codeMode === 'pseudocode'}
                    >
                      {language === 'es' ? 'Pseudocódigo (Docente)' : 'Pseudocode (Faculty)'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {isTampered ? (
              <div
                className="solution-tamper-card"
                role="alert"
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    padding: '0.35rem 0.75rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#ef4444',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {language === 'es' ? 'Firma Criptográfica Inválida' : 'Invalid Cryptographic Signature'}
                </div>
                <h4 style={{ marginBottom: '0.5rem', color: '#ef4444' }}>
                  {language === 'es' ? 'Acceso Bloqueado contra Manipulación' : 'Access Blocked against Tampering'}
                </h4>
                <p style={{ maxWidth: '540px', margin: '0 auto 1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {language === 'es'
                    ? 'Se detectó una alteración de variables en la consola/inspección de DevTools sin validación de credenciales. La solución oficial de la cátedra requiere ingresar la clave de 8 caracteres en "Modo Docente" o aprobar las pruebas unitarias en la fase Resolver.'
                    : 'State variable modification detected in DevTools without valid credential signature. The official faculty solution requires entering the 8-character password in "Instructor Mode" or passing all unit tests in Solve.'}
                </p>
              </div>
            ) : (
              <>
                {/* View 1: Student Approved Solution */}
                {codeMode === 'student' && (
                  approvedSolution ? (
                    <div className="student-approved-code-box">
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.85rem',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        borderRadius: 'var(--radius-sm, 4px)',
                        marginBottom: '0.75rem',
                        fontSize: '0.82rem'
                      }}>
                        <span style={{ color: '#22c55e', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: '6px' }}>
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                          {language === 'es' ? 'Código Aprobado por la Batería de Pruebas' : 'Code Approved by Test Suite'}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                          {approvedSolution.passedTestsCount} {language === 'es' ? 'tests superados' : 'tests passed'} · {new Date(approvedSolution.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="code-editor-card canonical-ide-card" style={{ width: '100%', margin: '0 0 1rem 0' }}>
                        <div className="code-editor-header">
                          <div className="editor-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span className="editor-lang-badge">Python</span>
                            <span className="editor-filename">{language === 'es' ? 'mi_solucion_aprobada.py' : 'my_approved_solution.py'}</span>
                          </div>
                          <button
                            type="button"
                            className="btn-copy-code"
                            onClick={() => handleCopyCodeText(approvedSolution.code, 'student')}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-muted)',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              padding: '0.25rem 0.5rem'
                            }}
                          >
                            {copiedCodeMode === 'student'
                              ? (language === 'es' ? 'Copiado' : 'Copied')
                              : (language === 'es' ? 'Copiar Código' : 'Copy Code')}
                          </button>
                        </div>
                        <div className="editor-input-wrapper">
                          <div className="editor-gutter" aria-hidden="true">
                            {Array.from({ length: approvedSolution.code.split('\n').length }, (_, i) => (
                              <span key={i + 1} className="editor-line-number">
                                {i + 1}
                              </span>
                            ))}
                          </div>
                          <div className="code-editor-stage" style={{ overflowX: 'auto', padding: '0.75rem 1rem' }}>
                            <pre className="canonical-code-display code-highlight-container" style={{ margin: 0, padding: 0, background: 'transparent' }}>
                              <code dangerouslySetInnerHTML={{ __html: highlightPythonCode(approvedSolution.code) }} />
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="solution-locked-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {language === 'es' ? 'Sin Código Aprobado' : 'No Approved Code Yet'}
                      </div>
                      <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>
                        {language === 'es' ? 'Aún no aprobaste una solución' : 'No solution approved yet'}
                      </h4>
                      <p style={{ maxWidth: '520px', margin: '0 auto 1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {language === 'es'
                          ? 'Cuando resuelvas el ejercicio y superes los casos de prueba en la fase Resolver, tu código aprobado quedará registrado de forma permanente aquí para que puedas estudiarlo.'
                          : 'Once you solve the exercise and pass all test cases in the Solve phase, your approved code will be permanently recorded here for review.'}
                      </p>
                      {onGoToSolve && (
                        <button type="button" className="btn-primary" onClick={onGoToSolve}>
                          {language === 'es' ? 'Ir a Resolver el Ejercicio →' : 'Go to Solve Exercise →'}
                        </button>
                      )}
                    </div>
                  )
                )}

                {/* View 2: Student Attempts History */}
                {codeMode === 'attempts' && (
                  <StudentAttemptsViewer
                    attempts={studentAttempts}
                    language={language}
                    approvedSolution={approvedSolution}
                  />
                )}

                {/* View 3 & 4: Python / Pseudocode (Docentes Only) */}
                {(codeMode === 'python' || codeMode === 'pseudocode') && (
                  !canViewCanonicalPython ? (
                    <div className="solution-locked-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {language === 'es' ? 'Acceso Exclusivo Docente' : 'Faculty Access Only'}
                      </div>
                      <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>
                        {codeMode === 'python'
                          ? (language === 'es' ? 'Solución en Python Bloqueada' : 'Python Solution Locked')
                          : (language === 'es' ? 'Pseudocódigo Formal Bloqueado' : 'Formal Pseudocode Locked')}
                      </h4>
                      <p style={{ maxWidth: '520px', margin: '0 auto 1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {language === 'es'
                          ? 'Por el momento, el código canónico en Python y el pseudocódigo formal están reservados exclusivamente para los profesores de la cátedra. Podés consultar tu código aprobado y tu historial de ejecuciones en las pestañas "Tu Solución" e "Intentos".'
                          : 'At this time, canonical Python code and formal pseudocode are restricted to faculty members. You can review your approved code and execution history in the "Your Solution" and "Attempts" tabs.'}
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {approvedSolution && (
                          <button type="button" className="btn-primary" onClick={() => setCodeMode('student')}>
                            {language === 'es' ? 'Ver mi Código Aprobado →' : 'View Approved Code →'}
                          </button>
                        )}
                        {studentAttempts.length > 0 && !approvedSolution && (
                          <button type="button" className="btn-primary" onClick={() => setCodeMode('attempts')}>
                            {language === 'es' ? 'Ver mis Intentos →' : 'View My Attempts →'}
                          </button>
                        )}
                        {onGoToSolve && (
                          <button type="button" className="btn-secondary" onClick={onGoToSolve}>
                            {language === 'es' ? 'Ir a Resolver el Ejercicio' : 'Go to Solve Exercise'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    (() => {
                      const activeCodeText =
                        codeMode === 'python'
                          ? isDecrypting
                            ? language === 'es'
                              ? '# Desencriptando solución oficial...'
                              : '# Decrypting canonical solution...'
                            : effectivePython || '# Solución protegida'
                          : pseudocode;
                      const activeCodeHighlighted =
                        codeMode === 'python'
                          ? highlightPythonCode(activeCodeText)
                          : highlightPseudocode(activeCodeText);
                      const activeCodeLines = activeCodeText.split('\n').length;
                      const activeFilename =
                        codeMode === 'python'
                          ? language === 'es'
                            ? 'solucion_oficial.py'
                            : 'canonical_solution.py'
                          : language === 'es'
                            ? 'pseudocodigo_formal.algo'
                            : 'formal_pseudocode.algo';
                      const activeLangBadge =
                        codeMode === 'python'
                          ? 'Python'
                          : language === 'es'
                            ? 'Pseudocódigo'
                            : 'Pseudocode';

                      return (
                        <div className="code-editor-card canonical-ide-card" style={{ width: '100%', margin: '0 0 1rem 0' }}>
                          <div className="code-editor-header">
                            <div className="editor-header-left" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span className="editor-lang-badge">{activeLangBadge}</span>
                              <span className="editor-filename">{activeFilename}</span>
                            </div>
                            <button
                              type="button"
                              className="btn-copy-code"
                              onClick={() => handleCopyCodeText(activeCodeText, codeMode)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                padding: '0.25rem 0.5rem'
                              }}
                            >
                              {copiedCodeMode === codeMode
                                ? (language === 'es' ? 'Copiado' : 'Copied')
                                : (language === 'es' ? 'Copiar Código' : 'Copy Code')}
                            </button>
                          </div>
                          <div className="editor-input-wrapper">
                            <div className="editor-gutter" aria-hidden="true">
                              {Array.from({ length: activeCodeLines }, (_, i) => (
                                <span key={i + 1} className="editor-line-number">
                                  {i + 1}
                                </span>
                              ))}
                            </div>
                            <div className="code-editor-stage" style={{ overflowX: 'auto', padding: '0.75rem 1rem' }}>
                              <pre className="canonical-code-display code-highlight-container" style={{ margin: 0, padding: 0, background: 'transparent' }}>
                                <code dangerouslySetInnerHTML={{ __html: activeCodeHighlighted }} />
                              </pre>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )
                )}
              </>
            )}
          </div>
        </div>

        {/* Executive Complexity & Theoretical Bounds Dashboard (Full Width Bar) */}
        <div className="card-panel complexity-dashboard-panel" style={{ width: '100%' }}>
          <div className="complexity-dashboard-header">
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', color: 'var(--text)' }}>
              {language === 'es' ? 'Análisis Asintótico y Garantías' : 'Asymptotic Analysis & Guarantees'}
            </h4>
            <span className="complexity-subtitle" style={{ fontSize: '0.8125rem' }}>
              {language === 'es'
                ? 'Cotas asintóticas formales de complejidad temporal y espacial demostrables'
                : 'Formal provable asymptotic bounds for time and space complexity'}
            </span>
          </div>
          <div className="complexity-dashboard-grid">
            <div className="complexity-metric-card complexity-item">
              <div className="metric-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--accent)' }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="metric-label">{t(dict.understandTimeComplexity)}</span>
              </div>
              <div className="metric-value-box">
                <code className="metric-value complexity-value">{localizeComplexityText(timeComplexity, language)}</code>
              </div>
              <span className="metric-description">
                {language === 'es' ? 'Peor caso asintótico demostrable' : 'Provable worst-case bound'}
              </span>
            </div>

            <div className="complexity-metric-card complexity-item">
              <div className="metric-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--accent)' }}>
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
                <span className="metric-label">{t(dict.understandSpaceComplexity)}</span>
              </div>
              <div className="metric-value-box">
                <code className="metric-value complexity-value">{localizeComplexityText(spaceComplexity, language)}</code>
              </div>
              <span className="metric-description">
                {language === 'es' ? 'Memoria auxiliar adicional' : 'Auxiliary memory overhead'}
              </span>
            </div>

            <div className="complexity-metric-card">
              <div className="metric-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--accent)' }}>
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <span className="metric-label">{language === 'es' ? 'Técnica / Paradigma' : 'Technique / Paradigm'}</span>
              </div>
              <div className="metric-value-box">
                <span className="metric-paradigm-badge">{formatTechniqueLabel(exercise.techniqueId, language).toUpperCase()}</span>
              </div>
              <span className="metric-description">
                {language === 'es' ? 'Estrategia algorítmica canónica' : 'Canonical algorithmic strategy'}
              </span>
            </div>

            <div className="complexity-metric-card">
              <div className="metric-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--success)' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <span className="metric-label">{language === 'es' ? 'Garantía Teórica' : 'Theoretical Guarantee'}</span>
              </div>
              <div className="metric-value-box">
                <span className="metric-guarantee-badge">
                  {exercise.techniqueId === 'approximation'
                    ? (language === 'es' ? '2-Aproximación Demostrable' : 'Provable 2-Approximation')
                    : exercise.techniqueId === 'randomized'
                      ? (language === 'es' ? 'Esperanza O(1) / Las Vegas' : 'Expected O(1) / Las Vegas')
                      : (language === 'es' ? 'Óptimo Global Exacto' : 'Exact Global Optimum')}
                </span>
              </div>
              <span className="metric-description">
                {language === 'es' ? 'Certificado de correctitud matemática' : 'Mathematical certificate of correctness'}
              </span>
            </div>
          </div>
        </div>

        {/* Context & Intuition Traps Card (Full Width Banner) */}
        <div className="card-panel understand-insights-card" style={{ width: '100%' }}>
          <h5 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
            {language === 'es' ? 'Perspectiva y Trampas Frecuentes' : 'Perspective & Frequent Traps'}
          </h5>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            {t(insight.historicalContext)}
          </div>
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text)', background: 'var(--surface-hover)', borderLeft: '3px solid var(--accent)', padding: '0.65rem 0.85rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginBottom: '0.75rem' }}>
            <strong>{language === 'es' ? 'Principio central: ' : 'Core principle: '}</strong>
            {t(insight.algorithmicPerspective)}
          </div>
          <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--error)', background: 'var(--error-bg)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <strong>{language === 'es' ? 'Trampa de la intuición ingenua: ' : 'Naive heuristic trap: '}</strong>
            {t(insight.naiveTrapWarning)}
          </div>
        </div>

        {/* Full-Width Academic Theory Paper Panel */}
        <div className="card-panel theory-card understand-theory-panel" style={{ width: '100%' }}>
          <div className="theory-header">
            <div className="theory-title-group">
              <span className="badge badge-technique" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {language === 'es' ? 'Fundamento Teórico' : 'Theoretical Foundation'}
              </span>
              <h4 style={{ margin: 0 }}>{t(dict.understandCorrectnessHeading)}</h4>
            </div>
            <span className="theory-academic-seal">
              {language === 'es' ? 'Cátedra 75.29 / 95.06 · Teoría de Algoritmos FIUBA' : '75.29 / 95.06 · Theory of Algorithms FIUBA'}
            </span>
          </div>
          <div className="theory-body">
            <TheoryMarkdown content={correctnessExplanation} language={language} exerciseId={exercise.id} />
          </div>
        </div>

        {/* Cross-Exercise Connections & Technique Comparisons */}
        {relatedExercises.length > 0 && (
          <div className="card-panel related-exercises-section" style={{ marginTop: '2rem' }}>
            <div className="related-section-header" style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                <span className="badge badge-technique" style={{ fontSize: '0.8125rem' }}>
                  {language === 'es' ? 'Conexiones' : 'Connections'}
                </span>
                <span>{language === 'es' ? 'Problemas Relacionados y Comparación de Paradigmas' : 'Related Problems & Paradigm Comparison'}</span>
              </h4>
              <p style={{ margin: '0.35rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {language === 'es'
                  ? 'Examiná cómo variaciones en las restricciones del problema conducen a diferentes técnicas y cotas de complejidad.'
                  : 'Examine how changes in problem constraints lead to different techniques and complexity bounds.'}
              </p>
            </div>

            <div className="related-exercises-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {relatedExercises.map((rel) => (
                <div
                  key={rel.targetExerciseId}
                  className="related-exercise-card"
                  style={{
                    padding: '1.25rem',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span className="badge badge-technique" style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                        {t(rel.paradigmBadge)}
                      </span>
                    </div>
                    <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '1.05rem', color: 'var(--text)' }}>
                      {t(rel.comparisonTitle)}
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                      {t(rel.comparisonInsight)}
                    </p>
                  </div>

                  {onNavigateToExercise && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: '1.25rem', alignSelf: 'flex-start' }}
                      onClick={() => onNavigateToExercise(rel.targetExerciseId)}
                    >
                      {language === 'es' ? 'Explorar Ejercicio →' : 'Explore Exercise →'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
