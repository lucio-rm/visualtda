import React, { useState } from 'react';
import { ExerciseMetadata, formatTechniqueLabel } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useInstructorMode } from '../context/InstructorModeContext';
import { isExerciseSolutionAuthorized } from '../utils/cryptoAuth';
import { TheoryMarkdown } from './common/TheoryMarkdown';
import { getRelatedExercisesFor } from '../engine/crossExerciseConnections';

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
  const [codeMode, setCodeMode] = useState<'python' | 'pseudocode'>('python');

  const authStatus = isExerciseSolutionAuthorized(exercise.id, isInstructorMode, solutionUnlocked);
  const canViewCanonicalPython = authStatus.authorized;
  const isTampered = authStatus.isTampered;
  const relatedExercises = getRelatedExercisesFor(exercise.id);

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
              <span className="keyboard-hints" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
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

        {/* Code & Pseudocode toggle card */}
        <div className="understand-code-container">
          <div className="card-panel">
            <div className="code-view-header">
              <h4>{t(dict.understandCanonicalHeading)}</h4>
              <div className="code-toggle-group" role="group" aria-label={t(dict.codeToggleLabel)}>
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'python' ? 'active' : ''}`}
                  onClick={() => setCodeMode('python')}
                  aria-pressed={codeMode === 'python'}
                >
                  {t(dict.understandPython3)}
                </button>
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'pseudocode' ? 'active' : ''}`}
                  onClick={() => setCodeMode('pseudocode')}
                  aria-pressed={codeMode === 'pseudocode'}
                >
                  {t(dict.understandPseudocode)}
                </button>
              </div>
            </div>

            {codeMode === 'python' && !canViewCanonicalPython ? (
              isTampered ? (
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
                      fontSize: '0.75rem',
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
                <div className="solution-locked-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'inline-flex', padding: '0.35rem 0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {language === 'es' ? 'Acceso Restringido' : 'Restricted Access'}
                  </div>
                  <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>
                    {language === 'es' ? 'Solución en Python Bloqueada' : 'Python Solution Locked'}
                  </h4>
                  <p style={{ maxWidth: '520px', margin: '0 auto 1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {language === 'es'
                      ? 'Para acceder a la solución oficial en Python, primero debés superar las pruebas automatizadas en la fase Resolver (o activar el Modo Docente en la barra superior).'
                      : 'To access the official Python solution, you must first pass the automated test cases in the Solve phase (or activate Instructor Mode in the top bar).'}
                  </p>
                  {onGoToSolve && (
                    <button type="button" className="btn-primary" onClick={onGoToSolve}>
                      {language === 'es' ? 'Ir a Resolver el Ejercicio →' : 'Go to Solve Exercise →'}
                    </button>
                  )}
                </div>
              )
            ) : (
              <pre className="canonical-code-display">
                <code>{codeMode === 'python' ? canonicalPython : pseudocode}</code>
              </pre>
            )}
          </div>
        </div>

        {/* Executive Complexity & Theoretical Bounds Dashboard */}
        <div className="card-panel complexity-dashboard-panel">
          <div className="complexity-dashboard-header">
            <h4>{language === 'es' ? 'Análisis Asintótico y Garantías Formales' : 'Asymptotic Analysis & Formal Guarantees'}</h4>
            <span className="complexity-subtitle">
              {language === 'es'
                ? 'Cotas de complejidad temporal, espacial y garantías del paradigma según Kleinberg & Tardos'
                : 'Time and space complexity bounds with paradigm guarantees per Kleinberg & Tardos'}
            </span>
          </div>
          <div className="complexity-dashboard-grid">
            <div className="complexity-metric-card complexity-item">
              <div className="metric-header">
                <span className="metric-icon" aria-hidden="true">⏱</span>
                <span className="metric-label">{t(dict.understandTimeComplexity)}</span>
              </div>
              <div className="metric-value-box">
                <code className="metric-value complexity-value">{timeComplexity}</code>
              </div>
              <span className="metric-description">
                {language === 'es' ? 'Peor caso asintótico demostrable' : 'Provable worst-case bound'}
              </span>
            </div>

            <div className="complexity-metric-card complexity-item">
              <div className="metric-header">
                <span className="metric-icon" aria-hidden="true">💾</span>
                <span className="metric-label">{t(dict.understandSpaceComplexity)}</span>
              </div>
              <div className="metric-value-box">
                <code className="metric-value complexity-value">{spaceComplexity}</code>
              </div>
              <span className="metric-description">
                {language === 'es' ? 'Memoria auxiliar adicional' : 'Auxiliary memory overhead'}
              </span>
            </div>

            <div className="complexity-metric-card">
              <div className="metric-header">
                <span className="metric-icon" aria-hidden="true">⚙️</span>
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
                <span className="metric-icon" aria-hidden="true">🎯</span>
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

        {/* Full-width Academic Theory Paper Panel */}
        <div className="card-panel theory-card full-width-theory-panel">
          <div className="theory-header">
            <div className="theory-title-group">
              <span className="badge badge-technique" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                {language === 'es' ? 'Fundamento Teórico' : 'Theoretical Foundation'}
              </span>
              <h4 style={{ margin: 0 }}>{t(dict.understandCorrectnessHeading)}</h4>
            </div>
            <span className="theory-academic-seal">
              {language === 'es' ? 'Cátedra 75.29 / 95.06 · Teoría de Algoritmos FIUBA' : '75.29 / 95.06 · Theory of Algorithms FIUBA'}
            </span>
          </div>
          <div className="theory-body">
            <TheoryMarkdown content={correctnessExplanation} />
          </div>
        </div>

        {/* Cross-Exercise Connections & Technique Comparisons (Mission V4 Section 30 & 31) */}
        {relatedExercises.length > 0 && (
          <div className="card-panel related-exercises-section" style={{ marginTop: '2rem' }}>
            <div className="related-section-header" style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text)' }}>
                <span className="badge badge-technique" style={{ fontSize: '0.75rem' }}>
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
                      <span className="badge badge-technique" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
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
